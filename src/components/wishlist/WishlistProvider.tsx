"use client";

/*
  Wishlist + recently-viewed, both localStorage-backed (Phase 5). Same
  hydration-safe pattern as the cart: nothing reads localStorage during
  render; stored state loads in an effect, then `hydrated` flips true.

  Stored as arrays of product slugs (the catalogue is the source of truth
  for everything else). Persists to Supabase `wishlists` / `wishlist_items`
  for logged-in users in Phase 8; recently-viewed stays client-only.
*/

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

const WISHLIST_KEY = "zedluxe.wishlist.v1";
const RECENT_KEY = "zedluxe.recentlyViewed.v1";
const RECENT_MAX = 8;

function load(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((s) => typeof s === "string");
    }
  } catch {
    // ignore
  }
  return [];
}

// State + reducer so the mount-time localStorage load is a single dispatch
// (no synchronous setState in an effect — see CartProvider for the same pattern).
type WishlistState = {
  wishlist: string[];
  recentlyViewed: string[];
  hydrated: boolean;
};

type Action =
  | { type: "hydrate"; wishlist: string[]; recentlyViewed: string[] }
  | { type: "toggle"; slug: string }
  | { type: "recordView"; slug: string };

function reducer(state: WishlistState, action: Action): WishlistState {
  switch (action.type) {
    case "hydrate":
      return {
        wishlist: action.wishlist,
        recentlyViewed: action.recentlyViewed,
        hydrated: true,
      };
    case "toggle":
      return {
        ...state,
        wishlist: state.wishlist.includes(action.slug)
          ? state.wishlist.filter((s) => s !== action.slug)
          : [action.slug, ...state.wishlist],
      };
    case "recordView":
      return {
        ...state,
        recentlyViewed: [
          action.slug,
          ...state.recentlyViewed.filter((s) => s !== action.slug),
        ].slice(0, RECENT_MAX),
      };
    default:
      return state;
  }
}

type WishlistContextValue = {
  hydrated: boolean;
  wishlist: string[];
  recentlyViewed: string[];
  isWishlisted: (slug: string) => boolean;
  toggleWishlist: (slug: string) => void;
  recordView: (slug: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    wishlist: [],
    recentlyViewed: [],
    hydrated: false,
  });
  const { wishlist, recentlyViewed, hydrated } = state;

  // Load both stores once, after mount — a single dispatch.
  useEffect(() => {
    dispatch({
      type: "hydrate",
      wishlist: load(WISHLIST_KEY),
      recentlyViewed: load(RECENT_KEY),
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      /* ignore */
    }
  }, [wishlist, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(recentlyViewed));
    } catch {
      /* ignore */
    }
  }, [recentlyViewed, hydrated]);

  const toggleWishlist = useCallback((slug: string) => {
    dispatch({ type: "toggle", slug });
  }, []);

  const recordView = useCallback((slug: string) => {
    dispatch({ type: "recordView", slug });
  }, []);

  const isWishlisted = useCallback(
    (slug: string) => wishlist.includes(slug),
    [wishlist],
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      hydrated,
      wishlist,
      recentlyViewed,
      isWishlisted,
      toggleWishlist,
      recordView,
    }),
    [hydrated, wishlist, recentlyViewed, isWishlisted, toggleWishlist, recordView],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within <WishlistProvider>");
  return ctx;
}
