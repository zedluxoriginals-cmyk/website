/*
  Money helpers. Mock product prices are authored as display strings
  (e.g. "₦55,000"). The cart needs to do arithmetic on them, so we parse
  to integer minor units (kobo) and format back to a display string.

  Currency is Naira (NGN) — the store's market, settled via Paystack.
  Everything routes through this one file, so a future currency change is
  a single-file edit; nothing else in the app hardcodes "₦".

  Naira note: prices are whole-Naira (no kobo shown), so the formatter
  drops the decimal. We still store kobo internally for exact arithmetic.
*/

export const CURRENCY_SYMBOL = "₦";

/** Parse a display price like "₦55,000" or "55000" into integer kobo. */
export function parsePrice(price: string): number {
  const numeric = price.replace(/[^0-9.]/g, "");
  const value = Number.parseFloat(numeric);
  if (Number.isNaN(value)) return 0;
  return Math.round(value * 100);
}

/** Format integer kobo into a display string like "₦1,234,000". */
export function formatCents(kobo: number): string {
  const amount = (kobo / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${CURRENCY_SYMBOL}${amount}`;
}
