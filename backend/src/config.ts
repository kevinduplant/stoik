import dotenv from "dotenv";

dotenv.config();

export default {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  postgres: {
    user: process.env.PGUSER || "postgres",
    host: process.env.PGHOST || "localhost",
    database: process.env.PGDATABASE || "stoik",
    password: process.env.PGPASSWORD || "postgres",
    port: parseInt(process.env.PGPORT || "5432"),
    max: 20, // connection pool size
    idleTimeoutMillis: 30000,
  },

  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || "",
    keyPrefix: "url:",
    cacheTtl: parseInt(process.env.CACHE_TTL || "86400"),
  },

  app: {
    baseUrl: process.env.BASE_URL || "http://localhost:3000",
  },
};
