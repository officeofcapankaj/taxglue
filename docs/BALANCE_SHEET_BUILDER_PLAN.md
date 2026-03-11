# TaxGlue Financial Statements Builder - Implementation Plan

## Overview

Based on analysis of the sample Excel file (`sample balance sheet for taxglue.xlsx`), this document outlines the process for building financial statements from trial balance data.

---

## 1. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TAXGLUE DATA FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐     ┌──────────────────┐     ┌────────────────────┐
    │   TRIAL      │     │    NOTES TO      │     │    FINANCIAL      │
    │   BALANCE    │────▶│    ACCOUNTS      │────▶│    STATEMENTS     │
    │              │     │                  │     │                   │
    │ (Raw Data)   │     │ (Classified)    │     │ (BS, PL, CF)     │
    └──────────────┘     └──────────────────┘     └────────────────────┘
           │                      │                        │
           │                      │                        │
           ▼                      ▼                        ▼
    ┌──────────────┐     ┌──────────────────┐     ┌────────────────────┐
    │  Classify    │     │  Build Notes     │     │  Generate Output   │
    │  Accounts    │     │  (Sub-sheets)   │     │  (Print-ready)     │
    └──────────────┘     └──────────────────┘     └────────────────────┘
```

---

## 2. Trial Balance Structure (Input)

### Current Database Schema

The **trial_balance** table stores:

| Field | Type | Description |
|-------|------|-------------|
| `id` | SERIAL | Primary key |
| `client_id` | BIGINT | Links to client |
| `financial_year` | TEXT | FY like "2024-25" |
| `as_on_date` | DATE | Reporting date |
| `account_name` | TEXT | Account name |
| `debit` | NUMERIC | Debit balance |
| `credit` | NUMERIC | Credit balance |

### Required Enhancement - Account Classification

We need to add **account classification** fields to map accounts to financial statement line items:

```sql
ALTER TABLE trial_balance ADD COLUMN IF NOT EXISTS account_type TEXT;
ALTER TABLE trial_balance ADD COLUMN IF NOT EXISTS account_category TEXT;
ALTER TABLE trial_balance ADD COLUMN IF NOT EXISTS nature TEXT;
```

### Classification Mapping

| Account Group | Category | Nature | BS Section |
|--------------|----------|--------|------------|
| Capital Account | Proprietor's Fund | Liability | Liabilities |
| Reserve & Surplus | Proprietor's Fund | Liability | Liabilities |
| Secured Loans | Non-Current Liab. | Liability | Liabilities |
| Unsecured Loans | Non-Current Liab. | Liability | Liabilities |
| Sundry Creditors | Current Liab. | Liability | Liabilities |
| Duties and Taxes | Current Liab. | Liability | Liabilities |
| Provision for Tax | Current Liab. | Liability | Liabilities |
| | | | |
| Fixed Assets | Non-Current Asset | Asset | Assets |
| Investments | Non-Current Asset | Asset | Assets |
| Sundry Debtors | Current Asset | Asset | Assets |
| Inventory | Current Asset | Asset | Assets |
| Cash & Bank | Current Asset | Asset | Assets |
| Loans & Advances | Current Asset | Asset | Assets |
| | | | |
| Sales | Revenue | Income | P&L |
| Other Income | Revenue | Income | P&L |
| Purchases | Direct Expense | Expense | P&L |
| Direct Expenses | Direct Expense | Expense | P&L |
| Indirect Expenses | Indirect Expense | Expense | P&L |

---

## 3. Classification Process

### Step 1: Import Trial Balance

```javascript
// Import from Excel/CSV
// Map accounts to classification
{
  account_name: "HDFC CC A/c",
  debit: 9407705.99,
  credit: 0,
  account_type: "Secured Loans",      // BS Line Item
  account_category: "Current Liabilities", // BS Category
  nature: "Liability"
}
```

### Step 2: Auto-Classification Rules

Create rules to auto-classify accounts based on keywords:

| Keyword Pattern | Classified As |
|----------------|--------------|
| "Capital", "Owner", "Partner" | Capital Account |
| "Reserve", "Surplus", "Fund" | Reserve & Surplus |
| "HDFC", "Bank", "Loan" | Secured Loans |
| "Creditor", "Payable" | Sundry Creditors |
| "Debtor", "Receivable" | Sundry Debtors |
| "GST", "TDS", "TCS", "Tax" | Duties and Taxes |
| "Fixed Asset", "Plant", "Machinery" | Fixed Assets |
| "Inventory", "Stock" | Inventory |
| "Cash", "Bank" | Cash & Bank |
| "Sales" | Sales |
| "Purchase" | Purchases |
| "Salary", "Rent", "Wages" | Expenses |

### Step 3: Manual Override

Allow users to manually override classification in the UI.

---

## 4. Notes to Accounts (Intermediate Layer)

### Purpose

Notes to accounts provide the detailed breakdown that feeds into the main financial statements.

### Structure (Following Excel Model)

| Sheet Name | Note No. | Description |
|------------|----------|------------|
| BS Lia | 1 | Capital Account |
| BS Lia | 2 | Reserves and Surplus |
| BS Lia | 3-5 | Long-term Borrowings |
| BS Lia | 6 | Deferred Tax Liabilities |
| BS Assets | 7 | Fixed Assets |
| BS Assets | 8 | Investments |
| BS Assets | 9 | Deferred Tax Assets |
| PL Det | 12 | Revenue from Operations |
| PL Det | 13 | Other Income |
| PL Det | 14 | Purchase of Stock-in-Trade |
| PL Det | 15 | Changes in Inventory |
| PL Det | 16-21 | Employee Benefits |
| PL Det | 22-25 | Depreciation |
| PL Det | 26-30 | Finance Costs |

### Formula Placement

Following the Excel model:

```
BS!D10 (Capital A/c) = 'BS Lia'!H13
BS!E10 (Capital A/c PY) = 'BS Lia'!I13
```

Each note sheet has:
- **Column H**: Current Year Total
- **Column I**: Previous Year Total

---

## 5. Financial Statements Generation

### Balance Sheet Structure

```
┌────────────────────────────────────────────────────────────┐
│                 BALANCE SHEET                               │
│  As at 31.03.2025                                          │
├────────────────────────────────────────────────────────────┤
│ PARTICULARS              │ NOTE NO. │ CY     │ PY         │
├────────────────────────────────────────────────────────────┤
│ I. OWNERS' FUNDS AND LIABILITIES                           │
│ (1) Proprietor's Fund                                      │
│     (a) Capital Account      │ 1      │ 15012174│ 12874544 │
│     (b) Reserves & Surplus  │ 2      │ 0       │ 0        │
│                                            (HIDDEN if 0)  │
├────────────────────────────────────────────────────────────┤
│ (2) Non-Current Liabilities                                │
│     (a) Long-term Borrowings  │ 3     │ [value] │ [value]  │
│     (b) Deferred Tax Liab.   │ 6     │ [value] │ [value]  │
│                                            (HIDDEN if 0)  │
├────────────────────────────────────────────────────────────┤
│ (3) Current Liabilities                                   │
│     (a) Short-term Borrowings │ 4     │ [value] │ [value]  │
│     (b) Trade Payables       │ 5     │ [value] │ [value]  │
│     (c) Other Current Liab.  │ 6     │ [value] │ [value]  │
├────────────────────────────────────────────────────────────┤
│ TOTAL LIABILITIES                        │ [TOTAL] │ [TOTAL] │
└────────────────────────────────────────────────────────────┘
```

### Profit & Loss Structure

```
┌────────────────────────────────────────────────────────────┐
│            PROFIT AND LOSS STATEMENT                        │
│  For the year ended 31.03.2025                             │
├────────────────────────────────────────────────────────────┤
│ PARTICULARS              │ NOTE NO. │ CURRENT  │ PREVIOUS │
├────────────────────────────────────────────────────────────┤
│ I. Revenue from Operations│ 12      │ 348717955│ 520171626│
│ II. Other Income        │ 13      │ 5483    │ 70853    │
├────────────────────────────────────────────────────────────┤
│ III. Total Income        │         │ 348723438│ 520242479│
├────────────────────────────────────────────────────────────┤
│ IV. Expenses:                                         │
│     Purchase of Stock     │ 14      │ 341333994│ 511749358│
│     Changes in Inventory  │ 15      │ 2625450  │ 2560576  │
│     Employee Benefits     │ 16      │ [value]  │ [value]  │
│     Depreciation         │ 22-25   │ [value]  │ [value]  │
│     Finance Costs        │ 26      │ [value]  │ [value]  │
│     Other Expenses       │ 27      │ [value]  │ [value]  │
├────────────────────────────────────────────────────────────┤
│ V. Profit Before Tax     │         │ [value]  │ [value]  │
│ VI. Tax Expense         │         │ [value]  │ [value]  │
├────────────────────────────────────────────────────────────┤
│ VII. Profit for Period   │         │ [value]  │ [value]  │
└────────────────────────────────────────────────────────────┘
```

---

## 6. Dynamic Column/Row Hiding

### The Excel Model

Based on analysis:

1. **Hidden Rows**: Rows with zero values are hidden in the output
   - Example: Row 11 (Reserves & Surplus) is HIDDEN because value = 0
   
2. **Formula-based Calculation**:
   - Row 10: `=BS_Lia!H13` (Capital - has value, VISIBLE)
   - Row 11: `=BS_Lia!E22` (Reserves - value = 0, HIDDEN)

### Implementation in TaxGlue

```javascript
// Pseudocode for hiding rows
function renderBalanceSheet(trialBalanceData) {
    const liabilities = calculateLiabilities(trialBalanceData);
    
    liabilities.forEach(item => {
        if (item.value === 0) {
            // Hide row in display
            item.hidden = true;
        }
    });
    
    return liabilities;
}

// In HTML template
{{#each balanceSheetItems}}
  {{#unless this.hidden}}
  <tr>
    <td>{{this.name}}</td>
    <td>{{this.noteNumber}}</td>
    <td>{{formatCurrency this.currentYear}}</td>
    <td>{{formatCurrency this.previousYear}}</td>
  </tr>
  {{/unless}}
{{/each}}
```

---

## 7. Formula Linking System

### How Excel Links Work (Reference)

```
Trial Balance (Raw)
     │
     ▼
┌─────────────────────────────────────────┐
│  Notes to Accounts (Detailed)           │
│  - BS Lia sheet (Capital, Loans, etc.)  │
│  - BS Assets (Fixed Assets, Invest.)   │
│  - PL Det (Revenue, Expenses)          │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  Main Statements (Summary)              │
│  - BS (Balance Sheet)                  │
│  - PL (Profit & Loss)                  │
│  - CF (Cash Flow)                      │
└─────────────────────────────────────────┘
```

### TaxGlue Implementation

```javascript
// In financial-statements.html
// Map trial balance to notes
const noteMappings = {
    capital: {
        noteNumber: 1,
        trialBalanceAccounts: ['Capital Account', 'Owner\'s Capital', 'Partner\'s Capital'],
        targetCell: 'BS_Lia!H13'
    },
    reserves: {
        noteNumber: 2,
        trialBalanceAccounts: ['Reserve', 'Surplus', 'Profit & Loss'],
        targetCell: 'BS_Lia!H22'
    },
    // ... etc
};

function buildNoteFromTrialBalance(noteKey, trialBalance) {
    const mapping = noteMappings[noteKey];
    const accounts = trialBalance.filter(tb => 
        mapping.trialBalanceAccounts.some(pattern => 
            tb.account_name.toLowerCase().includes(pattern.toLowerCase())
        )
    );
    
    // Sum up current year and previous year
    const currentYear = accounts.reduce((sum, acc) => sum + (acc.credit - acc.debit), 0);
    const previousYear = 0; // Would need previous year data
    
    return {
        noteNumber: mapping.noteNumber,
        accounts: accounts,
        currentYear: currentYear,
        previousYear: previousYear
    };
}
```

---

## 8. Print/Export Optimization

### Column Visibility

Based on the Excel analysis:

| Column | Purpose | Visible in Print |
|--------|---------|------------------|
| A | Empty | No |
| B | Account Name | YES |
| C | Note Number | YES |
| D | Current Year | YES |
| E | Previous Year | YES |
| F-N | Calculations | No (hidden) |

### Implementation

```javascript
// When exporting to PDF/Excel
function prepareForPrint(financialData) {
    // Remove calculation columns
    const printData = {
        columns: ['accountName', 'noteNumber', 'currentYear', 'previousYear'],
        rows: financialData.filter(row => row.currentYear !== 0 || row.previousYear !== 0)
    };
    
    return printData;
}
```

---

## 9. Implementation Phases

### Phase 1: Database Enhancement
- [ ] Add classification fields to trial_balance table
- [ ] Create classification rules table
- [ ] Add user override capability

### Phase 2: Import/Classification
- [ ] Import from Excel/CSV with auto-classification
- [ ] Manual classification UI
- [ ] Bulk classification tools

### Phase 3: Notes Generator
- [ ] Create note templates (Capital, Loans, Fixed Assets, etc.)
- [ ] Map trial balance → notes
- [ ] Formula calculations in notes

### Phase 4: Financial Statements
- [ ] Balance Sheet generation
- [ ] Profit & Loss Statement
- [ ] Cash Flow Statement

### Phase 5: Output
- [ ] Dynamic row hiding (zero values)
- [ ] Print-optimized columns
- [ ] PDF/Excel export

---

## 10. Key Takeaways from Excel Analysis

1. **Three-Layer Architecture**:
   - Layer 1: Trial Balance (raw data)
   - Layer 2: Notes to Accounts (classified breakdown)
   - Layer 3: Financial Statements (summary)

2. **Formula-Based Linking**:
   - BS pulls from Notes sheets, not directly from Trial Balance
   - Each note has its own calculation logic

3. **Conditional Display**:
   - Rows with zero values are hidden
   - Only "printable" columns shown in final output

4. **Multiple Years**:
   - Current Year and Previous Year columns
   - Formulas handle year-over-year comparison

5. **Account Classification**:
   - Critical for proper mapping
   - Needs both account type AND nature (Asset/Liability/Income/Expense)

---

*Document Version: 1.0*
*Based on: sample balance sheet for taxglue.xlsx analysis*
