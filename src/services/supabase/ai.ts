import { TABLES, supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { AIConversation, AIMessage, AITradeAnalysis } from '@/types';
import { normalizeSupabaseError, requireUserId } from '@/services/supabase/common';

export async function createAIConversation(userId: string): Promise<{ success: boolean; data?: AIConversation; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: { id: `demo-conversation-${Date.now()}`, user_id: userId } as AIConversation };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.AI_CONVERSATIONS)
      .insert([{ user_id: userId }])
      .select()
      .single();

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to create AI conversation') };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to create AI conversation') };
  }
}

export async function saveAIMessage(userId: string, conversationId: string, role: 'user' | 'assistant', content: string, chartImageUrl?: string): Promise<{ success: boolean; data?: AIMessage; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: { id: `demo-message-${Date.now()}`, conversation_id: conversationId, user_id: userId, role, content, chart_image_url: chartImageUrl } as AIMessage };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.AI_MESSAGES)
      .insert([
        {
          conversation_id: conversationId,
          user_id: userId,
          role,
          content,
          chart_image_url: chartImageUrl || null,
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to save AI message') };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to save AI message') };
  }
}

export async function getAIHistory(userId: string): Promise<{ success: boolean; data?: Array<{ conversation: AIConversation; messages: AIMessage[] }>; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: [] };
  }

  try {
    const { data: conversations, error: conversationError } = await supabase
      .from(TABLES.AI_CONVERSATIONS)
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (conversationError) {
      return { success: false, error: normalizeSupabaseError(conversationError, 'Failed to load AI history') };
    }

    const enriched = await Promise.all(
      (conversations || []).map(async (conversation) => {
        const client = supabase;
        if (!client) {
          return { conversation, messages: [] as AIMessage[] };
        }

        const { data: messages, error: messageError } = await client
          .from(TABLES.AI_MESSAGES)
          .select('*')
          .eq('conversation_id', conversation.id)
          .eq('user_id', userId)
          .order('created_at', { ascending: true });

        if (messageError) {
          throw new Error(normalizeSupabaseError(messageError, 'Failed to load AI messages'));
        }

        return { conversation, messages: messages || [] };
      })
    );

    return { success: true, data: enriched };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to load AI history') };
  }
}

export async function saveAIAnalysis(userId: string, analysis: Partial<AITradeAnalysis>): Promise<{ success: boolean; data?: AITradeAnalysis; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, data: { id: `demo-analysis-${Date.now()}`, user_id: userId, date: analysis.date || new Date().toISOString().slice(0, 10), trade_setup_details: analysis.trade_setup_details || {}, score: analysis.score || 0, reasoning: analysis.reasoning || '', warnings: analysis.warnings || [], similar_trades_count: analysis.similar_trades_count || 0, similar_trades_win_rate: analysis.similar_trades_win_rate || 0, rules_passed: analysis.rules_passed || 0, rules_failed: analysis.rules_failed || 0 } as AITradeAnalysis };
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.AI_TRADE_ANALYSES)
      .insert([
        {
          user_id: userId,
          date: analysis.date || new Date().toISOString().slice(0, 10),
          trade_setup_details: analysis.trade_setup_details || {},
          score: analysis.score || 0,
          reasoning: analysis.reasoning || '',
          warnings: analysis.warnings || [],
          similar_trades_count: analysis.similar_trades_count || 0,
          similar_trades_win_rate: analysis.similar_trades_win_rate || 0,
          rules_passed: analysis.rules_passed || 0,
          rules_failed: analysis.rules_failed || 0,
        },
      ])
      .select()
      .single();

    if (error) {
      return { success: false, error: normalizeSupabaseError(error, 'Failed to save AI analysis') };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to save AI analysis') };
  }
}

export async function clearAIHistory(userId: string): Promise<{ success: boolean; error?: string }> {
  const userCheck = requireUserId(userId);
  if (!userCheck.success) return userCheck as { success: boolean; error?: string };

  if (!isSupabaseConfigured || !supabase) {
    return { success: true };
  }

  try {
    const { error: messagesError } = await supabase
      .from(TABLES.AI_MESSAGES)
      .delete()
      .eq('user_id', userId);

    if (messagesError) {
      return { success: false, error: normalizeSupabaseError(messagesError, 'Failed to clear AI messages') };
    }

    const { error: conversationsError } = await supabase
      .from(TABLES.AI_CONVERSATIONS)
      .delete()
      .eq('user_id', userId);

    if (conversationsError) {
      return { success: false, error: normalizeSupabaseError(conversationsError, 'Failed to clear AI conversations') };
    }

    const { error: analysesError } = await supabase
      .from(TABLES.AI_TRADE_ANALYSES)
      .delete()
      .eq('user_id', userId);

    if (analysesError) {
      return { success: false, error: normalizeSupabaseError(analysesError, 'Failed to clear AI analyses') };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: normalizeSupabaseError(error, 'Failed to clear AI history') };
  }
}
