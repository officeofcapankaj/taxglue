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

module.exports = router;
