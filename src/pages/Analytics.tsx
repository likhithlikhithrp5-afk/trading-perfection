import { ArrowDownRight, ArrowUpRight, BarChart3, ShieldAlert, TrendingUp } from 'lucide-react';

const metrics = [
  { label: 'Net P&L', value: '₹42,350', positive: true },
  { label: 'Win Rate', value: '63.4%', positive: true },
  { label: 'Profit Factor', value: '1.84', positive: true },
  { label: 'Max Drawdown', value: '₹8,100', positive: false },
];

const strategyPerformance = [
  { name: 'Breakout', pnl: 18000, winRate: 68 },
  { name: 'Reversal', pnl: 11000, winRate: 57 },
  { name: 'Scalp', pnl: 7200, winRate: 61 },
  { name: 'Mean Reversion', pnl: -3200, winRate: 44 },
];

export default function Analytics() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Insights</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Performance analytics</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
              {metric.positive ? <ArrowUpRight className="text-profit" size={18} /> : <ArrowDownRight className="text-loss" size={18} />}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="text-profit" size={18} />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Monthly performance</h2>
          </div>

          <div className="flex h-64 items-end gap-3">
            {[52, 68, 90, 72, 104, 120, 96].map((height, index) => (
              <div key={index} className="flex-1 rounded-t-xl bg-slate-100 p-2 text-center dark:bg-slate-800">
                <div className="flex h-full items-end justify-center">
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-profit to-emerald-300" style={{ height: `${height}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center gap-2">
            <ShieldAlert className="text-warning" size={18} />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Risk overview</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm"><span>Risk discipline</span><span className="font-medium text-profit">82%</span></div>
              <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 w-[82%] rounded-full bg-profit" /></div>
            </div>
            <div>
              <div className="flex justify-between text-sm"><span>Execution quality</span><span className="font-medium text-profit">76%</span></div>
              <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 w-[76%] rounded-full bg-warning" /></div>
            </div>
            <div>
              <div className="flex justify-between text-sm"><span>Drawdown control</span><span className="font-medium text-loss">34%</span></div>
              <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 w-[34%] rounded-full bg-loss" /></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="text-profit" size={18} />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Strategy performance</h2>
        </div>
        <div className="space-y-4">
          {strategyPerformance.map((strategy) => (
            <div key={strategy.name} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{strategy.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Win rate {strategy.winRate}%</p>
                </div>
                <p className={`text-lg font-bold ${strategy.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>₹{strategy.pnl.toLocaleString('en-IN')}</p>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className={`h-2 rounded-full ${strategy.pnl >= 0 ? 'bg-profit' : 'bg-loss'}`} style={{ width: `${Math.min(100, Math.max(15, strategy.winRate))}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
