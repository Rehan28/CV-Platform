import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db/sequelize";

interface Attrs {
  id: string;
  projectId: string;
  tagId: string;
}
type Creation = Optional<Attrs, "id">;

export class ProjectTag extends Model<Attrs, Creation> implements Attrs {
  public id!: string;
  public projectId!: string;
  public tagId!: string;
}

ProjectTag.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    projectId: { type: DataTypes.UUID, allowNull: false },
    tagId: { type: DataTypes.UUID, allowNull: false },
  },
  {
    sequelize,
    modelName: "ProjectTag",
    tableName: "project_tags",
    timestamps: false,
    indexes: [{ unique: true, fields: ["projectId", "tagId"] }],
  }
);
