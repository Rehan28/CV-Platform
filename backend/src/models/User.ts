import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db/sequelize";

export type Role = "candidate" | "recruiter" | "admin";

interface UserAttrs {
  id: string;
  email: string;
  passwordHash: string | null;
  roles: Role[];
  googleId: string | null;
  facebookId: string | null;
  blocked: boolean;
  profileVersion: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreation = Optional<
  UserAttrs,
  "id" | "passwordHash" | "googleId" | "facebookId" | "blocked" | "profileVersion"
>;

export class User extends Model<UserAttrs, UserCreation> implements UserAttrs {
  public id!: string;
  public email!: string;
  public passwordHash!: string | null;
  public roles!: Role[];
  public googleId!: string | null;
  public facebookId!: string | null;
  public blocked!: boolean;
  public profileVersion!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  hasRole(role: Role) {
    return this.roles.includes(role);
  }
}

User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    passwordHash: { type: DataTypes.STRING, allowNull: true },
    roles: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: ["candidate"],
    },
    googleId: { type: DataTypes.STRING, allowNull: true, unique: true },
    facebookId: { type: DataTypes.STRING, allowNull: true, unique: true },
    blocked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    profileVersion: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  },
  { sequelize, modelName: "User", tableName: "users" }
);
