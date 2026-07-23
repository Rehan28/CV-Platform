import { AttributeDto } from "../attributes/types";
import { AccessRuleDto, OPERATOR_LABELS, operatorsForType } from "./types";

interface Props {
  rules: AccessRuleDto[];
  onChange: (next: AccessRuleDto[]) => void;
  candidateAttributes: AttributeDto[]; // full library - rules can reference any attribute, not just ones on the CV
}

// A restricted Position becomes visible to a Candidate only if they satisfy
// every rule here (e.g. "IELTS Score" > 7.0, "Remote Work" is checked).
// The set of valid operators - and whether a free-text value is even needed -
// depends on the referenced attribute's data type.
export function AccessRulesEditor({ rules, onChange, candidateAttributes }: Props) {
  function attrFor(id: string) {
    return candidateAttributes.find((a) => a.id === id);
  }

  function update(index: number, patch: Partial<AccessRuleDto>) {
    const next = rules.slice();
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function addRule() {
    const first = candidateAttributes[0];
    if (!first) return;
    const ops = operatorsForType(first.dataType);
    onChange([...rules, { attributeId: first.id, operator: ops[0], value: null }]);
  }

  function removeRule(index: number) {
    onChange(rules.filter((_, i) => i !== index));
  }

  return (
    <div className="rules-editor">
      {rules.length === 0 && <p className="rules-empty">No access rules — restricted, but nobody can qualify yet.</p>}
      {rules.map((rule, i) => {
        const attribute = attrFor(rule.attributeId);
        const ops = attribute ? operatorsForType(attribute.dataType) : [];
        const needsValue = !["is_checked", "is_unchecked"].includes(rule.operator);
        return (
          <div className="rule-row" key={i}>
            <select
              value={rule.attributeId}
              onChange={(e) => {
                const attr = attrFor(e.target.value);
                const newOps = attr ? operatorsForType(attr.dataType) : [];
                update(i, { attributeId: e.target.value, operator: newOps[0], value: null });
              }}
            >
              {candidateAttributes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            <select value={rule.operator} onChange={(e) => update(i, { operator: e.target.value as any, value: null })}>
              {ops.map((op) => (
                <option key={op} value={op}>
                  {OPERATOR_LABELS[op]}
                </option>
              ))}
            </select>

            {needsValue &&
              (attribute?.dataType === "one_of_many" ? (
                <select value={rule.value ?? ""} onChange={(e) => update(i, { value: e.target.value })}>
                  <option value="">Select…</option>
                  {(attribute.options ?? []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={attribute?.dataType === "numeric" ? "number" : attribute?.dataType === "date" ? "date" : "text"}
                  value={rule.value ?? ""}
                  onChange={(e) => update(i, { value: e.target.value })}
                />
              ))}

            <button type="button" className="danger" onClick={() => removeRule(i)} aria-label="Remove rule">
              ✕
            </button>
          </div>
        );
      })}
      <button type="button" className="btn-ghost" onClick={addRule} disabled={candidateAttributes.length === 0}>
        + Add rule
      </button>
    </div>
  );
}
