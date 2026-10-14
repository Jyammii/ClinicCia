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
    return doc.error?.includes("not found") || doc.error?.includes("Invalid") ? (
      <main className="py-24 text-center text-slate-400">
        Doctor not found.{" "}
        <a href="#/search" className="font-semibold text-[#2D8982]">Back to search</a>
      </main>
    ) : (
      <Loading error={doc.error} retry={doc.reload} />
    );
  }

  const d = doc.data;
  const spec = site.specialties.find((s) => s.id === d.specialty);
  const hosp = site.hospitals.find((h) => h.id === d.hospital);
  const busy = taken.data || [];
  const book = () => go(`/book/${d._id}?date=${date}&time=${encodeURIComponent(time)}&type=${type}`);

  return (
    <main className="bg-[#F8FAF9]">
      {/* Breadcrumb */}
      <div className="border-b border-[#E2E9ED] bg-white px-5 py-3">
        <div className="mx-auto max-w-7xl text-sm text-slate-500">
          <a href="#/find" className="hover:text-[#2D8982]">Find a Doctor</a>
          <span className="mx-2">›</span>
          <span className="text-[#172238] font-medium">{d.name}</span>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[1fr,360px]">
        {/* Doctor profile card */}
        <div className="space-y-5">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E2E9ED]">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="shrink-0 overflow-hidden rounded-2xl">
                <Placeholder src={d.image} label="Doctor photo" round className="h-32 w-32" />
              </div>
              <div className="flex-1">
                <h1 className="font-serif text-3xl font-normal text-[#172238]">{d.name}</h1>
                <p className="mt-1 text-base font-semibold text-[#2D8982]">{spec?.name}</p>
                <p className="mt-0.5 text-sm text-slate-500">{hosp?.name}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="rounded-xl bg-[#EAF5F1] px-4 py-2">
                    <p className="text-xs text-slate-500">Consultation fee</p>
                    <p className="text-lg font-bold text-[#172238]">{peso(d.fee)}</p>
                  </div>
                  {d.online && (
                    <span className="flex items-center gap-1.5 rounded-xl bg-[#EAF5F1] px-4 py-2 text-sm font-semibold text-[#2D8982]">
                      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M10 6.67l3.03-1.38A.67.67 0 0 1 14 5.9v4.2a.67.67 0 0 1-.97.61L10 9.33M2 5.33a1.33 1.33 0 0 1 1.33-1.33h5.34A1.33 1.33 0 0 1 10 5.33v5.34A1.33 1.33 0 0 1 8.67 12H3.33A1.33 1.33 0 0 1 2 10.67z" strokeLinecap="round"/>
                      </svg>
                      Video consult available
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E2E9ED]">
            <h2 className="mb-3 font-semibold text-[#172238]">About</h2>
            <p className="leading-relaxed text-slate-600">{d.bio || "No biography added yet."}</p>
          </div>

          {/* HMOs */}
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E2E9ED]">
            <h2 className="mb-3 font-semibold text-[#172238]">Accepted HMOs</h2>
            <div className="flex flex-wrap gap-2">
              {d.hmos.length ? (
                d.hmos.map((h) => (
                  <span key={h} className="rounded-xl bg-[#F8FAF9] px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-[#E2E9ED]">
                    {h}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400">None listed</span>
              )}
            </div>
          </div>
        </div>

        {/* Booking sidebar */}
        <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E2E9ED] lg:sticky lg:top-24">
          <h2 className="mb-5 text-lg font-bold text-[#172238]">Book an Appointment</h2>

          {/* In-person / Video toggle */}
          {d.online && (
            <div className="mb-5 flex gap-1 rounded-xl bg-slate-100 p-1 text-sm font-medium">
              {[["clinic", "In-person"], ["video", "Video consult"]].map(([v, n]) => (
                <button
                  key={v}
                  onClick={() => setType(v)}
                  className={`flex-1 rounded-lg py-2 transition ${type === v ? "bg-[#102943] text-white shadow-sm" : "text-slate-500"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}

          {/* Date picker */}
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Select date</p>
          <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
            {days.map((x) => (
              <button
                key={x}
                onClick={() => { setDate(x); setTime(""); }}
                className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-medium transition ${date === x ? "border-[#2D8982] bg-[#EAF5F1] text-[#2D8982]" : "border-[#E2E9ED] text-slate-600 hover:border-[#2D8982]"}`}
              >
                {fmtDate(x)}
              </button>
            ))}
          </div>

          {/* Time slots */}
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Select time</p>
          <div className="grid grid-cols-3 gap-2">
            {d.slots.map((s) => (
              <button
                key={s}
                disabled={busy.includes(s)}
                onClick={() => setTime(s)}
                className={`rounded-xl border py-2.5 text-xs font-medium transition ${
                  time === s
                    ? "border-[#2D8982] bg-[#2D8982] text-white"
                    : "border-[#E2E9ED] text-slate-700 hover:border-[#2D8982]"
                } disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300 disabled:line-through`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            disabled={!time || busy.includes(time)}
            onClick={book}
            className="mt-6 w-full rounded-xl bg-[#102943] py-3.5 font-semibold text-white transition hover:bg-[#1a4a6e] disabled:opacity-40"
          >
            Book Appointment
          </button>
        </aside>
      </div>
    </main>
  );
}

export default Doctor;
