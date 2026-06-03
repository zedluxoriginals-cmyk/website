import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/*
  POST /api/checkout
  Validates cart lines server-side, creates a draft order, initialises a
  Paystack transaction, and returns the Paystack authorization URL.

  Body (guest):
    { lines, email, phone, shippingAddress }

  Body (logged-in):
    { lines, addressId, email?, phone? }
    (email + phone read from profile if omitted)

  Lines shape: Array<{ variantId, productId, quantity }>

  Returns: { orderId, orderNumber, authorizationUrl }
*/

/*
  Lines come from CartLine which uses productId::size::color as the key.
  We resolve the real variantId server-side by matching product + size + color
  so the client never needs to store DB variant IDs.
*/
type LineInput = {
  productId: string;
  size: string;
  color: string;
  quantity: number;
};

type ShippingAddressInput = {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  country?: string;
  phone?: string;
};

type CheckoutBody = {
  lines: LineInput[];
  email: string;
  phone?: string;
  addressId?: string;           // saved address (logged-in users)
  shippingAddress?: ShippingAddressInput; // guest or new address
};

const FREE_SHIPPING_THRESHOLD = 150_000; // ₦ — matches store_settings default
const SHIPPING_COST = 3_500;             // ₦ flat rate when below threshold

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutBody;
    const { lines, email, phone, addressId, shippingAddress } = body;

    if (!email?.includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }
    if (!lines?.length) {
      return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });
    }
    if (!addressId && !shippingAddress) {
      return NextResponse.json({ error: "A delivery address is required." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Try to identify the logged-in user (optional — guest checkout is allowed).
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();

    // Resolve shipping address.
    let resolvedAddress: Record<string, unknown>;
    if (addressId && user) {
      const { data: addr, error } = await supabase
        .from("addresses")
        .select("full_name, line1, line2, city, state, country, phone, postal_code")
        .eq("id", addressId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error || !addr) {
        return NextResponse.json({ error: "Address not found." }, { status: 400 });
      }
      resolvedAddress = addr;
    } else if (shippingAddress) {
      resolvedAddress = {
        full_name: shippingAddress.fullName,
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 ?? null,
        city: shippingAddress.city,
        state: shippingAddress.state ?? null,
        country: shippingAddress.country ?? "Nigeria",
        phone: shippingAddress.phone ?? phone ?? null,
        postal_code: null,
      };
    } else {
      return NextResponse.json({ error: "A delivery address is required." }, { status: 400 });
    }

    // Look up all product variants for the given products + size/color combos.
    const productIds = [...new Set(lines.map((l) => l.productId))];
    const { data: variants, error: varErr } = await supabase
      .from("product_variants")
      .select("id, price, stock_quantity, is_active, product_id, size, color_name, products(id, title, status, base_price, product_images(url, is_primary, sort_order))")
      .in("product_id", productIds)
      .eq("is_active", true);

    if (varErr) {
      return NextResponse.json({ error: "Could not verify your items. Please try again." }, { status: 400 });
    }

    type DbVariant = {
      id: string;
      price: number | null;
      stock_quantity: number;
      is_active: boolean;
      product_id: string;
      size: string | null;
      color_name: string | null;
      products: { id: string; title: string; status: string; base_price: number; product_images: { url: string; is_primary: boolean; sort_order: number }[] } | null;
    };

    const allVariants = (variants ?? []) as unknown as DbVariant[];

    type OrderItemInsert = {
      product_id: string;
      variant_id: string;
      product_title: string;
      variant_title: string | null;
      quantity: number;
      unit_price: number;
      line_total: number;
      image_url: string | null;
    };

    const orderItems: OrderItemInsert[] = [];
    let subtotal = 0;

    for (const line of lines) {
      // Match by productId + size + color (case-insensitive).
      const variant = allVariants.find(
        (v) =>
          v.product_id === line.productId &&
          (v.size?.toLowerCase() === line.size.toLowerCase() || (!v.size && !line.size)) &&
          (v.color_name?.toLowerCase() === line.color.toLowerCase() || (!v.color_name && !line.color)),
      ) ?? allVariants.find((v) => v.product_id === line.productId);

      if (!variant) {
        return NextResponse.json({ error: "One of your items is no longer available." }, { status: 400 });
      }
      const product = variant.products;
      if (!product || product.status !== "active") {
        return NextResponse.json({ error: `"${product?.title ?? "An item"}" is no longer available.` }, { status: 400 });
      }
      if (variant.stock_quantity < line.quantity) {
        return NextResponse.json({
          error: `Only ${variant.stock_quantity} of "${product.title}" left in stock.`,
        }, { status: 400 });
      }

      // Always use DB price — never trust the client.
      const unitPrice = variant.price ?? product.base_price;
      const lineTotal = unitPrice * line.quantity;
      subtotal += lineTotal;

      const images = [...(product.product_images ?? [])].sort(
        (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order,
      );

      orderItems.push({
        product_id: product.id,
        variant_id: variant.id,
        product_title: product.title,
        variant_title: [variant.color_name, variant.size].filter(Boolean).join(" / ") || null,
        quantity: line.quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
        image_url: images[0]?.url ?? null,
      });
    }

    const shippingTotal = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const grandTotal = subtotal + shippingTotal;

    // Read free-shipping threshold from store_settings if available.
    const { data: settings } = await supabase
      .from("store_settings")
      .select("free_shipping_threshold")
      .limit(1)
      .maybeSingle();
    const threshold = settings?.free_shipping_threshold ?? FREE_SHIPPING_THRESHOLD;
    const finalShipping = subtotal >= threshold ? 0 : SHIPPING_COST;
    const finalTotal = subtotal + finalShipping;

    // Create the draft order.
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        email,
        phone: phone ?? null,
        status: "pending_payment",
        payment_status: "pending",
        payment_provider: "paystack",
        subtotal,
        shipping_total: finalShipping,
        discount_total: 0,
        tax_total: 0,
        grand_total: finalTotal,
        currency: "NGN",
        shipping_address: resolvedAddress,
        billing_address: resolvedAddress,
      })
      .select("id, order_number")
      .single();

    if (orderErr || !order) {
      console.error("Order insert error:", orderErr);
      return NextResponse.json({ error: "Could not create your order. Please try again." }, { status: 500 });
    }

    // Insert order items.
    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

    if (itemsErr) {
      console.error("Order items error:", itemsErr);
      // Clean up the orphaned order.
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: "Could not save your order. Please try again." }, { status: 500 });
    }

    // Initialise Paystack transaction.
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(finalTotal * 100), // Paystack expects kobo
        currency: "NGN",
        reference: order.id,
        metadata: {
          order_id: order.id,
          order_number: order.order_number,
          custom_fields: [
            { display_name: "Order", variable_name: "order_number", value: order.order_number },
          ],
        },
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?order=${order.id}`,
      }),
    });

    const paystackJson = await paystackRes.json() as { status: boolean; data?: { authorization_url: string; reference: string } };

    if (!paystackJson.status || !paystackJson.data?.authorization_url) {
      console.error("Paystack init failed:", paystackJson);
      // Mark order as cancelled so it doesn't pollute records.
      await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id);
      return NextResponse.json({ error: "Payment could not be started. Please try again." }, { status: 502 });
    }

    // Record payment session.
    await supabase.from("payment_sessions").insert({
      order_id: order.id,
      provider: "paystack",
      provider_session_id: paystackJson.data.reference,
      amount: finalTotal,
      currency: "NGN",
      status: "pending",
      checkout_url: paystackJson.data.authorization_url,
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      authorizationUrl: paystackJson.data.authorization_url,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
