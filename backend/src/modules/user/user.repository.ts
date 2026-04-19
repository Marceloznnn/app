import { query } from "../../shared/db/connection";
import { User, UserPublic } from "./user.types";

/**
 * Busca usuário por email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query("SELECT * FROM users WHERE email = $1", [
    email.toLowerCase(),
  ]);
  return result.rows[0] || null;
}

/**
 * Busca usuário por ID (retorna dados públicos)
 */
export async function getUserById(id: number): Promise<UserPublic | null> {
  const result = await query(
    "SELECT id, email, role, created_at FROM users WHERE id = $1",
    [id],
  );
  return result.rows[0] || null;
}

/**
 * Cria novo usuário
 */
export async function createUser(
  email: string,
  passwordHash: string,
  role: "user" | "admin" = "user",
): Promise<UserPublic> {
  const result = await query(
    "INSERT INTO users (email, password, role, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, email, role, created_at",
    [email.toLowerCase(), passwordHash, role],
  );

  if (!result.rows[0]) {
    throw new Error("Erro ao criar usuário");
  }

  return result.rows[0];
}

/**
 * Verifica se email existe
 */
export async function emailExists(email: string): Promise<boolean> {
  const result = await query("SELECT 1 FROM users WHERE email = $1 LIMIT 1", [
    email.toLowerCase(),
  ]);
  return result.rows.length > 0;
}

/**
 * Atualiza último login
 */
export async function updateLastLogin(userId: number): Promise<void> {
  await query("UPDATE users SET updated_at = NOW() WHERE id = $1", [userId]);
}
