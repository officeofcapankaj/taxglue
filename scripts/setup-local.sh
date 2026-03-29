#!/bin/bash
# TaxGlue Local Development Setup Script
# Usage: ./scripts/setup-local.sh

set -e

echo "=========================================="
echo "TaxGlue Local Development Setup"
echo "=========================================="

# Check prerequisites
echo ""
echo "[1/5] Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js v18+ from https://nodejs.org"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "Error: Python is not installed"
    echo "Please install Python 3.9+ from https://python.org"
    exit 1
fi

echo "✓ Node.js: $(node --version)"
echo "✓ Python: $(python3 --version)"

# Install Node dependencies
echo ""
echo "[2/5] Installing Node dependencies..."
npm install

# Install Python dependencies
echo ""
echo "[3/5] Installing Python dependencies..."
pip3 install -r requirements.txt

# Set up environment file
echo ""
echo "[4/5] Setting up environment variables..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✓ Created .env.local from .env.example"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local and add your Supabase credentials:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_ANON_KEY"
    echo "   Get these from https://app.supabase.com/project/YOUR_PROJECT/settings/api"
else
    echo "✓ .env.local already exists"
fi

# Check Supabase CLI
echo ""
echo "[5/5] Checking Supabase CLI..."
if command -v supabase &> /dev/null; then
    echo "✓ Supabase CLI installed: $(supabase --version)"
else
    echo "⚠️  Supabase CLI not found"
    echo "   Install from: https://github.com/supabase/cli"
    echo "   Or run: npm install -g supabase"
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Supabase credentials"
echo "2. Start Supabase locally: supabase start"
echo "3. Run the server: python3 server.py"
echo "4. Open http://localhost:3000"
echo ""