import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// ⚠️ Neon serverless: pool はリクエストハンドラ内で作成すること。
// グローバルスコープに保持するとコネクションが再利用されずエラーになる。
export function getDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql, { schema });
}
