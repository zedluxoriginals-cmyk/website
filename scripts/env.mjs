import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;

    for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#") || !line.includes("=")) continue;

      const [key, ...valueParts] = line.split("=");
      if (process.env[key]) continue;

      const value = valueParts
        .join("=")
        .trim()
        .replace(/^['"]|['"]$/g, "");
      process.env[key] = value;
    }
  }
}

export function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.startsWith("<")) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}
