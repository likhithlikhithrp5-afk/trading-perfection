export default function Dividends() {
  const dividends = [
    { symbol: 'TCS', qty: 80, perShare: 18, total: 1440, status: 'received', date: '2026-09-15' },
    { symbol: 'INFY', qty: 150, perShare: 11, total: 1650, status: 'pending', date: '2026-10-05' },
    { symbol: 'RELIANCE', qty: 120, perShare: 9, total: 1080, status: 'received', date: '2026-09-20' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Dividends</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Income tracker</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-3">
          {dividends.map((entry) => (
            <div key={entry.symbol} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{entry.symbol}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{entry.qty} shares • ₹{entry.perShare}/share</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold text-slate-900 dark:text-white">₹{entry.total.toLocaleString('en-IN')}</p>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${entry.status === 'received' ? 'bg-profit/10 text-profit' : 'bg-warning/10 text-warning'}`}>
                  {entry.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
