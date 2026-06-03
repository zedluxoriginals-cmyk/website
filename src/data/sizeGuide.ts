/*
  Size guide data (Batch 3). Garment measurements per category, in inches
  and centimetres. Maps to Supabase `size_guides` + `size_guide_rows` later.
  cm values are derived (inch × 2.54), rounded for display.
*/

export type SizeChart = {
  category: string;
  slug: string;
  columns: string[]; // size labels
  rows: { label: string; inches: string[]; cm: string[] }[];
};

// Helper: convert an inch cell ("38-40" or "28.5") to cm for display.
function toCm(inch: string): string {
  return inch
    .split("-")
    .map((n) => Math.round(parseFloat(n) * 2.54))
    .join("-");
}

function row(label: string, inches: string[]) {
  return { label, inches, cm: inches.map(toCm) };
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export const sizeCharts: SizeChart[] = [
  {
    category: "Tees",
    slug: "tees",
    columns: SIZES,
    rows: [
      row("Chest", ["34-36", "36-38", "38-40", "40-42", "42-44", "44-46"]),
      row("Length", ["26.5", "27.5", "28.5", "29.5", "30.5", "31.5"]),
      row("Sleeve", ["8.0", "8.5", "9.0", "9.5", "10.0", "10.5"]),
    ],
  },
  {
    category: "Hoodies & Sweatshirts",
    slug: "tops",
    columns: SIZES,
    rows: [
      row("Chest", ["34-36", "36-38", "38-40", "40-42", "42-44", "44-46"]),
      row("Length", ["26.5", "27.5", "28.5", "29.5", "30.5", "31.5"]),
      row("Sleeve", ["24.0", "24.5", "25.0", "25.5", "26.0", "26.5"]),
    ],
  },
  {
    category: "Jackets",
    slug: "outerwear",
    columns: SIZES,
    rows: [
      row("Chest", ["34-36", "36-38", "38-40", "40-42", "42-44", "44-46"]),
      row("Length", ["25.5", "26.5", "27.5", "28.5", "29.5", "30.5"]),
      row("Sleeve", ["24.5", "25.0", "25.5", "26.0", "26.5", "27.0"]),
    ],
  },
  {
    category: "Bottoms",
    slug: "bottoms",
    columns: SIZES,
    rows: [
      row("Waist", ["28-30", "30-32", "32-34", "34-36", "36-38", "38-40"]),
      row("Hips", ["34-36", "36-38", "38-40", "40-42", "42-44", "44-46"]),
      row("Inseam", ["30.5", "31.0", "31.5", "32.0", "32.5", "33.0"]),
    ],
  },
  {
    category: "Sets",
    slug: "sets",
    columns: SIZES,
    rows: [
      row("Chest", ["34-36", "36-38", "38-40", "40-42", "42-44", "44-46"]),
      row("Waist", ["28-30", "30-32", "32-34", "34-36", "36-38", "38-40"]),
      row("Hips", ["34-36", "36-38", "38-40", "40-42", "42-44", "44-46"]),
    ],
  },
];

export const howToMeasure: { title: string; body: string }[] = [
  { title: "Chest", body: "Measure across the fullest part of your chest, keeping the tape horizontal." },
  { title: "Length", body: "Measure from the highest point of the shoulder down to the bottom hem." },
  { title: "Sleeve", body: "Measure from the center back neck to the end of the sleeve cuff." },
  { title: "Waist", body: "Measure around your natural waistline, keeping the tape comfortable." },
  { title: "Hips", body: "Measure around the fullest part of your hips and seat." },
  { title: "Inseam", body: "Measure from the top of the inner thigh down to the ankle bone." },
];

export const fitNotes: { title: string; body: string }[] = [
  { title: "Oversized Fit", body: "Tees and hoodies are cut for a relaxed, elevated drape. Size down for a closer fit." },
  { title: "True to Size", body: "Jackets and sets run true to size. Order your usual size for the intended fit." },
  { title: "Between Sizes?", body: "Size up for comfort and layering, or down for a sharper silhouette." },
];
