import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";
import { Leaf, Eye, EyeOff, LogIn } from "lucide-react";

export function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = login(email, password);
    setLoading(false);
    if (result.success) {
      setLoginError("");
      toast.success(result.message);
      navigate("/dashboard");
    } else {
      setLoginError(result.message);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = login("demo@konta.com", "demo123");
    setLoading(false);
    if (result.success) {
      toast.success("Bem-vindo à conta demo!");
      navigate("/dashboard");
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
            Bem-vindo de volta
          </h1>
          <p className="text-muted-foreground text-center mt-1">
            Entre na sua conta para continuar
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="••••••••"
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

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="inline-flex items-center text-sm text-primary hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-accent"
                style={{ fontWeight: 500 }}
              >
                Esqueceu a senha?
              </Link>
            </div>

            {loginError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                <span className="text-sm text-red-600 dark:text-red-400 flex-1">
                  {loginError}
                </span>
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center text-sm text-primary hover:underline flex-shrink-0 px-2 py-1 rounded-lg"
                  style={{ fontWeight: 500 }}
                >
                  Recuperar senha
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
              style={{ fontWeight: 600 }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Entrar
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={handleDemo}
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl border-2 border-primary text-primary hover:bg-background disabled:opacity-60 transition-colors"
            style={{ fontWeight: 600 }}
          >
            Entrar como demo
          </button>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Não tem conta?{" "}
            <Link
              to="/register"
              className="inline-flex items-center text-primary hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-accent"
              style={{ fontWeight: 600 }}
            >
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
