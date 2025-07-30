import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const { app_id, user_id } = await req.json();
    if (!app_id || !user_id) {
      return NextResponse.json({ allowed: false, error: 'Missing app_id or user_id' }, { status: 400 });
    }
    // Check if user is Pro
    const { data: app } = await supabase.from('apps').select('is_subscribed').eq('id', app_id).single();
    if (app?.is_subscribed === 'standard' || app?.is_subscribed === 'pro') {
      return NextResponse.json({ allowed: true, generations_left: null });
    }
    // Free plan: check ai_usage
    const today = new Date().toISOString().slice(0, 10);
    let { data: usage, error } = await supabase
      .from('ai_usage')
      .select('*')
      .eq('user_id', user_id)
      .eq('app_id', app_id)
      .eq('date', today)
      .single();
    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ allowed: false, error: error.message }, { status: 500 });
    }
    if (!usage) {
      // No usage yet today, insert
      const { error: insertError } = await supabase.from('ai_usage').insert({ user_id, app_id, date: today, count: 1 });
      if (insertError) {
        return NextResponse.json({ allowed: false, error: insertError.message }, { status: 500 });
      }
      return NextResponse.json({ allowed: true, generations_left: 9 });
    } else {
      if (usage.count >= 10) {
        return NextResponse.json({ allowed: false, generations_left: 0 });
      }
      // Increment usage
      const { error: updateError } = await supabase
        .from('ai_usage')
        .update({ count: usage.count + 1 })
        .eq('id', usage.id);
      if (updateError) {
        return NextResponse.json({ allowed: false, error: updateError.message }, { status: 500 });
      }
      return NextResponse.json({ allowed: true, generations_left: 10 - (usage.count + 1) });
    }
  } catch (error) {
    return NextResponse.json({ allowed: false, error: error?.toString() }, { status: 500 });
  }
} 