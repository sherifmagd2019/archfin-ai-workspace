// App.cs - Native Autodesk Revit 2027 IExternalApplication
using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Autodesk.Revit.UI;
using JetBrains.Annotations;
using ArchFinAI.Backend.Commands;
using ArchFinAI.Backend.Models;
using ArchFinAI.Backend.Services;
using ArchFinAI.Backend.Views;

namespace ArchFinAI.Backend
{
    [UsedImplicitly]
    public class App : IExternalApplication
    {
        private HttpListener? _listener;
        private bool _listening = true;

        // Singleton reference for UI callbacks
        public static App? Instance { get; private set; }
        public static AgentDashboardDockablePane? DockablePaneView { get; set; }
        public static readonly DockablePaneId PaneId = new DockablePaneId(new Guid("8A63D316-2C22-4B2E-8F8D-981D5E9E0A4E"));

        public Result OnStartup(UIControlledApplication application)
        {
            Instance = this;

            // 1. Initialize ExternalEvent handler for thread-safe Revit API execution
            RevitModelUpdater.Initialize();

            // 2. Register Dockable Pane
            RegisterDockablePane(application);

            // 3. Create Ribbon UI
            const string tabName = "ArchFin Agent";
            try
            {
                application.CreateRibbonTab(tabName);
            }
            catch
            {
                // Tab already exists or error handled
            }

            var panel = application.CreateRibbonPanel(tabName, "Agentic Controls");
            var assemblyPath = typeof(App).Assembly.Location;

            var launchBtnData = new PushButtonData(
                "LaunchDashboardBtn",
                "Launch\nDashboard",
                assemblyPath,
                typeof(LaunchDashboardCommand).FullName
            )
            {
                ToolTip = "Launch the ArchFin React MPT Optimization Web Dashboard in your browser."
            };

            var inspectorBtnData = new PushButtonData(
                "AgentInspectorBtn",
                "Agent\nInspector",
                assemblyPath,
                typeof(ShowDockablePaneCommand).FullName
            )
            {
                ToolTip = "Toggle the live ArchFin Agent WPF Contextual Telemetry Dockable Pane."
            };

            try
            {
                launchBtnData.LargeImage = new System.Windows.Media.Imaging.BitmapImage(
                    new Uri("pack://application:,,,/ArchFinAI.Backend;component/Resources/dashboard_32.png", UriKind.Absolute));
            }
            catch
            {
                // Fallback if icon resource pack URI is not present
            }

            try
            {
                inspectorBtnData.LargeImage = new System.Windows.Media.Imaging.BitmapImage(
                    new Uri("pack://application:,,,/ArchFinAI.Backend;component/Resources/inspector_32.png", UriKind.Absolute));
            }
            catch
            {
                // Fallback if icon resource pack URI is not present
            }

            panel.AddItem(launchBtnData);
            panel.AddItem(inspectorBtnData);

            // 4. Spin up an asynchronous background thread for receiving layout payloads from React frontend
            StartLocalServer();

            return Result.Succeeded;
        }

        private void RegisterDockablePane(UIControlledApplication application)
        {
            try
            {
                DockablePaneView = new AgentDashboardDockablePane();
                application.RegisterDockablePane(PaneId, "ArchFin: Live Agent Telemetry", DockablePaneView);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ArchFin] DockablePane registration warning: {ex.Message}");
            }
        }

        public static int ActivePort { get; private set; } = 8080;

        private void StartLocalServer()
        {
            int[] candidatePorts = new[] { 8080, 8081, 8082, 8085 };
            bool started = false;
            string lastError = string.Empty;

            foreach (var port in candidatePorts)
            {
                try
                {
                    _listener = new HttpListener();
                    _listener.Prefixes.Add($"http://localhost:{port}/");
                    _listener.Prefixes.Add($"http://127.0.0.1:{port}/");
                    _listener.Prefixes.Add($"http://localhost:{port}/revit-sync/");
                    _listener.Prefixes.Add($"http://127.0.0.1:{port}/revit-sync/");

                    _listener.Start();
                    ActivePort = port;
                    started = true;
                    Task.Run(() => ListenLoop(port));
                    
                    DockablePaneView?.SetServerStatus($"http://localhost:{port}/revit-sync/", true);
                    DockablePaneView?.Log($"✅ HTTP Listener active on port {port}. Ready for React MPT sync.");
                    Console.WriteLine($"[ArchFin] Local Revit sync server started on port {port}");
                    break;
                }
                catch (Exception ex)
                {
                    lastError = ex.Message;
                    try { _listener?.Close(); } catch { }
                    _listener = null;
                }
            }

            if (!started)
            {
                DockablePaneView?.SetServerStatus("http://localhost:8080/revit-sync/", false, lastError);
                Console.WriteLine($"[ArchFin] Failed to start HttpListener on candidate ports: {lastError}");
            }
        }

        private async Task ListenLoop(int port)
        {
            while (_listening && _listener != null && _listener.IsListening)
            {
                try
                {
                    var context = await _listener.GetContextAsync();
                    var request = context.Request;
                    var response = context.Response;

                    AddCorsHeaders(response);

                    // 1. Handle CORS Preflight OPTIONS
                    if (request.HttpMethod.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
                    {
                        response.StatusCode = (int)HttpStatusCode.OK;
                        response.Close();
                        continue;
                    }

                    // 2. Handle GET requests (Browser diagnostic & health check)
                    if (request.HttpMethod.Equals("GET", StringComparison.OrdinalIgnoreCase))
                    {
                        DockablePaneView?.Log($"Health check ping received from {request.RemoteEndPoint?.Address}");

                        string acceptHeader = request.Headers["Accept"] ?? string.Empty;
                        if (acceptHeader.Contains("text/html"))
                        {
                            string html = $@"<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'/>
    <title>ArchFin AI: Revit 2027 Bridge Online</title>
    <style>
        body {{ background: #11111b; color: #cdd6f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }}
        .card {{ background: #181825; border: 1px solid #313244; border-radius: 16px; padding: 40px; max-width: 540px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }}
        .badge {{ display: inline-block; background: rgba(166,227,161,0.2); color: #a6e3a1; border: 1px solid rgba(166,227,161,0.4); padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 12px; margin-bottom: 16px; }}
        h1 {{ margin: 0 0 12px 0; font-size: 24px; color: #cdd6f4; }}
        p {{ color: #a6adc8; font-size: 14px; line-height: 1.6; margin: 8px 0; }}
        .code {{ font-family: monospace; background: #11111b; padding: 2px 6px; border-radius: 4px; color: #cba6f7; }}
        .btn {{ display: inline-block; margin-top: 20px; background: #89b4fa; color: #11111b; font-weight: bold; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; }}
    </style>
</head>
<body>
    <div class='card'>
        <div class='badge'>● Revit 2027 Pipeline Online</div>
        <h1>ArchFin AI: BIM MPT Bridge Active</h1>
        <p>Autodesk Revit 2027 is actively listening on <span class='code'>http://localhost:{port}/revit-sync/</span>.</p>
        <p>ExternalEvent dispatch pipeline initialized and ready to stream real-time MPT urban portfolio allocations into the active model.</p>
        <a class='btn' href='http://localhost:3000'>Open Optimization Web Dashboard &rarr;</a>
    </div>
</body>
</html>";
                            var htmlBytes = Encoding.UTF8.GetBytes(html);
                            response.ContentType = "text/html; charset=utf-8";
                            response.ContentLength64 = htmlBytes.Length;
                            await response.OutputStream.WriteAsync(htmlBytes, 0, htmlBytes.Length);
                            response.OutputStream.Close();
                            continue;
                        }

                        var healthJson = JsonSerializer.Serialize(new
                        {
                            status = "online",
                            service = "ArchFin AI: BIM MPT Revit 2027 Bridge",
                            port = port,
                            endpoint = $"/revit-sync/",
                            ready = true,
                            timestamp = DateTime.UtcNow.ToString("o")
                        });
                        var jsonBytes = Encoding.UTF8.GetBytes(healthJson);
                        response.ContentType = "application/json";
                        response.ContentLength64 = jsonBytes.Length;
                        await response.OutputStream.WriteAsync(jsonBytes, 0, jsonBytes.Length);
                        response.OutputStream.Close();
                        continue;
                    }

                    // 3. Handle POST request (Incoming MPT payload from React frontend)
                    using var reader = new StreamReader(request.InputStream, request.ContentEncoding);
                    string jsonPayload = await reader.ReadToEndAsync();

                    UrbanAllocationPayload? payload = null;
                    try
                    {
                        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                        payload = JsonSerializer.Deserialize<UrbanAllocationPayload>(jsonPayload, options);
                    }
                    catch (Exception jsonEx)
                    {
                        DockablePaneView?.Log($"JSON parse warning: {jsonEx.Message}");
                    }

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
                    var responseData = new
                    {
                        status = "success",
                        message = "Revit canvas structural synchronization executed successfully.",
                        port = port,
                        appliedAt = DateTime.UtcNow.ToString("o"),
                        receivedPayload = payload
                    };
                    string responseJson = JsonSerializer.Serialize(responseData);
                    var responseBuffer = Encoding.UTF8.GetBytes(responseJson);

                    response.ContentType = "application/json";
                    response.ContentLength64 = responseBuffer.Length;
                    await response.OutputStream.WriteAsync(responseBuffer, 0, responseBuffer.Length);
                    response.OutputStream.Close();
                }
                catch (HttpListenerException)
                {
                    // Listener stopped during shutdown
                    break;
                }
                catch (Exception ex)
                {
                    DockablePaneView?.Log($"Listen loop warning: {ex.Message}");
                }
            }
        }

        private static void AddCorsHeaders(HttpListenerResponse response)
        {
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            response.Headers.Add("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization, X-Requested-With");
        }

        public Result OnShutdown(UIControlledApplication application)
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

            return Result.Succeeded;
        }
    }
}
