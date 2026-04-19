import { Router } from "express";
import { authRouter } from "../modules/auth";
import { healthRouter } from "../modules/health";

const router: Router = Router();

// Health check e info
router.use(healthRouter);

// Rotas de autenticação
router.use("/auth", authRouter);

export default router;
