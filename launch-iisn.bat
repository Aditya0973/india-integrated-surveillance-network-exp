@echo off
title INDIA INTEGRATED SURVEILLANCE NETWORK // IISN
cls
echo ====================================================================
echo  [ INDIA INTEGRATED SURVEILLANCE NETWORK // IISN ]
echo  Crafted Co. Glassmorphism Tactical 3D Intelligence Console
echo ====================================================================
echo.

if exist "%~dp0apps\iisn\server\proxy.js" (
    cd /d "%~dp0apps\iisn"
) else if exist "%~dp0server\proxy.js" (
    cd /d "%~dp0"
) else (
    echo [ERROR] Could not find IISN server directory.
    pause
    exit /b 1
)

echo [*] Checking and freeing port 5200 if occupied...
powershell -NoProfile -Command "Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"

if not exist node_modules (
    echo [*] Installing dependencies for IISN...
    call npm install
)

echo [*] Launching IISN Standalone Window in 2 seconds...
start /b "" powershell -NoProfile -Command "Start-Sleep -Seconds 2; if (Test-Path 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe') { Start-Process 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' -ArgumentList '--app=http://localhost:5200','--window-size=1600,980' } elseif (Test-Path 'C:\Program Files\Microsoft\Edge\Application\msedge.exe') { Start-Process 'C:\Program Files\Microsoft\Edge\Application\msedge.exe' -ArgumentList '--app=http://localhost:5200','--window-size=1600,980' } elseif (Test-Path 'C:\Program Files\Google\Chrome\Application\chrome.exe') { Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList '--app=http://localhost:5200','--window-size=1600,980' } else { Start-Process 'http://localhost:5200' }"

echo [*] Initializing IISN Backend Engine on port 5200...
node server/proxy.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] IISN server exited unexpectedly with error code %ERRORLEVEL%.
    pause
)


