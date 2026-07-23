import { AttributeDto } from "../attributes/types";

export const POSITION_LEVELS = ["Junior", "Middle", "Senior", "C-level"] as const;
export type PositionLevel = (typeof POSITION_LEVELS)[number];

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

export const OPERATOR_LABELS: Record<RuleOperator, string> = {
  gt: "> greater than",
  gte: "≥ at least",
  lt: "< less than",
  lte: "≤ at most",
  eq: "= equals",
  neq: "≠ not equal",
  is_checked: "is checked",
  is_unchecked: "is unchecked",
  equals: "equals",
  not_equals: "does not equal",
  contains: "contains",
};

// Mirrors backend services/accessRule.service.ts#operatorsForType
export function operatorsForType(dataType: string): RuleOperator[] {
  switch (dataType) {
    case "numeric":
    case "date":
      return ["gt", "gte", "lt", "lte", "eq", "neq"];
    case "boolean":
      return ["is_checked", "is_unchecked"];
    case "one_of_many":
      return ["equals", "not_equals"];
    case "string":
    case "text":
      return ["contains"];
    default:
      return [];
  }
}

export interface AccessRuleDto {
  id?: string;
  attributeId: string;
  attributeName?: string;
  operator: RuleOperator;
  value: string | null;
}

export interface PositionAttributeDto extends AttributeDto {
  order: number;
}

export interface PositionDto {
  id: string;
  title: string;
  shortDescription: string;
  company: string | null;
  level: PositionLevel | null;
  isPublic: boolean;
  maxProjects: number;
  projectTags: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
  attributes: PositionAttributeDto[];
  accessRules: AccessRuleDto[];
  eligible: boolean | null;
}
