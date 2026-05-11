import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useApp, Member } from "../context/AppContext";
import { toast } from "sonner";
import {
  Leaf,
  Users,
  User,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Trash2,
  Camera,
  TrendingUp,
  DollarSign,
  Target,
} from "lucide-react";

const STEPS = ["Perfil", "Renda", "Membros", "Metas", "Concluir"];
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
  "Cônjuge",
  "Filho(a)",
  "Pai/Mãe",
  "Irmão/Irmã",
  "Avô/Avó",
  "Outro",
];

interface MemberForm {
  name: string;
  relationship: string;
  income: number;
  isVariableIncome: boolean;
  desiredContribution: number;
  color: string;
  avatar?: string;
}

export function SetupPage() {
  const { currentUser, completeSetup } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 0: Profile
  const [profileType, setProfileType] = useState<"family" | "individual">(
    "family",
  );
  const [householdName, setHouseholdName] = useState("");
  const [ownerAvatar, setOwnerAvatar] = useState<string | undefined>();

  // Step 1: Income
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [hasVariableIncome, setHasVariableIncome] = useState(false);
  const [desiredContribution, setDesiredContribution] = useState("");

  // Step 2: Members
  const [members, setMembers] = useState<MemberForm[]>([]);
  const [newMember, setNewMember] = useState<MemberForm>({
    name: "",
    relationship: "Cônjuge",
    income: 0,
    isVariableIncome: false,
    desiredContribution: 0,
    color: "#0ea5e9",
  });
  const [addingMember, setAddingMember] = useState(false);

  // Step 3: Budget/Goals
  const [monthlyBudget, setMonthlyBudget] = useState("");

  const handleAvatarUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    forMember?: boolean,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (forMember) {
        setNewMember((m) => ({ ...m, avatar: reader.result as string }));
      } else {
        setOwnerAvatar(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const addMember = () => {
    if (!newMember.name) {
      toast.error("Digite o nome do membro.");
      return;
    }
    setMembers((prev) => [...prev, { ...newMember }]);
    setNewMember({
      name: "",
      relationship: "Cônjuge",
      income: 0,
      isVariableIncome: false,
      desiredContribution: 0,
      color: COLORS[members.length % COLORS.length],
    });
    setAddingMember(false);
  };

  const nextStep = () => {
    if (step === 0 && !householdName) {
      toast.error("Digite o nome da família.");
      return;
    }
    if (step === 1 && !monthlyIncome) {
      toast.error("Informe sua renda.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleFinish = () => {
    const ownerMember: Member = {
      id: "owner",
      name: currentUser!.name,
      color: "#16a34a",
      relationship: "Titular",
      isOwner: true,
      avatar: ownerAvatar,
      income: parseFloat(monthlyIncome) || 0,
      isVariableIncome: hasVariableIncome,
      desiredContribution: parseFloat(desiredContribution) || 0,
    };
    const allMembers: Member[] = [
      ownerMember,
      ...members.map((m, i) => ({
        ...m,
        id: `m${Date.now()}${i}`,
        isOwner: false,
      })),
    ];
    completeSetup({
      profileType,
      householdName,
      ownerName: currentUser!.name,
      monthlyBudget:
        parseFloat(monthlyBudget) || (parseFloat(monthlyIncome) || 0) * 0.7,
      members: allMembers,
      hasVariableIncome,
      monthlyIncome: parseFloat(monthlyIncome) || 0,
    });
    toast.success("Configuração concluída!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <span
            className="text-xl text-foreground"
            style={{ fontWeight: 700 }}
          >
            Konta
          </span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all
                ${i < step ? "bg-primary text-white" : i === step ? "bg-primary text-white ring-4 ring-accent" : "bg-card border-2 border-border text-muted-foreground"}`}
                style={{ fontWeight: 600 }}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-8 h-0.5 ${i < step ? "bg-primary" : "bg-border"}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          {/* Step 0: Profile */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2
                  className="text-xl text-foreground"
                  style={{ fontWeight: 700 }}
                >
                  Seu perfil
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Como você vai usar o Konta?
                </p>
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="relative cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center overflow-hidden border-4 border-primary/20">
                    {ownerAvatar ? (
                      <img
                        src={ownerAvatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleAvatarUpload(e)}
                />
                <p className="text-xs text-muted-foreground">
                  Clique para adicionar foto
                </p>
              </div>

              {/* Profile type */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setProfileType("family")}
                  className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all
                    ${profileType === "family" ? "border-primary bg-background" : "border-border hover:border-primary/50"}`}
                >
                  <Users
                    className={`w-7 h-7 ${profileType === "family" ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <div>
                    <p
                      className="text-sm text-foreground"
                      style={{ fontWeight: 600 }}
                    >
                      Família
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Para a família toda
                    </p>
                  </div>
                  {profileType === "family" && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setProfileType("individual")}
                  className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all
                    ${profileType === "individual" ? "border-primary bg-background" : "border-border hover:border-primary/50"}`}
                >
                  <User
                    className={`w-7 h-7 ${profileType === "individual" ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <div>
                    <p
                      className="text-sm text-foreground"
                      style={{ fontWeight: 600 }}
                    >
                      Individual
                    </p>
                    <p className="text-xs text-muted-foreground">Só para mim</p>
                  </div>
                  {profileType === "individual" && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              </div>

              <div>
                <label
                  className="block text-sm text-foreground mb-1.5"
                  style={{ fontWeight: 600 }}
                >
                  {profileType === "family"
                    ? "Nome da família"
                    : "Seu nome de perfil"}
                </label>
                <input
                  type="text"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  placeholder={
                    profileType === "family"
                      ? "Ex: Família Souza"
                      : "Ex: Minhas Finanças"
                  }
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-[#9ca3af] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>
          )}

          {/* Step 1: Income */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2
                  className="text-xl text-foreground"
                  style={{ fontWeight: 700 }}
                >
                  Sua renda
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Informe sua renda mensal para calcular seu orçamento
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 mb-2">
                <DollarSign className="w-10 h-10 text-primary" />
              </div>

              <div>
                <label
                  className="block text-sm text-foreground mb-1.5"
                  style={{ fontWeight: 600 }}
                >
                  Renda mensal (R$)
                </label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-[#9ca3af] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <button
                onClick={() => setHasVariableIncome(!hasVariableIncome)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left
                  ${hasVariableIncome ? "border-primary bg-background" : "border-border hover:border-primary/50"}`}
              >
                <TrendingUp
                  className={`w-5 h-5 flex-shrink-0 ${hasVariableIncome ? "text-primary" : "text-muted-foreground"}`}
                />
                <div className="flex-1">
                  <p
                    className="text-sm text-foreground"
                    style={{ fontWeight: 600 }}
                  >
                    Renda variável
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Minha renda muda todo mês
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${hasVariableIncome ? "bg-primary" : "border-2 border-border"}`}
                >
                  {hasVariableIncome && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </button>

              <div>
                <label
                  className="block text-sm text-foreground mb-1.5"
                  style={{ fontWeight: 600 }}
                >
                  Quanto deseja economizar por mês? (R$){" "}
                  <span className="text-muted-foreground" style={{ fontWeight: 400 }}>
                    opcional
                  </span>
                </label>
                <input
                  type="number"
                  value={desiredContribution}
                  onChange={(e) => setDesiredContribution(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-[#9ca3af] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>
          )}

          {/* Step 2: Members */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <h2
                  className="text-xl text-foreground"
                  style={{ fontWeight: 700 }}
                >
                  Membros da família
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Adicione quem mora com você (opcional)
                </p>
              </div>

              {/* Owner card */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
                <div
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm overflow-hidden"
                  style={{ fontWeight: 600 }}
                >
                  {ownerAvatar ? (
                    <img
                      src={ownerAvatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    currentUser?.name?.[0]
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className="text-sm text-foreground"
                    style={{ fontWeight: 600 }}
                  >
                    {currentUser?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Titular · R${" "}
                    {parseFloat(monthlyIncome || "0").toLocaleString("pt-BR")}
                    /mês
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded-full bg-accent text-primary"
                  style={{ fontWeight: 500 }}
                >
                  Você
                </span>
              </div>

              {/* Added members */}
              {members.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm overflow-hidden"
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
                  <div className="flex-1">
                    <p
                      className="text-sm text-foreground"
                      style={{ fontWeight: 600 }}
                    >
                      {m.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.relationship} · R$ {m.income.toLocaleString("pt-BR")}
                      /mês
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setMembers((prev) => prev.filter((_, j) => j !== i))
                    }
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Add member form */}
              {addingMember ? (
                <div className="p-4 rounded-xl border-2 border-primary bg-background space-y-3">
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) =>
                      setNewMember({ ...newMember, name: e.target.value })
                    }
                    placeholder="Nome do membro"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary"
                  />
                  <select
                    value={newMember.relationship}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        relationship: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary"
                  >
                    {RELATIONSHIPS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={newMember.income || ""}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        income: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Renda mensal (R$)"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary"
                  />
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setNewMember({ ...newMember, color: c })}
                        className={`w-7 h-7 rounded-full transition-all ${newMember.color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addMember}
                      className="flex-1 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors"
                      style={{ fontWeight: 600 }}
                    >
                      Adicionar
                    </button>
                    <button
                      onClick={() => setAddingMember(false)}
                      className="flex-1 py-2 rounded-lg border border-border text-muted-foreground text-sm hover:bg-card transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingMember(true)}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-border text-primary hover:bg-background transition-colors text-sm"
                  style={{ fontWeight: 500 }}
                >
                  <Plus className="w-4 h-4" />
                  Adicionar membro
                </button>
              )}
            </div>
          )}

          {/* Step 3: Budget */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2
                  className="text-xl text-foreground"
                  style={{ fontWeight: 700 }}
                >
                  Orçamento mensal
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Defina quanto a família pode gastar por mês
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Target className="w-10 h-10 text-primary" />
              </div>

              {parseFloat(monthlyIncome) > 0 && (
                <div className="p-4 rounded-xl bg-background border border-border">
                  <p className="text-sm text-muted-foreground mb-2">
                    Sugestão baseada na sua renda:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[0.5, 0.6, 0.7].map((pct) => (
                      <button
                        key={pct}
                        onClick={() =>
                          setMonthlyBudget(
                            ((parseFloat(monthlyIncome) || 0) * pct).toFixed(0),
                          )
                        }
                        className={`p-3 rounded-lg text-center border-2 transition-all
                          ${monthlyBudget === ((parseFloat(monthlyIncome) || 0) * pct).toFixed(0) ? "border-primary bg-card" : "border-border hover:border-primary/50"}`}
                      >
                        <p className="text-xs text-muted-foreground">
                          {(pct * 100).toFixed(0)}% da renda
                        </p>
                        <p
                          className="text-sm text-foreground"
                          style={{ fontWeight: 600 }}
                        >
                          R${" "}
                          {(
                            (parseFloat(monthlyIncome) || 0) * pct
                          ).toLocaleString("pt-BR", {
                            maximumFractionDigits: 0,
                          })}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label
                  className="block text-sm text-foreground mb-1.5"
                  style={{ fontWeight: 600 }}
                >
                  Orçamento personalizado (R$)
                </label>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-[#9ca3af] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2
                  className="text-2xl text-foreground"
                  style={{ fontWeight: 700 }}
                >
                  Tudo pronto!
                </h2>
                <p className="text-muted-foreground mt-2">
                  Sua conta está configurada. Vamos começar a organizar as
                  finanças da {householdName || "família"}!
                </p>
              </div>
              <div className="p-4 rounded-xl bg-background text-left space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-foreground">
                    Perfil: <strong>{householdName}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-foreground">
                    Renda:{" "}
                    <strong>
                      R${" "}
                      {parseFloat(monthlyIncome || "0").toLocaleString("pt-BR")}
                      /mês
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-foreground">
                    Membros: <strong>{members.length + 1} pessoa(s)</strong>
                  </span>
                </div>
                {monthlyBudget && (
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground">
                      Orçamento:{" "}
                      <strong>
                        R$ {parseFloat(monthlyBudget).toLocaleString("pt-BR")}
                        /mês
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div
            className={`flex gap-3 mt-8 ${step === 0 ? "justify-end" : "justify-between"}`}
          >
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-background transition-colors text-sm"
                style={{ fontWeight: 500 }}
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors text-sm"
                style={{ fontWeight: 600 }}
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors text-sm"
                style={{ fontWeight: 600 }}
              >
                Ir para o Dashboard
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
