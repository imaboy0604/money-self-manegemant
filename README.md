# 借入金管理アプリ

個人の借入金（奨学金、車ローン、クレカ分割など）を管理し、完済を目指すためのWebアプリケーションです。

## 機能

- **ダッシュボード**: 全体の借入残高合計、月々の返済総額、完済までの推定期間、完済進捗率を表示
- **借入リスト管理**: 借入の登録・編集・削除が可能
- **返済シミュレーション**: 「今月分を返済する」ボタンで返済を記録
- **月単位・年単位のグラフ**: 返済内訳（元本 vs 利息）を可視化
- **ユーザー認証**: Supabaseを使用したログイン・サインアップ機能
- **データ永続化**: Supabaseデータベースに安全に保存

## 技術スタック

- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Icons: Lucide React
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- Charts: Recharts
- Animations: Framer Motion

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. プロジェクトの「Settings」→「API」から以下を取得:
   - Project URL
   - anon/public key
3. **認証設定（重要）**: 
   - 詳細な設定手順は [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) を参照してください
   - メール/パスワード認証とGoogle OAuth認証の設定方法が記載されています

### 3. 環境変数の設定

`.env.local`ファイルを作成し、以下を設定:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. データベーススキーマの作成

Supabaseダッシュボードの「SQL Editor」で、`supabase_schema.sql`の内容を実行してください。

### 5. 開発サーバーの起動

```bash
npm run dev
```

### 6. ブラウザでアクセス

`http://localhost:3000` を開き、ログインページで新規登録またはログインしてください。

## 使い方

1. ログイン/サインアップでアカウントを作成
2. 「新しい借入を追加」ボタンから借入情報を登録
3. テンプレートから選択するか、手動で入力
4. ダッシュボードで全体の状況を確認
5. 各借入カードの「今月分を返済する」ボタンで返済を記録
6. グラフで返済内訳を視覚的に確認

## データの保存

データはSupabaseデータベースに保存され、Row Level Security (RLS)により各ユーザーのデータは完全に分離されています。複数のデバイスから同じアカウントでアクセスしても、データは同期されます。

## セキュリティ

- Row Level Security (RLS) により、ユーザーは自分のデータのみアクセス可能
- すべてのデータ操作は認証済みユーザーのみ実行可能
- パスワードはSupabaseが安全に管理

