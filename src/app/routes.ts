import { createBrowserRouter } from 'react-router';
import { Root } from './Root';
import { WelcomePage } from './pages/Welcome';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { ForgotPasswordPage } from './pages/ForgotPassword';
import { SetupPage } from './pages/Setup';
import { AppLayout } from './components/Layout';
import { DashboardPage } from './pages/Dashboard';
import { ExpensesPage } from './pages/Expenses';
import { IncomePage } from './pages/Income';
import { GoalsPage } from './pages/Goals';
import { MembersPage } from './pages/Members';
import { EducationPage } from './pages/Education';
import { ProfilePage } from './pages/Profile';
import { ReportsPage } from './pages/Reports';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: WelcomePage },
      { path: 'login', Component: LoginPage },
      { path: 'register', Component: RegisterPage },
      { path: 'forgot-password', Component: ForgotPasswordPage },
      { path: 'setup', Component: SetupPage },
      {
        Component: AppLayout,
        children: [
          { path: 'dashboard', Component: DashboardPage },
          { path: 'expenses', Component: ExpensesPage },
          { path: 'income', Component: IncomePage },
          { path: 'goals', Component: GoalsPage },
          { path: 'members', Component: MembersPage },
          { path: 'education', Component: EducationPage },
          { path: 'reports', Component: ReportsPage },
          { path: 'profile', Component: ProfilePage },
        ],
      },
    ],
  },
]);
