import { createClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error_code = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');
  const origin = requestUrl.origin;

  // OAuthエラーがURLパラメータにある場合
  if (error_code) {
    console.error('OAuth error:', error_code, error_description);
    const errorMessage = error_description 
      ? encodeURIComponent(error_description)
      : 'auth_failed';
    return NextResponse.redirect(`${origin}/login?error=${errorMessage}`);
  }

  if (code) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Session exchange error:', error);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
      }

      if (data.session) {
        // セッションが確立されたことを確認
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (!user) {
          console.error('User not found after session exchange', userError);
          // 少し待ってから再試行
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: { user: retryUser } } = await supabase.auth.getUser();
          if (!retryUser) {
            return NextResponse.redirect(`${origin}/login?error=user_not_found`);
          }
        }

        console.log('OAuth callback successful, redirecting to home');
        
        // リダイレクト先を作成（キャッシュバスティングパラメータを追加）
        const redirectUrl = new URL('/', origin);
        redirectUrl.searchParams.set('auth', 'success');
        redirectUrl.searchParams.set('t', Date.now().toString()); // タイムスタンプでキャッシュバスティング
        
        // リダイレクトレスポンスを作成（キャッシュヘッダーを設定）
        const response = NextResponse.redirect(redirectUrl);
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('X-Robots-Tag', 'noindex');
        
        return response;
      } else {
        console.error('No session returned from exchangeCodeForSession');
        return NextResponse.redirect(`${origin}/login?error=session_failed`);
      }
    } catch (err) {
      console.error('Unexpected error in callback:', err);
      return NextResponse.redirect(`${origin}/login?error=unexpected_error`);
    }
  }

  // codeパラメータがない場合
  console.error('No code parameter in callback URL');
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}

