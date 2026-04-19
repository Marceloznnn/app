const log = (type: string, msg: string, data?: any) => {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${type} ${msg}`, data || "");
};

export const logger = {
  info: (msg: string, data?: any) => log("ℹ️", msg, data),
  success: (msg: string, data?: any) => log("✓", msg, data),
  error: (msg: string, data?: any) => log("❌", msg, data),
  warn: (msg: string, data?: any) => log("⚠️", msg, data),
};
