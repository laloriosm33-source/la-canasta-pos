const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const db = new Database(dbPath);

// Get all tables
const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' 
  AND name NOT LIKE 'sqlite_%'
  AND name NOT LIKE '_prisma_%'
`).all();

let sqlDump = '-- La Canasta ERP Database Dump\n';
sqlDump += '-- Generated: ' + new Date().toISOString() + '\n\n';

// For each table, get schema and data
tables.forEach(({ name }) => {
  console.log(`Exporting table: ${name}`);
  
  // Get CREATE TABLE statement
  const schema = db.prepare(`
    SELECT sql FROM sqlite_master 
    WHERE type='table' AND name=?
  `).get(name);
  
  if (schema && schema.sql) {
    sqlDump += '\n-- Table: ' + name + '\n';
    sqlDump += schema.sql + ';\n\n';
    
    // Get all data
    const rows = db.prepare(`SELECT * FROM "${name}"`).all();
    
    if (rows.length > 0) {
      rows.forEach(row => {
        const columns = Object.keys(row);
        const values = columns.map(col => {
          const val = row[col];
          if (val === null) return 'NULL';
          if (typeof val === 'number') return val;
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
          return `'${val}'`;
        });
        
        sqlDump += `INSERT INTO "${name}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
      });
      sqlDump += '\n';
    }
  }
});

// Write to file
fs.writeFileSync(path.join(__dirname, 'full_database.sql'), sqlDump);
console.log('\n✅ Database exported successfully to full_database.sql');
console.log(`📊 Exported ${tables.length} tables`);

db.close();
