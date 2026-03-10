/**
 * data.js – Account types, sample data, and API helpers
 */

/* ============================================================
   ACCOUNT TYPE DEFINITIONS
============================================================ */
const ACCOUNT_TYPES = [
  { value: 'current-assets',           label: 'Current Assets',             side: 'assets',      order: 1 },
  { value: 'non-current-assets',       label: 'Non-Current Assets',         side: 'assets',      order: 2 },
  { value: 'current-liabilities',      label: 'Current Liabilities',        side: 'liabilities', order: 3 },
  { value: 'non-current-liabilities',  label: 'Non-Current Liabilities',    side: 'liabilities', order: 4 },
  { value: 'equity',                   label: 'Equity',                     side: 'equity',      order: 5 },
  { value: 'revenue',                  label: 'Revenue (P&L)',              side: 'equity',      order: 6, isPL: true },
  { value: 'expense',                  label: 'Expense (P&L)',              side: 'equity',      order: 7, isPL: true },
];

/* ============================================================
   ACCOUNT HEADS / CATEGORIES
   Each account type maps to standard financial statement heads
============================================================ */
const ACCOUNT_HEADS = {
const ACCOUNT_HEADS = {
  // Current Assets Heads
  'current-assets': {
    'cash-and-cash-equivalents': { label: 'Cash and Cash Equivalents', order: 1, keywords: ['cash','bank','petty cash','money market','savings account','current account'] },
    'trade-receivables': { label: 'Trade Receivables', order: 2, keywords: ['accounts receivable','trade receivable','debtors','sundry debtor','sundry debtors','receivable','trade debtor','trade debtors','customers','clients'] },
    'other-receivables': { label: 'Other Receivables', order: 3, keywords: ['other receivables','sundry receivables','miscellaneous receivables','employee receivables','staff advance','advance to employees'] },
    'inventories': { label: 'Inventories', order: 4, keywords: ['inventory','stock','merchandise','raw material','work in progress','wip','finished goods','stores','spares','consumables'] },
    'prepayments-and-other-current-assets': { label: 'Prepayments and Other Current Assets', order: 5, keywords: ['prepaid','prepayment','advance payment','accrued income','vat receivable','input vat','current asset','short-term deposit'] },
    'short-term-investments': { label: 'Short-term Investments', order: 6, keywords: ['short-term investment','marketable securities','treasury bill','t-bill','certificate of deposit','commercial paper'] }
  },

  // Non-Current Assets Heads
  'non-current-assets': {
    'property-plant-equipment': { label: 'Property, Plant and Equipment', order: 1, keywords: ['land','building','property','plant','equipment','machinery','vehicle','furniture','fixture','leasehold'] },
    'intangible-assets': { label: 'Intangible Assets', order: 2, keywords: ['goodwill','patent','trademark','copyright','intangible','franchise'] },
    'long-term-investments': { label: 'Long-term Investments', order: 3, keywords: ['long-term investment','investment in subsidiary','investment in associate','held-to-maturity','right-of-use'] },
    'deferred-tax-assets': { label: 'Deferred Tax Assets', order: 4, keywords: ['deferred tax asset'] },
    'other-non-current-assets': { label: 'Other Non-Current Assets', order: 5, keywords: [] }
  },

  // Current Liabilities Heads
  'current-liabilities': {
    'trade-payables': { label: 'Trade Payables', order: 1, keywords: ['accounts payable','trade payable','creditors','sundry creditor','sundry creditors','trade creditor','trade creditors','suppliers','vendor payable'] },
    'other-payables': { label: 'Other Payables', order: 2, keywords: ['other payables','sundry payables','miscellaneous payables','accrued expenses','accrued liabilities','employee payables','staff dues'] },
    'accrued-expenses': { label: 'Accrued Expenses', order: 3, keywords: ['accrued expense','accrued liability','accrued salaries','accrued wages','accrued interest','outstanding expenses'] },
    'short-term-borrowings': { label: 'Short-term Borrowings', order: 4, keywords: ['short-term loan','bank overdraft','overdraft','line of credit','current portion','short-term debt'] },
    'tax-payables': { label: 'Tax Payables', order: 5, keywords: ['income tax payable','tax payable','vat payable','output vat','withholding tax','gst payable','sales tax payable'] },
    'other-current-liabilities': { label: 'Other Current Liabilities', order: 6, keywords: ['dividend payable','deferred revenue','customer deposit','provision for','provisions','current liability'] }
  },

  // Non-Current Liabilities Heads
  'non-current-liabilities': {
    'long-term-borrowings': { label: 'Long-term Borrowings', order: 1, keywords: ['long-term loan','long-term debt','bonds payable','debenture','mortgage'] },
    'lease-liabilities': { label: 'Lease Liabilities', order: 2, keywords: ['lease liability','finance lease','operating lease liability'] },
    'deferred-tax-liabilities': { label: 'Deferred Tax Liabilities', order: 3, keywords: ['deferred tax liability','deferred income tax'] },
    'retirement-benefits': { label: 'Retirement Benefits', order: 4, keywords: ['pension','retirement benefit','post-employment'] },
    'other-non-current-liabilities': { label: 'Other Non-Current Liabilities', order: 5, keywords: ['provision for'] }
  },

  // Equity Heads
  'equity': {
    'share-capital': { label: 'Share Capital', order: 1, keywords: ['share capital','common stock','ordinary share','paid-up capital','issued capital','capital stock'] },
    'retained-earnings': { label: 'Retained Earnings', order: 2, keywords: ['retained earnings','retained profit','accumulated profit','accumulated deficit'] },
    'reserves': { label: 'Reserves', order: 3, keywords: ['general reserve','statutory reserve','capital reserve','revaluation reserve','other reserve'] },
    'share-premium': { label: 'Share Premium', order: 4, keywords: ['additional paid-in','share premium','agio'] },
    'other-equity': { label: 'Other Equity', order: 5, keywords: ['treasury stock','minority interest','other comprehensive income','oci'] }
  }
};

/**
 * Classify account into specific head/category
 */
function classifyAccountHead(accountName, accountType) {
  const heads = ACCOUNT_HEADS[accountType];
  if (!heads) return 'other-' + accountType.replace('-', '-');
  
  const lower = accountName.toLowerCase().trim();
  
  // Check each head's keywords
  for (const [headKey, headData] of Object.entries(heads)) {
    for (const kw of headData.keywords) {
      if (lower.includes(kw)) return headKey;
    }
  }
  
  // Default to "other" category for the type
  return 'other-' + accountType.replace('-', '-');
}

/**
 * Get ordered list of heads for a specific account type
 */
function getOrderedHeads(accountType) {
  const heads = ACCOUNT_HEADS[accountType];
  if (!heads) return [];
  
  return Object.entries(heads)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([key, data]) => ({ key, label: data.label }));
}

/**
 * Get head suggestions for an account name
 */
function getHeadSuggestions(accountName, accountType) {
  const heads = ACCOUNT_HEADS[accountType];
  if (!heads) return [];
  
  const lower = accountName.toLowerCase().trim();
  const suggestions = [];
  
  for (const [headKey, headData] of Object.entries(heads)) {
    for (const kw of headData.keywords) {
      if (lower.includes(kw)) {
        suggestions.push({
          head: headKey,
          label: headData.label,
          match: kw
        });
      }
    }
  }
  
  return suggestions;
}
const KEYWORD_MAP = [
  // Current Assets
  { keywords: ['cash','bank','petty cash','money market','savings account','current account','bank account'], type: 'current-assets' },
  { keywords: ['accounts receivable','trade receivable','debtors','sundry debtor','sundry debtors','receivable','trade debtor','trade debtors','customers','clients','accounts receivables'], type: 'current-assets' },
  { keywords: ['other receivables','sundry receivables','miscellaneous receivables','employee receivables','staff advance','advance to employees','staff loan'], type: 'current-assets' },
  { keywords: ['inventory','stock','merchandise','raw material','work in progress','wip','finished goods','stores','spares','consumables','goods in transit'], type: 'current-assets' },
  { keywords: ['prepaid','prepayment','advance payment','prepaid expenses','current asset','short-term deposit'], type: 'current-assets' },
  { keywords: ['short-term investment','marketable securities','treasury bill','t-bill','certificate of deposit','commercial paper'], type: 'current-assets' },
  { keywords: ['accrued income','accrued revenue','interest receivable','dividend receivable'], type: 'current-assets' },
  { keywords: ['vat receivable','vat asset','input vat','gst receivable','input gst'], type: 'current-assets' },
  { keywords: ['accrued income','accrued revenue','interest receivable'], type: 'current-assets' },
  { keywords: ['vat receivable','vat asset','input vat'], type: 'current-assets' },

  // Non-Current Assets
  { keywords: ['land','building','property','plant','equipment','machinery','vehicle','furniture','fixture','leasehold'], type: 'non-current-assets' },
  { keywords: ['accumulated depreciation','depreciation'], type: 'non-current-assets' },
  { keywords: ['goodwill','patent','trademark','copyright','intangible','franchise'], type: 'non-current-assets' },
  { keywords: ['long-term investment','investment in subsidiary','investment in associate','held-to-maturity'], type: 'non-current-assets' },
  { keywords: ['right-of-use','rou asset','lease asset'], type: 'non-current-assets' },
  { keywords: ['deferred tax asset'], type: 'non-current-assets' },

  // Current Liabilities
  { keywords: ['accounts payable','trade payable','creditors','sundry creditor','sundry creditors','trade creditor','trade creditors','suppliers','vendor payable','accounts payables'], type: 'current-liabilities' },
  { keywords: ['other payables','sundry payables','miscellaneous payables','accrued expenses','accrued liabilities','employee payables','staff dues','outstanding expenses'], type: 'current-liabilities' },
  { keywords: ['short-term loan','bank overdraft','overdraft','line of credit','current portion','short-term debt','bank loan current'], type: 'current-liabilities' },
  { keywords: ['income tax payable','tax payable','vat payable','output vat','withholding tax','gst payable','sales tax payable','taxes payable'], type: 'current-liabilities' },
  { keywords: ['dividend payable','dividends payable','proposed dividend'], type: 'current-liabilities' },
  { keywords: ['deferred revenue','unearned revenue','advance receipt','customer deposit'], type: 'current-liabilities' },
  { keywords: ['customer deposit','customer advance'], type: 'current-liabilities' },

  // Non-Current Liabilities
  { keywords: ['long-term loan','long-term debt','bonds payable','debenture','mortgage'], type: 'non-current-liabilities' },
  { keywords: ['lease liability','finance lease','operating lease liability'], type: 'non-current-liabilities' },
  { keywords: ['deferred tax liability','deferred income tax'], type: 'non-current-liabilities' },
  { keywords: ['pension','retirement benefit','post-employment'], type: 'non-current-liabilities' },
  { keywords: ['provision for'], type: 'non-current-liabilities' },

  // Equity
  { keywords: ['share capital','common stock','ordinary share','paid-up capital','issued capital','capital stock'], type: 'equity' },
  { keywords: ['retained earnings','retained profit','accumulated profit','accumulated deficit'], type: 'equity' },
  { keywords: ['general reserve','statutory reserve','capital reserve','revaluation reserve','other reserve'], type: 'equity' },
  { keywords: ['additional paid-in','share premium','agio'], type: 'equity' },
  { keywords: ['treasury stock','treasury shares','buyback'], type: 'equity' },
  { keywords: ['minority interest','non-controlling interest'], type: 'equity' },
  { keywords: ['other comprehensive income','oci'], type: 'equity' },

  // Revenue
  { keywords: ['revenue','sales','turnover','income','fee income','service income','commission income','rental income','interest income','dividend income'], type: 'revenue' },

  // Expense
  { keywords: ['expense','cost of','wages','salary','rent expense','utilities','insurance expense','depreciation expense','amortisation','interest expense','tax expense','selling','administrative','general'], type: 'expense' },
];

/**
 * Auto-classify account type from account name
 */
function autoClassify(accountName) {
  const lower = accountName.toLowerCase().trim();
  for (const rule of KEYWORD_MAP) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) return rule.type;
    }
  }
  return 'current-assets'; // default
}

/* ============================================================
   SAMPLE DATA
============================================================ */
const SAMPLE_TRIAL_BALANCE = [
  { code: '1001', name: 'Cash and Cash Equivalents',       type: 'current-assets',          debit: 125000, credit: 0 },
  { code: '1002', name: 'Sundry Debtors',                  type: 'current-assets',          debit: 87500,  credit: 0 },
  { code: '1003', name: 'Accounts Receivable - Trade',     type: 'current-assets',          debit: 45000,  credit: 0 },
  { code: '1004', name: 'Inventory',                         type: 'current-assets',          debit: 60000,  credit: 0 },
  { code: '1005', name: 'Prepaid Expenses',                type: 'current-assets',          debit: 12000,  credit: 0 },
  { code: '1006', name: 'Other Receivables',               type: 'current-assets',          debit: 8000,   credit: 0 },
  { code: '1101', name: 'Land & Building',                 type: 'non-current-assets',      debit: 500000, credit: 0 },
  { code: '1102', name: 'Plant & Equipment',                 type: 'non-current-assets',      debit: 250000, credit: 0 },
  { code: '1103', name: 'Accumulated Depreciation',        type: 'non-current-assets',      debit: 0,      credit: 80000 },
  { code: '1201', name: 'Goodwill',                        type: 'non-current-assets',      debit: 50000,  credit: 0 },
  { code: '2001', name: 'Sundry Creditors',                type: 'current-liabilities',     debit: 0,      credit: 45000 },
  { code: '2002', name: 'Accounts Payable - Trade',        type: 'current-liabilities',     debit: 0,      credit: 18000 },
  { code: '2003', name: 'Other Payables',                  type: 'current-liabilities',     debit: 0,      credit: 12000 },
  { code: '2004', name: 'Accrued Expenses',                type: 'current-liabilities',     debit: 0,      credit: 18000 },
  { code: '2005', name: 'Short-Term Loan',                 type: 'current-liabilities',     debit: 0,      credit: 35000 },
  { code: '2006', name: 'Income Tax Payable',              type: 'current-liabilities',     debit: 0,      credit: 15000 },
  { code: '2101', name: 'Long-Term Loan',                  type: 'non-current-liabilities', debit: 0,      credit: 200000 },
  { code: '2102', name: 'Deferred Tax Liability',          type: 'non-current-liabilities', debit: 0,      credit: 12000 },
  { code: '3001', name: 'Share Capital',                   type: 'equity',                  debit: 0,      credit: 400000 },
  { code: '3002', name: 'Retained Earnings',                 type: 'equity',                  debit: 0,      credit: 180000 },
  { code: '3003', name: 'General Reserve',                 type: 'equity',                  debit: 0,      credit: 50000 },
  { code: '4001', name: 'Revenue',                           type: 'revenue',                 debit: 0,      credit: 350000 },
  { code: '5001', name: 'Cost of Goods Sold',              type: 'expense',                 debit: 210000, credit: 0 },
  { code: '5002', name: 'Salaries Expense',                type: 'expense',                 debit: 60000,  credit: 0 },
  { code: '5003', name: 'Rent Expense',                    type: 'expense',                 debit: 18000,  credit: 0 },
  { code: '5004', name: 'Depreciation Expense',            type: 'expense',                 debit: 24000,  credit: 0 },
  { code: '5005', name: 'Interest Expense',                type: 'expense',                 debit: 12000,  credit: 0 },
  { code: '5006', name: 'Income Tax Expense',              type: 'expense',                 debit: 16500,  credit: 0 },
];

/* ============================================================
   API HELPERS
============================================================ */
const API = {
  async listSheets(page = 1, limit = 50) {
    const res = await fetch(`tables/balance_sheets?page=${page}&limit=${limit}&sort=created_at`);
    return res.json();
  },
  async getSheet(id) {
    const res = await fetch(`tables/balance_sheets/${id}`);
    return res.json();
  },
  async createSheet(data) {
    const res = await fetch('tables/balance_sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateSheet(id, data) {
    const res = await fetch(`tables/balance_sheets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteSheet(id) {
    await fetch(`tables/balance_sheets/${id}`, { method: 'DELETE' });
  }
};

/* ============================================================
   UTILITY HELPERS
============================================================ */
function formatCurrency(amount, currency = 'USD', compact = false) {
  const opts = {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  const formatted = new Intl.NumberFormat('en-US', opts).format(Math.abs(amount));
  const symbol = CURRENCY_SYMBOLS[currency] || currency + ' ';
  return symbol + formatted;
}

const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', NGN: '₦', KES: 'KSh ',
  ZAR: 'R ', GHS: 'GH₵', INR: '₹', CAD: 'CA$', AUD: 'A$',
  JPY: '¥', CNY: '¥'
};

function generateId() {
  return 'iq_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function today() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
