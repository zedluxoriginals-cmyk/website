// One-off seed runner: applies supabase/seed.sql to the linked hosted DB.
// Reads the pooler connection from env. Run from web/ so `pg` resolves.
import { readFileSync } from "node:fs";
import pg from "pg";

const password = process.env.SEED_PW;
const ref = process.env.SUPABASE_REF;
if (!password || !ref) {
  console.error("Missing SEED_PW or SUPABASE_REF env");
  process.exit(1);
}

const connectionString = `postgresql://postgres.${ref}:${encodeURIComponent(
  password,
)}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`;

const sql = readFileSync(process.env.SEED_FILE, "utf8");

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(sql); // seed.sql is wrapped in begin/commit
  console.log("SEED_OK");
} catch (err) {
  console.error("SEED_FAIL:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
