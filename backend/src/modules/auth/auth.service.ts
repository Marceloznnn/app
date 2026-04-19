import * as userRepository from "../user/user.repository";
import { UserPublic } from "../user/user.types";
import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
} from "../../shared/utils/hash.util";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../shared/utils/jwt.util";
import { logger } from "../../shared/utils/logger.util";

export async function registerUser(
  email: string,
  password: string,
): Promise<UserPublic> {
  try {
    if (!email || !email.includes("@")) {
      logger.warn(`Email inválido: ${email}`);
      throw new Error("Email inválido");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(", "));
    }

    const emailAlreadyExists =
      await userRepository.emailExists(normalizedEmail);
    if (emailAlreadyExists) {
      logger.warn(`Email já existe: ${normalizedEmail}`);
      throw new Error("Email já cadastrado");
    }

    const passwordHash = await hashPassword(password);
    const user = await userRepository.createUser(
      normalizedEmail,
      passwordHash,
      "user",
    );

    logger.success(`✓ Novo usuário: ${normalizedEmail}`);
    return user;
  } catch (error: any) {
    logger.error(`Erro ao registrar: ${error.message}`);
    throw error;
  }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: UserPublic; accessToken: string; refreshToken: string }> {
  try {
    if (!email || !password) {
      throw new Error("Email e senha obrigatórios");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await userRepository.getUserByEmail(normalizedEmail);

    if (!user) {
      logger.warn(`Login com email inexistente: ${normalizedEmail}`);
      throw new Error("Email ou senha inválidos");
    }

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      logger.warn(`Senha incorreta: ${normalizedEmail}`);
      throw new Error("Email ou senha inválidos");
    }

    await userRepository.updateLastLogin(user.id);

    const userPublic: UserPublic = {
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    };

    const accessToken = generateAccessToken(userPublic);
    const refreshToken = generateRefreshToken(user.id);

    logger.success(`✓ Login: ${normalizedEmail}`);

    return {
      user: userPublic,
      accessToken,
      refreshToken,
    };
  } catch (error: any) {
    logger.error(`Erro login: ${error.message}`);
    throw error;
  }
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  try {
    if (!refreshToken) {
      throw new Error("Refresh token obrigatório");
    }

    const decoded = verifyRefreshToken(refreshToken);

    const user = await userRepository.getUserById(decoded.userId);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user.id);

    logger.success(`✓ Token renovado: ${user.email}`);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error: any) {
    logger.error(`Erro ao renovar token: ${error.message}`);
    throw error;
  }
}
