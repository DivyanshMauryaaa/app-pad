'use client'

import { useState } from 'react';
import { useIsSubscribed } from '@/hooks/use-is-subscribed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { CheckCircle } from 'lucide-react';

export default function PricingPage() {
  const params = useParams();

  const APP_ID_PARAM = params.id;
  const APP_ID = APP_ID_PARAM?.toString() ?? '';
  const isSubscribed = useIsSubscribed(APP_ID);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const handleSubscribe = async () => {
    setLoading(true);
    const res = await fetch('/api/create-checkout-session', {
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
    <div className="flex flex-col min-h-screen py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Pricing</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-8xl mx-auto px-4 py-12">
        {/* Free Plan */}
        <Card className="rounded-2xl shadow-md w-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Free</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-extrabold">$0<span className="text-base font-normal text-muted-foreground">/mo</span></div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Limited AI Docs</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Basic Tasks</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Community Access</li>
            </ul>
            <Button variant="outline" className="w-full">Get Started</Button>
          </CardContent>
        </Card>

        {/* Paid Plan */}
        <Card className="border-4 border-blue-600 rounded-2xl shadow-lg w-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-700">Pro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-extrabold text-blue-700">$15<span className="text-base font-normal text-muted-foreground">/mo</span></div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Unlimited AI Docs</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> AI Task Manager</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Priority Support</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Team Collaboration</li>
            </ul>
            <Button onClick={handleSubscribe} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Upgrade to Pro</Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
          {isSubscribed === "true" ? <p className='text-green-600'>Active</p> : <p></p>}
      </div>

    </div>
  );
} 