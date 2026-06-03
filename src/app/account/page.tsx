import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import AccountView from "@/components/account/AccountView";
import { signOut } from "@/app/auth/actions";
import { getAllProducts } from "@/lib/api/products";
import { getAccountData } from "@/lib/api/account";

export const metadata: Metadata = {
  title: "Account",
};

export default async function AccountPage() {
  const { profile, orders, addresses } = await getAccountData();
  // /account is gated — log in to view it. (Buying does NOT require this.)
  if (!profile) redirect("/login");

  const catalogue = await getAllProducts();

  return (
    <>
      <Header variant="solid" />
      <main className="container-zed pb-16 pt-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow text-[11px] text-muted">My Account</p>
            <h1 className="mt-2 font-serif text-[40px] leading-none text-white md:text-[52px]">
              Dashboard
            </h1>
            <p className="mt-3 text-[13px] text-muted">
              Manage your orders, addresses and preferences in one place.
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-[11px] font-semibold uppercase tracking-label text-muted transition hover:text-white"
            >
              Sign Out
            </button>
          </form>
        </div>
        <AccountView
          catalogue={catalogue}
          profile={profile}
          orders={orders}
          addresses={addresses}
        />
      </main>
    </>
  );
}
