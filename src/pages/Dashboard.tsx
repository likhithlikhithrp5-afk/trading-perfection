import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Wallet, Target, CalendarDays, Activity } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatPercentage } from '@/utils/format';
import {
  calculateDailyPerformance,
  getBestDay,
  getWorstDay,
  getDailyGraphData,
  calculateWinRate,
  calculateProfitDayPercentage,
  calculateCapitalReturnPercentage,
} from '@/services/calculations';
import { Trade } from '@/types';

const demoTrades: Trade[] = [
  { id: '1', user_id: 'u1', trade_date: '2026-09-02', symbol: 'NIFTY', quantity: 50, entry_price: 23970, exit_price: 24080, order_type: 'BUY', brokerage: 20, government_charges: 12, other_charges: 8, gross_pnl: 5500, net_pnl: 5460, instrument: 'INDEX', exchange: 'NSE', strategy_id: 's1', notes: 'Breakout trade' },
  { id: '2', user_id: 'u1', trade_date: '2026-09-03', symbol: 'BANKNIFTY', quantity: 25, entry_price: 51400, exit_price: 51120, order_type: 'SELL', brokerage: 22, government_charges: 14, other_charges: 6, gross_pnl: 7000, net_pnl: 6958, instrument: 'INDEX', exchange: 'NSE', strategy_id: 's2', notes: 'Fade into resistance' },
  { id: '3', user_id: 'u1', trade_date: '2026-09-04', symbol: 'RELIANCE', quantity: 100, entry_price: 2865, exit_price: 2840, order_type: 'SELL', brokerage: 15, government_charges: 9, other_charges: 5, gross_pnl: 2500, net_pnl: 2471, instrument: 'STOCK', exchange: 'NSE', strategy_id: 's3', notes: 'Mean reversion' },
  { id: '4', user_id: 'u1', trade_date: '2026-09-05', symbol: 'TCS', quantity: 80, entry_price: 3360, exit_price: 3405, order_type: 'BUY', brokerage: 18, government_charges: 11, other_charges: 5, gross_pnl: 3600, net_pnl: 3566, instrument: 'STOCK', exchange: 'NSE', strategy_id: 's1', notes: 'Trend continuation' },
  { id: '5', user_id: 'u1', trade_date: '2026-09-07', symbol: 'INFY', quantity: 150, entry_price: 1490, exit_price: 1475, order_type: 'SELL', brokerage: 17, government_charges: 10, other_charges: 4, gross_pnl: 2250, net_pnl: 2219, instrument: 'STOCK', exchange: 'NSE', strategy_id: 's2', notes: 'Short scalp' },
  { id: '6', user_id: 'u1', trade_date: '2026-09-10', symbol: 'NIFTY', quantity: 60, entry_price: 24080, exit_price: 24145, order_type: 'BUY', brokerage: 20, government_charges: 12, other_charges: 7, gross_pnl: 3900, net_pnl: 3861, instrument: 'INDEX', exchange: 'NSE', strategy_id: 's1', notes: 'Breakout retest' },
];

function StatCard({ title, value, subtitle, positive, icon: Icon }: { title: string; value: string; subtitle: string; positive?: boolean; icon: React.ComponentType<{ size?: number | string }> }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-xl p-2 ${positive === undefined ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200' : positive ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
  );
}

export default function Dashboard() {
  const { trades, selectedYear, selectedMonth } = useAppStore();
  const [range, setRange] = useState<'M' | 'W' | 'Y'>('M');
  const effectiveTrades = trades.length > 0 ? trades : demoTrades;

  const filteredTrades = useMemo(() => {
    const now = new Date();

    return effectiveTrades.filter((trade: Trade) => {
      const tradeDate = new Date(trade.trade_date);

      if (range === 'W') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return tradeDate >= weekAgo && tradeDate <= now;
      }

      if (range === 'Y') {
        return tradeDate.getFullYear() === now.getFullYear();
      }

      return tradeDate.getMonth() === now.getMonth() && tradeDate.getFullYear() === now.getFullYear();
    });
  }, [effectiveTrades, range]);

  const summary = useMemo(() => {
    const totalNetPnl = filteredTrades.reduce((sum: number, trade: Trade) => sum + Number(trade.net_pnl || 0), 0);
    const totalGrossPnl = filteredTrades.reduce((sum: number, trade: Trade) => sum + Number(trade.gross_pnl || 0), 0);
    const daily = calculateDailyPerformance(filteredTrades);
    const winRate = calculateWinRate(filteredTrades);
    const profitDayRatio = calculateProfitDayPercentage(filteredTrades);
    const bestDay = getBestDay(filteredTrades);
    const worstDay = getWorstDay(filteredTrades);
    const graphData = getDailyGraphData(filteredTrades);
    const averageTrade = filteredTrades.length ? totalNetPnl / filteredTrades.length : 0;

    return {
      totalNetPnl,
      totalGrossPnl,
      daily,
      winRate,
      profitDayRatio,
      bestDay,
      worstDay,
      graphData,
      averageTrade,
    };
  }, [filteredTrades]);

  const capitalPerformance = calculateCapitalReturnPercentage(summary.totalNetPnl, 100000);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Performance Snapshot</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Trading dashboard</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['M', 'W', 'Y'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setRange(period)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${range === period ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Net P&L" value={formatCurrency(summary.totalNetPnl)} subtitle={`Across ${filteredTrades.length} trades`} positive={summary.totalNetPnl >= 0} icon={summary.totalNetPnl >= 0 ? TrendingUp : TrendingDown} />
        <StatCard title="Capital Return" value={formatPercentage(capitalPerformance)} subtitle="Base capital of ₹1,00,000" positive={capitalPerformance >= 0} icon={Wallet} />
        <StatCard title="Win Rate" value={formatPercentage(summary.winRate)} subtitle={`${filteredTrades.length} trades logged`} positive={summary.winRate >= 50} icon={Target} />
        <StatCard title="Avg Trade" value={formatCurrency(summary.averageTrade)} subtitle="Average net per trade" positive={summary.averageTrade >= 0} icon={Activity} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Daily P&L</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Performance curve</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <CalendarDays size={14} />
              {selectedMonth + 1}/{selectedYear}
            </div>
          </div>

          <div className="grid grid-cols-6 gap-3">
            {summary.graphData.slice(-6).map((point) => (
              <div key={point.date} className="flex flex-col items-center gap-2">
                <div className="flex h-28 w-full items-end justify-center rounded-xl bg-slate-100 p-2 dark:bg-slate-800">
                  <div
                    className={`w-full rounded-md ${point.pnl >= 0 ? 'bg-profit' : 'bg-loss'}`}
                    style={{ height: `${Math.max(10, Math.min(100, Math.abs(point.pnl) / 200 * 100))}%` }}
                  />
                </div>
                <div className="text-center text-[10px] text-slate-500 dark:text-slate-400">
                  <div>{new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  <div className={`font-medium ${point.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>{formatCurrency(point.pnl)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">Best Day</p>
              {summary.bestDay ? <ArrowUpRight className="text-profit" size={18} /> : <TrendingUp className="text-slate-400" size={18} />}
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
              {summary.bestDay ? formatCurrency(summary.bestDay.pnl) : '₹0.00'}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{summary.bestDay ? summary.bestDay.date : 'No wins yet'}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">Worst Day</p>
              {summary.worstDay ? <ArrowDownRight className="text-loss" size={18} /> : <TrendingDown className="text-slate-400" size={18} />}
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
              {summary.worstDay ? formatCurrency(summary.worstDay.pnl) : '₹0.00'}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{summary.worstDay ? summary.worstDay.date : 'No losses yet'}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Gross P&L</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(summary.totalGrossPnl)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Profitable Days</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{formatPercentage(summary.profitDayRatio)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Trading days</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{summary.daily.tradeCount}</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent journal</h2>
          <Link to={`/diary/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`} className="text-sm font-medium text-profit">Open today</Link>
        </div>

        <div className="space-y-3">
          {filteredTrades.slice(0, 4).map((trade: Trade) => (
            <div key={trade.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">{trade.symbol}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${trade.order_type === 'BUY' ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>{trade.order_type}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(trade.trade_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${Number(trade.net_pnl) >= 0 ? 'text-profit' : 'text-loss'}`}>{formatCurrency(Number(trade.net_pnl))}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{trade.notes || 'No notes added'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
