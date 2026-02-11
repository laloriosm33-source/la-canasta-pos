# 🚀 La Canasta POS - Automated Deployment Helper

Write-Host "--- Iniciando Validación de Sistema ---" -ForegroundColor Cyan

# 1. Comprobar dependencias
Write-Host "📦 Verificando dependencias..."
cd admin-dashboard
npm install
cd ..
cd api
npm install
cd ..

# 2. Ejecutar Linting
Write-Host "🛡️ Ejecutando análisis de código (Lint)..."
cd admin-dashboard
npx eslint .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en Linting. Por favor corrige los errores antes de desplegar." -ForegroundColor Red
    exit
}
cd ..

# 3. Compilar Proyecto
Write-Host "🏗️ Compilando Dashboard y API..."
cd admin-dashboard
npm run build
cd ..
cd api
npm run build
cd ..

# 4. Git Sync
Write-Host "Git: Sincronizando con repositorio remoto..."
git add .
git commit -m "🚀 Deployment Auto-sync: Clean codebase, PWA support, and production optimizations"
git push origin main

Write-Host "✅ ¡Proceso completado!" -ForegroundColor Green
Write-Host "Railway y Vercel se actualizarán automáticamente en unos minutos."
Write-Host "Dashboard: https://lacanasta-erp.com"
Write-Host "API: https://lacanasta-api-h629.onrender.com/health"
