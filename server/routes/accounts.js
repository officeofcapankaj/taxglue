const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/db');
const { authenticate } = require('../middleware/auth');

// Get all accounts for a client
router.get('/:clientId', authenticate, (req, res) => {
  try {
    const { clientId } = req.params;
    const { fy } = req.query;
    const db = getDb();
    
    let query = 'SELECT * FROM accounts WHERE client_id = ?';
    const params = [clientId];
    
    if (fy) {
      query += ' AND fy = ?';
      params.push(fy);
    }
    
    query += ' ORDER BY code';
    
    const accounts = db.prepare(query).all(...params);
    res.json(accounts.map(a => ({ ...a, lines: JSON.parse(a.lines || '[]') })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create account
router.post('/', authenticate, (req, res) => {
  try {
    const { client_id, fy, code, name, nature, account_type, opening_balance } = req.body;
    const db = getDb();
    const id = uuidv4();
    
    db.prepare(`INSERT INTO accounts (id, client_id, fy, code, name, nature, account_type, opening_balance) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, client_id, fy, code, name, nature, account_type, opening_balance || 0);
    
    res.json({ id, message: 'Account created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update account
router.put('/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, nature, account_type, opening_balance } = req.body;
    const db = getDb();
    
    db.prepare(`UPDATE accounts SET code = ?, name = ?, nature = ?, account_type = ?, opening_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(code, name, nature, account_type, opening_balance, id);
    
    res.json({ message: 'Account updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete account
router.delete('/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    db.prepare('DELETE FROM accounts WHERE id = ?').run(id);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get account by ID
router.get('/:clientId/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(id);
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
