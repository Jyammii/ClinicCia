import { useAuth } from "../../store";
import { useFetch } from "../../hooks";
import { fmt, peso } from "../../lib";
import { Loading, Stat, Badge } from "../../components/ui";

function Overview() {
  const { user } = useAuth();
  const { data: o, loading, error, reload } = useFetch("/reports/overview");
  if (loading || error) return <Loading error={error} retry={reload} />;
  return (
    <div className="space-y-6">
      <p className="text-slate-500">Welcome back, {user.name}. Here is what is happening in the clinic today.</p>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {o.appointmentsToday !== undefined && <Stat label="Appointments today" value={o.appointmentsToday} />}
        {o.patients !== undefined && <Stat label="Registered patients" value={o.patients} />}
        {o.revenueToday !== undefined && <Stat label="Collected today" value={peso(o.revenueToday)} />}
        {o.unpaidInvoices !== undefined && <Stat label="Unpaid invoices" value={o.unpaidInvoices} tone={o.unpaidInvoices ? "red" : undefined} />}
        {o.lowStock !== undefined && <Stat label="Low-stock items" value={o.lowStock} tone={o.lowStock ? "red" : undefined} />}
        {o.activeStaff !== undefined && <Stat label="Active staff" value={o.activeStaff} />}
      </div>
      {o.upcoming && (
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Upcoming appointments</h2><a href="#/dashboard/appointments" className="text-sm font-semibold text-brand">View all</a></div>
          {o.upcoming.length === 0 ? <p className="py-6 text-center text-sm text-slate-400">No upcoming appointments.</p> : (
            <ul className="divide-y divide-slate-100">
              {o.upcoming.map((a) => (
                <li key={a._id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <div><p className="font-medium">{a.patientName}</p><p className="text-slate-500">{a.doctor?.name} · {a.type === "video" ? "Video" : "In-person"}</p></div>
                  <div className="flex items-center gap-3"><span className="text-slate-500">{fmt(a.date)}, {a.time}</span><Badge>{a.status}</Badge></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
export default Overview;
