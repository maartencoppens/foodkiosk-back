import 'dotenv/config';
import postgres, { Sql } from "postgres";

if (!process.env.POSTGRES_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = postgres(process.env.POSTGRES_URL, {
  ssl: "require", // nodig voor Supabase
});

export default sql;
