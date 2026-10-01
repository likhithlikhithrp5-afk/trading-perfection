export default function Watchlist() {
  const symbols = [
    { name: 'NIFTY', price: 24680, bias: 'Bullish', change: '+1.24%' },
    { name: 'BANKNIFTY', price: 51840, bias: 'Bullish', change: '+1.08%' },
    { name: 'RELIANCE', price: 2912, bias: 'Neutral', change: '+0.35%' },
    { name: 'INFY', price: 1478, bias: 'Bearish', change: '-0.62%' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Watchlist</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Market radar</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-3">
          {symbols.map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{item.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Bias: {item.bias}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900 dark:text-white">₹{item.price.toLocaleString('en-IN')}</p>
                <p className={`text-sm ${item.change.startsWith('-') ? 'text-loss' : 'text-profit'}`}>{item.change}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
