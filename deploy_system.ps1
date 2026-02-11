# 🚀 La Canasta POS - Automated Deployment Helper

Write-Host "--- Iniciando Validación de Sistema ---" -ForegroundColor Cyan

# 1. Comprobar dependencias
Write-Host "📦 Verificando dependencias..."
Set-Location api
npm install
Set-Location ..
Set-Location admin-dashboard
npm install
Set-Location ..

# 2. Ejecutar Linting
Write-Host "🛡️ Ejecutando análisis de código (Lint)..."
Set-Location admin-dashboard
npx eslint .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en Linting. Por favor corrige los errores antes de desplegar." -ForegroundColor Red
    exit
}
Set-Location ..

# 3. Compilar Proyecto
Write-Host "🏗️ Compilando Dashboard y API..."
Set-Location admin-dashboard
npm run build
Set-Location ..
Set-Location api
npm run build
Set-Location ..

# 4. Git Sync
Write-Host "Git: Sincronizando con repositorio remoto..."
git add .
git commit -m "🚀 Deployment Auto-sync: Cleanup, PWA fixes, and Full Render Config"
git push origin main

Write-Host "✅ ¡Proceso completado!" -ForegroundColor Green
Write-Host "El sistema se actualizará automáticamente en Render."
Write-Host "Dashboard: https://dashboard.render.com"
