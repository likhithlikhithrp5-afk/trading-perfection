import { Trade } from '@/types';
import { parseISO, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Calculate Gross P&L for a single trade
 * For BUY: Gross P&L = (Exit Price - Entry Price) × Quantity
 * For SELL: Gross P&L = (Entry Price - Exit Price) × Quantity
 */
export function calculateGrossPnL(trade: Trade): number {
  const { order_type, entry_price, exit_price, quantity } = trade;
  
  if (order_type === 'BUY') {
    return (exit_price - entry_price) * quantity;
  } else {
    return (entry_price - exit_price) * quantity;
  }
}

/**
 * Calculate Total Charges
 */
export function calculateTotalCharges(trade: Trade): number {
  return (trade.brokerage || 0) + (trade.government_charges || 0) + (trade.other_charges || 0);
}

/**
 * Calculate Net P&L for a single trade
 * Net P&L = Gross P&L - Total Charges
 */
export function calculateNetPnL(trade: Trade): number {
  const grossPnL = trade.gross_pnl || calculateGrossPnL(trade);
  const totalCharges = calculateTotalCharges(trade);
  return grossPnL - totalCharges;
}

/**
 * Calculate daily performance from trades
 */
export function calculateDailyPerformance(trades: Trade[]): {
  totalGrossPnL: number;
  totalBrokerage: number;
  totalGovernmentCharges: number;
  totalOtherCharges: number;
  totalNetPnL: number;
  tradeCount: number;
} {
  return {
    totalGrossPnL: trades.reduce((sum, t) => sum + (t.gross_pnl || calculateGrossPnL(t)), 0),
    totalBrokerage: trades.reduce((sum, t) => sum + (t.brokerage || 0), 0),
    totalGovernmentCharges: trades.reduce((sum, t) => sum + (t.government_charges || 0), 0),
    totalOtherCharges: trades.reduce((sum, t) => sum + (t.other_charges || 0), 0),
    totalNetPnL: trades.reduce((sum, t) => sum + (t.net_pnl || calculateNetPnL(t)), 0),
    tradeCount: trades.length,
  };
}

/**
 * Calculate monthly performance
 */
export function calculateMonthlyPerformance(
  trades: Trade[],
  monthDate: Date
): {
  totalNetPnL: number;
  totalGrossPnL: number;
  totalBrokerage: number;
  totalGovernmentCharges: number;
  tradeCount: number;
  profitableDays: number;
  lossDays: number;
} {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);

  const monthTrades = trades.filter(t => {
    const tradeDate = parseISO(t.trade_date);
    return tradeDate >= monthStart && tradeDate <= monthEnd;
  });

  const dailyData = groupTradesByDay(monthTrades);
  
  const profitableDays = Object.values(dailyData).filter(dayTrades => {
    const dayNetPnL = dayTrades.reduce((sum, t) => sum + (t.net_pnl || calculateNetPnL(t)), 0);
    return dayNetPnL > 0;
  }).length;
  const lossDays = Object.values(dailyData).filter(dayTrades => {
    const dayNetPnL = dayTrades.reduce((sum, t) => sum + (t.net_pnl || calculateNetPnL(t)), 0);
    return dayNetPnL < 0;
  }).length;

  const daily = calculateDailyPerformance(monthTrades);

  return {
    totalNetPnL: daily.totalNetPnL,
    totalGrossPnL: daily.totalGrossPnL,
    totalBrokerage: daily.totalBrokerage,
    totalGovernmentCharges: daily.totalGovernmentCharges,
    tradeCount: daily.tradeCount,
    profitableDays,
    lossDays,
  };
}

/**
 * Calculate yearly performance
 */
export function calculateYearlyPerformance(
  trades: Trade[],
  year: number
): {
  totalNetPnL: number;
  totalGrossPnL: number;
  tradeCount: number;
  profitableDays: number;
  lossDays: number;
} {
  const yearStart = new Date(year, 0, 1, 0, 0, 0, 0);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

  const yearTrades = trades.filter(t => {
    const tradeDate = parseISO(t.trade_date);
    return tradeDate >= yearStart && tradeDate <= yearEnd;
  });

  const dailyData = groupTradesByDay(yearTrades);
  
  const profitableDays = Object.values(dailyData).filter(dayTrades => {
    const dayNetPnL = dayTrades.reduce((sum, t) => sum + (t.net_pnl || calculateNetPnL(t)), 0);
    return dayNetPnL > 0;
  }).length;
  const lossDays = Object.values(dailyData).filter(dayTrades => {
    const dayNetPnL = dayTrades.reduce((sum, t) => sum + (t.net_pnl || calculateNetPnL(t)), 0);
    return dayNetPnL < 0;
  }).length;

  const daily = calculateDailyPerformance(yearTrades);

  return {
    totalNetPnL: daily.totalNetPnL,
    totalGrossPnL: daily.totalGrossPnL,
    tradeCount: daily.tradeCount,
    profitableDays,
    lossDays,
  };
}

/**
 * Group trades by day
 */
export function groupTradesByDay(trades: Trade[]): Record<string, Trade[]> {
  return trades.reduce((acc, trade) => {
    const date = trade.trade_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(trade);
    return acc;
  }, {} as Record<string, Trade[]>);
}

/**
 * Calculate win rate
 */
export function calculateWinRate(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  const winningTrades = trades.filter(t => (t.net_pnl || calculateNetPnL(t)) > 0);
  return (winningTrades.length / trades.length) * 100;
}

/**
 * Calculate winning streak
 */
export function calculateWinningStreak(trades: Trade[]): number {
  if (trades.length === 0) return 0;

  const byDay = groupTradesByDay(trades);
  const sortedDates = Object.keys(byDay).sort();
  
  let maxStreak = 0;
  let currentStreak = 0;

  for (const date of sortedDates) {
    const dayTrades = byDay[date];
    const dayNetPnL = dayTrades.reduce((sum, t) => sum + (t.net_pnl || calculateNetPnL(t)), 0);
    
    if (dayNetPnL > 0) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
}

/**
 * Calculate losing streak
 */
export function calculateLosingStreak(trades: Trade[]): number {
  if (trades.length === 0) return 0;

  const byDay = groupTradesByDay(trades);
  const sortedDates = Object.keys(byDay).sort();
  
  let maxStreak = 0;
  let currentStreak = 0;

  for (const date of sortedDates) {
    const dayTrades = byDay[date];
    const dayNetPnL = dayTrades.reduce((sum, t) => sum + (t.net_pnl || calculateNetPnL(t)), 0);
    
    if (dayNetPnL < 0) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
}

/**
 * Calculate profitable day percentage
 */
export function calculateProfitDayPercentage(trades: Trade[]): number {
  const byDay = groupTradesByDay(trades);
  if (Object.keys(byDay).length === 0) return 0;

  const profitableDays = Object.values(byDay).filter(dayTrades => {
    const dayNetPnL = dayTrades.reduce((sum, t) => sum + (t.net_pnl || calculateNetPnL(t)), 0);
    return dayNetPnL > 0;
  }).length;

  return (profitableDays / Object.keys(byDay).length) * 100;
}

/**
 * Calculate loss day percentage
 */
export function calculateLossDayPercentage(trades: Trade[]): number {
  const byDay = groupTradesByDay(trades);
  if (Object.keys(byDay).length === 0) return 0;

  const lossDays = Object.values(byDay).filter(dayTrades => {
    const dayNetPnL = dayTrades.reduce((sum, t) => sum + (t.net_pnl || calculateNetPnL(t)), 0);
    return dayNetPnL < 0;
  }).length;

  return (lossDays / Object.keys(byDay).length) * 100;
}

/**
 * Calculate maximum drawdown
 */
export function calculateMaximumDrawdown(trades: Trade[]): number {
  const byDay = groupTradesByDay(trades);
  const sortedDates = Object.keys(byDay).sort();
  
  let peak = 0;
  let maxDrawdown = 0;
  let runningTotal = 0;

  for (const date of sortedDates) {
    const dayTrades = byDay[date];
    const dayNetPnL = dayTrades.reduce((sum, t) => sum + (t.net_pnl || calculateNetPnL(t)), 0);
    
    runningTotal += dayNetPnL;
    
    if (runningTotal > peak) {
      peak = runningTotal;
    }
    
    const drawdown = peak - runningTotal;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  return maxDrawdown;
}

/**
 * Calculate capital return percentage
 * Capital Return % = (Net P&L / Base Capital) × 100
 */
export function calculateCapitalReturnPercentage(netPnL: number, baseCapital: number): number {
  if (baseCapital === 0) return 0;
  return (netPnL / baseCapital) * 100;
}

/**
 * Get trading days (unique dates with at least one trade)
 */
export function getTradingDays(trades: Trade[]): number {
  return Object.keys(groupTradesByDay(trades)).length;
}

/**
 * Get best day
 */
export function getBestDay(trades: Trade[]): { date: string; pnl: number } | null {
  const byDay = groupTradesByDay(trades);
  let bestDay = null;
  let bestPnL = -Infinity;

  for (const [date, dayTrades] of Object.entries(byDay)) {
    const dayNetPnL = dayTrades.reduce((sum, t) => sum + (t.net_pnl || calculateNetPnL(t)), 0);
    if (dayNetPnL > bestPnL) {
      bestPnL = dayNetPnL;
      bestDay = date;
    }
  }

  return bestDay ? { date: bestDay, pnl: bestPnL } : null;
}

/**
 * Get worst day
 */
export function getWorstDay(trades: Trade[]): { date: string; pnl: number } | null {
  const byDay = groupTradesByDay(trades);
  let worstDay = null;
  let worstPnL = Infinity;

  for (const [date, dayTrades] of Object.entries(byDay)) {
    const dayNetPnL = dayTrades.reduce((sum, t) => sum + (t.net_pnl || calculateNetPnL(t)), 0);
    if (dayNetPnL < worstPnL) {
      worstPnL = dayNetPnL;
      worstDay = date;
    }
  }

  return worstDay ? { date: worstDay, pnl: worstPnL } : null;
}

/**
 * Get daily data for graphing
 */
export function getDailyGraphData(trades: Trade[]): Array<{
  date: string;
  pnl: number;
  tradeCount: number;
}> {
  const byDay = groupTradesByDay(trades);
  return Object.entries(byDay)
    .map(([date, dayTrades]) => ({
      date,
      pnl: dayTrades.reduce((sum, t) => sum + (t.net_pnl || calculateNetPnL(t)), 0),
      tradeCount: dayTrades.length,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get cumulative equity curve
 */
export function getCumulativeEquityCurve(trades: Trade[], baseCapital: number): Array<{
  date: string;
  capital: number;
}> {
  const dailyData = getDailyGraphData(trades);
  const result: Array<{ date: string; capital: number }> = [];
  let runningCapital = baseCapital;

  for (const day of dailyData) {
    runningCapital += day.pnl;
    result.push({
      date: day.date,
      capital: runningCapital,
    });
  }

  return result;
}

/**
 * Calculate strategy performance
 */
export function calculateStrategyPerformance(
  trades: Trade[],
  strategyId: string
): {
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  netPnL: number;
  averagePnL: number;
} {
  const strategyTrades = trades.filter(t => t.strategy_id === strategyId);
  
  if (strategyTrades.length === 0) {
    return {
      trades: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      netPnL: 0,
      averagePnL: 0,
    };
  }

  const netPnL = strategyTrades.reduce((sum, t) => sum + (t.net_pnl || calculateNetPnL(t)), 0);
  const wins = strategyTrades.filter(t => (t.net_pnl || calculateNetPnL(t)) > 0).length;
  const losses = strategyTrades.filter(t => (t.net_pnl || calculateNetPnL(t)) < 0).length;

  return {
    trades: strategyTrades.length,
    wins,
    losses,
    winRate: (wins / strategyTrades.length) * 100,
    netPnL,
    averagePnL: netPnL / strategyTrades.length,
  };
}
