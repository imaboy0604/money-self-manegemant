"use client";

import { useState } from "react";
import { Loan } from "@/types/loan";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { LoanForm } from "./LoanForm";
import { Edit, Trash2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  calculateTotalInterest,
  calculatePayoffDate,
} from "@/lib/calculations";
import confetti from "canvas-confetti";

interface LoanListProps {
  loans: Loan[];
  onUpdate: (id: string, updates: Partial<Loan>) => void;
  onDelete: (id: string) => void;
  onPay: (id: string) => void;
  onAdd: (loan: Loan) => void;
}

export function LoanList({
  loans,
  onUpdate,
  onDelete,
  onPay,
  onAdd,
}: LoanListProps) {
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleEdit = (loan: Loan) => {
    setEditingLoan(loan);
  };

  const handleSave = (loan: Loan) => {
    if (editingLoan) {
      onUpdate(editingLoan.id, loan);
      setEditingLoan(null);
    } else {
      onAdd(loan);
      setIsAddDialogOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("この借入を削除してもよろしいですか？")) {
      onDelete(id);
    }
  };

  const handlePay = (id: string) => {
    if (confirm("今月分を返済しますか？")) {
      onPay(id);
      
      // 紙吹雪エフェクト
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>借入リスト</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          新しい借入を追加
        </Button>
      </div>

      {loans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p style={{ color: "var(--text-secondary)" }}>
              まだ借入が登録されていません。新しい借入を追加してください。
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loans.map((loan, index) => {
            const progress =
              loan.principal > 0
                ? ((loan.principal - loan.currentBalance) / loan.principal) *
                  100
                : 0;
            const isPaidOff = loan.currentBalance <= 0;
            const totalInterest = calculateTotalInterest(loan);
            const payoffDate = calculatePayoffDate(loan);

            return (
              <Card key={loan.id} index={index + 6} className="relative rounded-2xl">
                {isPaidOff && (
                  <div className="absolute top-4 right-4 z-10">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{loan.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded-full neumorphic-inset" style={{ color: "var(--text-secondary)" }}>
                        {loan.type === "A" ? "Type A: 固定ローン" : "Type B: クレカ・分割"}
                      </span>
                    </div>
                    {loan.type === "A" && (
                      <div className="flex justify-between text-sm">
                        <span style={{ color: "var(--text-secondary)" }}>借入総額</span>
                        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          ¥{loan.principal.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--text-secondary)" }}>現在の残高</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        ¥{Math.max(0, loan.currentBalance).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--text-secondary)" }}>月々の返済額</span>
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        ¥{loan.monthlyPayment.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--text-secondary)" }}>金利（年利）</span>
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {loan.interestRate}%
                      </span>
                    </div>
                    {!isPaidOff && (
                      <>
                        {totalInterest > 0 && (
                          <div className="flex justify-between text-sm pt-2 border-t" style={{ borderColor: "var(--surface-dark)" }}>
                            <span style={{ color: "var(--text-secondary)" }}>完済までに支払う利息</span>
                            <span className="font-semibold text-orange-600 dark:text-orange-400">
                              ¥{totalInterest.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </span>
                          </div>
                        )}
                        {payoffDate && (
                          <div className="flex justify-between text-sm">
                            <span style={{ color: "var(--text-secondary)" }}>完済予定日</span>
                            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                              {payoffDate.toLocaleDateString("ja-JP", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                        {!payoffDate && loan.interestRate > 0 && (
                          <div className="flex justify-between text-sm pt-2 border-t" style={{ borderColor: "var(--surface-dark)" }}>
                            <span className="text-red-600 dark:text-red-400">
                              注意: 月々の返済額が利息を下回っています
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
                      <span>返済進捗</span>
                      <span className="font-semibold">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(loan)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      編集
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(loan.id)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      削除
                    </Button>
                  </div>

                  {!isPaidOff && (
                    <Button
                      onClick={() => handlePay(loan.id)}
                      className="w-full"
                      size="sm"
                      variant="success"
                    >
                      今月分を返済する 🎉
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新しい借入を追加</DialogTitle>
          </DialogHeader>
          <LoanForm
            onSubmit={handleSave}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {editingLoan && (
        <Dialog open={!!editingLoan} onOpenChange={() => setEditingLoan(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>借入を編集</DialogTitle>
            </DialogHeader>
            <LoanForm
              loan={editingLoan}
              onSubmit={handleSave}
              onCancel={() => setEditingLoan(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

