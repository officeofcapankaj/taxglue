const table = document.getElementById("tbTable")

// ICAI Schedule III compliant account types for Non-Corporate Entities
const ACCOUNT_TYPES = [
  // Assets
  { value: 'Property Plant Equipment', label: 'Property, Plant & Equipment', category: 'Assets' },
  { value: 'Intangible Assets', label: 'Intangible Assets', category: 'Assets' },
  { value: 'Capital Work in Progress', label: 'Capital Work in Progress', category: 'Assets' },
  { value: 'Non-Current Investments', label: 'Non-Current Investments', category: 'Assets' },
  { value: 'Long Term Loans Advances', label: 'Long Term Loans & Advances', category: 'Assets' },
  { value: 'Other Non-Current Assets', label: 'Other Non-Current Assets', category: 'Assets' },
  { value: 'Current Investments', label: 'Current Investments', category: 'Assets' },
  { value: 'Inventories', label: 'Inventories', category: 'Assets' },
  { value: 'Trade Receivables', label: 'Trade Receivables', category: 'Assets' },
  { value: 'Cash Bank Balances', label: 'Cash & Bank Balances', category: 'Assets' },
  { value: 'Short Term Loans Advances', label: 'Short Term Loans & Advances', category: 'Assets' },
  { value: 'Other Current Assets', label: 'Other Current Assets', category: 'Assets' },
  // Liabilities
  { value: 'Owners Capital', label: "Owner's Capital Account", category: 'Liabilities' },
  { value: 'Reserves Surplus', label: 'Reserves & Surplus', category: 'Liabilities' },
  { value: 'Long Term Borrowings', label: 'Long-Term Borrowings', category: 'Liabilities' },
  { value: 'Deferred Tax Liabilities', label: 'Deferred Tax Liabilities', category: 'Liabilities' },
  { value: 'Other Long Term Liabilities', label: 'Other Long-Term Liabilities', category: 'Liabilities' },
  { value: 'Long Term Provisions', label: 'Long-Term Provisions', category: 'Liabilities' },
  { value: 'Short Term Borrowings', label: 'Short-Term Borrowings', category: 'Liabilities' },
  { value: 'Trade Payables', label: 'Trade Payables', category: 'Liabilities' },
  { value: 'Other Current Liabilities', label: 'Other Current Liabilities', category: 'Liabilities' },
  { value: 'Short Term Provisions', label: 'Short-Term Provisions', category: 'Liabilities' },
  // Income (Revenue)
  { value: 'Revenue from Operations', label: 'Revenue from Operations', category: 'Income' },
  { value: 'Other Income', label: 'Other Income', category: 'Income' },
  // Expenses
  { value: 'Cost of Goods Sold', label: 'Cost of Goods Sold', category: 'Expense' },
  { value: 'Employee Benefits Expense', label: 'Employee Benefits Expense', category: 'Expense' },
  { value: 'Finance Costs', label: 'Finance Costs', category: 'Expense' },
  { value: 'Depreciation', label: 'Depreciation & Amortization', category: 'Expense' },
  { value: 'Other Expenses', label: 'Other Expenses', category: 'Expense' }
]

document.getElementById("addRow").onclick = () => {

  const row = table.insertRow()
  
  // Create cells using DOM methods to prevent XSS
  const cell0 = row.insertCell(0)
  const input0 = document.createElement("input")
  input0.type = "text"
  input0.placeholder = "Account Name"
  cell0.appendChild(input0)
  
  // Account Type dropdown (main category)
  const cell1 = row.insertCell(1)
  const select1 = document.createElement("select")
  select1.className = "account-type-select"
  const mainCategories = ["Assets", "Liabilities", "Income", "Expense"]
  mainCategories.forEach(cat => {
    const option = document.createElement("option")
    option.value = cat
    option.textContent = cat
    select1.appendChild(option)
  })
  cell1.appendChild(select1)
  
  // Account Head dropdown (specific classification)
  const cell2 = row.insertCell(2)
  const select2 = document.createElement("select")
  select2.className = "account-head-select"
  ACCOUNT_TYPES.forEach(acc => {
    const option = document.createElement("option")
    option.value = acc.value
    option.textContent = acc.label
    select2.appendChild(option)
  })
  cell2.appendChild(select2)
  
  // Sub-head (optional)
  const cell3 = row.insertCell(3)
  const input3 = document.createElement("input")
  input3.type = "text"
  input3.placeholder = "Sub-head (optional)"
  cell3.appendChild(input3)
  
  // Debit amount
  const cell4 = row.insertCell(4)
  const input4 = document.createElement("input")
  input4.type = "number"
  input4.placeholder = "Debit"
  input4.min = "0"
  input4.step = "0.01"
  cell4.appendChild(input4)
  
  // Credit amount
  const cell5 = row.insertCell(5)
  const input5 = document.createElement("input")
  input5.type = "number"
  input5.placeholder = "Credit"
  input5.min = "0"
  input5.step = "0.01"
  cell5.appendChild(input5)
}

document.getElementById("saveTB").onclick = () => {

let data = []
let hasError = false

for(let i=1;i<table.rows.length;i++){

const cells = table.rows[i].cells
const accountName = cells[0].children[0].value.trim()
const debit = Number(cells[4].children[0].value || 0)
const credit = Number(cells[5].children[0].value || 0)

// Skip empty rows
if(!accountName && debit === 0 && credit === 0) {
  continue
}

// Validate: account name required, and either debit or credit must have value
if(!accountName) {
  alert(`Please enter account name in row ${i}`)
  cells[0].children[0].focus()
  hasError = true
  break
}

if(debit === 0 && credit === 0) {
  alert(`Please enter debit or credit amount in row ${i}`)
  cells[4].children[0].focus()
  hasError = true
  break
}

data.push({

account: accountName,
main: cells[1].children[0].value,
sub1: cells[2].children[0].value,
sub2: cells[3].children[0].value,
debit: debit,
credit: credit

})

}

if(hasError) {
  return
}

localStorage.setItem("trialBalance",JSON.stringify(data))

alert("Trial Balance Saved")

}
