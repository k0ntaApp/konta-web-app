import { useState } from "react";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";
import { Plus, X, TrendingDown, CreditCard } from "lucide-react";
import { CurrencyInput } from "../components/ui/CurrencyInput";

const DEFAULT_CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Lazer",
  "Moradia",
  "Saúde",
  "Outros",
];

const INSTALLMENT_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 18, 24];

interface QuickAddFABProps {
  className?: string;
}

export function QuickAddFAB({ className }: QuickAddFABProps) {
  const { addExpense, addInstallmentExpense, setup, customCategories } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Outros");
  const [isInstallment, setIsInstallment] = useState(false);
  const [installments, setInstallments] = useState(2);

  const customExpenseCategories = customCategories.filter(c => c.type === 'expense');
  const allCategories = [...DEFAULT_CATEGORIES, ...customExpenseCategories.map(c => c.name)];

  const parsedAmount = parseFloat(amount);

  const handleQuickAdd = () => {
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Digite um valor válido");
      return;
    }

    const data = {
      description: description || "Despesa rápida",
      amount: parsedAmount,
      category,
      date: new Date().toISOString(),
      member: setup?.ownerName || "Usuário",
    };

    if (isInstallment && installments >= 2) {
      addInstallmentExpense(data, installments);
      toast.success(`Despesa parcelada em ${installments}x adicionada!`);
    } else {
      addExpense(data);
      toast.success("Despesa adicionada!");
    }

    setIsOpen(false);
    setDescription("");
    setAmount("");
    setCategory("Outros");
    setIsInstallment(false);
    setInstallments(2);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full bg-primary dark:bg-primary text-white shadow-lg hover:bg-primary/90 dark:hover:bg-violet-600 transition-all hover:scale-105 active:scale-95 ${className}`}
        style={{ fontWeight: 600 }}
      >
        <Plus className="w-5 h-5" />
        <span className="hidden sm:inline text-sm sm:text-base">Despesa</span>
        <span className="sm:hidden text-lg">+</span>
      </button>

      {/* Quick Add Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-card dark:bg-card rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm border border-border dark:border-white/[0.08] max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-foreground font-semibold text-base sm:text-lg">Despesa Rápida</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent dark:hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3.5">
              <div>
                <label className="text-xs sm:text-sm text-muted-foreground mb-1.5 block" style={{ fontWeight: 600 }}>Valor</label>
                <CurrencyInput
                  value={amount}
                  onChange={setAmount}
                  placeholder="0,00"
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-foreground text-xl sm:text-2xl font-bold focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm text-muted-foreground mb-1.5 block" style={{ fontWeight: 600 }}>Descrição (opcional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Café, Uber..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-sm sm:text-base text-foreground focus:outline-none focus:border-primary"
                  onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm text-muted-foreground mb-1.5 block" style={{ fontWeight: 600 }}>Categoria</label>
                <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                  {allCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                        category === cat
                          ? "bg-primary dark:bg-primary text-white"
                          : "bg-muted dark:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Installment toggle */}
              <div>
                <button
                  onClick={() => setIsInstallment((v) => !v)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    isInstallment
                      ? "border-orange-400 dark:border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                      : "border-border dark:border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isInstallment ? "bg-orange-100 dark:bg-orange-900/30" : "bg-muted dark:bg-muted"
                  }`}>
                    <CreditCard className={`w-4 h-4 ${isInstallment ? "text-orange-500" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${isInstallment ? "text-orange-600 dark:text-orange-400" : "text-foreground"}`} style={{ fontWeight: 600 }}>
                      Parcelado
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isInstallment && parsedAmount > 0
                        ? `${installments}x de ${(parsedAmount / installments).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
                        : "Dividir em parcelas mensais"}
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    isInstallment ? "border-orange-400 bg-orange-400" : "border-border"
                  }`}>
                    {isInstallment && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>

                {isInstallment && (
                  <div className="mt-2.5">
                    <p className="text-xs text-muted-foreground mb-2" style={{ fontWeight: 600 }}>PARCELAS</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {INSTALLMENT_OPTIONS.map((n) => (
                        <button
                          key={n}
                          onClick={() => setInstallments(n)}
                          className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all ${
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
            </div>

            {/* Actions */}
            <div className="p-4 pt-0 flex gap-2 sm:gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 sm:py-3 rounded-xl border border-border dark:border-border text-sm sm:text-base text-muted-foreground hover:bg-accent dark:hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleQuickAdd}
                className="flex-1 py-2.5 sm:py-3 rounded-xl bg-primary dark:bg-primary text-white text-sm sm:text-base font-semibold hover:bg-primary/90 dark:hover:bg-violet-600 transition-colors"
              >
                {isInstallment ? `${installments}x` : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}