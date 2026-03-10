const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/db');
const { authenticate } = require('../middleware/auth');

// Get all vouchers for a client
router.get('/:clientId', authenticate, (req, res) => {
  try {
    const { clientId } = req.params;
    const { fy, type, startDate, endDate } = req.query;
    const db = getDb();
    
    let query = 'SELECT * FROM vouchers WHERE client_id = ?';
    const params = [clientId];
    
    if (fy) { query += ' AND fy = ?'; params.push(fy); }
    if (type) { query += ' AND voucher_type = ?'; params.push(type); }
    if (startDate) { query += ' AND date >= ?'; params.push(startDate); }
    if (endDate) { query += ' AND date <= ?'; params.push(endDate); }
    
    query += ' ORDER BY date DESC, voucher_no DESC';
    
    const vouchers = db.prepare(query).all(...params);
    res.json(vouchers.map(v => ({ ...v, lines: JSON.parse(v.lines || '[]') })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get voucher by ID
router.get('/:clientId/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(id);
    if (!voucher) return res.status(404).json({ error: 'Voucher not found' });
    res.json({ ...voucher, lines: JSON.parse(voucher.lines || '[]') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create voucher
router.post('/', authenticate, (req, res) => {
  try {
    const { client_id, fy, date, voucher_no, voucher_type, narration, lines } = req.body;
    const db = getDb();
    const id = uuidv4();
    
    db.prepare(`INSERT INTO vouchers (id, client_id, fy, date, voucher_no, voucher_type, narration, lines) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, client_id, fy, date, voucher_no, voucher_type, narration, JSON.stringify(lines || []));
    
    res.json({ id, message: 'Voucher created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update voucher
router.put('/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const { date, voucher_no, voucher_type, narration, lines } = req.body;
    const db = getDb();
    
    db.prepare(`UPDATE vouchers SET date = ?, voucher_no = ?, voucher_type = ?, narration = ?, lines = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(date, voucher_no, voucher_type, narration, JSON.stringify(lines || []), id);
    
    res.json({ message: 'Voucher updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete voucher
router.delete('/:id', authenticate, (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    db.prepare('DELETE FROM vouchers WHERE id = ?').run(id);
    res.json({ message: 'Voucher deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get next voucher number
router.get('/:clientId/next-voucher-no/:type', authenticate, (req, res) => {
  try {
    const { clientId, type } = req.params;
    const { fy } = req.query;
    const db = getDb();
    
    const result = db.prepare(`SELECT voucher_no FROM vouchers WHERE client_id = ? AND voucher_type = ? AND fy = ? ORDER BY voucher_no DESC LIMIT 1`)
      .get(clientId, type, fy || '2024-25');
    
    let nextNo = 1;
    if (result) {
      const lastNo = parseInt(result.voucher_no) || 0;
      nextNo = lastNo + 1;
    }
    
    res.json({ voucher_no: String(nextNo).padStart(4, '0') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
