const jwt = require('jsonwebtoken');
const { getDb } = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'taxglue-secret-key-2024';

// Demo mode bypass for testing
const DEMO_MODE = process.env.DEMO_MODE !== 'false';

function authenticate(req, res, next) {
  // Allow demo mode without authentication
  if (DEMO_MODE) {
    req.userId = 'demo-user';
    req.user = { id: 'demo-user', email: 'demo@taxglue.com', name: 'Demo User', role: 'user' };
    return next();
  }
  
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDb();
    const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(decoded.userId);
    
    if (!user) return res.status(401).json({ error: 'User not found' });
    
    req.userId = user.id;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authenticate };
