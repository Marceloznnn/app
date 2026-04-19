import { Request, Response } from "express";
import * as authService from "./auth.service";
import { logger } from "../../shared/utils/logger.util";

/**
 * POST /auth/register
 * Handler para registrar novo usuário
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email e senha obrigatórios" });
      return;
    }

    const user = await authService.registerUser(email, password);

    res.status(201).json({
      success: true,
      data: {
        user,
        message: "Usuário registrado com sucesso",
      },
    });
  } catch (error: any) {
    logger.error(`POST /register - ${error.message}`);

    if (error.message.includes("Email inválido")) {
      res.status(400).json({ error: "Email inválido" });
      return;
    }

    if (error.message.includes("já cadastrado")) {
      res.status(409).json({ error: "Email já cadastrado" });
      return;
    }

    if (error.message.includes("caracteres")) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: "Erro ao registrar" });
  }
}

/**
 * POST /auth/login
 * Handler para fazer login
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email e senha obrigatórios" });
      return;
    }

    const { user, accessToken, refreshToken } = await authService.loginUser(
      email,
      password,
    );

    // Settar refresh token em HTTP-only cookie (seguro)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    res.json({
      success: true,
      data: {
        user,
        accessToken,
      },
    });
  } catch (error: any) {
    logger.error(`POST /login - ${error.message}`);
    res.status(401).json({ error: "Email ou senha inválidos" });
  }
}

/**
 * POST /auth/refresh
 * Handler para renovar access token
 */
export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    // Pegar refresh token do cookie ou body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token obrigatório" });
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshAccessToken(refreshToken);

    // Atualizar cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: { accessToken },
    });
  } catch (error: any) {
    logger.error(`POST /refresh - ${error.message}`);
    res.status(401).json({ error: "Refresh token inválido ou expirado" });
  }
}

/**
 * POST /auth/logout
 * Handler para fazer logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    // Limpar cookie
    res.clearCookie("refreshToken");

    logger.info(`✓ Logout: ${req.user?.email}`);

    res.json({
      success: true,
      message: "Logout bem-sucedido",
    });
  } catch (error: any) {
    logger.error(`POST /logout - ${error.message}`);
    res.status(500).json({ error: "Erro ao fazer logout" });
  }
}

/**
 * GET /auth/me
 * Handler para obter dados do usuário autenticado
 */
export async function me(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Usuário não autenticado" });
      return;
    }

    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error: any) {
    logger.error(`GET /me - ${error.message}`);
    res.status(500).json({ error: "Erro ao obter dados do usuário" });
  }
}
