export type Role = 'Admin' | 'Owner' | 'Tenant';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_photo?: string;
  is_active: number;
  last_login?: string;
  created_at: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
