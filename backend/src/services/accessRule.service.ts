import { AccessRule } from "../models/AccessRule";
import { AttributeValue } from "../models/AttributeValue";
import { Attribute } from "../models/Attribute";

// Evaluates whether a candidate (by their AttributeValue rows) satisfies every
// access rule attached to a restricted position. All rules must pass (AND).
export async function candidateSatisfiesRules(userId: string, rules: AccessRule[]): Promise<boolean> {
  if (rules.length === 0) return true;

  for (const rule of rules) {
    const attribute = await Attribute.findByPk(rule.attributeId);
    if (!attribute) return false; // dangling rule - fail closed

    const valueRow = await AttributeValue.findOne({ where: { userId, attributeId: rule.attributeId } });
    const raw = valueRow?.value ?? null;

    if (!evaluateRule(rule.operator, raw, rule.value, attribute.dataType)) return false;
  }
  return true;
}

function evaluateRule(
  operator: string,
  candidateValue: string | null,
  ruleValue: string | null,
  dataType: string
): boolean {
  switch (operator) {
    case "is_checked":
      return candidateValue === "true";
    case "is_unchecked":
      return candidateValue !== "true";
    case "equals":
      return candidateValue === ruleValue;
    case "not_equals":
      return candidateValue !== ruleValue;
    case "contains":
      return !!candidateValue && !!ruleValue && candidateValue.toLowerCase().includes(ruleValue.toLowerCase());
    case "gt":
    case "gte":
    case "lt":
    case "lte":
    case "eq":
    case "neq": {
      if (candidateValue === null || ruleValue === null) return false;
      // numeric or date - both compare fine as numbers/timestamps
      const a = dataType === "date" ? Date.parse(candidateValue) : parseFloat(candidateValue);
      const b = dataType === "date" ? Date.parse(ruleValue) : parseFloat(ruleValue);
      if (Number.isNaN(a) || Number.isNaN(b)) return false;
      switch (operator) {
        case "gt":
          return a > b;
        case "gte":
          return a >= b;
        case "lt":
          return a < b;
        case "lte":
          return a <= b;
        case "eq":
          return a === b;
        case "neq":
          return a !== b;
      }
    }
  }
  return false;
}

// Which operators are valid for a given attribute data type - drives both
// server-side validation and the client's rule-builder dropdown.
export function operatorsForType(dataType: string): string[] {
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
