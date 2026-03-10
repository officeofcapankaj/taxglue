# TaxGlu - Web-Based Bookkeeping Software

A full-featured web-based bookkeeping application inspired by Akaunting architecture. Built with Python Flask and modern frontend technologies.

![TaxGlu](https://img.shields.io/badge/TaxGlu-Bookkeeping-blue)

## Features

- **User Authentication** - Secure login system with role-based access
- **Client Management** - Manage multiple clients with GSTIN support
- **Chart of Accounts** - Full COA with Nature (Assets/Liabilities/Income/Expense) and Types
- **Voucher System** - Journal, Payment, Receipt, Contra vouchers with double-entry bookkeeping
- **Trial Balance** - Real-time trial balance calculation
- **Balance Sheet** - Assets vs Liabilities report
- **Profit & Loss Statement** - Income vs Expenses report
- **Financial Year Support** - Multiple FY support per client

## Tech Stack

- **Backend:** Python Flask
- **Frontend:** Vanilla JavaScript + Tailwind CSS
- **Database:** JSON file-based (easily upgradeable to SQLite/PostgreSQL)

## Installation

```bash
# Clone the repository
git clone https://github.com/officeofcapankaj/taxglue.git
cd taxglue

# Install dependencies
pip install flask flask-cors

# Run the server
python server.py
```

## Usage

1. Open http://localhost:3000 in your browser
2. Login with default credentials:
   - **Email:** admin@taxglue.com
   - **Password:** admin123

## Default Chart of Accounts

When you add a new client, these default accounts are created:

| Code | Account Name | Nature | Type |
|------|--------------|--------|------|
| 001 | Capital Account | Liabilities | Capital |
| 002 | Cash in Hand | Assets | Direct |
| 003 | Cash at Bank | Assets | Direct |
| 004 | Sundry Debtors | Assets | Direct |
| 005 | Sundry Creditors | Liabilities | Direct |
| 006 | Sales | Income | Revenue |
| 007 | Purchase | Expense | Direct |
| 008 | Salaries | Expense | Direct |
| 009 | Rent | Expense | Indirect |
| 010 | Interest Received | Income | Revenue |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| GET | /api/auth/me | Get current user |
| GET/POST | /api/clients | Client management |
| GET/POST | /api/accounts | Chart of accounts |
| GET/POST | /api/vouchers | Voucher entries |
| GET | /api/reports/trial-balance/:clientId | Trial Balance |
| GET | /api/reports/balance-sheet/:clientId | Balance Sheet |
| GET | /api/reports/profit-loss/:clientId | P&L Statement |

## Deployment

### Deploy to Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway deploy
```

### Deploy to Render
1. Connect your GitHub repository to Render
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `python server.py`

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## License

MIT License - Feel free to use and modify for your needs.

## Author

TaxGlu - Bookkeeping Made Simple
