@echo off
title LocalWork - Backend Server
echo.
echo   ==============================
echo     LocalWork Backend Server
echo   ==============================
echo.
echo   Iniciando servidor...
echo.
cd /d "%~dp0"
npm run dev
pause
