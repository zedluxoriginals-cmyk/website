"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { mainNav } from "@/data/site";
import { SearchIcon, AccountIcon, BagIcon, MenuIcon, CloseIcon } from "./icons";
import { useCart } from "./cart/CartProvider";

/*
  Header sits over the hero (absolute) and exposes search / account / cart.
  On mobile it collapses to logo + hamburger + cart with a full-screen drawer.
  The bag opens the slide-in cart; its count is live from the cart context.
*/
export default function Header({ variant = "overlay" }: { variant?: "overlay" | "solid" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, openDrawer, hydrated } = useCart();
  // Avoid a hydration mismatch: render 0 until the stored cart has loaded.
  const cartCount = hydrated ? count : 0;

  // Lock body scroll + close on Escape while the mobile menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header
      className={
        variant === "overlay"
          ? "absolute inset-x-0 top-[26px] z-20"
          : "sticky top-0 z-20 border-b border-line bg-black"
      }
    >
      <div className="flex h-[72px] items-center justify-between px-5 lg:px-[72px]">
        {/* Mobile: hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="-ml-2 p-2 text-white md:hidden"
          aria-label="Open menu"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        {/* Left: logo (desktop) / centered (mobile) */}
        <div className="md:flex-1">
          <Logo />
        </div>

        {/* Center: nav (desktop) */}
        <nav className="hidden items-center gap-11 md:flex">
          {mainNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[11px] font-semibold uppercase tracking-nav text-white transition hover:opacity-70"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: utilities */}
        <div className="flex flex-1 items-center justify-end gap-5">
          <Link
            href="/search"
            aria-label="Search"
            className="hidden text-white transition hover:opacity-70 md:inline-flex"
          >
            <SearchIcon className="h-[18px] w-[18px]" />
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="hidden text-white transition hover:opacity-70 md:inline-flex"
          >
            <AccountIcon className="h-[18px] w-[18px]" />
          </Link>
          <button
            type="button"
            onClick={openDrawer}
            aria-label={`Cart, ${cartCount} items`}
            className="relative inline-flex items-center gap-1.5 text-white transition hover:opacity-70"
          >
            <BagIcon className="h-[18px] w-[18px]" />
            <span className="text-[11px] font-semibold tracking-label">
              ({cartCount})
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black md:hidden">
          <div className="flex h-[72px] items-center justify-between px-5">
            <Logo />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="-mr-2 p-2 text-white"
              aria-label="Close menu"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-6 pt-6">
            {mainNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-line py-4 text-[15px] font-semibold uppercase tracking-nav text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/search"
              onClick={() => setMenuOpen(false)}
              className="border-b border-line py-4 text-[15px] font-semibold uppercase tracking-nav text-muted"
            >
              Search
            </Link>
            <Link
              href="/account"
              onClick={() => setMenuOpen(false)}
              className="border-b border-line py-4 text-[15px] font-semibold uppercase tracking-nav text-muted"
            >
              Account
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
