import { Sequelize } from "sequelize";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Dialect is swappable via .env — defaults to zero-config SQLite for local dev.
// To use Postgres/MySQL instead: set DB_DIALECT + DB_URL and nothing else changes,
// because every model/query in this app goes through Sequelize, not raw SQL.
const dialect = (process.env.DB_DIALECT as any) || "sqlite";

export const sequelize =
  dialect === "sqlite"
    ? new Sequelize({
        dialect: "sqlite",
        storage: path.join(__dirname, "..", "..", "data.sqlite"),
        logging: false,
      })
    : new Sequelize(process.env.DB_URL as string, {
        dialect,
        logging: false,
      });
