import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface Member {
  id: string;
  name: string;
  color: string;
  relationship: string;
  isOwner: boolean;
  avatar?: string;
  income?: number;
  isVariableIncome?: boolean;
  desiredContribution?: number;
}

export interface Setup {
  profileType: 'family' | 'individual';
  householdName: string;
  ownerName: string;
  monthlyBudget: number;
  members: Member[];
  hasVariableIncome: boolean;
  monthlyIncome?: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  member: string;
  members?: Array<{ name: string; amount: number }>;
  type: 'expense';
}

export interface Income {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  member: string;
  isRecurring: boolean;
  type: 'income';
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: string;
  color: string;
  createdAt: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  type: 'expense' | 'income';
}

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  setup: Setup | null;
  expenses: Expense[];
  incomes: Income[];
  goals: Goal[];
  customCategories: CustomCategory[];
  hasCompletedSetup: boolean;
  darkMode: boolean;

  // Auth
  login: (email: string, password: string) => { success: boolean; message: string };
  register: (name: string, email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;

  // Setup
  completeSetup: (setup: Setup) => void;

  // Expenses
  addExpense: (expense: Omit<Expense, 'id' | 'type'>) => void;
  editExpense: (id: string, expense: Omit<Expense, 'id' | 'type'>) => void;
  deleteExpense: (id: string) => void;

  // Incomes
  addIncome: (income: Omit<Income, 'id' | 'type'>) => void;
  editIncome: (id: string, income: Omit<Income, 'id' | 'type'>) => void;
  deleteIncome: (id: string) => void;

  // Goals
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  editGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  updateGoalProgress: (id: string, amount: number) => void;

  // Custom Categories
  addCustomCategory: (category: Omit<CustomCategory, 'id'>) => void;
  deleteCustomCategory: (id: string) => void;

  // Members
  addMember: (member: Omit<Member, 'id'>) => void;
  removeMember: (id: string) => void;
  updateMember: (id: string, member: Partial<Member>) => void;

  toggleDarkMode: () => void;
  resetApp: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  USERS: 'konta_users',
  CURRENT_USER_ID: 'konta_current_user_id',
  SETUP: 'konta_setup',
  EXPENSES: 'konta_expenses',
  INCOMES: 'konta_incomes',
  GOALS: 'konta_goals',
  CUSTOM_CATEGORIES: 'konta_custom_categories',
  DARK_MODE: 'konta_dark_mode',
};

function load<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const DEMO_MEMBERS: Member[] = [
  {
    id: 'm1',
    name: 'Ana Souza',
    color: '#16a34a',
    relationship: 'Titular',
    isOwner: true,
    income: 3200,
    isVariableIncome: false,
    desiredContribution: 800,
  },
  {
    id: 'm2',
    name: 'Carlos Souza',
    color: '#0ea5e9',
    relationship: 'Cônjuge',
    isOwner: false,
    income: 2800,
    isVariableIncome: true,
    desiredContribution: 700,
  },
  {
    id: 'm3',
    name: 'Pedro Souza',
    color: '#f59e0b',
    relationship: 'Filho(a)',
    isOwner: false,
    income: 0,
    desiredContribution: 0,
  },
];

const now = new Date();
const months = [-5, -4, -3, -2, -1, 0].map((offset) => {
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return d;
});

function dateStr(year: number, month: number, day: number): string {
  return new Date(year, month, day).toISOString();
}

const DEMO_EXPENSES: Expense[] = [
  // Current month
  { id: 'e1', description: 'Supermercado', amount: 450, category: 'Alimentação', date: dateStr(now.getFullYear(), now.getMonth(), 5), member: 'Ana Souza', type: 'expense' },
  { id: 'e2', description: 'Conta de luz', amount: 180, category: 'Moradia', date: dateStr(now.getFullYear(), now.getMonth(), 8), member: 'Carlos Souza', type: 'expense' },
  { id: 'e3', description: 'Combustível', amount: 320, category: 'Transporte', date: dateStr(now.getFullYear(), now.getMonth(), 10), member: 'Carlos Souza', type: 'expense' },
  { id: 'e4', description: 'Netflix', amount: 45, category: 'Lazer', date: dateStr(now.getFullYear(), now.getMonth(), 12), member: 'Ana Souza', type: 'expense' },
  { id: 'e5', description: 'Farmácia', amount: 95, category: 'Saúde', date: dateStr(now.getFullYear(), now.getMonth(), 14), member: 'Ana Souza', type: 'expense' },
  { id: 'e6', description: 'Escola do Pedro', amount: 680, category: 'Educação', date: dateStr(now.getFullYear(), now.getMonth(), 3), member: 'Ana Souza', type: 'expense' },
  { id: 'e7', description: 'Plano de saúde', amount: 390, category: 'Saúde', date: dateStr(now.getFullYear(), now.getMonth(), 1), member: 'Ana Souza', type: 'expense' },
  { id: 'e8', description: 'Internet', amount: 120, category: 'Moradia', date: dateStr(now.getFullYear(), now.getMonth(), 2), member: 'Carlos Souza', type: 'expense' },
  // Previous months
  { id: 'e9', description: 'Supermercado', amount: 520, category: 'Alimentação', date: dateStr(now.getFullYear(), now.getMonth() - 1, 5), member: 'Ana Souza', type: 'expense' },
  { id: 'e10', description: 'Conta de luz', amount: 210, category: 'Moradia', date: dateStr(now.getFullYear(), now.getMonth() - 1, 8), member: 'Carlos Souza', type: 'expense' },
  { id: 'e11', description: 'Combustível', amount: 280, category: 'Transporte', date: dateStr(now.getFullYear(), now.getMonth() - 1, 10), member: 'Carlos Souza', type: 'expense' },
  { id: 'e12', description: 'Restaurante', amount: 180, category: 'Alimentação', date: dateStr(now.getFullYear(), now.getMonth() - 1, 20), member: 'Ana Souza', type: 'expense' },
  { id: 'e13', description: 'Escola do Pedro', amount: 680, category: 'Educação', date: dateStr(now.getFullYear(), now.getMonth() - 1, 3), member: 'Ana Souza', type: 'expense' },
  { id: 'e14', description: 'Plano de saúde', amount: 390, category: 'Saúde', date: dateStr(now.getFullYear(), now.getMonth() - 1, 1), member: 'Ana Souza', type: 'expense' },
  { id: 'e15', description: 'Academia', amount: 90, category: 'Saúde', date: dateStr(now.getFullYear(), now.getMonth() - 1, 5), member: 'Carlos Souza', type: 'expense' },
  { id: 'e16', description: 'Internet', amount: 120, category: 'Moradia', date: dateStr(now.getFullYear(), now.getMonth() - 1, 2), member: 'Carlos Souza', type: 'expense' },
  { id: 'e17', description: 'Supermercado', amount: 490, category: 'Alimentação', date: dateStr(now.getFullYear(), now.getMonth() - 2, 6), member: 'Ana Souza', type: 'expense' },
  { id: 'e18', description: 'Manutenção carro', amount: 650, category: 'Transporte', date: dateStr(now.getFullYear(), now.getMonth() - 2, 15), member: 'Carlos Souza', type: 'expense' },
  { id: 'e19', description: 'Conta de água', amount: 95, category: 'Moradia', date: dateStr(now.getFullYear(), now.getMonth() - 2, 8), member: 'Carlos Souza', type: 'expense' },
  { id: 'e20', description: 'Cinema', amount: 85, category: 'Lazer', date: dateStr(now.getFullYear(), now.getMonth() - 2, 22), member: 'Pedro Souza', type: 'expense' },
  { id: 'e21', description: 'Escola do Pedro', amount: 680, category: 'Educação', date: dateStr(now.getFullYear(), now.getMonth() - 2, 3), member: 'Ana Souza', type: 'expense' },
  { id: 'e22', description: 'Internet', amount: 120, category: 'Moradia', date: dateStr(now.getFullYear(), now.getMonth() - 2, 2), member: 'Carlos Souza', type: 'expense' },
  { id: 'e23', description: 'Supermercado', amount: 380, category: 'Alimentação', date: dateStr(now.getFullYear(), now.getMonth() - 3, 7), member: 'Ana Souza', type: 'expense' },
  { id: 'e24', description: 'Aluguel', amount: 1400, category: 'Moradia', date: dateStr(now.getFullYear(), now.getMonth() - 3, 1), member: 'Ana Souza', type: 'expense' },
  { id: 'e25', description: 'Combustível', amount: 310, category: 'Transporte', date: dateStr(now.getFullYear(), now.getMonth() - 3, 12), member: 'Carlos Souza', type: 'expense' },
  { id: 'e26', description: 'Escola do Pedro', amount: 680, category: 'Educação', date: dateStr(now.getFullYear(), now.getMonth() - 3, 3), member: 'Ana Souza', type: 'expense' },
  { id: 'e27', description: 'Internet', amount: 120, category: 'Moradia', date: dateStr(now.getFullYear(), now.getMonth() - 3, 2), member: 'Carlos Souza', type: 'expense' },
  { id: 'e28', description: 'Supermercado', amount: 420, category: 'Alimentação', date: dateStr(now.getFullYear(), now.getMonth() - 4, 5), member: 'Ana Souza', type: 'expense' },
  { id: 'e29', description: 'Aluguel', amount: 1400, category: 'Moradia', date: dateStr(now.getFullYear(), now.getMonth() - 4, 1), member: 'Ana Souza', type: 'expense' },
  { id: 'e30', description: 'Combustível', amount: 290, category: 'Transporte', date: dateStr(now.getFullYear(), now.getMonth() - 4, 11), member: 'Carlos Souza', type: 'expense' },
  { id: 'e31', description: 'Escola do Pedro', amount: 680, category: 'Educação', date: dateStr(now.getFullYear(), now.getMonth() - 4, 3), member: 'Ana Souza', type: 'expense' },
  { id: 'e32', description: 'Internet', amount: 120, category: 'Moradia', date: dateStr(now.getFullYear(), now.getMonth() - 4, 2), member: 'Carlos Souza', type: 'expense' },
  { id: 'e33', description: 'Viagem de férias', amount: 1800, category: 'Lazer', date: dateStr(now.getFullYear(), now.getMonth() - 5, 20), member: 'Ana Souza', type: 'expense' },
  { id: 'e34', description: 'Supermercado', amount: 360, category: 'Alimentação', date: dateStr(now.getFullYear(), now.getMonth() - 5, 8), member: 'Ana Souza', type: 'expense' },
  { id: 'e35', description: 'Aluguel', amount: 1400, category: 'Moradia', date: dateStr(now.getFullYear(), now.getMonth() - 5, 1), member: 'Ana Souza', type: 'expense' },
  { id: 'e36', description: 'Internet', amount: 120, category: 'Moradia', date: dateStr(now.getFullYear(), now.getMonth() - 5, 2), member: 'Carlos Souza', type: 'expense' },
];

const DEMO_INCOMES: Income[] = months.flatMap((m) => [
  { id: `i${m.getMonth()}a`, description: 'Salário Ana', amount: 3200, category: 'Salário', date: dateStr(m.getFullYear(), m.getMonth(), 5), member: 'Ana Souza', isRecurring: true, type: 'income' as const },
  { id: `i${m.getMonth()}c`, description: 'Renda Carlos', amount: m.getMonth() % 2 === 0 ? 2800 : 3100, category: 'Autônomo', date: dateStr(m.getFullYear(), m.getMonth(), 10), member: 'Carlos Souza', isRecurring: false, type: 'income' as const },
]);

const DEMO_GOALS: Goal[] = [
  { id: 'g1', title: 'Reserva de emergência', description: '6 meses de despesas', targetAmount: 18000, currentAmount: 7500, deadline: '2025-12-31', category: 'reserva', color: '#16a34a', createdAt: new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString() },
  { id: 'g2', title: 'Viagem para a praia', description: 'Férias em família nas praias do Nordeste', targetAmount: 5000, currentAmount: 2200, deadline: '2025-07-01', category: 'viagem', color: '#0ea5e9', createdAt: new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString() },
  { id: 'g3', title: 'Novo notebook', description: 'Para trabalho e estudos', targetAmount: 3500, currentAmount: 3500, deadline: '2025-03-01', category: 'compra', color: '#8b5cf6', createdAt: new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString() },
  { id: 'g4', title: 'Troca de carro', description: 'Carro mais econômico para entregas', targetAmount: 25000, currentAmount: 4000, deadline: '2026-12-31', category: 'veiculo', color: '#f59e0b', createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString() },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => load<User[]>(STORAGE_KEYS.USERS) ?? []);
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => load<string>(STORAGE_KEYS.CURRENT_USER_ID));
  const [setup, setSetup] = useState<Setup | null>(() => load<Setup>(STORAGE_KEYS.SETUP));
  const [expenses, setExpenses] = useState<Expense[]>(() => load<Expense[]>(STORAGE_KEYS.EXPENSES) ?? []);
  const [incomes, setIncomes] = useState<Income[]>(() => load<Income[]>(STORAGE_KEYS.INCOMES) ?? []);
  const [goals, setGoals] = useState<Goal[]>(() => load<Goal[]>(STORAGE_KEYS.GOALS) ?? []);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(() => load<CustomCategory[]>(STORAGE_KEYS.CUSTOM_CATEGORIES) ?? []);
  const [darkMode, setDarkMode] = useState<boolean>(() => load<boolean>(STORAGE_KEYS.DARK_MODE) ?? false);

  const currentUser = users.find((u) => u.id === currentUserId) ?? null;
  const isAuthenticated = currentUser !== null;
  const hasCompletedSetup = setup !== null;

  useEffect(() => { save(STORAGE_KEYS.USERS, users); }, [users]);
  useEffect(() => { save(STORAGE_KEYS.CURRENT_USER_ID, currentUserId); }, [currentUserId]);
  useEffect(() => { if (setup) save(STORAGE_KEYS.SETUP, setup); }, [setup]);
  useEffect(() => { save(STORAGE_KEYS.EXPENSES, expenses); }, [expenses]);
  useEffect(() => { save(STORAGE_KEYS.INCOMES, incomes); }, [incomes]);
  useEffect(() => { save(STORAGE_KEYS.GOALS, goals); }, [goals]);
  useEffect(() => { save(STORAGE_KEYS.CUSTOM_CATEGORIES, customCategories); }, [customCategories]);
  useEffect(() => {
    save(STORAGE_KEYS.DARK_MODE, darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Apply dark mode on initial load
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const login = (email: string, password: string) => {
    if (email === 'demo@konta.com' && password === 'demo123') {
      const demoUser: User = { id: 'demo', name: 'Ana Souza', email: 'demo@konta.com', password: 'demo123', createdAt: new Date().toISOString() };
      const existing = users.find((u) => u.id === 'demo');
      if (!existing) setUsers((prev) => [...prev, demoUser]);
      setCurrentUserId('demo');
      if (!setup) {
        setSetup({ profileType: 'family', householdName: 'Família Souza', ownerName: 'Ana Souza', monthlyBudget: 6000, members: DEMO_MEMBERS, hasVariableIncome: true, monthlyIncome: 6000 });
        setExpenses(DEMO_EXPENSES);
        setIncomes(DEMO_INCOMES);
        setGoals(DEMO_GOALS);
      }
      return { success: true, message: 'Login realizado!' };
    }
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return { success: false, message: 'E-mail ou senha incorretos.' };
    setCurrentUserId(user.id);
    return { success: true, message: 'Bem-vindo de volta!' };
  };

  const register = (name: string, email: string, password: string) => {
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Este e-mail já está cadastrado.' };
    }
    const newUser: User = { id: Date.now().toString(), name, email, password, createdAt: new Date().toISOString() };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    return { success: true, message: 'Conta criada com sucesso!' };
  };

  const logout = () => {
    setCurrentUserId(null);
    setSetup(null);
    setExpenses([]);
    setIncomes([]);
    setGoals([]);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.SETUP);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.INCOMES);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
  };

  const updateUserProfile = (data: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === currentUserId ? { ...u, ...data } : u)));
  };

  const completeSetup = (newSetup: Setup) => setSetup(newSetup);

  const addExpense = (expense: Omit<Expense, 'id' | 'type'>) =>
    setExpenses((prev) => [...prev, { ...expense, id: `e${Date.now()}${Math.random().toString(36).substring(2, 7)}`, type: 'expense' }]);
  const editExpense = (id: string, expense: Omit<Expense, 'id' | 'type'>) =>
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...expense, id, type: 'expense' } : e)));
  const deleteExpense = (id: string) => setExpenses((prev) => prev.filter((e) => e.id !== id));

  const addIncome = (income: Omit<Income, 'id' | 'type'>) =>
    setIncomes((prev) => [...prev, { ...income, id: `i${Date.now()}${Math.random().toString(36).substring(2, 7)}`, type: 'income' }]);
  const editIncome = (id: string, income: Omit<Income, 'id' | 'type'>) =>
    setIncomes((prev) => prev.map((e) => (e.id === id ? { ...income, id, type: 'income' } : e)));
  const deleteIncome = (id: string) => setIncomes((prev) => prev.filter((e) => e.id !== id));

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt'>) =>
    setGoals((prev) => [...prev, { ...goal, id: `g${Date.now()}${Math.random().toString(36).substring(2, 7)}`, createdAt: new Date().toISOString() }]);
  const editGoal = (id: string, goal: Partial<Goal>) =>
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...goal } : g)));
  const deleteGoal = (id: string) => setGoals((prev) => prev.filter((g) => g.id !== id));
  const updateGoalProgress = (id: string, amount: number) =>
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) } : g)));

  const addCustomCategory = (category: Omit<CustomCategory, 'id'>) =>
    setCustomCategories((prev) => [...prev, { ...category, id: `c${Date.now()}${Math.random().toString(36).substring(2, 7)}` }]);
  const deleteCustomCategory = (id: string) =>
    setCustomCategories((prev) => prev.filter((c) => c.id !== id));

  const addMember = (member: Omit<Member, 'id'>) => {
    if (!setup) return;
    setSetup({ ...setup, members: [...setup.members, { ...member, id: `m${Date.now()}${Math.random().toString(36).substring(2, 7)}` }] });
  };
  const removeMember = (id: string) => {
    if (!setup) return;
    setSetup({ ...setup, members: setup.members.filter((m) => m.id !== id) });
  };
  const updateMember = (id: string, data: Partial<Member>) => {
    if (!setup) return;
    setSetup({ ...setup, members: setup.members.map((m) => (m.id === id ? { ...m, ...data } : m)) });
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const resetApp = () => {
    setSetup(null);
    setExpenses([]);
    setIncomes([]);
    setGoals([]);
    [STORAGE_KEYS.SETUP, STORAGE_KEYS.EXPENSES, STORAGE_KEYS.INCOMES, STORAGE_KEYS.GOALS].forEach((k) => localStorage.removeItem(k));
  };

  return (
    <AppContext.Provider value={{
      currentUser, isAuthenticated, users, setup, expenses, incomes, goals, customCategories, hasCompletedSetup,
      darkMode,
      login, register, logout, updateUserProfile,
      completeSetup,
      addExpense, editExpense, deleteExpense,
      addIncome, editIncome, deleteIncome,
      addGoal, editGoal, deleteGoal, updateGoalProgress,
      addCustomCategory, deleteCustomCategory,
      addMember, removeMember, updateMember,
      toggleDarkMode,
      resetApp,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}