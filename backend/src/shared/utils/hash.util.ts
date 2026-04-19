import bcrypt from "bcrypt";
import { logger } from "./logger.util";

const SALT_ROUNDS = 10;

/**
 * Hash de senha com bcrypt
 * @param password Senha em texto puro
 * @returns Hash bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    if (!password || password.length < 6) {
      throw new Error("Senha deve ter pelo menos 6 caracteres");
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error: any) {
    logger.error("Erro ao fazer hash da senha:", error.message);
    throw error;
  }
}

/**
 * Compara senha com hash
 * @param password Senha em texto puro
 * @param hash Hash armazenado no banco
 * @returns true se corresponde, false caso contrário
 */
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    if (!password || !hash) {
      return false;
    }

    const match = await bcrypt.compare(password, hash);
    return match;
  } catch (error: any) {
    logger.error("Erro ao comparar senha:", error.message);
    throw error;
  }
}

/**
 * Valida força da senha
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password) {
    errors.push("Senha é obrigatória");
  }
  if (password.length < 6) {
    errors.push("Mínimo 6 caracteres");
  }
  if (password.length > 128) {
    errors.push("Máximo 128 caracteres");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
