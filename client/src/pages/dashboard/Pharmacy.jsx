import { useState } from "react";
import { api } from "../../api";
import { useFetch } from "../../hooks";
import { btn, btnGhost, fmt, inputCls } from "../../lib";
import { Badge, Field, Loading, Modal, Notice, Table, Tabs } from "../../components/ui";
import Crud from "../../components/Crud";

const CATS = ["Medicine", "Supply", "Equipment"];
const soon = () => { const d = new Date(); d.setDate(d.getDate() + 60); return d.toLocaleDateString("en-CA"); };

function StockButton({ item, reload }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ type: "In", qty: "", reason: "" });
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try { await api.post(`/inventory/${item._id}/adjust`, { ...f, qty: Number(f.qty) }); setOpen(false); setF({ type: "In", qty: "", reason: "" }); reload(); }
    catch (ex) { setErr(ex.message); }
  };
  return (
    <>
      <button onClick={() => { setErr(""); setOpen(true); }} className="text-brand">Stock</button>
      {open && (
        <Modal title={`Adjust stock: ${item.name}`} onClose={() => setOpen(false)}>
          <form onSubmit={submit} className="space-y-3">
            <p className="text-sm text-slate-500">Current stock: <b>{item.qty} {item.unit}</b></p>
            <Field label="Action"><select className={inputCls} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option value="In">Stock in (received)</option><option value="Out">Stock out (used / wasted)</option><option value="Adjust">Set exact count (stock take)</option></select></Field>
            <Field label={f.type === "Adjust" ? "New count" : "Quantity"}><input required type="number" min="0" step="any" className={inputCls} value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} /></Field>
            <Field label="Reason / reference"><input className={inputCls} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} placeholder="e.g. Delivery from supplier" /></Field>
            <Notice>{err}</Notice>
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className={btnGhost}>Cancel</button><button className={btn}>Save</button></div>
          </form>
        </Modal>
      )}
    </>
  );
}

function Movements() {
  const { data, loading, error, reload } = useFetch("/inventory/movements");
  if (loading || error) return <Loading error={error} retry={reload} />;
  return (
    <Table heads={["Date", "Item", "Type", "Qty", "Balance", "Reason", "By"]} empty="No stock movements yet.">
      {data.map((m) => (
        <tr key={m._id} className="border-t border-slate-100">
          <td className="whitespace-nowrap px-4 py-3">{fmt(m.createdAt)}</td><td className="px-4 py-3">{m.item?.name}</td>
          <td className="px-4 py-3"><Badge tone={m.type === "In" ? "green" : m.type === "Adjust" ? "amber" : "blue"}>{m.type}</Badge></td>
          <td className="px-4 py-3">{m.qty}</td><td className="px-4 py-3">{m.balance}</td><td className="px-4 py-3">{m.reason || "-"}</td><td className="px-4 py-3">{m.by?.name || "-"}</td>
        </tr>
      ))}
    </Table>
  );
}

function Pharmacy() {
  const [tab, setTab] = useState("stock");
  const [cat, setCat] = useState("");
  const [flag, setFlag] = useState("");
  const fields = [
    { key: "name", label: "Item name", required: true, full: true },
    { key: "category", label: "Category", type: "select", required: true, options: CATS.map((c) => [c, c]), default: "Medicine" },
    { key: "sku", label: "SKU / code" },
    { key: "unit", label: "Unit", default: "pcs" },
    { key: "qty", label: "Quantity on hand", type: "number", default: 0 },
    { key: "reorderLevel", label: "Reorder level", type: "number", default: 10 },
    { key: "cost", label: "Cost price (₱)", type: "number", default: 0 },
    { key: "price", label: "Selling price (₱)", type: "number", default: 0 },
    { key: "expiry", label: "Expiry date", type: "date" },
    { key: "supplier", label: "Supplier" },
    { key: "location", label: "Storage location", full: true },
  ];
  const columns = [
    { label: "Item", render: (i) => <><p className="font-medium">{i.name}</p><p className="text-xs text-slate-400">{i.sku}</p></> },
    { label: "Category", key: "category" },
    { label: "On hand", render: (i) => <span className={i.qty <= i.reorderLevel ? "font-semibold text-red-500" : ""}>{i.qty} {i.unit}{i.qty <= i.reorderLevel && <span className="ml-2"><Badge tone="red">Low</Badge></span>}</span> },
    { label: "Reorder at", key: "reorderLevel" },
    { label: "Expiry", render: (i) => (i.expiry ? <span className={i.expiry <= soon() ? "font-medium text-amber-600" : ""}>{fmt(i.expiry)}</span> : "-") },
    { label: "Price", render: (i) => (i.price ? `₱${i.price}` : "-") },
  ];
  return (
    <div>
      <Tabs tabs={[["stock", "Stock"], ["movements", "Stock movements"]]} value={tab} onChange={setTab} />
      {tab === "movements" ? <Movements /> : (
        <Crud noun="item" endpoint="/inventory" columns={columns} fields={fields} newLabel="New item" modalWide params={`&category=${cat}${flag === "low" ? "&low=1" : ""}${flag === "exp" ? "&expiring=1" : ""}`}
          rowActions={(item, reload) => <StockButton item={item} reload={reload} />}
          headerExtra={<>
            <select aria-label="Category" className={`${inputCls} !w-auto`} value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
            <select aria-label="Alerts" className={`${inputCls} !w-auto`} value={flag} onChange={(e) => setFlag(e.target.value)}><option value="">All stock</option><option value="low">Low stock only</option><option value="exp">Expiring within 60 days</option></select>
          </>} />
      )}
    </div>
  );
}
export default Pharmacy;
