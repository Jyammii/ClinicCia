import { useState } from "react";
import { api } from "../../api";
import { go, useFetch } from "../../hooks";
import { useAuth, can } from "../../store";
import { fmt, inputCls, btnGhost } from "../../lib";
import { Badge, Loading, Table } from "../../components/ui";

const STATUSES = ["Confirmed", "Checked-in", "Completed", "Cancelled", "No-show"];

const selCls =
  "rounded-xl border border-[#E2E9ED] bg-white px-3.5 py-2.5 text-sm text-[#172238] outline-none focus:border-[#2D8982]";

function AppointmentsAdmin() {
  const { user } = useAuth();
  const [f, setF] = useState({ date: "", status: "", doctor: "" });
  const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString();
  const { data, loading, error, reload } = useFetch(`/appointments?${qs}`);
  const docs = useFetch("/doctors/manage/all");

  const setStatus = async (id, status) => {
    try { await api.patch(`/appointments/${id}/status`, { status }); reload(); }
    catch (e) { alert(e.message); }
  };
  const invoice = async (id) => {
    try {
      const inv = await api.post(`/invoices/from-appointment/${id}`);
      go(`/dashboard/billing?open=${inv._id}`);
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="animate-fade-in">
      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <input
          type="date"
          aria-label="Filter by date"
          className={selCls}
          value={f.date}
          onChange={(e) => setF({ ...f, date: e.target.value })}
        />
        <select
          aria-label="Filter by status"
          className={selCls}
          value={f.status}
          onChange={(e) => setF({ ...f, status: e.target.value })}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        {user.role !== "doctor" && (
          <select
            aria-label="Filter by doctor"
            className={selCls}
            value={f.doctor}
            onChange={(e) => setF({ ...f, doctor: e.target.value })}
          >
            <option value="">All doctors</option>
            {(docs.data || []).map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        )}
        <button
          onClick={() => setF({ date: "", status: "", doctor: "" })}
          className="rounded-xl border border-[#E2E9ED] px-3.5 py-2.5 text-sm font-medium text-[#2D8982] transition hover:bg-[#EAF5F1]"
        >
          Clear
        </button>
      </div>

      {loading || error ? (
        <Loading error={error} retry={reload} />
      ) : (
        <Table heads={["Patient", "Doctor", "When", "Type", "Status", "Actions"]} empty="No appointments match these filters.">
          {data.map((a) => (
            <tr key={a._id} className="align-top">
              <td className="px-4 py-3">
                <p className="font-semibold text-[#172238]">{a.patientName}</p>
                <p className="text-xs text-slate-400">{a.phone}{a.reason ? ` · ${a.reason}` : ""}</p>
              </td>
              <td className="px-4 py-3 text-sm">{a.doctor?.name}</td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">
                <p>{fmt(a.date)}</p>
                <p className="text-xs text-slate-400">{a.time}</p>
              </td>
              <td className="px-4 py-3 text-sm">{a.type === "video" ? "Video" : "In-person"}</td>
              <td className="px-4 py-3">
                <Badge>{a.status}</Badge>
                <select
                  aria-label="Change status"
                  value={a.status}
                  onChange={(e) => setStatus(a._id, e.target.value)}
                  className="mt-2 block rounded-lg border border-[#E2E9ED] px-2 py-1.5 text-xs text-[#172238] outline-none focus:border-[#2D8982]"
                >
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col items-start gap-1.5">
                  {can(user, "emr") && a.patient && (
                    <a
                      href={`#/dashboard/patients/${a.patient._id}?appt=${a._id}`}
                      className="rounded-lg bg-[#EAF5F1] px-3 py-1.5 text-xs font-semibold text-[#2D8982] hover:bg-[#d4eeeb]"
                    >
                      Patient record
                    </a>
                  )}
                  {can(user, "billing") && a.patient && (
                    <button
                      onClick={() => invoice(a._id)}
                      className="rounded-lg border border-[#E2E9ED] px-3 py-1.5 text-xs font-medium text-[#172238] transition hover:border-[#2D8982] hover:text-[#2D8982]"
                    >
                      {a.invoice ? "Open invoice" : "Create invoice"}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}

export default AppointmentsAdmin;
