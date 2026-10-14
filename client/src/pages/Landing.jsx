import { useEffect, useState } from "react";
import { api } from "../api";
import { useSite } from "../store";
import { FEATURES, PLANS, MATRIX, PRICE } from "../data/constants";
import { inputCls, peso } from "../lib";
import Placeholder from "../components/Placeholder";
import { Notice } from "../components/ui";

/* ─── Check mark ─────────────────────────────────────────────────────────────── */
const Check = ({ on }) =>
  on ? (
    <span className="font-bold text-[#2D8982]" aria-label="Included">✓</span>
  ) : (
    <span className="text-slate-300" aria-label="Not included">–</span>
  );

/* ─── Feature icon map (SVG inline) ─────────────────────────────────────────── */
const ICONS = {
  clinical: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" strokeLinecap="round"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <path d="M9 12h6M9 16h4" strokeLinecap="round"/>
    </svg>
  ),
  pharmacy: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" strokeLinecap="round"/>
    </svg>
  ),
  inventory: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" strokeLinecap="round"/>
      <path d="M16 7V5a2 2 0 0 0-4 0v2M12 12v4M10 14h4" strokeLinecap="round"/>
    </svg>
  ),
  billing: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M2 10h20" strokeLinecap="round"/>
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round"/>
    </svg>
  ),
};

/* ─── Pricing section ─────────────────────────────────────────────────────────── */
function Pricing() {
  const [annual, setAnnual] = useState(false);
  const perks = [
    "Unlimited patient records and appointments",
    "Online booking page with your own doctors and photos",
    "Billing, HMO claims, pharmacy and payroll modules",
    "Guided setup and staff training",
    "Role-based access for every team member",
  ];
  return (
    <section className="bg-[#F8FAF9] py-20">
      <div className="mx-auto max-w-3xl px-5 text-center">
        <p className="section-label">Pricing</p>
        <h2 className="mt-2 font-serif text-4xl font-normal text-[#172238]">
          Start free, pay when it works for you
        </h2>
        <p className="mt-3 text-slate-500">
          Scalable EMR, queueing and HMO billing tailored for Philippine clinics.
        </p>

        {/* Toggle */}
        <div className="mx-auto mt-6 flex w-fit gap-1 rounded-xl bg-slate-100 p-1 text-sm font-medium">
          {[
            [false, "Monthly"],
            [true, "Annual · save 1 month"],
          ].map(([v, n]) => (
            <button
              key={n}
              onClick={() => setAnnual(v)}
              className={`rounded-lg px-5 py-2 transition ${annual === v ? "bg-[#102943] text-white shadow-sm" : "text-slate-600"}`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Pricing card */}
        <div className="mx-auto mt-10 max-w-md overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-[#E2E9ED]">
          <div className="bg-[#102943] px-8 py-6 text-left">
            <p className="text-sm font-semibold text-[#2D8982]">Clinic Management System</p>
            <p className="mt-2 text-4xl font-bold text-white">
              {peso(annual ? PRICE.annual : PRICE.monthly)}{" "}
              <span className="text-base font-normal text-white/60">
                / doctor / {annual ? "year" : "month"}
              </span>
            </p>
            <p className="mt-1 text-sm text-white/50">
              {annual ? "Billed yearly per doctor." : "Billed monthly per doctor."}
            </p>
          </div>
          <div className="px-8 py-7 text-left">
            <ul className="space-y-3 text-sm text-slate-600">
              {perks.map((p) => (
                <li key={p} className="flex gap-3">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EAF5F1] text-[#2D8982]">
                    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="currentColor">
                      <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <a
              href="#/login"
              className="mt-8 block rounded-xl bg-[#2D8982] py-3.5 text-center font-semibold text-white transition hover:bg-[#226b66]"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Demo request form ───────────────────────────────────────────────────────── */
function DemoForm() {
  const [f, setF] = useState({ name: "", clinic: "", email: "", phone: "", message: "" });
  const [state, setState] = useState({ busy: false, done: false, err: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, done: false, err: "" });
    try {
      await api.post("/inquiries", f);
      setState({ busy: false, done: true, err: "" });
      setF({ name: "", clinic: "", email: "", phone: "", message: "" });
    } catch (ex) {
      setState({ busy: false, done: false, err: ex.message });
    }
  };
  return (
    <section id="demo" className="bg-[#102943] py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-12 px-5 md:grid-cols-2">
        <div>
          <p className="section-label text-[#2D8982]">Get in touch</p>
          <h2 className="mt-3 font-serif text-4xl font-normal text-white">
            Ready to move your clinic to ClinicNow?
          </h2>
          <p className="mt-4 leading-relaxed text-white/60">
            Request a free consultation and see how your clinic can switch to a smarter, connected
            system without losing your existing records.
          </p>
          <div className="mt-8 space-y-4">
            {[
              ["Setup in days, not months", "We handle migration of your existing data."],
              ["Training included", "Your team is ready to use it from day one."],
              ["Local support", "Philippine-based team for your questions."],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2D8982] text-white">
                  <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-sm text-white/50">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-8 shadow-2xl">
          {state.done && (
            <Notice tone="green">
              Thank you! Your submission has been received. We will get back to you soon.
            </Notice>
          )}
          <input className={inputCls} placeholder="Full name *" value={f.name} onChange={set("name")} required />
          <input className={inputCls} placeholder="Clinic or hospital name" value={f.clinic} onChange={set("clinic")} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={inputCls} type="email" placeholder="Email *" value={f.email} onChange={set("email")} required />
            <input className={inputCls} placeholder="Phone" value={f.phone} onChange={set("phone")} />
          </div>
          <textarea className={inputCls} rows="3" placeholder="How can we help?" value={f.message} onChange={set("message")} />
          <Notice>{state.err}</Notice>
          <button
            disabled={state.busy}
            className="w-full rounded-xl bg-[#102943] py-3.5 font-semibold text-white transition hover:bg-[#1a4a6e] disabled:opacity-50"
          >
            {state.busy ? "Sending…" : "Request a Demo"}
          </button>
        </form>
      </div>
    </section>
  );
}

/* ─── Landing page ────────────────────────────────────────────────────────────── */
function Landing({ query }) {
  const { site } = useSite();
  useEffect(() => {
    if (query.section) document.getElementById(query.section)?.scrollIntoView({ behavior: "smooth" });
  }, [query.section]);
  const img = site.landing || {};

  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#EAF5F1]">
        {/* Decorative blob */}
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #2D8982 0%, transparent 70%)" }}
        />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-2">
          {/* Left */}
          <div className="animate-fade-up">
            <p className="section-label">{site.siteName} for Clinics</p>
            <h1 className="mt-4 font-serif text-5xl font-normal leading-[1.12] text-[#172238] md:text-6xl">
              Everything you need to run and grow your clinic
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              From booking to billing and clinic operations, all-in-one platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#/login"
                className="rounded-xl bg-[#102943] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1a4a6e]"
              >
                Get Started
              </a>
              <a
                href="#/?section=demo"
                className="rounded-xl border-2 border-[#102943] px-7 py-3.5 text-sm font-semibold text-[#102943] transition hover:bg-[#102943] hover:text-white"
              >
                Talk to our team
              </a>
            </div>
            <p className="mt-5 text-sm text-slate-500">Built for clinics with 2 or more doctors.</p>

            {/* Stats row */}
            <div className="mt-10 flex gap-8 border-t border-[#E2E9ED] pt-8">
              {[["500+", "Clinics"], ["50k+", "Appointments"], ["99.9%", "Uptime"]].map(([n, l]) => (
                <div key={l}>
                  <p className="text-2xl font-bold text-[#172238]">{n}</p>
                  <p className="text-xs text-slate-500">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right – hero image */}
          <div className="animate-fade-up anim-delay-2 relative">
            <Placeholder
              src={img.hero}
              label="Landing hero image"
              className="aspect-[4/3] w-full rounded-3xl shadow-2xl"
            />
            {/* Floating badge */}
            <div className="absolute -bottom-4 left-6 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-[#E2E9ED]">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF5F1] text-[#2D8982]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" strokeLinecap="round"/>
                  <rect x="9" y="3" width="6" height="4" rx="1"/>
                  <path d="M9 12h6M9 16h4" strokeLinecap="round"/>
                </svg>
              </span>
              <div>
                <p className="text-xs text-slate-500">Next appointment</p>
                <p className="text-sm font-bold text-[#172238]">Today · 2:30 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label">One system for your whole clinic</p>
          <h2 className="mt-3 font-serif text-4xl font-normal text-[#172238]">
            From booking to billing and clinic operations
          </h2>
        </div>
        <div className="mt-16 space-y-20">
          {FEATURES.map((f, i) => (
            <div key={f.key} className="grid items-center gap-12 md:grid-cols-2">
              <div className={i % 2 ? "md:order-2" : ""}>
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF5F1] text-[#2D8982]">
                  {ICONS[f.key]}
                </div>
                <h3 className="font-serif text-3xl font-normal text-[#172238]">{f.title}</h3>
                <p className="mt-4 leading-relaxed text-slate-600">{f.text}</p>
                <ul className="mt-5 space-y-2.5">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm text-slate-600">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF5F1] text-[#2D8982]">
                        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={i % 2 ? "md:order-1" : ""}>
                <Placeholder
                  src={img[f.key]}
                  label={`${f.title} image`}
                  className="aspect-[4/3] w-full rounded-3xl shadow-lg"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Compare plans ── */}
      <section className="bg-[#F8FAF9] py-20">
        <div className="mx-auto max-w-4xl px-5">
          <div className="text-center">
            <p className="section-label">Plans</p>
            <h2 className="mt-2 font-serif text-4xl font-normal text-[#172238]">Compare plans</h2>
          </div>
          <div className="mt-10 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-[#E2E9ED]">
            <table className="w-full text-sm">
              <thead className="border-b border-[#E2E9ED] bg-[#F8FAF9]">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Feature
                  </th>
                  {PLANS.map((p) => (
                    <th key={p} className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX.map(([group, rows]) => [
                  <tr key={group} className="bg-[#EAF5F1]">
                    <td colSpan={4} className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#2D8982]">
                      {group}
                    </td>
                  </tr>,
                  ...rows.map(([name, marks]) => (
                    <tr key={name} className="border-t border-[#E2E9ED]">
                      <td className="px-5 py-3.5 text-slate-700">{name}</td>
                      {marks.map((m, i) => (
                        <td key={i} className="px-5 py-3.5 text-center">
                          <Check on={m} />
                        </td>
                      ))}
                    </tr>
                  )),
                ])}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Pricing />
      <DemoForm />

      {/* ── Patient CTA ── */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="overflow-hidden rounded-3xl bg-[#102943] px-8 py-14 text-center md:px-16">
          <p className="section-label text-[#2D8982]">For patients</p>
          <h2 className="mt-3 font-serif text-4xl font-normal text-white">
            Looking for a doctor instead?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/60">
            Book an in-person or video appointment with doctors in our network.
          </p>
          <a
            href="#/find"
            className="mt-8 inline-block rounded-xl bg-[#2D8982] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#226b66]"
          >
            Find a Doctor
          </a>
        </div>
      </section>
    </main>
  );
}

export default Landing;
