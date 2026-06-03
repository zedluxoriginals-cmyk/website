// Verifies the hosted DB after migrate + seed: table count, RLS coverage,
// and key row counts. Read-only.
import pg from "pg";

const connectionString = `postgresql://postgres.${process.env.SUPABASE_REF}:${encodeURIComponent(
  process.env.SEED_PW,
)}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`;

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
await client.connect();

const q = async (label, sql) => {
  const { rows } = await client.query(sql);
  console.log(label, JSON.stringify(rows.length === 1 ? rows[0] : rows));
};

await q("public_tables:", `select count(*)::int as n from pg_tables where schemaname='public'`);
await q("rls_enabled_tables:", `select count(*)::int as n from pg_tables where schemaname='public' and rowsecurity=true`);
await q("rls_DISABLED (should be empty):", `select tablename from pg_tables where schemaname='public' and rowsecurity=false order by 1`);
await q("policy_count:", `select count(*)::int as n from pg_policies where schemaname='public'`);
await q("counts:", `select
  (select count(*) from categories)::int as categories,
  (select count(*) from products)::int as products,
  (select count(*) from product_variants)::int as variants,
  (select count(*) from product_images)::int as images,
  (select count(*) from faq_items)::int as faq_items,
  (select count(*) from content_pages)::int as legal_pages,
  (select count(*) from size_guide_rows)::int as size_rows,
  (select count(*) from lookbook_items)::int as lookbook_items,
  (select count(*) from store_settings)::int as store_settings`);
await q("sample_product_price_ngn:", `select title, base_price, currency, badge from products order by base_price desc limit 3`);
await q("order_number_default:", `select pg_get_expr(adbin, adrelid) as def from pg_attrdef d join pg_attribute a on a.attrelid=d.adrelid and a.attnum=d.adnum where a.attname='order_number'`);

await client.end();
console.log("VERIFY_DONE");
