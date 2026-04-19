import jwt from "jsonwebtoken";
import { logger } from "./logger.util";
import { UserPublic } from "../types/common.types";

const JWT_SECRET = process.env.JWT_SECRET || "seu-secret-mudar-em-producao";
const JWT_EXPIRES_IN = "24h";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

export function generateAccessToken(user: UserPublic): string {
  try {
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        type: "access",
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        algorithm: "HS256",
      },
    );
    return token;
  } catch (error: any) {
    logger.error("Erro ao gerar access token:", error.message);
    throw new Error("Erro ao gerar token de autenticação");
  }
}

export function generateRefreshToken(userId: number): string {
  try {
    const token = jwt.sign({ userId, type: "refresh" }, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      algorithm: "HS256",
    });
    return token;
  } catch (error: any) {
    logger.error("Erro ao gerar refresh token:", error.message);
    throw new Error("Erro ao gerar token de renovação");
  }
}

export function verifyAccessToken(token: string): any {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as any;

    if (decoded.type !== "access") {
      throw new Error("Token inválido (tipo incorreto)");
    }
    return decoded;
  } catch (error: any) {
    logger.warn("Token inválido:", error.message);
    throw new Error("Token inválido ou expirado");
  }
}

export function verifyRefreshToken(token: string): any {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as any;

    if (decoded.type !== "refresh") {
      throw new Error("Token inválido (tipo incorreto)");
    }
    return decoded;
  } catch (error: any) {
    logger.warn("Refresh token inválido:", error.message);
    throw new Error("Refresh token inválido ou expirado");
  }
}

export function decodeToken(token: string): any {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
}
