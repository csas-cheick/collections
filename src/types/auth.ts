// Types pour l'authentification
export interface User {
  id: number;
  name: string;
  userName: string;
  email: string;
  phone?: string;
  role: string;
  country?: string;
  city?: string;
  status: boolean;
  picture?: string;
  createdAt?: string;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
  updateUser: (user: User) => void;
}