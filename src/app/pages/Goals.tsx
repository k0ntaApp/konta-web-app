import { useState } from "react";
import { useApp, Goal } from "../context/AppContext";
import { toast } from "sonner";
import {
  Plus,
  Target,
  Trash2,
  Pencil,
  X,
  CheckCircle,
  Clock,
  PiggyBank,
  Plane,
  Car,
  BookOpen,
  ShoppingBag,
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

const GOAL_CATEGORIES = [
  { value: "reserva", label: "Reserva de emergência", icon: PiggyBank },
  { value: "viagem", label: "Viagem", icon: Plane },
  { value: "veiculo", label: "Veículo", icon: Car },
  { value: "educacao", label: "Educação", icon: BookOpen },
  { value: "compra", label: "Compra", icon: ShoppingBag },
  { value: "outro", label: "Outro", icon: Target },
];

const GOAL_COLORS = [
  "#16a34a",
  "#0ea5e9",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
];

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface GoalForm {
  title: string;
  description: string;
  targetAmount: string;
  currentAmount: string;
  deadline: string;
  category: string;
  color: string;
}

export function GoalsPage() {
  const { goals, addGoal, editGoal, deleteGoal, updateGoalProgress } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [addingProgress, setAddingProgress] = useState<string | null>(null);
  const [progressAmount, setProgressAmount] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);
  const [form, setForm] = useState<GoalForm>({
    title: "",
    description: "",
    targetAmount: "",
    currentAmount: "0",
    deadline: "",
    category: "reserva",
    color: "#16a34a",
  });

  const completedGoals = goals.filter((g) => g.currentAmount >= g.targetAmount);
  const activeGoals = goals.filter((g) => g.currentAmount < g.targetAmount);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  const openAdd = () => {
    setForm({
      title: "",
      description: "",
      targetAmount: "",
      currentAmount: "0",
      deadline: "",
      category: "reserva",
      color: "#16a34a",
    });
    setShowOptional(false);
    setShowAllColors(false);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (g: Goal) => {
    setForm({
      title: g.title,
      description: g.description ?? "",
      targetAmount: g.targetAmount.toString(),
      currentAmount: g.currentAmount.toString(),
      deadline: g.deadline ?? "",
      category: g.category,
      color: g.color,
    });
    setShowOptional(!!(g.description || g.currentAmount > 0 || g.deadline));
    setShowAllColors(false);
    setEditingId(g.id);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title || !form.targetAmount) {
      toast.error("Preencha título e valor alvo.");
      return;
    }
    const targetAmount = parseFloat(form.targetAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      toast.error("Digite um valor alvo válido.");
      return;
    }
    const data = {
      title: form.title,
      description: form.description,
      targetAmount,
      currentAmount: parseFloat(form.currentAmount) || 0,
      deadline: form.deadline || undefined,
      category: form.category,
      color: form.color,
    };
    if (editingId) {
      editGoal(editingId, data);
      toast.success("Meta atualizada!");
    } else {
      addGoal(data);
      toast.success("Meta criada!");
    }
    setShowModal(false);
  };

  const handleAddProgress = (goalId: string) => {
    const amount = parseFloat(progressAmount);
    if (!amount || amount <= 0) {
      toast.error("Digite um valor válido.");
      return;
    }
    updateGoalProgress(goalId, amount);
    toast.success(
      `R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} adicionados à meta!`,
    );
    setAddingProgress(null);
    setProgressAmount("");
  };

  const handleDelete = (goalId: string) => {
    setDeleteConfirmId(goalId);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    deleteGoal(deleteConfirmId);
    toast.success("Meta excluída.");
    setDeleteConfirmId(null);
  };

  const getCategoryIcon = (category: string) => {
    const cat = GOAL_CATEGORIES.find((c) => c.value === category);
    return cat?.icon ?? Target;
  };

  const getCategoryLabel = (category: string) => {
    return GOAL_CATEGORIES.find((c) => c.value === category)?.label ?? category;
  };

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
            Metas financeiras
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground text-sm mt-0.5">
            Defina objetivos e acompanhe o progresso
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary dark:bg-primary text-white hover:bg-primary/90 dark:hover:bg-violet-600 transition-colors text-sm"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          Nova meta
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card dark:bg-card rounded-2xl p-4 border border-border dark:border-white/[0.06] shadow-sm">
          <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-1">
            Total de metas
          </p>
          <p
            className="text-xl text-foreground"
            style={{ fontWeight: 700 }}
          >
            {goals.length}
          </p>
        </div>
        <div className="bg-card dark:bg-card rounded-2xl p-4 border border-border dark:border-white/[0.06] shadow-sm">
          <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-1">
            Em andamento
          </p>
          <p
            className="text-xl text-foreground"
            style={{ fontWeight: 700 }}
          >
            {activeGoals.length}
          </p>
        </div>
        <div className="bg-card dark:bg-card rounded-2xl p-4 border border-border dark:border-white/[0.06] shadow-sm">
          <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-1">
            Concluídas
          </p>
          <p
            className="text-xl text-primary dark:text-primary"
            style={{ fontWeight: 700 }}
          >
            {completedGoals.length}
          </p>
        </div>
        <div className="bg-card dark:bg-card rounded-2xl p-4 border border-border dark:border-white/[0.06] shadow-sm">
          <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-1">
            Total guardado
          </p>
          <p
            className="text-xl text-foreground"
            style={{ fontWeight: 700 }}
          >
            {formatCurrency(totalSaved)}
          </p>
          <p className="text-xs text-muted-foreground dark:text-muted-foreground">
            de {formatCurrency(totalTarget)}
          </p>
        </div>
      </div>

      {/* Overall progress */}
      {goals.length > 0 && (
        <div className="bg-card dark:bg-card rounded-2xl p-5 border border-border dark:border-white/[0.06] shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-foreground"
              style={{ fontWeight: 700 }}
            >
              Progresso geral
            </h3>
            <span
              className="text-sm text-primary dark:text-primary"
              style={{ fontWeight: 600 }}
            >
              {totalTarget > 0
                ? ((totalSaved / totalTarget) * 100).toFixed(1)
                : 0}
              %
            </span>
          </div>
          <div className="w-full h-3 bg-background dark:bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary dark:bg-primary rounded-full transition-all duration-700"
              style={{
                width: `${totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0}%`,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-2">
            {formatCurrency(totalSaved)} guardado de{" "}
            {formatCurrency(totalTarget)}
          </p>
        </div>
      )}

      {/* Goals grid */}
      {goals.length === 0 ? (
        <div className="bg-card dark:bg-card rounded-2xl p-12 border border-border dark:border-white/[0.06] shadow-sm text-center">
          <Target className="w-14 h-14 mx-auto mb-4 text-muted-foreground dark:text-muted-foreground opacity-30" />
          <h3
            className="text-foreground mb-2"
            style={{ fontWeight: 700 }}
          >
            Nenhuma meta criada
          </h3>
          <p className="text-muted-foreground dark:text-muted-foreground mb-6 text-sm">
            Crie sua primeira meta financeira para começar a economizar.
          </p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary dark:bg-primary text-white hover:bg-primary/90 dark:hover:bg-violet-600 transition-colors text-sm"
            style={{ fontWeight: 600 }}
          >
            <Plus className="w-4 h-4" />
            Criar primeira meta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const pct = Math.min(
              100,
              (goal.currentAmount / goal.targetAmount) * 100,
            );
            const isComplete = goal.currentAmount >= goal.targetAmount;
            const Icon = getCategoryIcon(goal.category);
            const remaining = goal.targetAmount - goal.currentAmount;
            const daysLeft = goal.deadline
              ? Math.ceil(
                  (new Date(goal.deadline).getTime() - Date.now()) / 86400000,
                )
              : null;

            return (
              <div
                key={goal.id}
                className={`bg-card dark:bg-card rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md ${isComplete ? "border-primary/30 dark:border-violet-500/30" : "border-border dark:border-white/[0.06]"}`}
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${goal.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: goal.color }} />
                    </div>
                    <div>
                      <h3
                        className="text-sm text-foreground dark:text-foreground"
                        style={{ fontWeight: 700 }}
                      >
                        {goal.title}
                      </h3>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                        {getCategoryLabel(goal.category)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isComplete && (
                      <CheckCircle className="w-4 h-4 text-primary dark:text-primary" />
                    )}
                    <button
                      onClick={() => openEdit(goal)}
                      className="p-2.5 rounded-lg text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary hover:bg-background dark:hover:bg-muted transition-colors"
                      title="Editar meta"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2.5 rounded-lg text-muted-foreground dark:text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Excluir meta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-3">
                    {goal.description}
                  </p>
                )}

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between mb-1.5">
                    <span
                      className="text-sm text-foreground dark:text-foreground"
                      style={{ fontWeight: 700 }}
                    >
                      {formatCurrency(goal.currentAmount)}
                    </span>
                    <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-background dark:bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: goal.color }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                      {isComplete
                        ? "✅ Concluída!"
                        : `Faltam ${formatCurrency(remaining)}`}
                    </span>
                    <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                      {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                </div>

                {/* Deadline */}
                {goal.deadline && daysLeft !== null && !isComplete && (
                  <div
                    className={`flex items-center gap-1.5 text-xs mb-3 ${daysLeft < 30 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground dark:text-muted-foreground"}`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {daysLeft > 0
                      ? `${daysLeft} dias restantes`
                      : "Prazo expirado"}
                  </div>
                )}

                {/* Add progress */}
                {!isComplete &&
                  (addingProgress === goal.id ? (
                    <div className="flex gap-2">
                      <CurrencyInput
                        value={progressAmount}
                        onChange={(v) => setProgressAmount(v)}
                        placeholder="Valor (R$)"
                        className="flex-1 px-3 py-2 rounded-lg border border-border dark:border-border bg-background dark:bg-background text-sm text-foreground dark:text-foreground focus:outline-none focus:border-primary dark:focus:border-violet-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleAddProgress(goal.id)}
                        className="px-4 py-3 rounded-lg bg-primary dark:bg-primary text-white text-sm hover:bg-primary/90 dark:hover:bg-violet-600 transition-colors"
                        style={{ fontWeight: 600 }}
                      >
                        OK
                      </button>
                      <button
                        onClick={() => {
                          setAddingProgress(null);
                          setProgressAmount("");
                        }}
                        className="px-4 py-3 rounded-lg border border-border dark:border-border text-muted-foreground dark:text-muted-foreground text-sm hover:bg-background dark:hover:bg-muted transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAddingProgress(goal.id);
                        setProgressAmount("");
                      }}
                      className="w-full py-2 rounded-lg border-2 border-dashed text-sm transition-colors hover:bg-background dark:hover:bg-muted"
                      style={{
                        borderColor: goal.color,
                        color: goal.color,
                        fontWeight: 500,
                      }}
                    >
                      + Adicionar valor
                    </button>
                  ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir meta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A meta e todo o progresso serão
              removidos permanentemente.
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
                {editingId ? "Editar meta" : "Nova meta"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-muted-foreground dark:text-muted-foreground hover:bg-background dark:hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label
                  className="block text-sm text-foreground dark:text-foreground mb-1.5"
                  style={{ fontWeight: 600 }}
                >
                  Título da meta
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Reserva de emergência"
                  className={inputCls}
                  autoFocus
                />
              </div>
              <div>
                <label
                  className="block text-sm text-foreground dark:text-foreground mb-1.5"
                  style={{ fontWeight: 600 }}
                >
                  Valor alvo (R$)
                </label>
                <CurrencyInput
                  value={form.targetAmount}
                  onChange={(v) => setForm({ ...form, targetAmount: v })}
                  placeholder="0,00"
                  className={inputCls}
                />
              </div>
              <div>
                <label
                  className="block text-sm text-foreground dark:text-foreground mb-2"
                  style={{ fontWeight: 600 }}
                >
                  Categoria
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {GOAL_CATEGORIES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setForm({ ...form, category: value })}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all
                        ${
                          form.category === value
                            ? "border-primary dark:border-violet-500 bg-background dark:bg-muted"
                            : "border-border dark:border-border hover:border-primary/50 dark:hover:border-violet-500/50"
                        }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${form.category === value ? "text-primary dark:text-primary" : "text-muted-foreground dark:text-muted-foreground"}`}
                      />
                      <span className="text-xs text-foreground dark:text-foreground text-center leading-tight">
                        {label.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label
                  className="block text-sm text-foreground dark:text-foreground mb-2"
                  style={{ fontWeight: 600 }}
                >
                  Cor
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(showAllColors ? GOAL_COLORS : GOAL_COLORS.slice(0, 4)).map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm({ ...form, color: c })}
                      className={`w-10 h-10 rounded-full transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-primary dark:ring-violet-500 scale-110" : "hover:scale-110"}`}
                      style={{ backgroundColor: c }}
                      title={c}
                      aria-label={`Cor ${c}`}
                    />
                  ))}
                  {!showAllColors && (
                    <button
                      onClick={() => setShowAllColors(true)}
                      className="w-10 h-10 rounded-full border-2 border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center"
                    >
                      +{GOAL_COLORS.length - 4}
                    </button>
                  )}
                </div>
              </div>

              {/* Optional fields */}
              <button
                onClick={() => setShowOptional((v) => !v)}
                className="flex items-center gap-2 w-full text-sm text-muted-foreground hover:text-primary transition-colors py-1"
                style={{ fontWeight: 500 }}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  showOptional ? "border-primary bg-primary" : "border-border"
                }`}>
                  {showOptional && <div className="w-2 h-0.5 bg-white rounded" />}
                </div>
                Detalhes opcionais (descrição, valor guardado, prazo)
              </button>

              {showOptional && (
                <>
                  <div>
                    <label
                      className="block text-sm text-foreground dark:text-foreground mb-1.5"
                      style={{ fontWeight: 600 }}
                    >
                      Descrição{" "}
                      <span className="text-muted-foreground" style={{ fontWeight: 400 }}>opcional</span>
                    </label>
                    <input
                      type="text"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Ex: 3 meses de despesas guardados"
                      className={inputCls}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        className="block text-sm text-foreground dark:text-foreground mb-1.5"
                        style={{ fontWeight: 600 }}
                      >
                        Já guardou (R$)
                      </label>
                      <CurrencyInput
                        value={form.currentAmount}
                        onChange={(v) => setForm({ ...form, currentAmount: v })}
                        placeholder="0,00"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm text-foreground dark:text-foreground mb-1.5"
                        style={{ fontWeight: 600 }}
                      >
                        Prazo{" "}
                        <span className="text-muted-foreground" style={{ fontWeight: 400 }}>opcional</span>
                      </label>
                      <input
                        type="date"
                        value={form.deadline}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border border-border dark:border-border text-muted-foreground dark:text-foreground hover:bg-background dark:hover:bg-muted text-sm"
                style={{ fontWeight: 500 }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl bg-primary dark:bg-primary text-white hover:bg-primary/90 dark:hover:bg-violet-600 text-sm"
                style={{ fontWeight: 600 }}
              >
                {editingId ? "Salvar" : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
