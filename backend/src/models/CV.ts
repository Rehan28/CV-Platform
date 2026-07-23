import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db/sequelize";

export const CV_STATUSES = ["draft", "published"] as const;
export type CVStatus = (typeof CV_STATUSES)[number];

interface Attrs {
  id: string;
  userId: string;
  positionId: string;
  status: CVStatus;
  version: number;
  createdAt?: Date;
  updatedAt?: Date;
}
type Creation = Optional<Attrs, "id" | "status" | "version">;

export class CV extends Model<Attrs, Creation> implements Attrs {
  public id!: string;
  public userId!: string;
  public positionId!: string;
  public status!: CVStatus;
  public version!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CV.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    positionId: { type: DataTypes.UUID, allowNull: false },
    status: { type: DataTypes.ENUM(...CV_STATUSES), allowNull: false, defaultValue: "draft" },
    version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  },
  {
    sequelize,
    modelName: "CV",
    tableName: "cvs",
    indexes: [{ unique: true, fields: ["userId", "positionId"] }],
  }
);
