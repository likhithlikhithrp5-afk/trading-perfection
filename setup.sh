#!/bin/bash

# Trade Journal AI - Demo Setup Script
# This script helps set up and run the application

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           Trade Journal AI - Setup Assistant              ║"
echo "║          Trade. Record. Analyze. Improve.                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "   Please install Node.js 16+ from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node --version) found"
echo "✅ npm $(npm --version) found"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo ""
    echo "⚠️  Please edit .env.local with your Supabase credentials:"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_ANON_KEY"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo ""
echo "1️⃣  Edit .env.local with Supabase credentials"
echo "2️⃣  Create database schema in Supabase:"
echo "    - Run SQL from: supabase/migrations/001_init.sql"
echo "3️⃣  Start development server:"
echo "    npm run dev"
echo "4️⃣  Open http://localhost:3000 in your browser"
echo ""
echo "📖 Documentation:"
echo "   - Setup: SETUP_GUIDE.md"
echo "   - Quick Reference: QUICK_REFERENCE.md"
echo "   - Deployment: DEPLOYMENT.md"
echo "   - Project Summary: PROJECT_SUMMARY.md"
echo ""
