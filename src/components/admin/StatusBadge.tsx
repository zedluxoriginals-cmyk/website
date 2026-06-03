/*
  Colour-coded status pill, shared across order/payment/message screens.
  Plain wording is handled by the caller — this just maps a tone to colours.
*/
const tones: Record<string, string> = {
  green: "border-emerald-500/40 text-emerald-400",
  amber: "border-amber-500/40 text-amber-400",
  red: "border-red-500/40 text-red-400",
  blue: "border-sky-500/40 text-sky-400",
  grey: "border-line text-muted",
};

export default function StatusBadge({
  label,
  tone = "grey",
}: {
  label: string;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={`inline-block border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-label ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

export function orderTone(status: string): keyof typeof tones {
  switch (status) {
    case "fulfilled":
    case "paid":
      return "green";
    case "processing":
    case "pending_payment":
      return "amber";
    case "cancelled":
    case "refunded":
      return "red";
    default:
      return "grey";
  }
}

export function paymentTone(status: string): keyof typeof tones {
  switch (status) {
    case "paid":
      return "green";
    case "pending":
      return "amber";
    case "failed":
      return "red";
    case "refunded":
      return "blue";
    default:
      return "grey";
  }
}

// Plain-language relabelling of raw enum values.
export function orderLabel(status: string): string {
  const map: Record<string, string> = {
    draft: "Draft",
    pending_payment: "Awaiting payment",
    paid: "Paid",
    processing: "Processing",
    fulfilled: "Fulfilled",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };
  return map[status] ?? status;
}

export function paymentLabel(status: string): string {
  const map: Record<string, string> = {
    not_started: "Not started",
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",
    refunded: "Refunded",
  };
  return map[status] ?? status;
}
