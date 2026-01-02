# 認証システム設定ガイド

このガイドでは、Supabaseを使用した認証システム（メール/パスワード認証 + Google OAuth）の設定手順を説明します。

## 1. Supabaseダッシュボードでの設定

### 1-1. メール確認の設定（オプション）

メール確認を無効にすると、新規登録時にすぐにログインできます。

1. Supabaseダッシュボードにログイン
2. プロジェクトを選択
3. 「Authentication」→「Providers」に移動
4. 「Email」プロバイダーを開く
5. 「Confirm email」のチェックを**外す**（メール確認を無効化）
6. 設定を保存

**注意**: メール確認を無効にすると、セキュリティが低下する可能性があります。開発環境では無効にしても問題ありませんが、本番環境では有効にすることを推奨します。

### 1-2. URL Configuration（重要）

1. 「Authentication」→「URL Configuration」に移動
2. **Site URL**: 本番環境のURLを設定
   - 例: `https://your-app.vercel.app`
3. **Redirect URLs**: 以下を追加（改行区切りで複数追加可能）
   ```
   https://your-app.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```
4. 設定を保存

### 1-3. Google OAuthの設定

#### Google Cloud Consoleでの設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. 「APIとサービス」→「認証情報」に移動
4. 「認証情報を作成」→「OAuth 2.0 クライアント ID」を選択
5. アプリケーションの種類: 「ウェブアプリケーション」を選択
6. 名前: 任意の名前（例: "Money Management App"）
7. **承認済みのJavaScript生成元**: 以下を追加
   ```
   http://localhost:3000
   https://your-app.vercel.app
   ```
8. **承認済みのリダイレクトURI**: 以下を追加
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
   - `your-project-ref`は、Supabaseダッシュボードの「Settings」→「API」→「Project URL」から確認できます
   - 例: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`
9. 「作成」をクリック
10. **クライアントID**と**クライアントシークレット**をコピー（後で使用します）

#### Supabaseダッシュボードでの設定

1. Supabaseダッシュボードに戻る
2. 「Authentication」→「Providers」に移動
3. 「Google」プロバイダーを開く
4. 「Enable Google provider」をオンにする
5. **Client ID (for OAuth)**: Google Cloud Consoleで取得したクライアントIDを貼り付け
6. **Client Secret (for OAuth)**: Google Cloud Consoleで取得したクライアントシークレットを貼り付け
7. 設定を保存

## 2. 環境変数の設定

### 2-1. ローカル環境（.env.local）

`.env.local`ファイルに以下を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2-2. Vercel環境変数

1. Vercelダッシュボードにログイン
2. プロジェクトを選択
3. 「Settings」→「Environment Variables」に移動
4. 以下を追加：
   - `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseプロジェクトのanon key
5. 環境を選択（Production, Preview, Development）
6. 「Save」をクリック
7. デプロイを再実行

## 3. 動作確認

### 3-1. メール/パスワード認証

1. アプリケーションにアクセス
2. 「新規登録」をクリック
3. メールアドレスとパスワードを入力
4. 「新規登録」をクリック
   - メール確認が無効な場合: すぐにログインされます
   - メール確認が有効な場合: 確認メールが送信されます
5. 確認メールのリンクをクリック（メール確認が有効な場合）
6. ログインページにリダイレクトされ、自動的にログインされます

### 3-2. Google OAuth認証

1. アプリケーションにアクセス
2. 「Googleでログイン」ボタンをクリック
3. Googleアカウントを選択
4. アクセス許可を確認
5. 自動的にログインされます

## 4. トラブルシューティング

### ログイン後にログイン画面に戻される

**原因**: セッションが正しく確立されていない

**解決方法**:
1. ブラウザの開発者ツール（F12）を開く
2. 「Application」タブ→「Cookies」を確認
3. `sb-`で始まるCookieが存在するか確認
4. Cookieが存在しない場合、SupabaseのURL Configurationを確認

### Googleログインが動作しない

**原因**: リダイレクトURIが正しく設定されていない

**解決方法**:
1. Google Cloud Consoleで、承認済みのリダイレクトURIが正しく設定されているか確認
   - `https://your-project-ref.supabase.co/auth/v1/callback`
2. Supabaseダッシュボードで、Googleプロバイダーの設定を確認
3. クライアントIDとクライアントシークレットが正しく入力されているか確認

### メール確認リンクがlocalhostにリダイレクトする

**原因**: SupabaseのURL Configurationが正しく設定されていない

**解決方法**:
1. Supabaseダッシュボード→「Authentication」→「URL Configuration」
2. Site URLを本番環境のURLに設定
3. Redirect URLsに`https://your-app.vercel.app/auth/callback`を追加

## 5. セキュリティのベストプラクティス

- 本番環境ではメール確認を有効にすることを推奨
- パスワードは強力なもの（8文字以上、英数字・記号を含む）を推奨
- OAuth認証情報は環境変数として安全に管理
- 定期的に認証ログを確認

