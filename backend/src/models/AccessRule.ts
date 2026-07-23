import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db/sequelize";

// Available operators depend on the referenced attribute's dataType:
//   numeric/date          -> gt, gte, lt, lte, eq, neq
//   boolean                -> is_checked, is_unchecked
//   one_of_many             -> equals, not_equals
//   string/text            -> contains
export const RULE_OPERATORS = [
  "gt",
  "gte",
  "lt",
  "lte",
  "eq",
  "neq",
  "is_checked",
  "is_unchecked",
  "equals",
  "not_equals",
  "contains",
] as const;
export type RuleOperator = (typeof RULE_OPERATORS)[number];

interface Attrs {
  id: string;
  positionId: string;
  attributeId: string;
  operator: RuleOperator;
  value: string | null; // not needed for is_checked/is_unchecked
}
type Creation = Optional<Attrs, "id" | "value">;

export class AccessRule extends Model<Attrs, Creation> implements Attrs {
  public id!: string;
  public positionId!: string;
  public attributeId!: string;
  public operator!: RuleOperator;
  public value!: string | null;
}

AccessRule.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    positionId: { type: DataTypes.UUID, allowNull: false },
    attributeId: { type: DataTypes.UUID, allowNull: false },
    operator: { type: DataTypes.ENUM(...RULE_OPERATORS), allowNull: false },
    value: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, modelName: "AccessRule", tableName: "access_rules", timestamps: false }
);
