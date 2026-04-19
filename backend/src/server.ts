import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logger } from "./shared/utils/logger.util";
import { config } from "./shared/config";
import { errorHandler } from "./shared/middleware";
import mainRoutes from "./routes/main";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rotas
app.use("/", mainRoutes);

// Middleware de erro
app.use(errorHandler);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

app.listen(config.app.port, () => {
  logger.success(
    `Server rodando em http://localhost:${config.app.port} [${config.app.env}]`,
  );
});
