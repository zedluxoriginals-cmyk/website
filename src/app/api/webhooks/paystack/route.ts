import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/*
  POST /api/webhooks/paystack
  Receives Paystack webhook events, verifies the HMAC signature, enforces
  idempotency via payment_events, then updates orders + reduces stock on
  charge.success.

  Register this URL in your Paystack dashboard → Settings → Webhooks.
  Must be publicly reachable (not localhost) — use the Vercel deployment URL.
*/

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const secret = process.env.PAYSTACK_SECRET_KEY ?? "";

  // 1. Verify HMAC-SHA512 signature — reject anything that doesn't match.
  const expected = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const event = payload.event as string;
  const data = payload.data as Record<string, unknown>;
  const reference = data?.reference as string | undefined;
  const eventId = `${event}::${reference}`;

  const supabase = createAdminClient();

  // 2. Idempotency — store the raw event; skip if we've already processed it.
  const { data: existing } = await supabase
    .from("payment_events")
    .select("id, processed")
    .eq("event_id", eventId)
    .maybeSingle();

  if (existing?.processed) {
    return NextResponse.json({ ok: true, status: "already_processed" });
  }

  // Insert raw event record (create or update).
  if (!existing) {
    await supabase.from("payment_events").insert({
      event_id: eventId,
      event_type: event,
      provider: "paystack",
      raw_payload: payload,
      processed: false,
    });
  }

  // 3. Handle charge.success — mark order paid + reduce stock.
  if (event === "charge.success") {
    const orderId = reference; // we set reference = order.id in checkout
    if (!orderId) {
      return NextResponse.json({ ok: true, status: "no_reference" });
    }

    // Fetch order to confirm it exists and isn't already paid.
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, status, payment_status")
      .eq("id", orderId)
      .maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json({ ok: true, status: "order_not_found" });
    }

    if (order.payment_status === "paid") {
      // Already marked paid (e.g. duplicate webhook) — mark event processed and exit.
      await supabase
        .from("payment_events")
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq("event_id", eventId);
      return NextResponse.json({ ok: true, status: "already_paid" });
    }

    // Update order to paid.
    const { error: updateErr } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "paid",
        placed_at: new Date().toISOString(),
        payment_reference: reference,
      })
      .eq("id", orderId);

    if (updateErr) {
      console.error("Order update failed:", updateErr);
      return NextResponse.json({ error: "Order update failed." }, { status: 500 });
    }

    // Update payment session.
    await supabase
      .from("payment_sessions")
      .update({ status: "paid" })
      .eq("order_id", orderId);

    // Reduce stock for each order item.
    const { data: items } = await supabase
      .from("order_items")
      .select("variant_id, quantity")
      .eq("order_id", orderId);

    if (items?.length) {
      for (const item of items) {
        if (!item.variant_id) continue;

        // Decrement stock — clamp to 0 to avoid going negative.
        const { data: variant } = await supabase
          .from("product_variants")
          .select("stock_quantity")
          .eq("id", item.variant_id)
          .maybeSingle();

        const newQty = Math.max(0, (variant?.stock_quantity ?? 0) - item.quantity);

        await supabase
          .from("product_variants")
          .update({ stock_quantity: newQty })
          .eq("id", item.variant_id);

        // Audit the stock movement.
        await supabase.from("inventory_movements").insert({
          variant_id: item.variant_id,
          quantity_delta: -item.quantity,
          reason: "sale",
          note: `Order ${orderId}`,
        });
      }
    }

    // Mark the payment event as processed.
    await supabase
      .from("payment_events")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("event_id", eventId);

    return NextResponse.json({ ok: true, status: "order_paid" });
  }

  // 4. Handle charge.failed — mark order payment as failed.
  if (event === "charge.failed") {
    const orderId = reference;
    if (orderId) {
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", orderId);

      await supabase
        .from("payment_sessions")
        .update({ status: "failed" })
        .eq("order_id", orderId);
    }

    await supabase
      .from("payment_events")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("event_id", eventId);

    return NextResponse.json({ ok: true, status: "order_failed" });
  }

  // Other events — mark processed and ignore.
  await supabase
    .from("payment_events")
    .update({ processed: true, processed_at: new Date().toISOString() })
    .eq("event_id", eventId);

  return NextResponse.json({ ok: true, status: "ignored" });
}
