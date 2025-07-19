import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/supabase/client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const installation_id = searchParams.get('installation_id');
  const appId = searchParams.get('state'); // We use 'state' to track which app

  if (!installation_id || !appId) {
    return NextResponse.json({ error: 'Missing installation_id or state' }, { status: 400 });
  }

  // Update the app in Supabase with the installation_id
  const { error } = await supabase
    .from('apps')
    .update({ github_installation_id: installation_id })
    .eq('id', appId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Redirect to the app page
  return NextResponse.redirect(`/apps/${appId}`);
} 