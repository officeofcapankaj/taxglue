# TaxGlue Project Documentation

## Overview

TaxGlue is a comprehensive tax compliance and bookkeeping management system built with:
- **Frontend**: Vanilla JavaScript with HTML/CSS
- **Backend**: Python Flask + Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Deployment**: Vercel + GitHub Pages

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                            │
│  (HTML/CSS/JS)                                            │
│  - Dashboard                                              │
│  - TDS Module                                             │
│  - GST Module                                             │
│  - Income Tax Module                                      │
│  - Clients Management                                     │
│  - Bookkeeping                                            │
│  - Payroll                                                │
└──────────────────────────┬──────────────────────────────────┘
                          │ REST API
┌──────────────────────────▼──────────────────────────────────┐
│                    Flask Backend                           │
│  (Python)                                                 │
│  - REST API Endpoints                                     │
│  - Business Logic                                         │
│  - Integration with Supabase                               │
└──────────────────────────┬──────────────────────────────────┘
                          │
┌──────────────────────────▼──────────────────────────────────┐
│                    Supabase Backend                        │
│  - PostgreSQL Database                                    │
│  - Authentication                                         │
│  - Row Level Security                                     │
│  - Storage Buckets                                        │
│  - Edge Functions                                         │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
taxglue/
├── app/                    # Frontend HTML pages
│   ├── dashboard.html
│   ├── tds.html
│   ├── gst.html
│   ├── incometax.html
│   ├── clients.html
│   └── login.html
├── supabase/              # Supabase configuration
│   ├── migrations/        # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_auth_triggers.sql
│   │   └── 003_storage_config.sql
│   ├── functions/         # Edge functions
│   │   ├── tds-calculate/
│   │   ├── tds-generate-return/
│   │   ├── gst-calculate/
│   │   └── it-calculate/
│   ├── seeds/             # Seed data
│   ├── supabase-client.js # Frontend Supabase client
│   └── config.toml
├── server.py              # Flask backend
├── tests/                 # Test files
├── vercel.json            # Vercel configuration
└── .github/workflows/    # GitHub Actions
```

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (extends auth.users) |
| `clients` | Client information |
| `accounts` | Chart of accounts |
| `vouchers` | Financial vouchers |
| `trial_balance` | Trial balance data |

### TDS Module Tables

| Table | Description |
|-------|-------------|
| `tds_deductors` | TDS deductors (employers) |
| `tds_deductees` | TDS deductees (employees/contractors) |
| `tds_transactions` | TDS transactions |
| `tds_challans` | TDS challans |
| `tds_returns` | TDS returns |
| `tds_section_rates` | TDS section rates reference |

### GST Module Tables

| Table | Description |
|-------|-------------|
| `gst_invoices` | GST invoices |
| `gst_returns` | GST returns |
| `eway_bills` | E-way bills |
| `gst_rates` | GST rates reference |

### Income Tax Module Tables

| Table | Description |
|-------|-------------|
| `income_tax_returns` | ITR filings |
| `form16` | Form 16 certificates |
| `tax_computations` | Tax computations |

### Additional Tables

| Table | Description |
|-------|-------------|
| `employees` | Payroll employees |
| `salary_structures` | Salary structures |
| `salary_payments` | Salary payments |
| `documents` | Document metadata |
| `audit_logs` | Audit trail |

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### TDS
- `GET /api/tds/rates` - Get TDS rates
- `GET/POST /api/tds/deductors` - Manage deductors
- `GET/POST /api/tds/deductees` - Manage deductees
- `GET/POST /api/tds/transactions` - Manage transactions
- `GET/POST /api/tds/challans` - Manage challans
- `GET/POST /api/tds/returns` - Manage returns
- `POST /api/tds/calculate` - Calculate TDS

### GST
- `GET /api/gst/rates` - Get GST rates
- `GET/POST /api/gst/invoices` - Manage invoices
- `GET/POST /api/gst/returns` - Manage returns
- `GET/POST /api/gst/ewaybills` - Manage e-way bills
- `GET /api/gst/summary` - Get GST summary

### Income Tax
- `GET /api/it/summary` - Get IT summary
- `GET/POST /api/it/itr` - Manage ITR filings
- `GET/POST /api/it/form16` - Manage Form 16

### Clients
- `GET/POST /api/clients` - Manage clients

### Bookkeeping
- `GET/POST /api/accounts` - Manage accounts
- `GET/POST /api/vouchers` - Manage vouchers
- `GET /api/reports/trial-balance/:client_id` - Trial balance

## Setting Up Supabase

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note the project URL and anon key

### 2. Configure Environment Variables

```bash
# In your deployment platform or .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run Migrations

In Supabase SQL Editor, run the migration files in order:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_auth_triggers.sql`
3. `supabase/migrations/003_storage_config.sql`

### 4. Seed Data

Run: `supabase/seeds/001_seed_data.sql`

### 5. Deploy Edge Functions

```bash
supabase functions deploy tds-calculate
supabase functions deploy tds-generate-return
supabase functions deploy gst-calculate
supabase functions deploy it-calculate
```

## Row Level Security (RLS)

All tables have RLS enabled with policies:

- **Users** can only access their own data
- **Admins** can access all records
- **Clients** can only access their own documents

### RLS Policy Examples

```sql
-- Users can manage their own clients
CREATE POLICY "Users can manage own clients" ON clients
  FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Anyone can read TDS rates (reference table)
CREATE POLICY "Anyone can read tds_section_rates" 
  ON tds_section_rates FOR SELECT USING (true);
```

## Storage Buckets

| Bucket | Purpose | Size Limit |
|--------|---------|------------|
| `documents` | General documents | 50MB |
| `client-files` | Client-specific files | 100MB |
| `avatars` | User avatars | 5MB |

## Running Tests

### Python Tests

```bash
# Install dependencies
pip install flask pytest

# Run tests
pytest tests/test_server.py -v

# Run with coverage
pytest tests/test_server.py --cov
```

### JavaScript Tests

```bash
cd tests
npm install
npm test
```

## Deployment

### Vercel (Backend)

1. Connect GitHub repo to Vercel
2. Set environment variables
3. Deploy automatically on push

### GitHub Pages (Frontend)

1. Enable GitHub Pages in repo settings
2. Select main branch
3. Deploy happens automatically

## Security

- All passwords hashed with bcrypt
- JWT tokens for session management
- RLS policies on all tables
- SQL injection prevention via parameterized queries
- CORS configured for allowed origins

## Development

### Running Locally

```bash
# Python backend
pip install -r requirements.txt
python server.py

# Frontend (serve with any static server)
python -m http.server 3000
```

### Supabase CLI (Local Development)

```bash
# Start local Supabase
supabase start

# Pull remote schema
supabase db pull

# Push local changes
supabase db push

# Generate types
supabase gen types typescript --local > supabase/types.ts
```

## License

MIT License
