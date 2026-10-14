import { useState } from "react";
import { api } from "../../api";
import { useFetch } from "../../hooks";
import { useSite } from "../../store";
import { btn, btnGhost, fmt, inputCls, peso } from "../../lib";
import { Badge, Field, Loading, Modal, Notice, Table } from "../../components/ui";

const METHODS = ["Cash", "GCash", "Card", "Bank Transfer"];
const CLAIMS = ["None", "Submitted", "Approved", "Rejected", "Paid"];
const blankLine = { description: "", qty: 1, unitPrice: "" };

function InvoiceForm({ invoice, presetPatient, onClose, onSaved }) {
  const patients = useFetch("/patients");
  const [f, setF] = useState(() => invoice
    ? { patient: invoice.patient._id, items: invoice.items.map((i) => ({ ...i })), discount: invoice.discount || 0, notes: invoice.notes || "" }
    : { patient: presetPatient || "", items: [{ ...blankLine }], discount: 0, notes: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const setLine = (i, patch) => setF({ ...f, items: f.items.map((l, j) => (j === i ? { ...l, ...patch } : l)) });
  const subtotal = f.items.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.unitPrice) || 0), 0);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const body = { patient: f.patient, discount: Number(f.discount) || 0, notes: f.notes, items: f.items.map((l) => ({ description: l.description, qty: Number(l.qty), unitPrice: Number(l.unitPrice) })) };
    try {
      const saved = invoice ? await api.put(`/invoices/${invoice._id}`, body) : await api.post("/invoices", body);
      onSaved(saved);
    } catch (ex) { setErr(ex.message); setBusy(false); }
  };
  return (
    <Modal title={invoice ? `Edit ${invoice.invoiceNo}` : "New invoice"} onClose={onClose} wide>
      <form onSubmit={save} className="space-y-4">
        <Field label="Patient *">
          <select required disabled={!!invoice} className={inputCls} value={f.patient} onChange={(e) => setF({ ...f, patient: e.target.value })}>
            <option value="">Select patient...</option>
            {(patients.data || []).map((p) => <option key={p._id} value={p._id}>{p.name} ({p.patientNo})</option>)}
          </select>
        </Field>
        <div>
          <div className="mb-2 flex items-center justify-between"><p className="text-sm font-semibold">Charges</p><button type="button" onClick={() => setF({ ...f, items: [...f.items, { ...blankLine }] })} className="text-sm font-medium text-brand">+ Add line</button></div>
          <div className="space-y-2">
            {f.items.map((l, i) => (
              <div key={i} className="grid grid-cols-[1fr,70px,110px,auto] gap-2">
                <input aria-label="Description" required className={inputCls} placeholder="Description (e.g. Consultation)" value={l.description} onChange={(e) => setLine(i, { description: e.target.value })} />
                <input aria-label="Quantity" required type="number" min="1" className={inputCls} value={l.qty} onChange={(e) => setLine(i, { qty: e.target.value })} />
                <input aria-label="Unit price" required type="number" min="0" step="0.01" className={inputCls} placeholder="Price" value={l.unitPrice} onChange={(e) => setLine(i, { unitPrice: e.target.value })} />
                <button type="button" aria-label="Remove line" disabled={f.items.length === 1} onClick={() => setF({ ...f, items: f.items.filter((_, j) => j !== i) })} className="text-xl text-red-400 disabled:opacity-30">×</button>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Discount (₱)"><input type="number" min="0" step="0.01" className={inputCls} value={f.discount} onChange={(e) => setF({ ...f, discount: e.target.value })} /></Field>
          <Field label="Notes"><input className={inputCls} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
        </div>
        <p className="text-right text-sm text-slate-500">Subtotal {peso(subtotal)} · <b className="text-slate-900">Total {peso(Math.max(0, subtotal - (Number(f.discount) || 0)))}</b></p>
        <Notice>{err}</Notice>
        <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className={btnGhost}>Cancel</button><button disabled={busy} className={btn}>{busy ? "Saving..." : "Save invoice"}</button></div>
      </form>
    </Modal>
  );
}

function InvoiceDetail({ id, onClose, onChanged, onEdit }) {
  const { site } = useSite();
  const { data: inv, loading, error, reload } = useFetch(`/invoices/${id}`);
  const [pay, setPay] = useState({ amount: "", method: "Cash", ref: "" });
  const [claim, setClaim] = useState(null);
  const [err, setErr] = useState("");
  const done = () => { reload(); onChanged(); setErr(""); };
  const run = async (fn) => { try { await fn(); done(); } catch (e) { setErr(e.message); } };

  if (loading || error) return <Modal title="Invoice" onClose={onClose}><Loading error={error} retry={reload} /></Modal>;
  const c = claim || { hmo: inv.claim?.hmo || inv.patient?.hmo || "", claimNo: inv.claim?.claimNo || "", amount: inv.claim?.amount || "", status: inv.claim?.status || "None" };
  const open = inv.status !== "Void" && inv.status !== "Paid";
  return (
    <Modal title={inv.invoiceNo} onClose={onClose} wide>
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold">{inv.patient?.name} <span className="font-normal text-slate-400">({inv.patient?.patientNo})</span></p>
            <p className="text-sm text-slate-500">{site.siteName} · issued {fmt(inv.createdAt)}</p>
          </div>
          <Badge>{inv.status}</Badge>
        </div>
        <Table heads={["Description", "Qty", "Unit price", "Amount"]}>
          {inv.items.map((l, i) => <tr key={i} className="border-t border-slate-100"><td className="px-4 py-2">{l.description}</td><td className="px-4 py-2">{l.qty}</td><td className="px-4 py-2">{peso(l.unitPrice)}</td><td className="px-4 py-2">{peso(l.qty * l.unitPrice)}</td></tr>)}
        </Table>
        <dl className="ml-auto grid w-full max-w-xs grid-cols-2 gap-y-1 text-sm">
          <dt className="text-slate-500">Subtotal</dt><dd className="text-right">{peso(inv.subtotal)}</dd>
          {inv.discount > 0 && <><dt className="text-slate-500">Discount</dt><dd className="text-right">-{peso(inv.discount)}</dd></>}
          <dt className="font-semibold">Total</dt><dd className="text-right font-semibold">{peso(inv.total)}</dd>
          <dt className="text-slate-500">Paid</dt><dd className="text-right">{peso(inv.paid)}</dd>
          <dt className="font-semibold">Balance</dt><dd className={`text-right font-semibold ${inv.balance ? "text-red-500" : "text-green-600"}`}>{peso(inv.balance)}</dd>
        </dl>

        {inv.payments.length > 0 && (
          <div><p className="mb-1 text-sm font-semibold">Payments</p>
            <ul className="divide-y divide-slate-100 text-sm">{inv.payments.map((p) => <li key={p._id} className="flex justify-between py-2"><span>{fmt(p.date)} · {p.method}{p.ref && ` · ${p.ref}`}</span><b>{peso(p.amount)}</b></li>)}</ul>
          </div>
        )}
        <Notice>{err}</Notice>

        <div className="no-print space-y-5">
          {open && (
            <form onSubmit={(e) => { e.preventDefault(); run(async () => { await api.post(`/invoices/${id}/payments`, { amount: Number(pay.amount || inv.balance), method: pay.method, ref: pay.ref }); setPay({ amount: "", method: "Cash", ref: "" }); }); }} className="rounded-xl bg-slate-50 p-4">
              <p className="mb-2 text-sm font-semibold">Record payment</p>
              <div className="grid gap-2 sm:grid-cols-[1fr,1fr,1fr,auto]">
                <input aria-label="Amount" type="number" min="0.01" step="0.01" className={inputCls} placeholder={`Amount (${peso(inv.balance)})`} value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
                <select aria-label="Method" className={inputCls} value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select>
                <input aria-label="Reference" className={inputCls} placeholder="Reference no." value={pay.ref} onChange={(e) => setPay({ ...pay, ref: e.target.value })} />
                <button className={btn}>Add</button>
              </div>
            </form>
          )}
          {inv.status !== "Void" && (
            <form onSubmit={(e) => { e.preventDefault(); run(async () => { await api.patch(`/invoices/${id}/claim`, { ...c, amount: Number(c.amount) || 0 }); setClaim(null); }); }} className="rounded-xl bg-brand-light/60 p-4">
              <p className="mb-2 text-sm font-semibold">HMO / insurance claim {inv.claim?.status === "Paid" && <span className="font-normal text-slate-500">(paid and locked)</span>}</p>
              <fieldset disabled={inv.claim?.status === "Paid"} className="grid gap-2 sm:grid-cols-5">
                <select aria-label="HMO" className={inputCls} value={c.hmo} onChange={(e) => setClaim({ ...c, hmo: e.target.value })}><option value="">HMO...</option>{site.hmos.map((h) => <option key={h}>{h}</option>)}</select>
                <input aria-label="Claim number" className={inputCls} placeholder="Claim no." value={c.claimNo} onChange={(e) => setClaim({ ...c, claimNo: e.target.value })} />
                <input aria-label="Claim amount" type="number" min="0" step="0.01" className={inputCls} placeholder="Amount" value={c.amount} onChange={(e) => setClaim({ ...c, amount: e.target.value })} />
                <select aria-label="Claim status" className={inputCls} value={c.status} onChange={(e) => setClaim({ ...c, status: e.target.value })}>{CLAIMS.map((s) => <option key={s}>{s}</option>)}</select>
                <button className={btn}>Save claim</button>
              </fieldset>
              <p className="mt-2 text-xs text-slate-500">Setting the status to Paid records the claim amount as an HMO payment.</p>
            </form>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <button onClick={() => window.print()} className={btnGhost}>Print</button>
            {inv.status !== "Void" && <button onClick={() => onEdit(inv)} className={btnGhost}>Edit items</button>}
            {inv.status === "Unpaid" && <button onClick={() => confirm("Void this invoice?") && run(() => api.post(`/invoices/${id}/void`))} className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50">Void</button>}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Billing({ query }) {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [applied, setApplied] = useState("");
  const { data, loading, error, reload } = useFetch(`/invoices?status=${status}&q=${encodeURIComponent(applied)}`);
  const [openId, setOpenId] = useState(query.open || null);
  const [form, setForm] = useState(query.patient ? { preset: query.patient } : null); // { invoice?, preset? }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form onSubmit={(e) => { e.preventDefault(); setApplied(q); }} className="flex overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-slate-200">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search invoice or patient..." className="w-48 px-4 py-2 text-sm outline-none sm:w-64" />
          <button className="bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark">Search</button>
        </form>
        <select aria-label="Filter by status" className={`${inputCls} !w-auto`} value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{["Unpaid", "Partial", "Paid", "Void"].map((s) => <option key={s}>{s}</option>)}</select>
        <button onClick={() => setForm({})} className={`${btn} ml-auto`}>+ New invoice</button>
      </div>
      {loading || error ? <Loading error={error} retry={reload} /> : (
        <Table heads={["Invoice", "Patient", "Date", "Total", "Paid", "Balance", "Status", ""]} empty="No invoices found.">
          {data.map((i) => (
            <tr key={i._id} className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium">{i.invoiceNo}</td>
              <td className="px-4 py-3">{i.patient?.name}</td>
              <td className="whitespace-nowrap px-4 py-3">{fmt(i.createdAt)}</td>
              <td className="px-4 py-3">{peso(i.total)}</td>
              <td className="px-4 py-3">{peso(i.paid)}</td>
              <td className={`px-4 py-3 ${i.balance ? "font-medium text-red-500" : ""}`}>{peso(i.balance)}</td>
              <td className="px-4 py-3"><Badge>{i.status}</Badge>{i.claim?.status && i.claim.status !== "None" && <span className="ml-1"><Badge>{i.claim.status}</Badge></span>}</td>
              <td className="px-4 py-3"><button onClick={() => setOpenId(i._id)} className="text-sm font-medium text-brand">Open</button></td>
            </tr>
          ))}
        </Table>
      )}
      {openId && !form && <InvoiceDetail id={openId} onClose={() => setOpenId(null)} onChanged={reload} onEdit={(invoice) => setForm({ invoice })} />}
      {form && <InvoiceForm invoice={form.invoice} presetPatient={form.preset} onClose={() => setForm(null)} onSaved={(saved) => { setForm(null); setOpenId(saved._id); reload(); }} />}
    </div>
  );
}
export default Billing;
