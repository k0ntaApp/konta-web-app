import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Leaf, Mail, ArrowLeft, CheckCircle } from "lucide-react";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Digite seu e-mail.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
    toast.success("Instruções enviadas para o seu e-mail!");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h2
                className="text-xl text-foreground mb-2"
                style={{ fontWeight: 700 }}
              >
                E-mail enviado!
              </h2>
              <p className="text-muted-foreground mb-6">
                Enviamos as instruções de recuperação para{" "}
                <strong>{email}</strong>. Verifique sua caixa de entrada.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
                style={{ fontWeight: 600 }}
              >
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
                <h1
                  className="text-xl text-foreground mb-2"
                  style={{ fontWeight: 700 }}
                >
                  Recuperar senha
                </h1>
                <p className="text-sm text-muted-foreground">
                  Digite seu e-mail e enviaremos as instruções para redefinir
                  sua senha.
                </p>
              </div>

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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Enviar instruções"
                  )}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-foreground transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
