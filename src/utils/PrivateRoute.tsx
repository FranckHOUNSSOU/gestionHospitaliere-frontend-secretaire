import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PrivateRoute = ({ children }: { children: any }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'AGENT_ADMINISTRATIF') return <Navigate to="/login" replace />;
  return <>{children}</>;
};
