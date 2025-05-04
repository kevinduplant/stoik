import express from "express";
import helmet from "helmet";
import cors from "cors";
import urlRoutes from "./routes";
import {
  closeDatabaseConnections,
  initDatabaseConnections,
  initDatabaseTables,
} from "./clients/postgres";

const app = express();

initDatabaseConnections();
initDatabaseTables().catch(console.error);

// Security middleware
app.use(helmet());

const corsOptions = {
  origin: "http://localhost:3001",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", urlRoutes);

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log(
    "SIGTERM signal received. Closing HTTP server and database connections."
  );
  await closeDatabaseConnections();
  process.exit(0);
});

export default app;
