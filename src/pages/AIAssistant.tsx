import { useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { loadAIProvider } from '@/services/ai/aiProvider';

const RULES = [
  'Trending or ranging',
  'Continuation or reversal',
  'Volatility',
  'Clean or choppy',
  'Liquidity location',
  'Invalidation',
  'Risk/reward',
  'Following strategy',
];

export default function AIAssistant() {
  const { trades, aiThreshold } = useAppStore();
  const [setup, setSetup] = useState<Record<string, string>>({
    trendingOrRanging: 'Trending',
    continuationOrReversal: 'Continuation',
    volatility: 'Low',
    cleanOrChoppy: 'Clean',
    liquidityLocation: 'Previous day high',
    invalidation: 'Below VWAP',
    riskReward: '1:2.5',
    followingStrategy: 'yes',
  });
  const [analysis, setAnalysis] = useState<{
    score: number;
    reasoning: string;
    warnings: string[];
    rulesPassed: number;
    rulesFailed: number;
    historicalSimilarTrades: number;
    historicalWinRate: number;
    dataUsed: string[];
  } | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const historicalData = useMemo(() => {
    const count = trades.length;
    const winRate = trades.length ? (trades.filter((trade) => Number(trade.net_pnl) > 0).length / trades.length) * 100 : 0;

    return {
      similarTradesCount: count,
      similarTradesWinRate: winRate,
      strategyWinRate: winRate,
      totalTrades: count,
      winningTrades: trades.filter((trade) => Number(trade.net_pnl) > 0).length,
      losingTrades: trades.filter((trade) => Number(trade.net_pnl) <= 0).length,
      winRate,
    };
  }, [trades]);

  const runAnalysis = async () => {
    const provider = loadAIProvider();
    const result = await provider.analyzeSetup(setup, historicalData);
    setAnalysis(result);
  };

  const askQuestion = async () => {
    const provider = loadAIProvider();
    const response = await provider.answerQuestion(question || 'Give me a summary', {
      winRate: historicalData.winRate,
      totalTrades: trades.length,
      winningTrades: historicalData.winningTrades,
      losingTrades: historicalData.losingTrades,
      bestDay: trades.length ? { date: trades[0].trade_date, pnl: Number(trades[0].net_pnl) } : null,
      worstDay: trades.length ? { date: trades[trades.length - 1].trade_date, pnl: Number(trades[trades.length - 1].net_pnl) } : null,
      tradingDays: new Set(trades.map((trade) => trade.trade_date)).size,
      profitableDays: trades.filter((trade) => Number(trade.net_pnl) > 0).length,
      totalNetPnL: trades.reduce((sum, trade) => sum + Number(trade.net_pnl || 0), 0),
      capitalReturnPercentage: trades.length ? ((trades.reduce((sum, trade) => sum + Number(trade.net_pnl || 0), 0) / 100000) * 100) : 0,
      currentCapital: 100000,
    });
    setAnswer(response);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">AI</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Trading assistant</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Setup checklist</h2>
          <div className="mt-4 grid gap-3">
            {RULES.map((rule) => (
              <div key={rule} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">{rule}</label>
                <input
                  value={setup[rule.replace(/[^a-zA-Z]/g, '').charAt(0).toLowerCase() + rule.replace(/[^a-zA-Z]/g, '').slice(1)] ?? ''}
                  onChange={(e) => setSetup((prev) => ({ ...prev, [rule.replace(/[^a-zA-Z]/g, '').charAt(0).toLowerCase() + rule.replace(/[^a-zA-Z]/g, '').slice(1)]: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  placeholder="Enter response"
                />
              </div>
            ))}
          </div>

          <button
            onClick={runAnalysis}
            className="mt-5 rounded-lg bg-profit px-4 py-2 font-medium text-white hover:bg-profit/90"
          >
            Analyze setup
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Analysis</h2>
          {analysis ? (
            <div className="mt-4 space-y-4 text-sm text-slate-700 dark:text-slate-200">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <div className="flex items-center justify-between">
                  <span>Setup score</span>
                  <span className="font-bold text-profit">{analysis.score}/100</span>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <div className="flex items-center justify-between">
                  <span>Rules passed</span>
                  <span>{analysis.rulesPassed}/8</span>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <div className="flex items-center justify-between">
                  <span>Historical sample</span>
                  <span>{analysis.historicalSimilarTrades} trades</span>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <div className="flex items-center justify-between">
                  <span>Historical win rate</span>
                  <span>{analysis.historicalWinRate}%</span>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <span className="font-medium">Reasoning</span>
                <p className="mt-2">{analysis.reasoning}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <span className="font-medium">Warnings</span>
                <ul className="mt-2 list-disc pl-5">
                  {analysis.warnings.length ? analysis.warnings.map((warning) => <li key={warning}>{warning}</li>) : <li>No warnings</li>}
                </ul>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <span className="font-medium">Threshold</span>
                <p className="mt-2">{analysis.score >= aiThreshold ? 'Passes threshold' : 'Below threshold'} ({aiThreshold}%)</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-slate-500 dark:text-slate-400">No analysis run yet.</p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Ask the assistant</h2>
        <div className="mt-4 flex gap-3">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            placeholder="Ask about win rate, best day, strategy, or capital return"
          />
          <button
            onClick={askQuestion}
            className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white dark:bg-white dark:text-slate-900"
          >
            Ask
          </button>
        </div>
        {answer && (
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
            {answer}
          </div>
        )}
      </div>
    </div>
  );
}
