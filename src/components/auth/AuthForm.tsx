"use client";

/*
  Shared auth form (login / register). Uses useActionState against the auth
  server actions; shows inline errors and a pending state. Register mode adds
  name + phone (phone matters for guest-style contact + order notifications).
*/

import { useActionState } from "react";
import Link from "next/link";
import { signIn, signUp, type AuthState } from "@/app/auth/actions";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5">
      {mode === "register" && (
        <>
          <Field label="Full Name">
            <input name="full_name" type="text" autoComplete="name" className={inputCls} />
          </Field>
          <Field label="Phone">
            <input name="phone" type="tel" autoComplete="tel" placeholder="+234..." className={inputCls} />
          </Field>
        </>
      )}

      <Field label="Email Address">
        <input name="email" type="email" autoComplete="email" required className={inputCls} />
      </Field>

      <Field label="Password">
        <input
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={8}
          className={inputCls}
        />
      </Field>

      {state?.error && (
        <p className="text-[12px] text-red-400" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="h-[46px] w-full bg-white text-[11px] font-semibold uppercase tracking-label text-black transition hover:bg-off-white disabled:opacity-60"
      >
        {pending
          ? "Please wait…"
          : mode === "login"
            ? "Sign In"
            : "Create Account"}
      </button>

      <p className="text-center text-[12px] text-muted">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/register" className="text-white underline underline-offset-2 hover:opacity-70">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-white underline underline-offset-2 hover:opacity-70">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

const inputCls =
  "h-[46px] w-full border border-[#303030] bg-[#090909] px-3.5 text-[13px] text-white placeholder:text-soft-muted focus:border-white focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-label text-soft-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
