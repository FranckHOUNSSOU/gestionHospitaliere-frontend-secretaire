export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export type UserRole = 'ADMINISTRATEUR' | 'MEDECIN' | 'AGENT_ADMINISTRATIF' | 'AGENT_RENSEIGNEMENT';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  nom: string;
  prenom: string;
  service: string | null;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: LoginFormData) => Promise<void>;
  logout: () => void;
}

export interface LoginResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: User;
}
