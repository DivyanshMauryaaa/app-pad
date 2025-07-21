import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useIsSubscribed(appId: string) {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!appId) return;
    supabase
      .from('apps')
      .select('is_subscribed')
      .eq('id', appId)
      .single()
      .then(({ data }) => {
        setIsSubscribed(data?.is_subscribed ?? false);
      });
  }, [appId]);

  return isSubscribed;
} 