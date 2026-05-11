import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useApp } from './context/AppContext';
import { Toaster } from 'sonner';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password'];

export function Root() {
  const { isAuthenticated, hasCompletedSetup } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.includes(location.pathname);

    if (!isAuthenticated && !isPublic) {
      navigate('/login', { replace: true });
    } else if (isAuthenticated && !hasCompletedSetup && location.pathname !== '/setup' && !isPublic) {
      navigate('/setup', { replace: true });
    } else if (isAuthenticated && hasCompletedSetup && (isPublic || location.pathname === '/setup')) {
      navigate('/dashboard', { replace: true });
    } else if (isAuthenticated && !hasCompletedSetup && isPublic && location.pathname !== '/' && location.pathname !== '/forgot-password') {
      navigate('/setup', { replace: true });
    }
  }, [isAuthenticated, hasCompletedSetup, location.pathname, navigate]);

  return (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  );
}
