// src/app/api/polar/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { products, metadata } = await req.json();

  // Call the Polar API directly
  const response = await fetch('https://sandbox.api.polar.sh/api/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.POLAR_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      products: [products], // or just products if it's already an array
      success_url: process.env.SUCCESS_URL,
      metadata, // Pass your metadata here
    }),
  });

  const data = await response.json();

  if (response.ok && data?.url) {
    return NextResponse.json({ url: data.url });
  } else {
    return NextResponse.json({ error: data?.error || 'Failed to create checkout session' }, { status: 500 });
  }
}