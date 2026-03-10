/**
 * balanceSheet.js – Generate and render the Balance Sheet from Trial Balance
 */

/* ============================================================
   GENERATE BALANCE SHEET DATA
============================================================ */
function generateBalanceSheet(rows, meta) {
  // Separate P&L accounts from Balance Sheet accounts
  const plRows = rows.filter(r => r.type === 'revenue' || r.type === 'expense');
  const bsRows = rows.filter(r => r.type !== 'revenue' && r.type !== 'expense');

  // Compute net P&L (Net Income = Revenue – Expenses)
  let totalRevenue = 0, totalExpense = 0;
  plRows.forEach(r => {
    // Revenue: normally credit balance
    if (r.type === 'revenue') totalRevenue += (r.credit - r.debit);
    // Expense: normally debit balance
    if (r.type === 'expense') totalExpense += (r.debit - r.credit);
  });
  const netIncome = totalRevenue - totalExpense;

  // Group BS rows by type and then by heads
  const groups = {
    'current-assets': {},
    'non-current-assets': {},
    'current-liabilities': {},
    'non-current-liabilities': {},
    'equity': {},
  };

  // Initialize heads for each type
  Object.keys(groups).forEach(type => {
    const heads = getOrderedHeads(type);
    heads.forEach(head => {
      groups[type][head.key] = [];
    });
    // Add "other" category
    groups[type]['other-' + type] = [];
  });

  // Classify each row into appropriate head
  bsRows.forEach(r => {
    const head = classifyAccountHead(r.name, r.type);
    if (groups[r.type] && groups[r.type][head]) {
      groups[r.type][head].push(r);
    } else if (groups[r.type]) {
      groups[r.type]['other-' + r.type].push(r);
    }
  });

  // Compute balances per row
  function getBalance(row, side) {
    // Assets: debit is positive (debit – credit)
    // Liabilities/Equity: credit is positive (credit – debit)
    if (side === 'assets') return (row.debit || 0) - (row.credit || 0);
    return (row.credit || 0) - (row.debit || 0);
  }

  // Compute subtotals by heads and totals
  const headSubtotals = {};
  const typeSubtotals = {};

  // Calculate subtotals for each head
  Object.keys(groups).forEach(type => {
    headSubtotals[type] = {};
    typeSubtotals[type] = 0;
    
    Object.keys(groups[type]).forEach(head => {
      headSubtotals[type][head] = groups[type][head].reduce((s, r) => s + getBalance(r, type === 'current-assets' || type === 'non-current-assets' ? 'assets' : type === 'equity' ? 'equity' : 'liabilities'), 0);
      typeSubtotals[type] += headSubtotals[type][head];
    });
  });

  const subCA  = typeSubtotals['current-assets'];
  const subNCA = typeSubtotals['non-current-assets'];
  const subCL  = typeSubtotals['current-liabilities'];
  const subNCL = typeSubtotals['non-current-liabilities'];
  const subEQ  = typeSubtotals['equity'];

  const totalAssets      = subCA + subNCA;
  const totalLiabilities = subCL + subNCL;
  // Net income added to equity
  const totalEquity      = subEQ + netIncome;
  const totalLiabEquity  = totalLiabilities + totalEquity;

  const isBalanced = Math.abs(totalAssets - totalLiabEquity) < 0.01;

  return {
    meta,
    groups,
    headSubtotals,
    typeSubtotals,
    plRows,
    netIncome,
    totalRevenue,
    totalExpense,
    subCA, subNCA, subCL, subNCL, subEQ,
    totalAssets,
    totalLiabilities,
    totalEquity,
    totalLiabEquity,
    isBalanced,
    currency: meta.currency || 'USD',
    getBalance,
  };
}

/* ============================================================
   RENDER BALANCE SHEET HTML
============================================================ */
function renderBalanceSheet(bs) {
  const { meta, groups, headSubtotals, currency } = bs;
  const fmt = (n) => formatCurrency(n, currency);
  const fmtRow = (row, side) => fmt(bs.getBalance(row, side));

  const hasPL = bs.plRows.length > 0;

  // Helper to render accounts grouped by heads
  const renderHeads = (type, side = 'assets') => {
    const heads = getOrderedHeads(type);
    let html = '';
    
    heads.forEach(head => {
      const headKey = head.key;
      const accounts = groups[type][headKey] || [];
      const headTotal = headSubtotals[type][headKey] || 0;
      
      if (accounts.length > 0) {
        html += `
          <div class="bs-head-section">
            <div class="bs-head-title">${head.label}</div>
            ${accounts.map(r => `
              <div class="bs-line">
                <span class="bs-line-name">${esc(r.name)}${r.code ? ` <small style="color:var(--text-light)">(${esc(r.code)})</small>` : ''}</span>
                <span class="bs-line-amount">${fmtRow(r, side)}</span>
              </div>`).join('')}
            <div class="bs-head-subtotal">
              <span>Total ${head.label}</span>
              <span>${fmt(headTotal)}</span>
            </div>
          </div>`;
      }
    });
    
    // Handle "other" category
    const otherKey = 'other-' + type;
    const otherAccounts = groups[type][otherKey] || [];
    if (otherAccounts.length > 0) {
      const otherTotal = headSubtotals[type][otherKey] || 0;
      html += `
        <div class="bs-head-section">
          <div class="bs-head-title">Other</div>
          ${otherAccounts.map(r => `
            <div class="bs-line">
              <span class="bs-line-name">${esc(r.name)}${r.code ? ` <small style="color:var(--text-light)">(${esc(r.code)})</small>` : ''}</span>
              <span class="bs-line-amount">${fmtRow(r, side)}</span>
            </div>`).join('')}
          <div class="bs-head-subtotal">
            <span>Total Other</span>
            <span>${fmt(otherTotal)}</span>
          </div>
        </div>`;
    }
    
    return html;
  };

  const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  document.getElementById('bsDocument').innerHTML = `
    <div class="bs-doc-header">
      <div class="bs-company-name">${esc(meta.companyName)}</div>
      ${meta.regNumber ? `<div class="bs-company-reg">Reg. No. ${esc(meta.regNumber)}</div>` : ''}
      <div class="bs-title">${esc(meta.title || 'STATEMENT OF FINANCIAL POSITION')}</div>
      <div class="bs-period">As at ${formatDate(meta.periodEnd)}</div>
      <div class="bs-period" style="margin-top:4px;font-size:12px;color:var(--text-light)">
        (All amounts in ${currency})
      </div>
    </div>

    <hr class="bs-divider"/>

    <!-- BALANCE VALIDITY BADGE -->
    <div style="text-align:center;margin-bottom:24px;">
      <span class="bs-validity ${bs.isBalanced ? 'bs-valid' : 'bs-invalid'}">
        <i class="fas ${bs.isBalanced ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
        ${bs.isBalanced ? 'Balance Sheet Balances ✓' : 'WARNING: Balance Sheet Does Not Balance!'}
      </span>
    </div>

    <!-- TWO-COLUMN LAYOUT -->
    <div class="bs-two-col">

      <!-- LEFT: ASSETS -->
      <div class="bs-col">
        <div class="bs-col-title"><i class="fas fa-landmark"></i> &nbsp;Assets</div>

        <!-- Current Assets -->
        <div class="bs-section">
          <div class="bs-section-title">Current Assets</div>
          ${renderHeads('current-assets') || '<div class="bs-line" style="color:var(--text-light);font-style:italic;"><span>No current assets</span><span>-</span></div>'}
          <div class="bs-subtotal">
            <span class="bs-subtotal-name">Total Current Assets</span>
            <span class="bs-subtotal-amount">${fmt(bs.subCA)}</span>
          </div>
        </div>

        <!-- Non-Current Assets -->
        <div class="bs-section">
          <div class="bs-section-title">Non-Current Assets</div>
          ${renderHeads('non-current-assets') || '<div class="bs-line" style="color:var(--text-light);font-style:italic;"><span>No non-current assets</span><span>-</span></div>'}
          <div class="bs-subtotal">
            <span class="bs-subtotal-name">Total Non-Current Assets</span>
            <span class="bs-subtotal-amount">${fmt(bs.subNCA)}</span>
          </div>
        </div>

        <div class="bs-total">
          <span class="bs-total-name">TOTAL ASSETS</span>
          <span class="bs-total-amount">${fmt(bs.totalAssets)}</span>
        </div>
      </div>

      <!-- RIGHT: LIABILITIES & EQUITY -->
      <div class="bs-col">
        <div class="bs-col-title"><i class="fas fa-file-invoice-dollar"></i> &nbsp;Liabilities &amp; Equity</div>

        <!-- Current Liabilities -->
        <div class="bs-section">
          <div class="bs-section-title">Current Liabilities</div>
          ${renderHeads('current-liabilities') || '<div class="bs-line" style="color:var(--text-light);font-style:italic;"><span>No current liabilities</span><span>-</span></div>'}
          <div class="bs-subtotal">
            <span class="bs-subtotal-name">Total Current Liabilities</span>
            <span class="bs-subtotal-amount">${fmt(bs.subCL)}</span>
          </div>
        </div>

        <!-- Non-Current Liabilities -->
        <div class="bs-section">
          <div class="bs-section-title">Non-Current Liabilities</div>
          ${renderHeads('non-current-liabilities') || '<div class="bs-line" style="color:var(--text-light);font-style:italic;"><span>No non-current liabilities</span><span>-</span></div>'}
          <div class="bs-subtotal">
            <span class="bs-subtotal-name">Total Non-Current Liabilities</span>
            <span class="bs-subtotal-amount">${fmt(bs.subNCL)}</span>
          </div>
        </div>

        <div class="bs-subtotal" style="border-top:2px solid var(--border);padding-top:10px;">
          <span class="bs-subtotal-name" style="font-weight:700;">TOTAL LIABILITIES</span>
          <span class="bs-subtotal-amount" style="font-weight:700;">${fmt(bs.totalLiabilities)}</span>
        </div>

        <!-- Equity -->
        <div class="bs-section" style="margin-top:20px;">
          <div class="bs-section-title">Shareholders' Equity</div>
          ${renderHeads('equity') || '<div class="bs-line" style="color:var(--text-light);font-style:italic;"><span>No equity entries</span><span>-</span></div>'}

          ${hasPL ? `
          <hr class="bs-divider-light"/>
          <div class="bs-line" style="font-style:italic;">
            <span class="bs-line-name">Net ${bs.netIncome >= 0 ? 'Profit' : 'Loss'} for Period</span>
            <span class="bs-line-amount" style="color:${bs.netIncome >= 0 ? 'var(--success)' : 'var(--danger)'}">
              ${bs.netIncome >= 0 ? '' : '('}${fmt(Math.abs(bs.netIncome))}${bs.netIncome < 0 ? ')' : ''}
            </span>
          </div>` : ''}

          ${hasPL ? `
          <hr class="bs-divider-light"/>
          <div class="bs-line" style="font-style:italic;">
            <span class="bs-line-name">Net ${bs.netIncome >= 0 ? 'Profit' : 'Loss'} for Period</span>
            <span class="bs-line-amount" style="color:${bs.netIncome >= 0 ? 'var(--success)' : 'var(--danger)'}">
              ${bs.netIncome >= 0 ? '' : '('}${fmt(Math.abs(bs.netIncome))}${bs.netIncome < 0 ? ')' : ''}
            </span>
          </div>` : ''}

          <div class="bs-subtotal">
            <span class="bs-subtotal-name">Total Equity</span>
            <span class="bs-subtotal-amount">${fmt(bs.totalEquity)}</span>
          </div>
        </div>

        <div class="bs-total">
          <span class="bs-total-name">TOTAL LIABILITIES &amp; EQUITY</span>
          <span class="bs-total-amount">${fmt(bs.totalLiabEquity)}</span>
        </div>
      </div>
    </div>

    <!-- P&L SUMMARY (if P&L accounts exist) -->
    ${hasPL ? `
    <hr class="bs-divider" style="margin-top:36px;"/>
    <div style="margin-top:24px;">
      <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--primary);margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid var(--primary-light);">
        <i class="fas fa-chart-line"></i> &nbsp;Income Summary (P&L Accounts)
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;">
        <div>
          <div class="bs-section-title">Revenue</div>
          ${bs.plRows.filter(r=>r.type==='revenue').map(r=>`
            <div class="bs-line"><span class="bs-line-name">${esc(r.name)}</span>
            <span class="bs-line-amount">${fmt(r.credit - r.debit)}</span></div>`).join('') || '<div class="bs-line" style="color:var(--text-light);font-style:italic;"><span>No entries</span><span>-</span></div>'}
          <div class="bs-subtotal"><span>Total Revenue</span><span>${fmt(bs.totalRevenue)}</span></div>
        </div>
        <div>
          <div class="bs-section-title">Expenses</div>
          ${bs.plRows.filter(r=>r.type==='expense').map(r=>`
            <div class="bs-line"><span class="bs-line-name">${esc(r.name)}</span>
            <span class="bs-line-amount">${fmt(r.debit - r.credit)}</span></div>`).join('') || '<div class="bs-line" style="color:var(--text-light);font-style:italic;"><span>No entries</span><span>-</span></div>'}
          <div class="bs-subtotal"><span>Total Expenses</span><span>${fmt(bs.totalExpense)}</span></div>
        </div>
      </div>
      <div class="bs-total">
        <span>NET ${bs.netIncome >= 0 ? 'PROFIT' : 'LOSS'}</span>
        <span style="color:${bs.netIncome >= 0 ? 'var(--success)' : 'var(--danger)'}">
          ${bs.netIncome < 0 ? '(' : ''}${fmt(Math.abs(bs.netIncome))}${bs.netIncome < 0 ? ')' : ''}
        </span>
      </div>
    </div>` : ''}

    <!-- FOOTER -->
    <div class="bs-footer">
      <div>
        <span class="bs-validity ${bs.isBalanced ? 'bs-valid' : 'bs-invalid'}">
          <i class="fas ${bs.isBalanced ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
          ${bs.isBalanced ? 'Balanced' : 'Not Balanced'}
        </span>
        ${meta.notes ? `<div style="margin-top:12px;font-size:12px;color:var(--text-muted);max-width:400px;"><strong>Notes:</strong> ${esc(meta.notes)}</div>` : ''}
      </div>
      <div class="bs-meta">
        <div>Generated: ${now}</div>
        <div style="margin-top:4px;color:var(--text-light)">BalanceIQ – Financial Reporting Tool</div>
      </div>
    </div>
  `;
}
