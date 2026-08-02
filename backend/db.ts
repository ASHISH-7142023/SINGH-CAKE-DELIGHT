import * as schema from "@shared/schema";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const databaseUrl = process.env.DATABASE_URL;

// Fallback to local default Postgres during development if connection string is missing
const connectionString = databaseUrl || "postgres://postgres:postgres@localhost:5432/singhcakedelight";

const isNeon = connectionString.includes("neon.tech");

export const pool = new pg.Pool({
  connectionString,
  ssl: isNeon || process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });