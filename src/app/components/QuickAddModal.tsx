import { useState } from "react";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";
import {
  Plus,
  X,
  TrendingDown,
  TrendingUp,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { CurrencyInput } from "../components/ui/CurrencyInput";

const DEFAULT_EXPENSE_CATEGORIES = [
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

const DEFAULT_INCOME_CATEGORIES = [
  "Salário",
  "Autônomo",
  "Freelance",
  "Aluguel",
  "Investimentos",
  "Benefícios",
  "Outros",
];

const INSTALLMENT_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24];

interface QuickAddModalProps {
  type: "expense" | "income";
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddModal({ type, isOpen, onClose }: QuickAddModalProps) {
  const { addExpense, addIncome, addInstallmentExpense, setup, customCategories } = useApp();
  const now = new Date();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(
    type === "expense" ? "Alimentação" : "Salário"
  );
  const [date, setDate] = useState(now.toISOString().split("T")[0]);
  const [member, setMember] = useState(setup?.ownerName ?? "");
  const [isRecurring, setIsRecurring] = useState(false);
  const [isInstallment, setIsInstallment] = useState(false);
  const [installments, setInstallments] = useState(2);
  const [step, setStep] = useState<1 | 2>(1);

  const members = setup?.members ?? [];

  const customExpenseCategories = customCategories.filter(
    (c) => c.type === "expense"
  );
  const customIncomeCategories = customCategories.filter(
    (c) => c.type === "income"
  );

  const allExpenseCategories = [
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...customExpenseCategories.map((c) => c.name),
  ];
  const allIncomeCategories = [
    ...DEFAULT_INCOME_CATEGORIES,
    ...customIncomeCategories.map((c) => c.name),
  ];

  const categories =
    type === "expense" ? allExpenseCategories : allIncomeCategories;

  const handleClose = () => {
    setDescription("");
    setAmount("");
    setCategory(type === "expense" ? "Alimentação" : "Salário");
    setDate(now.toISOString().split("T")[0]);
    setMember(setup?.ownerName ?? "");
    setIsRecurring(false);
    setIsInstallment(false);
    setInstallments(2);
    setStep(1);
    onClose();
  };

  const parsedAmount = parseFloat(amount);

  const handleSave = () => {
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Digite um valor válido");
      return;
    }
    if (!description) {
      toast.error("Informe uma descrição");
      return;
    }

    if (type === "expense") {
      if (isInstallment && installments >= 2) {
        addInstallmentExpense(
          {
            description,
            amount: parsedAmount,
            category,
            date: new Date(date + "T12:00:00").toISOString(),
            member: member || setup?.ownerName || "Usuário",
          },
          installments
        );
        toast.success(`Despesa parcelada em ${installments}x adicionada!`);
      } else {
        addExpense({
          description: description || "Despesa rápida",
          amount: parsedAmount,
          category,
          date: new Date(date + "T12:00:00").toISOString(),
          member: member || setup?.ownerName || "Usuário",
        });
        toast.success("Despesa adicionada!");
      }
    } else {
      addIncome({
        description: description || "Receita rápida",
        amount: parsedAmount,
        category,
        date: new Date(date + "T12:00:00").toISOString(),
        member: member || setup?.ownerName || "Usuário",
        isRecurring,
      });
      toast.success("Receita adicionada!");
    }

    handleClose();
  };

  if (!isOpen) return null;

  const isExpense = type === "expense";
  const accentColor = isExpense ? "text-red-500" : "text-primary";
  const accentBg = isExpense
    ? "bg-red-100 dark:bg-red-950/30"
    : "bg-accent dark:bg-primary/10";
  const primaryBtn = isExpense
    ? "bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600"
    : "bg-primary hover:bg-primary/90 dark:hover:bg-violet-600";

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-foreground dark:text-foreground text-sm focus:outline-none focus:border-primary dark:focus:border-violet-500 transition-colors";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-card dark:bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md border border-border dark:border-white/[0.08] max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border dark:border-white/[0.06] sticky top-0 bg-card dark:bg-card z-10">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl ${accentBg} flex items-center justify-center flex-shrink-0`}
            >
              {isExpense ? (
                <TrendingDown className={`w-4 h-4 ${accentColor}`} />
              ) : (
                <TrendingUp className={`w-4 h-4 ${accentColor}`} />
              )}
            </div>
            <div>
              <p
                className="text-foreground text-base"
                style={{ fontWeight: 700 }}
              >
                {isExpense ? "Nova Despesa" : "Nova Receita"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isExpense ? "Registrar um gasto" : "Registrar uma entrada"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-muted-foreground hover:bg-accent dark:hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Tabs */}
        <div className="flex border-b border-border dark:border-white/[0.06]">
          <button
            onClick={() => setStep(1)}
            className={`flex-1 py-2.5 text-sm transition-all ${
              step === 1
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            style={{ fontWeight: step === 1 ? 600 : 400 }}
          >
            Essencial
          </button>
          <button
            onClick={() => {
              if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) return;
              if (!description) return;
              setStep(2);
            }}
            className={`flex-1 py-2.5 text-sm transition-all ${
              step === 2
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            style={{ fontWeight: step === 2 ? 600 : 400 }}
          >
            Detalhes
          </button>
        </div>

        <div className="p-5 space-y-4">
          {step === 1 && (
            <>
              {/* Amount */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block" style={{ fontWeight: 600 }}>
                  VALOR
                </label>
                <CurrencyInput
                  value={amount}
                  onChange={setAmount}
                  placeholder="0,00"
                  className="w-full px-4 py-4 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-foreground text-2xl font-bold focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block" style={{ fontWeight: 600 }}>
                  DESCRIÇÃO
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    isExpense ? "Ex: Supermercado, Uber..." : "Ex: Salário, Freela..."
                  }
                  className={inputCls}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && amount && description) setStep(2);
                  }}
                />
              </div>

              {/* Date */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block" style={{ fontWeight: 600 }}>
                  DATA
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Category chips */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block" style={{ fontWeight: 600 }}>
                  CATEGORIA
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {categories.slice(0, 6).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        category === cat
                          ? isExpense
                            ? "bg-red-500 text-white"
                            : "bg-primary dark:bg-primary text-white"
                          : "bg-muted dark:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  {categories.length > 6 && (
                    <button
                      onClick={() => setStep(2)}
                      className="px-2.5 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-all"
                    >
                      + mais
                    </button>
                  )}
                </div>
              </div>

              {/* Installment toggle (expense only) */}
              {isExpense && (
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block" style={{ fontWeight: 600 }}>
                    OPÇÕES
                  </label>
                  <button
                    onClick={() => {
                      setIsInstallment((v) => !v);
                    }}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                      isInstallment
                        ? "border-orange-400 dark:border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                        : "border-border dark:border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isInstallment
                          ? "bg-orange-100 dark:bg-orange-900/30"
                          : "bg-muted dark:bg-muted"
                      }`}
                    >
                      <CreditCard
                        className={`w-4 h-4 ${
                          isInstallment
                            ? "text-orange-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm ${
                          isInstallment
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-foreground"
                        }`}
                        style={{ fontWeight: 600 }}
                      >
                        Parcelado
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isInstallment
                          ? `${installments}x de ${
                              parsedAmount > 0
                                ? (parsedAmount / installments).toLocaleString(
                                    "pt-BR",
                                    { style: "currency", currency: "BRL" }
                                  )
                                : "R$ 0,00"
                            }`
                          : "Dividir em parcelas mensais"}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isInstallment
                          ? "border-orange-400 bg-orange-400"
                          : "border-border"
                      }`}
                    >
                      {isInstallment && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>

                  {isInstallment && (
                    <div className="mt-3">
                      <label className="text-xs text-muted-foreground mb-2 block" style={{ fontWeight: 600 }}>
                        NÚMERO DE PARCELAS
                      </label>
                      <div className="flex gap-1.5 flex-wrap">
                        {INSTALLMENT_OPTIONS.map((n) => (
                          <button
                            key={n}
                            onClick={() => setInstallments(n)}
                            className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                              installments === n
                                ? "bg-orange-500 text-white"
                                : "bg-muted dark:bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {n}x
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recurring toggle (income only) */}
              {!isExpense && (
                <button
                  onClick={() => setIsRecurring((v) => !v)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                    isRecurring
                      ? "border-primary dark:border-violet-500 bg-accent dark:bg-primary/10"
                      : "border-border dark:border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isRecurring
                        ? "bg-accent dark:bg-primary/20"
                        : "bg-muted dark:bg-muted"
                    }`}
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${
                        isRecurring ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm ${
                        isRecurring ? "text-primary" : "text-foreground"
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      Receita Fixa / Recorrente
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Salário, aluguel ou renda mensal fixa
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isRecurring
                        ? "border-primary bg-primary"
                        : "border-border"
                    }`}
                  >
                    {isRecurring && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              )}
            </>
          )}

          {step === 2 && (
            <>
              {/* Full category list */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block" style={{ fontWeight: 600 }}>
                  CATEGORIA
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        category === cat
                          ? isExpense
                            ? "bg-red-500 text-white"
                            : "bg-primary dark:bg-primary text-white"
                          : "bg-muted dark:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Member */}
              {members.length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block" style={{ fontWeight: 600 }}>
                    MEMBRO
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {members.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMember(m.name)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm ${
                          member === m.name
                            ? "border-primary dark:border-violet-500 bg-accent dark:bg-primary/10 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                        style={{ fontWeight: member === m.name ? 600 : 400 }}
                      >
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                          style={{ backgroundColor: m.color, fontSize: 9, fontWeight: 700 }}
                        >
                          {m.avatar ? (
                            <img src={m.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            m.name[0]
                          )}
                        </div>
                        {m.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-background dark:bg-muted rounded-xl p-4 border border-border dark:border-white/[0.06]">
                <p className="text-xs text-muted-foreground mb-2" style={{ fontWeight: 600 }}>
                  RESUMO
                </p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Descrição</span>
                    <span className="text-foreground font-medium truncate max-w-[60%] text-right">{description || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valor total</span>
                    <span className="text-foreground font-semibold">
                      {parsedAmount > 0
                        ? parsedAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                        : "—"}
                    </span>
                  </div>
                  {isExpense && isInstallment && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Parcelas</span>
                      <span className="text-orange-500 font-semibold">
                        {installments}x de{" "}
                        {parsedAmount > 0
                          ? (parsedAmount / installments).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                          : "R$ 0,00"}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Categoria</span>
                    <span className="text-foreground font-medium">{category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Data</span>
                    <span className="text-foreground font-medium">
                      {date
                        ? new Date(date + "T12:00:00").toLocaleDateString("pt-BR")
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-5 pt-0 flex gap-3 sticky bottom-0 bg-card dark:bg-card border-t border-border dark:border-white/[0.06]">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="px-4 py-3 rounded-xl border border-border dark:border-border text-muted-foreground hover:bg-accent dark:hover:bg-muted transition-colors text-sm"
              style={{ fontWeight: 500 }}
            >
              ← Voltar
            </button>
          )}
          <button
            onClick={handleClose}
            className="flex-1 py-3 rounded-xl border border-border dark:border-border text-muted-foreground hover:bg-accent dark:hover:bg-muted transition-colors text-sm"
            style={{ fontWeight: 500 }}
          >
            Cancelar
          </button>
          {step === 1 ? (
            <button
              onClick={() => {
                if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
                  toast.error("Digite um valor válido");
                  return;
                }
                if (!description) {
                  toast.error("Informe uma descrição");
                  return;
                }
                setStep(2);
              }}
              className={`flex-1 py-3 rounded-xl text-white text-sm transition-colors ${primaryBtn}`}
              style={{ fontWeight: 600 }}
            >
              Próximo →
            </button>
          ) : (
            <button
              onClick={handleSave}
              className={`flex-1 py-3 rounded-xl text-white text-sm transition-colors flex items-center justify-center gap-2 ${primaryBtn}`}
              style={{ fontWeight: 600 }}
            >
              <Plus className="w-4 h-4" />
              {isExpense
                ? isInstallment
                  ? `Parcelar em ${installments}x`
                  : "Adicionar Despesa"
                : "Adicionar Receita"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
