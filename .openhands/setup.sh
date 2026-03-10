#!/bin/bash

# TaxGlue OpenHands Setup Script
# Runs automatically when starting an OpenHands conversation

echo "Setting up TaxGlue development environment..."

# Check if we're in the taxglue project directory
if [ -f "package.json" ]; then
    echo "Installing npm dependencies..."
    npm install 2>/dev/null || echo "npm install skipped (using CDN)"
fi

# Verify key files exist
if [ -f "app/login.html" ]; then
    echo "✓ Login page found"
fi

if [ -f "app/dashboard.html" ]; then
    echo "✓ Dashboard found"
fi

if [ -f "js/config.js" ]; then
    echo "✓ Config found"
fi

# Verify Supabase credentials are configured
if grep -q "jgjeuybgideeqcjxvlmn" js/config.js 2>/dev/null; then
    echo "✓ Supabase URL configured"
fi

echo "Setup complete! Ready to work on TaxGlue."
