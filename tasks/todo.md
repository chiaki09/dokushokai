# モバイル対応 + ルーム自動削除強化

## モバイル対応
- [x] viewport meta追加 (`src/app/layout.tsx`)
- [x] RoomHeader レスポンシブ化 - flex-wrap, 小型ボタン, スタック表示
- [x] CampfireScene + campfire.ts - 動的半径縮小、アバター縮小
- [x] UserAvatar - `w-10 h-10 sm:w-14 sm:h-14`、名前 `text-xs sm:text-sm`
- [x] ChatSystem - タイムスタンプ常時表示(薄)、アバター縮小、入力エリア調整
- [x] Room画面 - 分割比率 `flex-[40]/flex-[60]` → `sm:flex-[55]/sm:flex-[45]`
- [x] ホーム画面 - パディング・タイトルサイズ調整

## ルーム自動削除強化
- [x] sendBeacon を `isAlone` チェックなしで常に送信
- [x] room-cleanup API に2秒遅延追加
- [x] cleanup API に GET ハンドラ追加 (cron対応)

## レビュー
- TypeScript型チェック: パス
- 全変更は `sm:` ブレークポイントでデスクトップ表示を維持
- sendBeaconの常時送信により、2人同時退出時もルーム削除が実行される

---

# セキュリティ脆弱性修正

## Step 1: APIルートのセキュリティ強化
- [x] `/api/cleanup` に `CRON_SECRET` 環境変数によるBearer認証を追加
- [x] `/api/room-cleanup` に Origin/Referer ヘッダー検証を追加
- [x] `roomId` に UUIDv4 正規表現バリデーションを追加
- [x] エラーレスポンスから内部エラー詳細を除去

## Step 2: セキュリティヘッダーの追加
- [x] `next.config.mjs` に X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-DNS-Prefetch-Control を追加

## Step 3: パスワードハッシュの強化
- [x] SHA-256 → PBKDF2 (100,000 iterations) + ランダムソルト(16bytes) に変更
- [x] 保存形式: `salt:hash` (hex)
- [x] レガシーSHA-256形式への後方互換フォールバックあり

## Step 4: console.logの整理
- [x] `supabase.ts` のURL/Key情報ログを `NODE_ENV === 'development'` でのみ出力
- [x] `room-utils.ts` のルーム作成データログを開発環境のみに制限
- [x] エラーログの `JSON.stringify(error)` をメッセージのみに変更

## Step 5: RLS/GRANT改善ドキュメント
- [x] `supabase-schema.sql` に改善版RLSポリシーとGRANT制限をコメントで記載
- [x] UPDATE → `expires_at > NOW()` 条件の推奨
- [x] DELETE → `expires_at < NOW()` 条件の推奨
- [x] anon権限を `SELECT, INSERT` のみに制限する推奨

## Step 6: レート制限の追加
- [x] `src/lib/rate-limit.ts` にインメモリレート制限ユーティリティを新規作成
- [x] `/api/cleanup` に 5req/min、`/api/room-cleanup` に 10req/min を適用
- [x] 期限切れエントリの自動クリーンアップ機能付き

## レビュー
- `npm run build`: 成功（エラーなし）
- 全APIルートにレート制限と入力バリデーションを適用済み
- パスワードハッシュはレガシー互換を維持（既存ルームも検証可能）
- セキュリティヘッダーは全ルートに適用
