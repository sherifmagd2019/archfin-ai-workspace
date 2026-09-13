// Commands/LaunchDashboardCommand.cs
using System;
using System.Diagnostics;
using Autodesk.Revit.Attributes;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;

namespace ArchFinAI.Backend.Commands
{
    [Transaction(TransactionMode.Manual)]
    public class LaunchDashboardCommand : IExternalCommand
    {
        public Result Execute(ExternalCommandData commandData, ref string message, ElementSet elements)
        {
            try
            {
                const string dashboardUrl = "http://localhost:3000";
                
                var processInfo = new ProcessStartInfo
                {
                    FileName = dashboardUrl,
                    UseShellExecute = true
                };
                Process.Start(processInfo);

                TaskDialog.Show("ArchFin AI", $"Optimization Dashboard launched at:\n{dashboardUrl}\n\nRevit sync pipeline active on port 8080.");
                return Result.Succeeded;
            }
            catch (Exception ex)
            {
                message = ex.Message;
                TaskDialog.Show("ArchFin AI Error", $"Failed to open browser: {ex.Message}");
                return Result.Failed;
            }
        }
    }
}
