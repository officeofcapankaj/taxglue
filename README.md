# BalanceIQ – Web-Based Balance Sheet Generator

A professional SaaS web application for generating **Balance Sheets (Statements of Financial Position)** directly from Trial Balance entries.

---

## 🚀 Features Implemented

### ✅ Core Features
- **Company Setup** – Enter company name, registration number, reporting period, and currency
- **Trial Balance Entry** – Manual row-by-row entry with account code, name, type, debit and credit columns
- **Account Heads/Categories** – Professional grouping of accounts under standard financial statement heads (e.g., Cash & Cash Equivalents, Trade Receivables, Property Plant & Equipment)
- **Auto-Classification** – Smart keyword-based auto-detection of account types as you type
- **CSV Import** – Import trial balance data from CSV files (with downloadable template)
- **Balance Validation** – Real-time debit/credit balance checking with visual indicators
- **Balance Sheet Generation** – Instant IFRS/GAAP-style Statement of Financial Position
- **P&L Integration** – Revenue and expense accounts auto-calculate Net Income for equity section
- **Export Options** – Multiple export formats:
  - **Excel Export** – Complete workbook with Balance Sheet, Trial Balance, P&L, and Account Details worksheets
  - **Word Export** – Professional formatted document with tables and structured layout
  - **PDF Export** – Print-ready PDF via html2canvas + jsPDF
  - **Print** – Direct printing with print-optimized CSS
- **Save & Load** – Persist multiple balance sheets via RESTful Table API
- **My Sheets** – View, open, and delete all saved balance sheets

### ✅ UI/UX
- Responsive design (desktop, tablet, mobile)
- Toast notifications for all user actions
- Confirmation modals for destructive actions
- Multi-currency support (USD, EUR, GBP, NGN, KES, ZAR, GHS, INR, CAD, AUD, JPY, CNY)
- Loading sample data for demo/testing

---

## 📁 File Structure

```
index.html                  # Main application HTML
css/
  └── style.css             # Full application styles
js/
  ├── data.js               # Account types, keyword map, API helpers, sample data
  ├── ui.js                 # Toast notifications, modal, view navigation
  ├── trialBalance.js       # Trial balance table management and CSV import
  ├── balanceSheet.js       # Balance sheet computation and HTML rendering
  └── app.js                # Main controller: events, persistence, PDF export
```

---

## 🔗 Application Entry Points

| Path | Description |
|------|-------------|
| `/` or `index.html` | Main application (Landing page) |
| Landing → Get Started | Opens Company Setup form |
| Landing → Load Sample | Loads sample trial balance data directly |
| Navbar → My Sheets | View all saved balance sheets |

---

## 📊 Data Models

### Table: `balance_sheets`
| Field | Type | Description |
|-------|------|-------------|
| `id` | text | Auto-generated UUID |
| `company_id` | text | Company reference |
| `title` | text | Balance sheet title |
| `period_end` | text | Reporting period end date (YYYY-MM-DD) |
| `status` | text | `draft` or `final` |
| `trial_balance_data` | rich_text | JSON array of trial balance entries |
| `notes` | rich_text | JSON with full company/meta info |

### Trial Balance Entry Object
```json
{
  "code": "1001",
  "name": "Cash and Cash Equivalents",
  "type": "current-assets",
  "debit": 50000,
  "credit": 0
}
```

### Account Types Supported
| Type Value | Label | Balance Sheet Side |
|------------|-------|--------------------|
| `current-assets` | Current Assets | Assets |
| `non-current-assets` | Non-Current Assets | Assets |
| `current-liabilities` | Current Liabilities | Liabilities |
| `non-current-liabilities` | Non-Current Liabilities | Liabilities |
| `equity` | Equity | Equity |
| `revenue` | Revenue (P&L) | Equity (via Net Income) |
| `expense` | Expense (P&L) | Equity (via Net Income) |

---

## 📐 Balance Sheet Logic

```
Total Assets = Current Assets + Non-Current Assets
Total Liabilities = Current Liabilities + Non-Current Liabilities
Net Income = Total Revenue – Total Expenses
Total Equity = Equity Accounts + Net Income
Total Liabilities & Equity = Total Liabilities + Total Equity
Balanced = (Total Assets == Total Liabilities & Equity)
```

---

## 📤 Export Functionality

### Excel Export Features
- **Multi-worksheet Workbook**: Complete financial package in one file
  - **Balance Sheet**: Professional format with account heads and subtotals
  - **Trial Balance**: All accounts with debit/credit columns and calculated balances
  - **Profit & Loss**: Revenue and expense accounts with net income calculation
  - **Account Details**: Detailed breakdown by account heads/categories
- **Auto-formatted**: Proper currency formatting, column widths, and styling
- **File naming**: `{CompanyName}_BalanceSheet_{PeriodEnd}.xlsx`

### Word Export Features
- **Professional Document**: Clean, business-ready formatting
- **Structured Layout**: Header with company info, formatted sections for Assets, Liabilities, and Equity
- **Account Headings**: Clear hierarchical organization with subtotals
- **Tables**: Trial Balance presented in a formatted table
- **Balance Indicators**: Visual indicators for balanced/unbalanced sheets
- **File naming**: `{CompanyName}_BalanceSheet_{PeriodEnd}.docx`

### Technical Implementation
- **Client-side Processing**: No server required - all processing happens in the browser
- **SheetJS Library**: Industry-standard Excel file generation
- **Docx Library**: Professional Word document creation
- **FileSaver.js**: Cross-browser file download functionality
- **Responsive**: Works on desktop, tablet, and mobile devices

---

## 🎯 CSV Import Format

Download the template from the app or use this format:

```csv
Account Code,Account Name,Account Type,Debit,Credit
1001,Cash and Cash Equivalents,current-assets,50000,
1002,Accounts Receivable,current-assets,30000,
1101,Plant & Equipment,non-current-assets,200000,
2001,Accounts Payable,current-liabilities,,25000
3001,Share Capital,equity,,255000
```

---

## 🔮 Recommended Next Steps

- [ ] **Comparative Balance Sheets** – Show prior period figures side by side
- [ ] **Adjusting Journal Entries** – Allow posting adjustments before generating BS
- [ ] **Notes to Financial Statements** – Add expandable notes per line item
- [ ] **Chart of Accounts** – Pre-defined chart of accounts templates per jurisdiction
- [ ] **Multiple Financial Reports** – Income Statement, Cash Flow Statement, Statement of Changes in Equity
- [ ] **User Authentication** – Multi-user support with company-level isolation
- [ ] **Audit Trail** – Track all edits and changes to entries
- [ ] **Excel Export** – Export balance sheet to Excel format
- [ ] **Custom Themes** – Branded PDF output with company logo
- [ ] **XBRL Output** – Machine-readable financial data format

---

## 🛠 Tech Stack

- **Frontend**: Pure HTML5, CSS3 (Custom Properties), Vanilla JavaScript (ES6+)
- **Icons**: Font Awesome 6.4
- **Fonts**: Google Fonts – Inter
- **PDF Export**: html2canvas + jsPDF (via CDN)
- **Data Persistence**: RESTful Table API
- **Styling**: Custom CSS with CSS Variables, Responsive Grid/Flexbox

---

*BalanceIQ – Professional financial reporting made simple.*
