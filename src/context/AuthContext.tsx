import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { AuthContextType, LoginFormData, LoginResponse, User } from '../types/auth.types';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? (JSON.parse(saved) as User) : null;
  });

  const navigate = useNavigate();

  const login = async (data: LoginFormData) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, motDePasse: data.password }),
    });

    if (!res.ok) {
      let message = 'Identifiants incorrects.';
      try {
        const err = await res.json() as { message: string };
        if (err.message) message = err.message;
      } catch { /* corps vide ou non-JSON */ }
      if (res.status === 502 || res.status === 503) message = 'Le serveur est temporairement indisponible. Réessayez dans un instant.';
      throw new Error(message);
    }

    const json = (await res.json()) as LoginResponse;

    if (json.user.role !== 'AGENT_ADMINISTRATIF') {
      const labels: Record<string, string> = {
        ADMIN:               'Espace Administrateur',
        AGENT_RENSEIGNEMENT: 'Espace Agent de Renseignement',
        MEDECIN:             'Espace Médecin',
      };
      const label = labels[json.user.role] ?? 'votre espace dédié';
      throw new Error(`Ce compte n'est pas autorisé ici. Connectez-vous depuis ${label}.`);
    }

    localStorage.setItem('accessToken', json.tokens.accessToken);

    if (data.rememberMe) {
      localStorage.setItem('refreshToken', json.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(json.user));
    } else {
      sessionStorage.setItem('refreshToken', json.tokens.refreshToken);
    }

    setUser(json.user);
    navigate('/');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
};
