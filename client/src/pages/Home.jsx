import { go } from "../hooks";
import { useSite } from "../store";
import Tile from "../components/Tile";
import Placeholder from "../components/Placeholder";

function Section({ title, sub, more, children }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-8">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mb-5 mt-1 text-slate-500">{sub}</p>
      {children}
      <a href={`#/browse/${more}`} className="mt-5 inline-block text-sm font-semibold text-brand hover:underline">View All →</a>
    </section>
  );
}
const grid = "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6";
const pill = "rounded-full bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:text-brand hover:ring-brand";

// "Find a Doctor" home: search, specialties, conditions, services, hospitals and HMOs.
function Home() {
  const { site } = useSite();
  const search = (e) => {
    e.preventDefault();
    go("/search?q=" + encodeURIComponent(new FormData(e.target).get("q")));
  };
  return (
    <main>
      <section className="bg-brand-light">
        <div className="mx-auto max-w-4xl px-5 py-14 text-center">
          <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">Find a Doctor</h1>
          <p className="mt-3 text-lg text-slate-600">Book your Appointment, whether in-person or online</p>
          <form onSubmit={search} className="mx-auto mt-8 flex max-w-2xl overflow-hidden rounded-full bg-white shadow-lg ring-1 ring-slate-200">
            <input name="q" placeholder="Search for Specialty, Hospital name, or your Doctor's name..." className="min-w-0 flex-1 px-6 py-4 text-sm outline-none" />
            <button className="bg-brand px-7 text-sm font-semibold text-white hover:bg-brand-dark">Search</button>
          </form>
          <a href="#/search?online=1" className="mt-8 flex items-center gap-5 overflow-hidden rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 transition hover:shadow-lg">
            <Placeholder src={site.hero} label="Video consultation banner" className="h-24 w-32 shrink-0 rounded-xl" />
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand">Video Consultation</p>
              <p className="font-semibold text-slate-900">Looking for immediate medical advice? Talk to a doctor within <b className="text-brand">15 minutes</b></p>
            </div>
            <span className="hidden rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white sm:block">Consult Now</span>
          </a>
        </div>
      </section>

      <Section title="Top Specialties" sub="People have been looking for these specialties." more="specialties">
        <div className={grid}>{site.specialties.map((i) => <Tile key={i.id} item={i} to={`#/search?specialty=${i.id}`} />)}</div>
      </Section>
      <Section title="Common Conditions" sub="Easily access doctors treating these conditions" more="conditions">
        <div className={grid}>{site.conditions.slice(0, 12).map((i) => <Tile key={i.id} item={i} to={`#/search?condition=${i.id}`} />)}</div>
      </Section>
      <Section title="Common Services" sub="Easily access doctors offering these services" more="services">
        <div className={grid}>{site.services.map((i) => <Tile key={i.id} item={i} to={`#/search?service=${i.id}`} />)}</div>
      </Section>
      <Section title="Hospitals near you" sub="We have Doctors in these hospitals who are ready to serve you!" more="hospitals">
        <div className="flex flex-wrap gap-3">{site.hospitals.map((h) => <a key={h.id} href={`#/search?hospital=${h.id}`} className={pill}>{h.name}</a>)}</div>
      </Section>
      <Section title="Accredited Coverage" sub="We've got you covered with Doctors accepting these HMOs!" more="hmos">
        <div className="flex flex-wrap gap-3">{site.hmos.map((h) => <a key={h} href={`#/search?hmo=${h}`} className={pill}>{h}</a>)}</div>
      </Section>
    </main>
  );
}
export default Home;
