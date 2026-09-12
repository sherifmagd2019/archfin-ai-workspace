# ArchFin AI: Backend (Revit 2027 Add-in)

Computational architectural engineering backend for Autodesk Revit 2027, powered by .NET 8 and the [Nice3point](https://github.com/Nice3point) Revit API framework templates.

## Architecture Overview

```
[React Frontend] --(HTTP POST JSON: http://localhost:8080/revit-sync/)--> [HttpListener Background Thread]
                                                                                  |
                                                                         [ExternalEvent Queue]
                                                                                  |
                                                                   [Revit Main UI Thread Execution]
                                                                                  |
                                                       +--------------------------+--------------------------+
                                                       |                                                     |
                                            [Mass Floors / Parameters]                             [WPF DockablePane]
                                         (Zoning Allocation Updated)                            (Real-Time Telemetry Log)
```

### Key Components

1. **`App.cs` (`RevitApplication`)**:
   - Nice3point Application entry point.
   - Registers custom Ribbon Tab `"ArchFin Agent"` and `"Agentic Controls"` panel.
   - Registers non-modal `AgentDashboardDockablePane` (`DockablePaneId`).
   - Starts asynchronous background `HttpListener` on `http://localhost:8080/revit-sync/` with full CORS preflight support.

2. **`Commands/LaunchDashboardCommand.cs` (`RevitCommand`)**:
   - Nice3point Ribbon PushButton action that launches the default web browser to the React dashboard (`http://localhost:3000`).

3. **`Commands/ShowDockablePaneCommand.cs` (`RevitCommand`)**:
   - Ribbon PushButton action that toggles visibility of the live agent telemetry dockable pane.

4. **`Services/RevitModelUpdater.cs` (`IExternalEventHandler`)**:
   - Safely executes model mutations on Revit's main API thread inside an encapsulated `Transaction`.
   - Modifies massing floor usage (`Residential`, `Commercial`, `Industrial`) and updates project parameter information.

5. **`Views/AgentDashboardDockablePane.xaml`**:
   - Native WPF embedded panel displaying live allocation progress bars, incoming payloads, and a real-time console log.

## Building & Installation

### Prerequisites
- .NET 8 SDK (x64)
- Autodesk Revit 2027
- Visual Studio 2022 or JetBrains Rider with .NET desktop development workload

### Quick Deploy via PowerShell
```powershell
./install-addin.ps1 -Configuration Release
```

### Manual Build
```bash
dotnet restore
dotnet build -c Release
```
Then copy `ArchFinAI.addin` and `bin/Release/net8.0-windows/*` into `%APPDATA%\Autodesk\Revit\Addins\2027\ArchFinAI\`.
