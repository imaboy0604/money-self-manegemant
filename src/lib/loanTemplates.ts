import { Loan, LoanType } from "@/types/loan";

export interface LoanTemplate {
  id: string;
  title: string;
  type: LoanType;
  principal?: number;
  interestRate: number;
  monthlyPayment?: number;
}

/**
 * よく使われる借入のテンプレート
 */
export const LOAN_TEMPLATES: LoanTemplate[] = [
  {
    id: "template-1",
    title: "日本学生支援機構 奨学金",
    type: "A",
    principal: 3000000,
    interestRate: 0.5,
    monthlyPayment: 30000,
  },
  {
    id: "template-2",
    title: "楽天カード",
    type: "B",
    interestRate: 14.5,
    monthlyPayment: 50000,
  },
  {
    id: "template-3",
    title: "三井住友カード",
    type: "B",
    interestRate: 15.0,
    monthlyPayment: 30000,
  },
  {
    id: "template-4",
    title: "三菱UFJカード",
    type: "B",
    interestRate: 14.8,
    monthlyPayment: 40000,
  },
  {
    id: "template-5",
    title: "車ローン（トヨタ）",
    type: "A",
    principal: 2000000,
    interestRate: 2.5,
    monthlyPayment: 50000,
  },
  {
    id: "template-6",
    title: "車ローン（日産）",
    type: "A",
    principal: 2500000,
    interestRate: 2.8,
    monthlyPayment: 60000,
  },
  {
    id: "template-7",
    title: "リボ払い（楽天）",
    type: "B",
    interestRate: 14.5,
    monthlyPayment: 20000,
  },
  {
    id: "template-8",
    title: "分割払い（Amazon）",
    type: "B",
    interestRate: 0,
    monthlyPayment: 10000,
  },
];

/**
 * テンプレートからLoanを作成
 */
export function createLoanFromTemplate(
  template: LoanTemplate,
  currentBalance?: number
): Loan {
  return {
    id: crypto.randomUUID(),
    type: template.type,
    title: template.title,
    principal: template.principal || 0,
    currentBalance: currentBalance || template.principal || 0,
    interestRate: template.interestRate,
    monthlyPayment: template.monthlyPayment || 0,
  };
}

/**
 * ユーザーが以前に入力した借入タイトルを取得
 */
export function getPreviousLoanTitles(loans: Loan[]): string[] {
  if (!loans || loans.length === 0) return [];
  
  const titles = loans.map((loan) => loan.title);
  // 重複を除去
  return Array.from(new Set(titles));
}

