import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db/sequelize";

export const POSITION_LEVELS = ["Junior", "Middle", "Senior", "C-level"] as const;
export type PositionLevel = (typeof POSITION_LEVELS)[number];

interface Attrs {
  id: string;
  title: string;
  shortDescription: string;
  company: string | null;
  level: PositionLevel | null;
  isPublic: boolean;
  maxProjects: number;
  projectTags: string[]; // tag filter used to pick "relevant projects" for generated CVs
  version: number;
  createdById: string;
  createdAt?: Date;
  updatedAt?: Date;
}
type Creation = Optional<
  Attrs,
  "id" | "company" | "level" | "isPublic" | "maxProjects" | "projectTags" | "version"
>;

export class Position extends Model<Attrs, Creation> implements Attrs {
  public id!: string;
  public title!: string;
  public shortDescription!: string;
  public company!: string | null;
  public level!: PositionLevel | null;
  public isPublic!: boolean;
  public maxProjects!: number;
  public projectTags!: string[];
  public version!: number;
  public createdById!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Position.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    shortDescription: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    company: { type: DataTypes.STRING, allowNull: true },
    level: { type: DataTypes.ENUM(...POSITION_LEVELS), allowNull: true },
    isPublic: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    maxProjects: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 3 },
    projectTags: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    createdById: { type: DataTypes.UUID, allowNull: false },
  },
  { sequelize, modelName: "Position", tableName: "positions" }
);
