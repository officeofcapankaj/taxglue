/**
 * Report Export Functions
 * Export reports to Word, Excel, PDF formats
 */

const XLSX = window.XLSX;

// ======================
// Excel Export
// ======================

// Export Trial Balance to Excel
function exportTrialBalanceToExcel(data, filename) {
  const wb = XLSX.utils.book_new();
  
  // Format data for Excel
  const rows = [
    ['Trial Balance'],
    [`As on: ${new Date().toLocaleDateString('en-IN')}`],
    [],
    ['Code', 'Account Name', 'Nature', 'Opening', 'Debit', 'Credit', 'Closing']
  ];
  
  data.accounts.forEach(acc => {
    rows.push([
      acc.code,
      acc.name,
      acc.nature,
      acc.opening,
      acc.debit,
      acc.credit,
      acc.closing
    ]);
  });
  
  // Add totals
  rows.push([]);
  rows.push(['TOTAL', '', '', data.totals.opening, data.totals.debit, data.totals.credit, data.totals.closing]);
  
  const ws = XLSX.utils.aoa_to_sheet(rows);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 10 },  // Code
    { wch: 30 },  // Name
    { wch: 15 },  // Nature
    { wch: 15 },  // Opening
    { wch: 15 },  // Debit
    { wch: 15 },  // Credit
    { wch: 15 }   // Closing
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Trial Balance');
  XLSX.writeFile(wb, filename || 'Trial_Balance.xlsx');
}

// Export Balance Sheet to Excel
function exportBalanceSheetToExcel(data, filename) {
  const wb = XLSX.utils.book_new();
  
  const rows = [
    ['Balance Sheet'],
    [`As on: ${new Date().toLocaleDateString('en-IN')}`],
    [],
    ['LIABILITIES', '', ''],
    ['Code', 'Name', 'Amount']
  ];
  
  // Liabilities
  data.liabilities.forEach(acc => {
    rows.push([acc.code, acc.name, acc.balance]);
  });
  rows.push(['TOTAL LIABILITIES', '', data.totals.liabilities]);
  
  rows.push([]);
  rows.push(['ASSETS', '', '']);
  rows.push(['Code', 'Name', 'Amount']);
  
  // Assets
  data.assets.forEach(acc => {
    rows.push([acc.code, acc.name, acc.balance]);
  });
  rows.push(['TOTAL ASSETS', '', data.totals.assets]);
  
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 10 }, { wch: 30 }, { wch: 20 }];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Balance Sheet');
  XLSX.writeFile(wb, filename || 'Balance_Sheet.xlsx');
}

// Export Profit & Loss to Excel
function exportProfitLossToExcel(data, filename) {
  const wb = XLSX.utils.book_new();
  
  const rows = [
    ['Profit & Loss Account'],
    [`For the period ending: ${new Date().toLocaleDateString('en-IN')}`],
    [],
    ['INCOME', '', ''],
    ['Code', 'Name', 'Amount']
  ];
  
  // Income
  data.income.forEach(acc => {
    rows.push([acc.code, acc.name, acc.balance]);
  });
  rows.push(['TOTAL INCOME', '', data.totalIncome]);
  
  rows.push([]);
  rows.push(['EXPENSES', '', '']);
  rows.push(['Code', 'Name', 'Amount']);
  
  // Expenses
  data.expenses.forEach(acc => {
    rows.push([acc.code, acc.name, acc.balance]);
  });
  rows.push(['TOTAL EXPENSES', '', data.totalExpenses]);
  
  rows.push([]);
  rows.push(['NET PROFIT', '', data.netProfit]);
  
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 10 }, { wch: 30 }, { wch: 20 }];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Profit & Loss');
  XLSX.writeFile(wb, filename || 'Profit_Loss.xlsx');
}

// ======================
// PDF Export
// ======================

// Export Trial Balance to PDF
function exportTrialBalanceToPDF(data, filename) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  let y = 20;
  
  // Title
  doc.setFontSize(18);
  doc.text('Trial Balance', 105, y, { align: 'center' });
  y += 10;
  
  doc.setFontSize(12);
  doc.text(`As on: ${new Date().toLocaleDateString('en-IN')}`, 105, y, { align: 'center' });
  y += 15;
  
  // Table header
  doc.setFontSize(10);
  doc.setFillColor(240, 240, 240);
  doc.rect(10, y, 190, 8, 'F');
  
  doc.text('Code', 12, y + 5);
  doc.text('Account Name', 35, y + 5);
  doc.text('Opening', 110, y + 5);
  doc.text('Debit', 135, y + 5);
  doc.text('Credit', 160, y + 5);
  doc.text('Closing', 185, y + 5);
  y += 10;
  
  // Data rows
  doc.setFontSize(9);
  data.accounts.forEach(acc => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    doc.text(String(acc.code || ''), 12, y);
    doc.text(String(acc.name || '').substring(0, 30), 35, y);
    doc.text(formatNumberPDF(acc.opening), 110, y);
    doc.text(formatNumberPDF(acc.debit), 135, y);
    doc.text(formatNumberPDF(acc.credit), 160, y);
    doc.text(formatNumberPDF(acc.closing), 185, y);
    y += 7;
  });
  
  // Totals
  y += 5;
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('TOTAL', 35, y);
  doc.text(formatNumberPDF(data.totals.opening), 110, y);
  doc.text(formatNumberPDF(data.totals.debit), 135, y);
  doc.text(formatNumberPDF(data.totals.credit), 160, y);
  doc.text(formatNumberPDF(data.totals.closing), 185, y);
  
  doc.save(filename || 'Trial_Balance.pdf');
}

// Export Balance Sheet to PDF
function exportBalanceSheetToPDF(data, filename) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  let y = 20;
  
  // Title
  doc.setFontSize(18);
  doc.text('Balance Sheet', 105, y, { align: 'center' });
  y += 10;
  
  doc.setFontSize(12);
  doc.text(`As on: ${new Date().toLocaleDateString('en-IN')}`, 105, y, { align: 'center' });
  y += 15;
  
  // Liabilities
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Liabilities', 12, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setFillColor(240, 240, 240);
  doc.rect(10, y, 190, 7, 'F');
  doc.text('Name', 12, y + 5);
  doc.text('Amount', 160, y + 5);
  y += 10;
  
  data.liabilities.forEach(item => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(String(item.name || '').substring(0, 40), 12, y);
    doc.text(formatNumberPDF(item.balance), 160, y);
    y += 6;
  });
  
  // Liabilities Total
  doc.setFont(undefined, 'bold');
  doc.text('Total Liabilities', 12, y);
  doc.text(formatNumberPDF(data.totals.liabilities), 160, y);
  y += 12;
  
  // Assets
  doc.setFontSize(14);
  doc.text('Assets', 12, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFillColor(240, 240, 240);
  doc.rect(10, y, 190, 7, 'F');
  doc.text('Name', 12, y + 5);
  doc.text('Amount', 160, y + 5);
  y += 10;
  
  data.assets.forEach(item => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(String(item.name || '').substring(0, 40), 12, y);
    doc.text(formatNumberPDF(item.balance), 160, y);
    y += 6;
  });
  
  // Assets Total
  doc.setFont(undefined, 'bold');
  doc.text('Total Assets', 12, y);
  doc.text(formatNumberPDF(data.totals.assets), 160, y);
  
  doc.save(filename || 'Balance_Sheet.pdf');
}

// Export Profit & Loss to PDF
function exportProfitLossToPDF(data, filename) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  let y = 20;
  
  // Title
  doc.setFontSize(18);
  doc.text('Profit & Loss Account', 105, y, { align: 'center' });
  y += 10;
  
  doc.setFontSize(12);
  doc.text(`For the period ending: ${new Date().toLocaleDateString('en-IN')}`, 105, y, { align: 'center' });
  y += 15;
  
  // Income
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Income', 12, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setFillColor(240, 240, 240);
  doc.rect(10, y, 190, 7, 'F');
  doc.text('Name', 12, y + 5);
  doc.text('Amount', 160, y + 5);
  y += 10;
  
  data.income.forEach(item => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(String(item.name || '').substring(0, 40), 12, y);
    doc.text(formatNumberPDF(item.balance), 160, y);
    y += 6;
  });
  
  // Income Total
  doc.setFont(undefined, 'bold');
  doc.text('Total Income', 12, y);
  doc.text(formatNumberPDF(data.totalIncome), 160, y);
  y += 12;
  
  // Expenses
  doc.setFontSize(14);
  doc.text('Expenses', 12, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFillColor(240, 240, 240);
  doc.rect(10, y, 190, 7, 'F');
  doc.text('Name', 12, y + 5);
  doc.text('Amount', 160, y + 5);
  y += 10;
  
  data.expenses.forEach(item => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(String(item.name || '').substring(0, 40), 12, y);
    doc.text(formatNumberPDF(item.balance), 160, y);
    y += 6;
  });
  
  // Expenses Total
  doc.setFont(undefined, 'bold');
  doc.text('Total Expenses', 12, y);
  doc.text(formatNumberPDF(data.totalExpenses), 160, y);
  y += 10;
  
  // Net Profit
  doc.setFontSize(12);
  doc.text('Net Profit', 12, y);
  doc.text(formatNumberPDF(data.netProfit), 160, y);
  
  doc.save(filename || 'Profit_Loss.pdf');
}

// ======================
// Word Export
// ======================

// Export Trial Balance to Word
function exportTrialBalanceToWord(data, filename) {
  const content = generateTrialBalanceDocx(data);
  downloadDocx(content, filename || 'Trial_Balance.docx');
}

// Export Balance Sheet to Word
function exportBalanceSheetToWord(data, filename) {
  const content = generateBalanceSheetDocx(data);
  downloadDocx(content, filename || 'Balance_Sheet.docx');
}

// Export Profit & Loss to Word
function exportProfitLossToWord(data, filename) {
  const content = generateProfitLossDocx(data);
  downloadDocx(content, filename || 'Profit_Loss.docx');
}

// ======================
// Helper Functions
// ======================

function formatNumberPDF(num) {
  if (!num && num !== 0) return '-';
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
}

// Create export buttons for reports
function createExportButtons(containerId, reportType, data) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'export-buttons';
  buttonGroup.style.display = 'flex';
  buttonGroup.style.gap = '10px';
  buttonGroup.style.marginBottom = '15px';
  
  // Excel button
  const excelBtn = document.createElement('button');
  excelBtn.className = 'btn btn-success';
  excelBtn.innerHTML = '<i class="fas fa-file-excel"></i> Excel';
  excelBtn.onclick = () => {
    switch (reportType) {
      case 'trial-balance':
        exportTrialBalanceToExcel(data);
        break;
      case 'balance-sheet':
        exportBalanceSheetToExcel(data);
        break;
      case 'profit-loss':
        exportProfitLossToExcel(data);
        break;
    }
  };
  
  // PDF button
  const pdfBtn = document.createElement('button');
  pdfBtn.className = 'btn btn-danger';
  pdfBtn.innerHTML = '<i class="fas fa-file-pdf"></i> PDF';
  pdfBtn.onclick = () => {
    switch (reportType) {
      case 'trial-balance':
        exportTrialBalanceToPDF(data);
        break;
      case 'balance-sheet':
        exportBalanceSheetToPDF(data);
        break;
      case 'profit-loss':
        exportProfitLossToPDF(data);
        break;
    }
  };
  
  // Word button
  const wordBtn = document.createElement('button');
  wordBtn.className = 'btn btn-primary';
  wordBtn.innerHTML = '<i class="fas fa-file-word"></i> Word';
  wordBtn.onclick = () => {
    switch (reportType) {
      case 'trial-balance':
        exportTrialBalanceToWord(data);
        break;
      case 'balance-sheet':
        exportBalanceSheetToWord(data);
        break;
      case 'profit-loss':
        exportProfitLossToWord(data);
        break;
    }
  };
  
  buttonGroup.appendChild(excelBtn);
  buttonGroup.appendChild(pdfBtn);
  buttonGroup.appendChild(wordBtn);
  
  container.insertBefore(buttonGroup, container.firstChild);
}