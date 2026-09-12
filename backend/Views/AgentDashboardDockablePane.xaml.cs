// Views/AgentDashboardDockablePane.xaml.cs
using System;
using System.Diagnostics;
using System.Windows;
using System.Windows.Controls;
using Autodesk.Revit.UI;
using ArchFinAI.Backend.Models;
using ArchFinAI.Backend.Services;

namespace ArchFinAI.Backend.Views
{
    public partial class AgentDashboardDockablePane : UserControl, IDockablePaneProvider
    {
        private UrbanAllocationPayload? _lastPayload;

        public AgentDashboardDockablePane()
        {
            InitializeComponent();
        }

        public void SetupDockablePane(DockablePaneProviderData data)
        {
            data.FrameworkElement = this;
            data.InitialState = new DockablePaneState
            {
                DockPosition = DockPosition.Right,
                MinimumWidth = 320,
                MinimumHeight = 450
            };
        }

        public void UpdateAllocation(UrbanAllocationPayload payload)
        {
            _lastPayload = payload;

            double res = payload.GetResidentialPercent();
            double comm = payload.GetCommercialPercent();
            double ind = payload.GetIndustrialPercent();

            PbResidential.Value = res;
            PbCommercial.Value = comm;
            PbIndustrial.Value = ind;

            TxtResVal.Text = $"{res:F1}%";
            TxtCommVal.Text = $"{comm:F1}%";
            TxtIndVal.Text = $"{ind:F1}%";

            string timestamp = DateTime.Now.ToString("HH:mm:ss");
            string logEntry = $"\n[{timestamp}] SYNC INCOMING: Res={res:F1}%, Comm={comm:F1}%, Ind={ind:F1}%\n  Alert: {payload.AlertText}";
            TxtConsoleLog.AppendText(logEntry);
            TxtConsoleLog.ScrollToEnd();
        }

        private void BtnOpenDashboard_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = "http://localhost:3000",
                    UseShellExecute = true
                });
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Could not open browser: {ex.Message}", "ArchFin AI", MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }

        private void BtnApplyToCanvas_Click(object sender, RoutedEventArgs e)
        {
            if (_lastPayload != null)
            {
                RevitModelUpdater.QueueAllocationUpdate(_lastPayload);
                TxtConsoleLog.AppendText($"\n[{DateTime.Now:HH:mm:ss}] Dispatched manual update transaction to active Revit document.");
            }
            else
            {
                TxtConsoleLog.AppendText($"\n[{DateTime.Now:HH:mm:ss}] No remote MPT allocation cached yet.");
            }
        }
    }
}
