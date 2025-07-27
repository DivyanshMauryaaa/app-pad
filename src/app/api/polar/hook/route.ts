// src/app/api/webhook/polar/route.ts
import { Webhooks } from "@polar-sh/nextjs";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  // INSERT_YOUR_CODE
  onOrderPaid: async (payload) => {
    // The correct property is 'data', not 'order'
    const appId = payload.data?.metadata?.appId;
    if (!appId) {
      console.warn("No appId found in Polar order metadata");
      return;
    }

    // Dynamically import supabase client
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update the app's is_subscribed field to "true"
    const { error } = await supabase
      .from('apps')
      .update({ is_subscribed: 'true' })
      .eq('id', appId);

    if (error) {
      console.error('Error updating subscription status for app', appId, error);
    } else {
      console.log(`Successfully updated subscription for app ${appId}`);
    }
  },
  // You can also use granular handlers like onCheckoutCreated, onOrderCreated, etc.
});