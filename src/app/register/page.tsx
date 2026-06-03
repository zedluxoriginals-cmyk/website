import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import AuthForm from "@/components/auth/AuthForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Create Account" };

export default async function RegisterPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/account");

  return (
    <>
      <Header variant="solid" />
      <main className="container-zed flex justify-center pb-20 pt-14">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 text-center">
            <p className="eyebrow text-[11px] text-muted">Join ZEDLUXE</p>
            <h1 className="mt-2 font-serif text-[36px] leading-none text-white">
              Create Account
            </h1>
            <p className="mt-3 text-[12px] text-muted">
              Optional — you can always check out as a guest.
            </p>
          </div>
          <AuthForm mode="register" />
        </div>
      </main>
    </>
  );
}
