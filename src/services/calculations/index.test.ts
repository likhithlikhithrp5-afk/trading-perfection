import { describe, expect, it } from 'vitest';
import { calculateGrossPnL, calculateNetPnL, calculateWinRate, calculateWinningStreak, calculateLosingStreak, calculateMonthlyPerformance, calculateYearlyPerformance } from './index';
import type { Trade } from '@/types';

const makeTrade = (overrides: Partial<Trade> = {}): Trade => ({
  id: overrides.id ?? 'trade-1',
  user_id: overrides.user_id ?? 'user-1',
  trade_date: overrides.trade_date ?? '2026-09-15',
  symbol: overrides.symbol ?? 'NIFTY',
  order_type: overrides.order_type ?? 'BUY',
  quantity: overrides.quantity ?? 10,
  entry_price: overrides.entry_price ?? 100,
  exit_price: overrides.exit_price ?? 110,
  gross_pnl: overrides.gross_pnl ?? 100,
  brokerage: overrides.brokerage ?? 5,
  government_charges: overrides.government_charges ?? 2,
  other_charges: overrides.other_charges ?? 1,
  net_pnl: overrides.net_pnl ?? 92,
  instrument: overrides.instrument ?? 'INDEX',
  exchange: overrides.exchange ?? 'NSE',
  strategy_id: overrides.strategy_id ?? 's1',
});

describe('trade calculations', () => {
  it('calculates gross pnl correctly for a buy trade', () => {
    const trade = makeTrade({ order_type: 'BUY', entry_price: 100, exit_price: 110, quantity: 100, gross_pnl: 1000 });
    expect(calculateGrossPnL(trade)).toBe(1000);
  });

  it('calculates net pnl after charges', () => {
    const trade = makeTrade({ gross_pnl: 1000, brokerage: 10, government_charges: 5, other_charges: 3 });
    expect(calculateNetPnL(trade)).toBe(982);
  });

  it('calculates win rate for trades', () => {
    const trades = [
      makeTrade({ id: '1', net_pnl: 50, trade_date: '2026-09-01' }),
      makeTrade({ id: '2', net_pnl: -20, trade_date: '2026-09-02' }),
      makeTrade({ id: '3', net_pnl: 30, trade_date: '2026-09-03' }),
    ];

    expect(calculateWinRate(trades)).toBe(66.66666666666666);
  });

  it('tracks winning and losing streaks by trading day', () => {
    const trades = [
      makeTrade({ id: '1', trade_date: '2026-09-01', net_pnl: 100 }),
      makeTrade({ id: '2', trade_date: '2026-09-01', net_pnl: 50 }),
      makeTrade({ id: '3', trade_date: '2026-09-02', net_pnl: -20 }),
      makeTrade({ id: '4', trade_date: '2026-09-03', net_pnl: 80 }),
      makeTrade({ id: '5', trade_date: '2026-09-04', net_pnl: 70 }),
    ];

    expect(calculateWinningStreak(trades)).toBe(2);
    expect(calculateLosingStreak(trades)).toBe(1);
  });

  it('includes the first and last day of the selected month in the monthly aggregate', () => {
    const trades = [
      makeTrade({ id: '1', trade_date: '2026-09-01', net_pnl: 25 }),
      makeTrade({ id: '2', trade_date: '2026-09-15', net_pnl: 100 }),
      makeTrade({ id: '3', trade_date: '2026-09-30', net_pnl: 75 }),
    ];

    expect(calculateMonthlyPerformance(trades, new Date(2026, 8, 1)).tradeCount).toBe(3);
    expect(calculateMonthlyPerformance(trades, new Date(2026, 8, 1)).totalNetPnL).toBe(200);
  });

  it('includes all trades in the selected year range', () => {
    const trades = [
      makeTrade({ id: '1', trade_date: '2026-01-01', net_pnl: 50 }),
      makeTrade({ id: '2', trade_date: '2026-06-15', net_pnl: 100 }),
      makeTrade({ id: '3', trade_date: '2026-12-31', net_pnl: 60 }),
    ];

    expect(calculateYearlyPerformance(trades, 2026).tradeCount).toBe(3);
    expect(calculateYearlyPerformance(trades, 2026).totalNetPnL).toBe(210);
  });
});
