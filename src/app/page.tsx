"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loan } from "@/types/loan";
import { Dashboard } from "@/components/Dashboard";
import { LoanList } from "@/components/LoanList";
import { Header } from "@/components/Header";
import { useDarkMode } from "@/hooks/useDarkMode";
import { supabase } from "@/lib/supabaseClient";
import {
  getLoans,
  addLoan,
  updateLoan,
  deleteLoan,
} from "@/lib/supabaseStorage";

export default function Home() {
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  useDarkMode(); // ダークモードの自動切り替え

  // 認証状態を確認し、データを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 環境変数のチェック
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          console.warn("Supabase環境変数が設定されていません");
          setLoading(false);
          return;
        }

        // セッションとユーザーの両方を確認（より確実に）
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!user && !session) {
          router.push("/login");
          return;
        }

        // エラーがある場合はログに記録
        if (userError || sessionError) {
          console.warn("Auth check errors:", { userError, sessionError });
        }

        // データを取得
        const data = await getLoans();
        setLoans(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        router.push("/login");
      } else {
        const data = await getLoans();
        setLoans(data);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleAdd = async (loan: Loan) => {
    const success = await addLoan(loan);
    if (success) {
      const data = await getLoans();
      setLoans(data);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Loan>) => {
    const success = await updateLoan(id, updates);
    if (success) {
      const data = await getLoans();
      setLoans(data);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteLoan(id);
    if (success) {
      const data = await getLoans();
      setLoans(data);
    }
  };

  const handlePay = async (id: string) => {
    const loan = loans.find((l) => l.id === id);
    if (loan && loan.currentBalance > 0) {
      // 単純計算モデル: 月々の利息を計算
      const monthlyRate = loan.interestRate / 100 / 12;
      const monthlyInterest = loan.currentBalance * monthlyRate;
      const principalPayment = loan.monthlyPayment - monthlyInterest;
      const newBalance = Math.max(0, loan.currentBalance - principalPayment);
      const success = await updateLoan(id, { currentBalance: newBalance });
      if (success) {
        const data = await getLoans();
        setLoans(data);
      }
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div style={{ color: "var(--text-secondary)" }}>読み込み中...</div>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Header />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Dashboard loans={loans} />
        </motion.div>
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <LoanList
            loans={loans}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onPay={handlePay}
          />
        </motion.div>
      </div>
    </main>
  );
}

