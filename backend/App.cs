// App.cs - Nice3point Application Entry
using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Autodesk.Revit.UI;
using JetBrains.Annotations;
using Nice3point.Revit.Toolkit.External;
using ArchFinAI.Backend.Commands;
using ArchFinAI.Backend.Models;
using ArchFinAI.Backend.Services;
using ArchFinAI.Backend.Views;

namespace ArchFinAI.Backend
{
    [UsedImplicitly]
    public class App : RevitApplication
    {
        private HttpListener? _listener;
        private bool _listening = true;

        // Singleton reference for UI callbacks
        public static App? Instance { get; private set; }
        public static AgentDashboardDockablePane? DockablePaneView { get; set; }
        public static readonly DockablePaneId PaneId = new DockablePaneId(new Guid("8A63D316-2C22-4B2E-8F8D-981D5E9E0A4E"));

        public override void OnStartup()
        {
            Instance = this;

            // 1. Initialize Nice3point ExternalEvent handler for thread-safe Revit API execution
            RevitModelUpdater.Initialize();

            // 2. Register Dockable Pane
            RegisterDockablePane();

            // 3. Create Ribbon UI using Nice3point context wrappers
            var tabName = "ArchFin Agent";
            CreateRibbonTab(tabName);
            var panel = CreateRibbonPanel(tabName, "Agentic Controls");

            panel.AddPushButton<LaunchDashboardCommand>("Launch\nDashboard")
                 .SetLargeImage("/ArchFinAI.Backend;component/Resources/dashboard_32.png")
                 .SetToolTip("Launch the ArchFin React MPT Optimization Web Dashboard in your browser.");

            panel.AddPushButton<ShowDockablePaneCommand>("Agent\nInspector")
                 .SetLargeImage("/ArchFinAI.Backend;component/Resources/inspector_32.png")
                 .SetToolTip("Toggle the live ArchFin Agent WPF Contextual Telemetry Dockable Pane.");

            // 4. Spin up an asynchronous background thread for receiving layout payloads from React frontend
            StartLocalServer();
        }

        private void RegisterDockablePane()
        {
            try
            {
                DockablePaneView = new AgentDashboardDockablePane();
                UiApplication.RegisterDockablePane(PaneId, "ArchFin: Live Agent Telemetry", DockablePaneView);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ArchFin] DockablePane registration warning: {ex.Message}");
            }
        }

        private void StartLocalServer()
        {
            try
            {
                _listener = new HttpListener();
                _listener.Prefixes.Add("http://localhost:8080/revit-sync/");
                _listener.Start();
                Task.Run(() => ListenLoop());
                Console.WriteLine("[ArchFin] Local Revit sync server started on http://localhost:8080/revit-sync/");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ArchFin] Failed to start HttpListener (Administrator rights may be required): {ex.Message}");
            }
        }

        private async Task ListenLoop()
        {
            while (_listening && _listener != null && _listener.IsListening)
            {
                try
                {
                    var context = await _listener.GetContextAsync();
                    
                    // Handle CORS Preflight OPTIONS requests for web browser fetch compatibility
                    if (context.Request.HttpMethod.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
                    {
                        AddCorsHeaders(context.Response);
                        context.Response.StatusCode = (int)HttpStatusCode.OK;
                        context.Response.Close();
                        continue;
                    }

                    using var reader = new StreamReader(context.Request.InputStream, context.Request.ContentEncoding);
                    string jsonPayload = await reader.ReadToEndAsync();

                    // Process the allocation weights (Residential, Commercial, Industrial)
                    UrbanAllocationPayload? payload = null;
                    try
                    {
                        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                        payload = JsonSerializer.Deserialize<UrbanAllocationPayload>(jsonPayload, options);
                    }
                    catch (Exception jsonEx)
                    {
                        Console.WriteLine($"[ArchFin] JSON Parse error: {jsonEx.Message}");
                    }

                    // Enqueue payload into the Revit Idling or ExternalEvent loop to mutate physical canvas parameters safely
                    if (payload != null)
                    {
                        // Update the WPF DockablePane on UI thread
                        DockablePaneView?.Dispatcher.Invoke(() =>
                        {
                            DockablePaneView.UpdateAllocation(payload);
                        });

                        // Dispatch transaction to Revit API main thread via ExternalEvent
                        RevitModelUpdater.QueueAllocationUpdate(payload);
                    }

                    // Respond to React frontend
                    AddCorsHeaders(context.Response);
                    var responseData = new
                    {
                        status = "success",
                        message = "Revit canvas structural synchronization executed successfully.",
                        appliedAt = DateTime.UtcNow.ToString("o"),
                        receivedPayload = payload
                    };
                    string responseJson = JsonSerializer.Serialize(responseData);
                    var responseBuffer = Encoding.UTF8.GetBytes(responseJson);

                    context.Response.ContentType = "application/json";
                    context.Response.ContentLength64 = responseBuffer.Length;
                    await context.Response.OutputStream.WriteAsync(responseBuffer, 0, responseBuffer.Length);
                    context.Response.OutputStream.Close();
                }
                catch (HttpListenerException)
                {
                    // Listener stopped during shutdown
                    break;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ArchFin] Listen loop error: {ex.Message}");
                }
            }
        }

        private static void AddCorsHeaders(HttpListenerResponse response)
        {
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            response.Headers.Add("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Accept");
        }

        public override void OnShutdown()
        {
            _listening = false;
            try
            {
                _listener?.Stop();
                _listener?.Close();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ArchFin] Error shutting down server: {ex.Message}");
            }
        }
    }
}
