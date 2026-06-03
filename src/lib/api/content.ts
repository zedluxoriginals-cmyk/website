import "server-only";

/*
  Content read layer (Phase 8): FAQ, legal pages, size guides, lookbook, and
  store settings — all from Supabase content tables (public read of
  published/active rows via RLS). Mapped to the existing frontend content
  shapes so the pages render unchanged.
*/

import { createClient } from "@/lib/supabase/server";
import type {
  FaqCategory,
  LegalPage,
  LegalSection,
} from "@/data/content";
import type { SizeChart } from "@/data/sizeGuide";

// ---------- FAQ ----------
export async function getFaqCategories(): Promise<FaqCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faq_categories")
    .select("title, sort_order, faq_items ( question, answer, sort_order, is_published )")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`getFaqCategories: ${error.message}`);

  type Row = {
    title: string;
    faq_items: { question: string; answer: string; sort_order: number; is_published: boolean }[];
  };
  return (data as unknown as Row[]).map((c) => ({
    title: c.title,
    items: c.faq_items
      .filter((i) => i.is_published)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => ({ q: i.question, a: i.answer })),
  }));
}

// ---------- Legal / content pages ----------
// DB stores markdown; the FE template renders heading/body sections, so we
// parse the simple "## Heading\nbody" markdown back into sections.
function markdownToSections(md: string): LegalSection[] {
  const blocks = md.split(/\n##\s+/).map((b) => b.replace(/^##\s+/, "").trim());
  const sections: LegalSection[] = [];
  for (const block of blocks) {
    if (!block) continue;
    const [heading, ...rest] = block.split("\n");
    const body = rest.join("\n").trim();
    sections.push({ heading: heading.trim(), body: body ? [body] : [] });
  }
  return sections;
}

export async function getLegalPage(slug: string): Promise<LegalPage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_pages")
    .select("slug, title, excerpt, body_markdown, updated_at")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(`getLegalPage: ${error.message}`);
  if (!data) return null;

  return {
    slug: data.slug,
    title: data.title,
    updated: new Date(data.updated_at).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    }),
    intro: data.excerpt ?? "",
    sections: markdownToSections(data.body_markdown),
  };
}

export async function getLegalSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_pages")
    .select("slug")
    .eq("page_type", "legal")
    .eq("is_published", true);
  if (error) throw new Error(`getLegalSlugs: ${error.message}`);
  return (data ?? []).map((r) => r.slug);
}

// ---------- Size guides ----------
export async function getSizeCharts(): Promise<SizeChart[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("size_guides")
    .select(`
      slug, category, is_active,
      size_guide_rows ( size_label, chest, length, sleeve, waist, hips, inseam, sort_order )
    `)
    .eq("is_active", true);
  if (error) throw new Error(`getSizeCharts: ${error.message}`);

  type RowCell = string | null;
  type Row = {
    slug: string;
    category: string;
    size_guide_rows: {
      size_label: string;
      chest: RowCell; length: RowCell; sleeve: RowCell;
      waist: RowCell; hips: RowCell; inseam: RowCell;
      sort_order: number;
    }[];
  };

  // Which measurement rows each category shows (mirrors the FE charts).
  const cm = (inch: string) =>
    inch.split("-").map((n) => Math.round(parseFloat(n) * 2.54)).join("-");

  return (data as unknown as Row[]).map((g) => {
    const rows = [...g.size_guide_rows].sort((a, b) => a.sort_order - b.sort_order);
    const columns = rows.map((r) => r.size_label);

    // Determine which measurements are present (non-null) across rows.
    const measures: { key: keyof (typeof rows)[number]; label: string }[] = [
      { key: "chest", label: "Chest" },
      { key: "length", label: "Length" },
      { key: "sleeve", label: "Sleeve" },
      { key: "waist", label: "Waist" },
      { key: "hips", label: "Hips" },
      { key: "inseam", label: "Inseam" },
    ];
    const present = measures.filter((m) => rows.some((r) => r[m.key] != null));

    return {
      category: g.category,
      slug: g.slug,
      columns,
      rows: present.map((m) => {
        const inches = rows.map((r) => (r[m.key] as string | null) ?? "—");
        return { label: m.label, inches, cm: inches.map((v) => (v === "—" ? "—" : cm(v))) };
      }),
    };
  });
}

// ---------- Store settings (singleton) ----------
export type StoreSettings = {
  freeShippingThreshold: number;
  announcementText: string;
  supportEmail: string;
  returnsWindowDays: number;
};

export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("free_shipping_threshold, announcement_text, support_email, returns_window_days")
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getStoreSettings: ${error.message}`);
  return {
    freeShippingThreshold: data?.free_shipping_threshold ?? 150000,
    announcementText:
      data?.announcement_text ??
      "Free Shipping On Orders Over ₦150,000  |  Easy Returns & Exchanges",
    supportEmail: data?.support_email ?? "support@zedluxe.com",
    returnsWindowDays: data?.returns_window_days ?? 14,
  };
}
