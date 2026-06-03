import type { Metadata } from "next";
import Header from "@/components/Header";
import CartView from "./CartView";

export const metadata: Metadata = {
  title: "Your Bag",
};

export default function CartPage() {
  return (
    <>
      <Header variant="solid" />
      <main className="container-zed pb-20 pt-10">
        <div className="mb-8">
          <p className="eyebrow text-[11px] text-muted">Checkout</p>
          <h1 className="mt-2 font-serif text-[40px] leading-none text-white md:text-[52px]">
            Your Bag
          </h1>
        </div>
        <CartView />
      </main>
    </>
  );
}
