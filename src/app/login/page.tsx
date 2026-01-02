"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // URLパラメータからエラーを取得（クライアントサイドで取得）
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get('error');
      if (errorParam) {
        // エラーメッセージをデコード
        const decodedError = decodeURIComponent(errorParam);
        let errorMessage = '認証に失敗しました。もう一度お試しください。';
        
        // エラーの種類に応じてメッセージを変更
        if (decodedError.includes('access_denied')) {
          errorMessage = 'Googleログインが拒否されました。';
        } else if (decodedError.includes('session_failed')) {
          errorMessage = 'セッションの確立に失敗しました。もう一度お試しください。';
        } else if (decodedError.includes('no_code')) {
          errorMessage = '認証コードが取得できませんでした。もう一度お試しください。';
        } else if (decodedError !== 'auth_failed') {
          errorMessage = decodedError;
        }
        
        setError(errorMessage);
        // URLからエラーパラメータを削除
        window.history.replaceState({}, '', '/login');
      }
    }

    // 既にログインしている場合はリダイレクト
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (session && !sessionError) {
        router.replace("/");
      }
    });

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // 入力値の検証
    if (!email.trim()) {
      setError("メールアドレスを入力してください。");
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError("パスワードを入力してください。");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください。");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // サインアップ
        const redirectTo = `${window.location.origin}/auth/callback`;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            emailRedirectTo: redirectTo,
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.user) {
          if (data.session) {
            // セッションが存在する場合はすぐにログイン
            setIsTransitioning(true);
            setTimeout(() => {
              window.location.href = "/";
            }, 400);
          } else {
            // メール確認が必要な場合
            setSuccess("確認メールを送信しました。メールボックスを確認してください。");
            setEmail("");
            setPassword("");
          }
        } else {
          setError("サインアップに失敗しました。もう一度お試しください。");
        }
      } else {
        // ログイン
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (signInError) {
          if (signInError.message.includes('email not confirmed') || signInError.message.includes('Email not confirmed')) {
            throw new Error('メールアドレスの確認が完了していません。確認メールを確認してください。');
          }
          throw signInError;
        }

        if (data.user && data.session) {
          setIsTransitioning(true);
          setTimeout(() => {
            window.location.href = "/";
          }, 400);
        } else {
          setError("ログインに失敗しました。メールアドレスとパスワードを確認してください。");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setError(error?.message || "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const redirectTo = `${window.location.origin}/auth/callback`;
      
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
        },
      });

      if (oauthError) {
        throw oauthError;
      }
    } catch (error: any) {
      console.error("Google OAuth error:", error);
      setError(error?.message || "Googleログインに失敗しました");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key="login-page"
        initial={{ opacity: 1, scale: 1 }}
        animate={
          isTransitioning
            ? {
                opacity: 0,
                scale: 0.95,
                y: -30,
              }
            : {
                opacity: 1,
                scale: 1,
                y: 0,
              }
        }
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: "var(--background)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{
            opacity: isTransitioning ? 0 : 1,
            y: isTransitioning ? -30 : 0,
            scale: isTransitioning ? 0.8 : 1,
            rotate: isTransitioning ? -2 : 0,
          }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="w-full max-w-md px-4"
        >
          <Card className="neumorphic">
            <CardHeader>
              <CardTitle className="text-2xl text-center" style={{ color: "var(--text-primary)" }}>
                {isSignUp ? "新規登録" : "ログイン"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Googleログインボタン */}
              <Button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full mb-4"
                variant="outline"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Googleで{isSignUp ? "新規登録" : "ログイン"}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: "var(--text-secondary)" }}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span style={{ color: "var(--text-secondary)", backgroundColor: "var(--background)" }} className="px-2">
                    または
                  </span>
                </div>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {error && (
                  <div
                    className="p-3 rounded-lg text-sm whitespace-pre-line"
                    style={{
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      color: "#ef4444",
                    }}
                  >
                    {error}
                  </div>
                )}
                {success && (
                  <div
                    className="p-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: "rgba(34, 197, 94, 0.1)",
                      color: "#22c55e",
                    }}
                  >
                    {success}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">パスワード *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    minLength={6}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                  />
                  {isSignUp && (
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      パスワードは6文字以上で入力してください
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "処理中..." : isSignUp ? "新規登録" : "ログイン"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-sm underline"
                    style={{ color: "var(--text-secondary)" }}
                    disabled={loading}
                  >
                    {isSignUp
                      ? "既にアカウントをお持ちの方はこちら"
                      : "新規登録はこちら"}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.main>
    </AnimatePresence>
  );
}
