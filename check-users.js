const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'api', 'prisma', 'dev.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Consultando usuarios en la base de datos...\n');

db.all('SELECT id, email, name, role FROM User', [], (err, rows) => {
    if (err) {
        console.error('❌ Error:', err.message);
        return;
    }
    
    if (rows.length === 0) {
        console.log('⚠️  No hay usuarios registrados en el sistema.');
        console.log('ℹ️  Debes crear el primer usuario administrador desde la pantalla de login.');
    } else {
        console.log(`✅ Se encontraron ${rows.length} usuario(s):\n`);
        rows.forEach((row, index) => {
            console.log(`${index + 1}. Usuario ID: ${row.id}`);
            console.log(`   📧 Email: ${row.email}`);
            console.log(`   👤 Nombre: ${row.name}`);
            console.log(`   🔑 Rol: ${row.role}`);
            console.log('');
        });
    }
    
    db.close();
});
