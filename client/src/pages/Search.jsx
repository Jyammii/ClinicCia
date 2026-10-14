import { go } from "../hooks";
import { useFetch } from "../hooks";
import { useSite } from "../store";
import DoctorCard from "../components/DoctorCard";
import { Loading } from "../components/ui";

const selCls =
  "rounded-xl border border-[#E2E9ED] bg-white px-3.5 py-2.5 text-sm text-[#172238] outline-none transition focus:border-[#2D8982] focus:ring-2 focus:ring-[#2D8982]/20";

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
    return (
      text.includes(q.toLowerCase()) &&
      (!specialty || d.specialty === specialty) &&
      (!hospital || d.hospital === hospital) &&
      (!hmo || d.hmos.includes(hmo)) &&
      (!condition || d.conditions?.includes(condition)) &&
      (!service || d.services?.includes(service)) &&
      (!online || d.online)
    );
  });

  const Select = ({ k, value, label, options }) => (
    <select className={selCls} value={value} onChange={(e) => set(k, e.target.value)} aria-label={label}>
      <option value="">{label}</option>
      {options.map(([v, n]) => (
        <option key={v} value={v}>{n}</option>
      ))}
    </select>
  );

  return (
    <main>
      {/* Search header */}
      <section className="bg-[#F8FAF9] border-b border-[#E2E9ED] px-5 py-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-5 font-serif text-3xl font-normal text-[#172238]">Find a Doctor</h1>

          {/* Search bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); set("q", new FormData(e.target).get("q")); }}
            className="flex overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#E2E9ED]"
          >
            <input
              key={q}
              name="q"
              defaultValue={q}
              placeholder="Search for Specialty, Hospital name, or your Doctor's name…"
              className="min-w-0 flex-1 px-5 py-3.5 text-sm text-[#172238] outline-none placeholder:text-slate-400"
            />
            <button className="m-1.5 rounded-xl bg-[#2D8982] px-6 text-sm font-semibold text-white transition hover:bg-[#226b66]">
              Search
            </button>
          </form>

          {/* Filters */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Select k="specialty" value={specialty} label="All specialties" options={site.specialties.map((s) => [s.id, s.name])} />
            <Select k="hospital" value={hospital} label="All hospitals" options={site.hospitals.map((h) => [h.id, h.name])} />
            <Select k="hmo" value={hmo} label="All HMOs" options={site.hmos.map((h) => [h, h])} />
            <label className="flex items-center gap-2 rounded-xl border border-[#E2E9ED] bg-white px-3.5 py-2.5 text-sm text-[#172238] cursor-pointer hover:border-[#2D8982]">
              <input
                type="checkbox"
                checked={!!online}
                onChange={(e) => set("online", e.target.checked ? "1" : "")}
                className="accent-[#2D8982]"
              />
              Video consult
            </label>
            <a href="#/search" className="ml-auto text-sm font-medium text-[#2D8982] hover:underline">
              Clear filters
            </a>
          </div>
        </div>
      </section>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-5 py-8">
        {loading ? (
          <Loading error={error} retry={reload} />
        ) : (
          <>
            <p className="mb-5 text-sm text-slate-500">
              <span className="font-semibold text-[#172238]">{list.length}</span>{" "}
              doctor{list.length === 1 ? "" : "s"} found
            </p>
            {list.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-[#E2E9ED] py-24 text-center">
                <p className="text-slate-400">No doctors match your search.</p>
                <a href="#/search" className="mt-3 inline-block text-sm font-semibold text-[#2D8982] hover:underline">
                  Clear filters
                </a>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {list.map((d) => (
                  <DoctorCard
                    key={d._id}
                    doctor={d}
                    specialty={spec(d.specialty)}
                    hospital={hosp(d.hospital)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default Search;
