import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { Skeleton } from "../components/ui/skeleton";
import { QuickAddFAB } from "../components/QuickAddFAB";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Plus,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
} from "lucide-react";

const MONTHS_PT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];
const CATEGORY_COLORS: Record<string, string> = {
  Alimentação: "#16a34a",
  Moradia: "#0ea5e9",
  Transporte: "#f59e0b",
  Saúde: "#ef4444",
  Educação: "#8b5cf6",
  Lazer: "#ec4899",
  Outros: "#6b7280",
};

function formatCurrency(value: number, compact = false) {
  if (compact && value >= 10000) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  }
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatCurrencyCompact(value: number) {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
  trendValue,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}) {
  return (
    <div className="bg-card dark:bg-card rounded-2xl p-4 sm:p-5 border border-border dark:border-white/[0.06] shadow-sm">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0`}
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trendValue && (
          <div
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full whitespace-nowrap
            ${trend === "up" ? "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400" : trend === "down" ? "bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400" : "bg-gray-50 dark:bg-muted text-gray-500 dark:text-muted-foreground"}`}
            style={{ fontWeight: 500 }}
          >
            {trend === "up" ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : trend === "down" ? (
              <ArrowDownRight className="w-3 h-3" />
            ) : null}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground mb-1">
        {title}
      </p>
      <p
        className="text-xl sm:text-2xl text-foreground truncate"
        style={{ fontWeight: 700 }}
        title={value}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card dark:bg-card rounded-xl shadow-lg border border-border dark:border-white/[0.08] p-3 text-sm">
        <p
          className="text-foreground mb-2"
          style={{ fontWeight: 600 }}
        >
          {label}
        </p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2 mb-1">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-muted-foreground dark:text-muted-foreground">
              {p.name}:
            </span>
            <span
              className="text-foreground dark:text-foreground"
              style={{ fontWeight: 500 }}
            >
              {formatCurrency(p.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardPage() {
  const { setup, expenses, incomes, goals, currentUser } = useApp();
  const navigate = useNavigate();
  const now = new Date();
  const [dashTab, setDashTab] = useState<"resumo" | "detalhes">("resumo");
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [isLoading] = useState(false);

  const currentMonthExpenses = useMemo(
    () =>
      expenses.filter((e) => {
        const d = new Date(e.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }),
    [expenses],
  );

  const currentMonthIncomes = useMemo(
    () =>
      incomes.filter((i) => {
        const d = new Date(i.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }),
    [incomes],
  );

  const totalExpensesMonth = useMemo(
    () => currentMonthExpenses.reduce((s, e) => s + e.amount, 0),
    [currentMonthExpenses],
  );
  const totalIncomesMonth = useMemo(() => {
    const txIncome = currentMonthIncomes.reduce((s, i) => s + i.amount, 0);
    if (txIncome > 0) return txIncome;
    return (setup?.members ?? []).reduce((s, m) => s + (m.income ?? 0), 0);
  }, [currentMonthIncomes, setup]);
  const balance = totalIncomesMonth - totalExpensesMonth;
  const savingsRate =
    totalIncomesMonth > 0
      ? Math.max(
          0,
          ((totalIncomesMonth - totalExpensesMonth) / totalIncomesMonth) * 100,
        )
      : 0;

  const prevMonth = useMemo(() => {
    const pm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        return (
          d.getMonth() === pm.getMonth() && d.getFullYear() === pm.getFullYear()
        );
      })
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses]);

  const expenseTrend =
    prevMonth > 0 ? ((totalExpensesMonth - prevMonth) / prevMonth) * 100 : 0;

  const chartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const exp = expenses
        .filter((e) => {
          const ed = new Date(e.date);
          return ed.getMonth() === m && ed.getFullYear() === y;
        })
        .reduce((s, e) => s + e.amount, 0);
      const inc = incomes
        .filter((e) => {
          const ed = new Date(e.date);
          return ed.getMonth() === m && ed.getFullYear() === y;
        })
        .reduce((s, e) => s + e.amount, 0);
      const membersInc =
        inc > 0
          ? inc
          : (setup?.members ?? []).reduce((s, mb) => s + (mb.income ?? 0), 0);
      return { name: MONTHS_PT[m], Receitas: membersInc, Despesas: exp };
    });
  }, [expenses, incomes, setup]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    currentMonthExpenses.forEach((e) => {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [currentMonthExpenses]);

  const recentTransactions = useMemo(() => {
    const allTx = [
      ...expenses.map((e) => ({ ...e, txType: "expense" as const })),
      ...incomes.map((i) => ({ ...i, txType: "income" as const })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return allTx.slice(0, 8);
  }, [expenses, incomes]);

  const budgetUsage = setup?.monthlyBudget
    ? (totalExpensesMonth / setup.monthlyBudget) * 100
    : 0;
  const activeGoals = goals
    .filter((g) => g.currentAmount < g.targetAmount)
    .slice(0, 3);

  const memberContributions = useMemo(() => {
    return (setup?.members ?? []).map((m) => {
      const memberExpenses = currentMonthExpenses
        .filter((e) => e.member === m.name)
        .reduce((s, e) => s + e.amount, 0);
      const income = m.income ?? 0;
      const desired = m.desiredContribution ?? 0;
      const saved = Math.max(0, income - memberExpenses);
      const onTrack = desired > 0 ? saved >= desired : true;
      return { ...m, memberExpenses, saved, onTrack };
    });
  }, [setup, currentMonthExpenses]);

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl text-foreground"
            style={{ fontWeight: 700 }}
          >
            {greeting()}, {currentUser?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground mt-0.5">
            {now.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setNewMenuOpen((v) => !v)}
            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-primary dark:bg-primary text-white hover:bg-primary/90 dark:hover:bg-violet-600 transition-colors text-xs sm:text-sm"
            style={{ fontWeight: 600 }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Novo lançamento</span>
            <span className="inline xs:hidden">Novo</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {newMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setNewMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-44 bg-card rounded-xl shadow-lg border border-border z-20 overflow-hidden sm:right-0 max-sm:right-auto max-sm:left-0">
                <button
                  onClick={() => {
                    navigate("/income");
                    setNewMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-foreground hover:bg-accent transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Receita
                </button>
                <button
                  onClick={() => {
                    navigate("/expenses");
                    setNewMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-foreground hover:bg-accent transition-colors"
                >
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  Despesa
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Budget alert */}
      {budgetUsage > 80 && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${budgetUsage >= 100 ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}
        >
          <AlertCircle
            className={`w-5 h-5 flex-shrink-0 ${budgetUsage >= 100 ? "text-red-500" : "text-amber-500"}`}
          />
          <p
            className={`text-sm ${budgetUsage >= 100 ? "text-red-700" : "text-amber-700"}`}
            style={{ fontWeight: 500 }}
          >
            {budgetUsage >= 100
              ? `⚠️ Orçamento ultrapassado! Você gastou ${formatCurrency(totalExpensesMonth)} de ${formatCurrency(setup?.monthlyBudget ?? 0)}.`
              : `Atenção: você já usou ${budgetUsage.toFixed(0)}% do orçamento mensal (${formatCurrency(totalExpensesMonth)} de ${formatCurrency(setup?.monthlyBudget ?? 0)}).`}
          </p>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </>
        ) : (
          <>
        <StatCard
          title="Receita do mês"
          value={formatCurrency(totalIncomesMonth)}
          icon={TrendingUp}
          color="#16a34a"
          subtitle={`${(setup?.members ?? []).length} membro(s)`}
          trend="up"
          trendValue="este mês"
        />
        <StatCard
          title="Despesas do mês"
          value={formatCurrency(totalExpensesMonth)}
          icon={TrendingDown}
          color="#ef4444"
          subtitle={`${currentMonthExpenses.length} lançamentos`}
          trend={expenseTrend > 0 ? "down" : "up"}
          trendValue={`${expenseTrend > 0 ? "+" : ""}${expenseTrend.toFixed(0)}% vs mês ant.`}
        />
        <StatCard
          title="Saldo atual"
          value={formatCurrency(Math.abs(balance))}
          icon={Wallet}
          color={balance >= 0 ? "#0ea5e9" : "#f59e0b"}
          subtitle={balance >= 0 ? "Positivo" : "Negativo"}
          trend={balance >= 0 ? "up" : "down"}
          trendValue={balance >= 0 ? "No azul" : "No vermelho"}
        />
        <StatCard
          title="Taxa de economia"
          value={`${savingsRate.toFixed(1)}%`}
          icon={Target}
          color="var(--chart-1)"
          subtitle={`Meta: 20%`}
          trend={savingsRate >= 20 ? "up" : "down"}
          trendValue={savingsRate >= 20 ? "Ótimo!" : "Abaixo da meta"}
        />
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/40 dark:bg-muted p-1 rounded-xl">
        {(["resumo", "detalhes"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setDashTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm transition-all ${
              dashTab === tab
                ? "bg-card dark:bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            style={{ fontWeight: dashTab === tab ? 600 : 400 }}
          >
            {tab === "resumo" ? "Resumo" : "Detalhes"}
          </button>
        ))}
      </div>

      {/* Content with smooth transition */}
      <div className="transition-opacity duration-200 ease-in-out">
        {/* Resumo tab: chart + budget progress + category pie */}
        {dashTab === "resumo" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Monthly comparison chart */}
            <div className="bg-card dark:bg-card rounded-2xl p-5 border border-border dark:border-white/[0.06] shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3
                    className="text-foreground"
                    style={{ fontWeight: 700 }}
                  >
                    Evolução mensal
                  </h3>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                    Últimos 6 meses
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={16} barGap={4}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{
                      fontSize: 12,
                      color: "var(--muted-foreground)",
                      paddingTop: 8,
                    }}
                  />
                  <Bar dataKey="Receitas" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Despesas" fill="#fca5a5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Budget progress */}
            {setup?.monthlyBudget && (
              <div className="bg-card dark:bg-card rounded-2xl p-5 border border-border dark:border-white/[0.06] shadow-sm">
                <h3
                  className="text-foreground mb-4"
                  style={{ fontWeight: 700 }}
                >
                  Orçamento do mês
                </h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                    Gasto até agora
                  </span>
                  <span
                    className="text-sm text-foreground dark:text-foreground"
                    style={{ fontWeight: 600 }}
                  >
                    {formatCurrency(totalExpensesMonth)} /{" "}
                    {formatCurrency(setup.monthlyBudget)}
                  </span>
                </div>
                <div className="w-full h-3 bg-background dark:bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${budgetUsage >= 100 ? "bg-red-400" : budgetUsage >= 80 ? "bg-amber-400" : "bg-primary dark:bg-primary"}`}
                    style={{ width: `${Math.min(100, budgetUsage)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`text-xs ${budgetUsage >= 100 ? "text-red-500" : budgetUsage >= 80 ? "text-amber-500" : "text-primary dark:text-primary"}`}
                    style={{ fontWeight: 500 }}
                  >
                    {budgetUsage.toFixed(0)}% utilizado
                  </span>
                  <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                    Faltam{" "}
                    {formatCurrency(
                      Math.max(0, setup.monthlyBudget - totalExpensesMonth),
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Category chart */}
          <div className="space-y-6">
            <div className="bg-card dark:bg-card rounded-2xl p-5 border border-border dark:border-white/[0.06] shadow-sm">
              <h3
                className="text-foreground mb-4"
                style={{ fontWeight: 700 }}
              >
                Gastos por categoria
              </h3>
              {categoryData.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground dark:text-muted-foreground text-sm">
                  <p>Sem dados este mês</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        dataKey="value"
                        paddingAngle={3}
                      >
                        {categoryData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={CATEGORY_COLORS[entry.name] ?? "#6b7280"}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {categoryData.map((cat) => (
                      <div key={cat.name} className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor:
                              CATEGORY_COLORS[cat.name] ?? "#6b7280",
                          }}
                        />
                        <span className="text-xs text-muted-foreground dark:text-muted-foreground flex-1">
                          {cat.name}
                        </span>
                        <span
                          className="text-xs text-foreground dark:text-foreground"
                          style={{ fontWeight: 600 }}
                        >
                          {formatCurrency(cat.value)}
                        </span>
                        <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                          {totalExpensesMonth > 0
                            ? ((cat.value / totalExpensesMonth) * 100).toFixed(0)
                            : 0}
                          %
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detalhes tab: transactions + goals + members */}
      {dashTab === "detalhes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Recent transactions */}
          <div className="lg:col-span-2">
            <div className="bg-card dark:bg-card rounded-2xl p-5 border border-border dark:border-white/[0.06] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-foreground"
                  style={{ fontWeight: 700 }}
                >
                  Últimas transações
                </h3>
                <button
                  onClick={() => navigate("/expenses")}
                  className="inline-flex items-center gap-1 text-sm text-primary dark:text-primary hover:text-foreground dark:hover:text-primary transition-colors px-2 py-2 rounded-lg hover:bg-accent"
                  style={{ fontWeight: 500 }}
                >
                  Ver todas <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground dark:text-muted-foreground">
                  <Wallet className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Nenhuma transação ainda.</p>
                  <button
                    onClick={() => navigate("/expenses")}
                    className="mt-2 inline-flex items-center text-sm text-primary dark:text-primary px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    Adicionar despesa
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentTransactions.map((tx) => {
                    const category = tx.category;
                    const color = CATEGORY_COLORS[category] ?? "#6b7280";
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-background dark:hover:bg-muted transition-colors"
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${color}15` }}
                        >
                          {tx.txType === "expense" ? (
                            <TrendingDown className="w-4 h-4" style={{ color }} />
                          ) : (
                            <TrendingUp className="w-4 h-4 text-primary dark:text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm text-foreground dark:text-foreground truncate"
                            style={{ fontWeight: 500 }}
                          >
                            {tx.description}
                          </p>
                          <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                            {category} · {tx.member}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p
                            className={`text-sm ${
                              tx.txType === "income"
                                ? "text-primary dark:text-primary"
                                : "text-foreground dark:text-foreground"
                            }`}
                            style={{ fontWeight: 600 }}
                          >
                            {tx.txType === "income" ? "+" : "-"}
                            {formatCurrency(tx.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                            {new Date(tx.date).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Goals + Members */}
          <div className="space-y-6">
            {/* Goals */}
            <div className="bg-card dark:bg-card rounded-2xl p-5 border border-border dark:border-white/[0.06] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-foreground"
                  style={{ fontWeight: 700 }}
                >
                  Metas
                </h3>
                <button
                  onClick={() => navigate("/goals")}
                  className="inline-flex items-center text-sm text-primary dark:text-primary flex items-center gap-1 px-2 py-2 rounded-lg hover:bg-accent transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  Ver todas <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {activeGoals.length === 0 ? (
                <div className="text-center py-4">
                  <Target className="w-8 h-8 mx-auto mb-2 text-muted-foreground dark:text-muted-foreground opacity-40" />
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    Nenhuma meta ativa.
                  </p>
                  <button
                    onClick={() => navigate("/goals")}
                    className="mt-2 inline-flex items-center text-sm text-primary dark:text-primary px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                    style={{ fontWeight: 500 }}
                  >
                    Criar meta
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeGoals.map((g) => {
                    const pct = (g.currentAmount / g.targetAmount) * 100;
                    return (
                      <div key={g.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="text-sm text-foreground dark:text-foreground"
                            style={{ fontWeight: 500 }}
                          >
                            {g.title}
                          </span>
                          <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-background dark:bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: g.color }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                            {formatCurrency(g.currentAmount)}
                          </span>
                          <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                            {formatCurrency(g.targetAmount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Members contributions */}
            <div className="bg-card dark:bg-card rounded-2xl p-5 border border-border dark:border-white/[0.06] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-foreground"
                  style={{ fontWeight: 700 }}
                >
                  Membros
                </h3>
                <button
                  onClick={() => navigate("/members")}
                  className="inline-flex items-center text-sm text-primary dark:text-primary flex items-center gap-1 px-2 py-2 rounded-lg hover:bg-accent transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  Ver <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {memberContributions.slice(0, 4).map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 overflow-hidden"
                      style={{ backgroundColor: m.color, fontWeight: 600 }}
                    >
                      {m.avatar ? (
                        <img
                          src={m.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        m.name[0]
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p
                          className="text-sm text-foreground dark:text-foreground truncate"
                          style={{ fontWeight: 500 }}
                        >
                          {m.name}
                        </p>
                        {m.onTrack ? (
                          <CheckCircle className="w-4 h-4 text-primary dark:text-primary flex-shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                        Gastos: {formatCurrency(m.memberExpenses)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      <QuickAddFAB />
    </div>
  );
}
