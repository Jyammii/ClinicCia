import { go } from "../hooks";
import { useSite } from "../store";
import Tile from "../components/Tile";
import Placeholder from "../components/Placeholder";

function Section({ title, sub, more, children }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#172238]">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{sub}</p>
        </div>
        <a
          href={`#/browse/${more}`}
          className="text-sm font-semibold text-[#2D8982] transition hover:underline"
        >
          View all →
        </a>
      </div>
      {children}
    </section>
  );
}

const pillCls =
  "rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-[#172238] shadow-sm ring-1 ring-[#E2E9ED] transition hover:ring-[#2D8982] hover:text-[#2D8982]";

const grid = "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6";

/* ─── Find a Doctor home page ─────────────────────────────────────────────────── */
function Home() {
  const { site } = useSite();
  const search = (e) => {
    e.preventDefault();
    go("/search?q=" + encodeURIComponent(new FormData(e.target).get("q")));
  };

  return (
    <main>
      {/* ── Hero / Search banner ── */}
      <section className="relative overflow-hidden bg-[#102943] pb-16 pt-20">
        {/* Subtle radial glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #2D8982, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-4xl px-5 text-center">
          <p className="section-label text-[#2D8982]">Book Appointments Online</p>
          <h1 className="mt-4 font-serif text-5xl font-normal text-white md:text-6xl">
            Find a Doctor
          </h1>
          <p className="mt-4 text-lg text-white/60">
            Book your appointment, whether in-person or online
          </p>

          {/* Search bar */}
          <form
            onSubmit={search}
            className="mx-auto mt-10 flex max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-white/20"
          >
            <input
              name="q"
              placeholder="Search for Specialty, Hospital, or Doctor's name…"
              className="min-w-0 flex-1 bg-transparent px-6 py-4 text-sm text-[#172238] outline-none placeholder:text-slate-400"
            />
            <button className="m-1.5 rounded-xl bg-[#2D8982] px-6 text-sm font-semibold text-white transition hover:bg-[#226b66]">
              Search
            </button>
          </form>

          {/* Quick stats */}
          <div className="mx-auto mt-10 flex max-w-sm justify-center gap-10">
            {[
              [site.specialties?.length || "20+", "Specialties"],
              [site.hospitals?.length || "10+", "Hospitals"],
              ["100%", "Verified"],
            ].map(([n, l]) => (
              <div key={l} className="text-center">
                <p className="text-xl font-bold text-white">{n}</p>
                <p className="text-xs text-white/50">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wave divider */}
        <svg
          viewBox="0 0 1440 60"
          className="absolute bottom-0 left-0 w-full text-[#F8FAF9]"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path d="M0 60L1440 60L1440 30C1200 60 960 0 720 30C480 60 240 0 0 30L0 60Z" />
        </svg>
      </section>

      {/* ── Video consultation banner ── */}
      <div className="mx-auto max-w-7xl px-5 pt-6">
        <a
          href="#/search?online=1"
          className="card-hover flex items-center gap-5 overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#E2E9ED] transition"
        >
          <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-[#EAF5F1] text-[#2D8982]">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.845v6.31a1 1 0 0 1-1.447.914L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2D8982]">
              Video Consultation
            </p>
            <p className="mt-0.5 font-semibold text-[#172238]">
              Looking for immediate medical advice? Talk to a doctor within{" "}
              <span className="text-[#2D8982]">15 minutes</span>
            </p>
          </div>
          <span className="hidden shrink-0 rounded-xl bg-[#2D8982] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#226b66] sm:block">
            Consult Now
          </span>
        </a>
      </div>

      {/* ── Specialties ── */}
      <Section title="Top Specialties" sub="People have been looking for these specialties." more="specialties">
        <div className={grid}>
          {site.specialties.map((i) => (
            <Tile key={i.id} item={i} to={`#/search?specialty=${i.id}`} />
          ))}
        </div>
      </Section>

      {/* ── Conditions ── */}
      <Section title="Common Conditions" sub="Easily access doctors treating these conditions" more="conditions">
        <div className={grid}>
          {site.conditions.slice(0, 12).map((i) => (
            <Tile key={i.id} item={i} to={`#/search?condition=${i.id}`} />
          ))}
        </div>
      </Section>

      {/* ── Services ── */}
      <Section title="Common Services" sub="Easily access doctors offering these services" more="services">
        <div className={grid}>
          {site.services.map((i) => (
            <Tile key={i.id} item={i} to={`#/search?service=${i.id}`} />
          ))}
        </div>
      </Section>

      {/* ── Hospitals ── */}
      <Section title="Hospitals near you" sub="We have Doctors in these hospitals who are ready to serve you!" more="hospitals">
        <div className="flex flex-wrap gap-2.5">
          {site.hospitals.map((h) => (
            <a key={h.id} href={`#/search?hospital=${h.id}`} className={pillCls}>
              {h.name}
            </a>
          ))}
        </div>
      </Section>

      {/* ── HMOs ── */}
      <Section title="Accredited Coverage" sub="We've got you covered with Doctors accepting these HMOs!" more="hmos">
        <div className="flex flex-wrap gap-2.5">
          {site.hmos.map((h) => (
            <a key={h} href={`#/search?hmo=${h}`} className={pillCls}>
              {h}
            </a>
          ))}
        </div>
      </Section>
    </main>
  );
}

export default Home;
