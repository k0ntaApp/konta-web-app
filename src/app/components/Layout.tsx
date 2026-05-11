import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import { useApp } from "../context/AppContext";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  BookOpen,
  User,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const navGroups = [
  {
    id: "financas",
    label: "Finanças",
    routes: ["/income", "/expenses", "/goals"],
    items: [
      { to: "/income", icon: TrendingUp, label: "Receitas" },
      { to: "/expenses", icon: TrendingDown, label: "Despesas" },
      { to: "/goals", icon: Target, label: "Metas" },
    ],
  },
  {
    id: "geral",
    label: "Geral",
    routes: ["/dashboard", "/members", "/education", "/reports"],
    items: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/members", icon: Users, label: "Membros" },
      { to: "/education", icon: BookOpen, label: "Educação" },
      { to: "/reports", icon: FileText, label: "Relatórios" },
    ],
  },
];

export function AppLayout() {
  const { currentUser, setup, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      init[g.id] = true;
    });
    return init;
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials =
    currentUser?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("") ?? "K";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border shadow-sm transition-all duration-300
          lg:static lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ width: "240px" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <span
            className="text-xl text-sidebar-foreground"
            style={{ fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            Konta
          </span>
          <button
            className="ml-auto lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Household name */}
        {setup && (
          <div className="px-6 pt-4 pb-2">
            <p
              className="text-xs text-muted-foreground uppercase tracking-wider"
              style={{ fontWeight: 600 }}
            >
              Família
            </p>
            <p
              className="text-sm text-sidebar-foreground mt-0.5"
              style={{ fontWeight: 500 }}
            >
              {setup.householdName}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          {navGroups.map((group) => {
            const isGroupActive = group.routes.some((r) =>
              location.pathname.startsWith(r)
            );
            const isOpen = openGroups[group.id] ?? isGroupActive;
            return (
              <div key={group.id} className="mb-1">
                <button
                  onClick={() =>
                    setOpenGroups((prev) => ({ ...prev, [group.id]: !isOpen }))
                  }
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl transition-colors text-left ${
                    isGroupActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <span
                    className="text-xs uppercase tracking-wider flex-1"
                    style={{ fontWeight: 600 }}
                  >
                    {group.label}
                  </span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isOpen ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="mt-0.5">
                    {group.items.map(({ to, icon: Icon, label }) => (
                      <NavLink
                        key={to}
                        to={to}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 pl-5 rounded-xl mb-0.5 transition-all duration-150 group ${
                            isActive
                              ? "bg-accent text-primary"
                              : "text-sidebar-foreground hover:bg-accent hover:text-primary"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon
                              className={`w-4 h-4 flex-shrink-0 ${
                                isActive
                                  ? "text-primary"
                                  : "text-muted-foreground group-hover:text-primary"
                              }`}
                            />
                            <span className="text-sm" style={{ fontWeight: 500 }}>
                              {label}
                            </span>
                            {isActive && (
                              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Profile & Logout */}
        <div className="border-t border-sidebar-border p-3">
          <NavLink
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all duration-150 group
              ${
                isActive
                  ? "bg-accent text-primary"
                  : "text-sidebar-foreground hover:bg-accent hover:text-primary"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <User
                  className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                />
                <span className="text-sm" style={{ fontWeight: 500 }}>
                  Perfil
                </span>
              </>
            )}
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-xl w-full text-left text-destructive hover:bg-destructive/10 transition-all duration-150"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm" style={{ fontWeight: 500 }}>
              Sair
            </span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 bg-card border-b border-sidebar-border flex-shrink-0">
          <button
            className="lg:hidden p-2.5 rounded-xl text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1" />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm"
                  style={{ fontWeight: 600 }}
                >
                  {initials}
                </div>
              )}
              <div className="hidden md:block text-left">
                <p
                  className="text-sm text-foreground dark:text-foreground"
                  style={{ fontWeight: 500 }}
                >
                  {currentUser?.name}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-lg border border-border z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p
                      className="text-sm text-foreground"
                      style={{ fontWeight: 500 }}
                    >
                      {currentUser?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentUser?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Perfil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
