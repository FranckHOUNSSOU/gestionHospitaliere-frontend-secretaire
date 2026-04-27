import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

export const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'AGENT_ADMINISTRATIF') return <Navigate to="/login" replace />;
  return <>{children}</>;
};
