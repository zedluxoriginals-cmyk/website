import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Order confirmed" };

/*
  Paystack redirects here after payment with ?order=<orderId>.
  We verify the order exists and is paid, then show a confirmation.
  The payment webhook (not this page) is the source of truth for order status.
*/
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;

  let orderNumber: string | null = null;

  if (orderId) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("orders")
      .select("order_number, payment_status")
      .eq("id", orderId)
      .maybeSingle();
    orderNumber = data?.order_number ?? null;
  }

  return (
    <>
      <Header variant="solid" />
      <main className="container-zed flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        {orderNumber ? (
          <>
            <div className="mb-6 flex h-16 w-16 items-center justify-center border border-line">
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="eyebrow text-[11px] text-muted">Order confirmed</p>
            <h1 className="mt-3 font-serif text-[36px] leading-tight text-white md:text-[48px]">
              Thank you.
            </h1>
            <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-muted">
              Your order <span className="text-white">{orderNumber}</span> has been placed.
              You&rsquo;ll receive a confirmation to the email you provided.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/account"
                className="bg-white px-8 py-3.5 text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white"
              >
                View my orders
              </Link>
              <Link
                href="/shop"
                className="border border-line px-8 py-3.5 text-[11px] font-semibold uppercase tracking-label text-white transition hover:border-white/50"
              >
                Continue shopping
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="font-serif text-[36px] text-white">Payment received</h1>
            <p className="mt-4 text-[13px] text-muted">
              We&rsquo;ve got your order — check your email for a confirmation.
            </p>
            <Link href="/shop" className="mt-8 border border-line px-8 py-3.5 text-[11px] font-semibold uppercase tracking-label text-white transition hover:border-white/50">
              Continue shopping
            </Link>
          </>
        )}
      </main>
    </>
  );
}
