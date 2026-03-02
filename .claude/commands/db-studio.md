# DB Studio

Drizzle Studio をブラウザで開き、データベースの内容を GUI で確認・編集します。

```bash
pnpm drizzle-kit studio
```

ブラウザで `https://local.drizzle.studio` が開きます。

## 確認できること

- テーブル一覧とスキーマ
- レコードの閲覧・追加・編集・削除
- SQL クエリの実行

## 注意事項

- `DATABASE_URL` 環境変数が `.env.local` に設定されていることを確認してください
- 本番データベースを直接操作する場合は注意してください
