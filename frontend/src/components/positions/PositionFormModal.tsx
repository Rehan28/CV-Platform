import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { AttributeDto } from "../attributes/types";
import { AttributePicker } from "./AttributePicker";
import { AccessRulesEditor } from "./AccessRulesEditor";
import { AccessRuleDto, PositionDto, POSITION_LEVELS } from "./types";
import "../attributes/AttributeFormModal.css";
import "./PositionFormModal.css";

interface Props {
  initial?: PositionDto | null;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
}

type Tab = "basics" | "attributes" | "access";

export function PositionFormModal({ initial, onClose, onSubmit }: Props) {
  const [tab, setTab] = useState<Tab>("basics");

  const [title, setTitle] = useState(initial?.title ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [level, setLevel] = useState(initial?.level ?? "");
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? true);
  const [maxProjects, setMaxProjects] = useState(initial?.maxProjects ?? 3);
  const [projectTagsText, setProjectTagsText] = useState((initial?.projectTags ?? []).join(", "));

  const [attributes, setAttributes] = useState<AttributeDto[]>(initial?.attributes ?? []);
  const [rules, setRules] = useState<AccessRuleDto[]>(initial?.accessRules ?? []);
  const [library, setLibrary] = useState<AttributeDto[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<AttributeDto[]>("/attributes").then(({ data }) => setLibrary(data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      setTab("basics");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        version: initial?.version,
        title,
        shortDescription,
        company: company || null,
        level: level || null,
        isPublic,
        maxProjects,
        projectTags: projectTagsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        attributeIds: attributes.map((a) => a.id),
        accessRules: isPublic ? [] : rules.filter((r) => r.attributeId),
      });
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal-card position-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>{initial ? initial.title : "New position"}</h3>

        {error && <div className="form-error">{error}</div>}

        <div className="position-tabs">
          <button type="button" className={tab === "basics" ? "active" : ""} onClick={() => setTab("basics")}>
            Basics
          </button>
          <button type="button" className={tab === "attributes" ? "active" : ""} onClick={() => setTab("attributes")}>
            Attributes ({attributes.length})
          </button>
          <button type="button" className={tab === "access" ? "active" : ""} onClick={() => setTab("access")}>
            Access {!isPublic && `(${rules.length})`}
          </button>
        </div>

        {tab === "basics" && (
          <div className="position-tab-body">
            <label>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label>
              Short description
              <textarea rows={2} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
            </label>
            <div className="two-col">
              <label>
                Company (optional)
                <input value={company ?? ""} onChange={(e) => setCompany(e.target.value)} />
              </label>
              <label>
                Level (optional)
                <select value={level ?? ""} onChange={(e) => setLevel(e.target.value as any)}>
                  <option value="">—</option>
                  {POSITION_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="two-col">
              <label>
                Max projects in CV
                <input
                  type="number"
                  min={0}
                  value={maxProjects}
                  onChange={(e) => setMaxProjects(Number(e.target.value))}
                />
              </label>
              <label>
                Project tags (comma-separated)
                <input value={projectTagsText} onChange={(e) => setProjectTagsText(e.target.value)} />
              </label>
            </div>
            <label className="checkbox-row">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              Public — accessible to every authenticated user (uncheck to restrict with access rules)
            </label>
          </div>
        )}

        {tab === "attributes" && (
          <div className="position-tab-body">
            <p className="modal-hint">
              Choose which Attribute Library entries appear on CVs generated from this position, in order.
            </p>
            <AttributePicker selected={attributes} onChange={setAttributes} />
          </div>
        )}

        {tab === "access" && (
          <div className="position-tab-body">
            {isPublic ? (
              <p className="modal-hint">This position is public — uncheck "Public" on the Basics tab to add access rules.</p>
            ) : (
              <AccessRulesEditor rules={rules} onChange={setRules} candidateAttributes={library} />
            )}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {initial ? "Save changes" : "Create position"}
          </button>
        </div>
      </form>
    </div>
  );
}
