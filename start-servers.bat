@echo off
echo ==========================================
echo   🚀 INICIANDO LA CANASTA ERP
echo ==========================================
echo.
echo 1. Iniciando API Backend (Puerto 3000)...
start "Backend API - La Canasta" /D "%~dp0api" cmd /k "npm run dev"

echo 2. Iniciando Frontend Dashboard (Puerto 5173)...
start "Frontend Dashboard - La Canasta" /D "%~dp0admin-dashboard" cmd /k "npm run dev"

echo.
echo ✅ Ventanas de servidor iniciadas.
echo.
echo ⏳ Esperando 5 segundos para abrir el navegador...
timeout /t 5 >nul

echo 🌐 Abriendo sistema...
start http://localhost:5173/login

echo.
echo ¡Listo! Puedes minimizar las ventanas negras, pero NO las cierres.
echo.
pause
