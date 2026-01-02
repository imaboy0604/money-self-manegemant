import { supabase } from "./supabaseClient";
import { Loan } from "@/types/loan";

// Supabaseのdebtsテーブルの型定義
interface DebtRow {
  id: string;
  user_id: string;
  title: string;
  type: "A" | "B";
  principal: number;
  current_balance: number;
  interest_rate: number;
  monthly_payment: number;
  created_at: string;
  updated_at: string;
}

// Loan型をDebtRow型に変換
function loanToDebtRow(loan: Loan, userId: string): Omit<DebtRow, "created_at" | "updated_at"> {
  return {
    id: loan.id,
    user_id: userId,
    title: loan.title,
    type: loan.type,
    principal: loan.principal,
    current_balance: loan.currentBalance,
    interest_rate: loan.interestRate,
    monthly_payment: loan.monthlyPayment,
  };
}

// DebtRow型をLoan型に変換
function debtRowToLoan(row: DebtRow): Loan {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    principal: row.principal,
    currentBalance: row.current_balance,
    interestRate: row.interest_rate,
    monthlyPayment: row.monthly_payment,
  };
}

/**
 * 現在のユーザーの借入データを取得
 */
export async function getLoans(): Promise<Loan[]> {
  try {
    // 環境変数のチェック
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase環境変数が設定されていません");
      return [];
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("debts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch loans:", error);
      return [];
    }

    return (data || []).map(debtRowToLoan);
  } catch (error) {
    console.error("Error fetching loans:", error);
    return [];
  }
}

/**
 * 借入データを追加
 */
export async function addLoan(loan: Loan): Promise<boolean> {
  try {
    // 環境変数のチェック
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase環境変数が設定されていません");
      return false;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("ユーザーがログインしていません");
    }

    const debtRow = loanToDebtRow(loan, user.id);
    const { error } = await supabase.from("debts").insert([debtRow]);

    if (error) {
      console.error("Failed to add loan:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error adding loan:", error);
    return false;
  }
}

/**
 * 借入データを更新
 */
export async function updateLoan(id: string, updates: Partial<Loan>): Promise<boolean> {
  try {
    // 環境変数のチェック
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase環境変数が設定されていません");
      return false;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("ユーザーがログインしていません");
    }

    const updateData: Partial<DebtRow> = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.principal !== undefined) updateData.principal = updates.principal;
    if (updates.currentBalance !== undefined)
      updateData.current_balance = updates.currentBalance;
    if (updates.interestRate !== undefined)
      updateData.interest_rate = updates.interestRate;
    if (updates.monthlyPayment !== undefined)
      updateData.monthly_payment = updates.monthlyPayment;

    const { error } = await supabase
      .from("debts")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id); // RLSで保護されているが、念のため

    if (error) {
      console.error("Failed to update loan:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating loan:", error);
    return false;
  }
}

/**
 * 借入データを削除
 */
export async function deleteLoan(id: string): Promise<boolean> {
  try {
    // 環境変数のチェック
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase環境変数が設定されていません");
      return false;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("ユーザーがログインしていません");
    }

    const { error } = await supabase
      .from("debts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // RLSで保護されているが、念のため

    if (error) {
      console.error("Failed to delete loan:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting loan:", error);
    return false;
  }
}

