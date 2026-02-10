@echo off
title LA CANASTA API - Cloudflare Tunnel
color 0B

echo ========================================
echo   LA CANASTA API - Iniciando Tunnel
echo ========================================
echo.

cd /d "%~dp0"

echo [*] Verificando que el API este corriendo...
echo     El API debe estar en http://localhost:3000
echo.

timeout /t 2 /nobreak >nul

echo [*] Iniciando Cloudflare Tunnel...
echo     Conectando api.lacanasta-erp.com -> localhost:3000
echo.

cloudflared tunnel run la-canasta-api

pause
