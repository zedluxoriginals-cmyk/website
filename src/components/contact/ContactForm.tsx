"use client";

/*
  Contact form — submits to the `submitContactMessage` server action, which
  inserts into Supabase `contact_messages` (RLS allows anon insert). Shows a
  success state on completion and an inline error otherwise. Required-field
  validation runs server-side in the action; `required` attrs give instant
  browser hints too.
*/

import { useActionState } from "react";
import { contactSubjects } from "@/data/content";
import { submitContactMessage, type FormResult } from "@/app/actions/forms";

export default function ContactForm() {
  const [state, formAction, pending] = useActionState<FormResult | undefined, FormData>(
    submitContactMessage,
    undefined,
  );

  if (state?.ok) {
    return (
      <div className="border border-line bg-charcoal p-8 text-center">
        <h3 className="font-serif text-[24px] text-white">Message sent.</h3>
        <p className="mt-3 text-[13px] text-muted">
          Thank you for reaching out — our team will get back to you within 24
          hours.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Full Name">
        <input
          name="name"
          type="text"
          required
          placeholder="Your full name"
          className={inputCls}
        />
      </Field>

      <Field label="Email Address">
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className={inputCls}
        />
      </Field>

      <Field label="Order Number (Optional)">
        <input name="order" type="text" placeholder="e.g. ZLX-12345" className={inputCls} />
      </Field>

      <Field label="Subject">
        <select name="subject" defaultValue="" className={inputCls}>
          <option value="" disabled>
            How can we help?
          </option>
          {contactSubjects.map((s) => (
            <option key={s} value={s} className="bg-charcoal">
              {s}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Message">
        <textarea
          name="message"
          rows={5}
          required
          placeholder="Tell us more..."
          className={`${inputCls} h-[130px] resize-y py-3`}
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
        {pending ? "Sending…" : "Send Message"}
      </button>
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
