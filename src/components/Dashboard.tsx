"use client";

import { Loan } from "@/types/loan";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { CountUp } from "./ui/CountUp";
import { TrendingDown, Calendar, Target, AlertTriangle } from "lucide-react";
import {
  calculateTotalInterest,
  generateStackedAreaData,
  generateYearlyStackedAreaData,
} from "@/lib/calculations";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

interface DashboardProps {
  loans: Loan[];
}

export function Dashboard({ loans }: DashboardProps) {
  // 全体の借入残高合計
  const totalBalance = loans.reduce(
    (sum, loan) => sum + loan.currentBalance,
    0
  );

  // 借入総額合計（Type Aのみ）
  const totalPrincipal = loans
    .filter((loan) => loan.type === "A")
    .reduce((sum, loan) => sum + loan.principal, 0);

  // 月々の返済総額
  const totalMonthlyPayment = loans.reduce(
    (sum, loan) => sum + loan.monthlyPayment,
    0
  );

  // 完済進捗率（返済済み割合）- Type Aのみで計算
  const typeABalance = loans
    .filter((loan) => loan.type === "A")
    .reduce((sum, loan) => sum + loan.currentBalance, 0);
  const paidAmount = totalPrincipal - typeABalance;
  const progressPercentage =
    totalPrincipal > 0 ? (paidAmount / totalPrincipal) * 100 : 0;

  // 完済までの推定期間（月）
  const estimatedMonths =
    totalMonthlyPayment > 0
      ? Math.ceil(totalBalance / totalMonthlyPayment)
      : 0;

  // 返済済み金額
  const totalPaid = totalPrincipal - totalBalance;

  // 利息総額
  const totalInterest = loans.reduce(
    (sum, loan) => sum + calculateTotalInterest(loan),
    0
  );

  // 積み上げ面グラフ用データ（月単位）
  const chartData = generateStackedAreaData(loans);
  // 積み上げ面グラフ用データ（年単位）
  const yearlyChartData = generateYearlyStackedAreaData(loans);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          借入金管理ダッシュボード
        </h1>
        <p className="text-base" style={{ color: "var(--text-secondary)" }}>
          完済への道のりを一緒に進みましょう
        </p>
      </div>

      {/* 利息総額の警告表示 */}
      {totalInterest > 0 && (
        <Card index={0} className="neumorphic border-2 border-orange-300/50 dark:border-orange-600/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  完済までに支払う利息総額
                </div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  <CountUp
                    value={totalInterest}
                    prefix="¥"
                    duration={2000}
                    decimals={0}
                  />
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  現在の返済ペースで完済した場合の概算値です
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card index={1}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              借入残高合計
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              <CountUp value={totalBalance} prefix="¥" duration={2000} />
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              返済済み: <CountUp value={totalPaid} prefix="¥" duration={2000} />
            </p>
          </CardContent>
        </Card>

        <Card index={2}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              月々の返済総額
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              <CountUp value={totalMonthlyPayment} prefix="¥" duration={2000} />
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>/ 月</p>
          </CardContent>
        </Card>

        <Card index={3}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              完済までの推定期間
            </CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              <CountUp value={estimatedMonths} suffix="ヶ月" duration={1500} />
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              {estimatedMonths > 12
                ? `約${Math.floor(estimatedMonths / 12)}年${estimatedMonths % 12}ヶ月`
                : "ヶ月"}
            </p>
          </CardContent>
        </Card>

        <Card index={4}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              完済進捗率
            </CardTitle>
            <div className="h-4 w-4 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              <CountUp
                value={progressPercentage}
                suffix="%"
                duration={2000}
                decimals={1}
              />
            </div>
            <Progress value={progressPercentage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* 完済シミュレーション・グラフ（積み上げ面グラフ） */}
      {loans.length > 0 && chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card index={5}>
            <CardHeader>
              <CardTitle style={{ color: "var(--text-primary)" }}>返済内訳シミュレーション・グラフ</CardTitle>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                毎月の返済額の内訳（元本 vs 利息）
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis
                      dataKey="date"
                      style={{ fontSize: "12px", fill: "var(--text-secondary)" }}
                    />
                    <YAxis
                      style={{ fontSize: "12px", fill: "var(--text-secondary)" }}
                      tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        const label = name === "principal" ? "元本" : name === "interest" ? "利息" : "合計";
                        return [`¥${value.toLocaleString()}`, label];
                      }}
                      labelStyle={{ color: "var(--text-primary)" }}
                      contentStyle={{
                        backgroundColor: "var(--surface)",
                        border: "1px solid rgba(0,0,0,0.1)",
                        borderRadius: "12px",
                        color: "var(--text-primary)",
                      }}
                    />
                    <Legend
                      formatter={(value) => {
                        if (value === "principal") return "元本";
                        if (value === "interest") return "利息";
                        return value;
                      }}
                      wrapperStyle={{ color: "var(--text-primary)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="principal"
                      stackId="1"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPrincipal)"
                      name="principal"
                    />
                    <Area
                      type="monotone"
                      dataKey="interest"
                      stackId="1"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorInterest)"
                      name="interest"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 年単位の返済内訳グラフ */}
      {loans.length > 0 && yearlyChartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card index={6}>
            <CardHeader>
              <CardTitle style={{ color: "var(--text-primary)" }}>年間返済内訳グラフ</CardTitle>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                年単位での返済額の内訳（元本 vs 利息）
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={yearlyChartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPrincipalYearly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorInterestYearly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                    <XAxis
                      dataKey="year"
                      style={{ fontSize: "12px", fill: "var(--text-secondary)" }}
                    />
                    <YAxis
                      style={{ fontSize: "12px", fill: "var(--text-secondary)" }}
                      tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        const label = name === "principal" ? "元本" : name === "interest" ? "利息" : "合計";
                        return [`¥${value.toLocaleString()}`, label];
                      }}
                      labelStyle={{ color: "var(--text-primary)" }}
                      contentStyle={{
                        backgroundColor: "var(--surface)",
                        border: "1px solid rgba(0,0,0,0.1)",
                        borderRadius: "12px",
                        color: "var(--text-primary)",
                      }}
                    />
                    <Legend
                      formatter={(value) => {
                        if (value === "principal") return "元本";
                        if (value === "interest") return "利息";
                        return value;
                      }}
                      wrapperStyle={{ color: "var(--text-primary)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="principal"
                      stackId="1"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPrincipalYearly)"
                      name="principal"
                    />
                    <Area
                      type="monotone"
                      dataKey="interest"
                      stackId="1"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorInterestYearly)"
                      name="interest"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

