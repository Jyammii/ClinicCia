import { go } from "../hooks";
import { useFetch } from "../hooks";
import { useSite } from "../store";
import DoctorCard from "../components/DoctorCard";
import { Loading } from "../components/ui";

const sel = "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand";

function Search({ query }) {
  const { site } = useSite();
  const { data: doctors, loading, error, reload } = useFetch("/doctors");
  const { q = "", specialty = "", hospital = "", hmo = "", condition = "", service = "", online = "" } = query;
  const spec = (id) => site.specialties.find((s) => s.id === id);
  const hosp = (id) => site.hospitals.find((h) => h.id === id);
  const set = (k, v) => {
    const p = new URLSearchParams(query);
    v ? p.set(k, v) : p.delete(k);
    go("/search?" + p);
  };
  const list = (doctors || []).filter((d) => {
    const text = `${d.name} ${spec(d.specialty)?.name} ${hosp(d.hospital)?.name}`.toLowerCase();
    return text.includes(q.toLowerCase()) && (!specialty || d.specialty === specialty) && (!hospital || d.hospital === hospital)
      && (!hmo || d.hmos.includes(hmo)) && (!condition || d.conditions?.includes(condition))
      && (!service || d.services?.includes(service)) && (!online || d.online);
  });
  const Select = ({ k, value, label, options }) => (
    <select className={sel} value={value} onChange={(e) => set(k, e.target.value)} aria-label={label}>
      <option value="">{label}</option>
      {options.map(([v, n]) => <option key={v} value={v}>{n}</option>)}
    </select>
  );
  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <form onSubmit={(e) => { e.preventDefault(); set("q", new FormData(e.target).get("q")); }} className="flex overflow-hidden rounded-full bg-white shadow ring-1 ring-slate-200">
        <input key={q} name="q" defaultValue={q} placeholder="Search for Specialty, Hospital name, or your Doctor's name..." className="min-w-0 flex-1 px-6 py-3 text-sm outline-none" />
        <button className="bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-dark">Search</button>
      </form>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Select k="specialty" value={specialty} label="All specialties" options={site.specialties.map((s) => [s.id, s.name])} />
        <Select k="hospital" value={hospital} label="All hospitals" options={site.hospitals.map((h) => [h.id, h.name])} />
        <Select k="hmo" value={hmo} label="All HMOs" options={site.hmos.map((h) => [h, h])} />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={!!online} onChange={(e) => set("online", e.target.checked ? "1" : "")} className="accent-brand" /> Video consult
        </label>
        <a href="#/search" className="ml-auto text-sm font-medium text-brand hover:underline">Clear filters</a>
      </div>
      {loading ? <Loading error={error} retry={reload} /> : (
        <>
          <p className="mb-4 mt-6 text-sm text-slate-500">{list.length} doctor{list.length === 1 ? "" : "s"} found</p>
          {list.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 py-20 text-center text-slate-400">No doctors match your search.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">{list.map((d) => <DoctorCard key={d._id} doctor={d} specialty={spec(d.specialty)} hospital={hosp(d.hospital)} />)}</div>
          )}
        </>
      )}
    </main>
  );
}
export default Search;
