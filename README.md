# Trade Journal AI

A professional web application for personal trading journal and trading-performance analytics.

> "Trade. Record. Analyze. Improve."

## Features

- 📔 **Trading Diary**: Detailed daily trading journal with notes and screenshots
- 💰 **P&L Tracking**: Automatic calculation and tracking of profits and losses
- 📊 **Dashboard**: Real-time performance metrics and insights
- 📈 **Analytics**: Monthly and yearly performance analysis
- 🤖 **AI Assistant**: Rule-based trading analysis and suggestions
- 📅 **Calendar**: Monthly calendar view of trading days
- 💼 **Portfolio**: Track holdings and performance
- ⚙️ **Customizable Rules**: Set your own trading rules and thresholds

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Authentication
- **Charts**: Recharts
- **State**: Zustand
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Supabase account (free tier works)

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd trade-journal-ai
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```

4. Add your Supabase credentials to `.env.local`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Run the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm run preview
```

## Database Schema

The application uses the following main tables:

- `users` - User accounts
- `profiles` - User profile information
- `capital_settings` - Base capital and tracking
- `trades` - Individual trade records
- `trading_days` - Daily aggregated performance
- `diary_entries` - Daily trading notes
- `daily_checklists` - Trading rule checklist responses
- `trade_images` - Screenshots and charts
- `strategies` - Named trading strategies
- `psychology_entries` - Trading psychology tracking
- `ai_conversations` - AI chat history
- `ai_trade_analyses` - AI trade analysis results

## Project Structure

```
src/
├── components/       # React components
│   ├── dashboard/   # Dashboard components
│   ├── diary/       # Diary-related components
│   ├── calendar/    # Calendar components
│   ├── trades/      # Trade card components
│   ├── ai/          # AI assistant components
│   └── common/      # Common/shared components
├── pages/           # Page components
├── services/        # Services
│   ├── supabase/   # Supabase integration
│   ├── ai/         # AI provider
│   └── calculations/ # P&L calculations
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── types/           # TypeScript types
├── lib/             # Library configurations
└── styles/          # Global styles
```

## Features Detail

### Trading Dashboard
- Real-time P&L tracking
- Capital performance monitoring
- Trading statistics cards
- Best/worst trading day highlights
- Daily P&L graph
- Equity curve visualization

### Trader's Diary
- Monthly calendar view
- Financial year selection (Apr-Mar)
- Daily trading overview
- Trade-by-trade breakdown
- Daily P&L aggregation

### Trading Checklist
Track 8 essential trading rules:
1. Trending or ranging?
2. Continuation or reversal?
3. High or low volatility?
4. Clean or choppy?
5. Where is liquidity?
6. Where is invalidation?
7. Risk/Reward at least 1:2?
8. Following tested strategy?

### AI Trading Assistant
- Rule-based analysis (no API required)
- Trade setup scoring (0-100%)
- Historical similar trade analysis
- Configurable 70% threshold
- Transparent scoring breakdown

### P&L Calculations
- Automatic gross P&L calculation
- Charge deductions (brokerage, government, other)
- Net P&L tracking
- Daily, monthly, and yearly aggregation
- Win rate and streak calculations
- Maximum drawdown analysis

## API Integration

The AI assistant uses a provider abstraction layer that supports:

1. **Fallback Provider** (Default): Rule-based analysis with historical data
2. **Future Providers**: OpenAI, local models, or custom APIs

No paid API is required to use the application.

## Security

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Row Level Security (RLS) policies
- **Storage**: Encrypted image storage in Supabase
- **Privacy**: Users only see their own data

## Testing

Run tests with:
```bash
npm run test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please use the GitHub Issues tab.

## Disclaimer

Trade Journal AI is a journaling and analysis tool only. It is not:
- A broker or investment advisor
- Guaranteed to predict market movements
- A tool for automatic trade execution
- Financial advice

Always consult professional financial advisors before making trading decisions.

---

Built with ❤️ for traders, by traders.
