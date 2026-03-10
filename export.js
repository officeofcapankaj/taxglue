/**
 * export.js – Excel and Word export functionality for BalanceIQ
 */

/* ============================================================
   EXCEL EXPORT FUNCTIONS
============================================================ */

/**
 * Export balance sheet to Excel format
 */
function exportBalanceSheetToExcel(bs, trialBalanceRows) {
  try {
    const { meta, groups, headSubtotals, typeSubtotals, plRows, netIncome, totalRevenue, totalExpense } = bs;
    const currency = meta.currency || 'USD';
    const fmt = (n) => formatCurrency(n, currency);
    
    // Create workbook and worksheets
    const wb = XLSX.utils.book_new();
    
    // 1. Balance Sheet Summary Worksheet
    const balanceSheetData = createBalanceSheetWorksheet(bs);
    const wsBalanceSheet = XLSX.utils.aoa_to_sheet(balanceSheetData);
    XLSX.utils.book_append_sheet(wb, wsBalanceSheet, "Balance Sheet");
    
    // 2. Trial Balance Worksheet
    const trialBalanceData = createTrialBalanceWorksheet(trialBalanceRows, currency);
    const wsTrialBalance = XLSX.utils.aoa_to_sheet(trialBalanceData);
    XLSX.utils.book_append_sheet(wb, wsTrialBalance, "Trial Balance");
    
    // 3. Profit & Loss Worksheet (if applicable)
    if (plRows.length > 0) {
      const plData = createPLWorksheet(plRows, netIncome, totalRevenue, totalExpense, currency);
      const wsPL = XLSX.utils.aoa_to_sheet(plData);
      XLSX.utils.book_append_sheet(wb, wsPL, "Profit & Loss");
    }
    
    // 4. Account Details Worksheet
    const accountDetailsData = createAccountDetailsWorksheet(bs);
    const wsAccountDetails = XLSX.utils.aoa_to_sheet(accountDetailsData);
    XLSX.utils.book_append_sheet(wb, wsAccountDetails, "Account Details");
    
    // Auto-size columns
    autoSizeColumns(wb);
    
    // Generate filename
    const companyName = sanitizeFilename(meta.companyName || 'BalanceSheet');
    const periodEnd = formatDate(meta.periodEnd, 'YYYY-MM-DD');
    const filename = `${companyName}_BalanceSheet_${periodEnd}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, filename);
    
    showToast('Balance sheet exported to Excel successfully!', 'success');
  } catch (error) {
    console.error('Excel export error:', error);
    showToast('Failed to export Excel file. Please try again.', 'error');
  }
}

/**
 * Create balance sheet worksheet data
 */
function createBalanceSheetWorksheet(bs) {
  const { meta, groups, headSubtotals, typeSubtotals, netIncome } = bs;
  const currency = meta.currency || 'USD';
  const fmt = (n) => formatCurrency(n, currency);
  
  const data = [];
  
  // Header
  data.push([meta.companyName || 'Company Name']);
  data.push([`Registration: ${meta.regNumber || 'N/A'}`]);
  data.push([`Period End: ${formatDate(meta.periodEnd)}`]);
  data.push([`Currency: ${currency}`]);
  data.push([]);
  data.push(['BALANCE SHEET']);
  data.push([]);
  
  // Assets Section
  data.push(['ASSETS']);
  data.push([]);
  
  // Current Assets by heads
  const currentAssetsHeads = getOrderedHeads('current-assets');
  currentAssetsHeads.forEach(head => {
    const headKey = head.key;
    const accounts = groups['current-assets'][headKey] || [];
    const headTotal = headSubtotals['current-assets'][headKey] || 0;
    
    if (accounts.length > 0) {
      data.push([head.label, '']);
      accounts.forEach(account => {
        const balance = getAccountBalance(account, 'current-assets');
        data.push([`  ${account.name}`, balance]);
      });
      data.push([`Total ${head.label}`, headTotal]);
      data.push([]);
    }
  });
  
  // Non-Current Assets by heads
  const nonCurrentAssetsHeads = getOrderedHeads('non-current-assets');
  nonCurrentAssetsHeads.forEach(head => {
    const headKey = head.key;
    const accounts = groups['non-current-assets'][headKey] || [];
    const headTotal = headSubtotals['non-current-assets'][headKey] || 0;
    
    if (accounts.length > 0) {
      data.push([head.label, '']);
      accounts.forEach(account => {
        const balance = getAccountBalance(account, 'non-current-assets');
        data.push([`  ${account.name}`, balance]);
      });
      data.push([`Total ${head.label}`, headTotal]);
      data.push([]);
    }
  });
  
  data.push(['TOTAL ASSETS', bs.totalAssets]);
  data.push([]);
  data.push([]);
  
  // Liabilities Section
  data.push(['LIABILITIES']);
  data.push([]);
  
  // Current Liabilities by heads
  const currentLiabilitiesHeads = getOrderedHeads('current-liabilities');
  currentLiabilitiesHeads.forEach(head => {
    const headKey = head.key;
    const accounts = groups['current-liabilities'][headKey] || [];
    const headTotal = headSubtotals['current-liabilities'][headKey] || 0;
    
    if (accounts.length > 0) {
      data.push([head.label, '']);
      accounts.forEach(account => {
        const balance = getAccountBalance(account, 'current-liabilities');
        data.push([`  ${account.name}`, balance]);
      });
      data.push([`Total ${head.label}`, headTotal]);
      data.push([]);
    }
  });
  
  // Non-Current Liabilities by heads
  const nonCurrentLiabilitiesHeads = getOrderedHeads('non-current-liabilities');
  nonCurrentLiabilitiesHeads.forEach(head => {
    const headKey = head.key;
    const accounts = groups['non-current-liabilities'][headKey] || [];
    const headTotal = headSubtotals['non-current-liabilities'][headKey] || 0;
    
    if (accounts.length > 0) {
      data.push([head.label, '']);
      accounts.forEach(account => {
        const balance = getAccountBalance(account, 'non-current-liabilities');
        data.push([`  ${account.name}`, balance]);
      });
      data.push([`Total ${head.label}`, headTotal]);
      data.push([]);
    }
  });
  
  data.push(['TOTAL LIABILITIES', bs.totalLiabilities]);
  data.push([]);
  data.push([]);
  
  // Equity Section
  data.push(['EQUITY']);
  data.push([]);
  
  // Equity by heads
  const equityHeads = getOrderedHeads('equity');
  equityHeads.forEach(head => {
    const headKey = head.key;
    const accounts = groups['equity'][headKey] || [];
    const headTotal = headSubtotals['equity'][headKey] || 0;
    
    if (accounts.length > 0) {
      data.push([head.label, '']);
      accounts.forEach(account => {
        const balance = getAccountBalance(account, 'equity');
        data.push([`  ${account.name}`, balance]);
      });
      data.push([`Total ${head.label}`, headTotal]);
      data.push([]);
    }
  });
  
  // Net income
  if (netIncome !== 0) {
    data.push(['Net Income', netIncome]);
    data.push([]);
  }
  
  data.push(['TOTAL EQUITY', bs.totalEquity]);
  data.push([]);
  data.push([]);
  
  // Final check
  data.push(['TOTAL LIABILITIES & EQUITY', bs.totalLiabEquity]);
  data.push([]);
  data.push([]);
  data.push([bs.isBalanced ? 'BALANCED ✓' : 'NOT BALANCED ✗', '']);
  
  return data;
}

/**
 * Create trial balance worksheet data
 */
function createTrialBalanceWorksheet(trialBalanceRows, currency) {
  const data = [];
  
  // Header
  data.push(['TRIAL BALANCE']);
  data.push([]);
  data.push(['Account Code', 'Account Name', 'Account Type', 'Debit', 'Credit', 'Balance']);
  
  // Data rows
  trialBalanceRows.forEach(row => {
    const balance = getAccountBalance(row, row.type);
    data.push([
      row.code || '',
      row.name,
      formatAccountType(row.type),
      row.debit || 0,
      row.credit || 0,
      balance
    ]);
  });
  
  // Totals
  const totalDebit = trialBalanceRows.reduce((sum, row) => sum + (row.debit || 0), 0);
  const totalCredit = trialBalanceRows.reduce((sum, row) => sum + (row.credit || 0), 0);
  
  data.push([]);
  data.push(['', '', 'TOTALS', totalDebit, totalCredit, '']);
  data.push([]);
  data.push([totalDebit === totalCredit ? 'BALANCED ✓' : 'NOT BALANCED ✗', '', '', '', '', '']);
  
  return data;
}

/**
 * Create Profit & Loss worksheet data
 */
function createPLWorksheet(plRows, netIncome, totalRevenue, totalExpense, currency) {
  const data = [];
  
  // Header
  data.push(['PROFIT & LOSS STATEMENT']);
  data.push([]);
  data.push(['Account Name', 'Account Type', 'Amount']);
  
  // Revenue section
  data.push(['REVENUE']);
  const revenueRows = plRows.filter(r => r.type === 'revenue');
  revenueRows.forEach(row => {
    const amount = (row.credit - row.debit);
    data.push([row.name, 'Revenue', amount]);
  });
  data.push(['TOTAL REVENUE', '', totalRevenue]);
  data.push([]);
  
  // Expense section
  data.push(['EXPENSES']);
  const expenseRows = plRows.filter(r => r.type === 'expense');
  expenseRows.forEach(row => {
    const amount = (row.debit - row.credit);
    data.push([row.name, 'Expense', amount]);
  });
  data.push(['TOTAL EXPENSES', '', totalExpense]);
  data.push([]);
  
  // Net income
  data.push(['NET INCOME', '', netIncome]);
  
  return data;
}

/**
 * Create account details worksheet data
 */
function createAccountDetailsWorksheet(bs) {
  const data = [];
  
  data.push(['ACCOUNT DETAILS BY HEAD']);
  data.push([]);
  
  const accountTypes = ['current-assets', 'non-current-assets', 'current-liabilities', 'non-current-liabilities', 'equity'];
  
  accountTypes.forEach(type => {
    const heads = getOrderedHeads(type);
    data.push([formatAccountType(type).toUpperCase()]);
    data.push(['Head', 'Account Name', 'Account Code', 'Debit', 'Credit', 'Balance']);
    
    heads.forEach(head => {
      const headKey = head.key;
      const accounts = bs.groups[type][headKey] || [];
      
      if (accounts.length > 0) {
        accounts.forEach(account => {
          const balance = getAccountBalance(account, type);
          data.push([
            head.label,
            account.name,
            account.code || '',
            account.debit || 0,
            account.credit || 0,
            balance
          ]);
        });
      }
    });
    
    data.push([]);
  });
  
  return data;
}

/* ============================================================
   WORD EXPORT FUNCTIONS
============================================================ */

/**
 * Export balance sheet to Word format
 */
function exportBalanceSheetToWord(bs, trialBalanceRows) {
  try {
    const { meta, groups, headSubtotals, typeSubtotals, plRows, netIncome, totalRevenue, totalExpense } = bs;
    const currency = meta.currency || 'USD';
    const fmt = (n) => formatCurrency(n, currency);
    
    // Create document sections
    const sections = [];
    
    // Header section
    sections.push(createWordHeader(meta));
    
    // Balance Sheet section
    sections.push(createWordBalanceSheet(bs));
    
    // Trial Balance section
    sections.push(createWordTrialBalance(trialBalanceRows, currency));
    
    // Profit & Loss section (if applicable)
    if (plRows.length > 0) {
      sections.push(createWordPL(plRows, netIncome, totalRevenue, totalExpense, currency));
    }
    
    // Create document
    const doc = new docx.Document({
      sections: sections
    });
    
    // Generate filename
    const companyName = sanitizeFilename(meta.companyName || 'BalanceSheet');
    const periodEnd = formatDate(meta.periodEnd, 'YYYY-MM-DD');
    const filename = `${companyName}_BalanceSheet_${periodEnd}.docx`;
    
    // Save file
    docx.Packer.toBlob(doc).then(blob => {
      saveAs(blob, filename);
      showToast('Balance sheet exported to Word successfully!', 'success');
    });
    
  } catch (error) {
    console.error('Word export error:', error);
    showToast('Failed to export Word file. Please try again.', 'error');
  }
}

/**
 * Create Word document header section
 */
function createWordHeader(meta) {
  return {
    properties: {},
    children: [
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: meta.companyName || 'Company Name',
            bold: true,
            size: 32,
            font: 'Calibri'
          })
        ],
        alignment: docx.AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: `Registration: ${meta.regNumber || 'N/A'}`,
            size: 24,
            font: 'Calibri'
          })
        ],
        alignment: docx.AlignmentType.CENTER,
        spacing: { after: 100 }
      }),
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: `Period End: ${formatDate(meta.periodEnd)}`,
            size: 24,
            font: 'Calibri'
          })
        ],
        alignment: docx.AlignmentType.CENTER,
        spacing: { after: 100 }
      }),
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: `Currency: ${meta.currency || 'USD'}`,
            size: 24,
            font: 'Calibri'
          })
        ],
        alignment: docx.AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    ]
  };
}

/**
 * Create Word balance sheet section
 */
function createWordBalanceSheet(bs) {
  const { meta, groups, headSubtotals, typeSubtotals, netIncome } = bs;
  const currency = meta.currency || 'USD';
  const fmt = (n) => formatCurrency(n, currency);
  
  const children = [
    new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: 'BALANCE SHEET',
          bold: true,
          size: 28,
          font: 'Calibri'
        })
      ],
      alignment: docx.AlignmentType.CENTER,
      spacing: { after: 300 }
    })
  ];
  
  // Assets Section
  children.push(createWordSectionHeader('ASSETS'));
  
  // Current Assets
  const currentAssetsHeads = getOrderedHeads('current-assets');
  currentAssetsHeads.forEach(head => {
    const headKey = head.key;
    const accounts = groups['current-assets'][headKey] || [];
    const headTotal = headSubtotals['current-assets'][headKey] || 0;
    
    if (accounts.length > 0) {
      children.push(createWordSubsectionHeader(head.label));
      accounts.forEach(account => {
        const balance = getAccountBalance(account, 'current-assets');
        children.push(createWordAccountRow(account.name, balance, currency));
      });
      children.push(createWordSubtotalRow(`Total ${head.label}`, headTotal, currency));
    }
  });
  
  // Non-Current Assets
  const nonCurrentAssetsHeads = getOrderedHeads('non-current-assets');
  nonCurrentAssetsHeads.forEach(head => {
    const headKey = head.key;
    const accounts = groups['non-current-assets'][headKey] || [];
    const headTotal = headSubtotals['non-current-assets'][headKey] || 0;
    
    if (accounts.length > 0) {
      children.push(createWordSubsectionHeader(head.label));
      accounts.forEach(account => {
        const balance = getAccountBalance(account, 'non-current-assets');
        children.push(createWordAccountRow(account.name, balance, currency));
      });
      children.push(createWordSubtotalRow(`Total ${head.label}`, headTotal, currency));
    }
  });
  
  children.push(createWordTotalRow('TOTAL ASSETS', bs.totalAssets, currency));
  children.push(new docx.Paragraph({ spacing: { after: 200 } }));
  
  // Liabilities Section
  children.push(createWordSectionHeader('LIABILITIES'));
  
  // Current Liabilities
  const currentLiabilitiesHeads = getOrderedHeads('current-liabilities');
  currentLiabilitiesHeads.forEach(head => {
    const headKey = head.key;
    const accounts = groups['current-liabilities'][headKey] || [];
    const headTotal = headSubtotals['current-liabilities'][headKey] || 0;
    
    if (accounts.length > 0) {
      children.push(createWordSubsectionHeader(head.label));
      accounts.forEach(account => {
        const balance = getAccountBalance(account, 'current-liabilities');
        children.push(createWordAccountRow(account.name, balance, currency));
      });
      children.push(createWordSubtotalRow(`Total ${head.label}`, headTotal, currency));
    }
  });
  
  // Non-Current Liabilities
  const nonCurrentLiabilitiesHeads = getOrderedHeads('non-current-liabilities');
  nonCurrentLiabilitiesHeads.forEach(head => {
    const headKey = head.key;
    const accounts = groups['non-current-liabilities'][headKey] || [];
    const headTotal = headSubtotals['non-current-liabilities'][headKey] || 0;
    
    if (accounts.length > 0) {
      children.push(createWordSubsectionHeader(head.label));
      accounts.forEach(account => {
        const balance = getAccountBalance(account, 'non-current-liabilities');
        children.push(createWordAccountRow(account.name, balance, currency));
      });
      children.push(createWordSubtotalRow(`Total ${head.label}`, headTotal, currency));
    }
  });
  
  children.push(createWordTotalRow('TOTAL LIABILITIES', bs.totalLiabilities, currency));
  children.push(new docx.Paragraph({ spacing: { after: 200 } }));
  
  // Equity Section
  children.push(createWordSectionHeader('EQUITY'));
  
  // Equity by heads
  const equityHeads = getOrderedHeads('equity');
  equityHeads.forEach(head => {
    const headKey = head.key;
    const accounts = groups['equity'][headKey] || [];
    const headTotal = headSubtotals['equity'][headKey] || 0;
    
    if (accounts.length > 0) {
      children.push(createWordSubsectionHeader(head.label));
      accounts.forEach(account => {
        const balance = getAccountBalance(account, 'equity');
        children.push(createWordAccountRow(account.name, balance, currency));
      });
      children.push(createWordSubtotalRow(`Total ${head.label}`, headTotal, currency));
    }
  });
  
  // Net income
  if (netIncome !== 0) {
    children.push(createWordAccountRow('Net Income', netIncome, currency));
  }
  
  children.push(createWordTotalRow('TOTAL EQUITY', bs.totalEquity, currency));
  children.push(new docx.Paragraph({ spacing: { after: 200 } }));
  
  // Final check
  children.push(createWordTotalRow('TOTAL LIABILITIES & EQUITY', bs.totalLiabEquity, currency));
  children.push(new docx.Paragraph({ spacing: { after: 200 } }));
  children.push(new docx.Paragraph({
    children: [
      new docx.TextRun({
        text: bs.isBalanced ? 'BALANCED ✓' : 'NOT BALANCED ✗',
        bold: true,
        size: 24,
        font: 'Calibri',
        color: bs.isBalanced ? '2E7D32' : 'D32F2F'
      })
    ],
    alignment: docx.AlignmentType.CENTER
  }));
  
  return {
    properties: {},
    children: children
  };
}

/**
 * Create Word section header
 */
function createWordSectionHeader(text) {
  return new docx.Paragraph({
    children: [
      new docx.TextRun({
        text: text,
        bold: true,
        size: 26,
        font: 'Calibri',
        color: '1976D2'
      })
    ],
    spacing: { before: 200, after: 200 }
  });
}

/**
 * Create Word subsection header
 */
function createWordSubsectionHeader(text) {
  return new docx.Paragraph({
    children: [
      new docx.TextRun({
        text: text,
        bold: true,
        size: 22,
        font: 'Calibri'
      })
    ],
    spacing: { before: 150, after: 100 }
  });
}

/**
 * Create Word account row
 */
function createWordAccountRow(name, amount, currency) {
  return new docx.Paragraph({
    children: [
      new docx.TextRun({
        text: `  ${name}`,
        size: 20,
        font: 'Calibri'
      }),
      new docx.TextRun({
        text: '                                                                               '.substring(0, Math.max(1, 60 - name.length)),
        size: 20,
        font: 'Calibri'
      }),
      new docx.TextRun({
        text: formatCurrency(amount, currency),
        size: 20,
        font: 'Calibri',
        bold: true
      })
    ],
    spacing: { after: 50 }
  });
}

/**
 * Create Word subtotal row
 */
function createWordSubtotalRow(label, amount, currency) {
  return new docx.Paragraph({
    children: [
      new docx.TextRun({
        text: label,
        bold: true,
        size: 20,
        font: 'Calibri'
      }),
      new docx.TextRun({
        text: '                                                                               '.substring(0, Math.max(1, 60 - label.length)),
        size: 20,
        font: 'Calibri'
      }),
      new docx.TextRun({
        text: formatCurrency(amount, currency),
        bold: true,
        size: 20,
        font: 'Calibri',
        color: '1976D2'
      })
    ],
    spacing: { before: 50, after: 100 }
  });
}

/**
 * Create Word total row
 */
function createWordTotalRow(label, amount, currency) {
  return new docx.Paragraph({
    children: [
      new docx.TextRun({
        text: label,
        bold: true,
        size: 22,
        font: 'Calibri',
        color: '1976D2'
      }),
      new docx.TextRun({
        text: '                                                                               '.substring(0, Math.max(1, 60 - label.length)),
        size: 22,
        font: 'Calibri'
      }),
      new docx.TextRun({
        text: formatCurrency(amount, currency),
        bold: true,
        size: 22,
        font: 'Calibri',
        color: '1976D2'
      })
    ],
    spacing: { before: 100, after: 100 }
  });
}

/**
 * Create Word trial balance section
 */
function createWordTrialBalance(trialBalanceRows, currency) {
  const children = [
    new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: 'TRIAL BALANCE',
          bold: true,
          size: 28,
          font: 'Calibri'
        })
      ],
      alignment: docx.AlignmentType.CENTER,
      spacing: { after: 300 }
    })
  ];
  
  // Create table
  const tableRows = [];
  
  // Header row
  const headerRow = new docx.TableRow({
    children: [
      createWordTableCell('Account Code', true),
      createWordTableCell('Account Name', true),
      createWordTableCell('Account Type', true),
      createWordTableCell('Debit', true),
      createWordTableCell('Credit', true),
      createWordTableCell('Balance', true)
    ]
  });
  tableRows.push(headerRow);
  
  // Data rows
  trialBalanceRows.forEach(row => {
    const balance = getAccountBalance(row, row.type);
    const dataRow = new docx.TableRow({
      children: [
        createWordTableCell(row.code || ''),
        createWordTableCell(row.name),
        createWordTableCell(formatAccountType(row.type)),
        createWordTableCell(formatCurrency(row.debit || 0, currency)),
        createWordTableCell(formatCurrency(row.credit || 0, currency)),
        createWordTableCell(formatCurrency(balance, currency))
      ]
    });
    tableRows.push(dataRow);
  });
  
  // Add table
  children.push(new docx.Table({
    rows: tableRows,
    width: { size: 100, type: docx.WidthType.PERCENTAGE },
    borders: {
      top: { style: docx.BorderStyle.SINGLE, size: 1 },
      bottom: { style: docx.BorderStyle.SINGLE, size: 1 },
      left: { style: docx.BorderStyle.SINGLE, size: 1 },
      right: { style: docx.BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: docx.BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: docx.BorderStyle.SINGLE, size: 1 }
    }
  }));
  
  // Totals
  const totalDebit = trialBalanceRows.reduce((sum, row) => sum + (row.debit || 0), 0);
  const totalCredit = trialBalanceRows.reduce((sum, row) => sum + (row.credit || 0), 0);
  
  children.push(new docx.Paragraph({
    children: [
      new docx.TextRun({
        text: `Total Debit: ${formatCurrency(totalDebit, currency)}`,
        bold: true,
        size: 20,
        font: 'Calibri'
      })
    ],
    spacing: { before: 100 }
  }));
  
  children.push(new docx.Paragraph({
    children: [
      new docx.TextRun({
        text: `Total Credit: ${formatCurrency(totalCredit, currency)}`,
        bold: true,
        size: 20,
        font: 'Calibri'
      })
    ]
  }));
  
  children.push(new docx.Paragraph({
    children: [
      new docx.TextRun({
        text: totalDebit === totalCredit ? 'BALANCED ✓' : 'NOT BALANCED ✗',
        bold: true,
        size: 24,
        font: 'Calibri',
        color: totalDebit === totalCredit ? '2E7D32' : 'D32F2F'
      })
    ],
    spacing: { before: 100 }
  }));
  
  return {
    properties: {},
    children: children
  };
}

/**
 * Create Word table cell
 */
function createWordTableCell(text, isHeader = false) {
  return new docx.TableCell({
    children: [
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: text,
            bold: isHeader,
            size: 18,
            font: 'Calibri'
          })
        ]
      })
    ],
    shading: isHeader ? { type: docx.ShadingType.CLEAR, color: 'E3F2FD' } : undefined
  });
}

/**
 * Create Word P&L section
 */
function createWordPL(plRows, netIncome, totalRevenue, totalExpense, currency) {
  const children = [
    new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: 'PROFIT & LOSS STATEMENT',
          bold: true,
          size: 28,
          font: 'Calibri'
        })
      ],
      alignment: docx.AlignmentType.CENTER,
      spacing: { after: 300 }
    })
  ];
  
  // Revenue section
  children.push(createWordSectionHeader('REVENUE'));
  const revenueRows = plRows.filter(r => r.type === 'revenue');
  revenueRows.forEach(row => {
    const amount = (row.credit - row.debit);
    children.push(createWordAccountRow(row.name, amount, currency));
  });
  children.push(createWordTotalRow('TOTAL REVENUE', totalRevenue, currency));
  children.push(new docx.Paragraph({ spacing: { after: 200 } }));
  
  // Expense section
  children.push(createWordSectionHeader('EXPENSES'));
  const expenseRows = plRows.filter(r => r.type === 'expense');
  expenseRows.forEach(row => {
    const amount = (row.debit - row.credit);
    children.push(createWordAccountRow(row.name, amount, currency));
  });
  children.push(createWordTotalRow('TOTAL EXPENSES', totalExpense, currency));
  children.push(new docx.Paragraph({ spacing: { after: 200 } }));
  
  // Net income
  children.push(createWordTotalRow('NET INCOME', netIncome, currency));
  
  return {
    properties: {},
    children: children
  };
}

/* ============================================================
   UTILITY FUNCTIONS
============================================================ */

/**
 * Get account balance based on account type
 */
function getAccountBalance(account, type) {
  if (type === 'current-assets' || type === 'non-current-assets') {
    return (account.debit || 0) - (account.credit || 0);
  } else {
    return (account.credit || 0) - (account.debit || 0);
  }
}

/**
 * Format account type for display
 */
function formatAccountType(type) {
  return type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Sanitize filename
 */
function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
}

/**
 * Auto-size columns in Excel worksheet
 */
function autoSizeColumns(workbook) {
  workbook.SheetNames.forEach(sheetName => {
    const ws = workbook.Sheets[sheetName];
    const colWidths = [];
    
    // Calculate column widths based on content
    Object.keys(ws).forEach(cell => {
      if (cell[0] === '!') return;
      const col = cell.replace(/[0-9]/g, '');
      const colIndex = XLSX.utils.decode_col(col);
      const cellValue = ws[cell].v;
      const contentLength = String(cellValue).length;
      
      if (!colWidths[colIndex] || colWidths[colIndex] < contentLength) {
        colWidths[colIndex] = Math.min(contentLength, 50); // Max width of 50
      }
    });
    
    // Set column widths
    if (colWidths.length > 0) {
      ws['!cols'] = colWidths.map(width => ({ width: width + 2 }));
    }
  });
}

/**
 * File save helper (for browsers that don't have native saveAs)
 */
function saveAs(blob, filename) {
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    // IE specific
    window.navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    // Other browsers
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}