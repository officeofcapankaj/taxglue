/**
 * Seed Demo Data Script
 * Run: node server/seedDemo.js
 */

const { getDb } = require('./database/db');
const { v4: uuidv4 } = require('uuid');

const db = getDb();
const userId = 'demo-user';
const fy = '2024-25';

console.log('Seeding demo data...');

// Create demo user
db.prepare(`INSERT OR IGNORE INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)`)
  .run(userId, 'demo@taxglue.com', 'demo', 'Demo User', 'user');

// Create demo client
const clientId = uuidv4();
db.prepare(`INSERT OR IGNORE INTO clients (id, user_id, name, email, phone, address, gstin, fy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
  .run(clientId, userId, 'Singla Steel Corporation', 'info@singlasteel.com', '9876543210', '123 Industrial Area, Mumbai', '27AAECS1234A1Z1', fy);

// Insert default accounts
const accounts = [
  { code: '001', name: 'Capital Account', nature: 'Liabilities', type: 'Capital' },
  { code: '002', name: 'Cash in Hand', nature: 'Assets', type: 'Direct' },
  { code: '003', name: 'Cash at Bank', nature: 'Assets', type: 'Direct' },
  { code: '004', name: 'Sundry Debtors', nature: 'Assets', type: 'Direct' },
  { code: '005', name: 'Sundry Creditors', nature: 'Liabilities', type: 'Direct' },
  { code: '006', name: 'Sales', nature: 'Income', type: 'Revenue' },
  { code: '007', name: 'Purchase', nature: 'Expense', type: 'Direct' },
  { code: '008', name: 'Salaries', nature: 'Expense', type: 'Direct' },
  { code: '009', name: 'Rent', nature: 'Expense', type: 'Indirect' },
  { code: '010', name: 'Interest Received', nature: 'Income', type: 'Revenue' }
];

accounts.forEach(acc => {
  db.prepare(`INSERT OR IGNORE INTO accounts (id, client_id, fy, code, name, nature, account_type, opening_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(uuidv4(), clientId, fy, acc.code, acc.name, acc.nature, acc.type, 0);
});

console.log('✓ Created demo user:', userId);
console.log('✓ Created client:', clientId);

// Get client to get the ID
const client = db.prepare('SELECT * FROM clients WHERE name = ?').get('Singla Steel Corporation');
console.log('Client ID:', client?.id);

// Test creating a voucher
const voucherId = uuidv4();
db.prepare(`INSERT OR IGNORE INTO vouchers (id, client_id, fy, date, voucher_no, voucher_type, narration, lines) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
  .run(voucherId, client.id, fy, '2024-04-01', '0001', 'Payment', 'Test payment to vendor', JSON.stringify([
    { account_id: '002', party: '', debit: 10000, credit: 0 },
    { account_id: '005', party: 'ABC Suppliers', debit: 0, credit: 10000 }
  ]));

console.log('✓ Created test voucher:', voucherId);
console.log('\nDemo data seeded successfully!');
console.log('Client ID for testing:', client?.id);