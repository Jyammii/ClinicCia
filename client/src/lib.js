// ─── Reusable class strings ─────────────────────────────────────────────────

export const inputCls =
  "w-full rounded-xl border border-[#E2E9ED] bg-white px-3.5 py-2.5 text-sm text-[#172238] outline-none transition placeholder:text-slate-400 focus:border-[#2D8982] focus:ring-2 focus:ring-[#2D8982]/20";

export const btn =
  "inline-flex items-center justify-center rounded-xl bg-[#2D8982] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#226b66] disabled:opacity-40 active:scale-[0.98]";

export const btnNavy =
  "inline-flex items-center justify-center rounded-xl bg-[#102943] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a4a6e] disabled:opacity-40 active:scale-[0.98]";

export const btnGhost =
  "inline-flex items-center justify-center rounded-xl border border-[#E2E9ED] px-4 py-2 text-sm font-medium text-[#172238] transition hover:border-[#2D8982] hover:text-[#2D8982] disabled:opacity-40";

export const btnOutlineTeal =
  "inline-flex items-center justify-center rounded-xl border-2 border-[#2D8982] px-5 py-2.5 text-sm font-semibold text-[#2D8982] transition hover:bg-[#2D8982] hover:text-white disabled:opacity-40";

export const card =
  "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E2E9ED]";

// ─── Formatting helpers ─────────────────────────────────────────────────────

export const peso = (n) =>
  "₱" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const todayISO = () => new Date().toLocaleDateString("en-CA");

export const addDaysISO = (iso, n) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("en-CA");
};

export const fmt = (
  iso,
  opts = { month: "short", day: "numeric", year: "numeric" }
) =>
  iso
    ? new Date(iso.length > 10 ? iso : iso + "T00:00:00").toLocaleDateString("en-PH", opts)
    : "-";

export const age = (iso) =>
  iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 31557600000)) : "";

export const nextDays = (n = 7) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toLocaleDateString("en-CA");
  });

export const fmtDate = (iso, opts = { weekday: "short", month: "short", day: "numeric" }) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-PH", opts);

export function downloadCsv(name, rows) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const blob = new Blob([rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv" });
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: name,
  });
  a.click();
  URL.revokeObjectURL(a.href);
}
