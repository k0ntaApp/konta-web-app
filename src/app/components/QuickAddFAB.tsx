import { useState } from "react";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";
import { Plus, X, TrendingDown } from "lucide-react";
import { CurrencyInput } from "../components/ui/CurrencyInput";

const DEFAULT_CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Lazer",
  "Outros",
];

interface QuickAddFABProps {
  className?: string;
}

export function QuickAddFAB({ className }: QuickAddFABProps) {
  const { addExpense, setup, customCategories } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Outros");

  const customExpenseCategories = customCategories.filter(c => c.type === 'expense');
  const allCategories = [...DEFAULT_CATEGORIES, ...customExpenseCategories.map(c => c.name)];

  const handleQuickAdd = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Digite um valor válido");
      return;
    }

    addExpense({
      description: description || "Despesa rápida",
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString(),
      member: setup?.ownerName || "Usuario",
    });

    toast.success("Despesa adicionada!");
    setIsOpen(false);
    setDescription("");
    setAmount("");
    setCategory("Outros");
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-card dark:bg-card rounded-2xl shadow-xl w-full max-w-sm border border-border dark:border-white/[0.08]">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border dark:border-white/[0.06]">
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
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2 block">Valor</label>
                <CurrencyInput
                  value={amount}
                  onChange={setAmount}
                  placeholder="0,00"
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-foreground text-xl sm:text-2xl font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2 block">Descrição (opcional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Café, Uber..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-sm sm:text-base text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2 block">Categoria</label>
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
            </div>

            {/* Actions */}
            <div className="p-3 sm:p-4 pt-0 flex gap-2 sm:gap-3">
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
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}