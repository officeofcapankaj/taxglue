/**
 * balanceSheet.js – ICAI Schedule III Compliant Balance Sheet for Non-Corporate Entities
 * Format as per Guidance Note on Financial Statements for Non-Corporate Entities
 */

const data = JSON.parse(localStorage.getItem("trialBalance")) || []

// Classification functions for ICAI format
function getAccountBalance(account) {
  return (account.debit || 0) - (account.credit || 0)
}

function classifyAccount(accountName, mainType) {
  const lower = accountName.toLowerCase()
  
  // Assets Classification
  if (mainType === 'Assets' || mainType === 'Current Assets') {
    // Non-Current Assets
    if (lower.includes('land') || lower.includes('building') || lower.includes('plant') || 
        lower.includes('machinery') || lower.includes('equipment') || lower.includes('vehicle') ||
        lower.includes('furniture') || lower.includes('fixture') || lower.includes('computer') ||
        lower.includes('office equipment') || lower.includes('freehold')) {
      return { type: 'non-current', head: 'property-plant-equipment' }
    }
    if (lower.includes('goodwill') || lower.includes('patent') || lower.includes('trademark') || 
        lower.includes('copyright') || lower.includes('software') || lower.includes('intangible') ||
        lower.includes('brand') || lower.includes('license')) {
      return { type: 'non-current', head: 'intangible-assets' }
    }
    if (lower.includes('capital work') || lower.includes('cwip') || lower.includes('construction in progress')) {
      return { type: 'non-current', head: 'capital-work-in-progress' }
    }
    if (lower.includes('investment') && !lower.includes('current')) {
      return { type: 'non-current', head: 'non-current-investments' }
    }
    if (lower.includes('deferred tax asset')) {
      return { type: 'non-current', head: 'deferred-tax-assets' }
    }
    if (lower.includes('long term loan') || lower.includes('long-term loan') || 
        lower.includes('security deposit') || lower.includes('advance for')) {
      return { type: 'non-current', head: 'long-term-loans-advances' }
    }
    // Current Assets
    if (lower.includes('cash') || lower.includes('bank') || lower.includes('hand') || 
        lower.includes('petty cash') || lower.includes('current account') || lower.includes('savings account')) {
      return { type: 'current', head: 'cash-bank-balances' }
    }
    if (lower.includes('debtor') || lower.includes('receivable') || lower.includes('sundry debtor') ||
        lower.includes('trade receivable') || lower.includes('customer')) {
      return { type: 'current', head: 'trade-receivables' }
    }
    if (lower.includes('inventory') || lower.includes('stock') || lower.includes('goods') ||
        lower.includes('finished goods') || lower.includes('wip') || lower.includes('work in progress') ||
        lower.includes('raw material')) {
      return { type: 'current', head: 'inventories' }
    }
    if (lower.includes('short term investment') || lower.includes('current investment') ||
        lower.includes('marketable securities') || lower.includes('mutual fund')) {
      return { type: 'current', head: 'current-investments' }
    }
    if (lower.includes('short term loan') || lower.includes('short-term loan') || 
        lower.includes('advance to') || lower.includes('prepayment')) {
      return { type: 'current', head: 'short-term-loans-advances' }
    }
    return { type: 'current', head: 'other-current-assets' }
  }
  
  // Liabilities Classification
  if (mainType === 'Liabilities' || mainType === 'Current Liabilities') {
    // Non-Current Liabilities
    if (lower.includes('long term borrow') || lower.includes('long-term borrow') ||
        lower.includes('term loan') || lower.includes('debenture') || lower.includes('mortgage')) {
      return { type: 'non-current', head: 'long-term-borrowings' }
    }
    if (lower.includes('deferred tax liability')) {
      return { type: 'non-current', head: 'deferred-tax-liabilities' }
    }
    if (lower.includes('long term provisions') || lower.includes('long-term provisions')) {
      return { type: 'non-current', head: 'long-term-provisions' }
    }
    // Current Liabilities
    if (lower.includes('short term borrow') || lower.includes('short-term borrow') ||
        lower.includes('bank overdraft') || lower.includes('overdraft') || lower.includes('loan repayable')) {
      return { type: 'current', head: 'short-term-borrowings' }
    }
    if (lower.includes('creditor') || lower.includes('payable') || lower.includes('sundry creditor') ||
        lower.includes('trade payable') || lower.includes('supplier')) {
      return { type: 'current', head: 'trade-payables' }
    }
    if (lower.includes('provision') || lower.includes('tax payable') || lower.includes('duty')) {
      return { type: 'current', head: 'short-term-provisions' }
    }
    return { type: 'current', head: 'other-current-liabilities' }
  }
  
  // Equity Classification
  if (mainType === 'Income' || mainType === 'Revenue') {
    return { type: 'equity', head: 'reserves-surplus' }
  }
  
  return { type: 'current', head: 'other-current-liabilities' }
}

// Group data by ICAI format
function groupByICAIFormat(data) {
  const groups = {
    // EQUITY AND LIABILITIES
    'owners-funds': {
      label: "Owners' Funds",
      items: [],
      subsections: {
        'owners-capital': { label: "Owner's Capital Account", items: [] },
        'reserves-surplus': { label: 'Reserves and surplus', items: [] }
      }
    },
    'non-current-liabilities': {
      label: 'Non-current liabilities',
      items: [],
      subsections: {
        'long-term-borrowings': { label: 'Long-term borrowings', items: [] },
        'deferred-tax-liabilities': { label: 'Deferred tax liabilities (Net)', items: [] },
        'other-long-term-liabilities': { label: 'Other long-term liabilities', items: [] },
        'long-term-provisions': { label: 'Long-term provisions', items: [] }
      }
    },
    'current-liabilities': {
      label: 'Current liabilities',
      items: [],
      subsections: {
        'short-term-borrowings': { label: 'Short-term borrowings', items: [] },
        'trade-payables': { label: 'Trade payables', items: [] },
        'other-current-liabilities': { label: 'Other current liabilities', items: [] },
        'short-term-provisions': { label: 'Short-term provisions', items: [] }
      }
    },
    // ASSETS
    'non-current-assets': {
      label: 'Non-current assets',
      items: [],
      subsections: {
        'property-plant-equipment': { label: 'Property, Plant and Equipment', items: [] },
        'intangible-assets': { label: 'Intangible assets', items: [] },
        'capital-work-in-progress': { label: 'Capital work in progress', items: [] },
        'intangible-asset-development': { label: 'Intangible asset under development', items: [] },
        'non-current-investments': { label: 'Non-current investments', items: [] },
        'deferred-tax-assets': { label: 'Deferred tax assets (Net)', items: [] },
        'long-term-loans-advances': { label: 'Long Term Loans and Advances', items: [] },
        'other-non-current-assets': { label: 'Other non-current assets', items: [] }
      }
    },
    'current-assets': {
      label: 'Current assets',
      items: [],
      subsections: {
        'current-investments': { label: 'Current investments', items: [] },
        'inventories': { label: 'Inventories', items: [] },
        'trade-receivables': { label: 'Trade receivables', items: [] },
        'cash-bank-balances': { label: 'Cash and bank balances', items: [] },
        'short-term-loans-advances': { label: 'Short Term Loans and Advances', items: [] },
        'other-current-assets': { label: 'Other current assets', items: [] }
      }
    }
  }
  
  // Profit & Loss (for Net Income calculation)
  let totalRevenue = 0
  let totalExpense = 0
  let netIncome = 0
  
  data.forEach(account => {
    const balance = getAccountBalance(account)
    const mainType = account.main || 'Assets'
    const classification = classifyAccount(account.account, mainType)
    
    // Handle Revenue/Expense for Net Income
    if (mainType === 'Income' || mainType === 'Revenue') {
      totalRevenue += Math.abs(balance)
    }
    if (mainType === 'Expense') {
      totalExpense += Math.abs(balance)
    }
    
    // Classify into appropriate group
    if (balance !== 0) {
      // For now, distribute based on main type selection
      if (mainType === 'Assets') {
        // Determine if current or non-current based on account name
        if (classification.type === 'non-current') {
          const head = classification.head
          if (groups['non-current-assets'].subsections[head]) {
            groups['non-current-assets'].subsections[head].items.push({ 
              name: account.account, 
              balance: Math.abs(balance) 
            })
          } else {
            groups['non-current-assets'].subsections['other-non-current-assets'].items.push({ 
              name: account.account, 
              balance: Math.abs(balance) 
            })
          }
        } else {
          const head = classification.head
          if (groups['current-assets'].subsections[head]) {
            groups['current-assets'].subsections[head].items.push({ 
              name: account.account, 
              balance: Math.abs(balance) 
            })
          } else {
            groups['current-assets'].subsections['other-current-assets'].items.push({ 
              name: account.account, 
              balance: Math.abs(balance) 
            })
          }
        }
      } else if (mainType === 'Liabilities') {
        if (classification.type === 'non-current') {
          const head = classification.head
          if (groups['non-current-liabilities'].subsections[head]) {
            groups['non-current-liabilities'].subsections[head].items.push({ 
              name: account.account, 
              balance: Math.abs(balance) 
            })
          } else {
            groups['non-current-liabilities'].subsections['other-long-term-liabilities'].items.push({ 
              name: account.account, 
              balance: Math.abs(balance) 
            })
          }
        } else {
          const head = classification.head
          if (groups['current-liabilities'].subsections[head]) {
            groups['current-liabilities'].subsections[head].items.push({ 
              name: account.account, 
              balance: Math.abs(balance) 
            })
          } else {
            groups['current-liabilities'].subsections['other-current-liabilities'].items.push({ 
              name: account.account, 
              balance: Math.abs(balance) 
            })
          }
        }
      } else if (mainType === 'Income' || mainType === 'Revenue') {
        groups['owners-funds'].subsections['reserves-surplus'].items.push({ 
          name: account.account, 
          balance: Math.abs(balance) 
        })
      }
    }
  })
  
  netIncome = totalRevenue - totalExpense
  
  return { groups, netIncome }
}

// Format currency for display
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(amount)
}

// Render the balance sheet in ICAI format
function renderBalanceSheet() {
  const { groups, netIncome } = groupByICAIFormat(data)
  
  // Calculate totals
  let totalAssets = 0
  let totalLiabilities = 0
  let totalEquity = 0
  
  // Calculate current assets total
  Object.values(groups['current-assets'].subsections).forEach(sub => {
    sub.items.forEach(item => { totalAssets += item.balance })
  })
  
  // Calculate non-current assets total
  Object.values(groups['non-current-assets'].subsections).forEach(sub => {
    sub.items.forEach(item => { totalAssets += item.balance })
  })
  
  // Calculate current liabilities total
  Object.values(groups['current-liabilities'].subsections).forEach(sub => {
    sub.items.forEach(item => { totalLiabilities += item.balance })
  })
  
  // Calculate non-current liabilities total
  Object.values(groups['non-current-liabilities'].subsections).forEach(sub => {
    sub.items.forEach(item => { totalLiabilities += item.balance })
  })
  
  // Calculate equity total (including net income)
  Object.values(groups['owners-funds'].subsections).forEach(sub => {
    sub.items.forEach(item => { totalEquity += item.balance })
  })
  totalEquity += netIncome // Add net income to equity
  
  const container = document.getElementById('balanceSheetContainer')
  if (!container) {
    console.error('Balance sheet container not found')
    return
  }
  
  let html = `
    <div class="bs-container">
      <div class="bs-header">
        <h2>Balance Sheet</h2>
        <p>As at 31 March ${new Date().getFullYear()}</p>
        <p class="bs-currency">(Amount in Rs.)</p>
      </div>
      
      <table class="bs-table">
        <thead>
          <tr>
            <th class="col-sr">Sr. No.</th>
            <th class="col-particulars">Particulars</th>
            <th class="col-note">Note</th>
            <th class="col-amount">Current Year</th>
            <th class="col-amount">Previous Year</th>
          </tr>
        </thead>
        <tbody>
          <!-- EQUITY AND LIABILITIES -->
          <tr class="section-header">
            <td>I</td>
            <td colspan="4"><strong>EQUITY AND LIABILITIES</strong></td>
          </tr>
          
          <!-- Owners' Funds -->
          <tr class="sub-section-header">
            <td>1</td>
            <td colspan="4"><strong>Owners' Funds</strong></td>
          </tr>
          ${renderSubsection(groups['owners-funds'].subsections['owners-capital'], 'a', 'Owners Capital Account', 3)}
          ${renderSubsection(groups['owners-funds'].subsections['reserves-surplus'], 'b', 'Reserves and surplus', 4)}
          
          <!-- Non-current liabilities -->
          <tr class="sub-section-header">
            <td>2</td>
            <td colspan="4"><strong>Non-current liabilities</strong></td>
          </tr>
          ${renderSubsection(groups['non-current-liabilities'].subsections['long-term-borrowings'], 'a', 'Long-term borrowings', 5)}
          ${renderSubsection(groups['non-current-liabilities'].subsections['deferred-tax-liabilities'], 'b', 'Deferred tax liabilities (Net)', 6)}
          ${renderSubsection(groups['non-current-liabilities'].subsections['other-long-term-liabilities'], 'c', 'Other long-term liabilities', 7)}
          ${renderSubsection(groups['non-current-liabilities'].subsections['long-term-provisions'], 'd', 'Long-term provisions', 8)}
          
          <!-- Current liabilities -->
          <tr class="sub-section-header">
            <td>3</td>
            <td colspan="4"><strong>Current liabilities</strong></td>
          </tr>
          ${renderSubsection(groups['current-liabilities'].subsections['short-term-borrowings'], 'a', 'Short-term borrowings', 5)}
          ${renderSubsection(groups['current-liabilities'].subsections['trade-payables'], 'b', 'Trade payables', '')}
          ${renderSubsection(groups['current-liabilities'].subsections['other-current-liabilities'], 'c', 'Other current liabilities', 10)}
          ${renderSubsection(groups['current-liabilities'].subsections['short-term-provisions'], 'd', 'Short-term provisions', 8)}
          
          <tr class="total-row">
            <td></td>
            <td><strong>Total</strong></td>
            <td></td>
            <td><strong>${formatCurrency(totalLiabilities + totalEquity)}</strong></td>
            <td></td>
          </tr>
          
          <!-- ASSETS -->
          <tr class="section-header">
            <td>II</td>
            <td colspan="4"><strong>ASSETS</strong></td>
          </tr>
          
          <!-- Non-current assets -->
          <tr class="sub-section-header">
            <td>1</td>
            <td colspan="4"><strong>Non-current assets</strong></td>
          </tr>
          
          <tr class="group-header">
            <td>(a)</td>
            <td colspan="4"><strong>Property, Plant and Equipment and Intangible assets</strong></td>
          </tr>
          ${renderSubsection(groups['non-current-assets'].subsections['property-plant-equipment'], 'i', 'Property, Plant and Equipment', 11)}
          ${renderSubsection(groups['non-current-assets'].subsections['intangible-assets'], 'ii', 'Intangible assets', 11)}
          ${renderSubsection(groups['non-current-assets'].subsections['capital-work-in-progress'], 'iii', 'Capital work in progress', 11)}
          ${renderSubsection(groups['non-current-assets'].subsections['intangible-asset-development'], 'iv', 'Intangible asset under development', 11)}
          
          ${renderSubsection(groups['non-current-assets'].subsections['non-current-investments'], 'b', 'Non-current investments', 12)}
          ${renderSubsection(groups['non-current-assets'].subsections['deferred-tax-assets'], 'c', 'Deferred tax assets (Net)', 6)}
          ${renderSubsection(groups['non-current-assets'].subsections['long-term-loans-advances'], 'd', 'Long Term Loans and Advances', 13)}
          ${renderSubsection(groups['non-current-assets'].subsections['other-non-current-assets'], 'e', 'Other non-current assets', 14)}
          
          <!-- Current assets -->
          <tr class="sub-section-header">
            <td>2</td>
            <td colspan="4"><strong>Current assets</strong></td>
          </tr>
          ${renderSubsection(groups['current-assets'].subsections['current-investments'], 'a', 'Current investments', 12)}
          ${renderSubsection(groups['current-assets'].subsections['inventories'], 'b', 'Inventories', 15)}
          ${renderSubsection(groups['current-assets'].subsections['trade-receivables'], 'c', 'Trade receivables', 16)}
          ${renderSubsection(groups['current-assets'].subsections['cash-bank-balances'], 'd', 'Cash and bank balances', 17)}
          ${renderSubsection(groups['current-assets'].subsections['short-term-loans-advances'], 'e', 'Short Term Loans and Advances', 13)}
          ${renderSubsection(groups['current-assets'].subsections['other-current-assets'], 'f', 'Other current assets', 18)}
          
          <tr class="total-row">
            <td></td>
            <td><strong>Total</strong></td>
            <td></td>
            <td><strong>${formatCurrency(totalAssets)}</strong></td>
            <td></td>
          </tr>
        </tbody>
      </table>
      
      <div class="bs-balance-check">
        <p>Balance Check: ${Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1 ? 'BALANCED ✓' : 'NOT BALANCED ✗'}</p>
      </div>
    </div>
  `
  
  container.innerHTML = html
}

function renderSubsection(subsection, label, defaultLabel, noteNo) {
  const items = subsection ? subsection.items : []
  const labelText = subsection ? subsection.label : defaultLabel
  let total = 0
  let itemsHtml = ''
  
  items.forEach(item => {
    total += item.balance
    itemsHtml += `
      <tr class="account-row">
        <td></td>
        <td class="account-name">${item.name}</td>
        <td></td>
        <td class="amount">${formatCurrency(item.balance)}</td>
        <td></td>
      </tr>
    `
  })
  
  // Only show row if there are items or it's a main heading
  if (items.length === 0 && !label.match(/^[a-z]$/)) {
    return '' // Don't show empty sub-headings
  }
  
  return `
    <tr class="subsection-row">
      <td>${label}</td>
      <td>${labelText}</td>
      <td>${noteNo}</td>
      <td class="amount">${total > 0 ? formatCurrency(total) : ''}</td>
      <td></td>
    </tr>
    ${itemsHtml}
  `
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderBalanceSheet)
} else {
  renderBalanceSheet()
}
