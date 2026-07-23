import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db/sequelize";

interface Attrs {
  id: string;
  positionId: string;
  attributeId: string;
  order: number;
}
type Creation = Optional<Attrs, "id" | "order">;

export class PositionAttribute extends Model<Attrs, Creation> implements Attrs {
  public id!: string;
  public positionId!: string;
  public attributeId!: string;
  public order!: number;
}

PositionAttribute.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    positionId: { type: DataTypes.UUID, allowNull: false },
    attributeId: { type: DataTypes.UUID, allowNull: false },
    order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    sequelize,
    modelName: "PositionAttribute",
    tableName: "position_attributes",
    timestamps: false,
    indexes: [{ unique: true, fields: ["positionId", "attributeId"] }],
  }
);
