import { useAuth } from "../../store";
import { useFetch } from "../../hooks";
import { fmt, peso } from "../../lib";
import { Loading, Stat, Badge } from "../../components/ui";

/* Icon helpers */
const CalIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);
const PeopleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M17 20H5a3 3 0 016 0m6 0a3 3 0 10-6 0m6 0H23M9 7a4 4 0 110-8M15 7a4 4 0 118-8"/>
  </svg>
);
const CashIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
  </svg>
);
const BoxIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/>
  </svg>
);
const StaffIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
  </svg>
);

function Overview() {
  const { user } = useAuth();
  const { data: o, loading, error, reload } = useFetch("/reports/overview");
  if (loading || error) return <Loading error={error} retry={reload} />;

  const STATS = [
    { key: "appointmentsToday", label: "Appointments Today", icon: <CalIcon />, format: (v) => v },
    { key: "patients",          label: "Registered Patients", icon: <PeopleIcon />, format: (v) => v },
    { key: "revenueToday",      label: "Collected Today",     icon: <CashIcon />,   format: peso },
    { key: "unpaidInvoices",    label: "Unpaid Invoices",     icon: <AlertIcon />,  format: (v) => v, red: true },
    { key: "lowStock",          label: "Low-stock Items",     icon: <BoxIcon />,    format: (v) => v, red: true },
    { key: "activeStaff",       label: "Active Staff",        icon: <StaffIcon />,  format: (v) => v },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#172238]">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {user.name?.split(" ")[0]} 👋
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Here is what is happening in the clinic today.
          </p>
        </div>
        <span className="hidden rounded-xl bg-[#EAF5F1] px-4 py-2 text-sm font-medium text-[#2D8982] sm:block">
          {new Date().toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" })}
        </span>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {STATS.map(({ key, label, icon, format, red }) =>
          o[key] !== undefined ? (
            <Stat
              key={key}
              label={label}
              value={format(o[key])}
              tone={red && o[key] ? "red" : undefined}
              icon={icon}
            />
          ) : null
        )}
      </div>

      {/* Upcoming appointments */}
      {o.upcoming && (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-[#E2E9ED]">
          <div className="flex items-center justify-between border-b border-[#E2E9ED] px-6 py-4">
            <h2 className="font-semibold text-[#172238]">Upcoming Appointments</h2>
            <a href="#/dashboard/appointments" className="text-sm font-semibold text-[#2D8982] hover:underline">
              View all →
            </a>
          </div>
          {o.upcoming.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">
              No upcoming appointments.
            </p>
          ) : (
            <ul className="divide-y divide-[#E2E9ED]">
              {o.upcoming.map((a) => (
                <li key={a._id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 hover:bg-[#F8FAF9]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF5F1] text-sm font-bold text-[#2D8982]">
                      {a.patientName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#172238]">{a.patientName}</p>
                      <p className="text-xs text-slate-500">
                        {a.doctor?.name} · {a.type === "video" ? "Video" : "In-person"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                    <span className="text-sm text-slate-500">
                      {fmt(a.date)}, {a.time}
                    </span>
                    <Badge>{a.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Overview;
