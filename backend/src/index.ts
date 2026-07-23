import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "./db/sequelize";
import "./models"; // registers associations
import { createApp } from "./app";

const PORT = process.env.PORT || 4000;

async function main() {
  await sequelize.authenticate();
  // Course-project-friendly default: sync schema automatically in dev.
  // NOTE: plain sync() only creates missing tables, it won't migrate existing
  // ones - SQLite's ALTER TABLE emulation (drop+recreate) trips over FK
  // constraints on this schema. If you change a model's columns during
  // development, delete backend/data.sqlite and restart. Swap to real
  // sequelize-cli migrations before any production deployment.
  await sequelize.sync();
  console.log("Database ready.");

  const app = createApp();
  app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
