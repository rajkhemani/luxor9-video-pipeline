@echo off
echo ========================================
echo   LUXOR9 Video Pipeline - Quick Start
echo ========================================
echo.

if "%1"=="comfyui" goto comfyui
if "%1"=="server" goto server
if "%1"=="studio" goto studio
if "%1"=="demo" goto demo
if "%1"=="all" goto all
if "%1"=="" goto help

:help
echo Usage: start.bat [command]
echo.
echo   start.bat comfyui    Start ComfyUI (AI image/video generation)
echo   start.bat server     Start Express API server (port 4000)
echo   start.bat studio     Start Remotion Studio (port 3000)
echo   start.bat demo       Run free pipeline demo
echo   start.bat all        Start everything
goto end

:comfyui
echo Starting ComfyUI on port 8188...
start "ComfyUI" cmd /c "cd /d %~dp0tools\ComfyUI && python main.py --cpu"
goto end

:server
echo Starting API server on port 4000...
cd /d %~dp0packages\video-orchestrator
start "LUXOR9-API" cmd /c "npx tsx src/server.ts"
goto end

:studio
echo Starting Remotion Studio on port 3000...
cd /d %~dp0packages\video-engine
start "LUXOR9-Studio" cmd /c "npx remotion studio src/entry.ts"
goto end

:demo
echo Running free pipeline demo...
cd /d %~dp0packages\video-orchestrator
npx tsx src/free-demo.ts
goto end

:all
call :comfyui
timeout /t 5
call :server
call :studio
echo.
echo ========================================
echo   All services started!
echo   ComfyUI:   http://localhost:8188
echo   API:       http://localhost:4000
echo   Studio:    http://localhost:3000
echo ========================================
goto end

:end
