import { useEffect } from "react";

const TONES = {
  green: "bg-green-100 text-green-700", blue: "bg-blue-100 text-blue-700", slate: "bg-slate-100 text-slate-500",
  red: "bg-red-100 text-red-600", amber: "bg-amber-100 text-amber-700", brand: "bg-brand-light text-brand",
};
const STATUS_TONE = {
  Confirmed: "blue", "Checked-in": "amber", Completed: "green", Cancelled: "slate", "No-show": "red",
  Unpaid: "red", Partial: "amber", Paid: "green", Void: "slate",
  None: "slate", Submitted: "blue", Approved: "amber", Rejected: "red",
  Draft: "amber", New: "blue", Contacted: "amber", Closed: "slate",
  Scheduled: "blue", Present: "green", Absent: "red", Leave: "amber",
};

export function Badge({ children, tone }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${TONES[tone || STATUS_TONE[children] || "slate"]}`}>{children}</span>;
}

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 sm:p-8" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`print-area w-full rounded-2xl bg-white p-6 shadow-xl ${wide ? "max-w-3xl" : "max-w-lg"}`}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="no-print text-2xl leading-none text-slate-400 hover:text-slate-700">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const Field = ({ label, children, className = "" }) => (
  <label className={`block ${className}`}>
    <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
    {children}
  </label>
);

export const Notice = ({ children, tone = "red" }) =>
  children ? <p className={`rounded-xl p-3 text-sm ${tone === "red" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>{children}</p> : null;

export const Loading = ({ error, retry }) => (
  <div className="py-16 text-center text-sm text-slate-400">
    {error ? <><p className="text-red-500">{error}</p>{retry && <button onClick={retry} className="mt-2 font-semibold text-brand">Try again</button>}</> : "Loading..."}
  </div>
);

export const Stat = ({ label, value, sub, tone }) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className={`mt-1 text-2xl font-bold ${tone === "red" ? "text-red-500" : "text-slate-900"}`}>{value}</p>
    {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
  </div>
);

export const Table = ({ heads, children, empty = "Nothing here yet." }) => {
  const rows = Array.isArray(children) ? children.flat().filter(Boolean) : children ? [children] : [];
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500"><tr>{heads.map((h) => <th key={h} className="whitespace-nowrap px-4 py-3 font-medium">{h}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 ? <tr><td colSpan={heads.length} className="py-12 text-center text-slate-400">{empty}</td></tr> : rows}
        </tbody>
      </table>
    </div>
  );
};

export const Tabs = ({ tabs, value, onChange }) => (
  <div className="mb-6 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-slate-100 p-1">
    {tabs.map(([k, n]) => (
      <button key={k} onClick={() => onChange(k)} className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium ${value === k ? "bg-brand text-white" : "text-slate-500 hover:bg-white"}`}>{n}</button>
    ))}
  </div>
);
