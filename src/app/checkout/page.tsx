import type { Metadata } from "next";
import Header from "@/components/Header";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your ZEDLUXE ORIGINALS order.",
};

export default function CheckoutPage() {
  return (
    <>
      <Header variant="solid" />
      <main className="container-zed pb-20 pt-10">
        <div className="mb-8">
          <p className="eyebrow text-[11px] text-muted">Secure Checkout</p>
          <h1 className="mt-2 font-serif text-[36px] leading-none text-white md:text-[44px]">
            Complete your order
          </h1>
        </div>
        <CheckoutForm />
      </main>
    </>
  );
}
