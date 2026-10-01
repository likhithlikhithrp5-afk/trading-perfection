import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Trade } from '@/types';
import { calculateGrossPnL, calculateNetPnL } from '@/services/calculations';
import { formatCurrency } from '@/utils/format';

const tradeSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  quantity: z.number().positive('Quantity must be positive'),
  entry_price: z.number().positive('Entry price must be positive'),
  exit_price: z.number().positive('Exit price must be positive'),
  order_type: z.enum(['BUY', 'SELL']),
  brokerage: z.number().min(0, 'Brokerage cannot be negative'),
  government_charges: z.number().min(0, 'Government charges cannot be negative'),
  other_charges: z.number().min(0, 'Other charges cannot be negative'),
  trade_time: z.string().optional(),
  strategy_id: z.string().optional(),
  notes: z.string().optional(),
});

type TradeFormData = z.infer<typeof tradeSchema>;

interface TradePreview {
  grossPnL: number;
  netPnL: number;
  totalCharges: number;
  returnPercent: number;
}

interface TradeFormProps {
  onSubmit: (trade: Omit<Trade, 'id' | 'user_id' | 'trade_date' | 'created_at' | 'updated_at' | 'gross_pnl' | 'net_pnl'>) => void;
  isLoading?: boolean;
  initialData?: Partial<Trade>;
}

export default function TradeForm({ onSubmit, isLoading = false, initialData }: TradeFormProps) {
  const [preview, setPreview] = useState<TradePreview | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: initialData as Partial<TradeFormData>,
  });

  const formValues = watch();

  useEffect(() => {
    if (formValues.quantity && formValues.entry_price && formValues.exit_price) {
      const mockTrade: Trade = {
        id: 'preview',
        user_id: '',
        trade_date: new Date().toISOString().split('T')[0],
        symbol: formValues.symbol,
        quantity: formValues.quantity,
        entry_price: formValues.entry_price,
        exit_price: formValues.exit_price,
        order_type: formValues.order_type,
        brokerage: formValues.brokerage || 0,
        government_charges: formValues.government_charges || 0,
        other_charges: formValues.other_charges || 0,
        gross_pnl: 0,
        net_pnl: 0,
      };

      const grossPnL = calculateGrossPnL(mockTrade);
      const netPnL = calculateNetPnL({ ...mockTrade, gross_pnl: grossPnL });
      const totalCharges = (formValues.brokerage || 0) + (formValues.government_charges || 0) + (formValues.other_charges || 0);

      setPreview({
        grossPnL,
        netPnL,
        totalCharges,
        returnPercent: grossPnL > 0 ? ((netPnL / Math.abs(formValues.entry_price * formValues.quantity)) * 100) : 0,
      });
    }
  }, [formValues]);

  const handleFormSubmit = (data: TradeFormData) => {
    onSubmit({
      symbol: data.symbol,
      quantity: data.quantity,
      entry_price: data.entry_price,
      exit_price: data.exit_price,
      order_type: data.order_type,
      brokerage: data.brokerage,
      government_charges: data.government_charges,
      other_charges: data.other_charges,
      trade_time: data.trade_time,
      strategy_id: data.strategy_id,
      notes: data.notes,
      instrument: 'OPTION',
      exchange: 'NSE',
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 bg-white dark:bg-slate-800 rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Symbol *</label>
          <input
            {...register('symbol')}
            type="text"
            placeholder="e.g., NIFTY"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-profit"
          />
          {errors.symbol && <p className="text-loss text-xs mt-1">{errors.symbol.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Order Type *</label>
          <select
            {...register('order_type')}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-profit"
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
          {errors.order_type && <p className="text-loss text-xs mt-1">{errors.order_type.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Quantity *</label>
          <input
            {...register('quantity', { valueAsNumber: true })}
            type="number"
            step="1"
            placeholder="e.g., 50"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-profit"
          />
          {errors.quantity && <p className="text-loss text-xs mt-1">{errors.quantity.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Entry Price *</label>
          <input
            {...register('entry_price', { valueAsNumber: true })}
            type="number"
            step="0.05"
            placeholder="e.g., 100.50"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-profit"
          />
          {errors.entry_price && <p className="text-loss text-xs mt-1">{errors.entry_price.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Exit Price *</label>
          <input
            {...register('exit_price', { valueAsNumber: true })}
            type="number"
            step="0.05"
            placeholder="e.g., 110.50"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-profit"
          />
          {errors.exit_price && <p className="text-loss text-xs mt-1">{errors.exit_price.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Trade Time</label>
          <input
            {...register('trade_time')}
            type="time"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-profit"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Brokerage</label>
          <input
            {...register('brokerage', { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-profit"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Government Charges</label>
          <input
            {...register('government_charges', { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-profit"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Other Charges</label>
          <input
            {...register('other_charges', { valueAsNumber: true })}
            type="number"
            step="0.01"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-profit"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          {...register('notes')}
          placeholder="Add trade notes..."
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-profit"
        />
      </div>

      {preview && (
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg space-y-2">
          <h4 className="font-medium">Trade Preview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Gross P&L</p>
              <p className={`font-medium ${preview.grossPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                {formatCurrency(preview.grossPnL)}
              </p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Total Charges</p>
              <p className="font-medium">{formatCurrency(preview.totalCharges)}</p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Net P&L</p>
              <p className={`font-medium ${preview.netPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                {formatCurrency(preview.netPnL)}
              </p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Return %</p>
              <p className={`font-medium ${preview.returnPercent >= 0 ? 'text-profit' : 'text-loss'}`}>
                {preview.returnPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-profit hover:bg-profit/90 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Save Trade'}
      </button>
    </form>
  );
}
