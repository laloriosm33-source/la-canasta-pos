@echo off
title LA CANASTA ERP - Sistema Completo
color 0A

echo ========================================
echo   LA CANASTA ERP - Iniciando Sistema
echo ========================================
echo.

cd /d "%~dp0"

echo [*] Iniciando API Backend...
start "LA CANASTA - API" cmd /k "cd api && npm run dev"

timeout /t 3 /nobreak >nul

echo [*] Iniciando Admin Dashboard...
start "LA CANASTA - Dashboard" cmd /k "cd admin-dashboard && npm run dev"

echo.
echo ========================================
echo   SISTEMA INICIADO!
echo ========================================
echo.
echo Se han abierto 2 ventanas:
echo   1. API Backend (puerto 3000)
echo   2. Admin Dashboard (puerto 5173)
echo.
echo URLs disponibles:
echo   - Local: http://localhost:5173
echo   - Produccion: https://lacanasta-erp.com
echo.
echo Para detener el sistema, cierra las ventanas.
echo.
pause
