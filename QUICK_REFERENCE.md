# Trade Journal AI - Quick Reference

## Quick Commands

```bash
# Development
npm run dev           # Start development server

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Database
# Copy SQL from supabase/migrations/001_init.sql
# Run in Supabase SQL Editor
```

## Project Structure Quick Guide

```
src/
├── components/      # React UI components
├── pages/          # Page components (routes)
├── services/       # Business logic & API
├── utils/          # Utility functions
├── types/          # TypeScript interfaces
└── lib/            # Configurations
```

## Key Files to Know

- `src/App.tsx` - Main app and routing
- `src/lib/store.ts` - Global state (Zustand)
- `src/services/calculations/index.ts` - P&L math engine
- `src/services/supabase/auth.ts` - Authentication
- `supabase/migrations/001_init.sql` - Database schema

## Environment Setup

1. Get Supabase credentials:
   ```
   VITE_SUPABASE_URL=<your_url>
   VITE_SUPABASE_ANON_KEY=<your_key>
   ```

2. Run database migration:
   - Create new SQL query in Supabase
   - Copy-paste content from `supabase/migrations/001_init.sql`
   - Execute

3. Start developing:
   ```bash
   npm install
   npm run dev
   ```

## API Routes Reference

### Authentication
- `signUp(email, password, fullName)` - Create account
- `signIn(email, password)` - Login
- `signOut()` - Logout
- `getCurrentUser()` - Get logged-in user

### Trades
- `createTrade(userId, trade)` - Add trade
- `getTrades(userId)` - Get all trades
- `getTradesForDate(userId, date)` - Get trades for specific date
- `updateTrade(userId, tradeId, updates)` - Edit trade
- `deleteTrade(userId, tradeId)` - Remove trade

### Calculations
- `calculateGrossPnL(trade)` - Calculate before charges
- `calculateNetPnL(trade)` - Calculate after charges
- `calculateDailyPerformance(trades)` - Daily summary
- `calculateWinRate(trades)` - Win percentage
- `calculateWinningStreak(trades)` - Max consecutive wins

## Component Naming

Each component should:
- Be in appropriate folder (dashboard/, trades/, etc.)
- End with `.tsx` extension
- Export default function
- Include TypeScript types
- Use Tailwind for styling

Example:
```typescript
// src/components/dashboard/StatCard.tsx
interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
      {icon && <div className="mb-2">{icon}</div>}
      <p className="text-sm text-slate-600 dark:text-slate-400">{title}</p>
      <p className="text-2xl font-bold">{value}</p>/
    </div>
  );
}
```

## State Management with Zustand

Access global state:
```typescript
import { useAppStore } from '@/lib/store';

function MyComponent() {
  const { user, trades, setTrades, darkMode, toggleDarkMode } = useAppStore();
  
  return (
    <>
      <p>User: {user?.email}</p>
      <p>Trades: {trades.length}</p>
      <button onClick={toggleDarkMode}>
        theme: {darkMode ? 'dark' : 'light'}
      </button>
    </>
  );
}
```

## Database Operations

Get data from Supabase:
```typescript
import { getTrades } from '@/services/supabase/trades';

const { success, data, error } = await getTrades(userId);
if (success) {
  // Use data
} else {
  console.error(error);
}
```

## Styling with Tailwind

Color scheme:
- Profit/Positive: `text-profit` (green), `bg-profit`
- Loss/Negative: `text-loss` (red), `bg-loss`
- Neutral: `text-neutral` (gray), `bg-neutral`
- Dark mode: Use `dark:` prefix

All colors configured in `tailwind.config.js`.

## Form Handling with React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  email: z.string().email(),
  amount: z.number().positive(),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Adding New Pages

1. Create component in `src/pages/`:
```typescript
// src/pages/NewPage.tsx
export default function NewPage() {
  return <div>New Page</div>;
}
```

2. Add route in `src/App.tsx`:
```typescript
<Route path="/new-page" element={<NewPage />} />
```

3. Add link in navigation (Header.tsx):
```typescript
{ label: 'New Page', path: '/new-page' }
```

## Adding New Components

1. Create in appropriate folder:
```typescript
// src/components/dashboard/NewCard.tsx
interface NewCardProps {
  title: string;
}

export default function NewCard({ title }: NewCardProps) {
  return <div>{title}</div>;
}
```

2. Import and use:
```typescript
import NewCard from '@/components/dashboard/NewCard';

<NewCard title="My Card" />
```

## Testing Trades Calculation

```typescript
import { calculateNetPnL, calculateGrossPnL } from '@/services/calculations';

const trade = {
  order_type: 'BUY',
  quantity: 10,
  entry_price: 100,
  exit_price: 110,
  brokerage: 10,
  government_charges: 5,
  other_charges: 0,
} as any;

const gross = calculateGrossPnL(trade);     // Should be 100
const net = calculateNetPnL({ ...trade, gross_pnl: gross }); // Should be 85
```

## Common Tailwind Classes

```
Text: text-sm, text-lg, font-bold, text-profit, text-loss
Background: bg-white, dark:bg-slate-800, bg-profit/10
Spacing: p-4, m-2, gap-3, space-y-2
Grid: grid-cols-2, md:grid-cols-3, lg:grid-cols-4
Display: flex, hidden, md:hidden, rounded-lg
Borders: border, border-slate-300, dark:border-slate-600
```

## RLS Policy Example

When adding a new table, add RLS policies:
```sql
-- Allow users to view their own data
CREATE POLICY "Users can view their own data"
  ON public.my_table FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to create their own data
CREATE POLICY "Users can create their own data"
  ON public.my_table FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## Debug Tips

1. Check browser console for errors
2. Use React DevTools extension
3. Check Supabase SQL console for data
4. Use `console.log()` in components
5. Check network tab for API errors
6. Clear localStorage for state reset: `localStorage.clear()`

## Performance Tips

- Use `useCallback` for expensive functions
- Use `useMemo` for computed values
- Lazy load images
- Compress trade images before upload
- Use proper indexes on database

## Deployment Checklist

- ✅ Environment variables set
- ✅ Build successful
- ✅ Database schema created
- ✅ RLS policies enabled
- ✅ Authentication working
- ✅ HTTPS enabled
- ✅ Error logging configured

---

Happy coding! 🚀
