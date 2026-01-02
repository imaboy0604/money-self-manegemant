import { Loan } from "@/types/loan";

/**
 * 月々の利息を計算（単純計算モデル）
 * 現在の残高 × 年利 ÷ 12
 */
export function calculateMonthlyInterest(loan: Loan): number {
  if (loan.interestRate <= 0 || loan.currentBalance <= 0) {
    return 0;
  }
  return (loan.currentBalance * loan.interestRate) / 100 / 12;
}

/**
 * 完済までに支払う利息の総額を計算（単純計算モデル）
 */
export function calculateTotalInterest(loan: Loan): number {
  if (loan.interestRate <= 0 || loan.currentBalance <= 0) {
    return 0;
  }

  const monthlyRate = loan.interestRate / 100 / 12;
  const monthsToPayoff = calculateMonthsToPayoff(loan);

  if (monthsToPayoff <= 0 || !isFinite(monthsToPayoff)) {
    return 0;
  }

  // 単純計算: 各月の残高に月利をかけて合計
  let totalInterest = 0;
  let balance = loan.currentBalance;

  for (let month = 0; month < monthsToPayoff && balance > 0; month++) {
    const monthlyInterest = balance * monthlyRate;
    totalInterest += monthlyInterest;
    const principalPayment = loan.monthlyPayment - monthlyInterest;
    balance = Math.max(0, balance - principalPayment);
  }

  return totalInterest;
}

/**
 * 完済までの月数を計算（単純計算モデル）
 */
export function calculateMonthsToPayoff(loan: Loan): number {
  if (loan.monthlyPayment <= 0 || loan.currentBalance <= 0) {
    return 0;
  }

  if (loan.interestRate <= 0) {
    // 無利息の場合
    return Math.ceil(loan.currentBalance / loan.monthlyPayment);
  }

  const monthlyRate = loan.interestRate / 100 / 12;
  
  // 月々の返済額が利息を下回る場合は完済不可能
  const firstMonthInterest = loan.currentBalance * monthlyRate;
  if (loan.monthlyPayment <= firstMonthInterest) {
    return Infinity; // 完済不可能
  }

  // 単純計算: 毎月の元本返済額で割る
  let balance = loan.currentBalance;
  let months = 0;
  const maxMonths = 600; // 50年を上限とする

  while (balance > 0.01 && months < maxMonths) {
    const monthlyInterest = balance * monthlyRate;
    const principalPayment = loan.monthlyPayment - monthlyInterest;
    
    if (principalPayment <= 0) {
      return Infinity; // 完済不可能
    }
    
    balance = Math.max(0, balance - principalPayment);
    months++;
  }

  return months;
}

/**
 * 完済予定日を計算
 */
export function calculatePayoffDate(loan: Loan): Date | null {
  const months = calculateMonthsToPayoff(loan);
  if (!isFinite(months)) {
    return null; // 完済不可能
  }
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
}

/**
 * 積み上げ面グラフ用のデータを生成
 * 元本と利息を分けて表示
 */
export function generateStackedAreaData(loans: Loan[]): Array<{
  date: string;
  principal: number;
  interest: number;
  total: number;
}> {
  const data: Array<{
    date: string;
    principal: number;
    interest: number;
    total: number;
  }> = [];
  const today = new Date();
  
  // 最大の完済月数を取得（完済不可能なものは除外）
  const monthsArray = loans
    .map((loan) => calculateMonthsToPayoff(loan))
    .filter((months) => isFinite(months));
  const maxMonths = monthsArray.length > 0 ? Math.max(...monthsArray, 0) : 0;

  // 各月の返済内訳を計算
  for (let month = 0; month <= maxMonths; month++) {
    const date = new Date(today);
    date.setMonth(date.getMonth() + month);
    
    let totalPrincipal = 0;
    let totalInterest = 0;
    
    loans.forEach((loan) => {
      if (loan.currentBalance <= 0) {
        return;
      }

      const monthsToPayoff = calculateMonthsToPayoff(loan);
      if (month >= monthsToPayoff || !isFinite(monthsToPayoff)) {
        return;
      }

      // 各借入の当月の返済内訳を計算
      const monthlyRate = loan.interestRate / 100 / 12;
      let balance = loan.currentBalance;

      // 過去の月の返済を計算して現在の残高を求める
      for (let m = 0; m < month && balance > 0; m++) {
        const monthlyInterest = balance * monthlyRate;
        const principalPayment = loan.monthlyPayment - monthlyInterest;
        balance = Math.max(0, balance - principalPayment);
      }

      if (balance > 0) {
        const monthlyInterest = balance * monthlyRate;
        const principalPayment = Math.min(
          loan.monthlyPayment - monthlyInterest,
          balance
        );
        
        totalPrincipal += principalPayment;
        totalInterest += monthlyInterest;
      }
    });

    data.push({
      date: date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
      }),
      principal: totalPrincipal,
      interest: totalInterest,
      total: totalPrincipal + totalInterest,
    });
  }

  return data;
}

/**
 * 残高の推移データを生成（グラフ用）- 後方互換性のため残す
 */
export function generateBalanceProjection(loans: Loan[]): Array<{
  date: string;
  balance: number;
}> {
  const data: Array<{ date: string; balance: number }> = [];
  const today = new Date();
  
  const monthsArray = loans
    .map((loan) => calculateMonthsToPayoff(loan))
    .filter((months) => isFinite(months));
  const maxMonths = monthsArray.length > 0 ? Math.max(...monthsArray, 0) : 0;

  for (let month = 0; month <= maxMonths; month++) {
    const date = new Date(today);
    date.setMonth(date.getMonth() + month);
    
    let totalBalance = 0;
    
    loans.forEach((loan) => {
      if (loan.currentBalance <= 0) {
        return;
      }

      const monthsToPayoff = calculateMonthsToPayoff(loan);
      if (month >= monthsToPayoff || !isFinite(monthsToPayoff)) {
        return;
      }

      const monthlyRate = loan.interestRate / 100 / 12;
      let balance = loan.currentBalance;

      for (let m = 0; m < month && balance > 0; m++) {
        const monthlyInterest = balance * monthlyRate;
        const principalPayment = loan.monthlyPayment - monthlyInterest;
        balance = Math.max(0, balance - principalPayment);
      }

      totalBalance += balance;
    });

    data.push({
      date: date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
      }),
      balance: totalBalance,
    });
  }

  return data;
}
