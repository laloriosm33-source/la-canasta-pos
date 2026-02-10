const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando construcción profesional...');

// 1. Preparar el Schema
try {
    const source = path.resolve(__dirname, '../prisma/schema.prod.prisma');
    const dest = path.resolve(__dirname, '../prisma/schema.prisma');
    
    if (fs.existsSync(source)) {
        fs.copyFileSync(source, dest);
        console.log('✅ Base de datos configurada para producción.');
    }
} catch (e) {
    console.error('❌ Error configurando base de datos:', e.message);
    process.exit(1);
}

// 2. Generar Cliente (Usando la ruta directa al código de Prisma para evitar bloqueos)
try {
    console.log('🔄 Generando motor de datos...');
    const prismaBin = path.resolve(__dirname, '../node_modules/prisma/build/index.js');
    execSync(`node ${prismaBin} generate`, { stdio: 'inherit' });
    console.log('✅ Motor de datos listo.');
} catch (e) {
    console.error('❌ Error en motor de datos:', e.message);
    process.exit(1);
}

console.log('🎉 Construcción finalizada.');
