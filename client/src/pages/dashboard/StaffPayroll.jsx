import { useState } from "react";
import { api } from "../../api";
import { useFetch } from "../../hooks";
import { addDaysISO, btn, btnGhost, fmt, inputCls, peso, todayISO } from "../../lib";
import { Badge, Field, Loading, Modal, Notice, Stat, Table, Tabs } from "../../components/ui";
import Crud from "../../components/Crud";
import { useSite } from "../../store";

function StaffList() {
  const fields = [
    { key: "name", label: "Full name", required: true },
    { key: "position", label: "Position", required: true },
    { key: "department", label: "Department" },
    { key: "phone", label: "Mobile", type: "tel" },
    { key: "email", label: "Email", type: "email" },
    { key: "hireDate", label: "Date hired", type: "date" },
    { key: "dailyRate", label: "Daily rate (₱)", type: "number", default: 0 },
    { key: "allowance", label: "Allowance per pay period (₱)", type: "number", default: 0 },
    { key: "active", label: "Currently employed", type: "checkbox", default: true },
  ];
  const columns = [
    { label: "No.", key: "employeeNo" },
    { label: "Name", render: (s) => <><p className="font-medium">{s.name}</p><p className="text-xs text-slate-400">{s.phone}</p></> },
    { label: "Position", render: (s) => `${s.position}${s.department ? ` · ${s.department}` : ""}` },
    { label: "Daily rate", render: (s) => peso(s.dailyRate) },
    { label: "Hired", render: (s) => fmt(s.hireDate) },
    { label: "Status", render: (s) => <Badge tone={s.active ? "green" : "slate"}>{s.active ? "Active" : "Inactive"}</Badge> },
  ];
  return <Crud noun="employee" endpoint="/staff" columns={columns} fields={fields} newLabel="New employee" modalWide />;
}

function Shifts() {
  const [from, setFrom] = useState(addDaysISO(todayISO(), -6));
  const [to, setTo] = useState(addDaysISO(todayISO(), 7));
  const staff = useFetch("/staff");
  if (!staff.data) return <Loading error={staff.error} retry={staff.reload} />;
  const fields = [
    { key: "staff", label: "Employee", type: "select", required: true, full: true, options: staff.data.filter((s) => s.active).map((s) => [s._id, s.name]) },
    { key: "date", label: "Date", type: "date", required: true },
    { key: "type", label: "Shift", type: "select", required: true, default: "Morning", options: [["Morning", "Morning (7am-3pm)"], ["Afternoon", "Afternoon (3pm-11pm)"], ["Night", "Night (11pm-7am)"], ["Custom", "Custom hours"]] },
    { key: "start", label: "Start (leave blank for default)", type: "time" },
    { key: "end", label: "End", type: "time" },
    { key: "status", label: "Attendance", type: "select", default: "Scheduled", options: ["Scheduled", "Present", "Absent", "Leave"].map((s) => [s, s]) },
    { key: "notes", label: "Notes", full: true },
  ];
  const columns = [
    { label: "Date", render: (s) => fmt(s.date, { weekday: "short", month: "short", day: "numeric" }) },
    { label: "Employee", render: (s) => <><p className="font-medium">{s.staff?.name}</p><p className="text-xs text-slate-400">{s.staff?.position}</p></> },
    { label: "Shift", render: (s) => `${s.type} (${s.start}-${s.end})` },
    { label: "Attendance", render: (s) => <Badge>{s.status}</Badge> },
  ];
  return (
    <Crud noun="shift" endpoint="/shifts" params={`&from=${from}&to=${to}`} columns={columns} fields={fields} empty={{ date: todayISO() }} newLabel="Assign shift" searchable={false}
      headerExtra={<div className="flex items-center gap-2 text-sm"><input type="date" aria-label="From" className={`${inputCls} !w-auto`} value={from} onChange={(e) => setFrom(e.target.value)} /> to <input type="date" aria-label="To" className={`${inputCls} !w-auto`} value={to} onChange={(e) => setTo(e.target.value)} /></div>} />
  );
}

function Payslip({ p, onClose }) {
  const { site } = useSite();
  const rows = [["Basic pay", p.basic], ["Overtime", p.overtime], ["Allowances", p.allowances]];
  const cuts = [["SSS", p.sss], ["PhilHealth", p.philhealth], ["Pag-IBIG", p.pagibig], ["Withholding tax (est.)", p.tax], ["Other deductions", p.otherDeductions]];
  const Line = ([k, v]) => <div key={k} className="flex justify-between py-1"><span className="text-slate-500">{k}</span><span>{peso(v)}</span></div>;
  return (
    <Modal title="Payslip" onClose={onClose}>
      <div className="space-y-3 text-sm">
        <div><p className="text-lg font-bold">{site.siteName}</p><p className="text-slate-500">Pay period {fmt(p.periodStart)} to {fmt(p.periodEnd)}</p></div>
        <div><p className="font-semibold">{p.staff?.name}</p><p className="text-slate-500">{p.staff?.employeeNo} · {p.staff?.position} · {p.daysWorked} day(s) at {peso(p.dailyRate)}{p.overtimeHours ? ` + ${p.overtimeHours}h OT` : ""}</p></div>
        <div className="border-t pt-2">{rows.map(Line)}<div className="flex justify-between border-t py-1 font-semibold"><span>Gross pay</span><span>{peso(p.gross)}</span></div></div>
        <div>{cuts.map(Line)}<div className="flex justify-between border-t py-1 font-semibold"><span>Total deductions</span><span>{peso(p.deductions)}</span></div></div>
        <div className="flex justify-between rounded-xl bg-brand-light p-3 text-base font-bold text-brand"><span>Net pay</span><span>{peso(p.net)}</span></div>
        <p className="text-xs text-slate-400">Statutory deductions are estimates for a semi-monthly cut-off.</p>
        <div className="no-print flex justify-end"><button onClick={() => window.print()} className={btn}>Print</button></div>
      </div>
    </Modal>
  );
}

function Payroll() {
  const t = todayISO();
  const first = t.slice(0, 8) + (Number(t.slice(8)) <= 15 ? "01" : "16");
  const last = Number(t.slice(8)) <= 15 ? t.slice(0, 8) + "15" : new Date(+t.slice(0, 4), +t.slice(5, 7), 0).toLocaleDateString("en-CA");
  const [period, setPeriod] = useState({ from: first, to: last });
  const { data, loading, error, reload } = useFetch("/payroll");
  const [msg, setMsg] = useState({ text: "", tone: "red" });
  const [slip, setSlip] = useState(null);
  const [edit, setEdit] = useState(null);
  const say = (text, tone = "red") => setMsg({ text, tone });

  const generate = async () => {
    try { const r = await api.post("/payroll/generate", { periodStart: period.from, periodEnd: period.to }); say(`Created ${r.created} draft payslip(s)${r.skipped ? `, skipped ${r.skipped} that already exist` : ""}.`, "green"); reload(); }
    catch (e) { say(e.message); }
  };
  const act = async (fn) => { try { await fn(); reload(); say(""); } catch (e) { say(e.message); } };
  const saveEdit = async (e) => {
    e.preventDefault();
    await act(() => api.put(`/payroll/${edit._id}`, { daysWorked: Number(edit.daysWorked), overtimeHours: Number(edit.overtimeHours) || 0, allowances: Number(edit.allowances) || 0, otherDeductions: Number(edit.otherDeductions) || 0 }));
    setEdit(null);
  };
  const rows = data || [];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <Field label="Period start"><input type="date" className={inputCls} value={period.from} onChange={(e) => setPeriod({ ...period, from: e.target.value })} /></Field>
        <Field label="Period end"><input type="date" className={inputCls} value={period.to} onChange={(e) => setPeriod({ ...period, to: e.target.value })} /></Field>
        <button onClick={generate} className={btn}>Generate payroll</button>
        <p className="basis-full text-xs text-slate-400">Days worked are counted from the duty roster (Present or Scheduled shifts). Correct them with Edit before marking paid.</p>
      </div>
      <Notice tone={msg.tone}>{msg.text}</Notice>
      {loading || error ? <Loading error={error} retry={reload} /> : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3"><Stat label="Payslips" value={rows.length} /><Stat label="Draft net pay" value={peso(rows.filter((r) => r.status === "Draft").reduce((s, r) => s + r.net, 0))} /><Stat label="Paid net pay" value={peso(rows.filter((r) => r.status === "Paid").reduce((s, r) => s + r.net, 0))} /></div>
          <Table heads={["Employee", "Period", "Days", "Gross", "Deductions", "Net", "Status", "Actions"]} empty="No payroll yet. Pick a period and generate.">
            {rows.map((r) => (
              <tr key={r._id} className="border-t border-slate-100">
                <td className="px-4 py-3"><p className="font-medium">{r.staff?.name}</p><p className="text-xs text-slate-400">{r.staff?.position}</p></td>
                <td className="whitespace-nowrap px-4 py-3">{fmt(r.periodStart, { month: "short", day: "numeric" })} - {fmt(r.periodEnd)}</td>
                <td className="px-4 py-3">{r.daysWorked}</td><td className="px-4 py-3">{peso(r.gross)}</td><td className="px-4 py-3">{peso(r.deductions)}</td><td className="px-4 py-3 font-semibold">{peso(r.net)}</td>
                <td className="px-4 py-3"><Badge>{r.status}</Badge></td>
                <td className="whitespace-nowrap px-4 py-3"><div className="flex gap-3 text-sm font-medium">
                  <button onClick={() => setSlip(r)} className="text-brand">Payslip</button>
                  {r.status === "Draft" && <><button onClick={() => setEdit({ ...r })} className="text-brand">Edit</button><button onClick={() => confirm("Mark as paid? It will be locked.") && act(() => api.post(`/payroll/${r._id}/pay`))} className="text-green-600">Mark paid</button><button onClick={() => confirm("Delete this draft?") && act(() => api.del(`/payroll/${r._id}`))} className="text-red-500">Delete</button></>}
                </div></td>
              </tr>
            ))}
          </Table>
        </>
      )}
      {slip && <Payslip p={slip} onClose={() => setSlip(null)} />}
      {edit && (
        <Modal title={`Edit payslip: ${edit.staff?.name}`} onClose={() => setEdit(null)}>
          <form onSubmit={saveEdit} className="grid gap-3 sm:grid-cols-2">
            {[["daysWorked", "Days worked"], ["overtimeHours", "Overtime hours"], ["allowances", "Allowances (₱)"], ["otherDeductions", "Other deductions (₱)"]].map(([k, l]) => (
              <Field key={k} label={l}><input type="number" min="0" step="any" className={inputCls} value={edit[k]} onChange={(e) => setEdit({ ...edit, [k]: e.target.value })} /></Field>
            ))}
            <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={() => setEdit(null)} className={btnGhost}>Cancel</button><button className={btn}>Recalculate & save</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function StaffPayroll() {
  const [tab, setTab] = useState("staff");
  return (
    <div>
      <Tabs tabs={[["staff", "Employees"], ["shifts", "Duty roster"], ["payroll", "Payroll"]]} value={tab} onChange={setTab} />
      {tab === "staff" ? <StaffList /> : tab === "shifts" ? <Shifts /> : <Payroll />}
    </div>
  );
}
export default StaffPayroll;
