/**
 * app.js – Main application controller
 * Wires all modules together: navigation, events, API persistence, export
 */

/* ============================================================
   APPLICATION STATE
============================================================ */
const AppState = {
  currentSheetId: null,   // ID of currently loaded sheet (null = new)
  meta: {},               // Company / period meta
  isDirty: false,         // Unsaved changes flag
};

/* ============================================================
   INITIALIZATION
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initSetupForm();
  initTrialBalanceEvents();
  initBalanceSheetEvents();
  initMySheetsEvents();
  showView('viewLanding');
});

/* ============================================================
   NAVIGATION / LANDING
============================================================ */
function initNav() {
  document.getElementById('btnGetStarted').addEventListener('click', () => {
    resetApp();
    showView('viewSetup');
  });

  document.getElementById('btnLoadSample').addEventListener('click', () => {
    resetApp();
    // Pre-fill sample company info
    AppState.meta = {
      companyName: 'Acme Corporation Ltd.',
      regNumber: 'RC-0012345',
      periodEnd: '2024-12-31',
      currency: 'USD',
      title: 'Annual Balance Sheet 2024',
      notes: 'Sample data for demonstration purposes.',
    };
    loadSampleData();
    updateSubtitle();
    showView('viewTrialBalance');
    showToast('Sample data loaded! Click Generate Balance Sheet.', 'success');
  });

  document.getElementById('btnNewSheet').addEventListener('click', () => {
    if (AppState.isDirty) {
      showConfirmModal('Start New Sheet?', 'You have unsaved changes. Start a new sheet anyway?', () => {
        resetApp();
        showView('viewSetup');
      });
    } else {
      resetApp();
      showView('viewSetup');
    }
  });

  document.getElementById('btnMySheets').addEventListener('click', () => {
    loadMySheets();
    showView('viewMySheets');
  });

  document.getElementById('btnSave').addEventListener('click', saveCurrentSheet);
}

/* ============================================================
   RESET
============================================================ */
function resetApp() {
  AppState.currentSheetId = null;
  AppState.meta = {};
  AppState.isDirty = false;
  clearTBRows();
  document.getElementById('setupForm').reset();
  document.getElementById('periodEnd').value = today();
  document.getElementById('btnSave').disabled = true;
}

/* ============================================================
   SETUP FORM
============================================================ */
function initSetupForm() {
  // Default period end = today
  document.getElementById('periodEnd').value = today();

  document.getElementById('btnBackFromSetup').addEventListener('click', () => showView('viewLanding'));

  document.getElementById('setupForm').addEventListener('submit', e => {
    e.preventDefault();
    const companyName = document.getElementById('companyName').value.trim();
    if (!companyName) { showToast('Please enter a company name.', 'error'); return; }

    AppState.meta = {
      companyName,
      regNumber:  document.getElementById('regNumber').value.trim(),
      periodEnd:  document.getElementById('periodEnd').value,
      currency:   document.getElementById('currency').value,
      title:      document.getElementById('sheetTitle').value.trim() || `Balance Sheet – ${formatDate(document.getElementById('periodEnd').value)}`,
      notes:      document.getElementById('sheetNotes').value.trim(),
    };

    updateSubtitle();
    showView('viewTrialBalance');
  });
}

function updateSubtitle() {
  const el = document.getElementById('tbSubtitle');
  if (el && AppState.meta.companyName) {
    el.textContent = `${AppState.meta.companyName} | Period ending: ${formatDate(AppState.meta.periodEnd)} | Currency: ${AppState.meta.currency}`;
  }
}

/* ============================================================
   TRIAL BALANCE EVENTS
============================================================ */
function initTrialBalanceEvents() {
  document.getElementById('btnBackFromTB').addEventListener('click', () => showView('viewSetup'));

  document.getElementById('btnAddRow').addEventListener('click', () => {
    addTBRow();
    AppState.isDirty = true;
    document.getElementById('btnSave').disabled = false;
  });

  document.getElementById('btnClearTB').addEventListener('click', () => {
    if (tbRows.length === 0) return;
    showConfirmModal('Clear All Rows?', 'This will remove all trial balance entries. Continue?', () => {
      clearTBRows();
      AppState.isDirty = true;
    });
  });

  document.getElementById('btnGenerateBS').addEventListener('click', () => {
    const bs = generateBalanceSheet(tbRows, AppState.meta);
    renderBalanceSheet(bs);
    
    // Store data globally for export functions
    window.currentBalanceSheet = bs;
    window.currentTrialBalanceRows = tbRows;
    
    showView('viewBalanceSheet');
  });

  // Import CSV
  document.getElementById('btnImportCSV').addEventListener('click', () => {
    document.getElementById('csvFileInput').click();
  });
  document.getElementById('csvFileInput').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      importCSV(e.target.result);
      AppState.isDirty = true;
      document.getElementById('btnSave').disabled = false;
    };
    reader.readAsText(file);
    this.value = ''; // reset file input
  });

  // CSV Template Download
  document.getElementById('btnDownloadTemplate').addEventListener('click', downloadCSVTemplate);
}

/* ============================================================
   BALANCE SHEET EVENTS
============================================================ */
function initBalanceSheetEvents() {
  document.getElementById('btnBackFromBS').addEventListener('click', () => showView('viewTrialBalance'));
  document.getElementById('btnEditBS').addEventListener('click', () => showView('viewTrialBalance'));

  document.getElementById('btnPrint').addEventListener('click', () => window.print());

  document.getElementById('btnExportPDF').addEventListener('click', exportPDF);
  
  // Excel and Word export buttons
  document.getElementById('btnExportExcel').addEventListener('click', exportExcel);
  document.getElementById('btnExportWord').addEventListener('click', exportWord);
}

/* ============================================================
   EXPORT PDF
============================================================ */
async function exportPDF() {
  const btn = document.getElementById('btnExportPDF');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
  btn.disabled = true;

  try {
    const element = document.getElementById('bsDocument');
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const imgW = pageW - margin * 2;
    const imgH = (canvas.height * imgW) / canvas.width;
    const pageCount = Math.ceil(imgH / (pageH - margin * 2));

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) pdf.addPage();
      const yOffset = -(page * (pageH - margin * 2));
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin + yOffset, imgW, imgH);
    }

    const company = (AppState.meta.companyName || 'balance_sheet').replace(/\s+/g, '_');
    const period = (AppState.meta.periodEnd || today()).replace(/-/g, '');
    pdf.save(`${company}_${period}.pdf`);
    showToast('PDF exported successfully!', 'success');
  } catch (err) {
    showToast('PDF export failed. Try the Print option instead.', 'error');
    console.error(err);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

/* ============================================================
   EXPORT EXCEL
============================================================ */
function exportExcel() {
  const btn = document.getElementById('btnExportExcel');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
  btn.disabled = true;

  try {
    // Get current balance sheet data and trial balance rows
    const bs = window.currentBalanceSheet;
    const trialBalanceRows = window.currentTrialBalanceRows;
    
    if (!bs) {
      showToast('No balance sheet data to export.', 'error');
      return;
    }
    
    exportBalanceSheetToExcel(bs, trialBalanceRows || []);
  } catch (error) {
    console.error('Excel export error:', error);
    showToast('Excel export failed. Please try again.', 'error');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

/* ============================================================
   EXPORT WORD
============================================================ */
function exportWord() {
  const btn = document.getElementById('btnExportWord');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
  btn.disabled = true;

  try {
    // Get current balance sheet data and trial balance rows
    const bs = window.currentBalanceSheet;
    const trialBalanceRows = window.currentTrialBalanceRows;
    
    if (!bs) {
      showToast('No balance sheet data to export.', 'error');
      return;
    }
    
    exportBalanceSheetToWord(bs, trialBalanceRows || []);
  } catch (error) {
    console.error('Word export error:', error);
    showToast('Word export failed. Please try again.', 'error');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

/* ============================================================
   SAVE SHEET
============================================================ */
async function saveCurrentSheet() {
  const btn = document.getElementById('btnSave');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  btn.disabled = true;

  try {
    const payload = {
      company_id: '',
      title: AppState.meta.title || 'Untitled Balance Sheet',
      period_end: AppState.meta.periodEnd,
      status: 'draft',
      trial_balance_data: serializeTBRows(),
      notes: JSON.stringify(AppState.meta),
    };

    let saved;
    if (AppState.currentSheetId) {
      saved = await API.updateSheet(AppState.currentSheetId, payload);
    } else {
      saved = await API.createSheet(payload);
      AppState.currentSheetId = saved.id;
    }

    AppState.isDirty = false;
    btn.innerHTML = '<i class="fas fa-check"></i> Saved!';
    showToast('Balance sheet saved successfully!', 'success');
    setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 2000);
  } catch (err) {
    showToast('Save failed. Please try again.', 'error');
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

/* ============================================================
   MY SHEETS
============================================================ */
function initMySheetsEvents() {
  document.getElementById('btnBackFromMySheets').addEventListener('click', () => showView('viewLanding'));
  document.getElementById('btnNewFromMySheets').addEventListener('click', () => {
    resetApp();
    showView('viewSetup');
  });
}

async function loadMySheets() {
  const grid = document.getElementById('mySheetsGrid');
  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">
    <i class="fas fa-spinner fa-spin" style="font-size:28px;"></i>
    <p style="margin-top:12px;">Loading your sheets...</p>
  </div>`;

  try {
    const result = await API.listSheets();
    const sheets = (result.data || []).filter(s => !s.deleted);

    if (sheets.length === 0) {
      grid.innerHTML = `
        <div class="sheets-empty">
          <i class="fas fa-folder-open"></i>
          <h3>No Saved Sheets</h3>
          <p>You haven't saved any balance sheets yet. Create one to get started.</p>
          <button class="btn btn-primary" style="margin-top:16px;" onclick="document.getElementById('btnNewFromMySheets').click()">
            <i class="fas fa-plus"></i> New Balance Sheet
          </button>
        </div>`;
      return;
    }

    grid.innerHTML = '';
    sheets.reverse().forEach(sheet => {
      let metaObj = {};
      try { metaObj = JSON.parse(sheet.notes || '{}'); } catch(e) {}

      const card = document.createElement('div');
      card.className = 'sheet-card';
      card.innerHTML = `
        <div class="sheet-card-actions">
          <button class="btn-delete-sheet" data-id="${sheet.id}" title="Delete sheet"><i class="fas fa-trash"></i></button>
        </div>
        <div class="sheet-card-title">${esc(sheet.title || 'Untitled Sheet')}</div>
        <div class="sheet-card-company"><i class="fas fa-building"></i> ${esc(metaObj.companyName || '—')}</div>
        <div class="sheet-card-period"><i class="fas fa-calendar"></i> ${sheet.period_end ? formatDate(sheet.period_end) : '—'}</div>
        <div>
          <span class="sheet-card-status status-${sheet.status || 'draft'}">${sheet.status || 'draft'}</span>
          <span style="font-size:11px;color:var(--text-light);margin-left:8px;">
            ${metaObj.currency || ''}
          </span>
        </div>
      `;

      // Open sheet on click (not on action buttons)
      card.addEventListener('click', async (e) => {
        if (e.target.closest('.btn-delete-sheet')) return;
        await loadSheet(sheet, metaObj);
      });

      // Delete button
      card.querySelector('.btn-delete-sheet').addEventListener('click', async e => {
        e.stopPropagation();
        showConfirmModal('Delete Sheet?', `Delete "${sheet.title || 'Untitled Sheet'}"? This cannot be undone.`, async () => {
          try {
            await API.deleteSheet(sheet.id);
            showToast('Sheet deleted.', 'success');
            loadMySheets();
          } catch {
            showToast('Delete failed.', 'error');
          }
        });
      });

      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = `<div class="sheets-empty">
      <i class="fas fa-exclamation-triangle" style="color:var(--warning)"></i>
      <h3>Could Not Load Sheets</h3>
      <p>There was an error loading your saved sheets. Please try again.</p>
    </div>`;
  }
}

async function loadSheet(sheet, metaObj) {
  // Restore meta
  AppState.meta = metaObj || {};
  AppState.currentSheetId = sheet.id;
  AppState.isDirty = false;

  // Restore trial balance
  if (sheet.trial_balance_data) {
    deserializeTBRows(sheet.trial_balance_data);
  }

  updateSubtitle();

  // Enable save button
  document.getElementById('btnSave').disabled = false;

  // Go to TB view
  showView('viewTrialBalance');
  showToast(`Loaded: ${sheet.title}`, 'info');
}
