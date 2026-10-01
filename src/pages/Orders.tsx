export default function Orders() {
  const orders = [
    { id: 'ORD-101', symbol: 'NIFTY', type: 'BUY', qty: 50, price: 24520, status: 'open' },
    { id: 'ORD-102', symbol: 'RELIANCE', type: 'SELL', qty: 120, price: 2908, status: 'completed' },
    { id: 'ORD-103', symbol: 'TCS', type: 'BUY', qty: 80, price: 3380, status: 'cancelled' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Orders</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Order journal</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{order.symbol}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{order.id} • {order.type} • Qty {order.qty}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold text-slate-900 dark:text-white">₹{order.price.toLocaleString('en-IN')}</p>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${order.status === 'open' ? 'bg-warning/10 text-warning' : order.status === 'completed' ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
