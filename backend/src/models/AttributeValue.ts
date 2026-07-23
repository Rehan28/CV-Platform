import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db/sequelize";

// One row per (user, attribute). This is the single master value referenced by
// Me/Info profile sections AND by every CV that includes this attribute -
// editing it in a CV writes back here (per spec: "editing a attribute in a CV
// modifies the original profile value"). Value is stored as text; callers
// serialize/deserialize according to Attribute.dataType (numbers, ISO dates,
// {start,end} period JSON, "true"/"false" booleans, option string, image URL).
interface AttributeValueAttrs {
  id: string;
  userId: string;
  attributeId: string;
  value: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type AttributeValueCreation = Optional<AttributeValueAttrs, "id" | "value">;

export class AttributeValue
  extends Model<AttributeValueAttrs, AttributeValueCreation>
  implements AttributeValueAttrs
{
  public id!: string;
  public userId!: string;
  public attributeId!: string;
  public value!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AttributeValue.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    attributeId: { type: DataTypes.UUID, allowNull: false },
    value: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: "AttributeValue",
    tableName: "attribute_values",
    indexes: [{ unique: true, fields: ["userId", "attributeId"] }],
  }
);
