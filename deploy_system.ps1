# 🚀 La Canasta POS - Automated Deployment Helper

Write-Host "--- Iniciando Validación de Sistema ---" -ForegroundColor Cyan

# 1. Comprobar dependencias
Write-Host "📦 Verificando dependencias..."
Set-Location api
# Sincronizar schema de producción si existe
if (Test-Path "prisma\schema.prod.prisma") {
    Copy-Item "prisma\schema.prod.prisma" "prisma\schema.prisma"
}
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
git commit -m "🚀 Deployment Auto-sync: Cleanup, PWA, and production DB schema optimization"
git push origin main

Write-Host "✅ ¡Proceso completado!" -ForegroundColor Green
Write-Host "Railway y Vercel se actualizarán automáticamente en unos minutos."
Write-Host "Dashboard: https://lacanasta-erp.com"
Write-Host "API: https://lacanasta-api-h629.onrender.com/health"
