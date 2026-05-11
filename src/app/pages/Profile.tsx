import { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  User,
  Camera,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Trash2,
  Shield,
  Bell,
  Leaf,
  Save,
  Moon,
  Sun,
} from "lucide-react";

export function ProfilePage() {
  const {
    currentUser,
    updateUserProfile,
    logout,
    resetApp,
    darkMode,
    toggleDarkMode,
  } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "preferences"
  >("profile");

  const [name, setName] = useState(currentUser?.name ?? "");
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [avatar, setAvatar] = useState(currentUser?.avatar ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const initials =
    currentUser?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("") ?? "K";

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatar(result);
      updateUserProfile({ avatar: result });
      toast.success("Foto atualizada!");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    if (!name || !email) {
      toast.error("Nome e e-mail são obrigatórios.");
      return;
    }
    updateUserProfile({ name, email, phone: phone || undefined });
    toast.success("Perfil atualizado com sucesso!");
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (currentUser?.password !== currentPassword) {
      toast.error("Senha atual incorreta.");
      return;
    }
    updateUserProfile({ password: newPassword });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Senha alterada com sucesso!");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleResetData = () => {
    if (
      !confirm(
        "Tem certeza? Todos os dados serão apagados e não poderão ser recuperados.",
      )
    )
      return;
    resetApp();
    navigate("/setup");
    toast.success("Dados resetados.");
  };

  const tabs = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "security", label: "Segurança", icon: Shield },
    { id: "preferences", label: "Preferências", icon: Bell },
  ] as const;

  const inputCls =
    "w-full px-4 py-3 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-foreground dark:text-foreground text-sm focus:outline-none focus:border-primary dark:focus:border-violet-500";

  return (
    <div className="p-4 sm:p-6 max-w-[800px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-2xl text-foreground"
          style={{ fontWeight: 700 }}
        >
          Perfil
        </h1>
        <p className="text-muted-foreground dark:text-muted-foreground text-sm mt-0.5">
          Gerencie suas informações e configurações
        </p>
      </div>

      {/* Profile card */}
      <div className="bg-card dark:bg-card rounded-2xl p-6 border border-border dark:border-white/[0.06] shadow-sm mb-6">
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <div
              className="w-20 h-20 rounded-2xl bg-primary dark:bg-primary flex items-center justify-center text-white text-2xl overflow-hidden cursor-pointer"
              style={{ fontWeight: 700 }}
              onClick={() => fileInputRef.current?.click()}
            >
              {avatar || currentUser?.avatar ? (
                <img
                  src={avatar || currentUser?.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-card dark:bg-muted border-2 border-border dark:border-border flex items-center justify-center shadow-sm hover:border-primary dark:hover:border-violet-500 transition-colors"
            >
              <Camera className="w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <h2
              className="text-xl text-foreground dark:text-foreground"
              style={{ fontWeight: 700 }}
            >
              {currentUser?.name}
            </h2>
            <p className="text-muted-foreground dark:text-muted-foreground">
              {currentUser?.email}
            </p>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
              Membro desde{" "}
              {currentUser?.createdAt
                ? new Date(currentUser.createdAt).toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  })
                : "hoje"}
            </p>
          </div>
          <div className="ml-auto flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent dark:bg-muted">
              <span className="text-primary dark:text-primary font-bold">K</span>
              <span
                className="text-xs text-primary dark:text-primary"
                style={{ fontWeight: 600 }}
              >
                Ativo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-background dark:bg-card p-1 rounded-xl mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm transition-all
              ${
                activeTab === id
                  ? "bg-card dark:bg-muted text-foreground shadow-sm"
                  : "text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-primary"
              }`}
            style={{ fontWeight: activeTab === id ? 600 : 400 }}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-card dark:bg-card rounded-2xl border border-border dark:border-white/[0.06] shadow-sm">
        {activeTab === "profile" && (
          <div className="p-6 space-y-5">
            <h3
              className="text-foreground"
              style={{ fontWeight: 700 }}
            >
              Informações pessoais
            </h3>
            <div>
              <label
                className="block text-sm text-foreground dark:text-foreground mb-1.5"
                style={{ fontWeight: 600 }}
              >
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-foreground dark:text-foreground text-sm focus:outline-none focus:border-primary dark:focus:border-violet-500"
                />
              </div>
            </div>
            <div>
              <label
                className="block text-sm text-foreground dark:text-foreground mb-1.5"
                style={{ fontWeight: 600 }}
              >
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-foreground dark:text-foreground text-sm focus:outline-none focus:border-primary dark:focus:border-violet-500"
                />
              </div>
            </div>
            <div>
              <label
                className="block text-sm text-foreground dark:text-foreground mb-1.5"
                style={{ fontWeight: 600 }}
              >
                Telefone{" "}
                <span
                  className="text-muted-foreground dark:text-muted-foreground"
                  style={{ fontWeight: 400 }}
                >
                  opcional
                </span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-foreground dark:text-foreground text-sm focus:outline-none focus:border-primary dark:focus:border-violet-500"
                />
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary dark:bg-primary text-white hover:bg-primary/90 dark:hover:bg-violet-600 transition-colors text-sm"
              style={{ fontWeight: 600 }}
            >
              <Save className="w-4 h-4" />
              Salvar alterações
            </button>
          </div>
        )}

        {activeTab === "security" && (
          <div className="p-6 space-y-5">
            <h3
              className="text-foreground"
              style={{ fontWeight: 700 }}
            >
              Alterar senha
            </h3>
            <div>
              <label
                className="block text-sm text-foreground dark:text-foreground mb-1.5"
                style={{ fontWeight: 600 }}
              >
                Senha atual
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
                <input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-foreground dark:text-foreground text-sm focus:outline-none focus:border-primary dark:focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-muted-foreground dark:text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                  aria-label={showCurrentPw ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showCurrentPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label
                className="block text-sm text-foreground dark:text-foreground mb-1.5"
                style={{ fontWeight: 600 }}
              >
                Nova senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
                <input
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-foreground dark:text-foreground text-sm focus:outline-none focus:border-primary dark:focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-muted-foreground dark:text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                  aria-label={showNewPw ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showNewPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label
                className="block text-sm text-foreground dark:text-foreground mb-1.5"
                style={{ fontWeight: 600 }}
              >
                Confirmar nova senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className={inputCls}
              />
            </div>
            <button
              onClick={handleChangePassword}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary dark:bg-primary text-white hover:bg-primary/90 dark:hover:bg-violet-600 transition-colors text-sm"
              style={{ fontWeight: 600 }}
            >
              <Shield className="w-4 h-4" />
              Alterar senha
            </button>

            <div className="pt-4 border-t border-border dark:border-white/[0.06] space-y-3">
              <h3
                className="text-foreground"
                style={{ fontWeight: 700 }}
              >
                Zona de perigo
              </h3>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border dark:border-border text-muted-foreground dark:text-foreground hover:bg-background dark:hover:bg-muted transition-colors text-sm w-full"
                style={{ fontWeight: 500 }}
              >
                <LogOut className="w-4 h-4" />
                Sair da conta
              </button>
              <button
                onClick={handleResetData}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-sm w-full"
                style={{ fontWeight: 500 }}
              >
                <Trash2 className="w-4 h-4" />
                Redefinir todos os dados
              </button>
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="p-6 space-y-5">
            {/* Dark mode section */}
            <div>
              <h3
                className="text-foreground mb-4"
                style={{ fontWeight: 700 }}
              >
                Aparência
              </h3>
              <div className="flex items-center justify-between p-4 rounded-xl bg-background dark:bg-muted border border-border dark:border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-card dark:bg-card shadow-sm">
                    {darkMode ? (
                      <Moon className="w-5 h-5 text-primary dark:text-primary" />
                    ) : (
                      <Sun className="w-5 h-5 text-primary dark:text-primary" />
                    )}
                  </div>
                  <div>
                    <p
                      className="text-sm text-foreground dark:text-foreground"
                      style={{ fontWeight: 600 }}
                    >
                      {darkMode ? "Modo escuro ativado" : "Modo escuro"}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-0.5">
                      {darkMode
                        ? "Clique para voltar ao modo claro"
                        : "Ativa um visual mais suave para ambientes escuros"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`w-14 h-7 rounded-full transition-colors relative flex-shrink-0 ${darkMode ? "bg-primary dark:bg-primary" : "bg-gray-200 dark:bg-zinc-600"}`}
                  aria-label={
                    darkMode ? "Desativar modo escuro" : "Ativar modo escuro"
                  }
                  role="switch"
                  aria-checked={darkMode}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 rounded-full bg-card shadow-sm transition-transform ${darkMode ? "translate-x-8" : "translate-x-1"}`}
                  />
                </button>
              </div>
            </div>

            <div className="border-t border-border dark:border-white/[0.06] pt-5">
              <h3
                className="text-foreground mb-4"
                style={{ fontWeight: 700 }}
              >
                Notificações e alertas
              </h3>

              {[
                {
                  label: "Notificações por e-mail",
                  desc: "Receba resumos e alertas por e-mail",
                  value: emailNotifications,
                  setter: setEmailNotifications,
                },
                {
                  label: "Alertas de orçamento",
                  desc: "Avisar quando ultrapassar 80% do orçamento",
                  value: budgetAlerts,
                  setter: setBudgetAlerts,
                },
                {
                  label: "Relatório semanal",
                  desc: "Resumo dos gastos toda segunda-feira",
                  value: weeklyReport,
                  setter: setWeeklyReport,
                },
              ].map(({ label, desc, value, setter }) => (
                <div
                  key={label}
                  className="flex items-center justify-between p-4 rounded-xl bg-background dark:bg-muted border border-border dark:border-white/[0.06] mb-3"
                >
                  <div>
                    <p
                      className="text-sm text-foreground dark:text-foreground"
                      style={{ fontWeight: 600 }}
                    >
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-0.5">
                      {desc}
                    </p>
                  </div>
                  <button
                    onClick={() => setter(!value)}
                    className={`w-14 h-7 rounded-full transition-colors relative flex-shrink-0 ${value ? "bg-primary dark:bg-primary" : "bg-gray-200 dark:bg-zinc-600"}`}
                    role="switch"
                    aria-checked={value}
                    aria-label={label}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 rounded-full bg-card shadow-sm transition-transform ${value ? "translate-x-8" : "translate-x-1"}`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border dark:border-white/[0.06]">
              <h3
                className="text-foreground mb-4"
                style={{ fontWeight: 700 }}
              >
                Sobre o app
              </h3>
              <div className="p-4 rounded-xl bg-background dark:bg-muted border border-border dark:border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-primary dark:text-primary font-bold text-lg">K</span>
                  <span
                    className="text-foreground dark:text-foreground"
                    style={{ fontWeight: 700 }}
                  >
                    Konta v1.0
                  </span>
                </div>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                  Controle financeiro familiar simples e eficiente.
                </p>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-2">
                  Todos os dados são armazenados localmente no seu dispositivo.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
