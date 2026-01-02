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
    // 環境変数のチェック
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setError(
        "⚠️ Supabase環境変数が設定されていません。\n" +
        ".env.localファイルにNEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_ANON_KEYを設定してください。"
      );
    } else {
      // URLパラメータからcodeを取得（メール確認後のリダイレクト）
      const handleAuthCallback = async () => {
        // ハッシュフラグメントからパラメータを取得
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        // クエリパラメータからも取得（フォールバック）
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');

        // メール確認後のリダイレクト（type=signup または type=email）
        if (accessToken && refreshToken && (type === 'signup' || type === 'email' || type === 'recovery')) {
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error('Session error:', error);
              setError('認証に失敗しました。もう一度お試しください。');
            } else if (data.session) {
              // セッションが確立されたらメインページにリダイレクト
              // URLからハッシュフラグメントを削除
              window.history.replaceState({}, '', '/login');
              window.location.href = "/";
            }
          } catch (err) {
            console.error('Auth callback error:', err);
          }
        } else if (code) {
          // codeパラメータがある場合（PKCE flow）
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              console.error('Code exchange error:', error);
              setError('認証に失敗しました。もう一度お試しください。');
            } else if (data.session) {
              window.history.replaceState({}, '', '/login');
              window.location.href = "/";
            }
          } catch (err) {
            console.error('Code exchange error:', err);
          }
        }
      };

      handleAuthCallback();

      // 既にログインしている場合はリダイレクト
      supabase.auth.getUser().then(({ data: { user }, error: userError }) => {
        if (userError) {
          console.error("Error getting user:", userError);
        } else if (user) {
          router.push("/");
        }
      });
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    console.log("Starting auth process...", { isSignUp, email: email.trim() });

    try {
      if (isSignUp) {
        // サインアップ
        console.log("Attempting sign up...");
        
        // リダイレクトURLを設定（本番環境または開発環境に応じて）
        const redirectTo = typeof window !== 'undefined' 
          ? `${window.location.origin}/login`
          : 'https://your-vercel-app.vercel.app/login';
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            emailRedirectTo: redirectTo,
          },
        });

        console.log("Sign up response:", { data, error: signUpError });

        if (signUpError) {
          console.error("Sign up error:", signUpError);
          throw signUpError;
        }

        if (data.user) {
          // セッションが存在する場合はすぐにログイン
          if (data.session) {
            console.log("Sign up successful, session exists, redirecting...");
            setIsTransitioning(true);
            setTimeout(() => {
              window.location.href = "/";
            }, 400);
          } else {
            // セッションが存在しない場合（メール確認が有効な場合）
            // 注意: Supabaseダッシュボードでメール確認を無効にすることで、
            // 新規登録時に自動的にログインできるようになります
            console.log("Sign up successful, email confirmation may be required");
            setSuccess(
              "アカウントが作成されました。\n" +
              "メール確認が有効な場合は、確認メールを確認してください。\n" +
              "メール確認を無効にしたい場合は、Supabaseダッシュボードの設定を変更してください。"
            );
            setEmail("");
            setPassword("");
          }
        } else {
          console.error("Sign up failed: no user returned");
          setError("サインアップに失敗しました。もう一度お試しください。");
        }
      } else {
        // ログイン
        console.log("Attempting sign in...");
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        console.log("Sign in response:", { data, error: signInError });

        if (signInError) {
          console.error("Sign in error:", signInError);
          // メール確認が必要な場合のエラーメッセージ
          if (signInError.message.includes('email not confirmed') || signInError.message.includes('Email not confirmed')) {
            throw new Error('メールアドレスの確認が完了していません。確認メールを確認してください。');
          }
          throw signInError;
        }

        if (data.user && data.session) {
          console.log("Sign in successful, redirecting...");
          setIsTransitioning(true);
          setTimeout(() => {
            window.location.href = "/";
          }, 400);
        } else {
          console.error("Sign in failed: no user or session returned");
          setError("ログインに失敗しました。メールアドレスとパスワードを確認してください。");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      const errorMessage = error?.message || "エラーが発生しました";
      setError(errorMessage);
    } finally {
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
