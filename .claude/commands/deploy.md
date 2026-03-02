# Vercel へのデプロイ

## プレビューデプロイ（現在のブランチ）

```bash
vercel
```

## プロダクションデプロイ

```bash
vercel --prod
```

## 環境変数の同期

Vercel の環境変数をローカルに取得:

```bash
vercel env pull .env.local
```

## 初回セットアップ

Vercel CLI でプロジェクトをリンクする:

```bash
vercel link
```

## デプロイ状況の確認

```bash
vercel ls          # デプロイ一覧
vercel inspect     # 最新デプロイの詳細
```

## 注意事項

- 本番デプロイは main ブランチからのみ行うことを推奨
- `DATABASE_URL` などのシークレットは Vercel ダッシュボードで管理
- Neon との連携は Neon Console → Integrations → Vercel から設定
