import { ReactNode } from "react";
import "./DataTable.css";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowId: (row: T) => string;
  selected: Set<string>;
  onToggleRow: (id: string) => void;
  onToggleAll: () => void;
  emptyMessage: string;
}

export function DataTable<T>({ columns, rows, rowId, selected, onToggleRow, onToggleAll, emptyMessage }: Props<T>) {
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(rowId(r)));

  if (rows.length === 0) {
    return <div className="dt-empty">{emptyMessage}</div>;
  }

  return (
    <div className="dt-wrapper">
      <table className="dt-table">
        <thead>
          <tr>
            <th className="dt-check-col">
              <input type="checkbox" checked={allSelected} onChange={onToggleAll} aria-label="Select all rows" />
            </th>
            {columns.map((c) => (
              <th key={c.key} style={{ width: c.width }}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = rowId(row);
            const isSelected = selected.has(id);
            return (
              <tr key={id} className={isSelected ? "dt-row-selected" : ""} onClick={() => onToggleRow(id)}>
                <td className="dt-check-col" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={isSelected} onChange={() => onToggleRow(id)} />
                </td>
                {columns.map((c) => (
                  <td key={c.key}>{c.render(row)}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
