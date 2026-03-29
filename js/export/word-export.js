/**
 * Word Export Helper using docx.js
 * Generates .docx files for reports
 */

const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } = docx;

// Helper to format currency
function formatCurrency(num) {
  if (!num && num !== 0) return '-';
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
}

// Generate Trial Balance document
function generateTrialBalanceDocx(data) {
  const children = [
    // Title
    new Paragraph({
      children: [
        new TextRun({ text: 'Trial Balance', bold: true, size: 48 })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }),
    
    // Date
    new Paragraph({
      children: [
        new TextRun({ text: `As on: ${new Date().toLocaleDateString('en-IN')}`, size: 24 })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }),
    
    // Header row
    new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Code', bold: true })] })],
              shading: { fill: 'EEEEEE' }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Account Name', bold: true })] })],
              shading: { fill: 'EEEEEE' }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Opening', bold: true })] })],
              shading: { fill: 'EEEEEE' }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Debit', bold: true })] })],
              shading: { fill: 'EEEEEE' }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Credit', bold: true })] })],
              shading: { fill: 'EEEEEE' }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Closing', bold: true })] })],
              shading: { fill: 'EEEEEE' }
            })
          ]
        })
      ],
      width: { size: 100, type: WidthType.PERCENTAGE }
    })
  ];
  
  // Add data rows
  data.accounts.forEach(acc => {
    children.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(String(acc.code || ''))] }),
          new TableCell({ children: [new Paragraph(String(acc.name || ''))] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(acc.opening), font: 'Courier New' })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(acc.debit), font: 'Courier New' })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(acc.credit), font: 'Courier New' })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(acc.closing), font: 'Courier New' })] })] })
        ]
      })
    );
  });
  
  // Add total row
  children.push(
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: 'TOTAL', bold: true })] })],
          shading: { fill: 'DDDDDD' }
        }),
        new TableCell({ children: [new Paragraph('')] }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(data.totals.opening), bold: true, font: 'Courier New' })] })],
          shading: { fill: 'DDDDDD' }
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(data.totals.debit), bold: true, font: 'Courier New' })] })],
          shading: { fill: 'DDDDDD' }
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(data.totals.credit), bold: true, font: 'Courier New' })] })],
          shading: { fill: 'DDDDDD' }
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: formatCurrency(data.totals.closing), bold: true, font: 'Courier New' })] })],
          shading: { fill: 'DDDDDD' }
        })
      ]
    })
  );
  
  return new Document({
    sections: [{
      properties: {},
      children: children
    }]
  });
}

// Generate Balance Sheet document
function generateBalanceSheetDocx(data) {
  const children = [
    new Paragraph({
      children: [new TextRun({ text: 'Balance Sheet', bold: true, size: 48 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }),
    new Paragraph({
      children: [new TextRun({ text: `As on: ${new Date().toLocaleDateString('en-IN')}`, size: 24 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }),
    
    // Liabilities header
    new Paragraph({
      children: [new TextRun({ text: 'LIABILITIES', bold: true, size: 32 })],
      spacing: { before: 300, after: 200 }
    })
  ];
  
  // Liabilities rows
  data.liabilities.forEach(item => {
    children.push(
      new Paragraph({
        children: [new TextRun(String(item.name || ''))],
        spacing: { after: 100 }
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: formatCurrency(item.balance), font: 'Courier New' })],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 100 }
      })
    );
  });
  
  // Liabilities Total
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Total Liabilities', bold: true })],
      spacing: { before: 200 }
    })
  );
  children.push(
    new Paragraph({
      children: [new TextRun({ text: formatCurrency(data.totals.liabilities), bold: true, font: 'Courier New' })],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 400 }
    })
  );
  
  // Assets header
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'ASSETS', bold: true, size: 32 })],
      spacing: { before: 300, after: 200 }
    })
  );
  
  // Assets rows
  data.assets.forEach(item => {
    children.push(
      new Paragraph({
        children: [new TextRun(String(item.name || ''))],
        spacing: { after: 100 }
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: formatCurrency(item.balance), font: 'Courier New' })],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 100 }
      })
    );
  });
  
  // Assets Total
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Total Assets', bold: true })],
      spacing: { before: 200 }
    })
  );
  children.push(
    new Paragraph({
      children: [new TextRun({ text: formatCurrency(data.totals.assets), bold: true, font: 'Courier New' })],
      alignment: AlignmentType.RIGHT
    })
  );
  
  return new Document({
    sections: [{
      properties: {},
      children: children
    }]
  });
}

// Generate Profit & Loss document
function generateProfitLossDocx(data) {
  const children = [
    new Paragraph({
      children: [new TextRun({ text: 'Profit & Loss Account', bold: true, size: 48 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }),
    new Paragraph({
      children: [new TextRun({ text: `For the period ending: ${new Date().toLocaleDateString('en-IN')}`, size: 24 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }),
    
    // Income header
    new Paragraph({
      children: [new TextRun({ text: 'INCOME', bold: true, size: 32 })],
      spacing: { before: 300, after: 200 }
    })
  ];
  
  // Income rows
  data.income.forEach(item => {
    children.push(
      new Paragraph({
        children: [new TextRun(String(item.name || ''))],
        spacing: { after: 100 }
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: formatCurrency(item.balance), font: 'Courier New' })],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 100 }
      })
    );
  });
  
  // Total Income
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Total Income', bold: true })],
      spacing: { before: 200 }
    })
  );
  children.push(
    new Paragraph({
      children: [new TextRun({ text: formatCurrency(data.totalIncome), bold: true, font: 'Courier New' })],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 400 }
    })
  );
  
  // Expenses header
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'EXPENSES', bold: true, size: 32 })],
      spacing: { before: 300, after: 200 }
    })
  );
  
  // Expenses rows
  data.expenses.forEach(item => {
    children.push(
      new Paragraph({
        children: [new TextRun(String(item.name || ''))],
        spacing: { after: 100 }
      })
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: formatCurrency(item.balance), font: 'Courier New' })],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 100 }
      })
    );
  });
  
  // Total Expenses
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Total Expenses', bold: true })],
      spacing: { before: 200 }
    })
  );
  children.push(
    new Paragraph({
      children: [new TextRun({ text: formatCurrency(data.totalExpenses), bold: true, font: 'Courier New' })],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 300 }
    })
  );
  
  // Net Profit
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Net Profit', bold: true, size: 28 })],
      spacing: { before: 200 }
    })
  );
  children.push(
    new Paragraph({
      children: [new TextRun({ text: formatCurrency(data.netProfit), bold: true, size: 28, font: 'Courier New' })],
      alignment: AlignmentType.RIGHT
    })
  );
  
  return new Document({
    sections: [{
      properties: {},
      children: children
    }]
  });
}

// Download docx file
async function downloadDocx(doc, filename) {
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}