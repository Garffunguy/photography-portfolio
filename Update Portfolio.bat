@echo off

echo.
echo Updating photography portfolio...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0generate-photos.ps1"

echo.
echo Done.
echo.

pause