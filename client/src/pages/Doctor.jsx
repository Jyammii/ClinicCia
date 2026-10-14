import { useState } from "react";
import { go, useFetch } from "../hooks";
import { useSite } from "../store";
import { nextDays, fmtDate, peso } from "../lib";
import Placeholder from "../components/Placeholder";
import { Loading } from "../components/ui";

function Doctor({ id }) {
  const { site } = useSite();
  const days = nextDays();
  const [date, setDate] = useState(days[0]);
  const [time, setTime] = useState("");
  const [type, setType] = useState("clinic");
  const doc = useFetch(`/doctors/${id}`);
  const taken = useFetch(`/doctors/${id}/taken?date=${date}`);

  if (doc.loading || doc.error) {
    return doc.error?.includes("not found") || doc.error?.includes("Invalid")
      ? <main className="py-24 text-center text-slate-400">Doctor not found. <a href="#/search" className="text-brand">Back to search</a></main>
      : <Loading error={doc.error} retry={doc.reload} />;
  }
  const d = doc.data;
  const spec = site.specialties.find((s) => s.id === d.specialty);
  const hosp = site.hospitals.find((h) => h.id === d.hospital);
  const busy = taken.data || [];
  const book = () => go(`/book/${d._id}?date=${date}&time=${encodeURIComponent(time)}&type=${type}`);
  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1fr,380px]">
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-5 sm:flex-row">
          <Placeholder src={d.image} label="Doctor photo" round className="h-32 w-32 shrink-0" />
          <div>
            <h1 className="text-2xl font-bold">{d.name}</h1>
            <p className="font-medium text-brand">{spec?.name}</p>
            <p className="mt-1 text-slate-500">{hosp?.name}</p>
            <p className="mt-3 font-semibold">{peso(d.fee)} <span className="font-normal text-slate-400">consultation fee</span></p>
            {d.online && <span className="mt-2 inline-block rounded-full bg-brand-light px-3 py-0.5 text-xs font-medium text-brand">Video consult available</span>}
          </div>
        </div>
        <h2 className="mb-2 mt-8 text-lg font-semibold">About</h2>
        <p className="text-slate-600">{d.bio || "No biography added yet."}</p>
        <h2 className="mb-2 mt-6 text-lg font-semibold">Accepted HMOs</h2>
        <div className="flex flex-wrap gap-2">{d.hmos.length ? d.hmos.map((h) => <span key={h} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{h}</span>) : <span className="text-sm text-slate-400">None listed</span>}</div>
      </section>

      <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:sticky lg:top-24">
        <h2 className="mb-4 text-lg font-bold">Book an Appointment</h2>
        {d.online && (
          <div className="mb-4 flex gap-1 rounded-full bg-slate-100 p-1 text-sm font-medium">
            {[["clinic", "In-person"], ["video", "Video consult"]].map(([v, n]) => (
              <button key={v} onClick={() => setType(v)} className={`flex-1 rounded-full py-2 ${type === v ? "bg-brand text-white" : "text-slate-500"}`}>{n}</button>
            ))}
          </div>
        )}
        <p className="mb-2 text-sm font-medium text-slate-500">Select date</p>
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {days.map((x) => (
            <button key={x} onClick={() => { setDate(x); setTime(""); }} className={`shrink-0 rounded-xl border px-3 py-2 text-sm ${date === x ? "border-brand bg-brand-light font-semibold text-brand" : "border-slate-200 text-slate-600"}`}>{fmtDate(x)}</button>
          ))}
        </div>
        <p className="mb-2 text-sm font-medium text-slate-500">Select time</p>
        <div className="grid grid-cols-3 gap-2">
          {d.slots.map((s) => (
            <button key={s} disabled={busy.includes(s)} onClick={() => setTime(s)} className={`rounded-lg border py-2 text-xs ${time === s ? "border-brand bg-brand text-white" : "border-slate-200 text-slate-700 hover:border-brand"} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300 disabled:line-through`}>{s}</button>
          ))}
        </div>
        <button disabled={!time || busy.includes(time)} onClick={book} className="mt-5 w-full rounded-full bg-brand py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-40">Book Appointment</button>
      </aside>
    </main>
  );
}
export default Doctor;
