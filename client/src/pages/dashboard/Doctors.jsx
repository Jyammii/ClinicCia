import { useState } from "react";
import { api } from "../../api";
import { useFetch } from "../../hooks";
import { useSite } from "../../store";
import { DEFAULT_SLOTS } from "../../data/constants";
import { btn, btnGhost, inputCls, peso } from "../../lib";
import { Badge, Field, Loading, Notice } from "../../components/ui";
import ImageUpload from "../../components/ImageUpload";
import Placeholder from "../../components/Placeholder";

const empty = { name: "", specialty: "", hospital: "", fee: "", bio: "", online: false, hmos: [], image: "", slots: DEFAULT_SLOTS.join(", "), active: true, user: "" };

function Doctors() {
  const { site } = useSite();
  const { data, loading, error, reload } = useFetch("/doctors/manage/all");
  const users = useFetch("/users?q=");
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.specialty || !form.hospital || form.fee === "") return setErr("Name, specialty, hospital and fee are required.");
    const body = { ...form, fee: Number(form.fee), slots: String(form.slots).split(",").map((s) => s.trim()).filter(Boolean), user: form.user || "" };
    setBusy(true);
    try {
      if (editId) await api.put(`/doctors/${editId}`, body); else await api.post("/doctors", body);
      setForm(empty); setEditId(null); setErr(""); reload();
    } catch (ex) { setErr(ex.message); } finally { setBusy(false); }
  };
  const edit = (d) => { setForm({ ...empty, ...d, slots: d.slots.join(", "), user: d.user || "" }); setEditId(d._id); setErr(""); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const del = async (d) => {
    if (!confirm(`Delete ${d.name}?`)) return;
    try { await api.del(`/doctors/${d._id}`); reload(); } catch (ex) { alert(ex.message); }
  };
  const doctorUsers = (users.data || []).filter((u) => u.role === "doctor");

  return (
    <div className="grid items-start gap-8 xl:grid-cols-[360px,1fr]">
      <form onSubmit={save} className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-bold">{editId ? "Edit Doctor" : "New Doctor"}</h2>
        <ImageUpload image={form.image} onChange={(image) => setForm({ ...form, image })} onError={setErr} className="mx-auto h-32 w-32 rounded-full" />
        <input className={inputCls} placeholder="Doctor name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <select className={inputCls} value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })}><option value="">Specialty</option>{site.specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <select className={inputCls} value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })}><option value="">Hospital / Clinic</option>{site.hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}</select>
        <input className={inputCls} type="number" min="0" placeholder="Consultation fee (₱)" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} />
        <textarea className={inputCls} rows="3" placeholder="Short bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        <Field label="Time slots (comma separated)"><input className={inputCls} value={form.slots} onChange={(e) => setForm({ ...form, slots: e.target.value })} /></Field>
        <Field label="Linked login account (so the doctor sees their own schedule)">
          <select className={inputCls} value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })}><option value="">None</option>{doctorUsers.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}</select>
        </Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-brand" checked={form.online} onChange={(e) => setForm({ ...form, online: e.target.checked })} /> Offers video consult</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-brand" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Visible for booking</label>
        <div className="flex flex-wrap gap-2">
          {site.hmos.map((h) => (
            <label key={h} className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${form.hmos.includes(h) ? "border-brand bg-brand-light text-brand" : "border-slate-200 text-slate-500"}`}>
              <input type="checkbox" hidden checked={form.hmos.includes(h)} onChange={() => setForm({ ...form, hmos: form.hmos.includes(h) ? form.hmos.filter((x) => x !== h) : [...form.hmos, h] })} />{h}
            </label>
          ))}
        </div>
        <Notice>{err}</Notice>
        <div className="flex gap-2">
          <button disabled={busy} className={`${btn} flex-1 !py-2.5`}>{editId ? "Update" : "Add Doctor"}</button>
          {editId && <button type="button" onClick={() => { setForm(empty); setEditId(null); }} className={`${btnGhost} flex-1`}>Cancel</button>}
        </div>
      </form>
      <div className="space-y-3">
        {loading || error ? <Loading error={error} retry={reload} /> : data.map((d) => (
          <div key={d._id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex min-w-0 items-center gap-3">
              <Placeholder src={d.image} label="Doctor photo" round className="h-12 w-12 shrink-0" />
              <div className="min-w-0"><p className="truncate font-semibold">{d.name} {!d.active && <Badge tone="slate">Hidden</Badge>}</p><p className="truncate text-sm text-slate-500">{site.specialties.find((s) => s.id === d.specialty)?.name} · {peso(d.fee)}</p></div>
            </div>
            <div className="flex gap-3 text-sm font-medium"><button onClick={() => edit(d)} className="text-brand">Edit</button><button onClick={() => del(d)} className="text-red-500">Delete</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Doctors;
