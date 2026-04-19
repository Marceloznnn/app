import { UserRole } from "../../shared/types/common.types";

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

export interface UserCreateDto {
  email: string;
  password: string;
  role?: UserRole;
}

export interface UserResponseDto {
  id: number;
  email: string;
  role: UserRole;
  created_at: Date;
}
