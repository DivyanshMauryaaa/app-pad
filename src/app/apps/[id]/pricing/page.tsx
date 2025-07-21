'use client'

import { useState } from 'react';
import { useIsSubscribed } from '@/hooks/use-is-subscribed';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function PricingPage() {
  const params = useParams();

  const APP_ID_PARAM = params.id;
  const APP_ID = APP_ID_PARAM?.toString() ?? '';
  const isSubscribed = useIsSubscribed(APP_ID);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const handleSubscribe = async () => {
    setLoading(true);
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId: APP_ID, userId: user?.id }), // userId can be anything, not used for subscription logic
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      <h1 className="text-4xl font-bold mb-8">Pricing</h1>
      <div className="flex gap-8">
        <Card className="p-6 w-64 flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-2">Free</h2>
          <p className="mb-4">Basic features</p>
          <div className="text-3xl font-bold mb-4">$0</div>
          <Button variant="outline" disabled>
            Current Plan
          </Button>
        </Card>
        <Card className="p-6 w-64 flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-2">Pro</h2>
          <p className="mb-4">All features, priority support</p>
          <div className="text-3xl font-bold mb-4">$15/mo</div>
          {isSubscribed ? (
            <Button variant="default" disabled>
              Subscribed
            </Button>
          ) : (
            <Button onClick={handleSubscribe} disabled={loading}>
              {loading ? 'Redirecting...' : 'Subscribe'}
            </Button>
          )}
        </Card>
      </div>
      <div className="mt-8">
        <span className="font-medium">Subscription status:</span>{' '}
        {isSubscribed === null ? 'Loading...' : isSubscribed ? 'Active' : 'Not Subscribed'}
      </div>
    </div>
  );
} 