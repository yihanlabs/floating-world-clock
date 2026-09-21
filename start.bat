@echo off
rem Double-click launcher. Starts the clock with no lingering console window.
cd /d "%~dp0"

if not exist "node_modules\electron\dist\electron.exe" (
  echo First run detected - downloading Electron, this may take a few minutes...
  call npm install
  if errorlevel 1 goto fail
)

if not exist "node_modules\electron\dist\electron.exe" (
  echo Electron binary is still missing. Run "npm install" in this folder manually.
  pause
  exit /b 1
)

start "" "node_modules\electron\dist\electron.exe" .
exit /b 0

:fail
echo Dependency installation failed.
pause
exit /b 1
