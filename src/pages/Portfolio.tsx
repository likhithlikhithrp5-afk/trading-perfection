export default function Portfolio() {
  const holdings = [
    { symbol: 'NIFTY', quantity: 80, avg: 24300, current: 24650 },
    { symbol: 'BANKNIFTY', quantity: 25, avg: 51550, current: 51830 },
    { symbol: 'RELIANCE', quantity: 120, avg: 2840, current: 2910 },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Portfolio</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Holdings overview</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {holdings.map((holding) => {
          const pnl = (holding.current - holding.avg) * holding.quantity;
          return (
            <div key={holding.symbol} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{holding.symbol}</h2>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${pnl >= 0 ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>{pnl >= 0 ? 'Up' : 'Down'}</span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex justify-between"><span>Quantity</span><span>{holding.quantity}</span></div>
                <div className="flex justify-between"><span>Avg price</span><span>₹{holding.avg}</span></div>
                <div className="flex justify-between"><span>Current</span><span>₹{holding.current}</span></div>
              </div>
              <p className={`mt-4 text-lg font-bold ${pnl >= 0 ? 'text-profit' : 'text-loss'}`}>P&L: ₹{pnl.toLocaleString('en-IN')}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
