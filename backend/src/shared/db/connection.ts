import { Pool, QueryResult } from "pg";
import { logger } from "../utils/logger.util";
import { config } from "../config";

const pool = new Pool(config.database);

logger.info("Conectando ao banco:", {
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
});

pool.on("error", (err) => {
  logger.error("Pool error:", err.message);
});

pool.on("connect", () => {
  logger.success("Conectado ao banco de dados");
});

export async function query(
  text: string,
  params?: any[],
): Promise<QueryResult> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.info(`Query executada em ${duration}ms`, { text });
    return result;
  } catch (error: any) {
    logger.error("Query error:", error.message);
    throw error;
  }
}

export default pool;
