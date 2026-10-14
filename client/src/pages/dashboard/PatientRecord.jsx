import { useState } from "react";
import { api } from "../../api";
import { useFetch } from "../../hooks";
import { useAuth, can } from "../../store";
import { age, btn, btnGhost, fmt, inputCls, todayISO } from "../../lib";
import { Badge, Field, Loading, Modal, Notice } from "../../components/ui";

const VITALS = [["bp", "BP (mmHg)", "text"], ["hr", "Pulse (bpm)", "number"], ["temp", "Temp (°C)", "number"], ["spo2", "SpO₂ (%)", "number"], ["weight", "Weight (kg)", "number"], ["height", "Height (cm)", "number"]];
const emptyRx = { item: "", medicine: "", dosage: "", qty: 1 };

function EncounterForm({ patientId, record, apptId, onClose, onSaved }) {
  const doctors = useFetch("/doctors/manage/all");
  const meds = useFetch("/inventory/medicines");
  const [f, setF] = useState(() => record ? {
    date: record.date, doctor: record.doctor?._id || "", complaint: record.complaint || "", vitals: { ...record.vitals },
    diagnosis: record.diagnosis || "", treatment: record.treatment || "", notes: record.notes || "",
    labOrders: (record.labOrders || []).join(", "), followUp: record.followUp || "",
    prescriptions: record.prescriptions.map((p) => ({ item: p.item || "", medicine: p.medicine, dosage: p.dosage || "", qty: p.qty })),
  } : { date: todayISO(), doctor: "", complaint: "", vitals: {}, diagnosis: "", treatment: "", notes: "", labOrders: "", followUp: "", prescriptions: [] });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const setRx = (i, patch) => setF({ ...f, prescriptions: f.prescriptions.map((p, j) => (j === i ? { ...p, ...patch } : p)) });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const vitals = Object.fromEntries(VITALS.map(([k, , t]) => [k, f.vitals[k] === "" || f.vitals[k] == null ? undefined : t === "number" ? Number(f.vitals[k]) : f.vitals[k]]).filter(([, v]) => v !== undefined));
    const body = {
      patient: patientId, doctor: f.doctor || undefined, date: f.date, complaint: f.complaint, vitals, diagnosis: f.diagnosis, treatment: f.treatment, notes: f.notes,
      labOrders: f.labOrders.split(",").map((s) => s.trim()).filter(Boolean), followUp: f.followUp,
      prescriptions: f.prescriptions.filter((p) => p.medicine.trim()).map((p) => ({ item: p.item || undefined, medicine: p.medicine.trim(), dosage: p.dosage, qty: Number(p.qty) || 1 })),
    };
    if (!record && apptId) body.appointment = apptId;
    try {
      if (record) await api.put(`/records/${record._id}`, body); else await api.post("/records", body);
      if (!record && apptId) await api.patch(`/appointments/${apptId}/status`, { status: "Completed" }).catch(() => {});
      onSaved();
    } catch (ex) { setErr(ex.message); setBusy(false); }
  };

  return (
    <Modal title={record ? "Edit encounter" : "New encounter"} onClose={onClose} wide>
      <form onSubmit={save} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Visit date *"><input type="date" required className={inputCls} value={f.date} onChange={set("date")} /></Field>
          <Field label="Attending doctor"><select className={inputCls} value={f.doctor} onChange={set("doctor")}><option value="">Select...</option>{(doctors.data || []).map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}</select></Field>
          <Field label="Chief complaint" className="sm:col-span-2"><textarea rows="2" className={inputCls} value={f.complaint} onChange={set("complaint")} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {VITALS.map(([k, label, type]) => <Field key={k} label={label}><input type={type} step="any" className={inputCls} value={f.vitals[k] ?? ""} onChange={(e) => setF({ ...f, vitals: { ...f.vitals, [k]: e.target.value } })} /></Field>)}
        </div>
        <Field label="Diagnosis"><textarea rows="2" className={inputCls} value={f.diagnosis} onChange={set("diagnosis")} /></Field>
        <Field label="Treatment plan"><textarea rows="2" className={inputCls} value={f.treatment} onChange={set("treatment")} /></Field>
        <Field label="Doctor's notes"><textarea rows="3" className={inputCls} value={f.notes} onChange={set("notes")} /></Field>

        <div>
          <div className="mb-2 flex items-center justify-between"><p className="text-sm font-semibold">Prescriptions</p><button type="button" onClick={() => setF({ ...f, prescriptions: [...f.prescriptions, { ...emptyRx }] })} className="text-sm font-medium text-brand">+ Add medicine</button></div>
          <div className="space-y-2">
            {f.prescriptions.map((p, i) => (
              <div key={i} className="grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1.4fr,1.4fr,80px,auto]">
                <select aria-label="Medicine" className={inputCls} value={p.item || "custom"} onChange={(e) => {
                  const m = (meds.data || []).find((x) => x._id === e.target.value);
                  setRx(i, m ? { item: m._id, medicine: m.name } : { item: "", medicine: "" });
                }}>
                  <option value="custom">Other (type name)</option>
                  {(meds.data || []).map((m) => <option key={m._id} value={m._id}>{m.name} ({m.qty} {m.unit} in stock)</option>)}
                </select>
                {p.item ? <input aria-label="Dosage" className={inputCls} placeholder="Dosage, e.g. 1 tab every 8 hours" value={p.dosage} onChange={(e) => setRx(i, { dosage: e.target.value })} />
                  : <input aria-label="Medicine name" className={inputCls} placeholder="Medicine name" value={p.medicine} onChange={(e) => setRx(i, { medicine: e.target.value })} />}
                <input aria-label="Quantity" type="number" min="1" className={inputCls} value={p.qty} onChange={(e) => setRx(i, { qty: e.target.value })} />
                <button type="button" aria-label="Remove medicine" onClick={() => setF({ ...f, prescriptions: f.prescriptions.filter((_, j) => j !== i) })} className="text-xl text-red-400">×</button>
                {!p.item && <input aria-label="Dosage" className={`${inputCls} sm:col-span-4`} placeholder="Dosage, e.g. 1 tab every 8 hours" value={p.dosage} onChange={(e) => setRx(i, { dosage: e.target.value })} />}
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Lab / imaging orders (comma separated)"><input className={inputCls} value={f.labOrders} onChange={set("labOrders")} placeholder="CBC, Chest X-ray" /></Field>
          <Field label="Follow-up date"><input type="date" className={inputCls} value={f.followUp} onChange={set("followUp")} /></Field>
        </div>
        <Notice>{err}</Notice>
        <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className={btnGhost}>Cancel</button><button disabled={busy} className={btn}>{busy ? "Saving..." : "Save encounter"}</button></div>
      </form>
    </Modal>
  );
}

function PatientRecord({ id, query }) {
  const { user } = useAuth();
  const patient = useFetch(`/patients/${id}`);
  const recs = useFetch(can(user, "emr") ? `/records?patient=${id}` : null);
  const [editing, setEditing] = useState(null); // null | "new" | record
  const [msg, setMsg] = useState("");

  if (patient.loading || patient.error) return <Loading error={patient.error} retry={patient.reload} />;
  const p = patient.data;
  const saved = () => { setEditing(null); recs.reload(); };
  const dispense = async (r) => {
    if (!confirm("Dispense these medicines and deduct them from stock?")) return;
    try { await api.post(`/records/${r._id}/dispense`); setMsg("Medicines dispensed and stock updated."); recs.reload(); } catch (e) { setMsg(e.message); }
  };
  const del = async (r) => {
    if (!confirm("Delete this encounter?")) return;
    try { await api.del(`/records/${r._id}`); recs.reload(); } catch (e) { setMsg(e.message); }
  };

  return (
    <div className="space-y-6">
      <a href="#/dashboard/patients" className="text-sm font-medium text-brand">← All patients</a>
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400">{p.patientNo}</p>
            <h2 className="text-2xl font-bold">{p.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{[p.birthdate ? `${age(p.birthdate)} yrs (${fmt(p.birthdate)})` : "", p.sex, p.bloodType && `Blood type ${p.bloodType}`].filter(Boolean).join(" · ")}</p>
            <p className="mt-1 text-sm text-slate-500">{[p.phone, p.email, p.address].filter(Boolean).join(" · ")}</p>
            {p.hmo && <p className="mt-1 text-sm text-slate-500">HMO: {p.hmo} {p.hmoNo && `(${p.hmoNo})`}</p>}
            {p.emergencyName && <p className="mt-1 text-sm text-slate-500">Emergency: {p.emergencyName} {p.emergencyPhone}</p>}
            <div className="mt-3 flex flex-wrap gap-2">{p.allergies?.length ? p.allergies.map((a) => <span key={a} className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">Allergy: {a}</span>) : <span className="text-xs text-slate-400">No known allergies recorded</span>}</div>
          </div>
          <div className="flex gap-2">
            {can(user, "billing") && <a href={`#/dashboard/billing?patient=${p._id}`} className={btnGhost}>Create invoice</a>}
            {can(user, "emr") && <button onClick={() => setEditing("new")} className={btn}>+ New encounter</button>}
          </div>
        </div>
      </section>

      <Notice tone={msg.startsWith("Medicines") ? "green" : "red"}>{msg}</Notice>

      {can(user, "emr") && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Medical history</h2>
          {recs.loading || recs.error ? <Loading error={recs.error} retry={recs.reload} /> : recs.data.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 py-14 text-center text-slate-400">No encounters recorded yet.</div>
          ) : (
            <div className="space-y-4">
              {recs.data.map((r) => (
                <article key={r._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{fmt(r.date)} <span className="font-normal text-slate-400">· {r.doctor?.name || "No doctor assigned"}</span></p>
                    <div className="flex items-center gap-3 text-sm font-medium">
                      {r.prescriptions.length > 0 && (r.dispensed ? <Badge tone="green">Dispensed</Badge> : can(user, "inventory") && r.prescriptions.some((x) => x.item) && <button onClick={() => dispense(r)} className="text-brand">Dispense</button>)}
                      <button onClick={() => setEditing(r)} className="text-brand">Edit</button>
                      <button onClick={() => del(r)} className="text-red-500">Delete</button>
                    </div>
                  </div>
                  {r.complaint && <p className="mt-2 text-sm"><b>Complaint:</b> {r.complaint}</p>}
                  {r.vitals && Object.values(r.vitals).some((v) => v) && (
                    <p className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                      {VITALS.filter(([k]) => r.vitals[k]).map(([k, label]) => <span key={k} className="rounded-full bg-slate-100 px-3 py-1">{label.split(" (")[0]}: {r.vitals[k]}</span>)}
                    </p>
                  )}
                  {r.diagnosis && <p className="mt-2 text-sm"><b>Diagnosis:</b> {r.diagnosis}</p>}
                  {r.treatment && <p className="mt-1 text-sm"><b>Treatment:</b> {r.treatment}</p>}
                  {r.notes && <p className="mt-1 text-sm text-slate-600"><b>Notes:</b> {r.notes}</p>}
                  {r.prescriptions.length > 0 && <ul className="mt-2 list-inside list-disc text-sm text-slate-600">{r.prescriptions.map((x) => <li key={x._id}>{x.medicine} × {x.qty}{x.dosage && ` · ${x.dosage}`}</li>)}</ul>}
                  {r.labOrders?.length > 0 && <p className="mt-1 text-sm"><b>Lab orders:</b> {r.labOrders.join(", ")}</p>}
                  {r.followUp && <p className="mt-1 text-sm text-slate-500">Follow-up: {fmt(r.followUp)}</p>}
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {editing && <EncounterForm patientId={id} record={editing === "new" ? null : editing} apptId={query.appt} onClose={() => setEditing(null)} onSaved={saved} />}
    </div>
  );
}
export default PatientRecord;
