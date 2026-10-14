import { api } from "../api";
import { useFetch } from "../hooks";
import { fmtDate } from "../lib";
import { Badge, Loading } from "../components/ui";

function Appointments({ query }) {
  const { data, loading, error, reload } = useFetch("/appointments");
  const cancel = async (id) => {
    if (!confirm("Cancel this appointment?")) return;
    try { await api.patch(`/appointments/${id}/cancel`); reload(); }
    catch (e) { alert(e.message); }
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-normal text-[#172238]">My Appointments</h1>
        <p className="mt-1 text-sm text-slate-500">Track and manage your upcoming appointments.</p>
      </div>

      {query.new && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white text-xs">✓</span>
          <p className="text-sm font-medium text-emerald-700">Your appointment is booked! See the details below.</p>
        </div>
      )}

      {loading || error ? (
        <Loading error={error} retry={reload} />
      ) : data.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#E2E9ED] py-24 text-center">
          <p className="text-slate-400">No appointments yet.</p>
          <a href="#/find" className="mt-2 inline-block text-sm font-semibold text-[#2D8982] hover:underline">
            Find a doctor →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((a) => (
            <article
              key={a._id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#E2E9ED] transition hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF5F1] text-sm font-bold text-[#2D8982]">
                  {a.doctor?.name?.[0]?.toUpperCase() || "D"}
                </div>
                <div>
                  <p className="font-semibold text-[#172238]">{a.doctor?.name || "Doctor"}</p>
                  <p className="text-sm text-slate-500">
                    {fmtDate(a.date)} · {a.time} · {a.type === "video" ? "Video consult" : "In-person"}
                  </p>
                  <p className="text-sm text-slate-400">Patient: {a.patientName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge>{a.status}</Badge>
                {a.status === "Confirmed" && (
                  <button
                    onClick={() => cancel(a._id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default Appointments;
