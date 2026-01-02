import { Loan } from "@/types/loan";
import { getCurrentUser, getUserDataKey } from "./userStorage";

function getStorageKey(): string {
  const currentUser = getCurrentUser();
  if (currentUser) {
    return getUserDataKey(currentUser.id, "loans");
  }
  // ユーザーが設定されていない場合はデフォルトキーを使用（後方互換性）
  return "loans";
}

// 古いデータ形式を新しい形式に変換
function migrateLoan(loan: any): Loan {
  // typeフィールドがない場合はType Aとして扱う
  if (!loan.type) {
    loan.type = "A";
  }
  // principalがない場合はcurrentBalanceと同じ値にする
  if (loan.type === "A" && loan.principal === undefined) {
    loan.principal = loan.currentBalance || 0;
  }
  return loan as Loan;
}

export const getLoans = (): Loan[] => {
  if (typeof window === "undefined") return [];
  
  try {
    const storageKey = getStorageKey();
    const stored = localStorage.getItem(storageKey);
    if (!stored) return [];
    
    const loans = JSON.parse(stored);
    // 古いデータを新しい形式に変換
    return Array.isArray(loans) ? loans.map(migrateLoan) : [];
  } catch (error) {
    console.error("Failed to load loans from localStorage:", error);
    return [];
  }
};

export const saveLoans = (loans: Loan[]): void => {
  if (typeof window === "undefined") return;
  
  try {
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(loans));
  } catch (error) {
    console.error("Failed to save loans to localStorage:", error);
  }
};

export const addLoan = (loan: Loan): void => {
  const loans = getLoans();
  loans.push(loan);
  saveLoans(loans);
};

export const updateLoan = (id: string, updates: Partial<Loan>): void => {
  const loans = getLoans();
  const index = loans.findIndex((loan) => loan.id === id);
  if (index !== -1) {
    loans[index] = { ...loans[index], ...updates };
    saveLoans(loans);
  }
};

export const deleteLoan = (id: string): void => {
  const loans = getLoans();
  const filtered = loans.filter((loan) => loan.id !== id);
  saveLoans(filtered);
};

