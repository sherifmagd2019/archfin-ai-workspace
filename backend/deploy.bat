@echo off
setlocal

echo ==========================================================
echo  ArchFin AI: Build and Install Add-in for Revit 2027
echo ==========================================================
echo.

:: 1. Check if Revit is running
tasklist /FI "IMAGENAME eq Revit.exe" 2>NUL | find /I "Revit.exe" >NUL
if not errorlevel 1 (
    echo [WARNING] Autodesk Revit 2027 is currently RUNNING.
    echo Revit places a file lock on add-in DLLs while open.
    echo Please save your work, close Autodesk Revit, and press any key to continue.
    echo.
    pause
)

:: 2. Target paths
set "SCRIPT_DIR=%~dp0"
set "PROJECT_FILE=%SCRIPT_DIR%ArchFinAI.Backend.csproj"
set "ADDIN_MANIFEST=%SCRIPT_DIR%ArchFinAI.addin"
set "TARGET_DIR=%APPDATA%\Autodesk\Revit\Addins\2027"
set "SUB_DIR=%TARGET_DIR%\ArchFinAI"

echo [1/3] Compiling ArchFinAI.Backend (Debug)...
dotnet build "%PROJECT_FILE%" -c Debug
if errorlevel 1 (
    echo.
    echo [ERROR] dotnet build failed.
    echo Please verify .NET SDK is installed and available in PATH.
    pause
    exit /b 1
)

echo [2/3] Preparing Revit 2027 Addins directory...
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"
if not exist "%SUB_DIR%" mkdir "%SUB_DIR%"

echo [3/3] Copying manifest and compiled assemblies...
copy /Y "%ADDIN_MANIFEST%" "%TARGET_DIR%\" >nul

if exist "%SCRIPT_DIR%bin\Debug\net10.0-windows7.0" (
    copy /Y "%SCRIPT_DIR%bin\Debug\net10.0-windows7.0\*" "%SUB_DIR%\" >nul
)
if exist "%SCRIPT_DIR%bin\Debug\net10.0-windows" (
    copy /Y "%SCRIPT_DIR%bin\Debug\net10.0-windows\*" "%SUB_DIR%\" >nul
)
if exist "%SCRIPT_DIR%bin\Debug\net8.0-windows7.0" (
    copy /Y "%SCRIPT_DIR%bin\Debug\net8.0-windows7.0\*" "%SUB_DIR%\" >nul
)
if exist "%SCRIPT_DIR%bin\Debug\net8.0-windows" (
    copy /Y "%SCRIPT_DIR%bin\Debug\net8.0-windows\*" "%SUB_DIR%\" >nul
)

echo.
echo ==========================================================
echo  SUCCESS: ArchFin AI Add-in installed for Revit 2027!
echo ==========================================================
echo  1. Launch Autodesk Revit 2027.
echo  2. Open your project (e.g. Snowdon Towers).
echo  3. The ArchFin dockable pane will now run the updated
echo     embedded TCP server and file-watcher bridge.
echo.
pause
