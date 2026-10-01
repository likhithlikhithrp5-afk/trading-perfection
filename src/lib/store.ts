import { create } from 'zustand';
import { User, Trade, CapitalSettings } from '@/types';

interface AppStore {
  // Auth
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Capital
  capitalSettings: CapitalSettings | null;
  setCapitalSettings: (capital: CapitalSettings) => void;

  // Trades
  trades: Trade[];
  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;
  updateTrade: (id: string, trade: Trade) => void;
  deleteTrade: (id: string) => void;

  // UI State
  darkMode: boolean;
  toggleDarkMode: () => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;

  // AI Threshold
  aiThreshold: number;
  setAIThreshold: (threshold: number) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Auth
  user: null,
  isLoading: false,
  error: null,
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Capital
  capitalSettings: null,
  setCapitalSettings: (capitalSettings) => set({ capitalSettings }),

  // Trades
  trades: [],
  setTrades: (trades) => set({ trades }),
  addTrade: (trade) => set((state) => ({ trades: [trade, ...state.trades] })),
  updateTrade: (id, trade) =>
    set((state) => ({
      trades: state.trades.map((t) => (t.id === id ? trade : t)),
    })),
  deleteTrade: (id) =>
    set((state) => ({
      trades: state.trades.filter((t) => t.id !== id),
    })),

  // UI State
  darkMode: localStorage.getItem('darkMode') === 'true' || false,
  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.darkMode;
      localStorage.setItem('darkMode', String(newMode));
      return { darkMode: newMode };
    }),
  selectedYear: new Date().getFullYear(),
  setSelectedYear: (year) => set({ selectedYear: year }),
  selectedMonth: new Date().getMonth(),
  setSelectedMonth: (month) => set({ selectedMonth: month }),
  selectedDate: null,
  setSelectedDate: (date) => set({ selectedDate: date }),

  // AI Threshold
  aiThreshold: parseInt(localStorage.getItem('aiThreshold') || '70'),
  setAIThreshold: (threshold) => {
    localStorage.setItem('aiThreshold', String(threshold));
    set({ aiThreshold: threshold });
  },
}));
