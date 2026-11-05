import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Trade } from '@/types';

const tradeSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  order_type: z.enum(['BUY', 'SELL']),
  result: z.enum(['positive', 'negative']),
  risk_reward: z.string()
    .regex(/^\d+(?:\.\d+)?:\d+(?:\.\d+)?$/, 'Enter a risk-to-reward ratio such as 1:2')
    .refine((value) => value.split(':').every((part) => Number(part) > 0), 'Both ratio values must be greater than zero'),
});

type TradeFormData = z.infer<typeof tradeSchema>;

interface TradeFormProps {
  onSubmit: (
    trade: Omit<Trade, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'gross_pnl' | 'net_pnl'>,
    image?: File
  ) => void | Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<Trade>;
  trade_date?: string;
}

export default function TradeForm({ onSubmit, isLoading = false, initialData, trade_date }: TradeFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      symbol: initialData?.symbol ?? '',
      order_type: initialData?.order_type ?? 'BUY',
      result: initialData?.result,
      risk_reward: initialData?.risk_reward ?? '',
    },
  });

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const handleFormSubmit = async (data: TradeFormData) => {
    const tradeSubmission = {
      symbol: data.symbol,
      order_type: data.order_type,
      result: data.result,
      risk_reward: data.risk_reward,
      quantity: 0,
      entry_price: 0,
      exit_price: 0,
      brokerage: 0,
      government_charges: 0,
      other_charges: 0,
      trade_date: trade_date || new Date().toISOString().split('T')[0],
    };
    await onSubmit(tradeSubmission, selectedImage ?? undefined);
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
          <label className="block text-sm font-medium mb-1">Result *</label>
          <select
            {...register('result')}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-profit"
          >
            <option value="">Select a result</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
          </select>
          {errors.result && <p className="text-loss text-xs mt-1">{errors.result.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Risk : Reward *</label>
          <input
            {...register('risk_reward')}
            type="text"
            placeholder="e.g., 1:2"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-profit"
          />
          {errors.risk_reward && <p className="text-loss text-xs mt-1">{errors.risk_reward.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1" htmlFor="trade-photo">Photo from gallery</label>
          <input
            ref={photoInputRef}
            id="trade-photo"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const image = event.target.files?.[0] ?? null;
              setSelectedImage(image);
              setPhotoPreview(image ? URL.createObjectURL(image) : undefined);
            }}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-profit"
          />
          {selectedImage && (
            <div className="mt-3 flex items-center gap-3">
              {photoPreview && <img src={photoPreview} alt="Selected trade" className="h-16 w-16 rounded-lg object-cover" />}
              <span className="truncate text-sm text-slate-600 dark:text-slate-300">{selectedImage.name}</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setPhotoPreview(undefined);
                  if (photoInputRef.current) photoInputRef.current.value = '';
                }}
                className="text-sm font-medium text-loss hover:underline"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Monetary P&amp;L is not recorded for these simplified journal entries.
      </p>

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
