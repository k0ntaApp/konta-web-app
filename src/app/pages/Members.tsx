import { useState, useMemo, useRef } from "react";
import { useApp, Member } from "../context/AppContext";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Camera,
  User,
  TrendingUp,
  Users,
  BarChart2,
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

const COLORS = [
  "#16a34a",
  "#0ea5e9",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];
const RELATIONSHIPS = [
  "Titular",
  "Cônjuge",
  "Filho(a)",
  "Pai/Mãe",
  "Irmão/Irmã",
  "Avô/Avó",
  "Outro",
];

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface MemberForm {
  name: string;
  relationship: string;
  color: string;
  income: string;
  isVariableIncome: boolean;
  desiredContribution: string;
  avatar?: string;
}

export function MembersPage() {
  const { setup, addMember, removeMember, updateMember, expenses } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteMemberName, setDeleteMemberName] = useState("");
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [form, setForm] = useState<MemberForm>({
    name: "",
    relationship: "Cônjuge",
    color: "#0ea5e9",
    income: "",
    isVariableIncome: false,
    desiredContribution: "",
  });

  const members = setup?.members ?? [];
  const now = new Date();

  const memberStats = useMemo(() => {
    const monthExp = expenses.filter((e) => {
      const d = new Date(e.date);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    });
    return members.map((m) => {
      const spent = monthExp
        .filter((e) => e.member === m.name)
        .reduce((s, e) => s + e.amount, 0);
      const income = m.income ?? 0;
      const desired = m.desiredContribution ?? 0;
      const balance = income - spent;
      const savingRate = income > 0 ? (balance / income) * 100 : 0;
      const onTrack = desired > 0 ? balance >= desired : savingRate >= 10;
      return { ...m, spent, balance, savingRate, onTrack };
    });
  }, [members, expenses]);

  const totalIncome = members.reduce((s, m) => s + (m.income ?? 0), 0);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (uploadingFor === "form") {
        setForm((f) => ({ ...f, avatar: result }));
      } else if (uploadingFor) {
        updateMember(uploadingFor, { avatar: result });
        toast.success("Foto atualizada!");
      }
      setUploadingFor(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const openAdd = () => {
    setForm({
      name: "",
      relationship: "Cônjuge",
      color: COLORS[members.length % COLORS.length],
      income: "",
      isVariableIncome: false,
      desiredContribution: "",
    });
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (m: Member) => {
    setForm({
      name: m.name,
      relationship: m.relationship,
      color: m.color,
      income: (m.income ?? "").toString(),
      isVariableIncome: m.isVariableIncome ?? false,
      desiredContribution: (m.desiredContribution ?? "").toString(),
      avatar: m.avatar,
    });
    setEditingId(m.id);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name) {
      toast.error("Digite o nome do membro.");
      return;
    }
    // Duplicate name check (H5)
    const isDuplicate = members.some(
      (m) =>
        m.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
        m.id !== editingId,
    );
    if (isDuplicate) {
      toast.error(
        `Já existe um membro chamado "${form.name}". Use um nome diferente.`,
      );
      return;
    }
    const data: Partial<Member> = {
      name: form.name,
      relationship: form.relationship,
      color: form.color,
      income: parseFloat(form.income) || 0,
      isVariableIncome: form.isVariableIncome,
      desiredContribution: parseFloat(form.desiredContribution) || 0,
      avatar: form.avatar,
    };
    if (editingId) {
      updateMember(editingId, data);
      toast.success("Membro atualizado!");
    } else {
      addMember({ ...data, isOwner: false } as Omit<Member, "id">);
      toast.success("Membro adicionado!");
    }
    setShowModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirmId(id);
    setDeleteMemberName(name);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    removeMember(deleteConfirmId);
    toast.success("Membro removido.");
    setDeleteConfirmId(null);
    setDeleteMemberName("");
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
            Membros da família
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground text-sm mt-0.5">
            Gerencie os membros e suas rendas
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary dark:bg-primary text-white hover:bg-primary/90 dark:hover:bg-violet-600 transition-colors text-sm"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-4 h-4" />
          Adicionar membro
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card dark:bg-card rounded-2xl p-4 border border-border dark:border-white/[0.06] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent dark:bg-muted flex items-center justify-center">
              <Users className="w-5 h-5 text-primary dark:text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                Total de membros
              </p>
              <p
                className="text-xl text-foreground"
                style={{ fontWeight: 700 }}
              >
                {members.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card dark:bg-card rounded-2xl p-4 border border-border dark:border-white/[0.06] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent dark:bg-muted flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary dark:text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                Renda familiar total
              </p>
              <p
                className="text-xl text-foreground"
                style={{ fontWeight: 700 }}
              >
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card dark:bg-card rounded-2xl p-4 border border-border dark:border-white/[0.06] shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent dark:bg-muted flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-primary dark:text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                Média por membro
              </p>
              <p
                className="text-xl text-foreground"
                style={{ fontWeight: 700 }}
              >
                {formatCurrency(
                  members.length > 0 ? totalIncome / members.length : 0,
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Members grid */}
      {members.length === 0 ? (
        <div className="bg-card dark:bg-card rounded-2xl p-12 border border-border dark:border-white/[0.06] shadow-sm text-center">
          <Users className="w-14 h-14 mx-auto mb-4 text-muted-foreground dark:text-muted-foreground opacity-30" />
          <p
            className="text-foreground"
            style={{ fontWeight: 600 }}
          >
            Nenhum membro cadastrado
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memberStats.map((m) => {
            const incomeWidth =
              totalIncome > 0 ? ((m.income ?? 0) / totalIncome) * 100 : 0;
            return (
              <div
                key={m.id}
                className="bg-card dark:bg-card rounded-2xl p-5 border border-border dark:border-white/[0.06] shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Avatar & name */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl overflow-hidden cursor-pointer"
                      style={{ backgroundColor: m.color, fontWeight: 700 }}
                      onClick={() => {
                        setUploadingFor(m.id);
                        fileInputRef.current?.click();
                      }}
                    >
                      {m.avatar ? (
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        m.name[0]
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setUploadingFor(m.id);
                        fileInputRef.current?.click();
                      }}
                      className="absolute -bottom-1.5 -right-1.5 w-9 h-9 rounded-full bg-card dark:bg-muted border-2 border-border dark:border-border flex items-center justify-center shadow-sm hover:border-primary dark:hover:border-violet-500 transition-colors"
                      aria-label="Alterar foto"
                    >
                      <Camera className="w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3
                          className="text-foreground dark:text-foreground"
                          style={{ fontWeight: 700 }}
                        >
                          {m.name}
                        </h3>
                        <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                          {m.relationship}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {!m.isOwner && (
                          <>
                            <button
                              onClick={() => openEdit(m)}
                              className="p-2.5 rounded-lg text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary hover:bg-background dark:hover:bg-muted transition-colors"
                              aria-label="Editar membro"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(m.id, m.name)}
                              className="p-2.5 rounded-lg text-muted-foreground dark:text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              aria-label="Remover membro"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {m.isOwner && (
                          <button
                            onClick={() => openEdit(m)}
                            className="p-2.5 rounded-lg text-muted-foreground dark:text-muted-foreground hover:text-primary dark:hover:text-primary hover:bg-background dark:hover:bg-muted transition-colors"
                            aria-label="Editar membro"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    {m.isOwner && (
                      <span
                        className="inline-flex text-xs px-2 py-0.5 rounded-full bg-accent dark:bg-muted text-primary dark:text-primary mt-1"
                        style={{ fontWeight: 500 }}
                      >
                        Titular
                      </span>
                    )}
                    {m.isVariableIncome && (
                      <span
                        className="inline-flex text-xs px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 mt-1 ml-1"
                        style={{ fontWeight: 500 }}
                      >
                        Renda variável
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground dark:text-muted-foreground">
                      Renda mensal
                    </span>
                    <span
                      className="text-foreground dark:text-foreground"
                      style={{ fontWeight: 600 }}
                    >
                      {formatCurrency(m.income ?? 0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground dark:text-muted-foreground">
                        Participação na renda
                      </span>
                      <span
                        className="text-foreground dark:text-foreground"
                        style={{ fontWeight: 600 }}
                      >
                        {incomeWidth.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-background dark:bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${incomeWidth}%`,
                          backgroundColor: m.color,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground dark:text-muted-foreground">
                      Gastos este mês
                    </span>
                    <span
                      className="text-foreground dark:text-foreground"
                      style={{ fontWeight: 600 }}
                    >
                      {formatCurrency(m.spent)}
                    </span>
                  </div>
                  {(m.desiredContribution ?? 0) > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground dark:text-muted-foreground">
                        Meta de economia
                      </span>
                      <span
                        className={
                          m.onTrack
                            ? "text-primary dark:text-primary"
                            : "text-amber-500 dark:text-amber-400"
                        }
                        style={{ fontWeight: 600 }}
                      >
                        {formatCurrency(m.desiredContribution ?? 0)}
                        {m.onTrack ? " ✓" : " !"}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex items-center justify-between p-3 rounded-xl text-sm ${m.balance >= 0 ? "bg-background dark:bg-muted" : "bg-red-50 dark:bg-red-950/30"}`}
                  >
                    <span className="text-muted-foreground dark:text-muted-foreground">
                      Saldo do mês
                    </span>
                    <span
                      className={
                        m.balance >= 0
                          ? "text-primary dark:text-primary"
                          : "text-red-500 dark:text-red-400"
                      }
                      style={{ fontWeight: 700 }}
                    >
                      {m.balance >= 0 ? "+" : ""}
                      {formatCurrency(m.balance)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleAvatarUpload}
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-card dark:bg-card rounded-2xl shadow-xl w-full max-w-md border border-border dark:border-white/[0.08]">
            <div className="flex items-center justify-between p-6 border-b border-border dark:border-white/[0.06]">
              <h2
                className="text-lg text-foreground"
                style={{ fontWeight: 700 }}
              >
                {editingId ? "Editar membro" : "Adicionar membro"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-muted-foreground dark:text-muted-foreground hover:bg-background dark:hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Avatar in modal */}
              <div className="flex justify-center">
                <div
                  className="relative cursor-pointer"
                  onClick={() => {
                    setUploadingFor("form");
                    fileInputRef.current?.click();
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl overflow-hidden"
                    style={{ backgroundColor: form.color, fontWeight: 700 }}
                  >
                    {form.avatar ? (
                      <img
                        src={form.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : form.name ? (
                      form.name[0].toUpperCase()
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary dark:bg-primary flex items-center justify-center">
                    <Camera className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>

              <div>
                <label
                  className="block text-sm text-foreground dark:text-foreground mb-1.5"
                  style={{ fontWeight: 600 }}
                >
                  Nome
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nome do membro"
                  className={inputCls}
                />
              </div>
              <div>
                <label
                  className="block text-sm text-foreground dark:text-foreground mb-1.5"
                  style={{ fontWeight: 600 }}
                >
                  Relação
                </label>
                <select
                  value={form.relationship}
                  onChange={(e) =>
                    setForm({ ...form, relationship: e.target.value })
                  }
                  className={inputCls}
                >
                  {RELATIONSHIPS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-sm text-foreground dark:text-foreground mb-1.5"
                    style={{ fontWeight: 600 }}
                  >
                    Renda mensal (R$)
                  </label>
                  <CurrencyInput
                    value={form.income}
                    onChange={(v) => setForm({ ...form, income: v })}
                    placeholder="0,00"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm text-foreground dark:text-foreground mb-1.5"
                    style={{ fontWeight: 600 }}
                  >
                    Meta economia (R$)
                  </label>
                  <CurrencyInput
                    value={form.desiredContribution}
                    onChange={(v) =>
                      setForm({ ...form, desiredContribution: v })
                    }
                    placeholder="0,00"
                    className={inputCls}
                  />
                </div>
              </div>
              <button
                onClick={() =>
                  setForm({ ...form, isVariableIncome: !form.isVariableIncome })
                }
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                  ${
                    form.isVariableIncome
                      ? "border-primary dark:border-violet-500 bg-background dark:bg-muted"
                      : "border-border dark:border-border"
                  }`}
              >
                <TrendingUp
                  className={`w-4 h-4 ${form.isVariableIncome ? "text-primary dark:text-primary" : "text-muted-foreground dark:text-muted-foreground"}`}
                />
                <span
                  className="text-sm text-foreground dark:text-foreground"
                  style={{ fontWeight: 500 }}
                >
                  Renda variável
                </span>
                <div
                  className={`ml-auto w-4 h-4 rounded-full flex items-center justify-center ${form.isVariableIncome ? "bg-primary dark:bg-primary" : "border-2 border-border dark:border-border"}`}
                >
                  {form.isVariableIncome && (
                    <div className="w-2 h-2 rounded-full bg-card" />
                  )}
                </div>
              </button>
              <div>
                <label
                  className="block text-sm text-foreground dark:text-foreground mb-2"
                  style={{ fontWeight: 600 }}
                >
                  Cor do avatar
                </label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm({ ...form, color: c })}
                      className={`w-10 h-10 rounded-full transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-primary dark:ring-violet-500 scale-110" : "hover:scale-110"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover {deleteMemberName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O membro e todos os dados
              associados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
