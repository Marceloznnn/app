import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../../shared/utils/jwt.util";
import { logger } from "../../shared/utils/logger.util";
import { UserPublic } from "../user/user.types";

declare global {
  namespace Express {
    interface Request {
      user?: UserPublic;
      token?: string;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Token não fornecido" });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyAccessToken(token);

      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        created_at: new Date(),
      };

      req.token = token;

      logger.info(`✓ Acesso autenticado: ${decoded.email} [${decoded.role}]`);

      next();
    } catch (error: any) {
      if (error.message.includes("expirado")) {
        res.status(401).json({
          error: "Token expirado. Renove usando refresh token.",
        });
        return;
      }

      logger.warn(`Acesso negado: ${error.message}`);
      res.status(401).json({ error: "Token inválido" });
    }
  } catch (error: any) {
    logger.error(`Erro no middleware de autenticação: ${error.message}`);
    res.status(500).json({ error: "Erro de autenticação" });
  }
};
