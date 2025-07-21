import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import supabase from '@/supabase/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const buf = await req.arrayBuffer();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(buf),
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${(err as Error).message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const appId = session.metadata?.appId;
    if (appId) {
      await supabase
        .from('apps')
        .update({ is_subscribed: 'true' })
        .eq('id', appId);
    }
  }

  return NextResponse.json({ received: true });
} 