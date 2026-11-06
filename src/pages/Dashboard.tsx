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
import type { Trade } from '@/types';

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
  const { trades, capitalSettings, selectedYear, selectedMonth } = useAppStore();
  const [range, setRange] = useState<'M' | 'W' | 'Y'>('M');
  const baseCapital = Number(capitalSettings?.base_capital) || 100000;

  const filteredTrades = useMemo(() => {
    const now = new Date();
    return trades.filter((trade: Trade) => {
      const tradeDate = new Date(`${trade.trade_date}T00:00:00`);

      if (range === 'W') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return tradeDate >= weekAgo && tradeDate <= now;
      }

      if (range === 'Y') return tradeDate.getFullYear() === now.getFullYear();
      return tradeDate.getMonth() === now.getMonth() && tradeDate.getFullYear() === now.getFullYear();
    });
  }, [trades, range]);

  const summary = useMemo(() => {
    const totalNetPnl = filteredTrades.reduce((sum, trade) => sum + Number(trade.net_pnl || 0), 0);
    const totalGrossPnl = filteredTrades.reduce((sum, trade) => sum + Number(trade.gross_pnl || 0), 0);
    const daily = calculateDailyPerformance(filteredTrades);
    const winRate = calculateWinRate(filteredTrades);
    const profitDayRatio = calculateProfitDayPercentage(filteredTrades);
    const bestDay = getBestDay(filteredTrades);
    const worstDay = getWorstDay(filteredTrades);
    const graphData = getDailyGraphData(filteredTrades);
    const averageTrade = filteredTrades.length ? totalNetPnl / filteredTrades.length : 0;

    return { totalNetPnl, totalGrossPnl, daily, winRate, profitDayRatio, bestDay, worstDay, graphData, averageTrade };
  }, [filteredTrades]);

  const capitalPerformance = calculateCapitalReturnPercentage(summary.totalNetPnl, baseCapital);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Performance Snapshot</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Trading dashboard</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(['M', 'W', 'Y'] as const).map((period) => (
            <button key={period} onClick={() => setRange(period)} className={`rounded-full px-3 py-1.5 text-sm font-medium ${range === period ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Net P&L" value={formatCurrency(summary.totalNetPnl)} subtitle={`Across ${filteredTrades.length} trades`} positive={summary.totalNetPnl >= 0} icon={summary.totalNetPnl >= 0 ? TrendingUp : TrendingDown} />
        <StatCard title="Capital Return" value={formatPercentage(capitalPerformance)} subtitle={`Base capital of ${formatCurrency(baseCapital)}`} positive={capitalPerformance >= 0} icon={Wallet} />
        <StatCard title="Win Rate" value={formatPercentage(summary.winRate)} subtitle={`${filteredTrades.length} trades logged`} positive={summary.winRate >= 50} icon={Target} />
        <StatCard title="Avg Trade" value={formatCurrency(summary.averageTrade)} subtitle="Average net per trade" positive={summary.averageTrade >= 0} icon={Activity} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Daily P&amp;L</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Performance curve</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <CalendarDays size={14} />
              {selectedMonth + 1}/{selectedYear}
            </div>
          </div>
          {summary.graphData.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">No trades in this period yet.</div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {summary.graphData.slice(-6).map((point) => (
                <div key={point.date} className="flex flex-col items-center gap-2">
                  <div className="flex h-28 w-full items-end justify-center rounded-xl bg-slate-100 p-2 dark:bg-slate-800">
                    <div className={`w-full rounded-md ${point.pnl >= 0 ? 'bg-profit' : 'bg-loss'}`} style={{ height: `${Math.max(10, Math.min(100, Math.abs(point.pnl) / 200 * 100))}%` }} />
                  </div>
                  <div className="text-center text-[10px] text-slate-500 dark:text-slate-400">
                    <div>{new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    <div className={`font-medium ${point.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>{formatCurrency(point.pnl)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">Best Day</p>
              {summary.bestDay ? <ArrowUpRight className="text-profit" size={18} /> : <TrendingUp className="text-slate-400" size={18} />}
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{summary.bestDay ? formatCurrency(summary.bestDay.pnl) : '₹0.00'}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{summary.bestDay ? summary.bestDay.date : 'No wins yet'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">Worst Day</p>
              {summary.worstDay ? <ArrowDownRight className="text-loss" size={18} /> : <TrendingDown className="text-slate-400" size={18} />}
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{summary.worstDay ? formatCurrency(summary.worstDay.pnl) : '₹0.00'}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{summary.worstDay ? summary.worstDay.date : 'No losses yet'}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Gross P&amp;L</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(summary.totalGrossPnl)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Profitable Days</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{formatPercentage(summary.profitDayRatio)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Trades in period</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{summary.daily.tradeCount}</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent journal</h2>
          <Link to={`/diary/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`} className="text-sm font-medium text-profit">Open today</Link>
        </div>
        {filteredTrades.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">No trades in this period. Add your first trade in Trader&apos;s Diary.</p>
        ) : (
          <div className="space-y-3">
            {filteredTrades.slice(0, 4).map((trade: Trade) => (
              <div key={trade.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{trade.symbol}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${trade.order_type === 'BUY' ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>{trade.order_type}</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(`${trade.trade_date}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${Number(trade.net_pnl) >= 0 ? 'text-profit' : 'text-loss'}`}>{formatCurrency(Number(trade.net_pnl))}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{trade.notes || 'No notes added'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
