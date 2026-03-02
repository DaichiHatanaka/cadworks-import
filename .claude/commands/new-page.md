# 新しいページの作成

`$ARGUMENTS` にページのパス（例: `dashboard`, `posts/[id]`）を指定してください。

## 作成するファイル

以下のファイルを作成してください:

### `src/app/$ARGUMENTS/page.tsx`

```typescript
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ページタイトル",
};

export default function Page() {
  return (
    <main>
      <h1>ページタイトル</h1>
    </main>
  );
}
```

### DB アクセスが必要な場合

```typescript
import { getDb } from "@/db";
import { posts } from "@/db/schema";

export default async function Page() {
  const db = getDb();
  const data = await db.select().from(posts);

  return (
    <main>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
```

## 規約

- Server Component をデフォルトとする
- クライアントインタラクションが必要な部分のみ `_components/` に切り出して `"use client"` を付与
- メタデータは `export const metadata` で定義
