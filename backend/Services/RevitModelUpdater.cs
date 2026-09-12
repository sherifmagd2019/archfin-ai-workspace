// Services/RevitModelUpdater.cs
using System;
using System.Collections.Concurrent;
using System.Linq;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;
using ArchFinAI.Backend.Models;

namespace ArchFinAI.Backend.Services
{
    /// <summary>
    /// Safely marshals background HTTP payload data onto Revit's main API thread
    /// using Autodesk.Revit.UI.ExternalEvent, preventing AccessViolationException
    /// and thread-safety violations during model modification.
    /// </summary>
    public class RevitModelUpdater : IExternalEventHandler
    {
        private static RevitModelUpdater? _handler;
        private static ExternalEvent? _externalEvent;
        private static readonly ConcurrentQueue<UrbanAllocationPayload> _pendingUpdates = new();

        public static void Initialize()
        {
            _handler = new RevitModelUpdater();
            _externalEvent = ExternalEvent.Create(_handler);
        }

        public static void QueueAllocationUpdate(UrbanAllocationPayload payload)
        {
            _pendingUpdates.Enqueue(payload);
            _externalEvent?.Raise();
        }

        public void Execute(UIApplication app)
        {
            var doc = app.ActiveUIDocument?.Document;
            if (doc == null || doc.IsReadOnly)
            {
                return;
            }

            while (_pendingUpdates.TryDequeue(out var payload))
            {
                ApplyAllocationToRevitModel(doc, payload);
            }
        }

        private void ApplyAllocationToRevitModel(Document doc, UrbanAllocationPayload payload)
        {
            using var trans = new Transaction(doc, "ArchFin: Apply MPT Urban Allocation");
            try
            {
                trans.Start();

                // 1. Update Project Information / Global Parameters if available
                var projectInfo = doc.ProjectInformation;
                if (projectInfo != null)
                {
                    TrySetParameter(projectInfo, "ArchFin_Residential_Ratio", payload.Residential);
                    TrySetParameter(projectInfo, "ArchFin_Commercial_Ratio", payload.Commercial);
                    TrySetParameter(projectInfo, "ArchFin_Industrial_Ratio", payload.Industrial);
                    TrySetParameter(projectInfo, "ArchFin_Alert_Notes", payload.AlertText);
                }

                // 2. Query spatial zones, rooms, or massing floors in active document
                var massingFloors = new FilteredElementCollector(doc)
                    .OfCategory(BuiltInCategory.OST_MassFloor)
                    .WhereElementIsNotElementType()
                    .ToElements();

                if (massingFloors.Any())
                {
                    double resPct = payload.GetResidentialPercent() / 100.0;
                    double commPct = payload.GetCommercialPercent() / 100.0;
                    int totalFloors = massingFloors.Count;

                    int resCount = (int)Math.Round(totalFloors * resPct);
                    int commCount = (int)Math.Round(totalFloors * commPct);

                    for (int i = 0; i < totalFloors; i++)
                    {
                        var floor = massingFloors[i];
                        string assignedUse;
                        if (i < resCount)
                            assignedUse = "Residential";
                        else if (i < resCount + commCount)
                            assignedUse = "Commercial";
                        else
                            assignedUse = "Industrial";

                        TrySetParameter(floor, "Mass Floor Usage", assignedUse);
                    }
                }

                trans.Commit();
            }
            catch (Exception ex)
            {
                if (trans.HasStarted())
                {
                    trans.RollBack();
                }
                Console.WriteLine($"[ArchFin] Transaction failed: {ex.Message}");
            }
        }

        private static void TrySetParameter(Element element, string paramName, string value)
        {
            var param = element.LookupParameter(paramName);
            if (param != null && !param.IsReadOnly && param.StorageType == StorageType.String)
            {
                param.Set(value);
            }
        }

        public string GetName() => "ArchFin_RevitModelUpdater_Handler";
    }
}
