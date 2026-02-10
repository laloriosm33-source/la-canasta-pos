const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando Build para Render...');

// 1. Copiar Schema de Producción
try {
    const source = path.join(__dirname, '../prisma/schema.prod.prisma');
    const dest = path.join(__dirname, '../prisma/schema.prisma');
    
    if (fs.existsSync(source)) {
        fs.copyFileSync(source, dest);
        console.log('✅ Schema de producción copiado.');
    } else {
        console.warn('⚠️ No se encontró schema.prod.prisma, usando schema.prisma existente.');
    }
} catch (error) {
    console.error('❌ Error copiando schema:', error.message);
    process.exit(1);
}

// 2. Generar Cliente Prisma
try {
    console.log('🔄 Generando cliente Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Cliente Prisma generado.');
} catch (error) {
    console.error('❌ Error generando cliente:', error.message);
    process.exit(1);
}

console.log('🎉 Build completado con éxito.');
