import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { logger } from "../utils/logger.util";

export const loginLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: "Muitas tentativas de login. Tente novamente em 15 minutos.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body?.email || "unknown";
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    return `${ip}:${email}`;
  },
  handler: (req, res) => {
    logger.warn(`Rate limit excedido para login: ${req.ip}`);
    res.status(429).json({
      error: "Muitas tentativas. Tente novamente mais tarde.",
    });
  },
});

export const registerLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,
  message: "Muitas tentativas de registro.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `register:${req.ip}`,
  handler: (req, res) => {
    logger.warn(`Rate limit registro: ${req.ip}`);
    res.status(429).json({ error: "Muitas tentativas. Tente mais tarde." });
  },
});

export const refreshTokenLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => `refresh:${req.user?.id || "unknown"}`,
});
