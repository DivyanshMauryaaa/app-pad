import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  try {
    const { stripeSecretKey } = await req.json();
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Missing Stripe secret key' }, { status: 400 });
    }
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-06-30.basil' });

    // Fetch total revenue
    const charges = await stripe.charges.list({ limit: 100 });
    const totalRevenue = charges.data.reduce((sum, charge) => sum + (charge.paid && !charge.refunded ? charge.amount : 0), 0) / 100;
    const totalRefunds = charges.data.reduce((sum, charge) => sum + (charge.refunded ? charge.amount_refunded : 0), 0) / 100;
    const totalCharges = charges.data.length;

    // Fetch new customers (last 30 days)
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60;
    const customers = await stripe.customers.list({ limit: 100, created: { gte: thirtyDaysAgo } });
    const newCustomers = customers.data.length;

    // Fetch active subscriptions
    const subscriptions = await stripe.subscriptions.list({ limit: 100, status: 'active' });
    const activeSubscriptions = subscriptions.data.length;

    const products = await stripe.products.list({ limit: 100 });

    return NextResponse.json({
      totalRevenue,
      totalRefunds,
      totalCharges,
      newCustomers,
      activeSubscriptions,
      products: products.data,
      customers: customers.data,
      transactions: charges.data,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}