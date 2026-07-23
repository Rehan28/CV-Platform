import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { DataTable, Column } from "../components/common/DataTable";
import { SelectionToolbar } from "../components/common/SelectionToolbar";
import { PositionFormModal } from "../components/positions/PositionFormModal";
import { PositionDto, POSITION_LEVELS } from "../components/positions/types";
import "./PositionsPage.css";

export function PositionsPage() {
  const { t } = useTranslation();
  const { hasRole } = useAuth();
  const canManage = hasRole("recruiter");

  const [positions, setPositions] = useState<PositionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [access, setAccess] = useState<"" | "public" | "restricted">("");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PositionDto | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<PositionDto[]>("/positions");
      setPositions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return positions.filter((p) => {
      if (level && p.level !== level) return false;
      if (access === "public" && !p.isPublic) return false;
      if (access === "restricted" && p.isPublic) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${p.title} ${p.company ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      // Candidates/anon only ever get eligible positions back from the API,
      // but hide ineligible restricted ones defensively too.
      if (!canManage && p.eligible === false) return false;
      return true;
    });
  }, [positions, level, access, search, canManage]);

  const selectedPositions = useMemo(() => positions.filter((p) => selected.has(p.id)), [positions, selected]);
  const canEditSelection = selectedPositions.length === 1;
  const canDuplicateSelection = selectedPositions.length === 1;
  const canDeleteSelection = selectedPositions.length > 0;

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((p) => p.id))));
  }

  async function handleCreateOrUpdate(payload: any) {
    if (editing) {
      const { data } = await api.put(`/positions/${editing.id}`, payload);
      setPositions((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    } else {
      const { data } = await api.post("/positions", payload);
      setPositions((prev) => [data, ...prev]);
    }
    setShowForm(false);
    setEditing(null);
    setSelected(new Set());
  }

  async function handleDuplicate() {
    if (!canDuplicateSelection) return;
    try {
      const { data } = await api.post(`/positions/${selectedPositions[0].id}/duplicate`);
      setPositions((prev) => [data, ...prev]);
      setSelected(new Set());
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    if (!canDeleteSelection) return;
    if (!confirm(`Delete ${selectedPositions.length} position(s)? Already-created CVs are kept but hidden.`)) return;
    try {
      await Promise.all(selectedPositions.map((p) => api.delete(`/positions/${p.id}`)));
      setPositions((prev) => prev.filter((p) => !selected.has(p.id)));
      setSelected(new Set());
    } catch (err: any) {
      setError(err.message);
    }
  }

  const columns: Column<PositionDto>[] = [
    {
      key: "title",
      header: "Title",
      render: (p) => (
        <span className="pos-title">
          {p.title}
          {!p.isPublic && <span className="badge-restricted">Restricted</span>}
        </span>
      ),
    },
    { key: "company", header: "Company", render: (p) => p.company ?? "—" },
    { key: "level", header: "Level", render: (p) => p.level ?? "—" },
    { key: "attributes", header: "Attributes", render: (p) => p.attributes.length },
    {
      key: "tags",
      header: "Project tags",
      render: (p) => (p.projectTags.length ? p.projectTags.join(", ") : "—"),
    },
    { key: "updatedAt", header: "Updated", render: (p) => new Date(p.updatedAt).toLocaleDateString() },
  ];

  return (
    <div className="pos-page">
      <div className="page-head">
        <div>
          <h1>{t("nav.positions")}</h1>
          <p className="page-subtitle">Customizable CV templates, shared across all recruiters.</p>
        </div>
        {canManage && (
          <button
            className="btn-primary"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + New position
          </button>
        )}
      </div>

      <div className="pos-filters">
        <input
          className="pos-search"
          placeholder="Search title or company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">All levels</option>
          {POSITION_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        {canManage && (
          <select value={access} onChange={(e) => setAccess(e.target.value as any)}>
            <option value="">All access</option>
            <option value="public">Public</option>
            <option value="restricted">Restricted</option>
          </select>
        )}
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="page-loading">{t("common.loading")}</div>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowId={(p) => p.id}
          selected={selected}
          onToggleRow={toggleRow}
          onToggleAll={toggleAll}
          emptyMessage="No positions match your filters yet."
        />
      )}

      {canManage && (
        <SelectionToolbar
          count={selected.size}
          label={`${selected.size} selected`}
          onClear={() => setSelected(new Set())}
        >
          <button
            disabled={!canEditSelection}
            onClick={() => {
              setEditing(selectedPositions[0]);
              setShowForm(true);
            }}
          >
            Edit
          </button>
          <button disabled={!canDuplicateSelection} onClick={handleDuplicate}>
            Duplicate
          </button>
          <button className="danger" disabled={!canDeleteSelection} onClick={handleDelete}>
            Delete
          </button>
        </SelectionToolbar>
      )}

      {showForm && (
        <PositionFormModal
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
