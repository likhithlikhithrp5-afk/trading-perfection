import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { ExchangeType, InstrumentType, Trade } from '@/types';

const optionalText = z.string().max(200).optional();
const tradeSchema = z.object({
  trade_date: z.string().min(1, 'Trading date is required'),
  symbol: z.string().trim().min(1, 'Symbol is required').max(30, 'Symbol is too long'),
  order_type: z.enum(['BUY', 'SELL']),
  instrument: z.union([z.literal(''), z.enum(['STOCK', 'OPTION', 'FUTURE', 'INDEX'])]),
  exchange: z.union([z.literal(''), z.enum(['NSE', 'BSE', 'MCX', 'NCDEX'])]),
  entry_price: z.number().finite().positive('Entry price must be greater than zero'),
  exit_price: z.number().finite().positive('Exit price must be greater than zero'),
  quantity: z.number().finite().positive('Quantity must be greater than zero'),
  brokerage: z.number().finite().min(0, 'Charges cannot be negative'),
  government_charges: z.number().finite().min(0, 'Charges cannot be negative'),
  other_charges: z.number().finite().min(0, 'Charges cannot be negative'),
  risk_reward: z.string().max(20).refine(
    (value) => !value || /^\d+(?:\.\d+)?:\d+(?:\.\d+)?$/.test(value),
    'Enter a ratio such as 1:2'
  ),
  strategy: optionalText,
  notes: z.string().max(5000, 'Notes must be 5,000 characters or fewer'),
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
      trade_date: initialData?.trade_date || trade_date || new Date().toISOString().slice(0, 10),
      symbol: initialData?.symbol || '',
      order_type: initialData?.order_type || 'BUY',
      instrument: initialData?.instrument || '',
      exchange: initialData?.exchange || '',
      entry_price: initialData?.entry_price ?? 0,
      exit_price: initialData?.exit_price ?? 0,
      quantity: initialData?.quantity ?? 1,
      brokerage: initialData?.brokerage ?? 0,
      government_charges: initialData?.government_charges ?? 0,
      other_charges: initialData?.other_charges ?? 0,
      risk_reward: initialData?.risk_reward || '',
      strategy: initialData?.strategy || '',
      notes: initialData?.notes || '',
    },
  });

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const submitForm = async (data: TradeFormData) => {
    const submission: TradeInput = {
      trade_date: data.trade_date,
      symbol: data.symbol.trim().toUpperCase(),
      order_type: data.order_type,
      instrument: data.instrument || undefined,
      exchange: data.exchange || undefined,
      entry_price: data.entry_price,
      exit_price: data.exit_price,
      quantity: data.quantity,
      brokerage: data.brokerage,
      government_charges: data.government_charges,
      other_charges: data.other_charges,
      risk_reward: data.risk_reward || undefined,
      strategy: data.strategy?.trim() || undefined,
      notes: data.notes.trim() || undefined,
    };
    await onSubmit(submission, selectedImage ?? undefined);
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-5 rounded-lg bg-white p-2 dark:bg-slate-800">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="trade-date">Trading date *</label>
          <input id="trade-date" {...register('trade_date')} type="date" className={inputClass} />
          {errors.trade_date && <p className="mt-1 text-xs text-loss">{errors.trade_date.message}</p>}
        </div>
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
          <label className={labelClass} htmlFor="trade-quantity">Quantity *</label>
          <input id="trade-quantity" {...register('quantity', { valueAsNumber: true })} type="number" min="0.000001" step="any" className={inputClass} />
          {errors.quantity && <p className="mt-1 text-xs text-loss">{errors.quantity.message}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="trade-entry">Entry price *</label>
          <input id="trade-entry" {...register('entry_price', { valueAsNumber: true })} type="number" min="0.000001" step="any" className={inputClass} />
          {errors.entry_price && <p className="mt-1 text-xs text-loss">{errors.entry_price.message}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="trade-exit">Exit price *</label>
          <input id="trade-exit" {...register('exit_price', { valueAsNumber: true })} type="number" min="0.000001" step="any" className={inputClass} />
          {errors.exit_price && <p className="mt-1 text-xs text-loss">{errors.exit_price.message}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="trade-brokerage">Brokerage</label>
          <input id="trade-brokerage" {...register('brokerage', { valueAsNumber: true })} type="number" min="0" step="any" className={inputClass} />
          {errors.brokerage && <p className="mt-1 text-xs text-loss">{errors.brokerage.message}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="trade-government-charges">Government charges</label>
          <input id="trade-government-charges" {...register('government_charges', { valueAsNumber: true })} type="number" min="0" step="any" className={inputClass} />
          {errors.government_charges && <p className="mt-1 text-xs text-loss">{errors.government_charges.message}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="trade-other-charges">Other charges</label>
          <input id="trade-other-charges" {...register('other_charges', { valueAsNumber: true })} type="number" min="0" step="any" className={inputClass} />
          {errors.other_charges && <p className="mt-1 text-xs text-loss">{errors.other_charges.message}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="trade-instrument">Instrument</label>
          <select id="trade-instrument" {...register('instrument')} className={inputClass}>
            <option value="">Not specified</option>
            {(['STOCK', 'OPTION', 'FUTURE', 'INDEX'] as InstrumentType[]).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="trade-exchange">Exchange</label>
          <select id="trade-exchange" {...register('exchange')} className={inputClass}>
            <option value="">Not specified</option>
            {(['NSE', 'BSE', 'MCX', 'NCDEX'] as ExchangeType[]).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="trade-risk-reward">Risk : Reward</label>
          <input id="trade-risk-reward" {...register('risk_reward')} placeholder="1:2" className={inputClass} />
          {errors.risk_reward && <p className="mt-1 text-xs text-loss">{errors.risk_reward.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="trade-strategy">Strategy</label>
          <input id="trade-strategy" {...register('strategy')} maxLength={200} placeholder="e.g. Breakout retest" className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="trade-notes">Trade notes</label>
          <textarea id="trade-notes" {...register('notes')} maxLength={5000} rows={3} placeholder="Setup, execution, and lessons..." className={inputClass} />
          {errors.notes && <p className="mt-1 text-xs text-loss">{errors.notes.message}</p>}
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

      <p className="text-xs text-slate-500 dark:text-slate-400">Gross P&amp;L and Net P&amp;L are calculated from the prices, quantity, and charges.</p>
      <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-profit py-2 font-medium text-white transition-colors hover:bg-profit/90 disabled:opacity-50">
        {isLoading ? 'Saving...' : initialData?.id ? 'Update trade' : 'Save trade'}
      </button>
    </form>
  );
}
