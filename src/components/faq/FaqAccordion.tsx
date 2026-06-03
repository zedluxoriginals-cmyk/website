"use client";

/*
  Accessible FAQ accordions. Each category is a disclosure; inside it each
  question is its own nested disclosure. Buttons carry aria-expanded and
  aria-controls; panels are hidden via the `hidden` attribute so collapsed
  content is removed from the a11y tree and tab order.
*/

import { useId, useState } from "react";
import type { FaqCategory } from "@/data/content";

export default function FaqAccordion({
  categories,
}: {
  categories: FaqCategory[];
}) {
  return (
    <div className="space-y-3.5">
      {categories.map((cat, i) => (
        <CategoryPanel key={cat.title} category={cat} defaultOpen={i === 0} />
      ))}
    </div>
  );
}

function CategoryPanel({
  category,
  defaultOpen,
}: {
  category: FaqCategory;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className="border border-line bg-ink">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center justify-between px-6 py-6 text-left"
        >
          <span className="text-[15px] font-semibold uppercase tracking-[0.14em] text-white">
            {category.title}
          </span>
          <Chevron open={open} />
        </button>
      </h3>
      <div id={panelId} hidden={!open} className="border-t border-line px-6 pb-2">
        {category.items.map((item) => (
          <QuestionRow key={item.q} q={item.q} a={item.a} />
        ))}
      </div>
    </div>
  );
}

function QuestionRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="border-b border-[#242424] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-[13px] text-off-white">{q}</span>
        <Chevron open={open} small />
      </button>
      <div id={panelId} hidden={!open} className="max-w-[880px] pb-4">
        <p className="text-[13px] leading-relaxed text-muted">{a}</p>
      </div>
    </div>
  );
}

function Chevron({ open, small }: { open: boolean; small?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`${small ? "h-3.5 w-3.5" : "h-4 w-4"} shrink-0 text-muted transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
