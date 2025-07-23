import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
      case 'invoice.payment_succeeded':
        const session = event.data.object as Stripe.Checkout.Session;
        const appId = session.metadata?.appId;

        if (appId) {
          const { error } = await supabase
            .from('apps')
            .update({ is_subscribed: 'true' })
            .eq('id', appId);

          if (error) {
            console.error('Error updating subscription status:', error);
            return NextResponse.json(
              { error: 'Database update failed' },
              { status: 500 }
            );
          }

          console.log(`Successfully updated subscription for app ${appId}`);
        } else {
          console.warn('No appId found in metadata');
        }
        break;

      case 'customer.subscription.deleted':
      case 'invoice.payment_failed':
        const cancelledSession = event.data.object as Stripe.Subscription | Stripe.Invoice;
        const cancelledAppId = cancelledSession.metadata?.appId;

        if (cancelledAppId) {
          const { error } = await supabase
            .from('apps')
            .update({ is_subscribed: 'false' })
            .eq('id', cancelledAppId);

          if (error) {
            console.error('Error updating subscription status:', error);
            return NextResponse.json(
              { error: 'Database update failed' },
              { status: 500 }
            );
          }

          console.log(`Successfully cancelled subscription for app ${cancelledAppId}`);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}