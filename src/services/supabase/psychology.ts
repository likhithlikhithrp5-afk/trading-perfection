import { TABLES, supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { PsychologyEntry } from '@/types';
import { normalizeSupabaseError, requireUserId } from '@/services/supabase/common';

export async function getPsychologyEntry(userId: string, date: string): Promise<{ success: boolean; data?: PsychologyEntry | null; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: null };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.PSYCHOLOGY_ENTRIES)
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to load psychology entry') };
    }

    return { success: true, data: data || null };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to load psychology entry') };
  }
}

export async function upsertPsychologyEntry(userId: string, date: string, entry: Partial<PsychologyEntry>): Promise<{ success: boolean; data?: PsychologyEntry; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  const ratings = [
    entry.confidence_before,
    entry.fear_before,
    entry.greed_before,
    entry.focus_before,
    entry.discipline_before,
  ].filter((value) => value !== undefined && value !== null);

  const invalidRatings = ratings.filter((value) => Number(value) < 1 || Number(value) > 5);
  if (invalidRatings.length > 0) {
    return { success: false, error: 'Psychology ratings must be between 1 and 5.' };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: { id: `demo-${date}`, user_id: userId, date, ...entry } as PsychologyEntry };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.PSYCHOLOGY_ENTRIES)
      .upsert(
        {
          user_id: userId,
          date,
          confidence_before: entry.confidence_before ?? null,
          fear_before: entry.fear_before ?? null,
          greed_before: entry.greed_before ?? null,
          focus_before: entry.focus_before ?? null,
          discipline_before: entry.discipline_before ?? null,
          emotional_state_after: entry.emotional_state_after ?? null,
          biggest_mistake: entry.biggest_mistake ?? null,
          lesson_learned: entry.lesson_learned ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,date' }
      )
      .select()
      .single();

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to save psychology entry') };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to save psychology entry') };
  }
}
