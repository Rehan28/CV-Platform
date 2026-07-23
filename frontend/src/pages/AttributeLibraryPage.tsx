import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { DataTable, Column } from "../components/common/DataTable";
import { SelectionToolbar } from "../components/common/SelectionToolbar";
import { AttributeFormModal } from "../components/attributes/AttributeFormModal";
import { ATTRIBUTE_CATEGORIES, ATTRIBUTE_TYPE_LABELS, AttributeDto } from "../components/attributes/types";
import "./AttributeLibraryPage.css";

type ViewMode = "all" | "recent";

export function AttributeLibraryPage() {
  const { t } = useTranslation();
  const { hasRole } = useAuth();
  const canManage = hasRole("recruiter");

  const [attributes, setAttributes] = useState<AttributeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [view, setView] = useState<ViewMode>("all");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AttributeDto | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (view === "recent") params.recent = "true";
      else {
        if (search) params.prefix = search;
        if (category) params.category = category;
      }
      const { data } = await api.get<AttributeDto[]>("/attributes", { params });
      setAttributes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(load, 250); // debounce prefix search
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, view]);

  const selectedAttrs = useMemo(
    () => attributes.filter((a) => selected.has(a.id)),
    [attributes, selected]
  );
  const canEditSelection = selectedAttrs.length === 1;
  const canDeleteSelection = selectedAttrs.length > 0 && selectedAttrs.every((a) => !a.isSystem);

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === attributes.length ? new Set() : new Set(attributes.map((a) => a.id))));
  }

  async function handleCreateOrUpdate(payload: any) {
    if (editing) {
      const { data } = await api.put(`/attributes/${editing.id}`, payload);
      setAttributes((prev) => prev.map((a) => (a.id === data.id ? data : a)));
    } else {
      const { data } = await api.post("/attributes", payload);
      setAttributes((prev) => [data, ...prev]);
    }
    setShowForm(false);
    setEditing(null);
    setSelected(new Set());
  }

  async function handleDelete() {
    if (!canDeleteSelection) return;
    if (!confirm(`Delete ${selectedAttrs.length} attribute(s)? This can't be undone.`)) return;
    try {
      await Promise.all(selectedAttrs.map((a) => api.delete(`/attributes/${a.id}`)));
      setAttributes((prev) => prev.filter((a) => !selected.has(a.id)));
      setSelected(new Set());
    } catch (err: any) {
      setError(err.message);
    }
  }

  const columns: Column<AttributeDto>[] = [
    {
      key: "name",
      header: t("attributes.name"),
      render: (a) => (
        <span className="attr-name">
          {a.name}
          {a.isSystem && <span className="badge-system">{t("attributes.system_badge")}</span>}
        </span>
      ),
    },
    { key: "category", header: t("attributes.category"), render: (a) => a.category },
    { key: "type", header: t("attributes.type"), render: (a) => ATTRIBUTE_TYPE_LABELS[a.dataType] },
    {
      key: "description",
      header: t("attributes.description"),
      render: (a) => <span className="attr-desc">{a.description}</span>,
    },
  ];

  return (
    <div className="attr-page">
      <div className="page-head">
        <div>
          <h1>{t("attributes.title")}</h1>
          <p className="page-subtitle">{t("attributes.subtitle")}</p>
        </div>
        {canManage && (
          <button
            className="btn-primary"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + {t("attributes.new")}
          </button>
        )}
      </div>

      <div className="attr-filters">
        <div className="view-tabs">
          <button className={view === "all" ? "active" : ""} onClick={() => setView("all")}>
            {t("attributes.title")}
          </button>
          <button className={view === "recent" ? "active" : ""} onClick={() => setView("recent")}>
            {t("attributes.recently_used")}
          </button>
        </div>

        {view === "all" && (
          <>
            <input
              className="attr-search"
              placeholder={t("attributes.search_placeholder") ?? ""}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">{t("attributes.all_categories")}</option>
              {ATTRIBUTE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="page-loading">{t("common.loading")}</div>
      ) : (
        <DataTable
          columns={columns}
          rows={attributes}
          rowId={(a) => a.id}
          selected={selected}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          emptyMessage={t("attributes.empty")}
        />
      )}

      {canManage && (
        <SelectionToolbar
          count={selected.size}
          label={t("attributes.selected_count", { count: selected.size }) ?? ""}
          onClear={() => setSelected(new Set())}
        >
          <button
            disabled={!canEditSelection}
            onClick={() => {
              setEditing(selectedAttrs[0]);
              setShowForm(true);
            }}
          >
            {t("attributes.edit_selected")}
          </button>
          <button className="danger" disabled={!canDeleteSelection} onClick={handleDelete}>
            {t("attributes.delete_selected")}
          </button>
        </SelectionToolbar>
      )}

      {showForm && (
        <AttributeFormModal
          initial={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSubmit={handleCreateOrUpdate}
        />
      )}
    </div>
  );
}
