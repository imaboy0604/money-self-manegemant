"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "./ui/button";
import { LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";

export function Header() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        // 環境変数のチェック
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          setUserEmail(null);
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUserEmail(user?.email || null);
      } catch (error) {
        console.error("Error getting user:", error);
        setUserEmail(null);
      }
    };

    getUser();

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between neumorphic rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5" style={{ color: "var(--text-secondary)" }} />
          <div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              ログイン中
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {userEmail || "読み込み中..."}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout} size="sm">
          <LogOut className="h-4 w-4 mr-2" />
          ログアウト
        </Button>
      </div>
    </header>
  );
}

