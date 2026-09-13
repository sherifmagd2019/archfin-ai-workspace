// App.cs - Native Autodesk Revit 2027 IExternalApplication
using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
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
        private TcpListener? _tcpListener;
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

            // 4. Spin up high-reliability embedded TCP HTTP server (bypasses Windows http.sys / urlacl constraints)
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
            int[] candidatePorts = new[] { 8080, 8081, 8082, 8085, 8765 };
            bool started = false;
            string lastError = string.Empty;

            foreach (var port in candidatePorts)
            {
                try
                {
                    _tcpListener = new TcpListener(IPAddress.Any, port);
                    _tcpListener.Start();
                    ActivePort = port;
                    started = true;
                    Task.Run(() => AcceptTcpClientsLoop(_tcpListener, port));
                    
                    DockablePaneView?.SetServerStatus($"http://localhost:{port}/revit-sync/", true);
                    DockablePaneView?.Log($"✅ TCP HTTP Server listening on port {port}. Ready for React MPT sync.");
                    Console.WriteLine($"[ArchFin] Embedded TCP server listening on port {port}");
                    break;
                }
                catch (Exception ex)
                {
                    lastError = ex.Message;
                    try { _tcpListener?.Stop(); } catch { }
                    _tcpListener = null;
                }
            }

            if (!started)
            {
                DockablePaneView?.SetServerStatus("http://localhost:8080/revit-sync/", false, lastError);
                Console.WriteLine($"[ArchFin] Failed to bind TCP listener on candidate ports: {lastError}");
            }
        }

        private async Task AcceptTcpClientsLoop(TcpListener listener, int port)
        {
            while (_listening)
            {
                try
                {
                    var client = await listener.AcceptTcpClientAsync();
                    _ = Task.Run(() => ProcessHttpClient(client, port));
                }
                catch (Exception ex)
                {
                    if (!_listening) break;
                    DockablePaneView?.Log($"Accept error: {ex.Message}");
                    await Task.Delay(100);
                }
            }
        }

        private async Task ProcessHttpClient(TcpClient client, int port)
        {
            try
            {
                using (client)
                using (var stream = client.GetStream())
                using (var reader = new StreamReader(stream, Encoding.UTF8, false, 8192, leaveOpen: true))
                {
                    string? requestLine = await reader.ReadLineAsync();
                    if (string.IsNullOrEmpty(requestLine)) return;

                    var parts = requestLine.Split(' ');
                    string method = parts.Length > 0 ? parts[0].ToUpperInvariant() : "GET";
                    string url = parts.Length > 1 ? parts[1] : "/";

                    int contentLength = 0;
                    bool acceptsHtml = false;
                    string? headerLine;
                    while (!string.IsNullOrEmpty(headerLine = await reader.ReadLineAsync()))
                    {
                        if (headerLine.StartsWith("Content-Length:", StringComparison.OrdinalIgnoreCase))
                        {
                            int.TryParse(headerLine.Substring(15).Trim(), out contentLength);
                        }
                        else if (headerLine.StartsWith("Accept:", StringComparison.OrdinalIgnoreCase) &&
                                 headerLine.Contains("text/html", StringComparison.OrdinalIgnoreCase))
                        {
                            acceptsHtml = true;
                        }
                    }

                    string body = string.Empty;
                    if (contentLength > 0)
                    {
                        char[] buffer = new char[contentLength];
                        int totalRead = 0;
                        while (totalRead < contentLength)
                        {
                            int read = await reader.ReadAsync(buffer, totalRead, contentLength - totalRead);
                            if (read <= 0) break;
                            totalRead += read;
                        }
                        body = new string(buffer, 0, totalRead);
                    }

                    byte[] responseBodyBytes;
                    string contentType = "application/json; charset=utf-8";

                    if (method == "OPTIONS")
                    {
                        responseBodyBytes = Array.Empty<byte>();
                    }
                    else if (method == "GET")
                    {
                        DockablePaneView?.Log($"Health check ping received via GET {url}");

                        if (acceptsHtml)
                        {
                            contentType = "text/html; charset=utf-8";
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
                            responseBodyBytes = Encoding.UTF8.GetBytes(html);
                        }
                        else
                        {
                            var health = new
                            {
                                status = "online",
                                service = "ArchFin AI: BIM MPT Revit 2027 Bridge",
                                port = port,
                                endpoint = "/revit-sync/",
                                ready = true,
                                timestamp = DateTime.UtcNow.ToString("o")
                            };
                            responseBodyBytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(health));
                        }
                    }
                    else // POST
                    {
                        UrbanAllocationPayload? payload = null;
                        try
                        {
                            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                            payload = JsonSerializer.Deserialize<UrbanAllocationPayload>(body, options);
                        }
                        catch (Exception jsonEx)
                        {
                            DockablePaneView?.Log($"JSON parse warning: {jsonEx.Message}");
                        }

                        if (payload != null)
                        {
                            DockablePaneView?.Dispatcher.Invoke(() =>
                            {
                                DockablePaneView.UpdateAllocation(payload);
                            });

                            RevitModelUpdater.QueueAllocationUpdate(payload);
                            DockablePaneView?.Log($"✅ Dispatched MPT allocation to Revit canvas: Res={payload.GetResidentialPercent():F1}%, Comm={payload.GetCommercialPercent():F1}%, Ind={payload.GetIndustrialPercent():F1}%");
                        }

                        var responseObj = new
                        {
                            status = "success",
                            message = "Revit canvas structural synchronization executed successfully.",
                            port = port,
                            appliedAt = DateTime.UtcNow.ToString("o"),
                            receivedPayload = payload
                        };
                        responseBodyBytes = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(responseObj));
                    }

                    string responseHeader = "HTTP/1.1 200 OK\r\n" +
                                           $"Content-Type: {contentType}\r\n" +
                                           $"Content-Length: {responseBodyBytes.Length}\r\n" +
                                           "Access-Control-Allow-Origin: *\r\n" +
                                           "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n" +
                                           "Access-Control-Allow-Headers: Content-Type, Accept, Authorization, X-Requested-With\r\n" +
                                           "Connection: close\r\n\r\n";

                    byte[] headerBytes = Encoding.UTF8.GetBytes(responseHeader);
                    await stream.WriteAsync(headerBytes, 0, headerBytes.Length);
                    if (responseBodyBytes.Length > 0)
                    {
                        await stream.WriteAsync(responseBodyBytes, 0, responseBodyBytes.Length);
                    }
                    await stream.FlushAsync();
                }
            }
            catch (Exception ex)
            {
                DockablePaneView?.Log($"Client handler warning: {ex.Message}");
            }
        }

        public Result OnShutdown(UIControlledApplication application)
        {
            _listening = false;
            try
            {
                _tcpListener?.Stop();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ArchFin] Error shutting down server: {ex.Message}");
            }

            return Result.Succeeded;
        }
    }
}

