'use client'

import { useEffect, useState } from 'react';
import { useIsSubscribed } from '@/hooks/use-is-subscribed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { CheckCircle } from 'lucide-react';
import supabase from '@/supabase/client';

const PricingPage = () => {
  const params = useParams();
  const appId = params.id;
  const [appName, setAppName] = useState("");

  const getAppData = async () => {
    const { data, error } = await supabase.from('apps')
      .select('name')
      .eq('id', appId)
      .single();
    if (error) {
      console.error(error);
    } else {
      setAppName(data.name);
    }
  };

  useEffect(() => {
    getAppData();
  }, [appId]);

  const isSubscribed = useIsSubscribed(appId as string);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const handleSubscribe = async () => {
    setLoading(true);
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId: appId, userId: user?.id }), // userId can be anything, not used for subscription logic
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Pricing for <span className='text-blue-600'>{appName}</span></h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-8xl mx-auto px-4 py-12">
        {/* Free Plan */}
        <Card className="rounded-2xl shadow-md w-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Free</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-extrabold">$0<span className="text-base font-normal text-muted-foreground">/mo</span></div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Limited Docs to 10</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Limited Tasks to 3 lists & 10 tasks per list</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Limited Env Variables to 3</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Limite AI Access to 20 files & 1000 lines per file</li>
            </ul>
            {/* <Button variant="outline" className="w-full">Get Started</Button> */}
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
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Unlimited AI Usage</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Unlimited Docs</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Unlimited Tasks & Lists</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Unlimited Env Variables</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Env Type supported - Development, Production, Staging</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Customizablity over GitHub Context Usage in AI</li>
            </ul>
            <Button onClick={handleSubscribe} disabled={isSubscribed === "true" || loading ? true : false} className="w-full bg-blue-600 cursor-pointer hover:bg-blue-700 text-white">Upgrade to Pro</Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        {isSubscribed === "true" ? <p className='text-green-600'>Subscription Active</p> : <p></p>}
      </div>

    </div>
  );
}

export default PricingPage;