import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "[db] DATABASE_URL is not set. Database features will be unavailable until it is configured.",
  );
}

export const pool = new Pool({
  connectionString: connectionString || "postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder",
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000,
  max: 10,
});

pool.on("error", (err) => {
  console.error("[db] Pool error (suppressed to keep server alive):", err.message);
});

export const db = drizzle(pool, { schema });

export function isDatabaseUnavailableError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const message = String((err as { message?: unknown }).message ?? "").toLowerCase();
  return (
    message.includes("endpoint has been disabled") ||
    message.includes("frozen") ||
    message.includes("econnrefused") ||
    message.includes("etimedout") ||
    message.includes("connection terminated") ||
    message.includes("could not connect")
  );
}
