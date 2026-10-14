import { useEffect, useState } from "react";
import { api } from "../api";
import { useSite } from "../store";
import { FEATURES, PLANS, MATRIX, PRICE } from "../data/constants";
import { inputCls, peso } from "../lib";
import Placeholder from "../components/Placeholder";
import { Notice } from "../components/ui";

const Check = ({ on }) => (on ? <span className="font-bold text-brand" aria-label="Included">✓</span> : <span className="text-slate-300" aria-label="Not included">–</span>);

function Pricing() {
  const [annual, setAnnual] = useState(false);
  const perks = ["Unlimited patient records and appointments", "Online booking page with your own doctors and photos", "Billing, HMO claims, pharmacy and payroll modules", "Guided setup and staff training", "Role-based access for every team member"];
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-3xl px-5 text-center">
        <h2 className="text-3xl font-bold">Start free, pay when it works for you</h2>
        <p className="mt-2 text-slate-500">Scalable EMR, queueing and HMO billing tailored for Philippine clinics.</p>
        <div className="mx-auto mt-6 flex w-fit gap-1 rounded-full bg-slate-200 p-1 text-sm font-medium">
          {[[false, "Monthly"], [true, "Annual · save 1 month"]].map(([v, n]) => (
            <button key={n} onClick={() => setAnnual(v)} className={`rounded-full px-5 py-2 ${annual === v ? "bg-brand text-white" : "text-slate-600"}`}>{n}</button>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-md rounded-3xl bg-white p-8 text-left shadow-lg ring-1 ring-slate-200">
          <p className="font-semibold text-brand">Clinic Management System</p>
          <p className="mt-2 text-4xl font-bold">{peso(annual ? PRICE.annual : PRICE.monthly)} <span className="text-base font-normal text-slate-400">/ doctor / {annual ? "year" : "month"}</span></p>
          <p className="mt-1 text-sm text-slate-400">Sample pricing for this project. {annual ? "Billed yearly per doctor." : "Billed monthly per doctor."}</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-600">
            {perks.map((p) => <li key={p} className="flex gap-3"><span className="text-brand">✓</span>{p}</li>)}
          </ul>
          <a href="#/login" className="mt-8 block rounded-full bg-brand py-3 text-center font-semibold text-white hover:bg-brand-dark">Get Started</a>
        </div>
      </div>
    </section>
  );
}

function DemoForm() {
  const [f, setF] = useState({ name: "", clinic: "", email: "", phone: "", message: "" });
  const [state, setState] = useState({ busy: false, done: false, err: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, done: false, err: "" });
    try { await api.post("/inquiries", f); setState({ busy: false, done: true, err: "" }); setF({ name: "", clinic: "", email: "", phone: "", message: "" }); }
    catch (ex) { setState({ busy: false, done: false, err: ex.message }); }
  };
  return (
    <section id="demo" className="bg-brand py-16 text-white">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-5 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold">Ready to move your clinic to ClinicNow?</h2>
          <p className="mt-3 text-white/80">Request a free consultation and see how your clinic can switch to a smarter, connected system without losing your existing records.</p>
        </div>
        <form onSubmit={submit} className="space-y-3 rounded-2xl bg-white p-6 text-slate-900 shadow-xl">
          {state.done && <Notice tone="green">Thank you! Your submission has been received. We will get back to you soon.</Notice>}
          <input className={inputCls} placeholder="Full name *" value={f.name} onChange={set("name")} required />
          <input className={inputCls} placeholder="Clinic or hospital name" value={f.clinic} onChange={set("clinic")} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={inputCls} type="email" placeholder="Email *" value={f.email} onChange={set("email")} required />
            <input className={inputCls} placeholder="Phone" value={f.phone} onChange={set("phone")} />
          </div>
          <textarea className={inputCls} rows="3" placeholder="How can we help?" value={f.message} onChange={set("message")} />
          <Notice>{state.err}</Notice>
          <button disabled={state.busy} className="w-full rounded-full bg-brand py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-50">{state.busy ? "Sending..." : "Request a Demo"}</button>
        </form>
      </div>
    </section>
  );
}

function Landing({ query }) {
  const { site } = useSite();
  useEffect(() => { if (query.section) document.getElementById(query.section)?.scrollIntoView({ behavior: "smooth" }); }, [query.section]);
  const img = site.landing || {};
  return (
    <main>
      <section className="bg-brand-light">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-brand">{site.siteName} for Clinics</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">Everything you need to run and grow your clinic in one system</h1>
            <p className="mt-4 text-lg text-slate-600">From booking to billing and clinic operations, all-in-one platform.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#/login" className="rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white hover:bg-brand-dark">Get Started</a>
              <a href="#/?section=demo" className="rounded-full border border-brand px-7 py-3 text-sm font-semibold text-brand hover:bg-white">Talk to our team</a>
            </div>
            <p className="mt-6 text-sm text-slate-500">Built for clinics with 2 or more doctors.</p>
          </div>
          <Placeholder src={img.hero} label="Landing hero image" className="aspect-[4/3] w-full rounded-3xl shadow-lg" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-brand">One system for your whole clinic</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">From booking to billing and clinic operations, all-in-one platform</h2>
        </div>
        <div className="mt-14 space-y-16">
          {FEATURES.map((f, i) => (
            <div key={f.key} className="grid items-center gap-8 md:grid-cols-2">
              <div className={i % 2 ? "md:order-2" : ""}>
                <h3 className="text-2xl font-bold">{f.title}</h3>
                <p className="mt-3 text-slate-600">{f.text}</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">{f.points.map((p) => <li key={p} className="flex gap-3"><span className="text-brand">✓</span>{p}</li>)}</ul>
              </div>
              <Placeholder src={img[f.key]} label={`${f.title} image`} className="aspect-[4/3] w-full rounded-3xl shadow-md" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-16">
        <h2 className="mb-6 text-center text-3xl font-bold">Compare plans</h2>
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left font-semibold">Feature</th>{PLANS.map((p) => <th key={p} className="px-4 py-3 text-center font-semibold">{p}</th>)}</tr></thead>
            <tbody>
              {MATRIX.map(([group, rows]) => [
                <tr key={group} className="bg-brand-light"><td colSpan={4} className="px-4 py-2 font-semibold text-brand">{group}</td></tr>,
                ...rows.map(([name, marks]) => (
                  <tr key={name} className="border-t border-slate-100"><td className="px-4 py-3 text-slate-700">{name}</td>{marks.map((m, i) => <td key={i} className="px-4 py-3 text-center"><Check on={m} /></td>)}</tr>
                )),
              ])}
            </tbody>
          </table>
        </div>
      </section>

      <Pricing />
      <DemoForm />

      <section className="mx-auto max-w-4xl px-5 py-14 text-center">
        <h2 className="text-2xl font-bold">Looking for a doctor instead?</h2>
        <p className="mt-2 text-slate-500">Book an in-person or video appointment with doctors in our network.</p>
        <a href="#/find" className="mt-5 inline-block rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white hover:bg-brand-dark">Find a Doctor</a>
      </section>
    </main>
  );
}
export default Landing;
