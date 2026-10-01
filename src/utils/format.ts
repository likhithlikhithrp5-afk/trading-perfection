import { format, parseISO } from 'date-fns';

/**
 * Format currency as Indian Rupees
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format date
 */
export function formatDate(date: string | Date, pattern = 'dd MMM yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, pattern);
  } catch {
    return '';
  }
}

/**
 * Format date time
 */
export function formatDateTime(date: string | Date, pattern = 'dd MMM yyyy HH:mm'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, pattern);
  } catch {
    return '';
  }
}

/**
 * Get P&L color class
 */
export function getPnLColorClass(pnl: number): string {
  if (pnl > 0) return 'text-profit';
  if (pnl < 0) return 'text-loss';
  return 'text-neutral';
}

/**
 * Get P&L background color class
 */
export function getPnLBgColorClass(pnl: number): string {
  if (pnl > 0) return 'bg-profit/10';
  if (pnl < 0) return 'bg-loss/10';
  return 'bg-neutral/10';
}

/**
 * Get calendar day color
 */
export function getCalendarDayColor(pnl: number | null): string {
  if (pnl === null || pnl === undefined) return 'bg-neutral/5';
  if (pnl > 0) return 'bg-profit/20';
  if (pnl < 0) return 'bg-loss/20';
  return 'bg-neutral/5';
}

/**
 * Get month status color
 */
export function getMonthStatusColor(monthPnL: number | null): string {
  if (monthPnL === null || monthPnL === undefined) return 'bg-slate-100 dark:bg-slate-800';
  if (monthPnL > 0) return 'bg-profit/20 border-profit/50';
  if (monthPnL < 0) return 'bg-loss/20 border-loss/50';
  return 'bg-slate-100 dark:bg-slate-800';
}

/**
 * Format large numbers with K, M notation
 */
export function formatLargeNumber(num: number): string {
  if (Math.abs(num) >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toFixed(2);
}

/**
 * Get initials from name
 */
export function getInitials(name?: string): string {
  if (!name) return 'TJ';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Truncate text
 */
export function truncateText(text: string, length: number): string {
  if (text.length > length) {
    return text.slice(0, length) + '...';
  }
  return text;
}

/**
 * Get trading date from string
 */
export function getTradingDate(dateString: string): Date {
  return parseISO(dateString);
}

/**
 * Check if date is today
 */
export function isToday(date: string): boolean {
  const today = format(new Date(), 'yyyy-MM-dd');
  return date === today;
}

/**
 * Get day name from date string
 */
export function getDayName(dateString: string): string {
  return format(parseISO(dateString), 'EEEE');
}
