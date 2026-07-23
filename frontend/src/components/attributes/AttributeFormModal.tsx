import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ATTRIBUTE_CATEGORIES, ATTRIBUTE_TYPES, ATTRIBUTE_TYPE_LABELS, AttributeDto } from "./types";
import "./AttributeFormModal.css";

interface Props {
  initial?: AttributeDto | null;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category: string;
    description: string;
    dataType: string;
    options: string[] | null;
  }) => Promise<void>;
}

export function AttributeFormModal({ initial, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? ATTRIBUTE_CATEGORIES[0]);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [dataType, setDataType] = useState(initial?.dataType ?? ATTRIBUTE_TYPES[0]);
  const [optionsText, setOptionsText] = useState((initial?.options ?? []).join("\n"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSystem = !!initial?.isSystem;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        name,
        category,
        description,
        dataType,
        options: dataType === "one_of_many" ? optionsText.split("\n").map((s) => s.trim()).filter(Boolean) : null,
      });
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>{initial ? initial.name : t("attributes.new")}</h3>

        {error && <div className="form-error">{error}</div>}

        <label>
          {t("attributes.name")}
          <input value={name} onChange={(e) => setName(e.target.value)} required disabled={isSystem} />
        </label>

        <label>
          {t("attributes.category")}
          <select value={category} onChange={(e) => setCategory(e.target.value as any)}>
            {ATTRIBUTE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          {t("attributes.type")}
          <select value={dataType} onChange={(e) => setDataType(e.target.value as any)} disabled={isSystem}>
            {ATTRIBUTE_TYPES.map((tpe) => (
              <option key={tpe} value={tpe}>
                {ATTRIBUTE_TYPE_LABELS[tpe]}
              </option>
            ))}
          </select>
        </label>

        {dataType === "one_of_many" && (
          <label>
            {t("attributes.options")}
            <textarea rows={4} value={optionsText} onChange={(e) => setOptionsText(e.target.value)} />
          </label>
        )}

        <label>
          {t("attributes.description")}
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            {t("attributes.cancel")}
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {t("attributes.save")}
          </button>
        </div>
      </form>
    </div>
  );
}
