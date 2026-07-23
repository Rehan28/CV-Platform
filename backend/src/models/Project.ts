import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db/sequelize";

interface Attrs {
  id: string;
  userId: string;
  name: string;
  periodStart: string | null; // ISO date
  periodEnd: string | null; // null = ongoing
  descriptionMarkdown: string;
  createdAt?: Date;
  updatedAt?: Date;
}
type Creation = Optional<Attrs, "id" | "periodStart" | "periodEnd" | "descriptionMarkdown">;

export class Project extends Model<Attrs, Creation> implements Attrs {
  public id!: string;
  public userId!: string;
  public name!: string;
  public periodStart!: string | null;
  public periodEnd!: string | null;
  public descriptionMarkdown!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Project.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    periodStart: { type: DataTypes.DATEONLY, allowNull: true },
    periodEnd: { type: DataTypes.DATEONLY, allowNull: true },
    descriptionMarkdown: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
  },
  { sequelize, modelName: "Project", tableName: "projects" }
);
