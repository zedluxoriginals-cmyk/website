"use client";

import { useWishlist } from "./WishlistProvider";
import { HeartIcon } from "../icons";

/*
  Heart toggle. Two variants: a small overlay button for product cards, and
  a labeled inline button for the PDP. Renders inert (outline) until the
  store has hydrated, to avoid a server/client mismatch.
*/

export default function WishlistButton({
  slug,
  variant = "icon",
}: {
  slug: string;
  variant?: "icon" | "inline";
}) {
  const { isWishlisted, toggleWishlist, hydrated } = useWishlist();
  const active = hydrated && isWishlisted(slug);

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={() => toggleWishlist(slug)}
        aria-pressed={active}
        className="inline-flex h-[46px] items-center justify-center gap-2 border border-line px-5 text-[11px] font-semibold uppercase tracking-label text-white transition hover:border-white/40"
      >
        <HeartIcon className="h-4 w-4" filled={active} />
        {active ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        toggleWishlist(slug);
      }}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/70"
    >
      <HeartIcon className="h-4 w-4" filled={active} />
    </button>
  );
}
