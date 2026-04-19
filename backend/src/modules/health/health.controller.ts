import { Request, Response } from "express";
import { query } from "../../shared/db/connection";
import { logger } from "../../shared/utils/logger.util";

/**
 * GET /health
 * Handler para health check
 */
export async function health(req: Request, res: Response): Promise<void> {
  try {
    const result = await query("SELECT NOW()");
    res.json({
      status: "ok",
      database: "connected",
      timestamp: result.rows[0],
    });
  } catch (error: any) {
    logger.error(`GET /health - ${error.message}`);
    res.status(500).json({
      status: "error",
      database: "disconnected",
      message: error.message,
    });
  }
}

/**
 * GET /
 * Handler para info da API
 */
export async function info(req: Request, res: Response): Promise<void> {
  res.json({
    message: "API E-commerce",
    version: "1.0.0",
    status: "online",
  });
}
