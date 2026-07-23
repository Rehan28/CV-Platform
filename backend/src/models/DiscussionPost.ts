import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db/sequelize";

interface Attrs {
  id: string;
  positionId: string;
  authorId: string;
  contentMarkdown: string;
  createdAt?: Date;
}
type Creation = Optional<Attrs, "id">;

export class DiscussionPost extends Model<Attrs, Creation> implements Attrs {
  public id!: string;
  public positionId!: string;
  public authorId!: string;
  public contentMarkdown!: string;
  public readonly createdAt!: Date;
}

DiscussionPost.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    positionId: { type: DataTypes.UUID, allowNull: false },
    authorId: { type: DataTypes.UUID, allowNull: false },
    contentMarkdown: { type: DataTypes.TEXT, allowNull: false },
  },
  { sequelize, modelName: "DiscussionPost", tableName: "discussion_posts", updatedAt: false }
);
