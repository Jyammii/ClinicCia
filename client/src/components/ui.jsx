import { useEffect } from "react";

/* ─── Status colour mapping ─────────────────────────────────────────────────── */
const TONES = {
  green:  "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  blue:   "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  slate:  "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  red:    "bg-red-50 text-red-600 ring-1 ring-red-200",
  amber:  "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  teal:   "bg-[#EAF5F1] text-[#2D8982] ring-1 ring-[#2D8982]/30",
  navy:   "bg-[#EAF5F1] text-[#102943] ring-1 ring-[#102943]/20",
  brand:  "bg-[#EAF5F1] text-[#2D8982] ring-1 ring-[#2D8982]/30",
};

const STATUS_TONE = {
  Confirmed:   "blue",
  "Checked-in":"amber",
  Completed:   "green",
  Cancelled:   "slate",
  "No-show":   "red",
  Unpaid:      "red",
  Partial:     "amber",
  Paid:        "green",
  Void:        "slate",
  None:        "slate",
  Submitted:   "blue",
  Approved:    "amber",
  Rejected:    "red",
  Draft:       "amber",
  New:         "teal",
  Contacted:   "amber",
  Closed:      "slate",
  Scheduled:   "blue",
  Present:     "green",
  Absent:      "red",
  Leave:       "amber",
};

/* ─── Badge ─────────────────────────────────────────────────────────────────── */
export function Badge({ children, tone }) {
  const t = tone || STATUS_TONE[children] || "slate";
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[t]}`}>
      {children}
    </span>
  );
}

/* ─── Modal ─────────────────────────────────────────────────────────────────── */
export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-[#102943]/60 p-4 backdrop-blur-sm sm:p-8"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`print-area animate-fade-up w-full rounded-2xl bg-white shadow-2xl ring-1 ring-[#E2E9ED] ${wide ? "max-w-3xl" : "max-w-lg"}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E2E9ED] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#172238]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="no-print flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ─── Field ─────────────────────────────────────────────────────────────────── */
export const Field = ({ label, children, className = "" }) => (
  <label className={`block ${className}`}>
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
    {children}
  </label>
);

/* ─── Notice ─────────────────────────────────────────────────────────────────── */
export const Notice = ({ children, tone = "red" }) =>
  children ? (
    <p className={`rounded-xl px-4 py-3 text-sm font-medium ${tone === "red" ? "bg-red-50 text-red-600 ring-1 ring-red-200" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"}`}>
      {children}
    </p>
  ) : null;

/* ─── Loading ────────────────────────────────────────────────────────────────── */
export const Loading = ({ error, retry }) => (
  <div className="py-20 text-center text-sm text-slate-400">
    {error ? (
      <>
        <p className="text-red-500">{error}</p>
        {retry && (
          <button onClick={retry} className="mt-3 rounded-xl bg-[#2D8982] px-5 py-2 text-sm font-semibold text-white hover:bg-[#226b66]">
            Try again
          </button>
        )}
      </>
    ) : (
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E2E9ED] border-t-[#2D8982]" />
        <span>Loading…</span>
      </div>
    )}
  </div>
);

/* ─── Stat card ──────────────────────────────────────────────────────────────── */
export const Stat = ({ label, value, sub, tone, icon }) => (
  <div className="stat-card relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#E2E9ED] transition hover:shadow-md">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className={`mt-2 text-2xl font-bold tracking-tight ${tone === "red" ? "text-red-500" : "text-[#172238]"}`}>{value}</p>
        {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
      </div>
      {icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF5F1] text-[#2D8982]">
          {icon}
        </span>
      )}
    </div>
  </div>
);

/* ─── Table ──────────────────────────────────────────────────────────────────── */
export const Table = ({ heads, children, empty = "Nothing here yet." }) => {
  const rows = Array.isArray(children) ? children.flat().filter(Boolean) : children ? [children] : [];
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-[#E2E9ED]">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-[#E2E9ED] bg-[#F8FAF9]">
          <tr>
            {heads.map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E9ED]">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={heads.length} className="py-16 text-center text-slate-400">
                {empty}
              </td>
            </tr>
          ) : (
            rows
          )}
        </tbody>
      </table>
    </div>
  );
};

/* ─── Tabs ───────────────────────────────────────────────────────────────────── */
export const Tabs = ({ tabs, value, onChange }) => (
  <div className="mb-6 flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
    {tabs.map(([k, n]) => (
      <button
        key={k}
        onClick={() => onChange(k)}
        className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${value === k ? "bg-[#102943] text-white shadow-sm" : "text-slate-500 hover:bg-white hover:text-[#172238]"}`}
      >
        {n}
      </button>
    ))}
  </div>
);
