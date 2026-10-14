import { peso } from "../lib";

// Simple dependency-free column chart. data: [{ date | label, value }]
export function BarChart({ data, money = false, height = 160 }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div>
      <div className="flex items-end gap-[3px]" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="group relative flex h-full flex-1 items-end">
            <div className="w-full rounded-t bg-brand/80 transition group-hover:bg-brand" style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 3 : 0 }} />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
              {d.date || d.label}: {money ? peso(d.value) : d.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>{data[0]?.date}</span><span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

// Horizontal ranking bars. rows: [{ label, value }]
export function HBars({ rows, money = false, empty = "No data in this range." }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="py-6 text-center text-sm text-slate-400">{empty}</p>;
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="mb-1 flex justify-between gap-3 text-sm"><span className="truncate text-slate-700">{r.label}</span><span className="shrink-0 font-semibold">{money ? peso(r.value) : r.value}</span></div>
          <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-brand" style={{ width: `${(r.value / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}
