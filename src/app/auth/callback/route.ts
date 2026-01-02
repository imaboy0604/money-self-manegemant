import { createClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${origin}/`);
    }
  }

  // エラーが発生した場合、ログインページにリダイレクト
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

