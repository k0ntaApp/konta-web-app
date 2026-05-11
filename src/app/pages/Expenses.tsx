import { useState, useMemo } from "react";
import { useApp, Expense } from "../context/AppContext";
import { toast } from "sonner";
import { Plus, Search, Trash2, Pencil, TrendingDown, X, ArrowUpDown, FolderPlus } from "lucide-react";
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
  "Alimentação",
  "Moradia",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Vestuário",
  "Serviços",
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

interface ExpenseFormData {
  description: string;
  amount: string;
  category: string;
  date: string;
  member: string;
}

export function ExpensesPage() {
  const { expenses, addExpense, editExpense, deleteExpense, setup, customCategories, addCustomCategory, deleteCustomCategory } = useApp();
  const now = new Date();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
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
  const [form, setForm] = useState<ExpenseFormData>({
    description: "",
    amount: "",
    category: "Alimentação",
    date: now.toISOString().split("T")[0],
    member: setup?.ownerName ?? "",
  });

  const customExpenseCategories = customCategories.filter(c => c.type === 'expense');
  const allCategories = [...CATEGORIES, ...customExpenseCategories.map(c => c.name)];
  const members = setup?.members ?? [];

  const filteredExpenses = useMemo(() => {
    let result = expenses
      .filter((e) => {
        const d = new Date(e.date);
        const matchMonth =
          filterMonth === "" || d.getMonth() === parseInt(filterMonth);
        const matchYear =
          filterYear === "" || d.getFullYear() === parseInt(filterYear);
        const matchCat = !filterCategory || e.category === filterCategory;
        const matchSearch =
          !search ||
          e.description.toLowerCase().includes(search.toLowerCase()) ||
          e.member.toLowerCase().includes(search.toLowerCase());
        return matchMonth && matchYear && matchCat && matchSearch;
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
  }, [expenses, filterMonth, filterYear, filterCategory, search, sortBy, sortOrder]);

  const totalFiltered = useMemo(
    () => filteredExpenses.reduce((s, e) => s + e.amount, 0),
    [filteredExpenses],
  );

  const openAdd = () => {
    setForm({
      description: "",
      amount: "",
      category: "Alimentação",
      date: now.toISOString().split("T")[0],
      member: setup?.ownerName ?? "",
    });
    setFormErrors({});
    setModalStep(1);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (e: Expense) => {
    setForm({
      description: e.description,
      amount: e.amount.toString(),
      category: e.category,
      date: new Date(e.date).toISOString().split("T")[0],
      member: e.member,
    });
    setModalStep(1);
    setEditingId(e.id);
    setShowModal(true);
  };

  const handleSave = () => {
    const errors: Record<string, string> = {};
    if (!form.description) errors.description = "Informe uma descrição.";
    if (!form.amount) errors.amount = "Informe o valor.";
    if (!form.date) errors.date = "Informe a data.";
    const parsedAmount = parseFloat(form.amount);
    if (form.amount && (isNaN(parsedAmount) || parsedAmount <= 0))
      errors.amount = "Digite um valor maior que zero.";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    const data = {
      description: form.description,
      amount: parsedAmount,
      category: form.category,
      date: new Date(form.date).toISOString(),
      member: form.member,
    };
    if (editingId) {
      editExpense(editingId, data);
      toast.success("Despesa atualizada!");
    } else {
      addExpense(data);
      toast.success("Despesa adicionada!");
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
    if (CATEGORIES.includes(newCategoryName) || customExpenseCategories.some(c => c.name === newCategoryName)) {
      toast.error("Esta categoria já existe.");
      return;
    }
    addCustomCategory({ name: newCategoryName.trim(), type: 'expense' });
    setNewCategoryName("");
    toast.success("Categoria adicionada!");
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    deleteExpense(deleteConfirmId);
    toast.success("Despesa excluída.");
    setDeleteConfirmId(null);
  };

  const years = Array.from(
    new Set(expenses.map((e) => new Date(e.date).getFullYear())),
  ).sort((a, b) => b - a);
  if (!years.includes(now.getFullYear())) years.unshift(now.getFullYear());

  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredExpenses]);

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
            Despesas
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground text-sm mt-0.5">
            Gerencie todos os gastos da família
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary dark:bg-primary text-white hover:bg-primary/90 dark:hover:bg-violet-600 transition-colors text-sm"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          Nova despesa
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total filtrado", value: formatCurrency(totalFiltered) },
          { label: "Lançamentos", value: filteredExpenses.length.toString() },
          categoryTotals[0]
            ? {
                label: "Maior gasto",
                value: categoryTotals[0][0],
                sub: formatCurrency(categoryTotals[0][1]),
              }
            : null,
          { label: "Média por dia", value: formatCurrency(totalFiltered / 30) },
        ]
          .filter(Boolean)
          .map((card, i) => (
            <div
              key={i}
              className="bg-card dark:bg-card rounded-2xl p-3 sm:p-4 border border-border dark:border-white/[0.06] shadow-sm"
            >
              <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-1">
                {card!.label}
              </p>
              <p
                className="text-lg sm:text-xl text-foreground truncate"
                style={{ fontWeight: 700 }}
                title={card!.value}
              >
                {card!.value}
              </p>
              {card!.sub && (
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                  {card!.sub}
                </p>
              )}
            </div>
          ))}
      </div>

      {/* Filters */}
      <div className="bg-card dark:bg-card rounded-2xl p-4 border border-border dark:border-white/[0.06] shadow-sm mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar despesa..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-sm text-foreground dark:text-foreground focus:outline-none focus:border-primary dark:focus:border-violet-500 placeholder:text-muted-foreground dark:placeholder:text-zinc-500"
            />
          </div>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-sm text-foreground dark:text-foreground focus:outline-none focus:border-primary"
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
            className="px-3 py-2 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-sm text-foreground dark:text-foreground focus:outline-none focus:border-primary"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-sm text-foreground dark:text-foreground focus:outline-none focus:border-primary"
          >
            <option value="">Todas as categorias</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
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
          {(search || filterCategory) && (
            <button
              onClick={() => {
                setSearch("");
                setFilterCategory("");
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 text-red-500 text-sm hover:bg-red-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Expenses table */}
      <div className="bg-card dark:bg-card rounded-2xl border border-border dark:border-white/[0.06] shadow-sm overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16">
            <TrendingDown className="w-12 h-12 mx-auto mb-3 text-muted-foreground dark:text-muted-foreground opacity-30" />
            <p
              className="text-muted-foreground dark:text-muted-foreground"
              style={{ fontWeight: 500 }}
            >
              Nenhuma despesa encontrada
            </p>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
              Ajuste os filtros ou adicione uma nova despesa.
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
                {filteredExpenses.map((expense, i) => (
                  <tr
                    key={expense.id}
                    className={`border-b border-border dark:border-white/[0.04] hover:bg-background dark:hover:bg-muted/50 transition-colors ${i === filteredExpenses.length - 1 ? "border-b-0" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p
                        className="text-sm text-foreground dark:text-foreground"
                        style={{ fontWeight: 500 }}
                      >
                        {expense.description}
                      </p>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground md:hidden">
                        {expense.category}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span
                        className="inline-flex px-2.5 py-1 rounded-full text-xs"
                        style={{
                          fontWeight: 500,
                          backgroundColor: "var(--background)",
                          color: "#16a34a",
                        }}
                      >
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground dark:text-muted-foreground hidden lg:table-cell">
                      {expense.member}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground dark:text-muted-foreground hidden sm:table-cell">
                      {new Date(expense.date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className="text-sm text-foreground dark:text-foreground"
                        style={{ fontWeight: 600 }}
                      >
                        {formatCurrency(expense.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(expense)}
                          className="p-2.5 rounded-lg text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary hover:bg-background dark:hover:bg-muted transition-colors"
                          title="Editar despesa"
                          aria-label="Editar despesa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-2.5 rounded-lg text-muted-foreground dark:text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Excluir despesa"
                          aria-label="Excluir despesa"
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
                {customExpenseCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground italic">Nenhuma categoria personalizada</p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {customExpenseCategories.map((cat) => (
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir despesa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A despesa será removida
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-card dark:bg-card rounded-2xl shadow-xl w-full max-w-md border border-border dark:border-white/[0.08]">
            <div className="flex items-center justify-between p-6 border-b border-border dark:border-white/[0.06]">
              <h2
                className="text-lg text-foreground"
                style={{ fontWeight: 700 }}
              >
                {editingId ? "Editar despesa" : "Nova despesa"}
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
                    modalStep >= 1 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  }`}
                  style={{ fontWeight: 700 }}
                >
                  1
                </div>
                <div className={`flex-1 h-0.5 ${modalStep >= 2 ? "bg-primary" : "bg-border"}`} />
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                    modalStep >= 2 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
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
                      placeholder="Ex: Supermercado"
                      className={`${inputCls} ${formErrors.description ? "border-red-400 dark:border-red-500" : ""}`}
                      autoFocus
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.description}</p>
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
                        <p className="mt-1 text-xs text-red-500">{formErrors.amount}</p>
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
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className={inputCls}
                    >
                      <optgroup label="Padrão">
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </optgroup>
                      {customExpenseCategories.length > 0 && (
                        <optgroup label="Personalizadas">
                          {customExpenseCategories.map((c) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
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
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>
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
                      if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
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
    </div>
  );
}
