# DB マイグレーション

`src/db/schema.ts` の変更をデータベースに反映します。

## 手順

まずマイグレーションファイルを生成します:

```bash
pnpm drizzle-kit generate
```

次に `migrations/` ディレクトリに生成されたファイルを確認してから、マイグレーションを実行します:

```bash
pnpm drizzle-kit migrate
```

## 注意事項

- `DATABASE_URL` 環境変数が `.env.local` に設定されていることを確認してください
- 本番環境のマイグレーションは Vercel のデプロイフックで実行することを推奨します
- ロールバックが必要な場合は `migrations/` ディレクトリのファイルを確認してください
