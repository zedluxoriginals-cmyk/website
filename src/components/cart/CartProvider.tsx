"use client";

/*
  Client-side cart engine (Phase 3). State lives in React context and is
  mirrored to localStorage so it survives reloads. Deliberately knows
  nothing about payments or the server — when the backend lands (Phase 8)
  this provider's actions become thin wrappers over Supabase + the
  checkout Edge Function, and the drawer/badge UI stays unchanged.

  Hydration note (Next 16): we never read localStorage during render.
  The first client render matches the server (empty cart); the stored
  cart is loaded in an effect after mount, then `hydrated` flips true.
*/

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import type { CartLine, Product } from "@/data/types";
import { parsePrice } from "@/lib/money";

const STORAGE_KEY = "zedluxe.cart.v1";

type AddInput = {
  product: Product;
  size: string;
  color: string;
  quantity?: number;
};

// `hydrated` lives in reducer state (not a separate useState) so the
// mount-time localStorage load is a single dispatch — no synchronous
// setState in an effect.
type CartState = { lines: CartLine[]; hydrated: boolean };

type Action =
  | { type: "hydrate"; lines: CartLine[] }
  | { type: "add"; line: CartLine }
  | { type: "setQty"; key: string; quantity: number }
  | { type: "remove"; key: string }
  | { type: "clear" };

function lineKey(productId: string, size: string, color: string) {
  return `${productId}::${size}::${color}`;
}

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "hydrate":
      return { lines: action.lines, hydrated: true };
    case "add": {
      const existing = state.lines.find((l) => l.key === action.line.key);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((l) =>
            l.key === action.line.key
              ? { ...l, quantity: l.quantity + action.line.quantity }
              : l,
          ),
        };
      }
      return { ...state, lines: [...state.lines, action.line] };
    }
    case "setQty": {
      if (action.quantity <= 0) {
        return { ...state, lines: state.lines.filter((l) => l.key !== action.key) };
      }
      return {
        ...state,
        lines: state.lines.map((l) =>
          l.key === action.key ? { ...l, quantity: action.quantity } : l,
        ),
      };
    }
    case "remove":
      return { ...state, lines: state.lines.filter((l) => l.key !== action.key) };
    case "clear":
      return { ...state, lines: [] };
    default:
      return state;
  }
}

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  hydrated: boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (input: AddInput) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [], hydrated: false });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { hydrated } = state;

  // Load persisted cart once, after mount. Always dispatch `hydrate` (even
  // with an empty list) so `hydrated` flips on — a single dispatch, no
  // synchronous setState in the effect body.
  useEffect(() => {
    let lines: CartLine[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) lines = parsed;
      }
    } catch {
      // Corrupt/blocked storage — start with an empty cart.
    }
    dispatch({ type: "hydrate", lines });
  }, []);

  // Persist on every change, but only after the initial load so we don't
  // overwrite stored data with the empty starting state.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
    } catch {
      // Ignore quota/private-mode write failures.
    }
  }, [state.lines, hydrated]);

  const addItem = useCallback((input: AddInput) => {
    const { product, size, color, quantity = 1 } = input;
    const line: CartLine = {
      key: lineKey(product.id, size, color),
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image: product.images[0],
      priceCents: parsePrice(product.price),
      size,
      color,
      quantity,
    };
    dispatch({ type: "add", line });
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    dispatch({ type: "setQty", key, quantity });
  }, []);

  const removeItem = useCallback((key: string) => {
    dispatch({ type: "remove", key });
  }, []);

  const clear = useCallback(() => dispatch({ type: "clear" }), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const count = state.lines.reduce((n, l) => n + l.quantity, 0);
    const subtotalCents = state.lines.reduce(
      (n, l) => n + l.priceCents * l.quantity,
      0,
    );
    return {
      lines: state.lines,
      count,
      subtotalCents,
      hydrated,
      drawerOpen,
      openDrawer,
      closeDrawer,
      addItem,
      setQuantity,
      removeItem,
      clear,
    };
  }, [
    state.lines,
    hydrated,
    drawerOpen,
    openDrawer,
    closeDrawer,
    addItem,
    setQuantity,
    removeItem,
    clear,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
