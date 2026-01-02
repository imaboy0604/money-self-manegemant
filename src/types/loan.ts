export type LoanType = "A" | "B"; // A: 固定ローン、B: クレジットカード・分割払い

export interface Loan {
  id: string;
  title: string;
  type: LoanType; // 借入タイプ
  principal: number; // 借入総額（元本）- Type Aのみ使用
  currentBalance: number; // 現在の残高
  interestRate: number; // 金利（年利 %）
  monthlyPayment: number; // 月々の返済額（Type A: 固定、Type B: 平均予定額）
}

