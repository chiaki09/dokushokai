# 読書会チャットサービス セットアップガイド

このガイドに従って、読書会チャットサービスを立ち上げることができます。

## 📋 必要なもの

- Node.js 18+ がインストール済み
- Supabaseアカウント（無料）
- Vercelアカウント（デプロイ用、無料）

## 🚀 完全セットアップガイド

### ステップ1: プロジェクトのクローンと依存関係インストール

```bash
# プロジェクトディレクトリに移動
cd dokushokai

# 依存関係をインストール
npm install
```

### ステップ2: Supabaseプロジェクト作成

1. [Supabase](https://supabase.com) にアクセスしてアカウント作成
2. 「New Project」をクリック
3. プロジェクト名を設定（例：dokushokai）
4. データベースパスワードを設定（強力なパスワードを推奨）
5. リージョンを選択（日本の場合は「Northeast Asia (Tokyo)」推奨）
6. 「Create new project」をクリック（数分待機）

### ステップ3: データベーススキーマの設定

1. Supabaseプロジェクトダッシュボードで「SQL Editor」をクリック
2. 「New query」をクリック
3. `supabase-schema.sql` の内容をコピーして貼り付け
4. 「Run」をクリックして実行

```sql
-- このファイルの supabase-schema.sql の内容をコピー
```

### ステップ4: Realtime機能の有効化

1. Supabaseダッシュボードで「Database」→「Replication」をクリック
2. 「supabase_realtime」パブリケーションが存在することを確認
3. 「Tables」タブで `rooms` テーブルの「Real-time」を有効化

### ステップ5: 環境変数の設定

1. Supabaseダッシュボードで「Settings」→「API」をクリック
2. 以下の値をコピー:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. `.env.local` ファイルを編集:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### ステップ6: ローカル開発サーバーで動作確認

```bash
npm run dev
```

http://localhost:3001 にアクセスして動作確認:

1. ユーザー名を入力
2. 「新しいルームを作成」をクリック
3. ルーム作成フォームが表示されることを確認
4. ルームを作成してチャット画面に遷移することを確認

## 🌐 本番デプロイ（Vercel）

### ステップ1: GitHubリポジトリ作成

```bash
# Git初期化（まだの場合）
git init
git add .
git commit -m "Initial commit"

# GitHubでリポジトリを作成し、リモートを追加
git remote add origin https://github.com/your-username/dokushokai.git
git push -u origin main
```

### ステップ2: Vercelデプロイ

1. [Vercel](https://vercel.com) でアカウント作成
2. 「New Project」をクリック
3. GitHubリポジトリを選択
4. 「Environment Variables」で以下を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabaseプロジェクト URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
5. 「Deploy」をクリック

### ステップ3: デプロイ完了確認

- Vercelから提供されるURLにアクセス
- 機能が正常に動作することを確認

## 🛠 メンテナンス

### 自動削除機能の監視

定期的に以下のエンドポイントを呼び出して、期限切れルームを削除:

```bash
curl -X POST https://your-app.vercel.app/api/cleanup
```

### ヘルスチェック

サービスの状態確認:

```bash
curl https://your-app.vercel.app/api/health
```

## 🔧 トラブルシューティング

### よくある問題

1. **「Database connection failed」エラー**
   - 環境変数が正しく設定されているか確認
   - SupabaseのAPIキーが正しいか確認

2. **リアルタイムチャットが動作しない**
   - Supabaseで Realtime が有効になっているか確認
   - `rooms` テーブルで Real-time が有効になっているか確認

3. **ルーム作成ができない**
   - Row Level Security (RLS) ポリシーが正しく設定されているか確認
   - `supabase-schema.sql` が正しく実行されているか確認

### ログの確認方法

```bash
# ローカル開発時
npm run dev
# コンソールログを確認

# Vercel本番環境
# Vercel Dashboard の「Functions」タブでログを確認
```

## 📊 使用量の監視

### Supabase無料枠の制限

- データベース容量: 500MB
- Realtime接続: 同時200接続
- Realtimeメッセージ: 200万メッセージ/月
- 帯域: 5GB/月

### Vercel無料枠の制限

- 帯域: 100GB/月
- 関数実行時間: 10秒
- ビルド時間: 6000分/月

自動削除機能により、データベース使用量は最小限に抑えられています。

## 🎯 運用開始

セットアップが完了したら:

1. ユーザーにサービスURLを共有
2. 利用方法を説明（README.mdを参照）
3. フィードバックを収集して改善

セットアップで問題が発生した場合は、各サービスのドキュメントを参照するか、GitHubのIssuesで報告してください。