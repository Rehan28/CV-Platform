import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db/sequelize";

interface Attrs {
  id: string;
  userId: string;
  attributeId: string;
  createdAt?: Date;
}
type Creation = Optional<Attrs, "id">;

export class UserAttributeSelection extends Model<Attrs, Creation> implements Attrs {
  public id!: string;
  public userId!: string;
  public attributeId!: string;
  public readonly createdAt!: Date;
}

UserAttributeSelection.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    attributeId: { type: DataTypes.UUID, allowNull: false },
  },
  {
    sequelize,
    modelName: "UserAttributeSelection",
    tableName: "user_attribute_selections",
    updatedAt: false,
    indexes: [{ unique: true, fields: ["userId", "attributeId"] }],
  }
);
