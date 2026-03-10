const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '../../data/taxglue.db');
let db = null;

function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

async function initDatabase() {
  const database = getDb();
  
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      gstin TEXT,
      fy TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      fy TEXT NOT NULL,
      code TEXT,
      name TEXT NOT NULL,
      nature TEXT NOT NULL,
      account_type TEXT,
      opening_balance REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      UNIQUE(client_id, fy, name)
    );

    CREATE TABLE IF NOT EXISTS vouchers (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      fy TEXT NOT NULL,
      date TEXT NOT NULL,
      voucher_no TEXT NOT NULL,
      voucher_type TEXT NOT NULL,
      narration TEXT,
      lines TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      UNIQUE(client_id, fy, voucher_no)
    );

    CREATE TABLE IF NOT EXISTS trial_balance (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      fy TEXT NOT NULL,
      data TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      UNIQUE(client_id, fy)
    );

    CREATE INDEX IF NOT EXISTS idx_accounts_client_fy ON accounts(client_id, fy);
    CREATE INDEX IF NOT EXISTS idx_vouchers_client_fy ON vouchers(client_id, fy);
    CREATE INDEX IF NOT EXISTS idx_vouchers_date ON vouchers(date);
    CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);
  `);

  const adminExists = database.prepare('SELECT id FROM users WHERE email = ?').get('admin@taxglue.com');
  if (!adminExists) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    database.prepare(`INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)`)
      .run(uuidv4(), 'admin@taxglue.com', hashedPassword, 'Admin', 'admin');
    console.log('Default admin: admin@taxglue.com / admin123');
  }

  console.log('Database initialized!');
  return database;
}

module.exports = { getDb, initDatabase };
