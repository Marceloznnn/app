export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DbConfig {
  user?: string;
  password?: string;
  host: string;
  port: number;
  database: string;
}

export type UserRole = "user" | "admin";

export interface User {
  id: number;
  email: string;
  password: string; // Hash bcrypt
  role: UserRole;
  created_at: Date;
  updated_at?: Date;
}

export interface UserPublic {
  id: number;
  email: string;
  role: UserRole;
  created_at: Date;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserPublic;
  token?: string; // JWT (futuro)
}
