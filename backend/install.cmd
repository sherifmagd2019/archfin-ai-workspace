@echo off
setlocal
echo ==========================================================
echo  ArchFin AI: One-Click Build and Deploy for Revit 2027
echo ==========================================================
echo.
echo 1. Close Autodesk Revit if running...
timeout /t 1 >nul

echo 2. Building backend project...
dotnet build "%~dp0ArchFinAI.Backend.csproj" -c Debug
if errorlevel 1 (
    echo.
    echo [ERROR] Build failed! Please review the errors above.
    pause
    exit /b 1
)

echo.
echo 3. Deploying to %APPDATA%\Autodesk\Revit\Addins\2027...
if not exist "%APPDATA%\Autodesk\Revit\Addins\2027\ArchFinAI" mkdir "%APPDATA%\Autodesk\Revit\Addins\2027\ArchFinAI"
copy /Y "%~dp0ArchFinAI.addin" "%APPDATA%\Autodesk\Revit\Addins\2027\"
for /d %%D in ("%~dp0bin\Debug\net*") do (
    copy /Y "%%D\*" "%APPDATA%\Autodesk\Revit\Addins\2027\ArchFinAI\"
)

echo.
echo Done! Please restart Autodesk Revit 2027.
pause
