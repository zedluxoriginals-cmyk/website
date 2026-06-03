"use client";

/*
  Newsletter signup — submits to the `subscribeNewsletter` server action,
  which upserts into Supabase `newsletter_subscribers` (RLS allows anon
  insert). Shows an inline success/error message.
*/

import { useActionState } from "react";
import { subscribeNewsletter, type FormResult } from "@/app/actions/forms";

export default function Newsletter() {
  const [state, formAction, pending] = useActionState<FormResult | undefined, FormData>(
    subscribeNewsletter,
    undefined,
  );

  return (
    <section className="border-y border-[#222] bg-charcoal">
      <div className="container-zed flex flex-col items-start gap-6 py-9 md:flex-row md:items-center md:justify-between md:py-7">
        <div className="max-w-md">
          <h2 className="text-[13px] font-bold uppercase tracking-wide text-white">
            Stay In The Know
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            Be the first to know about new drops, exclusive offers, and more.
          </p>
        </div>

        {state?.ok ? (
          <p className="text-[13px] text-white md:w-auto" role="status">
            Thanks for subscribing — keep an eye on your inbox.
          </p>
        ) : (
          <form
            action={formAction}
            className="flex w-full flex-col gap-3 sm:flex-row md:w-auto"
            aria-label="Newsletter signup"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              className="h-[42px] w-full border border-[#3a3a3a] bg-[#090909] px-3.5 text-[13px] text-white placeholder:text-soft-muted focus:border-white focus:outline-none sm:w-[360px]"
            />
            <button
              type="submit"
              disabled={pending}
              className="h-[42px] border border-white bg-white px-6 text-[11px] font-bold uppercase tracking-nav text-black transition hover:bg-off-white disabled:opacity-60 sm:w-[140px]"
            >
              {pending ? "…" : "Subscribe"}
            </button>
          </form>
        )}
      </div>
      {state?.error && (
        <p className="container-zed pb-4 text-[12px] text-red-400" role="alert">
          {state.error}
        </p>
      )}
    </section>
  );
}
