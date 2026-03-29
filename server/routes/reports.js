const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');
const { authenticate } = require('../middleware/auth');

// Trial Balance
router.get('/trial-balance/:clientId', authenticate, (req, res) => {
  try {
    const { clientId } = req.params;
    const { fy } = req.query;
    const db = getDb();
    
    // Get all accounts with their balances
    const accounts = db.prepare('SELECT * FROM accounts WHERE client_id = ? AND fy = ?').all(clientId, fy || '2024-25');
    
    // Get all vouchers
    const vouchers = db.prepare('SELECT * FROM vouchers WHERE client_id = ? AND fy = ?').all(clientId, fy || '2024-25');
    
    // Calculate balances
    const accountBalances = {};
    accounts.forEach(acc => {
      accountBalances[acc.id] = {
        code: acc.code,
        name: acc.name,
        nature: acc.nature,
        opening: acc.opening_balance || 0,
        debit: 0,
        credit: 0,
        closing: acc.opening_balance || 0
      };
    });
    
    vouchers.forEach(v => {
      const lines = JSON.parse(v.lines || '[]');
      lines.forEach(line => {
        if (accountBalances[line.account_id]) {
          if (line.debit > 0) {
            accountBalances[line.account_id].debit += line.debit;
            accountBalances[line.account_id].closing += line.debit;
          }
          if (line.credit > 0) {
            accountBalances[line.account_id].credit += line.credit;
            accountBalances[line.account_id].closing -= line.credit;
          }
        }
      });
    });
    
    // Convert to array and calculate totals
    const result = Object.values(accountBalances);
    const totals = result.reduce((acc, item) => ({
      opening: acc.opening + item.opening,
      debit: acc.debit + item.debit,
      credit: acc.credit + item.credit,
      closing: acc.closing + item.closing
    }), { opening: 0, debit: 0, credit: 0, closing: 0 });
    
    res.json({ accounts: result, totals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Balance Sheet
router.get('/balance-sheet/:clientId', authenticate, (req, res) => {
  try {
    const { clientId } = req.params;
    const { fy } = req.query;
    const db = getDb();
    
    const accounts = db.prepare('SELECT * FROM accounts WHERE client_id = ? AND fy = ?').all(clientId, fy || '2024-25');
    const vouchers = db.prepare('SELECT * FROM vouchers WHERE client_id = ? AND fy = ?').all(clientId, fy || '2024-25');
    
    // Calculate balances by nature
    const balances = {};
    accounts.forEach(acc => { balances[acc.id] = { ...acc, balance: acc.opening_balance || 0 }; });
    
    vouchers.forEach(v => {
      const lines = JSON.parse(v.lines || '[]');
      lines.forEach(line => {
        if (balances[line.account_id]) {
          if (line.debit > 0) balances[line.account_id].balance += line.debit;
          if (line.credit > 0) balances[line.account_id].balance -= line.credit;
        }
      });
    });
    
    const assets = Object.values(balances).filter(a => a.nature === 'Assets').reduce((s, a) => s + a.balance, 0);
    const liabilities = Object.values(balances).filter(a => a.nature === 'Liabilities').reduce((s, a) => s + a.balance, 0);
    const income = Object.values(balances).filter(a => a.nature === 'Income').reduce((s, a) => s + a.balance, 0);
    const expenses = Object.values(balances).filter(a => a.nature === 'Expense').reduce((s, a) => s + a.balance, 0);
    
    res.json({
      assets: Object.values(balances).filter(a => a.nature === 'Assets'),
      liabilities: Object.values(balances).filter(a => a.nature === 'Liabilities'),
      income: Object.values(balances).filter(a => a.nature === 'Income'),
      expenses: Object.values(balances).filter(a => a.nature === 'Expense'),
      totals: { assets, liabilities: liabilities + income - expenses, income, expenses }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Profit & Loss Statement
router.get('/profit-loss/:clientId', authenticate, (req, res) => {
  try {
    const { clientId } = req.params;
    const { fy } = req.query;
    const db = getDb();
    
    const accounts = db.prepare('SELECT * FROM accounts WHERE client_id = ? AND fy = ?').all(clientId, fy || '2024-25');
    const vouchers = db.prepare('SELECT * FROM vouchers WHERE client_id = ? AND fy = ?').all(clientId, fy || '2024-25');
    
    const balances = {};
    accounts.forEach(acc => { balances[acc.id] = { ...acc, balance: acc.opening_balance || 0 }; });
    
    vouchers.forEach(v => {
      const lines = JSON.parse(v.lines || '[]');
      lines.forEach(line => {
        if (balances[line.account_id]) {
          if (line.debit > 0) balances[line.account_id].balance += line.debit;
          if (line.credit > 0) balances[line.account_id].balance -= line.credit;
        }
      });
    });
    
    const incomeList = Object.values(balances).filter(a => a.nature === 'Income');
    const expenseList = Object.values(balances).filter(a => a.nature === 'Expense');
    
    const totalIncome = incomeList.reduce((s, a) => s + a.balance, 0);
    const totalExpenses = expenseList.reduce((s, a) => s + a.balance, 0);
    const netProfit = totalIncome - totalExpenses;
    
    res.json({ income: incomeList, expenses: expenseList, totalIncome, totalExpenses, netProfit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================
// DRILL-DOWN ENDPOINTS
// ======================

// Get vouchers by account ID (for drill-down)
router.get('/vouchers/by-account/:accountId', authenticate, (req, res) => {
  try {
    const { accountId } = req.params;
    const { fy, startDate, endDate, voucherType } = req.query;
    const db = getDb();
    
    // Build query
    let query = `
      SELECT v.id, v.date, v.voucher_no, v.voucher_type, v.narration, v.lines
      FROM vouchers v
      WHERE v.fy = ?
    `;
    const params = [fy || '2024-25'];
    
    if (startDate) {
      query += ' AND v.date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND v.date <= ?';
      params.push(endDate);
    }
    if (voucherType) {
      query += ' AND v.voucher_type = ?';
      params.push(voucherType);
    }
    
    query += ' ORDER BY v.date DESC';
    
    const vouchers = db.prepare(query).all(...params);
    
    // Filter vouchers that contain the account in their lines
    const result = vouchers.filter(v => {
      const lines = JSON.parse(v.lines || '[]');
      return lines.some(line => line.account_id === accountId);
    }).map(v => {
      const lines = JSON.parse(v.lines || '[]');
      const accountLines = lines.filter(line => line.account_id === accountId);
      return {
        id: v.id,
        date: v.date,
        voucher_no: v.voucher_no,
        voucher_type: v.voucher_type,
        narration: v.narration,
        debit: accountLines.reduce((s, l) => s + (l.debit || 0), 0),
        credit: accountLines.reduce((s, l) => s + (l.credit || 0), 0)
      };
    });
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single voucher details (for drill-down level 2)
router.get('/vouchers/:voucherId', authenticate, (req, res) => {
  try {
    const { voucherId } = req.params;
    const db = getDb();
    
    const voucher = db.prepare(`
      SELECT v.*, c.name as client_name
      FROM vouchers v
      LEFT JOIN clients c ON v.client_id = c.id
      WHERE v.id = ?
    `).get(voucherId);
    
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }
    
    // Parse lines with account details
    const lines = JSON.parse(voucher.lines || '[]');
    const accountIds = lines.map(l => l.account_id);
    
    if (accountIds.length > 0) {
      const accounts = db.prepare(`
        SELECT id, code, name, nature FROM accounts WHERE id IN (${accountIds.map(() => '?').join(',')})
      `).all(...accountIds);
      
      const accountMap = {};
      accounts.forEach(a => { accountMap[a.id] = a; });
      
      // Enrich lines with account details
      voucher.lines = lines.map(line => ({
        ...line,
        account_code: accountMap[line.account_id]?.code,
        account_name: accountMap[line.account_id]?.name,
        account_nature: accountMap[line.account_id]?.nature
      }));
    }
    
    res.json(voucher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
