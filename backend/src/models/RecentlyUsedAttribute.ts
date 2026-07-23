import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db/sequelize";

interface Attrs {
  id: string;
  userId: string;
  attributeId: string;
  usedAt: Date;
}
type Creation = Optional<Attrs, "id" | "usedAt">;

export class RecentlyUsedAttribute extends Model<Attrs, Creation> implements Attrs {
  public id!: string;
  public userId!: string;
  public attributeId!: string;
  public usedAt!: Date;
}

RecentlyUsedAttribute.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    attributeId: { type: DataTypes.UUID, allowNull: false },
    usedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: "RecentlyUsedAttribute",
    tableName: "recently_used_attributes",
    timestamps: false,
    indexes: [{ unique: true, fields: ["userId", "attributeId"] }],
  }
);
