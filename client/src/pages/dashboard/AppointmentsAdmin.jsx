import { useState } from "react";
import { api } from "../../api";
import { go, useFetch } from "../../hooks";
import { useAuth, can } from "../../store";
import { fmt, inputCls, btnGhost } from "../../lib";
import { Badge, Loading, Table } from "../../components/ui";

const STATUSES = ["Confirmed", "Checked-in", "Completed", "Cancelled", "No-show"];

function AppointmentsAdmin() {
  const { user } = useAuth();
  const [f, setF] = useState({ date: "", status: "", doctor: "" });
  const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString();
  const { data, loading, error, reload } = useFetch(`/appointments?${qs}`);
  const docs = useFetch("/doctors/manage/all");

  const setStatus = async (id, status) => {
    try { await api.patch(`/appointments/${id}/status`, { status }); reload(); } catch (e) { alert(e.message); }
  };
  const invoice = async (id) => {
    try { const inv = await api.post(`/invoices/from-appointment/${id}`); go(`/dashboard/billing?open=${inv._id}`); } catch (e) { alert(e.message); }
  };
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input type="date" aria-label="Filter by date" className={`${inputCls} !w-auto`} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        <select aria-label="Filter by status" className={`${inputCls} !w-auto`} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        {user.role !== "doctor" && <select aria-label="Filter by doctor" className={`${inputCls} !w-auto`} value={f.doctor} onChange={(e) => setF({ ...f, doctor: e.target.value })}><option value="">All doctors</option>{(docs.data || []).map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}</select>}
        <button onClick={() => setF({ date: "", status: "", doctor: "" })} className="text-sm font-medium text-brand">Clear</button>
      </div>
      {loading || error ? <Loading error={error} retry={reload} /> : (
        <Table heads={["Patient", "Doctor", "When", "Type", "Status", "Actions"]} empty="No appointments match these filters.">
          {data.map((a) => (
            <tr key={a._id} className="border-t border-slate-100 align-top">
              <td className="px-4 py-3">{a.patientName}<br /><span className="text-xs text-slate-400">{a.phone}{a.reason ? ` · ${a.reason}` : ""}</span></td>
              <td className="px-4 py-3">{a.doctor?.name}</td>
              <td className="whitespace-nowrap px-4 py-3">{fmt(a.date)}<br /><span className="text-xs text-slate-400">{a.time}</span></td>
              <td className="px-4 py-3">{a.type === "video" ? "Video" : "In-person"}</td>
              <td className="px-4 py-3">
                <Badge>{a.status}</Badge>
                <select aria-label="Change status" value={a.status} onChange={(e) => setStatus(a._id, e.target.value)} className="mt-2 block rounded-lg border border-slate-300 px-2 py-1 text-xs">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col items-start gap-1 text-sm font-medium">
                  {can(user, "emr") && a.patient && <a href={`#/dashboard/patients/${a.patient._id}?appt=${a._id}`} className="text-brand">Patient record</a>}
                  {can(user, "billing") && a.patient && <button onClick={() => invoice(a._id)} className={`${btnGhost} !px-3 !py-1 text-xs`}>{a.invoice ? "Open invoice" : "Create invoice"}</button>}
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
