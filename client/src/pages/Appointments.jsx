import { api } from "../api";
import { useFetch } from "../hooks";
import { fmtDate } from "../lib";
import { Badge, Loading } from "../components/ui";

function Appointments({ query }) {
  const { data, loading, error, reload } = useFetch("/appointments");
  const cancel = async (id) => {
    if (!confirm("Cancel this appointment?")) return;
    try { await api.patch(`/appointments/${id}/cancel`); reload(); } catch (e) { alert(e.message); }
  };
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="mb-6 text-3xl font-bold">My Appointments</h1>
      {query.new && <p className="mb-5 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">Your appointment is booked! See the details below.</p>}
      {loading || error ? <Loading error={error} retry={reload} /> : data.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 py-20 text-center text-slate-400">No appointments yet. <a href="#/find" className="text-brand">Find a doctor</a></div>
      ) : (
        <div className="space-y-4">
          {data.map((a) => (
            <article key={a._id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div>
                <p className="font-semibold">{a.doctor?.name || "Doctor"}</p>
                <p className="text-sm text-slate-500">{fmtDate(a.date)} · {a.time} · {a.type === "video" ? "Video consult" : "In-person"}</p>
                <p className="text-sm text-slate-400">Patient: {a.patientName}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{a.status}</Badge>
                {a.status === "Confirmed" && <button onClick={() => cancel(a._id)} className="text-sm font-medium text-red-500 hover:underline">Cancel</button>}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
export default Appointments;
