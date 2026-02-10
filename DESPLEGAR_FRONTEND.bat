@echo off
echo ========================================
echo   LA CANASTA ERP - Despliegue Rapido
echo ========================================
echo.

cd /d "%~dp0admin-dashboard"

echo [1/3] Construyendo el frontend...
call npx vite build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Fallo la construccion del frontend
    pause
    exit /b 1
)

echo.
echo [2/3] Desplegando a Cloudflare Pages...
call npx wrangler pages deploy dist --project-name=lacanasta-admin --commit-dirty=true

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Fallo el despliegue
    pause
    exit /b 1
)

echo.
echo ========================================
echo   DESPLIEGUE COMPLETADO!
echo ========================================
echo.
echo Tu aplicacion esta disponible en:
echo   - https://lacanasta-erp.com
echo   - https://lacanasta-admin.pages.dev
echo.
echo Recuerda tener el API corriendo:
echo   cd api
echo   npm run dev
echo.
pause
