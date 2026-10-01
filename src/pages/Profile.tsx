export default function Profile() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Profile</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Trader identity</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-profit/10 text-xl font-bold text-profit">TJ</div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Test Trader</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">test@example.com</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total trades</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">128</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <p className="text-sm text-slate-500 dark:text-slate-400">Best streak</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">6 days</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <p className="text-sm text-slate-500 dark:text-slate-400">Risk style</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Balanced</p>
          </div>
        </div>
      </div>
    </div>
  );
}
