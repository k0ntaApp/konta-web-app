import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import {
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  Download,
  Printer,
  ChevronDown,
  PieChart,
  BarChart3,
} from "lucide-react";

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const REPORT_TYPES = [
  { id: "all", label: "Completo", icon: FileText },
  { id: "income", label: "Receitas", icon: TrendingUp },
  { id: "expense", label: "Despesas", icon: TrendingDown },
];

const PERIOD_PRESETS = [
  { id: "this-month", label: "Este mês" },
  { id: "last-month", label: "Mês anterior" },
  { id: "last-3-months", label: "Últimos 3 meses" },
  { id: "this-year", label: "Este ano" },
  { id: "custom", label: "Personalizado" },
];

export function ReportsPage() {
  const { expenses, incomes } = useApp();
  const now = new Date();

  const [reportType, setReportType] = useState<"all" | "income" | "expense">("all");
  const [preset, setPreset] = useState("this-month");
  const [startDate, setStartDate] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    now.toISOString().split("T")[0]
  );

  const handlePresetChange = (presetId: string) => {
    setPreset(presetId);
    const today = new Date();

    switch (presetId) {
      case "this-month":
        setStartDate(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
        break;
      case "last-month":
        setStartDate(new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split("T")[0]);
        setEndDate(new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split("T")[0]);
        break;
      case "last-3-months":
        setStartDate(new Date(today.getFullYear(), today.getMonth() - 2, 1).toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
        break;
      case "this-year":
        setStartDate(new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
        break;
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const date = new Date(e.date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
  }, [expenses, startDate, endDate]);

  const filteredIncomes = useMemo(() => {
    return incomes.filter(i => {
      const date = new Date(i.date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
  }, [incomes, startDate, endDate]);

  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalIncomes = filteredIncomes.reduce((s, i) => s + i.amount, 0);
  const balance = totalIncomes - totalExpenses;

  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredExpenses]);

  const incomesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredIncomes.forEach(i => {
      map[i.category] = (map[i.category] || 0) + i.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredIncomes]);

  const dailyData = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split("T")[0];
      map[key] = { income: 0, expense: 0 };
    }

    filteredExpenses.forEach(e => {
      const key = new Date(e.date).toISOString().split("T")[0];
      if (map[key]) map[key].expense += e.amount;
    });

    filteredIncomes.forEach(i => {
      const key = new Date(i.date).toISOString().split("T")[0];
      if (map[key]) map[key].income += i.amount;
    });

    return Object.entries(map).map(([date, data]) => ({
      date,
      ...data,
    }));
  }, [filteredExpenses, filteredIncomes, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  const inputCls = "px-3 py-2 rounded-lg border border-border dark:border-border bg-background dark:bg-background text-sm text-foreground dark:text-foreground focus:outline-none focus:border-primary";

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl text-foreground" style={{ fontWeight: 700 }}>
          Relatórios
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Gere relatórios detalhados do seu financeiro
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card dark:bg-card rounded-2xl p-5 border border-border dark:border-white/[0.06] shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm text-foreground mb-2" style={{ fontWeight: 600 }}>
              Tipo de relatório
            </label>
            <div className="flex gap-1 bg-muted/50 dark:bg-muted p-1 rounded-lg">
              {REPORT_TYPES.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id as "all" | "income" | "expense")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs transition-all ${
                      reportType === type.id
                        ? "bg-card dark:bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={{ fontWeight: reportType === type.id ? 600 : 400 }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Period Preset */}
          <div>
            <label className="block text-sm text-foreground mb-2" style={{ fontWeight: 600 }}>
              Período
            </label>
            <div className="relative">
              <select
                value={preset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className={inputCls + " w-full appearance-none pr-8"}
              >
                {PERIOD_PRESETS.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
              <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm text-foreground mb-2" style={{ fontWeight: 600 }}>
              Data inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPreset("custom"); }}
              className={inputCls + " w-full"}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm text-foreground mb-2" style={{ fontWeight: 600 }}>
              Data final
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPreset("custom"); }}
              className={inputCls + " w-full"}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-border dark:border-white/[0.06]">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border dark:border-border text-sm text-foreground hover:bg-accent dark:hover:bg-muted transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {(reportType === "all" || reportType === "income") && (
          <div className="bg-card dark:bg-card rounded-2xl p-4 border border-border dark:border-white/[0.06] shadow-sm">
            <p className="text-xs text-muted-foreground mb-1">Receitas</p>
            <p className="text-xl text-primary" style={{ fontWeight: 700 }}>
              {formatCurrency(totalIncomes)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredIncomes.length} registros
            </p>
          </div>
        )}
        {(reportType === "all" || reportType === "expense") && (
          <div className="bg-card dark:bg-card rounded-2xl p-4 border border-border dark:border-white/[0.06] shadow-sm">
            <p className="text-xs text-muted-foreground mb-1">Despesas</p>
            <p className="text-xl text-red-500" style={{ fontWeight: 700 }}>
              {formatCurrency(totalExpenses)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredExpenses.length} registros
            </p>
          </div>
        )}
        {reportType === "all" && (
          <>
            <div className="bg-card dark:bg-card rounded-2xl p-4 border border-border dark:border-white/[0.06] shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">Saldo</p>
              <p className="text-xl" style={{ fontWeight: 700, color: balance >= 0 ? "#16a34a" : "#ef4444" }}>
                {formatCurrency(Math.abs(balance))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {balance >= 0 ? "Positivo" : "Negativo"}
              </p>
            </div>
            <div className="bg-card dark:bg-card rounded-2xl p-4 border border-border dark:border-white/[0.06] shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">Média diária</p>
              <p className="text-xl text-foreground" style={{ fontWeight: 700 }}>
                {formatCurrency((totalExpenses + totalIncomes) / Math.max(dailyData.length, 1))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {dailyData.length} dias
              </p>
            </div>
          </>
        )}
      </div>

      {/* Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        {(reportType === "all" || reportType === "expense") && (
          <div className="bg-card dark:bg-card rounded-2xl p-5 border border-border dark:border-white/[0.06] shadow-sm">
            <h3 className="text-foreground mb-4 flex items-center gap-2" style={{ fontWeight: 700 }}>
              <PieChart className="w-5 h-5 text-red-500" />
              Despesas por categoria
            </h3>
            {expensesByCategory.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma despesa no período</p>
            ) : (
              <div className="space-y-3">
                {expensesByCategory.map(([cat, total]) => {
                  const pct = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-foreground">{cat}</span>
                        <span className="text-sm text-foreground" style={{ fontWeight: 600 }}>
                          {formatCurrency(total)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted dark:bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{pct.toFixed(1)}% do total</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Incomes by Category */}
        {(reportType === "all" || reportType === "income") && (
          <div className="bg-card dark:bg-card rounded-2xl p-5 border border-border dark:border-white/[0.06] shadow-sm">
            <h3 className="text-foreground mb-4 flex items-center gap-2" style={{ fontWeight: 700 }}>
              <PieChart className="w-5 h-5 text-primary" />
              Receitas por categoria
            </h3>
            {incomesByCategory.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma receita no período</p>
            ) : (
              <div className="space-y-3">
                {incomesByCategory.map(([cat, total]) => {
                  const pct = totalIncomes > 0 ? (total / totalIncomes) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-foreground">{cat}</span>
                        <span className="text-sm text-foreground" style={{ fontWeight: 600 }}>
                          {formatCurrency(total)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted dark:bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{pct.toFixed(1)}% do total</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Daily Transactions Table */}
      <div className="bg-card dark:bg-card rounded-2xl p-5 border border-border dark:border-white/[0.06] shadow-sm mt-6">
        <h3 className="text-foreground mb-4 flex items-center gap-2" style={{ fontWeight: 700 }}>
          <BarChart3 className="w-5 h-5 text-primary" />
          Movimentação diária
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border dark:border-white/[0.06]">
                <th className="text-left py-2 text-xs text-muted-foreground uppercase" style={{ fontWeight: 600 }}>Data</th>
                {reportType !== "expense" && (
                  <th className="text-right py-2 text-xs text-muted-foreground uppercase" style={{ fontWeight: 600 }}>Receitas</th>
                )}
                {reportType !== "income" && (
                  <th className="text-right py-2 text-xs text-muted-foreground uppercase" style={{ fontWeight: 600 }}>Despesas</th>
                )}
                {reportType === "all" && (
                  <th className="text-right py-2 text-xs text-muted-foreground uppercase" style={{ fontWeight: 600 }}>Saldo</th>
                )}
              </tr>
            </thead>
            <tbody>
              {dailyData.filter(d => d.income > 0 || d.expense > 0).length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhuma movimentação no período
                  </td>
                </tr>
              ) : (
                dailyData
                  .filter(d => d.income > 0 || d.expense > 0)
                  .slice(-30)
                  .map(day => {
                    const dayBalance = day.income - day.expense;
                    const dateObj = new Date(day.date);
                    return (
                      <tr key={day.date} className="border-b border-border/50 dark:border-white/[0.04]">
                        <td className="py-2.5 text-sm text-foreground">
                          {dateObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        </td>
                        {reportType !== "expense" && (
                          <td className="py-2.5 text-sm text-primary text-right" style={{ fontWeight: 500 }}>
                            {day.income > 0 ? formatCurrency(day.income) : "-"}
                          </td>
                        )}
                        {reportType !== "income" && (
                          <td className="py-2.5 text-sm text-red-500 text-right" style={{ fontWeight: 500 }}>
                            {day.expense > 0 ? formatCurrency(day.expense) : "-"}
                          </td>
                        )}
                        {reportType === "all" && (
                          <td className="py-2.5 text-sm text-right" style={{ fontWeight: 600, color: dayBalance >= 0 ? "#16a34a" : "#ef4444" }}>
                            {dayBalance >= 0 ? "+" : ""}{formatCurrency(dayBalance)}
                          </td>
                        )}
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Period Info */}
      <p className="text-xs text-muted-foreground mt-4 text-center">
        Período: {new Date(startDate).toLocaleDateString("pt-BR")} a {new Date(endDate).toLocaleDateString("pt-BR")}
      </p>
    </div>
  );
}