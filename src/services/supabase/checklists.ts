import { TABLES, supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { DailyChecklist } from '@/types';
import { normalizeSupabaseError, requireUserId } from '@/services/supabase/common';

export const DAILY_CHECKLIST_RULES = [
  'trending_or_ranging',
  'continuation_or_reversal',
  'high_or_low_volatility',
  'clean_or_choppy',
  'liquidity_location',
  'invalidation',
  'risk_reward',
  'following_strategy',
] as const;

export async function getDailyChecklist(userId: string, date: string): Promise<{ success: boolean; data?: DailyChecklist | null; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: null };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.DAILY_CHECKLISTS)
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to load checklist') };
    }

    return { success: true, data: data || null };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to load checklist') };
  }
}

export async function upsertDailyChecklist(userId: string, date: string, checklist: Partial<DailyChecklist>): Promise<{ success: boolean; data?: DailyChecklist; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: { id: `demo-${date}`, user_id: userId, date, ...checklist } as DailyChecklist };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.DAILY_CHECKLISTS)
      .upsert(
        {
          user_id: userId,
          date,
          trending_or_ranging: checklist.trending_or_ranging ?? null,
          continuation_or_reversal: checklist.continuation_or_reversal ?? null,
          high_or_low_volatility: checklist.high_or_low_volatility ?? null,
          clean_or_choppy: checklist.clean_or_choppy ?? null,
          liquidity_location: checklist.liquidity_location ?? null,
          invalidation: checklist.invalidation ?? null,
          risk_reward: checklist.risk_reward ?? null,
          following_strategy: checklist.following_strategy ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single();

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to save checklist') };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to save checklist') };
  }
}

export function validateDailyChecklist(checklist: Partial<DailyChecklist>): string[] {
  const validationErrors: string[] = [];

  DAILY_CHECKLIST_RULES.forEach((key) => {
    const value = checklist[key as keyof DailyChecklist];
    if (key === 'following_strategy' && value === undefined) {
      validationErrors.push('Following strategy is required.');
    } else if (key !== 'following_strategy' && (value === undefined || value === null || String(value).trim() === '')) {
      validationErrors.push(`Checklist field "${key}" is required.`);
    }
  });

  return validationErrors;
}
