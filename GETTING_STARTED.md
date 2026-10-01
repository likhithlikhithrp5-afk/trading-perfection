# Getting Started with Trade Journal AI

## 🚀 Start Here

Follow these steps to get Trade Journal AI running on your machine:

### Step 1: Prerequisites

Ensure you have:
- Node.js 16 or higher
- npm (comes with Node.js)
- A Supabase account (free at supabase.com)
- A modern web browser

### Step 2: Set up Supabase

1. **Create a Supabase project**
   - Go to https://supabase.com
   - Sign up or log in
   - Create a new project
   - Wait for it to initialize

2. **Get your credentials**
   - Go to Project Settings → API
   - Copy `Project URL`
   - Copy `anon public` key

3. **Create the database schema**
   - Go to SQL Editor
   - Click "New Query"
   - Open `supabase/migrations/001_init.sql`
   - Copy and paste the entire SQL content
   - Click "Run"

### Step 3: Configure Environment

1. **Create .env.local**
   ```bash
   cp .env.example .env.local
   ```

2. **Add Supabase credentials**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.4.21  ready in 123 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

Open http://localhost:3000 in your browser.

## 📝 Testing the Application

### Create Test Account

1. Click "Sign up" link
2. Enter:
   - Full Name: Test Trader
   - Email: test@example.com
   - Password: Test123456
3. Click "Create Account"

### Set Your Base Capital

1. After login, you'll be prompted to set base capital
2. Enter: 100000 (₹1,00,000)
3. This becomes your starting capital for tracking

### Add Your First Trade

The app has a trade form component ready. To test P&L calculations:

1. Value: Symbol = NIFTY
2. Type: BUY
3. Quantity: 50
4. Entry Price: 100
5. Exit Price: 105
6. Brokerage: 50
7. Government Charges: 25
8. Other Charges: 0

**Expected Calculations:**
- Gross P&L: (105-100) × 50 = ₹250
- Total Charges: ₹75
- Net P&L: ₹175

The form will automatically calculate and display these values.

## 🔍 Verify Everything Works

### Checklist

- ✅ Development server running on http://localhost:3000
- ✅ Can sign up with email
- ✅ Can log in
- ✅ Can see the app (header, navigation)
- ✅ No error messages in browser console
- ✅ Dark mode toggle works (top right button)

### Browser Console

Open developer tools (F12) and check:
- No red error messages
- Network requests to Supabase should show `200 OK` status
- You should see logs when you perform actions

## 📊 Data Storage

All your data is stored in Supabase PostgreSQL:

- **Users** - Your account and profile
- **Trades** - Every trade you record
- **Trading Days** - Daily P&L summaries
- **Diary Entries** - Your daily notes
- **Checklists** - Your trading rule responses
- **Psychology** - Emotional tracking
- **AI Conversations** - Chat history with AI assistant

### View Your Data

1. Go to Supabase Dashboard
2. Click "SQL Editor"
3. Query your data:
   ```sql
   SELECT * FROM public.trades WHERE user_id = auth.uid();
   ```

## 🛠️ Development Workflow

### Running the App

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm run preview
```

### Checking for Errors

```bash
npm run build  # Will show TypeScript errors if any
```

## 🐛 Troubleshooting

### White blank screen
- Check browser console for errors (F12)
- Verify .env.local has correct Supabase credentials
- Try refreshing the page

### "Cannot connect to Supabase"
- Verify VITE_SUPABASE_URL is correct
- Verify VITE_SUPABASE_ANON_KEY is correct
- Check that Supabase project is running
- Wait a few moments and refresh

### "Table does not exist"
- Run the SQL migration from `supabase/migrations/001_init.sql`
- Check that the query completed without errors
- Verify tables exist in Supabase → Table Editor

### npm install fails
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

### Build fails with TypeScript errors
- Ensure you're running Node.js 16+
- Run `npm install` to get latest types
- Check that all files are saved

## 📚 Documentation

Important files to read:

1. **README.md** - Project overview and features
2. **SETUP_GUIDE.md** - Detailed setup instructions
3. **QUICK_REFERENCE.md** - Code examples and common patterns
4. **PROJECT_SUMMARY.md** - Architecture and completed features
5. **DEPLOYMENT.md** - How to deploy to production

## 🎯 What's Next

After you can log in and see the dashboard:

1. **Explore the Code**
   - Read through `src/App.tsx` to understand routing
   - Check `src/lib/store.ts` for state management
   - Review `src/services/calculations/` for P&L logic

2. **Try Adding Features**
   - Create a new dashboard component
   - Add a chart from Recharts
   - Build a form component

3. **Connect to Your Broker Data**
   - Import historical trades
   - Connect broker APIs (if available)
   - Sync live market data

4. **Customize**
   - Change colors in `tailwind.config.js`
   - Add your own logo
   - Customize trading rules

## 💬 Getting Help

If you get stuck:

1. **Check the docs** - Start with this file
2. **Read code comments** - They explain the logic
3. **Console errors** - Browser F12 → Console tab
4. **Supabase docs** - https://supabase.com/docs
5. **React docs** - https://react.dev

## 🎉 Success!

Once you can:
- ✅ Sign up
- ✅ See the app
- ✅ Add trades
- ✅ See P&L calculations

You've successfully set up Trade Journal AI!

Now you can start building additional features or deploying to production.

---

**Version**: 0.1.0
**Last Updated**: September 15, 2026

Feel free to customize and extend this application to fit your trading needs!

Happy trading! 📈
