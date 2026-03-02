import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// サンプルテーブル。実際のプロジェクトに合わせてこのファイルを編集してください。
// 参考: https://orm.drizzle.team/docs/column-types/pg
export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
