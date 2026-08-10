import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

// Optional: auto-grants access when someone buys through your Stripe
// Payment Link. Requires STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and
// SUPABASE_SERVICE_ROLE_KEY env vars. Until configured, grant access
// manually via the purchases table.

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secretKey || !webhookSecret || !serviceRole) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 501 }
    );
  }

  const stripe = new Stripe(secretKey);
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const payload = await request.text();
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      webhookSecret
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email;
    if (email) {
      const admin = createSupabaseAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRole
      );
      await admin
        .from("purchases")
        .upsert(
          { email: email.toLowerCase(), note: "stripe" },
          { onConflict: "email" }
        );
    }
  }

  return NextResponse.json({ received: true });
}
