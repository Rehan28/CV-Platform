import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import passport from "./config/passport";
import authRoutes from "./routes/auth.routes";
import attributeRoutes from "./routes/attributes.routes";
import statsRoutes from "./routes/stats.routes";
import positionRoutes from "./routes/positions.routes";

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan("dev"));
  app.use(passport.initialize());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", authRoutes);
  app.use("/api/attributes", attributeRoutes);
  app.use("/api/stats", statsRoutes);
  app.use("/api/positions", positionRoutes);

  // Centralized error handler - keeps error shape consistent for the client.
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || "Something went wrong." });
  });

  return app;
}
