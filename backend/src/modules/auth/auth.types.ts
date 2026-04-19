import { UserPublic } from "../user/user.types";

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  user: UserPublic;
  accessToken?: string;
  refreshToken?: string;
}

export interface TokenRefreshRequestDto {
  refreshToken?: string;
}

export interface TokenRefreshResponseDto {
  accessToken: string;
}
