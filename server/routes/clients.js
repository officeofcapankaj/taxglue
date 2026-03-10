const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/db');
const { authenticate } = require('../middleware/auth');

// Get all clients for user
router.get('/', authenticate, (req, res) => {
  try {
    const db = getDb();
    const clients = db.prepare('SELECT * FROM clients WHERE user_id = ? ORDER BY name').all(req.userId);
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single client
router.get('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();
    const client = db.prepare('SELECT * FROM clients WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create client
router.post('/', authenticate, (req, res) => {
  try {
    const { name, email, phone, address, gstin, fy } = req.body;
    const db = getDb();
    const id = uuidv4();
    
    db.prepare(`INSERT INTO clients (id, user_id, name, email, phone, address, gstin, fy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, req.userId, name, email, phone, address, gstin, fy || '2024-25');
    
    // Create default chart of accounts for client
    const defaultAccounts = [
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
    
    const insertAcc = db.prepare(`INSERT INTO accounts (id, client_id, fy, code, name, nature, account_type, opening_balance) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    defaultAccounts.forEach(acc => {
      insertAcc.run(uuidv4(), id, fy || '2024-25', acc.code, acc.name, acc.nature, acc.type, 0);
    });
    
    res.json({ id, message: 'Client created with default chart of accounts' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update client
router.put('/:id', authenticate, (req, res) => {
  try {
    const { name, email, phone, address, gstin, fy } = req.body;
    const db = getDb();
    db.prepare(`UPDATE clients SET name = ?, email = ?, phone = ?, address = ?, gstin = ?, fy = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`)
      .run(name, email, phone, address, gstin, fy, req.params.id, req.userId);
    res.json({ message: 'Client updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete client
router.delete('/:id', authenticate, (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM clients WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
