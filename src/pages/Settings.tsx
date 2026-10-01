import { useState } from 'react';
import { useAppStore } from '@/lib/store';

export default function Settings() {
  const { aiThreshold, setAIThreshold, trades, setTrades } = useAppStore();
  const [exportMessage, setExportMessage] = useState('');

  const handleExport = () => {
    const payload = JSON.stringify(trades, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trade-journal-export.json';
    link.click();
    URL.revokeObjectURL(url);
    setExportMessage('Trade data exported successfully.');
  };

  const handleClearHistory = () => {
    setTrades([]);
    setExportMessage('Trade history cleared for this session.');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Settings</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Preferences</h1>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Trading defaults</h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex justify-between items-center">
              <span>Base capital</span>
              <span>₹100,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Minimum risk reward</span>
              <span>1:2</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span>AI threshold</span>
                <span>{aiThreshold}%</span>
              </div>
              <input
                type="range"
                min={40}
                max={95}
                step={5}
                value={aiThreshold}
                onChange={(e) => setAIThreshold(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Data management</h2>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleExport}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200"
            >
              Export data
            </button>
            <button
              onClick={handleClearHistory}
              className="rounded-lg bg-loss/10 px-4 py-2 text-sm font-medium text-loss"
            >
              Clear trade history
            </button>
          </div>
          {exportMessage && (
            <p className="mt-3 text-sm text-profit">{exportMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}
