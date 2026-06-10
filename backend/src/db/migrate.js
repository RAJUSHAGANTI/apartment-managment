require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

const migrationsDir = path.join(__dirname, 'migrations');

function runMigrations() {
  // Ensure migrations tracking table exists first
  db.exec(`CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  const applied = new Set(
    db.prepare('SELECT name FROM migrations').all().map(r => r.name)
  );

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const insertMigration = db.prepare('INSERT INTO migrations (name) VALUES (?)');

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  skipped: ${file}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    db.exec(sql);
    insertMigration.run(file);
    console.log(`  applied: ${file}`);
  }

  console.log('Migrations complete.');
}

runMigrations();
