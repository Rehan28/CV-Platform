import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db/sequelize";

// Global reusable tag pool, powers autocomplete + the main-page tag cloud.
interface Attrs {
  id: string;
  name: string;
}
type Creation = Optional<Attrs, "id">;

export class Tag extends Model<Attrs, Creation> implements Attrs {
  public id!: string;
  public name!: string;
}

Tag.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  { sequelize, modelName: "Tag", tableName: "tags", timestamps: false }
);
