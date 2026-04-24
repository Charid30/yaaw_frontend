export type UserRole = 'ADMIN' | 'GERANT' | 'CAISSIER';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  role: UserRole;
  is_active: number;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginPayload {
  telephone: string;
  password: string;
}

export interface RegisterPayload {
  nom: string;
  prenom: string;
  telephone: string;
  password: string;
  confirmPassword: string;
}
