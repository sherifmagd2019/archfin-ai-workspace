import { useState } from 'react';
import { Code2, Copy, Check } from 'lucide-react';

export default function BlueprintCodeViewer() {
  const [selectedTab, setSelectedTab] = useState('app');
  const [copied, setCopied] = useState(false);

  const files = {
    app: {
      name: "backend/App.cs",
      lang: "csharp",
      description: "Nice3point Application Entry & Background HttpListener",
      content: `// App.cs - Nice3point Application Entry
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

            panel.AddPushButton<LaunchDashboardCommand>("Launch\\nDashboard")
                 .SetLargeImage("/ArchFinAI.Backend;component/Resources/dashboard_32.png")
                 .SetToolTip("Launch the ArchFin React MPT Optimization Web Dashboard in your browser.");

            panel.AddPushButton<ShowDockablePaneCommand>("Agent\\nInspector")
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
            _listener = new HttpListener();
            _listener.Prefixes.Add("http://localhost:8080/revit-sync/");
            _listener.Start();
            Task.Run(() => ListenLoop());
        }

        private async Task ListenLoop()
        {
            while (_listening && _listener != null && _listener.IsListening)
            {
                var context = await _listener.GetContextAsync();
                
                // Handle CORS Preflight OPTIONS for browser fetch compatibility
                if (context.Request.HttpMethod.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
                {
                    AddCorsHeaders(context.Response);
                    context.Response.StatusCode = (int)HttpStatusCode.OK;
                    context.Response.Close();
                    continue;
                }

                using var reader = new StreamReader(context.Request.InputStream, context.Request.ContentEncoding);
                string jsonPayload = await reader.ReadToEndAsync();

                // Process allocation weights (Residential, Commercial, Industrial)
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var payload = JsonSerializer.Deserialize<UrbanAllocationPayload>(jsonPayload, options);

                // Enqueue payload into Revit ExternalEvent loop to mutate physical canvas parameters safely
                if (payload != null)
                {
                    DockablePaneView?.Dispatcher.Invoke(() => DockablePaneView.UpdateAllocation(payload));
                    RevitModelUpdater.QueueAllocationUpdate(payload);
                }

                AddCorsHeaders(context.Response);
                var responseBuffer = Encoding.UTF8.GetBytes("{\\"status\\":\\"success\\",\\"message\\":\\"Revit canvas structural synchronization executed successfully.\\"}");
                context.Response.ContentType = "application/json";
                context.Response.ContentLength64 = responseBuffer.Length;
                await context.Response.OutputStream.WriteAsync(responseBuffer, 0, responseBuffer.Length);
                context.Response.OutputStream.Close();
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
            _listener?.Stop();
        }
    }
}`
    },
    updater: {
      name: "backend/Services/RevitModelUpdater.cs",
      lang: "csharp",
      description: "Thread-safe ExternalEvent handler for Revit 2027 transactions",
      content: `// Services/RevitModelUpdater.cs
using System;
using System.Collections.Concurrent;
using System.Linq;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;
using ArchFinAI.Backend.Models;

namespace ArchFinAI.Backend.Services
{
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
            if (doc == null || doc.IsReadOnly) return;

            while (_pendingUpdates.TryDequeue(out var payload))
            {
                using var trans = new Transaction(doc, "ArchFin: Apply MPT Urban Allocation");
                try
                {
                    trans.Start();
                    
                    // Update project global parameters
                    var projectInfo = doc.ProjectInformation;
                    if (projectInfo != null)
                    {
                        TrySetParameter(projectInfo, "ArchFin_Residential_Ratio", payload.Residential);
                        TrySetParameter(projectInfo, "ArchFin_Commercial_Ratio", payload.Commercial);
                        TrySetParameter(projectInfo, "ArchFin_Industrial_Ratio", payload.Industrial);
                    }

                    // Dynamically assign mass floors
                    var massFloors = new FilteredElementCollector(doc)
                        .OfCategory(BuiltInCategory.OST_MassFloor)
                        .WhereElementIsNotElementType()
                        .ToElements();

                    // Re-assign floor usage parameters
                    int total = massFloors.Count;
                    double resPct = payload.GetResidentialPercent() / 100.0;
                    double commPct = payload.GetCommercialPercent() / 100.0;
                    int resCount = (int)Math.Round(total * resPct);
                    int commCount = (int)Math.Round(total * commPct);

                    for (int i = 0; i < total; i++)
                    {
                        string use = i < resCount ? "Residential" : (i < resCount + commCount ? "Commercial" : "Industrial");
                        TrySetParameter(massFloors[i], "Mass Floor Usage", use);
                    }

                    trans.Commit();
                }
                catch
                {
                    if (trans.HasStarted()) trans.RollBack();
                }
            }
        }

        private static void TrySetParameter(Element element, string paramName, string value)
        {
            var param = element.LookupParameter(paramName);
            if (param != null && !param.IsReadOnly) param.Set(value);
        }

        public string GetName() => "ArchFin_RevitModelUpdater_Handler";
    }
}`
    },
    command: {
      name: "backend/Commands/LaunchDashboardCommand.cs",
      lang: "csharp",
      description: "Ribbon PushButton command launching default web browser",
      content: `// Commands/LaunchDashboardCommand.cs
using System;
using System.Diagnostics;
using Autodesk.Revit.Attributes;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;
using Nice3point.Revit.Toolkit.External;

namespace ArchFinAI.Backend.Commands
{
    [Transaction(TransactionMode.Manual)]
    public class LaunchDashboardCommand : RevitCommand
    {
        public override void Execute()
        {
            try
            {
                const string dashboardUrl = "http://localhost:3000";
                Process.Start(new ProcessStartInfo
                {
                    FileName = dashboardUrl,
                    UseShellExecute = true
                });

                TaskDialog.Show("ArchFin AI", $"Optimization Dashboard launched at:\\n{dashboardUrl}\\n\\nRevit sync pipeline active on port 8080.");
            }
            catch (Exception ex)
            {
                TaskDialog.Show("ArchFin AI Error", $"Failed to open browser: {ex.Message}");
            }
        }
    }
}`
    },
    xaml: {
      name: "backend/Views/AgentDashboardDockablePane.xaml",
      lang: "xml",
      description: "Embedded WPF Contextual Dashboard Panel XAML",
      content: `<UserControl x:Class="ArchFinAI.Backend.Views.AgentDashboardDockablePane"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             Background="#181825" Foreground="#CDD6F4">
    <Grid Margin="16">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
            <RowDefinition Height="Auto"/>
        </Grid.RowDefinitions>

        <!-- Header -->
        <Border Grid.Row="0" Background="#1E1E2E" CornerRadius="8" Padding="14" Margin="0,0,0,12">
            <StackPanel>
                <TextBlock Text="ArchFin Agent" FontSize="16" FontWeight="Bold" Foreground="#89B4FA"/>
                <TextBlock Text="Revit 2027 BIM MPT Live Stream" FontSize="11" Foreground="#A6ADC8"/>
            </StackPanel>
        </Border>

        <!-- Progress Bars for Residential, Commercial, Industrial -->
        <Border Grid.Row="1" Background="#1E1E2E" CornerRadius="8" Padding="14" Margin="0,0,0,12">
            <StackPanel>
                <TextBlock Text="ALLOCATION WEIGHT MATRIX" FontSize="11" FontWeight="Bold" Foreground="#BAC2DE"/>
                <ProgressBar x:Name="PbResidential" Height="10" Value="33.3" Maximum="100" Foreground="#89B4FA" Margin="0,4"/>
                <ProgressBar x:Name="PbCommercial" Height="10" Value="33.3" Maximum="100" Foreground="#F9E2AF" Margin="0,4"/>
                <ProgressBar x:Name="PbIndustrial" Height="10" Value="33.4" Maximum="100" Foreground="#F38BA8" Margin="0,4"/>
            </StackPanel>
        </Border>

        <!-- Console Log -->
        <Border Grid.Row="2" Background="#11111B" CornerRadius="8" Padding="12" Margin="0,0,0,12">
            <TextBox x:Name="TxtConsoleLog" Background="Transparent" Foreground="#A6ADC8" 
                     BorderThickness="0" TextWrapping="Wrap" IsReadOnly="True"
                     FontFamily="Consolas, monospace" FontSize="11"/>
        </Border>

        <Button Grid.Row="3" Content="Launch Web Dashboard" 
                Background="#A6E3A1" Foreground="#11111B" FontWeight="Bold" 
                Padding="10,8" Click="BtnOpenDashboard_Click"/>
    </Grid>
</UserControl>`
    },
    csproj: {
      name: "backend/ArchFinAI.Backend.csproj",
      lang: "xml",
      description: ".NET 8 project targeting Revit 2027 with Nice3point toolkit",
      content: `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <UseWPF>true</UseWPF>
    <TargetFramework>net8.0-windows</TargetFramework>
    <PlatformTarget>x64</PlatformTarget>
    <AssemblyName>ArchFinAI.Backend</AssemblyName>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Nice3point.Revit.Toolkit" Version="2027.0.0" />
    <PackageReference Include="Nice3point.Revit.Extensions" Version="2027.0.0" />
    <PackageReference Include="Nice3point.Revit.Api.RevitAPI" Version="2027.0.0" />
    <PackageReference Include="Nice3point.Revit.Api.RevitAPIUI" Version="2027.0.0" />
    <PackageReference Include="System.Text.Json" Version="8.0.5" />
  </ItemGroup>
</Project>`
    },
    install: {
      name: "backend/install-addin.ps1",
      lang: "powershell",
      description: "One-click build and deployment to %APPDATA%\\Autodesk\\Revit\\Addins\\2027\\",
      content: `# Powershell installer for Revit 2027 Addin
param ([string]$Configuration = "Release")

Write-Host "Building ArchFinAI.Backend ($Configuration)..." -ForegroundColor Cyan
dotnet build -c $Configuration

$TargetDir = "$env:APPDATA\\Autodesk\\Revit\\Addins\\2027\\ArchFinAI"
New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null

Copy-Item "ArchFinAI.addin" "$env:APPDATA\\Autodesk\\Revit\\Addins\\2027\\" -Force
Copy-Item "bin\\$Configuration\\net8.0-windows\\*" $TargetDir -Recurse -Force

Write-Host "ArchFin AI installed successfully to Revit 2027!" -ForegroundColor Green`
    }
  };

  const currentFile = files[selectedTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#89b4fa]/15 text-[#89b4fa] rounded-md">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#cdd6f4]">Revit 2027 Nice3point Framework Blueprint</h3>
            <p className="text-xs text-[#a6adc8]">{currentFile.description}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 bg-[#313244] hover:bg-[#45475a] text-[#89b4fa] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#a6e3a1]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Code' : 'Copy File'}</span>
        </button>
      </div>

      {/* Tab Selectors */}
      <div className="flex flex-wrap gap-1.5 mb-3 border-b border-[#313244] pb-2">
        {[
          { key: 'app', label: 'App.cs' },
          { key: 'updater', label: 'RevitModelUpdater.cs' },
          { key: 'command', label: 'LaunchDashboardCommand.cs' },
          { key: 'xaml', label: 'DockablePane.xaml' },
          { key: 'csproj', label: 'Backend.csproj' },
          { key: 'install', label: 'install-addin.ps1' }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSelectedTab(tab.key)}
            className={`text-xs px-2.5 py-1 rounded font-mono transition-colors cursor-pointer ${
              selectedTab === tab.key
                ? 'bg-[#89b4fa] text-[#11111b] font-bold'
                : 'bg-[#181825] text-[#a6adc8] hover:bg-[#313244]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Code Container */}
      <div className="bg-[#11111b] border border-[#313244] rounded-lg p-3 overflow-x-auto max-h-[380px] overflow-y-auto">
        <div className="text-[10px] text-[#6c7086] mb-1 font-mono">{currentFile.name}</div>
        <pre className="text-xs font-mono text-[#cdd6f4] leading-relaxed">
          {currentFile.content}
        </pre>
      </div>
    </div>
  );
}
