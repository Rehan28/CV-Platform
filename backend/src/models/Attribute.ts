import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db/sequelize";

export const ATTRIBUTE_CATEGORIES = [
  "Certification",
  "Domain Knowledge",
  "Personal Information",
  "Soft Skills",
  "Technical Skills",
  "Language",
] as const;
export type AttributeCategory = (typeof ATTRIBUTE_CATEGORIES)[number];

export const ATTRIBUTE_TYPES = [
  "string",
  "text",
  "image",
  "numeric",
  "date",
  "period",
  "boolean",
  "one_of_many",
] as const;
export type AttributeType = (typeof ATTRIBUTE_TYPES)[number];

interface AttributeAttrs {
  id: string;
  name: string;
  category: AttributeCategory;
  description: string;
  dataType: AttributeType;
  options: string[] | null; // used only when dataType === "one_of_many"
  isSystem: boolean; // true for undeletable "Me" built-ins (First Name, Last Name, Location, Photo)
  createdById: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type AttributeCreation = Optional<AttributeAttrs, "id" | "options" | "isSystem" | "createdById">;

export class Attribute extends Model<AttributeAttrs, AttributeCreation> implements AttributeAttrs {
  public id!: string;
  public name!: string;
  public category!: AttributeCategory;
  public description!: string;
  public dataType!: AttributeType;
  public options!: string[] | null;
  public isSystem!: boolean;
  public createdById!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Attribute.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    category: { type: DataTypes.ENUM(...ATTRIBUTE_CATEGORIES), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    dataType: { type: DataTypes.ENUM(...ATTRIBUTE_TYPES), allowNull: false },
    options: { type: DataTypes.JSON, allowNull: true },
    isSystem: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdById: { type: DataTypes.UUID, allowNull: true },
  },
  { sequelize, modelName: "Attribute", tableName: "attributes" }
);
