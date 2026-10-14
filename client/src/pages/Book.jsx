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

  if (!date || !time) {
    return (
      <main className="mx-auto max-w-xl px-5 py-24 text-center">
        <div className="rounded-2xl border-2 border-dashed border-[#E2E9ED] bg-white p-12">
          <p className="text-slate-500">Pick a doctor and appointment time first.</p>
          <a
            href="#/find"
            className="mt-4 inline-block rounded-xl bg-[#2D8982] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#236b66]"
          >
            Find a Doctor →
          </a>
        </div>
      </main>
    );
  }

  if (doc.loading || doc.error) return <Loading error={doc.error} retry={doc.reload} />;
  const d = doc.data;
  const hosp = site.hospitals.find((h) => h.id === d.hospital);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim() || !f.phone.trim()) return setErr("Name and mobile number are required.");
    setBusy(true);
    setErr("");
    try {
      const appt = await api.post("/appointments", {
        doctorId: d._id,
        date,
        time,
        type,
        patientName: f.name.trim(),
        phone: f.phone.trim(),
        reason: f.reason,
      });
      go(`/appointments?new=${appt._id}`);
    } catch (ex) {
      setErr(ex.message);
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-5 py-12">
      <div className="mb-8">
        <a href={`#/doctors/${id}`} className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#2D8982] hover:underline">
          ← Back to Doctor Profile
        </a>
        <h1 className="mt-2 font-serif text-3xl font-normal text-[#172238]">
          Confirm Your Appointment
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review appointment details and enter patient information.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr,320px]">
        {/* Form */}
        <form onSubmit={submit} className="space-y-5 rounded-2xl bg-white p-7 shadow-sm ring-1 ring-[#E2E9ED]">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Patient Full Name *
            </label>
            <input
              className={inputCls}
              placeholder="e.g. Maria Santos"
              value={f.name}
              onChange={set("name")}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Mobile Number *
            </label>
            <input
              className={inputCls}
              placeholder="0917 123 4567"
              inputMode="tel"
              value={f.phone}
              onChange={set("phone")}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Reason for Visit (Optional)
            </label>
            <textarea
              className={inputCls}
              rows="3"
              placeholder="Briefly describe your symptoms or reason for consultation"
              value={f.reason}
              onChange={set("reason")}
            />
          </div>

          <Notice>{err}</Notice>

          <button
            disabled={busy}
            type="submit"
            className="w-full rounded-xl bg-[#2D8982] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#236b66] disabled:opacity-50"
          >
            {busy ? "Booking..." : "Confirm & Book Appointment"}
          </button>
        </form>

        {/* Summary sidebar */}
        <aside className="h-fit rounded-2xl bg-[#EAF5F1] p-6 text-sm ring-1 ring-[#2D8982]/20">
          <p className="text-xs font-bold uppercase tracking-wider text-[#2D8982]">
            Appointment Summary
          </p>

          <div className="mt-4 border-b border-[#2D8982]/20 pb-4">
            <p className="font-serif text-lg font-medium text-[#172238]">{d.name}</p>
            <p className="text-xs text-slate-600">{d.specialty} · {hosp?.name || "Clinic"}</p>
          </div>

          <div className="mt-4 space-y-3 text-slate-700">
            <div className="flex items-start gap-2.5">
              <span className="text-slate-400">📅</span>
              <div>
                <p className="font-medium text-[#172238]">
                  {fmtDate(date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
                <p className="text-xs text-slate-500">{time}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-slate-400">{type === "video" ? "📹" : "🏥"}</span>
              <span className="font-medium capitalize text-[#172238]">
                {type === "video" ? "Online Video Consult" : "In-Person Clinic Visit"}
              </span>
            </div>
          </div>

          <div className="mt-6 border-t border-[#2D8982]/20 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Consultation Fee
              </span>
              <span className="font-serif text-2xl font-bold text-[#102943]">
                {peso(d.fee)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Payment is processed at the clinic or upon video consultation check-in.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Book;
