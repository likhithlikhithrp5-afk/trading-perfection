import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Plus, X } from 'lucide-react';
import { addDays, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/utils/format';
import { Trade } from '@/types';
import TradeForm from '@/components/trades/TradeForm';
import { createTrade } from '@/services/supabase/trades';
import { uploadTradeImage } from '@/services/supabase/screenshots';

const demoTrades: Trade[] = [
  { id: '1', user_id: 'u1', trade_date: '2026-09-02', symbol: 'NIFTY', quantity: 50, entry_price: 23970, exit_price: 24080, order_type: 'BUY', brokerage: 20, government_charges: 12, other_charges: 8, gross_pnl: 5500, net_pnl: 5460, instrument: 'INDEX', exchange: 'NSE', strategy_id: 's1', notes: 'Breakout trade' },
  { id: '2', user_id: 'u1', trade_date: '2026-09-03', symbol: 'BANKNIFTY', quantity: 25, entry_price: 51400, exit_price: 51120, order_type: 'SELL', brokerage: 22, government_charges: 14, other_charges: 6, gross_pnl: 7000, net_pnl: 6958, instrument: 'INDEX', exchange: 'NSE', strategy_id: 's2', notes: 'Fade into resistance' },
  { id: '3', user_id: 'u1', trade_date: '2026-09-04', symbol: 'RELIANCE', quantity: 100, entry_price: 2865, exit_price: 2840, order_type: 'SELL', brokerage: 15, government_charges: 9, other_charges: 5, gross_pnl: 2500, net_pnl: 2471, instrument: 'STOCK', exchange: 'NSE', strategy_id: 's3', notes: 'Mean reversion' },
  { id: '4', user_id: 'u1', trade_date: '2026-09-05', symbol: 'TCS', quantity: 80, entry_price: 3360, exit_price: 3405, order_type: 'BUY', brokerage: 18, government_charges: 11, other_charges: 5, gross_pnl: 3600, net_pnl: 3566, instrument: 'STOCK', exchange: 'NSE', strategy_id: 's1', notes: 'Trend continuation' },
  { id: '5', user_id: 'u1', trade_date: '2026-09-07', symbol: 'INFY', quantity: 150, entry_price: 1490, exit_price: 1475, order_type: 'SELL', brokerage: 17, government_charges: 10, other_charges: 4, gross_pnl: 2250, net_pnl: 2219, instrument: 'STOCK', exchange: 'NSE', strategy_id: 's2', notes: 'Short scalp' },
  { id: '6', user_id: 'u1', trade_date: '2026-09-10', symbol: 'NIFTY', quantity: 60, entry_price: 24080, exit_price: 24145, order_type: 'BUY', brokerage: 20, government_charges: 12, other_charges: 7, gross_pnl: 3900, net_pnl: 3861, instrument: 'INDEX', exchange: 'NSE', strategy_id: 's1', notes: 'Breakout retest' },
];

export default function DailyDiary() {
  const params = useParams();
  const navigate = useNavigate();
  const { trades, user, addTrade } = useAppStore();
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [isSubmittingTrade, setIsSubmittingTrade] = useState(false);
  const effectiveTrades = trades.length > 0 ? trades : demoTrades;

  const selectedDate = useMemo(() => {
    const year = Number(params.year || new Date().getFullYear());
    const month = Number(params.month || new Date().getMonth() + 1);
    const day = Number(params.day || new Date().getDate());
    return new Date(year, month - 1, day);
  }, [params]);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const dayTrades = effectiveTrades.filter((trade: Trade) => {
    const tradeDate = parseISO(trade.trade_date);
    return isSameDay(tradeDate, selectedDate);
  });

  const totalDayPnl = dayTrades.reduce((sum: number, trade: Trade) => sum + Number(trade.net_pnl || 0), 0);

  const monthMap = new Map<string, number>();
  effectiveTrades.forEach((trade: Trade) => {
    const d = parseISO(trade.trade_date);
    const key = format(d, 'yyyy-MM-dd');
    monthMap.set(key, (monthMap.get(key) || 0) + Number(trade.net_pnl || 0));
  });

  const handleMonthShift = (direction: number) => {
    const next = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1);
    navigate(`/diary/${next.getFullYear()}/${next.getMonth() + 1}/${Math.min(selectedDate.getDate(), new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate())}`);
  };

  const handleDayShift = (direction: number) => {
    const next = addDays(selectedDate, direction);
    navigate(`/diary/${next.getFullYear()}/${next.getMonth() + 1}/${next.getDate()}`);
  };

  const dayLabel = format(selectedDate, 'EEEE, d MMMM yyyy');
  const monthLabel = format(selectedDate, 'MMMM yyyy');
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  const handleAddTrade = async (
    tradeData: Omit<Trade, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'gross_pnl' | 'net_pnl'>,
    image?: File
  ) => {
    if (!user?.id) {
      console.error('❌ User not authenticated');
      alert('You must be logged in to create a trade');
      return;
    }

    console.log('🔄 Submitting trade for user:', user.id);
    setIsSubmittingTrade(true);
    try {
      const result = await createTrade(user.id, tradeData);
      console.log('📊 Trade creation result:', result);

      if (result.success && result.data) {
        console.log('✅ Trade created successfully, updating store');
        addTrade(result.data);
        if (image) {
          const upload = await uploadTradeImage(user.id, tradeData.trade_date, image);
          if (!upload.success) {
            alert(`Trade saved, but the photo could not be uploaded: ${upload.error || 'Unknown error'}`);
          }
        }
        setShowTradeForm(false);
      } else {
        console.error('❌ Trade creation failed:', result.error);
        alert(`Failed to create trade: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error creating trade:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to create trade'}`);
    } finally {
      setIsSubmittingTrade(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Trader's diary</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Daily journal</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
          <button onClick={() => handleMonthShift(-1)} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronLeft size={16} /></button>
          <div className="min-w-[140px] text-center font-medium">{monthLabel}</div>
          <button onClick={() => handleMonthShift(1)} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const pnl = monthMap.get(key) || 0;
              const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
              const isSelected = isSameDay(day, selectedDate);

              return (
                <button
                  key={key}
                  onClick={() => {
                    navigate(`/diary/${day.getFullYear()}/${day.getMonth() + 1}/${day.getDate()}`);
                    setShowTradeForm(true);
                  }}
                  className={`min-h-[86px] rounded-xl border p-2 text-left transition ${
                    isSelected
                      ? 'border-profit bg-profit/10 dark:border-profit dark:bg-profit/10'
                      : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'
                  } ${!isCurrentMonth ? 'opacity-50' : ''}`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{format(day, 'd')}</span>
                    {pnl !== 0 && <span className={`text-[10px] font-semibold ${pnl >= 0 ? 'text-profit' : 'text-loss'}`}>{formatCurrency(pnl)}</span>}
                  </div>
                  <div className={`rounded-md px-1.5 py-1 text-[10px] ${pnl > 0 ? 'bg-profit/10 text-profit' : pnl < 0 ? 'bg-loss/10 text-loss' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                    {pnl === 0 ? 'No trades' : pnl > 0 ? 'Profit' : 'Loss'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Selected date</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{dayLabel}</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDayShift(-1)} className="rounded-full border border-slate-200 p-2 dark:border-slate-700"><ChevronLeft size={16} /></button>
                <button onClick={() => handleDayShift(1)} className="rounded-full border border-slate-200 p-2 dark:border-slate-700"><ChevronRight size={16} /></button>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Net day P&L</span>
                <span className={`text-lg font-bold ${totalDayPnl >= 0 ? 'text-profit' : 'text-loss'}`}>{formatCurrency(totalDayPnl)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <BookOpen className="text-profit" size={18} />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Daily notes</h3>
            </div>
            <textarea
              className="mt-4 min-h-[110px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none ring-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              placeholder="Write the market context, setup quality, execution notes, and lessons from today..."
              value={dayTrades.length ? 'Market structure stayed clean across the session. Trades were taken with clear invalidation and good risk-reward control.' : 'No notes recorded yet. Add context for this session.'}
            />
          </div>
        </div>
      </div>

      {dayTrades.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Trades for {dayLabel}</h2>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{dayTrades.length} trades</span>
              <button
                onClick={() => setShowTradeForm(true)}
                className="flex items-center gap-2 rounded-lg bg-profit hover:bg-profit/90 px-3 py-1.5 text-sm font-medium text-white transition-colors"
              >
                <Plus size={16} />
                Add Trade
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {dayTrades.map((trade: Trade) => (
              <div key={trade.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">{trade.symbol}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${trade.order_type === 'BUY' ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>{trade.order_type}</span>
                  </div>
                  {trade.result ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Result: {trade.result} • R:R {trade.risk_reward}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Qty {trade.quantity} • Entry {trade.entry_price} • Exit {trade.exit_price}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {trade.result ? (
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${trade.result === 'positive' ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>
                      {trade.result}
                    </span>
                  ) : (
                    <>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${Number(trade.net_pnl) >= 0 ? 'text-profit' : 'text-loss'}`}>{formatCurrency(Number(trade.net_pnl))}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Gross {formatCurrency(Number(trade.gross_pnl))}</p>
                      </div>
                      {Number(trade.net_pnl) >= 0 ? <TrendingUp size={18} className="text-profit" /> : <TrendingDown size={18} className="text-loss" />}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showTradeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-trade-title"
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 text-slate-900 shadow-2xl dark:bg-slate-900 dark:text-white sm:p-8"
          >
            <button
              type="button"
              onClick={() => setShowTradeForm(false)}
              aria-label="Close add trade form"
              className="absolute right-4 top-4 rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <X size={22} />
            </button>
            <h2 id="add-trade-title" className="mb-4 pr-10 text-2xl font-bold sm:text-3xl">
              Add trade — {dayLabel}
            </h2>
            <TradeForm
              key={selectedDateStr}
              onSubmit={handleAddTrade}
              isLoading={isSubmittingTrade}
              trade_date={selectedDateStr}
            />
          </div>
        </div>
      )}
    </div>
  );
}
