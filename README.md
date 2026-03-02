# 読書会チャットサービス

焚き火を囲んでリアルタイムで本について語り合える匿名チャットサービスです。

## 🔥 機能

- **匿名参加**: 会員登録不要で気軽に参加
- **焚き火UI**: ユーザーが焚き火を囲む楕円配置で表示
- **リアルタイムチャット**: 3秒表示の吹き出し + Discord型ログ
- **2つのルームタイプ**:
  - 自由参加型: カジュアルな雰囲気
  - 課題本型: 議論向け、感想タイム/雑談タイム切り替え
- **自動削除**: 参加者0人で即削除、1.5時間で自動削除
- **パスワード保護**: オプションでルームを鍵付きに

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)でアカウント作成
2. 新しいプロジェクトを作成
3. SQLエディタで以下のスキーマを実行:

```sql
-- supabase-schema.sql の内容をコピーして実行
```

### 3. 環境変数の設定

`.env.local` ファイルを作成し、Supabaseの情報を設定:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## 📦 デプロイ

### Vercelへのデプロイ

1. GitHubリポジトリを作成してコードをプッシュ
2. [Vercel](https://vercel.com)でアカウント作成
3. プロジェクトをインポート
4. 環境変数を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. デプロイ

### 注意事項

- Supabaseの無料枠: 200万Realtimeメッセージ/月
- Vercelの無料枠: 100GB帯域/月
- 自動削除機能により、データベースの容量は最小限に抑えられます

## 🛠 開発

### プロジェクト構成

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # ホーム画面（ルーム一覧・作成）
│   └── room/[id]/page.tsx # ルーム画面
├── components/
│   ├── campfire/          # 焚き火関連コンポーネント
│   ├── chat/             # チャット関連コンポーネント
│   └── room/             # ルーム管理コンポーネント
├── hooks/                 # カスタムフック
├── lib/                   # ユーティリティ・設定
└── types/                 # TypeScript型定義
```

### 主要ファイル

- `src/lib/supabase.ts` - Supabaseクライアント設定
- `src/hooks/useRoom.ts` - ルーム管理フック
- `src/hooks/usePresence.ts` - ユーザー在席管理
- `src/hooks/useChat.ts` - リアルタイムチャット
- `src/components/campfire/CampfireScene.tsx` - メイン焚き火画面

## 🎨 技術スタック

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Realtime**: Supabase Realtime (Broadcast + Presence)
- **Database**: Supabase PostgreSQL
- **Hosting**: Vercel

## 🔒 セキュリティ

- Row Level Security (RLS) 有効化
- パスワードのハッシュ化 (SHA-256)
- 匿名認証（ユーザーデータの永続化なし）

## 📝 ライセンス

MIT License