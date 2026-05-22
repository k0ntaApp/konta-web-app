import { useState, useMemo } from "react";
import { useApp, Income } from "../context/AppContext";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  TrendingUp,
  X,
  RefreshCw,
  ArrowUpDown,
  FolderPlus,
} from "lucide-react";
import { CurrencyInput } from "../components/ui/CurrencyInput";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

const CATEGORIES = [
  "Salário",
  "Autônomo",
  "Freelance",
  "Aluguel",
  "Investimentos",
  "Benefícios",
  "Outros",
];
const MONTHS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function formatCurrency(v: number, compact = false) {
  if (compact && v >= 10000) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  }
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface IncomeForm {
  description: string;
  amount: string;
  category: string;
  date: string;
  member: string;
  isRecurring: boolean;
}

export function IncomePage() {
  const { incomes, addIncome, editIncome, deleteIncome, setup, customCategories, addCustomCategory, deleteCustomCategory } = useApp();
  const now = new Date();

  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState(now.getMonth().toString());
  const [filterYear, setFilterYear] = useState(now.getFullYear().toString());
  const [sortBy, setSortBy] = useState<"date" | "value" | "category">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<IncomeForm>({
    description: "",
    amount: "",
    category: "Salário",
    date: now.toISOString().split("T")[0],
    member: setup?.ownerName ?? "",
    isRecurring: false,
  });

  const customIncomeCategories = customCategories.filter(c => c.type === 'income');
  const allCategories = [...CATEGORIES, ...customIncomeCategories.map(c => c.name)];
  const members = setup?.members ?? [];

  const filteredIncomes = useMemo(() => {
    let result = incomes
      .filter((i) => {
        const d = new Date(i.date);
        const matchMonth =
          filterMonth === "" || d.getMonth() === parseInt(filterMonth);
        const matchYear =
          filterYear === "" || d.getFullYear() === parseInt(filterYear);
        const matchSearch =
          !search ||
          i.description.toLowerCase().includes(search.toLowerCase()) ||
          i.member.toLowerCase().includes(search.toLowerCase());
        return matchMonth && matchYear && matchSearch;
      });

    result.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'value') {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      } else {
        return sortOrder === 'desc'
          ? b.category.localeCompare(a.category)
          : a.category.localeCompare(b.category);
      }
    });

    return result;
  }, [incomes, filterMonth, filterYear, search, sortBy, sortOrder]);

  const totalFiltered = useMemo(
    () => filteredIncomes.reduce((s, i) => s + i.amount, 0),
    [filteredIncomes],
  );

  const memberTotals = useMemo(() => {
    const map: Record<string, number> = {};
    filteredIncomes.forEach((i) => {
      map[i.member] = (map[i.member] ?? 0) + i.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredIncomes]);

  const openAdd = () => {
    setForm({
      description: "",
      amount: "",
      category: "Salário",
      date: now.toISOString().split("T")[0],
      member: setup?.ownerName ?? "",
      isRecurring: false,
    });
    setFormErrors({});
    setModalStep(1);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (i: Income) => {
    setForm({
      description: i.description,
      amount: i.amount.toString(),
      category: i.category,
      date: new Date(i.date).toISOString().split("T")[0],
      member: i.member,
      isRecurring: i.isRecurring,
    });
    setModalStep(1);
    setEditingId(i.id);
    setShowModal(true);
  };

  const handleSave = () => {
    const errors: Record<string, string> = {};
    if (!form.description) errors.description = "Informe uma descrição.";
    if (!form.amount) errors.amount = "Informe o valor.";
    if (!form.date) errors.date = "Informe a data.";
    const amount = parseFloat(form.amount);
    if (form.amount && (isNaN(amount) || amount <= 0))
      errors.amount = "Digite um valor maior que zero.";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    const data = {
      description: form.description,
      amount,
      category: form.category,
      date: new Date(form.date).toISOString(),
      member: form.member,
      isRecurring: form.isRecurring,
    };
    if (editingId) {
      editIncome(editingId, data);
      toast.success("Receita atualizada!");
    } else {
      addIncome(data);
      toast.success("Receita adicionada!");
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Digite um nome para a categoria.");
      return;
    }
    if (CATEGORIES.includes(newCategoryName) || customIncomeCategories.some(c => c.name === newCategoryName)) {
      toast.error("Esta categoria já existe.");
      return;
    }
    addCustomCategory({ name: newCategoryName.trim(), type: 'income' });
    setNewCategoryName("");
    toast.success("Categoria adicionada!");
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    deleteIncome(deleteConfirmId);
    toast.success("Receita excluída.");
    setDeleteConfirmId(null);
  };

  const years = Array.from(
    new Set(incomes.map((i) => new Date(i.date).getFullYear())),
  ).sort((a, b) => b - a);
  if (!years.includes(now.getFullYear())) years.unshift(now.getFullYear());

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-foreground dark:text-foreground text-sm focus:outline-none focus:border-primary dark:focus:border-violet-500";

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl text-foreground"
            style={{ fontWeight: 700 }}
          >
            Receitas
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground text-sm mt-0.5">
            Registre e acompanhe todas as entradas de dinheiro
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-3 rounded-xl bg-primary dark:bg-primary text-white hover:bg-primary/90 dark:hover:bg-violet-600 transition-colors text-xs sm:text-sm"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Nova receita</span>
          <span className="inline xs:hidden">Nova</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card dark:bg-card rounded-2xl p-4 border border-border dark:border-white/[0.06] shadow-sm">
          <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-1">
            Total do período
          </p>
          <p
            className="text-lg sm:text-xl text-foreground truncate"
            style={{ fontWeight: 700 }}
            title={formatCurrency(totalFiltered)}
          >
            {formatCurrency(totalFiltered)}
          </p>
        </div>
        <div className="bg-card dark:bg-card rounded-2xl p-4 border border-border dark:border-white/[0.06] shadow-sm">
          <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-1">
            Registros
          </p>
          <p
            className="text-xl text-foreground"
            style={{ fontWeight: 700 }}
          >
            {filteredIncomes.length}
          </p>
        </div>
        <div className="bg-card dark:bg-card rounded-2xl p-4 border border-border dark:border-white/[0.06] shadow-sm">
          <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-1">
            Recorrentes
          </p>
          <p
            className="text-xl text-foreground"
            style={{ fontWeight: 700 }}
          >
            {filteredIncomes.filter((i) => i.isRecurring).length}
          </p>
        </div>
      </div>

      {/* Members total */}
      {memberTotals.length > 0 && (
        <div className="bg-card dark:bg-card rounded-2xl p-5 border border-border dark:border-white/[0.06] shadow-sm mb-6">
          <h3
            className="text-foreground mb-4"
            style={{ fontWeight: 700 }}
          >
            Receitas por membro
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {memberTotals.map(([name, total]) => {
              const member = members.find((m) => m.name === name);
              const pct = totalFiltered > 0 ? (total / totalFiltered) * 100 : 0;
              return (
                <div
                  key={name}
                  className="p-3 rounded-xl bg-background dark:bg-muted border border-border dark:border-white/[0.06]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs"
                      style={{
                        backgroundColor: member?.color ?? "#16a34a",
                        fontWeight: 600,
                      }}
                    >
                      {name[0]}
                    </div>
                    <p
                      className="text-xs text-foreground dark:text-foreground truncate"
                      style={{ fontWeight: 600 }}
                    >
                      {name.split(" ")[0]}
                    </p>
                  </div>
                  <p
                    className="text-sm text-foreground"
                    style={{ fontWeight: 700 }}
                  >
                    {formatCurrency(total)}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                    {pct.toFixed(0)}% do total
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card dark:bg-card rounded-2xl p-4 border border-border dark:border-white/[0.06] shadow-sm mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[120px] sm:min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar receita..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-sm text-foreground dark:text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground dark:placeholder:text-zinc-500"
            />
          </div>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="flex-1 min-w-0 sm:flex-none px-3 py-2 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-sm text-foreground dark:text-foreground focus:outline-none focus:border-primary"
          >
            <option value="">Todos os meses</option>
            {MONTHS_PT.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="flex-1 min-w-0 sm:flex-none px-3 py-2 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-sm text-foreground dark:text-foreground focus:outline-none focus:border-primary"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "value" | "category")}
              className="px-2 py-1.5 rounded-lg border border-border dark:border-border bg-background dark:bg-background text-sm text-foreground dark:text-foreground focus:outline-none focus:border-primary"
            >
              <option value="date">Data</option>
              <option value="value">Valor</option>
              <option value="category">Categoria</option>
            </select>
            <button
              onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1.5 rounded-lg border border-border dark:border-border bg-background dark:bg-background text-sm text-foreground dark:text-foreground hover:bg-accent dark:hover:bg-muted transition-colors"
              title={sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          <button
            onClick={() => setShowCategoryManager(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border dark:border-border bg-background dark:bg-background text-sm text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary hover:border-primary dark:hover:border-violet-500 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            Categorias
          </button>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 text-red-500 text-sm hover:bg-red-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card dark:bg-card rounded-2xl border border-border dark:border-white/[0.06] shadow-sm overflow-hidden">
        {filteredIncomes.length === 0 ? (
          <div className="text-center py-16">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-muted-foreground dark:text-muted-foreground opacity-30" />
            <p
              className="text-muted-foreground dark:text-muted-foreground"
              style={{ fontWeight: 500 }}
            >
              Nenhuma receita encontrada
            </p>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
              Adicione sua primeira receita.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border dark:border-white/[0.06] bg-background dark:bg-muted/50">
                  <th
                    className="text-left px-4 py-3 text-xs text-muted-foreground dark:text-muted-foreground uppercase tracking-wider"
                    style={{ fontWeight: 600 }}
                  >
                    Descrição
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs text-muted-foreground dark:text-muted-foreground uppercase tracking-wider hidden md:table-cell"
                    style={{ fontWeight: 600 }}
                  >
                    Categoria
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs text-muted-foreground dark:text-muted-foreground uppercase tracking-wider hidden lg:table-cell"
                    style={{ fontWeight: 600 }}
                  >
                    Membro
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs text-muted-foreground dark:text-muted-foreground uppercase tracking-wider hidden sm:table-cell"
                    style={{ fontWeight: 600 }}
                  >
                    Data
                  </th>
                  <th
                    className="text-right px-4 py-3 text-xs text-muted-foreground dark:text-muted-foreground uppercase tracking-wider"
                    style={{ fontWeight: 600 }}
                  >
                    Valor
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredIncomes.map((income, i) => (
                  <tr
                    key={income.id}
                    className={`border-b border-border dark:border-white/[0.04] hover:bg-background dark:hover:bg-muted/50 transition-colors ${i === filteredIncomes.length - 1 ? "border-b-0" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p
                          className="text-sm text-foreground dark:text-foreground"
                          style={{ fontWeight: 500 }}
                        >
                          {income.description}
                        </p>
                        {income.isRecurring && (
                          <span
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent dark:bg-muted text-primary dark:text-primary"
                            style={{ fontWeight: 500 }}
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            Fixo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground md:hidden">
                        {income.category}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span
                        className="inline-flex px-2.5 py-1 rounded-full text-xs bg-accent dark:bg-muted text-primary dark:text-primary"
                        style={{ fontWeight: 500 }}
                      >
                        {income.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground dark:text-muted-foreground hidden lg:table-cell">
                      {income.member}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground dark:text-muted-foreground hidden sm:table-cell">
                      {new Date(income.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className="text-sm text-primary dark:text-primary"
                        style={{ fontWeight: 600 }}
                      >
                        +{formatCurrency(income.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(income)}
                          className="p-2.5 rounded-lg text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary hover:bg-background dark:hover:bg-muted transition-colors"
                          title="Editar receita"
                          aria-label="Editar receita"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(income.id)}
                          className="p-2.5 rounded-lg text-muted-foreground dark:text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Excluir receita"
                          aria-label="Excluir receita"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-card dark:bg-card rounded-2xl shadow-xl w-full max-w-md border border-border dark:border-white/[0.08]">
            <div className="flex items-center justify-between p-6 border-b border-border dark:border-white/[0.06]">
              <h2 className="text-lg text-foreground" style={{ fontWeight: 700 }}>
                Gerenciar Categorias
              </h2>
              <button onClick={() => setShowCategoryManager(false)} className="p-2 rounded-lg text-muted-foreground dark:text-muted-foreground hover:bg-background dark:hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-foreground dark:text-foreground mb-1.5" style={{ fontWeight: 600 }}>
                  Nova categoria
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nome da categoria"
                    className="flex-1 px-4 py-2 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-sm text-foreground dark:text-foreground focus:outline-none focus:border-primary dark:focus:border-violet-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <button
                    onClick={handleAddCategory}
                    className="px-4 py-2 rounded-xl bg-primary dark:bg-primary text-white hover:bg-primary/90 dark:hover:bg-violet-600 transition-colors"
                    style={{ fontWeight: 600 }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-2">Categorias personalizadas</p>
                {customIncomeCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground italic">Nenhuma categoria personalizada</p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {customIncomeCategories.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg bg-background dark:bg-muted border border-border dark:border-white/[0.06]">
                        <span className="text-sm text-foreground dark:text-foreground">{cat.name}</span>
                        <button
                          onClick={() => {
                            deleteCustomCategory(cat.id);
                            toast.success("Categoria removida");
                          }}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-card dark:bg-card rounded-2xl shadow-xl w-full max-w-md border border-border dark:border-white/[0.08]">
            <div className="flex items-center justify-between p-6 border-b border-border dark:border-white/[0.06]">
              <h2
                className="text-lg text-foreground"
                style={{ fontWeight: 700 }}
              >
                {editingId ? "Editar receita" : "Nova receita"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-muted-foreground dark:text-muted-foreground hover:bg-background dark:hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Step indicator */}
            <div className="p-6 pb-0">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    modalStep >= 1
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                  style={{ fontWeight: 700 }}
                >
                  1
                </div>
                <div
                  className={`flex-1 h-0.5 ${
                    modalStep >= 2 ? "bg-primary" : "bg-border"
                  }`}
                />
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    modalStep >= 2
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                  style={{ fontWeight: 700 }}
                >
                  2
                </div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">Essencial</span>
                <span className="text-xs text-muted-foreground">Detalhes</span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {modalStep === 1 && (
                <>
                  <div>
                    <label
                      className="block text-sm text-foreground dark:text-foreground mb-1.5"
                      style={{ fontWeight: 600 }}
                    >
                      Descrição
                    </label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) => {
                        setForm({ ...form, description: e.target.value });
                        if (formErrors.description)
                          setFormErrors((prev) => ({ ...prev, description: "" }));
                      }}
                      placeholder="Ex: Salário de abril"
                      className={`${inputCls} ${formErrors.description ? "border-red-400 dark:border-red-500" : ""}`}
                      autoFocus
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-xs text-red-500">
                        {formErrors.description}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        className="block text-sm text-foreground dark:text-foreground mb-1.5"
                        style={{ fontWeight: 600 }}
                      >
                        Valor (R$)
                      </label>
                      <CurrencyInput
                        value={form.amount}
                        onChange={(v) => {
                          setForm({ ...form, amount: v });
                          if (formErrors.amount)
                            setFormErrors((prev) => ({ ...prev, amount: "" }));
                        }}
                        placeholder="0,00"
                        className={`${inputCls} ${formErrors.amount ? "border-red-400 dark:border-red-500" : ""}`}
                      />
                      {formErrors.amount && (
                        <p className="mt-1 text-xs text-red-500">
                          {formErrors.amount}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        className="block text-sm text-foreground dark:text-foreground mb-1.5"
                        style={{ fontWeight: 600 }}
                      >
                        Data
                      </label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </>
              )}
              {modalStep === 2 && (
                <>
                  <div>
                    <label
                      className="block text-sm text-foreground dark:text-foreground mb-1.5"
                      style={{ fontWeight: 600 }}
                    >
                      Categoria
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className={inputCls}
                    >
                      <optgroup label="Padrão">
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </optgroup>
                      {customIncomeCategories.length > 0 && (
                        <optgroup label="Personalizadas">
                          {customIncomeCategories.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-sm text-foreground dark:text-foreground mb-1.5"
                      style={{ fontWeight: 600 }}
                    >
                      Membro
                    </label>
                    <select
                      value={form.member}
                      onChange={(e) => setForm({ ...form, member: e.target.value })}
                      className={inputCls}
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() =>
                      setForm({ ...form, isRecurring: !form.isRecurring })
                    }
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                      ${
                        form.isRecurring
                          ? "border-primary dark:border-violet-500 bg-background dark:bg-muted"
                          : "border-border dark:border-border"
                      }`}
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${form.isRecurring ? "text-primary dark:text-primary" : "text-muted-foreground dark:text-muted-foreground"}`}
                    />
                    <span
                      className="text-sm text-foreground dark:text-foreground"
                      style={{ fontWeight: 500 }}
                    >
                      Receita recorrente (mensal)
                    </span>
                    <div
                      className={`ml-auto w-4 h-4 rounded-full flex items-center justify-center ${form.isRecurring ? "bg-primary dark:bg-primary" : "border-2 border-border dark:border-border"}`}
                    >
                      {form.isRecurring && (
                        <div className="w-2 h-2 rounded-full bg-card" />
                      )}
                    </div>
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-3 p-6 pt-0">
              {modalStep === 1 ? (
                <>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-xl border border-border dark:border-border text-muted-foreground dark:text-foreground hover:bg-background dark:hover:bg-muted text-sm"
                    style={{ fontWeight: 500 }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      const errors: Record<string, string> = {};
                      if (!form.description) errors.description = "Informe uma descrição.";
                      if (!form.amount) errors.amount = "Informe o valor.";
                      const amt = parseFloat(form.amount);
                      if (form.amount && (isNaN(amt) || amt <= 0))
                        errors.amount = "Digite um valor maior que zero.";
                      if (Object.keys(errors).length > 0) {
                        setFormErrors(errors);
                        return;
                      }
                      setFormErrors({});
                      setModalStep(2);
                    }}
                    className="flex-1 py-3 rounded-xl bg-primary dark:bg-primary text-white hover:bg-primary/90 dark:hover:bg-violet-600 text-sm"
                    style={{ fontWeight: 600 }}
                  >
                    Próximo →
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setModalStep(1)}
                    className="flex-1 py-3 rounded-xl border border-border dark:border-border text-muted-foreground dark:text-foreground hover:bg-background dark:hover:bg-muted text-sm"
                    style={{ fontWeight: 500 }}
                  >
                    ← Voltar
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-3 rounded-xl bg-primary dark:bg-primary text-white hover:bg-primary/90 dark:hover:bg-violet-600 text-sm"
                    style={{ fontWeight: 600 }}
                  >
                    {editingId ? "Salvar" : "Adicionar"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir receita?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A receita será removida
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
