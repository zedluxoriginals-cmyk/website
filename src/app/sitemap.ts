import type { MetadataRoute } from "next";
import { getAllProductSlugs } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";
import { getLegalSlugs } from "@/lib/api/content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [productSlugs, categories, legalSlugs] = await Promise.all([
    getAllProductSlugs(),
    getCategories(),
    getLegalSlugs(),
  ]);

  // Static, indexable routes (cart/account/search are excluded via robots).
  const staticRoutes = [
    "",
    "/shop",
    "/about",
    "/lookbook",
    "/contact",
    "/faq",
    "/size-guide",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const productRoutes = productSlugs.map((slug) => ({
    url: `${siteUrl}/products/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const collectionRoutes = categories.map((c) => ({
    url: `${siteUrl}/collections/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const legalRoutes = legalSlugs.map((slug) => ({
    url: `${siteUrl}/legal/${slug}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  return [...staticRoutes, ...productRoutes, ...collectionRoutes, ...legalRoutes];
}
