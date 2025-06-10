export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isAdmin: boolean | null;
  setIsAdmin: (isAdmin: boolean | null) => void;
}