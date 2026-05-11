import { useState } from "react";
import {
  BookOpen,
  Clock,
  Tag,
  ChevronRight,
  Search,
  X,
  Star,
  TrendingUp,
  PiggyBank,
  CreditCard,
  BarChart3,
  Home,
  Lightbulb,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: number;
  level: "iniciante" | "intermediário" | "avançado";
  content: string[];
  tips: string[];
  icon: React.ElementType;
  color: string;
  featured?: boolean;
}

const ARTICLES: Article[] = [
  {
    id: "1",
    title: "Como criar um orçamento familiar que funciona",
    description:
      "Aprenda a organizar as finanças da família com um orçamento simples e eficiente.",
    category: "Orçamento",
    readTime: 5,
    level: "iniciante",
    content: [
      "Um orçamento familiar é um plano financeiro que ajuda a controlar quanto dinheiro entra e sai da sua casa. Com ele, você sabe exatamente para onde vai cada real.",
      "O método 50/30/20 é uma das formas mais simples: 50% da renda para necessidades básicas (moradia, alimentação, transporte), 30% para desejos (lazer, viagens) e 20% para poupança e investimentos.",
      "Para começar, liste todas as fontes de renda da família. Em seguida, anote todas as despesas fixas (aluguel, escola, plano de saúde) e variáveis (mercado, combustível).",
    ],
    tips: [
      "Use o Konta para registrar todos os gastos, mesmo os pequenos",
      "Revise o orçamento mensalmente e ajuste conforme necessário",
      "Envolva todos os membros da família no planejamento",
      'Crie uma categoria "Imprevisto" de pelo menos 5% da renda',
    ],
    icon: BarChart3,
    color: "#16a34a",
    featured: true,
  },
  {
    id: "2",
    title: "Fundo de emergência: sua rede de segurança financeira",
    description:
      "Por que ter uma reserva para imprevistos é essencial para qualquer família.",
    category: "Poupança",
    readTime: 4,
    level: "iniciante",
    content: [
      "O fundo de emergência é uma reserva financeira para cobrir gastos inesperados como desemprego, problemas de saúde ou reparos urgentes. Sem ele, qualquer imprevisto pode virar uma dívida.",
      "O ideal é ter de 3 a 6 meses do valor das suas despesas mensais guardadas. Se você gasta R$ 3.000 por mês, a reserva ideal é entre R$ 9.000 e R$ 18.000.",
      "Guarde esse dinheiro em aplicações de alta liquidez (como CDB com liquidez diária ou Tesouro Selic) para poder resgatar quando precisar.",
    ],
    tips: [
      "Comece com uma meta pequena: R$ 1.000 é um ótimo começo",
      "Automatize um depósito fixo todo mês no dia do salário",
      "Não use o fundo de emergência para compras planejadas",
      "Ao usar parte da reserva, recomponha o mais rápido possível",
    ],
    icon: PiggyBank,
    color: "#0ea5e9",
    featured: true,
  },
  {
    id: "3",
    title: "Controlando e quitando dívidas",
    description:
      "Estratégias práticas para sair das dívidas e evitar que elas voltem.",
    category: "Dívidas",
    readTime: 6,
    level: "intermediário",
    content: [
      "O primeiro passo para sair das dívidas é encarar a situação de frente. Liste todas as suas dívidas: cartão de crédito, cheque especial, empréstimos. Anote o valor, a taxa de juros e o valor mínimo de pagamento de cada uma.",
      "Existem dois métodos populares: o método avalanche (pagar primeiro as dívidas com maiores juros) e o método bola de neve (pagar primeiro as menores dívidas para ganhar momentum). Ambos funcionam — escolha o que mais combina com você.",
      "Evite o rotativo do cartão de crédito a todo custo. Os juros chegam a 400% ao ano no Brasil. Se precisar parcelar, prefira o parcelado sem juros.",
    ],
    tips: [
      "Negocie taxas menores diretamente com o banco ou credor",
      "Nunca use um empréstimo para pagar outro (exceto com taxa bem menor)",
      "Corte gastos supérfluos temporariamente para acelerar o pagamento",
      "Comemore cada dívida quitada — é uma vitória real!",
    ],
    icon: CreditCard,
    color: "#ef4444",
  },
  {
    id: "4",
    title: "Como investir mesmo com pouco dinheiro",
    description:
      "Desmistificando os investimentos para quem está começando do zero.",
    category: "Investimentos",
    readTime: 7,
    level: "iniciante",
    content: [
      "Muitas pessoas acreditam que precisam de muito dinheiro para começar a investir. Isso não é verdade! Com R$ 30, você já pode começar no Tesouro Direto, que é uma das opções mais seguras do Brasil.",
      "Antes de investir, é importante entender seu perfil de investidor: conservador (prefere segurança), moderado (aceita algum risco) ou arrojado (tolera mais risco por maiores retornos).",
      "Para iniciantes, as melhores opções são: Tesouro Direto (renda fixa, seguro), CDB (Certificado de Depósito Bancário), fundos de renda fixa e poupança (apesar dos rendimentos baixos).",
    ],
    tips: [
      "Sempre complete o fundo de emergência antes de investir",
      "Diversifique: não coloque tudo em um único investimento",
      "Reinvista os rendimentos para aproveitar os juros compostos",
      "Invista regularmente, mesmo que seja pouco — a consistência importa",
    ],
    icon: TrendingUp,
    color: "var(--primary)",
  },
  {
    id: "5",
    title: "Planejando a compra do imóvel próprio",
    description:
      "O guia completo para conquistar a casa própria de forma planejada.",
    category: "Objetivos",
    readTime: 8,
    level: "intermediário",
    content: [
      "Comprar um imóvel é um dos maiores objetivos financeiros de uma família. O planejamento correto pode fazer toda a diferença entre uma compra tranquila e uma fonte de estresse financeiro.",
      "Para um financiamento, normalmente você precisa de 20% a 30% do valor do imóvel como entrada. Em um imóvel de R$ 300.000, isso representa R$ 60.000 a R$ 90.000. Comece a poupar cedo!",
      "Use o Fundo de Garantia (FGTS) a seu favor: ele pode ser usado como entrada ou para amortizar o saldo devedor. Verifique seu saldo e as regras de utilização.",
    ],
    tips: [
      "Defina o valor máximo que pode comprometer: ideal é até 30% da renda",
      "Simule o financiamento em diferentes bancos e compare as taxas",
      "Considere os custos extras: ITBI, cartório, reformas (geralmente 5-10% do imóvel)",
      "Não comprometa o fundo de emergência para dar entrada",
    ],
    icon: Home,
    color: "#f59e0b",
  },
  {
    id: "6",
    title: "10 hábitos financeiros de quem nunca fica no vermelho",
    description:
      "Pequenas mudanças diárias que fazem grande diferença no final do mês.",
    category: "Hábitos",
    readTime: 3,
    level: "iniciante",
    content: [
      "Pessoas que mantêm finanças saudáveis não necessariamente ganham mais — elas administram melhor o que têm. Tudo começa com hábitos simples praticados consistentemente.",
      "O primeiro passo é controlar os gastos. Isso não significa cortar tudo que é prazeroso, mas sim fazer escolhas conscientes. Anote tudo que você gasta — a consciência por si só já reduz gastos desnecessários.",
      "Pague-se primeiro: antes de qualquer conta, reserve uma parte da renda para sua poupança ou investimento. Trate a poupança como uma despesa obrigatória, não como o que sobra no final do mês.",
    ],
    tips: [
      "Faça compras com lista — evita impulsos no mercado",
      "Espere 24h antes de fazer compras não essenciais acima de R$ 100",
      "Use o Konta para revisar seus gastos semanalmente",
      "Cozinhe em casa mais vezes por semana",
      "Compare preços antes de comprar",
      'Evite parcelas "tentadoras" — pense no total, não na prestação',
    ],
    icon: Lightbulb,
    color: "#ec4899",
    featured: true,
  },
];

const CATEGORIES = [
  "Todos",
  "Orçamento",
  "Poupança",
  "Dívidas",
  "Investimentos",
  "Objetivos",
  "Hábitos",
];
const LEVELS = ["Todos", "iniciante", "intermediário", "avançado"];

const QUICK_TIPS = [
  {
    text: "Regra 50/30/20: 50% necessidades, 30% desejos, 20% poupança",
    color: "#16a34a",
  },
  {
    text: "Guarde pelo menos 3 meses de despesas como reserva de emergência",
    color: "#0ea5e9",
  },
  {
    text: "Revise suas assinaturas mensalmente — cancele o que não usa",
    color: "#f59e0b",
  },
  {
    text: "Compras por impulso custam em média R$ 300/mês para famílias brasileiras",
    color: "var(--primary)",
  },
  {
    text: "Juros compostos: investir R$ 200/mês por 20 anos pode render mais de R$ 100.000",
    color: "#ef4444",
  },
];

export function EducationPage() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todos");
  const [filterLevel, setFilterLevel] = useState("Todos");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filtered = ARTICLES.filter((a) => {
    const matchCat =
      filterCategory === "Todos" || a.category === filterCategory;
    const matchLevel = filterLevel === "Todos" || a.level === filterLevel;
    const matchSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchLevel && matchSearch;
  });

  const featured = ARTICLES.filter((a) => a.featured);
  const levelColor = (level: string) => {
    if (level === "iniciante") return "bg-accent text-primary";
    if (level === "intermediário") return "bg-amber-50 text-amber-600";
    return "bg-purple-50 text-purple-600";
  };

  if (selectedArticle) {
    const Icon = selectedArticle.icon;
    return (
      <div className="p-4 sm:p-6 max-w-[800px] mx-auto">
        <button
          onClick={() => setSelectedArticle(null)}
          className="flex items-center gap-2 text-sm text-primary dark:text-primary mb-6 hover:text-foreground dark:hover:text-primary transition-colors"
          style={{ fontWeight: 500 }}
        >
          ← Voltar para Educação
        </button>
        <div className="bg-card dark:bg-card rounded-2xl border border-border dark:border-white/[0.06] shadow-sm overflow-hidden">
          <div
            className="p-6 border-b border-border dark:border-white/[0.06]"
            style={{
              background: `linear-gradient(135deg, ${selectedArticle.color}10, ${selectedArticle.color}05)`,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${selectedArticle.color}20` }}
              >
                <Icon
                  className="w-6 h-6"
                  style={{ color: selectedArticle.color }}
                />
              </div>
              <div>
                <span
                  className={`inline-flex text-xs px-2.5 py-1 rounded-full ${levelColor(selectedArticle.level)}`}
                  style={{ fontWeight: 500 }}
                >
                  {selectedArticle.level}
                </span>
              </div>
            </div>
            <h1
              className="text-2xl text-foreground mb-2"
              style={{ fontWeight: 700 }}
            >
              {selectedArticle.title}
            </h1>
            <p className="text-muted-foreground dark:text-muted-foreground">
              {selectedArticle.description}
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground dark:text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {selectedArticle.readTime} min de leitura
              </span>
              <span className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                {selectedArticle.category}
              </span>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {selectedArticle.content.map((paragraph, i) => (
              <p
                key={i}
                className="text-foreground dark:text-foreground leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
            <div className="mt-6 p-5 rounded-xl bg-background dark:bg-muted border border-border dark:border-white/[0.06]">
              <h3
                className="text-foreground mb-3 flex items-center gap-2"
                style={{ fontWeight: 700 }}
              >
                <Lightbulb className="w-5 h-5 text-primary dark:text-primary" />
                Dicas práticas
              </h3>
              <ul className="space-y-2">
                {selectedArticle.tips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-muted-foreground dark:text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-primary mt-2 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-2xl text-foreground"
          style={{ fontWeight: 700 }}
        >
          Educação financeira
        </h1>
        <p className="text-muted-foreground dark:text-muted-foreground text-sm mt-0.5">
          Aprenda a cuidar melhor do seu dinheiro
        </p>
      </div>

      {/* Quick tips */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-3 pb-2" style={{ minWidth: "max-content" }}>
          {QUICK_TIPS.map((tip, i) => (
            <div
              key={i}
              className="flex-shrink-0 max-w-xs p-4 rounded-2xl bg-card dark:bg-card border border-border dark:border-white/[0.06] shadow-sm"
            >
              <div className="flex items-start gap-2">
                <div
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: tip.color }}
                />
                <p
                  className="text-sm text-foreground dark:text-foreground"
                  style={{ fontWeight: 500 }}
                >
                  {tip.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured */}
      <div className="mb-8">
        <h2
          className="text-lg text-foreground mb-4"
          style={{ fontWeight: 700 }}
        >
          Recomendados para você
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featured.map((article) => {
            const Icon = article.icon;
            return (
              <button
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="text-left bg-card dark:bg-card rounded-2xl p-5 border border-border dark:border-white/[0.06] shadow-sm hover:shadow-md hover:border-border dark:hover:border-zinc-600 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${article.color}20` }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: article.color }}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span
                      className="text-xs text-amber-600 dark:text-amber-400"
                      style={{ fontWeight: 500 }}
                    >
                      Destaque
                    </span>
                  </div>
                </div>
                <h3
                  className="text-sm text-foreground dark:text-foreground mb-2 group-hover:text-primary dark:group-hover:text-violet-400 transition-colors"
                  style={{ fontWeight: 700 }}
                >
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-3 line-clamp-2">
                  {article.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{article.readTime} min</span>
                  <span
                    className={`ml-auto px-2 py-0.5 rounded-full ${levelColor(article.level)}`}
                    style={{ fontWeight: 500 }}
                  >
                    {article.level}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-card dark:bg-card rounded-2xl p-4 border border-border dark:border-white/[0.06] shadow-sm mb-6">
        <div className="flex flex-wrap gap-3 mb-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar artigos..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border dark:border-border bg-background dark:bg-background text-sm text-foreground dark:text-foreground focus:outline-none focus:border-primary dark:focus:border-violet-500"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setFilterCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all
                  ${filterCategory === c ? "bg-primary dark:bg-primary text-white" : "bg-background dark:bg-muted text-muted-foreground dark:text-muted-foreground hover:bg-accent dark:hover:bg-zinc-600 hover:text-primary dark:hover:text-primary"}`}
                style={{ fontWeight: 500 }}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 ml-auto">
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setFilterLevel(l)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all capitalize
                  ${filterLevel === l ? "bg-primary dark:bg-muted text-white" : "bg-background dark:bg-muted text-muted-foreground dark:text-muted-foreground hover:bg-accent dark:hover:bg-zinc-600"}`}
                style={{ fontWeight: 500 }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground dark:text-muted-foreground opacity-30" />
            <p className="text-muted-foreground dark:text-muted-foreground">
              Nenhum artigo encontrado.
            </p>
          </div>
        ) : (
          filtered.map((article) => {
            const Icon = article.icon;
            return (
              <button
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="text-left bg-card dark:bg-card rounded-2xl p-5 border border-border dark:border-white/[0.06] shadow-sm hover:shadow-md hover:border-border dark:hover:border-zinc-600 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${article.color}20` }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: article.color }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        className="text-sm text-foreground dark:text-foreground group-hover:text-primary dark:group-hover:text-violet-400 transition-colors leading-snug"
                        style={{ fontWeight: 700 }}
                      >
                        {article.title}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-muted-foreground dark:text-muted-foreground flex-shrink-0 group-hover:text-primary dark:group-hover:text-violet-400 transition-colors mt-0.5" />
                    </div>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-3 line-clamp-2">
                      {article.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground dark:text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {article.category}
                      </span>
                      <span
                        className={`ml-auto px-2 py-0.5 rounded-full ${levelColor(article.level)}`}
                        style={{ fontWeight: 500 }}
                      >
                        {article.level}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
