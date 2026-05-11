import { Link } from "react-router";
import {
  Leaf,
  TrendingUp,
  Users,
  Target,
  BookOpen,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Controle total",
    desc: "Acompanhe receitas e despesas com clareza e simplicidade.",
  },
  {
    icon: Users,
    title: "Para toda família",
    desc: "Gerencie as finanças de todos os membros em um só lugar.",
  },
  {
    icon: Target,
    title: "Metas realizáveis",
    desc: "Defina objetivos financeiros e acompanhe o progresso.",
  },
  {
    icon: BookOpen,
    title: "Educação financeira",
    desc: "Dicas e conteúdos personalizados para o seu perfil.",
  },
];

export function WelcomePage() {
  return (
    <div className="min-h-screen bg-card">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <span className="text-xl text-foreground" style={{ fontWeight: 700 }}>
            Konta
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm text-primary hover:text-foreground transition-colors"
            style={{ fontWeight: 500 }}
          >
            Entrar
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm hover:bg-primary/90 transition-colors"
            style={{ fontWeight: 500 }}
          >
            Criar conta grátis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 md:px-12 pt-16 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_transparent_60%)] opacity-60" />
        <div className="relative max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-primary text-sm mb-6"
            style={{ fontWeight: 500 }}
          >
            <span className="font-bold">K</span>
            Finanças familiares simplificadas
          </div>
          <h1
            className="text-4xl md:text-5xl text-foreground mb-6 leading-tight"
            style={{ fontWeight: 700 }}
          >
            Cuide do dinheiro da sua família com{" "}
            <span className="text-primary">tranquilidade</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            O Konta é um aplicativo simples e intuitivo para controlar as
            finanças da família. Acompanhe receitas, despesas, metas e muito
            mais — tudo em um só lugar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary"
              style={{ fontWeight: 600 }}
            >
              Começar gratuitamente
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-primary text-primary hover:bg-background transition-colors"
              style={{ fontWeight: 600 }}
            >
              Ver demonstração
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Use <strong>demo@konta.com</strong> / <strong>demo123</strong> para
            ver o app com dados
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-16 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl text-foreground mb-3"
              style={{ fontWeight: 700 }}
            >
              Tudo que você precisa
            </h2>
            <p className="text-muted-foreground">
              Recursos pensados para facilitar o dia a dia financeiro da família
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-card rounded-2xl p-6 shadow-sm border border-border"
              >
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3
                  className="text-foreground mb-2"
                  style={{ fontWeight: 600 }}
                >
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 md:px-12 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-3xl text-foreground mb-3"
              style={{ fontWeight: 700 }}
            >
              Como funciona
            </h2>
            <p className="text-muted-foreground">Em apenas 3 passos simples</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Crie sua conta",
                desc: "Cadastro rápido com nome, e-mail e senha.",
              },
              {
                step: "02",
                title: "Configure o perfil",
                desc: "Adicione membros da família e defina sua renda.",
              },
              {
                step: "03",
                title: "Acompanhe tudo",
                desc: "Registre gastos, defina metas e veja relatórios.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="flex flex-col items-center text-center"
              >
                <div
                  className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl mb-4"
                  style={{ fontWeight: 700 }}
                >
                  {step}
                </div>
                <h3
                  className="text-foreground mb-2"
                  style={{ fontWeight: 600 }}
                >
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-6 md:px-12 py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl mb-10" style={{ fontWeight: 700 }}>
            Por que escolher o Konta?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            {[
              "Interface simples e intuitiva",
              "Dados seguros no seu dispositivo",
              "Funciona em qualquer tela",
              "Sem mensalidade, gratuito",
              "Histórico completo de gastos",
              "Relatórios e gráficos claros",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-accent/80 flex-shrink-0" />
                <span className="text-accent">{benefit}</span>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-card text-primary hover:bg-background transition-colors shadow-xl"
              style={{ fontWeight: 600 }}
            >
              Começar agora — é grátis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 bg-primary text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="font-bold text-accent/80">K</span>
          <span className="text-accent/80" style={{ fontWeight: 700 }}>
            Konta
          </span>
        </div>
        <p className="text-sm text-accent/80/70">
          © 2025 Konta — Controle financeiro familiar
        </p>
      </footer>
    </div>
  );
}
