# TaxGlue

TaxGlue is a web application designed to help users manage and file their taxes efficiently. It provides tools for tax preparation, data export, and integration with Supabase for data storage.

## Project Structure

- `server.py`: Main Python server application (Flask-based backend)
- `server_new.py`: Alternative server implementation
- `agent/`: AI agent code for tax-related automation
- `app/`: Frontend application components
- `js/`: JavaScript modules and utilities
- `css/`: Stylesheets
- `templates/`: HTML templates
- `data.js`: Data handling utilities
- `export.js`: Export functionality

## Setup Instructions

To set up the environment for TaxGlue, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/officeofcapankaj/taxglue.git
   cd taxglue
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables (copy from `.env.example`):
   ```bash
   cp .env.example .env
   # Edit .env with your actual values for DATABASE_URL and SECRET_KEY
   ```

4. Run the application:
   ```bash
   python server.py
   ```

The application will be available at `http://localhost:5000` (or the port specified in your environment).