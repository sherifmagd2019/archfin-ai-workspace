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

        public void Log(string message)
        {
            Dispatcher.Invoke(() =>
            {
                TxtConsoleLog.AppendText($"\n[{DateTime.Now:HH:mm:ss}] {message}");
                TxtConsoleLog.ScrollToEnd();
            });
        }

        public void SetServerStatus(string endpointUrl, bool isOnline, string? errorDetail = null)
        {
            Dispatcher.Invoke(() =>
            {
                if (isOnline)
                {
                    TxtConsoleLog.Text = $"[ArchFin Agent] ✅ Server Online on {endpointUrl}\n[Revit] ExternalEvent handler initialized\n[Status] Ready for React MPT payloads...";
                }
                else
                {
                    TxtConsoleLog.Text = $"[ArchFin Agent] ❌ Listener Error on {endpointUrl}\n[Detail] {errorDetail ?? "Port in use or access denied"}\n[Fix] Try running Revit as Administrator or check for port conflicts.";
                }
            });
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
            if (_lastPayload == null)
            {
                TryLoadFromSharedFileOrClipboard();
            }

            if (_lastPayload != null)
            {
                RevitModelUpdater.QueueAllocationUpdate(_lastPayload);
                TxtConsoleLog.AppendText($"\n[{DateTime.Now:HH:mm:ss}] Dispatched manual update transaction to active Revit document.");
                TxtConsoleLog.ScrollToEnd();
            }
            else
            {
                TxtConsoleLog.AppendText($"\n[{DateTime.Now:HH:mm:ss}] No remote MPT allocation found in cache, temp file, or clipboard.");
                TxtConsoleLog.ScrollToEnd();
            }
        }

        private bool TryLoadFromSharedFileOrClipboard()
        {
            // 1. Try local shared temp file
            try
            {
                string tempFile = System.IO.Path.Combine(System.IO.Path.GetTempPath(), "archfin_mpt_payload.json");
                if (System.IO.File.Exists(tempFile))
                {
                    string json = System.IO.File.ReadAllText(tempFile);
                    if (!string.IsNullOrWhiteSpace(json))
                    {
                        var options = new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                        var payload = System.Text.Json.JsonSerializer.Deserialize<UrbanAllocationPayload>(json, options);
                        if (payload != null)
                        {
                            UpdateAllocation(payload);
                            Log($"📁 Loaded MPT allocation from local temp file: {tempFile}");
                            return true;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Log($"File read warning: {ex.Message}");
            }

            // 2. Try Windows Clipboard
            try
            {
                if (System.Windows.Clipboard.ContainsText())
                {
                    string clipText = System.Windows.Clipboard.GetText().Trim();
                    if (clipText.StartsWith("{") && clipText.EndsWith("}"))
                    {
                        var options = new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                        var payload = System.Text.Json.JsonSerializer.Deserialize<UrbanAllocationPayload>(clipText, options);
                        if (payload != null && (payload.GetResidentialPercent() > 0 || payload.GetCommercialPercent() > 0 || payload.GetIndustrialPercent() > 0))
                        {
                            UpdateAllocation(payload);
                            Log($"📋 Loaded MPT allocation from Windows Clipboard!");
                            return true;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Log($"Clipboard read warning: {ex.Message}");
            }

            return false;
        }
    }
}
