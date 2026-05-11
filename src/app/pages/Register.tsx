import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";
import { Leaf, Eye, EyeOff, UserPlus } from "lucide-react";

export function RegisterPage() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirm) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = register(name, email, password);
    setLoading(false);
    if (result.success) {
      toast.success("Conta criada com sucesso!");
      navigate("/setup");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <span
              className="text-2xl text-foreground"
              style={{ fontWeight: 700 }}
            >
              Konta
            </span>
          </Link>
          <h1
            className="text-2xl text-foreground text-center"
            style={{ fontWeight: 700 }}
          >
            Crie sua conta
          </h1>
          <p className="text-muted-foreground text-center mt-1">
            Comece a controlar as finanças da família
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-sm text-foreground mb-1.5"
                style={{ fontWeight: 600 }}
              >
                Nome completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-[#9ca3af] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div>
              <label
                className="block text-sm text-foreground mb-1.5"
                style={{ fontWeight: 600 }}
              >
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-[#9ca3af] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
            <div>
              <label
                className="block text-sm text-foreground mb-1.5"
                style={{ fontWeight: 600 }}
              >
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-[#9ca3af] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label
                className="block text-sm text-foreground mb-1.5"
                style={{ fontWeight: 600 }}
              >
                Confirmar senha
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repita a senha"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-[#9ca3af] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
              style={{ fontWeight: 600 }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Criar conta
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-5">
            Ao criar uma conta, você concorda com nossos{" "}
            <span className="text-primary">Termos de Uso</span> e{" "}
            <span className="text-primary">Política de Privacidade</span>.
          </p>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Já tem conta?{" "}
            <Link
              to="/login"
              className="inline-flex items-center text-primary hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-accent"
              style={{ fontWeight: 600 }}
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
