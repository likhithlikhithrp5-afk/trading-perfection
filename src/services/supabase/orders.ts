import { TABLES, supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Order } from '@/types';
import { normalizeSupabaseError, requireUserId } from '@/services/supabase/common';

export async function listOrders(userId: string): Promise<{ success: boolean; data?: Order[]; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: [] };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.ORDERS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to load orders') };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to load orders') };
  }
}

export async function createOrder(userId: string, order: Partial<Order>): Promise<{ success: boolean; data?: Order; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: { id: `demo-order-${Date.now()}`, user_id: userId, order_id: order.order_id || `ORD-${Date.now()}`, symbol: order.symbol || '', order_type: order.order_type || 'BUY', quantity: order.quantity || 0, price: order.price || 0, status: order.status || 'open' } as Order };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.ORDERS)
      .insert([
        {
          user_id: userId,
          order_id: order.order_id || `ORD-${Date.now()}`,
          symbol: order.symbol || '',
          order_type: order.order_type || 'BUY',
          quantity: order.quantity || 0,
          price: order.price || 0,
          status: order.status || 'open',
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to create order') };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to create order') };
  }
}

export async function updateOrder(userId: string, orderId: string, updates: Partial<Order>): Promise<{ success: boolean; data?: Order; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: { id: orderId, user_id: userId, order_id: orderId, symbol: updates.symbol || '', order_type: updates.order_type || 'BUY', quantity: updates.quantity || 0, price: updates.price || 0, status: updates.status || 'open' } as Order };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.ORDERS)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to update order') };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to update order') };
  }
}

export async function deleteOrder(userId: string, orderId: string): Promise<{ success: boolean; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from(TABLES.ORDERS)
      .delete()
      .eq('id', orderId)
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to delete order') };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to delete order') };
  }
}
