import { useState } from "react";
import { api } from "../api";
import { go, useFetch } from "../hooks";
import { useAuth, useSite } from "../store";
import { fmtDate, peso, inputCls } from "../lib";
import { Loading, Notice } from "../components/ui";

function Book({ id, query }) {
  const { user } = useAuth();
  const { site } = useSite();
  const { date, time, type = "clinic" } = query;
  const doc = useFetch(`/doctors/${id}`);
  const [f, setF] = useState({ name: user.name, phone: "", reason: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (!date || !time) return <main className="py-24 text-center text-slate-400">Pick a doctor and time first. <a href="#/search" className="text-brand">Find a doctor</a></main>;
  if (doc.loading || doc.error) return <Loading error={doc.error} retry={doc.reload} />;
  const d = doc.data;
  const hosp = site.hospitals.find((h) => h.id === d.hospital);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim() || !f.phone.trim()) return setErr("Name and mobile number are required.");
    setBusy(true); setErr("");
    try {
      const appt = await api.post("/appointments", { doctorId: d._id, date, time, type, patientName: f.name.trim(), phone: f.phone.trim(), reason: f.reason });
      go(`/appointments?new=${appt._id}`);
    } catch (ex) { setErr(ex.message); setBusy(false); }
  };
  return (
    <main className="mx-auto grid max-w-4xl gap-8 px-5 py-10 md:grid-cols-[1fr,300px]">
      <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-xl font-bold">Patient Details</h1>
        <input className={inputCls} placeholder="Patient full name" value={f.name} onChange={set("name")} />
        <input className={inputCls} placeholder="Mobile number" inputMode="tel" value={f.phone} onChange={set("phone")} />
        <textarea className={inputCls} rows="3" placeholder="Reason for visit (optional)" value={f.reason} onChange={set("reason")} />
        <Notice>{err}</Notice>
        <button disabled={busy} className="w-full rounded-full bg-brand py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-50">{busy ? "Booking..." : "Confirm Appointment"}</button>
      </form>
      <aside className="h-fit rounded-2xl bg-brand-light p-6 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">Summary</p>
        <p className="mt-2 text-lg font-bold">{d.name}</p>
        <p className="text-slate-600">{hosp?.name}</p>
        <p className="mt-4">{fmtDate(date, { weekday: "long", month: "long", day: "numeric" })}</p>
        <p>{time} · {type === "video" ? "Video consult" : "In-person"}</p>
        <p className="mt-4 font-semibold">{peso(d.fee)}</p>
      </aside>
    </main>
  );
}
export default Book;
