import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { addDays, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/utils/format';
import type { Trade } from '@/types';
import TradeForm from '@/components/trades/TradeForm';
import { createTrade, deleteTrade, updateTrade } from '@/services/supabase/trades';
import { uploadTradeImage } from '@/services/supabase/screenshots';

export default function DailyDiary() {
  const params = useParams();
  const navigate = useNavigate();
  const { trades, user, addTrade, updateTrade: updateStoredTrade, deleteTrade: deleteStoredTrade } = useAppStore();
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [isSubmittingTrade, setIsSubmittingTrade] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [formError, setFormError] = useState('');
  const effectiveTrades = trades;

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

  const handleSaveTrade = async (
    tradeData: Omit<Trade, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'gross_pnl' | 'net_pnl'>,
    image?: File
  ) => {
    if (!user?.id) {
      setFormError('Your session has expired. Sign in again before saving this trade.');
      return;
    }

    setFormError('');
    setIsSubmittingTrade(true);
    try {
      const result = editingTrade
        ? await updateTrade(user.id, editingTrade.id, tradeData)
        : await createTrade(user.id, tradeData);

      if (result.success && result.data) {
        if (editingTrade) updateStoredTrade(result.data.id, result.data);
        else addTrade(result.data);
        if (image) {
          const upload = await uploadTradeImage(user.id, tradeData.trade_date, image);
          if (!upload.success) {
            setFormError(`Trade saved, but the photo could not be uploaded: ${upload.error || 'Unknown error'}`);
          }
        }
        setShowTradeForm(false);
        setEditingTrade(null);
      } else {
        setFormError(result.error || 'Failed to save trade.');
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save trade.');
    } finally {
      setIsSubmittingTrade(false);
    }
  };

  const handleDeleteTrade = async (trade: Trade) => {
    if (!user?.id) {
      setFormError('Your session has expired. Sign in again before deleting a trade.');
      return;
    }
    if (!window.confirm(`Delete the ${trade.symbol} trade from ${trade.trade_date}? This cannot be undone.`)) return;

    setFormError('');
    const result = await deleteTrade(user.id, trade.id);
    if (!result.success) {
      setFormError(result.error || 'Failed to delete trade.');
      return;
    }
    deleteStoredTrade(trade.id);
  };

  const openNewTradeForm = () => {
    setFormError('');
    setEditingTrade(null);
    setShowTradeForm(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Trader's diary</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Daily journal</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
            <button type="button" aria-label="Previous month" onClick={() => handleMonthShift(-1)} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronLeft size={16} /></button>
            <div className="min-w-[140px] text-center font-medium">{monthLabel}</div>
            <button type="button" aria-label="Next month" onClick={() => handleMonthShift(1)} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronRight size={16} /></button>
          </div>
          <button type="button" onClick={openNewTradeForm} className="flex items-center gap-2 rounded-lg bg-profit px-4 py-2 font-medium text-white transition-colors hover:bg-profit/90">
            <Plus size={18} />
            Add Trade
          </button>
        </div>
      </div>

      {formError && <p role="alert" className="mb-4 rounded-lg border border-loss/30 bg-loss/10 p-3 text-sm text-loss">{formError}</p>}

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
                <button type="button" aria-label="Previous day" onClick={() => handleDayShift(-1)} className="rounded-full border border-slate-200 p-2 dark:border-slate-700"><ChevronLeft size={16} /></button>
                <button type="button" aria-label="Next day" onClick={() => handleDayShift(1)} className="rounded-full border border-slate-200 p-2 dark:border-slate-700"><ChevronRight size={16} /></button>
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
              defaultValue=""
            />
            {dayTrades.length === 0 && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No trades recorded for this day yet.</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Trades for {dayLabel}</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{dayTrades.length} trades</span>
        </div>

        {dayTrades.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
            <p className="font-medium text-slate-700 dark:text-slate-200">No trades recorded for this day</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add a trade to see its P&amp;L in your calendar and dashboard.</p>
            <button type="button" onClick={openNewTradeForm} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-profit px-4 py-2 text-sm font-medium text-white hover:bg-profit/90">
              <Plus size={16} />
              Add Trade
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {dayTrades.map((trade: Trade) => (
              <div key={trade.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">{trade.symbol}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${trade.order_type === 'BUY' ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>{trade.order_type}</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Qty {trade.quantity} · Entry {trade.entry_price} · Exit {trade.exit_price}</p>
                  {(trade.strategy || trade.risk_reward) && <p className="text-xs text-slate-500 dark:text-slate-400">{[trade.strategy, trade.risk_reward && `R:R ${trade.risk_reward}`].filter(Boolean).join(' · ')}</p>}
                  {trade.notes && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{trade.notes}</p>}
                </div>
                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${Number(trade.net_pnl) >= 0 ? 'text-profit' : 'text-loss'}`}>{formatCurrency(Number(trade.net_pnl))}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Gross {formatCurrency(Number(trade.gross_pnl))}</p>
                  </div>
                  {Number(trade.net_pnl) >= 0 ? <TrendingUp size={18} className="text-profit" /> : <TrendingDown size={18} className="text-loss" />}
                  <button type="button" aria-label={`Edit ${trade.symbol} trade`} onClick={() => {
                    setFormError('');
                    setEditingTrade(trade);
                    setShowTradeForm(true);
                  }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-profit dark:hover:bg-slate-700"><Pencil size={17} /></button>
                  <button type="button" aria-label={`Delete ${trade.symbol} trade`} onClick={() => void handleDeleteTrade(trade)} className="rounded-lg p-2 text-slate-500 hover:bg-loss/10 hover:text-loss"><Trash2 size={17} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
              onClick={() => {
                setShowTradeForm(false);
                setEditingTrade(null);
              }}
              aria-label="Close trade form"
              className="absolute right-4 top-4 rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <X size={22} />
            </button>
            <h2 id="add-trade-title" className="mb-4 pr-10 text-2xl font-bold sm:text-3xl">
              {editingTrade ? 'Edit trade' : 'Add trade'} — {dayLabel}
            </h2>
            <TradeForm
              key={`${editingTrade?.id || 'new'}-${selectedDateStr}`}
              onSubmit={handleSaveTrade}
              isLoading={isSubmittingTrade}
              trade_date={selectedDateStr}
              initialData={editingTrade || undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}
