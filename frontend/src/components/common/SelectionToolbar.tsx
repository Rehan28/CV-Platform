import { ReactNode } from "react";
import "./SelectionToolbar.css";

interface Props {
  count: number;
  label: string;
  onClear: () => void;
  children: ReactNode; // contextual action buttons
}

// Sits pinned to the bottom of its scroll container and slides up into view
// only once rows are selected - this is what replaces per-row [Edit][Delete]
// buttons everywhere in the app.
export function SelectionToolbar({ count, label, onClear, children }: Props) {
  return (
    <div className={`sel-tray ${count > 0 ? "sel-tray-open" : ""}`} role="toolbar" aria-hidden={count === 0}>
      <div className="sel-tray-inner">
        <button className="sel-tray-clear" onClick={onClear} aria-label="Clear selection">
          ✕
        </button>
        <span className="sel-tray-count">{label}</span>
        <div className="sel-tray-actions">{children}</div>
      </div>
    </div>
  );
}
