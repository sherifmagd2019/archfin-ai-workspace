// Commands/ShowDockablePaneCommand.cs
using System;
using Autodesk.Revit.Attributes;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;

namespace ArchFinAI.Backend.Commands
{
    [Transaction(TransactionMode.Manual)]
    public class ShowDockablePaneCommand : IExternalCommand
    {
        public Result Execute(ExternalCommandData commandData, ref string message, ElementSet elements)
        {
            try
            {
                var dockablePane = commandData.Application.GetDockablePane(App.PaneId);
                if (dockablePane != null)
                {
                    if (dockablePane.IsShown())
                    {
                        dockablePane.Hide();
                    }
                    else
                    {
                        dockablePane.Show();
                    }
                }
                else
                {
                    TaskDialog.Show("ArchFin AI", "Agent Dockable Pane is not registered or unavailable in this Revit view context.");
                }
                return Result.Succeeded;
            }
            catch (Exception ex)
            {
                message = ex.Message;
                TaskDialog.Show("ArchFin AI", $"Error toggling Agent Inspector Pane: {ex.Message}");
                return Result.Failed;
            }
        }
    }
}
