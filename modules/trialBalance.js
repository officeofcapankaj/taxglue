/**
 * trialBalance.js – Trial Balance table management
 */

/* ============================================================
   STATE
============================================================ */
let tbRows = []; // Array of { id, code, name, type, debit, credit }
let tbRowCounter = 0;

/* ============================================================
   RENDER ROWS
============================================================ */
function renderTBRows() {
  const container = document.getElementById('tbRows');
  if (!container) return;
  container.innerHTML = '';

  if (tbRows.length === 0) {
    container.innerHTML = `
      <div style="padding:32px;text-align:center;color:var(--text-light);">
        <i class="fas fa-table" style="font-size:32px;display:block;margin-bottom:12px;"></i>
        No accounts yet. Click <strong>Add Account Row</strong> below to start.
      </div>`;
  } else {
    tbRows.forEach(row => container.appendChild(buildRowElement(row)));
  }
  updateTotals();
}

function buildRowElement(row) {
  const div = document.createElement('div');
  div.className = 'tb-row';
  div.dataset.rowId = row.id;

  // Type options
  const typeOptions = ACCOUNT_TYPES.map(t =>
    `<option value="${t.value}" ${row.type === t.value ? 'selected' : ''}>${t.label}</option>`
  ).join('');

  // Get head suggestions
  const headSuggestions = getHeadSuggestions(row.name, row.type);
  const suggestionHtml = headSuggestions.length > 0 ? 
    `<div class="head-suggestions">
      <small>Suggested head: <strong>${headSuggestions[0].label}</strong></small>
    </div>` : '';

  div.innerHTML = `
    <div><input class="cell-code" type="text" placeholder="e.g. 1001" value="${esc(row.code)}" maxlength="20"/></div>
    <div>
      <input class="cell-name" type="text" placeholder="Account name" value="${esc(row.name)}"/>
      ${suggestionHtml}
    </div>
    <div><select class="cell-type">${typeOptions}</select></div>
    <div class="cell-amount"><input class="cell-debit" type="number" min="0" step="0.01" placeholder="0.00" value="${row.debit || ''}"/></div>
    <div class="cell-amount"><input class="cell-credit" type="number" min="0" step="0.01" placeholder="0.00" value="${row.credit || ''}"/></div>
    <div class="cell-actions">
      <button class="btn-del-row" title="Remove row"><i class="fas fa-trash-alt"></i></button>
    </div>
  `;

  // Events
  div.querySelector('.cell-code').addEventListener('input', e => { row.code = e.target.value; });
  div.querySelector('.cell-name').addEventListener('input', e => {
    row.name = e.target.value;
    // Auto-classify if user hasn't manually set type yet
    if (row.autoType !== false) {
      const guessed = autoClassify(e.target.value);
      if (guessed) {
        row.type = guessed;
        div.querySelector('.cell-type').value = guessed;
      }
    }
  });
  div.querySelector('.cell-type').addEventListener('change', e => {
    row.type = e.target.value;
    row.autoType = false; // user manually set
  });
  div.querySelector('.cell-debit').addEventListener('input', e => {
    row.debit = parseFloat(e.target.value) || 0;
    if (row.debit > 0) { row.credit = 0; div.querySelector('.cell-credit').value = ''; }
    updateTotals();
  });
  div.querySelector('.cell-credit').addEventListener('input', e => {
    row.credit = parseFloat(e.target.value) || 0;
    if (row.credit > 0) { row.debit = 0; div.querySelector('.cell-debit').value = ''; }
    updateTotals();
  });
  div.querySelector('.btn-del-row').addEventListener('click', () => {
    tbRows = tbRows.filter(r => r.id !== row.id);
    renderTBRows();
  });

  return div;
}

/* ============================================================
   ADD / CLEAR
============================================================ */
function addTBRow(data = {}) {
  tbRowCounter++;
  const row = {
    id: 'row_' + tbRowCounter,
    code: data.code || '',
    name: data.name || '',
    type: data.type || 'current-assets',
    debit: parseFloat(data.debit) || 0,
    credit: parseFloat(data.credit) || 0,
    autoType: data.autoType !== undefined ? data.autoType : true,
  };
  tbRows.push(row);
  renderTBRows();
  // Focus the name cell of the new row
  setTimeout(() => {
    const container = document.getElementById('tbRows');
    const lastRow = container.querySelector('.tb-row:last-child');
    if (lastRow) lastRow.querySelector('.cell-name')?.focus();
  }, 50);
}

function clearTBRows() {
  tbRows = [];
  renderTBRows();
}

function loadSampleData() {
  tbRows = [];
  tbRowCounter = 0;
  SAMPLE_TRIAL_BALANCE.forEach(r => {
    tbRowCounter++;
    tbRows.push({ id: 'row_' + tbRowCounter, ...r, autoType: false });
  });
  renderTBRows();
}

/* ============================================================
   TOTALS & VALIDATION
============================================================ */
function updateTotals() {
  let debit = 0, credit = 0;
  tbRows.forEach(r => { debit += r.debit || 0; credit += r.credit || 0; });

  const fmt = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const tdEl = document.getElementById('totalDebit');
  const tcEl = document.getElementById('totalCredit');
  const banner = document.getElementById('tbBalanceBanner');
  const bannerMsg = document.getElementById('tbBalanceMsg');
  const genBtn = document.getElementById('btnGenerateBS');
  const hint = document.querySelector('.tb-hint');

  if (tdEl) tdEl.textContent = fmt(debit);
  if (tcEl) tcEl.textContent = fmt(credit);

  const diff = Math.abs(debit - credit);
  const balanced = diff < 0.005 && tbRows.length > 0;

  if (tdEl) tdEl.className = 'total-debit ' + (tbRows.length === 0 ? '' : balanced ? 'total-balanced' : 'total-unbalanced');
  if (tcEl) tcEl.className = 'total-credit ' + (tbRows.length === 0 ? '' : balanced ? 'total-balanced' : 'total-unbalanced');

  if (banner && bannerMsg) {
    if (tbRows.length === 0) {
      banner.className = 'balance-banner balance-warning';
      bannerMsg.textContent = 'Add entries to begin. Debit and Credit totals must balance.';
    } else if (balanced) {
      banner.className = 'balance-banner balance-ok';
      bannerMsg.innerHTML = `<i class="fas fa-check-circle"></i> &nbsp;Trial balance is balanced! Debit = Credit = ${fmt(debit)}`;
    } else {
      const diff2 = (debit - credit).toFixed(2);
      banner.className = 'balance-banner balance-error';
      bannerMsg.innerHTML = `Imbalance of <strong>${fmt(Math.abs(debit - credit))}</strong>. ${debit > credit ? 'Debit exceeds Credit' : 'Credit exceeds Debit'} by this amount.`;
    }
  }

  if (genBtn) genBtn.disabled = !balanced;
  if (hint) hint.style.display = balanced ? 'none' : 'inline';
}

/* ============================================================
   CSV IMPORT
============================================================ */
function importCSV(content) {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) { showToast('CSV appears empty or invalid.', 'error'); return; }

  const header = lines[0].toLowerCase();
  if (!header.includes('name') && !header.includes('account')) {
    showToast('CSV must include header: Account Code, Account Name, Account Type, Debit, Credit', 'warning');
  }

  let imported = 0;
  let errors = 0;
  for (let i = 1; i < lines.length; i++) {
    const parts = parseCSVLine(lines[i]);
    if (parts.length < 2) { errors++; continue; }
    const [rawCode, rawName, rawType, rawDebit, rawCredit] = parts;
    const name = (rawName || rawCode || '').trim();
    if (!name) { errors++; continue; }
    const code = (rawCode || '').trim();
    const typeInput = (rawType || '').toLowerCase().trim().replace(/\s+/g, '-');
    const matchedType = ACCOUNT_TYPES.find(t => t.value === typeInput || t.label.toLowerCase() === typeInput);
    const type = matchedType ? matchedType.value : autoClassify(name);
    const debit = parseFloat((rawDebit || '0').replace(/,/g, '')) || 0;
    const credit = parseFloat((rawCredit || '0').replace(/,/g, '')) || 0;
    tbRowCounter++;
    tbRows.push({ id: 'row_' + tbRowCounter, code, name, type, debit, credit, autoType: false });
    imported++;
  }

  renderTBRows();
  if (imported > 0) showToast(`Imported ${imported} accounts successfully.`, 'success');
  if (errors > 0) showToast(`${errors} rows skipped due to errors.`, 'warning');
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/* ============================================================
   CSV TEMPLATE DOWNLOAD
============================================================ */
function downloadCSVTemplate() {
  const header = 'Account Code,Account Name,Account Type,Debit,Credit';
  const rows = [
    '1001,Cash and Cash Equivalents,current-assets,50000,',
    '1002,Accounts Receivable,current-assets,30000,',
    '1101,Plant & Equipment,non-current-assets,200000,',
    '2001,Accounts Payable,current-liabilities,,25000',
    '3001,Share Capital,equity,,255000',
  ];
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'trial_balance_template.csv';
  a.click(); URL.revokeObjectURL(url);
}

/* ============================================================
   SERIALIZE / DESERIALIZE
============================================================ */
function serializeTBRows() {
  return JSON.stringify(tbRows.map(r => ({
    code: r.code, name: r.name, type: r.type, debit: r.debit, credit: r.credit
  })));
}

function deserializeTBRows(json) {
  try {
    const data = JSON.parse(json);
    tbRows = [];
    tbRowCounter = 0;
    data.forEach(r => {
      tbRowCounter++;
      tbRows.push({ id: 'row_' + tbRowCounter, ...r, autoType: false });
    });
    renderTBRows();
  } catch (e) {
    showToast('Failed to load trial balance data.', 'error');
  }
}

/* ============================================================
   HELPERS
============================================================ */
function esc(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
