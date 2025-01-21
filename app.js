import express from "express";
import cors from "cors";
import addRoutes from "./routes/add.js";
import authRoutes from "./routes/auth.js";
import getRoutes from "./routes/get.js";
import healthRoutes from "./routes/health.js";

const app = express();

app.use(cors());
app.use(express.json());

// Register routes
app.use("/api/add", addRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/get", getRoutes);
app.use("/api/health", healthRoutes);

export default app;