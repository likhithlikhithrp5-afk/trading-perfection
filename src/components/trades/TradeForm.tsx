import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Trade } from '@/types';

const tradeSchema = z.object({
  symbol: z.string().trim().min(1, 'Symbol is required').max(30, 'Symbol is too long'),
  order_type: z.enum(['BUY', 'SELL']),
  result: z.enum(['positive', 'negative']),
  risk_reward: z.string().max(20).refine(
    (value) => !value || /^\d+(?:\.\d+)?:\d+(?:\.\d+)?$/.test(value),
    'Enter a ratio such as 1:2'
  ),
});

type TradeFormData = z.infer<typeof tradeSchema>;
type TradeInput = Omit<Trade, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'gross_pnl' | 'net_pnl'>;

interface TradeFormProps {
  onSubmit: (trade: TradeInput, image?: File) => void | Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<Trade>;
  trade_date?: string;
}

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-profit dark:border-slate-600 dark:bg-slate-700 dark:text-white';
const labelClass = 'mb-1 block text-sm font-medium';

export default function TradeForm({ onSubmit, isLoading = false, initialData, trade_date }: TradeFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      symbol: initialData?.symbol || '',
      order_type: initialData?.order_type || 'BUY',
      result: initialData?.result || (initialData?.net_pnl !== undefined && initialData.net_pnl < 0 ? 'negative' : 'positive'),
      risk_reward: initialData?.risk_reward || '',
    },
  });

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const submitForm = async (data: TradeFormData) => {
    const submission: TradeInput = {
      trade_date: initialData?.trade_date || trade_date || new Date().toISOString().slice(0, 10),
      symbol: data.symbol.trim().toUpperCase(),
      order_type: data.order_type,
      result: data.result,
      quantity: initialData?.quantity ?? 1,
      entry_price: initialData?.entry_price ?? 0,
      exit_price: initialData?.exit_price ?? 0,
      brokerage: initialData?.brokerage ?? 0,
      government_charges: initialData?.government_charges ?? 0,
      other_charges: initialData?.other_charges ?? 0,
      risk_reward: data.risk_reward || undefined,
    };
    await onSubmit(submission, selectedImage ?? undefined);
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-5 rounded-lg bg-white p-2 dark:bg-slate-800">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="trade-symbol">Trading symbol *</label>
          <input id="trade-symbol" {...register('symbol')} maxLength={30} placeholder="e.g. NIFTY" className={inputClass} />
          {errors.symbol && <p className="mt-1 text-xs text-loss">{errors.symbol.message}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="trade-side">Side *</label>
          <select id="trade-side" {...register('order_type')} className={inputClass}>
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="trade-result">Result *</label>
          <select id="trade-result" {...register('result')} className={inputClass}>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="trade-risk-reward">Risk : Reward</label>
          <input id="trade-risk-reward" {...register('risk_reward')} placeholder="1:2" className={inputClass} />
          {errors.risk_reward && <p className="mt-1 text-xs text-loss">{errors.risk_reward.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="trade-photo">Trade photo (optional)</label>
          <input
            ref={photoInputRef}
            id="trade-photo"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const image = event.target.files?.[0] ?? null;
              if (photoPreview) URL.revokeObjectURL(photoPreview);
              setSelectedImage(image);
              setPhotoPreview(image ? URL.createObjectURL(image) : undefined);
            }}
            className={inputClass}
          />
          {selectedImage && (
            <div className="mt-3 flex items-center gap-3">
              {photoPreview && <img src={photoPreview} alt="Selected trade" className="h-16 w-16 rounded-lg object-cover" />}
              <span className="truncate text-sm text-slate-600 dark:text-slate-300">{selectedImage.name}</span>
              <button type="button" onClick={() => {
                if (photoPreview) URL.revokeObjectURL(photoPreview);
                setSelectedImage(null);
                setPhotoPreview(undefined);
                if (photoInputRef.current) photoInputRef.current.value = '';
              }} className="text-sm font-medium text-loss hover:underline">Remove</button>
            </div>
          )}
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-profit py-2 font-medium text-white transition-colors hover:bg-profit/90 disabled:opacity-50">
        {isLoading ? 'Saving...' : initialData?.id ? 'Update trade' : 'Save trade'}
      </button>
    </form>
  );
}
