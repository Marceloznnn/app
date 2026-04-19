import { Router, Request, Response } from "express";
import { health, info } from "./health.controller";

const router: Router = Router();

// GET /health
router.get("/health", async (req: Request, res: Response) => {
  await health(req, res);
});

// GET /
router.get("/", async (req: Request, res: Response) => {
  await info(req, res);
});

export default router;
