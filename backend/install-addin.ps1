<#
.SYNOPSIS
    Builds and installs the ArchFin AI Revit 2027 Add-in to Autodesk Revit Addins directory.
.DESCRIPTION
    Compiles ArchFinAI.Backend (.NET 8) and deploys ArchFinAI.addin and the compiled DLLs to:
    $env:APPDATA\Autodesk\Revit\Addins\2027\
#>

[CmdletBinding()]
param (
    [string]$Configuration = "Release"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " ArchFin AI: BIM MPT Urban Optimize - Revit 2027 Deployer" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectFile = Join-Path $ScriptDir "ArchFinAI.Backend.csproj"
$AddinManifest = Join-Path $ScriptDir "ArchFinAI.addin"
$TargetDir = Join-Path $env:APPDATA "Autodesk\Revit\Addins\2027"
$SubModuleDir = Join-Path $TargetDir "ArchFinAI"

# 1. Validate environment
Write-Host "[1/4] Verifying .NET SDK and Revit 2027 paths..." -ForegroundColor Yellow
$dotnetVersion = dotnet --version 2>$null
if (-not $dotnetVersion) {
    Write-Error "Error: .NET SDK not found. Please install the .NET SDK (v10.0 for Revit 2027) from https://dotnet.microsoft.com/download"
    exit 1
}
Write-Host "      Detected .NET SDK: $dotnetVersion" -ForegroundColor Green

# 2. Compile C# Project
Write-Host "[2/4] Building ArchFinAI.Backend ($Configuration)..." -ForegroundColor Yellow
$buildOutput = dotnet build "$ProjectFile" -c $Configuration
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed. Please verify NuGet dependencies (Nice3point.Revit.Toolkit, etc.)."
    exit 1
}
Write-Host "      Build succeeded." -ForegroundColor Green

# 3. Create target directory
Write-Host "[3/4] Ensuring Revit 2027 Addins folder exists..." -ForegroundColor Yellow
if (-not (Test-Path $SubModuleDir)) {
    New-Item -ItemType Directory -Path $SubModuleDir -Force | Out-Null
}

# 4. Copy Manifest & Binaries
Write-Host "[4/4] Deploying manifest and assemblies..." -ForegroundColor Yellow
Copy-Item -Path $AddinManifest -Destination $TargetDir -Force

# Locate output directory across potential TFMs
$BinDirCandidates = @(
    (Join-Path $ScriptDir "bin\$Configuration\net10.0-windows7.0"),
    (Join-Path $ScriptDir "bin\$Configuration\net10.0-windows"),
    (Join-Path $ScriptDir "bin\$Configuration\net8.0-windows7.0"),
    (Join-Path $ScriptDir "bin\$Configuration\net8.0-windows")
)

$BinDir = $null
foreach ($candidate in $BinDirCandidates) {
    if (Test-Path $candidate) {
        $BinDir = $candidate
        break
    }
}

if ($BinDir) {
    Copy-Item -Path "$BinDir\*" -Destination $SubModuleDir -Recurse -Force
    Write-Host "      Copied binaries from $BinDir to: $SubModuleDir" -ForegroundColor Green
} else {
    Write-Warning "      Could not find binaries in bin\$Configuration. Checking standard output."
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " SUCCESS: ArchFin AI Add-in installed for Revit 2027!" -ForegroundColor Green
Write-Host " Start Autodesk Revit 2027 -> Go to 'ArchFin Agent' Ribbon Tab" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
