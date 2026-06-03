import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SectionHeader from "@/components/SectionHeader";
import ProductGrid from "@/components/ProductGrid";
import CategoryGrid from "@/components/CategoryGrid";
import CampaignBanner from "@/components/CampaignBanner";
import CommunityStrip from "@/components/CommunityStrip";
import Newsletter from "@/components/Newsletter";
import { getAllProducts } from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";

export default async function Home() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories(),
  ]);

  // Latest = newest first (server order). Best = badged/featured first.
  const latestArrivals = products.slice(0, 6);
  const bestSellers = [...products]
    .sort((a, b) => Number(Boolean(b.badge)) - Number(Boolean(a.badge)))
    .slice(0, 6);

  return (
    <main>
      {/* Header overlays the hero; relative wrapper anchors its absolute position */}
      <div className="relative">
        <Header />
        <Hero />
      </div>

      <section className="container-zed pt-11 pb-12">
        <SectionHeader title="Latest Arrivals" viewAllHref="/shop?sort=new" />
        <ProductGrid products={latestArrivals} />
      </section>

      <section className="container-zed pt-6 pb-11">
        <SectionHeader title="Shop By Category" />
        <CategoryGrid categories={categories} />
      </section>

      <section className="container-zed pt-8 pb-12">
        <CampaignBanner />
      </section>

      <section className="container-zed pt-8 pb-9">
        <SectionHeader title="Best Sellers" viewAllHref="/shop?sort=best" />
        <ProductGrid products={bestSellers} />
      </section>

      <CommunityStrip />

      <Newsletter />
    </main>
  );
}
