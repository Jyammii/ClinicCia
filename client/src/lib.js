export const inputCls = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand";
export const btn = "rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-40";
export const btnGhost = "rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-brand hover:text-brand disabled:opacity-40";
export const card = "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200";

export const peso = (n) => "₱" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
export const todayISO = () => new Date().toLocaleDateString("en-CA");
export const addDaysISO = (iso, n) => { const d = new Date(iso + "T00:00:00"); d.setDate(d.getDate() + n); return d.toLocaleDateString("en-CA"); };
export const fmt = (iso, opts = { month: "short", day: "numeric", year: "numeric" }) => (iso ? new Date((iso.length > 10 ? iso : iso + "T00:00:00")).toLocaleDateString("en-PH", opts) : "-");
export const age = (iso) => (iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 31557600000)) : "");

export const nextDays = (n = 7) => Array.from({ length: n }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d.toLocaleDateString("en-CA"); });
export const fmtDate = (iso, opts = { weekday: "short", month: "short", day: "numeric" }) => new Date(iso + "T00:00:00").toLocaleDateString("en-PH", opts);

export function downloadCsv(name, rows) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const blob = new Blob([rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: name });
  a.click();
  URL.revokeObjectURL(a.href);
}
