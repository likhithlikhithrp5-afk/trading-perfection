# Trade Journal AI - Complete Setup Guide

A professional web application for personal trading journal and trading-performance analytics.

> "Trade. Record. Analyze. Improve."

## Quick Start

### 1. Prerequisites

- Node.js 16+ and npm
- Supabase account (free tier works perfectly)
- Modern web browser

### 2. Installation

```bash
# Clone the repository
cd trade-journal-ai

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### 3. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Project Settings → API Keys
4. Copy the `anon public key` and `Project URL`
5. Add these to your `.env.local`:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Database Schema

1. In Supabase, go to SQL Editor
2. Create a new query
3. Copy the contents of `supabase/migrations/001_init.sql`
4. Run the query to create all tables and RLS policies

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Implemented

### ✅ Authentication
- Email/Password signup and signin
- Secure session management
- Protected routes

### ✅ Infrastructure
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Zustand for state management
- Supabase integration with RLS

### ✅ P&L Calculations
- Automatic gross P&L calculation (BUY and SELL)
- Charge deductions (brokerage, government, other)
- Daily aggregation
- Monthly/Yearly summaries
- Win rate and streak calculations

### ✅ Data Management
- Secure database with Row Level Security
- User data isolation
- Proper data relationships

### 📋 In Progress / Planned

- Dashboard with all metrics
- Trader's Diary with calendar
- Trading checklist
- Psychology tracking
- Screenshot uploads
- AI trading assistant
- Analytics and charts
- Portfolio tracking
- Watchlist
- Orders management
- Dividends tracking

## Project Structure

```
src/
├── components/         # React components
│   ├── dashboard/     # Dashboard components
│   ├── diary/         # Diary components
│   ├── calendar/      # Calendar components
│   ├── trades/        # Trade components
│   ├── ai/            # AI components
│   └── common/        # Common components
├── pages/             # Page components (routes)
├── services/          # Business logic
│   ├── supabase/      #  Database services
│   ├── ai/            # AI provider
│   └── calculations/  # P&L calculations
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
├── types/             # TypeScript types
├── lib/               # Library configs
└── App.tsx            # Main app component
```

## Database Schema

### Main Tables

- **profiles** - User information
- **capital_settings** - Base capital tracking
- **trades** - Individual trade records
- **trading_days** - Daily P&L aggregations
- **diary_entries** - Daily notes
- **daily_checklists** - Trading rule responses
- **psychology_entries** - Trading psychology tracking
- **strategies** - Named trading strategies
- **trade_images** - Trade screenshots
- **ai_conversations** - AI chat history
- **ai_trade_analyses** - AI analysis results
- **watchlist** - Monitored symbols
- **portfolio** - Holdings
- **orders** - Order records
- **dividends** - Dividend tracking

All tables use Row Level Security to ensure users only access their own data.

## Calculation Engine

The calculation engine handles all P&L computations:

```typescript
// For BUY trades:
Gross P&L = (Exit Price - Entry Price) × Quantity

// For SELL trades:
Gross P&L = (Entry Price - Exit Price) × Quantity

// Net P&L:
Net P&L = Gross P&L - Brokerage - Government Charges - Other Charges

// Capital metrics:
Current Capital = Base Capital + Cumulative Net P&L
Capital Return % = (Net P&L / Base Capital) × 100
```

## AI Assistant

The application includes a rule-based AI assistant that:

- Analyzes trading setups against your configured rules
- Scores trades 0-100% based on:
  - Rule compliance (8 trading rules)
  - Historical similar trade performance
  - Risk/Reward ratios
  - Strategy adherence
- Provides transparent scoring breakdown
- Suggests improvements

**Note**: No paid API required. Works completely offline with fallback provider.

## Security & Privacy

- Email/password authentication via Supabase Auth
- All data encrypted in transit (HTTPS)
- Row Level Security ensures data isolation
- Users can only see/modify their own data
- Never stores sensitive broker information

## Building for Production

```bash
npm run build
npm run preview
```

The build creates optimized static files in the `dist/` folder.

## Environment Variables

Required:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

Optional:
- `VITE_AI_PROVIDER` - AI provider to use (default: 'fallback')
- `VITE_AI_API_KEY` - API key for AI provider (if applicable)

## Troubleshooting

### Build fails
- Clear cache: `rm -rf dist node_modules/.vite`
- Reinstall: `npm install`
- Check Node version: `node --version` (needs 16+)

### Database connection fails
- Verify Supabase credentials in `.env.local`
- Check if all tables are created (run the SQL migration)
- Ensure RLS policies are enabled

### Authentication issues
- Check that Supabase Auth is enabled in project settings
- Verify JWT secret is set
- Try clearing browser localStorage

## Testing Workflow

1. **Sign up** with an email
2. **Set base capital** (e.g., ₹1,00,000)
3. **Open dashboard** to see metrics
4. **Add a trade**:
   - Symbol: NIFTY
   - Type: BUY
   - Qty: 50
   - Entry: ₹100
   - Exit: ₹105
   - See P&L calculated automatically
5. **View calendar** to see daily performance
6. **Track notes** for each trading day

## Performance Tips

- Use pagination for large trade histories
- Compress images before uploading
- Clear old AI conversations periodically
- Regular database backups (Supabase handles this)

## Contributing

Contributions welcome! Areas to improve:

- More chart types and analytics
- Mobile app version
- Real-time market data integration
- Integration with brokers
- Export reports as PDF
- Advanced filtering and search

## License

MIT - Free to use, modify, and distribute.

## Support & Feedback

- Report issues on GitHub
- Check documentation for FAQs
- Email for support inquiries

## Disclaimer

Trade Journal AI is a journaling and analysis tool only. It is NOT:
- A broker or investment advisor
- A tool for automatic trade execution
- Guaranteed to predict market movements
- Financial advice

Always consult professional financial advisors before making trading decisions.

---

Built with ❤️ for traders, by traders.

**Version**: 0.1.0
**Last Updated**: 2024
