"use client";

import { useState, useEffect } from "react";
import { Loan, LoanType } from "@/types/loan";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LOAN_TEMPLATES, createLoanFromTemplate, getPreviousLoanTitles } from "@/lib/loanTemplates";
import { getLoans } from "@/lib/storage";

interface LoanFormProps {
  loan?: Loan;
  onSubmit: (loan: Loan) => void;
  onCancel: () => void;
}

export function LoanForm({ loan, onSubmit, onCancel }: LoanFormProps) {
  const [type, setType] = useState<LoanType>("A");
  const [title, setTitle] = useState("");
  const [principal, setPrincipal] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [previousTitles, setPreviousTitles] = useState<string[]>([]);

  useEffect(() => {
    if (loan) {
      setType(loan.type || "A");
      setTitle(loan.title);
      setPrincipal(loan.principal.toString());
      setCurrentBalance(loan.currentBalance.toString());
      setInterestRate(loan.interestRate.toString());
      setMonthlyPayment(loan.monthlyPayment.toString());
    }
    const loans = getLoans();
    setPreviousTitles(getPreviousLoanTitles(loans));
  }, [loan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const loanData: Loan = {
      id: loan?.id || crypto.randomUUID(),
      type: type,
      title: title.trim(),
      principal: type === "A" ? (parseFloat(principal) || 0) : 0,
      currentBalance: parseFloat(currentBalance) || 0,
      interestRate: parseFloat(interestRate) || 0,
      monthlyPayment: parseFloat(monthlyPayment) || 0,
    };

    // 金利が0の場合はエラー
    if (loanData.interestRate <= 0) {
      alert("金利（年利%）を入力してください。");
      return;
    }

    onSubmit(loanData);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = LOAN_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      const templateLoan = createLoanFromTemplate(template);
      setType(templateLoan.type);
      setTitle(templateLoan.title);
      setPrincipal(templateLoan.principal.toString());
      setCurrentBalance(templateLoan.currentBalance.toString());
      setInterestRate(templateLoan.interestRate.toString());
      setMonthlyPayment(templateLoan.monthlyPayment.toString());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>テンプレートから選択</Label>
        <select
          onChange={(e) => {
            if (e.target.value) {
              handleTemplateSelect(e.target.value);
            }
          }}
          className="neumorphic-inset w-full rounded-2xl px-3 py-2 text-sm"
          style={{ color: "var(--text-primary)", backgroundColor: "var(--surface)" }}
        >
          <option value="">テンプレートを選択...</option>
          {LOAN_TEMPLATES.map((template) => (
            <option key={template.id} value={template.id}>
              {template.title} ({template.type === "A" ? "固定" : "クレカ"})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">借入タイプ *</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="A"
              checked={type === "A"}
              onChange={(e) => setType(e.target.value as LoanType)}
              className="w-4 h-4"
            />
            <span style={{ color: "var(--text-primary)" }}>Type A: 固定ローン（奨学金・車など）</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="B"
              checked={type === "B"}
              onChange={(e) => setType(e.target.value as LoanType)}
              className="w-4 h-4"
            />
            <span style={{ color: "var(--text-primary)" }}>Type B: クレジットカード・分割払い</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">タイトル *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 奨学金、Audiローン、楽天カード分割"
          required
          list="previousTitles"
        />
        <datalist id="previousTitles">
          {previousTitles.map((prevTitle, index) => (
            <option key={index} value={prevTitle} />
          ))}
        </datalist>
      </div>

      {type === "A" && (
        <div className="space-y-2">
          <Label htmlFor="principal">借入総額（元本）*</Label>
          <Input
            id="principal"
            type="number"
            min="0"
            step="1"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="例: 3000000"
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="currentBalance">
          現在の残高 {type === "B" ? "合計" : ""} *
        </Label>
        <Input
          id="currentBalance"
          type="number"
          min="0"
          step="1"
          value={currentBalance}
          onChange={(e) => setCurrentBalance(e.target.value)}
          placeholder={type === "B" ? "例: 250000（カード残高合計）" : "例: 2500000"}
          required
        />
        {type === "B" && (
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            ※残高は毎月変動するため、明細を見て手動で更新してください
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="monthlyPayment">
          月々の返済額 {type === "B" ? "（平均予定額）" : ""} *
        </Label>
        <Input
          id="monthlyPayment"
          type="number"
          min="0"
          step="1"
          value={monthlyPayment}
          onChange={(e) => setMonthlyPayment(e.target.value)}
          placeholder={type === "B" ? "例: 50000（平均予定額）" : "例: 50000"}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="interestRate">金利（年利 %） *</Label>
        <Input
          id="interestRate"
          type="number"
          min="0"
          step="0.01"
          value={interestRate}
          onChange={(e) => setInterestRate(e.target.value)}
          placeholder="例: 2.5"
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit">保存</Button>
      </div>
    </form>
  );
}

