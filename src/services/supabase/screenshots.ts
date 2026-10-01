import { supabase, TABLES, STORAGE_BUCKETS, isSupabaseConfigured } from '@/lib/supabase';
import type { TradeImage } from '@/types';
import { normalizeSupabaseError, requireUserId } from '@/services/supabase/common';

const MAX_IMAGES_PER_DAY = 4;

export async function listTradeImages(userId: string, date?: string): Promise<{ success: boolean; data?: TradeImage[]; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: [] };
  }

  try {
    let query = supabase
      .from(TABLES.TRADE_IMAGES)
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to load trade images') };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to load trade images') };
  }
}

export async function uploadTradeImage(
  userId: string,
  date: string,
  file: File,
  tradingDayId?: string
): Promise<{ success: boolean; data?: TradeImage; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase is not configured. Screenshot upload is unavailable in demo mode.' };
  }

  try {
    const existing = await listTradeImages(userId, date);
    if (existing.success && (existing.data || []).length >= MAX_IMAGES_PER_DAY) {
      return { success: false, error: `Maximum ${MAX_IMAGES_PER_DAY} images per trading day allowed.` };
    }

    const safeName = `${userId}/${date}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.TRADE_IMAGES)
      .upload(safeName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'application/octet-stream',
      });

    if (uploadError) {
      return { success: false, error: normalizeSupabaseError(uploadError, 'Failed to upload screenshot') };
    }

    const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKETS.TRADE_IMAGES).getPublicUrl(safeName);
    const { data, error } = await supabase
      .from(TABLES.TRADE_IMAGES)
      .insert([
        {
          user_id: userId,
          trading_day_id: tradingDayId || null,
          date,
          storage_path: safeName,
          uploaded_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to record screenshot metadata') };
    }

    return { success: true, data: { ...data, publicUrl: publicUrlData.publicUrl } as TradeImage & { publicUrl?: string } };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to upload screenshot') };
  }
}

export async function deleteTradeImage(userId: string, imageId: string): Promise<{ success: boolean; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase is not configured. Screenshot deletion is unavailable in demo mode.' };
  }

  try {
    const { data: found, error: findError } = await supabase
      .from(TABLES.TRADE_IMAGES)
      .select('*')
      .eq('id', imageId)
      .eq('user_id', userId)
      .single();

    if (findError) {
      return { success: false, error: normalizeSupabaseError(findError, 'Unable to find screenshot to delete') };
    }

    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKETS.TRADE_IMAGES)
      .remove([found.storage_path]);

    if (storageError) {
      return { success: false, error: normalizeSupabaseError(storageError, 'Failed to delete screenshot from storage') };
    }

    const { error } = await supabase
      .from(TABLES.TRADE_IMAGES)
      .delete()
      .eq('id', imageId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to delete screenshot record') };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to delete screenshot') };
  }
}

export function getTradeImagePublicUrl(storagePath: string) {
  if (!isSupabaseConfigured || !supabase) return null;

  return supabase.storage.from(STORAGE_BUCKETS.TRADE_IMAGES).getPublicUrl(storagePath).data.publicUrl;
}
