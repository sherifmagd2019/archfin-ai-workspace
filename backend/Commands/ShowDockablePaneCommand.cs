// Commands/ShowDockablePaneCommand.cs
using System;
using Autodesk.Revit.Attributes;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;
using Nice3point.Revit.Toolkit.External;

namespace ArchFinAI.Backend.Commands
{
    [Transaction(TransactionMode.Manual)]
    public class ShowDockablePaneCommand : RevitCommand
    {
        public override void Execute()
        {
            try
            {
                var dockablePane = UiApplication.GetDockablePane(App.PaneId);
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
            }
            catch (Exception ex)
            {
                TaskDialog.Show("ArchFin AI", $"Error toggling Agent Inspector Pane: {ex.Message}");
            }
        }
    }
}
