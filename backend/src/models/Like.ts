import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db/sequelize";

interface Attrs {
  id: string;
  cvId: string;
  recruiterId: string;
  createdAt?: Date;
}
type Creation = Optional<Attrs, "id">;

export class Like extends Model<Attrs, Creation> implements Attrs {
  public id!: string;
  public cvId!: string;
  public recruiterId!: string;
  public readonly createdAt!: Date;
}

Like.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    cvId: { type: DataTypes.UUID, allowNull: false },
    recruiterId: { type: DataTypes.UUID, allowNull: false },
  },
  {
    sequelize,
    modelName: "Like",
    tableName: "likes",
    updatedAt: false,
    indexes: [{ unique: true, fields: ["cvId", "recruiterId"] }],
  }
);
