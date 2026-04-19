import { Router, Request, Response } from "express";
import { register, login, refresh, logout, me } from "./auth.controller";
import {
  loginLimiter,
  registerLimiter,
  refreshTokenLimiter,
} from "../../shared/middleware/rateLimiter.middleware";
import { authMiddleware } from "./auth.middleware";

const router: Router = Router();

// POST /auth/register
router.post(
  "/register",
  registerLimiter,
  async (req: Request, res: Response) => {
    await register(req, res);
  },
);

// POST /auth/login
router.post("/login", loginLimiter, async (req: Request, res: Response) => {
  await login(req, res);
});

// POST /auth/refresh
router.post(
  "/refresh",
  refreshTokenLimiter,
  async (req: Request, res: Response) => {
    await refresh(req, res);
  },
);

// POST /auth/logout
router.post("/logout", authMiddleware, async (req: Request, res: Response) => {
  await logout(req, res);
});

// GET /auth/me
router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  await me(req, res);
});

export default router;
