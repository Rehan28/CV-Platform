import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { ATTRIBUTE_CATEGORIES, ATTRIBUTE_TYPE_LABELS, AttributeDto } from "../attributes/types";

interface Props {
  selected: AttributeDto[]; // ordered
  onChange: (next: AttributeDto[]) => void;
}

// Lets a Recruiter compose the ordered list of Attribute Library entries that
// make up a Position template: prefix lookup + category filter on the left,
// the chosen (ordered, reorderable) list on the right.
export function AttributePicker({ selected, onChange }: Props) {
  const [prefix, setPrefix] = useState("");
  const [category, setCategory] = useState("");
  const [options, setOptions] = useState<AttributeDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const params: Record<string, string> = {};
        if (prefix) params.prefix = prefix;
        if (category) params.category = category;
        const { data } = await api.get<AttributeDto[]>("/attributes", { params });
        setOptions(data);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [prefix, category]);

  const selectedIds = new Set(selected.map((a) => a.id));

  function add(attr: AttributeDto) {
    if (selectedIds.has(attr.id)) return;
    onChange([...selected, attr]);
  }

  function remove(id: string) {
    onChange(selected.filter((a) => a.id !== id));
  }

  function move(id: string, dir: -1 | 1) {
    const idx = selected.findIndex((a) => a.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= selected.length) return;
    const next = [...selected];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  return (
    <div className="attr-picker">
      <div className="attr-picker-col">
        <div className="attr-picker-filters">
          <input
            placeholder="Search by name…"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {ATTRIBUTE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="attr-picker-list">
          {loading && <div className="attr-picker-empty">Loading…</div>}
          {!loading && options.length === 0 && <div className="attr-picker-empty">No matches.</div>}
          {!loading &&
            options.map((a) => (
              <button
                type="button"
                key={a.id}
                className="attr-picker-item"
                disabled={selectedIds.has(a.id)}
                onClick={() => add(a)}
              >
                <span className="attr-picker-item-name">{a.name}</span>
                <span className="attr-picker-item-meta">
                  {a.category} · {ATTRIBUTE_TYPE_LABELS[a.dataType]}
                </span>
              </button>
            ))}
        </div>
      </div>

      <div className="attr-picker-col">
        <div className="attr-picker-filters">
          <strong>Selected ({selected.length})</strong>
        </div>
        <div className="attr-picker-list">
          {selected.length === 0 && <div className="attr-picker-empty">No attributes selected yet.</div>}
          {selected.map((a, i) => (
            <div className="attr-picker-selected" key={a.id}>
              <span className="attr-picker-item-name">{a.name}</span>
              <div className="attr-picker-selected-actions">
                <button type="button" disabled={i === 0} onClick={() => move(a.id, -1)} aria-label="Move up">
                  ↑
                </button>
                <button
                  type="button"
                  disabled={i === selected.length - 1}
                  onClick={() => move(a.id, 1)}
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button type="button" className="danger" onClick={() => remove(a.id)} aria-label="Remove">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
