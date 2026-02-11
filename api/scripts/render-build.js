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

// 2. Generar Cliente y Sincronizar Base de Datos
try {
    console.log('🔄 Generando motor de datos y sincronizando esquema...');
    const prismaBin = path.resolve(__dirname, '../node_modules/prisma/build/index.js');
    
    // Generar cliente
    execSync(`node ${prismaBin} generate`, { stdio: 'inherit' });
    
    // Ejecutar migraciones solo si hay una DATABASE_URL
    if (process.env.DATABASE_URL) {
        console.log('📡 Aplicando cambios en la base de datos remota...');
        execSync(`node ${prismaBin} migrate deploy`, { stdio: 'inherit' });
        
        console.log('🌱 Creando usuario administrador inicial...');
        try {
            execSync(`node scripts/seed-admin.js`, { stdio: 'inherit' });
            console.log('✅ Usuario admin listo.');
        } catch (seedErr) {
            console.log('⚠️ Aviso: El usuario admin ya existe o no se pudo crear (esto es normal si ya existe).');
        }
    }
    
    console.log('✅ Base de datos y motor listos.');
} catch (e) {
    console.error('❌ Error en motor de datos o migraciones:', e.message);
    process.exit(1);
}

console.log('🎉 Construcción finalizada.');
