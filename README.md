# TaxGlue

TaxGlue is a web application designed to help users manage and file their taxes efficiently. It provides tools for tax preparation, data export, and integration with Supabase for data storage.

Built with ❤️ for Chartered Accountants and tax professionals.

## Project Structure

- [`server.py`](server.py): Python Flask server (for local development)
- [`server_new.py`](server_new.py): Alternative server implementation
- [`vercel.json`](vercel.json): Vercel deployment configuration
- [`agent/`](agent/): AI agent code for tax-related automation
- [`app/`](app/): Frontend application pages
- [`modules/`](modules/): Feature modules (Trial Balance, Stock Statement, etc.)
- [`js/`](js/): JavaScript modules and utilities
- [`css/`](css/): Stylesheets
- [`templates/`](templates/): HTML templates
- [`data/`](data/): Sample data and company data
- [`database/`](database/): Supabase database migrations and schemas
- [`tests/`](tests/): Test files

## Architecture

- **Frontend**: Vanilla JavaScript with Bootstrap 5
- **Backend**: Vercel Serverless Functions / Python Flask (local)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Deployment

The application is deployed on Vercel. All changes pushed to the `main` branch automatically deploy to [https://www.taxglue.in](https://www.taxglue.in)

### Environment Variables (Vercel)

Required environment variables in Vercel dashboard:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key (public)

## Setup Instructions (Local Development)

1. Clone the repository:
   ```bash
   git clone https://github.com/officeofcapankaj/taxglue.git
   cd taxglue
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (copy from `.env.example`):
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. Run the Python server (for local development):
   ```bash
   pip install -r requirements.txt
   python server.py
   ```

5. For testing:
   ```bash
   python -m pytest tests/
   ```

The application will be available at `http://localhost:5000` (or the port specified in your environment).

## Features

- Trial Balance management
- Financial Statements generation
- Stock Statement for bank submissions
- TDS (Tax Deducted at Source) management
- GST compliance
- Income Tax filings
- Bookkeeping