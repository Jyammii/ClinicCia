import { useState } from "react";
import { useFetch } from "../../hooks";
import { addDaysISO, btnGhost, downloadCsv, inputCls, peso, todayISO } from "../../lib";
import { Loading, Stat } from "../../components/ui";
import { BarChart, HBars } from "../../components/BarChart";

const Panel = ({ title, children, className = "" }) => <section className={`rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 ${className}`}><h2 className="mb-4 font-semibold">{title}</h2>{children}</section>;

function Reports() {
  const [range, setRange] = useState({ from: addDaysISO(todayISO(), -29), to: todayISO() });
  const { data: r, loading, error, reload } = useFetch(`/reports/summary?from=${range.from}&to=${range.to}`);
  const exportCsv = () => downloadCsv(`clinic-report-${range.from}-to-${range.to}.csv`, [
    ["Date", "Appointments", "Revenue collected (PHP)"],
    ...r.patientVolume.map((d, i) => [d.date, d.value, r.revenueByDay[i].value]),
  ]);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <input type="date" aria-label="From" className={`${inputCls} !w-auto`} value={range.from} max={range.to} onChange={(e) => setRange({ ...range, from: e.target.value })} /> to
        <input type="date" aria-label="To" className={`${inputCls} !w-auto`} value={range.to} max={todayISO()} onChange={(e) => setRange({ ...range, to: e.target.value })} />
        {[[7, "7 days"], [30, "30 days"], [90, "90 days"]].map(([n, l]) => <button key={n} onClick={() => setRange({ from: addDaysISO(todayISO(), -(n - 1)), to: todayISO() })} className="font-medium text-brand">{l}</button>)}
        <button onClick={exportCsv} disabled={!r} className={`${btnGhost} ml-auto`}>Export CSV</button>
      </div>
      {loading || error ? <Loading error={error} retry={reload} /> : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Appointments" value={r.totals.appointments} sub="excluding cancelled" />
            <Stat label="New patients" value={r.totals.newPatients} />
            <Stat label="Revenue collected" value={peso(r.totals.revenue)} />
            <Stat label="Outstanding balance" value={peso(r.totals.outstanding)} sub={`${r.totals.unpaidInvoices} unpaid invoice(s)`} tone={r.totals.outstanding ? "red" : undefined} />
            <Stat label="Low-stock items" value={r.totals.lowStock} tone={r.totals.lowStock ? "red" : undefined} />
            <Stat label="Expiring in 60 days" value={r.totals.expiring} />
            <Stat label="Active staff" value={r.totals.activeStaff} />
            <Stat label="Payroll paid" value={peso(r.totals.payrollPaid)} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Patient volume per day"><BarChart data={r.patientVolume} /></Panel>
            <Panel title="Revenue collected per day"><BarChart data={r.revenueByDay} money /></Panel>
            <Panel title="Popular specialties"><HBars rows={r.popularSpecialties} /></Panel>
            <Panel title="Popular services (by revenue)"><HBars rows={r.popularServices} money /></Panel>
            <Panel title="Top doctors by appointments"><HBars rows={r.topDoctors} /></Panel>
            <Panel title="Revenue by payment method"><HBars rows={r.revenueByMethod} money /></Panel>
            <Panel title="Appointments by status"><HBars rows={r.status} /></Panel>
          </div>
        </>
      )}
    </div>
  );
}
export default Reports;
