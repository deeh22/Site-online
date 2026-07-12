export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  role: 'ADMIN' | 'USER';
  accessLevel: 1 | 2 | 3;
}

export type AuthView = 'intro' | 'login' | 'register' | 'authenticated';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}
