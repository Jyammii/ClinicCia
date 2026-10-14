import { useAuth, can, isStaff } from "../../store";
import Overview from "./Overview";
import AppointmentsAdmin from "./AppointmentsAdmin";
import Patients from "./Patients";
import Billing from "./Billing";
import Pharmacy from "./Pharmacy";
import StaffPayroll from "./StaffPayroll";
import Reports from "./Reports";
import Doctors from "./Doctors";
import SiteImages from "./SiteImages";
import Inquiries from "./Inquiries";
import Users from "./Users";

// [route, label, any-of module permissions (null = every staff member)]
const NAV = [
  ["overview", "Overview", null],
  ["appointments", "Appointments", ["appointments"]],
  ["patients", "Patients & EMR", ["emr", "appointments"]],
  ["billing", "Billing & Claims", ["billing"]],
  ["pharmacy", "Pharmacy & Inventory", ["inventory"]],
  ["staff", "Staff & Payroll", ["staff"]],
  ["reports", "Reports", ["reports"]],
  ["doctors", "Doctors", ["settings"]],
  ["site", "Site & Images", ["settings"]],
  ["inquiries", "Demo Requests", ["settings"]],
  ["users", "Users & Access", ["users"]],
];

function Dashboard({ section = "overview", sub, query }) {
  const { user } = useAuth();
  if (!isStaff(user)) return <main className="py-24 text-center text-slate-400">This area is for clinic staff only.</main>;
  const allowed = (mods) => !mods || mods.some((m) => can(user, m));
  const items = NAV.filter(([, , mods]) => allowed(mods));
  const current = NAV.find(([k]) => k === section) || NAV[0];

  let view;
  if (!allowed(current[2])) view = <p className="py-20 text-center text-slate-400">You do not have access to this module. Ask an admin to update your permissions.</p>;
  else {
    const props = { sub, query };
    view = {
      overview: <Overview />, appointments: <AppointmentsAdmin />, patients: <Patients {...props} />, billing: <Billing {...props} />,
      pharmacy: <Pharmacy />, staff: <StaffPayroll />, reports: <Reports />, doctors: <Doctors />, site: <SiteImages />,
      inquiries: <Inquiries />, users: <Users />,
    }[current[0]];
  }

  return (
    <main className="mx-auto max-w-7xl gap-8 px-5 py-8 lg:grid lg:grid-cols-[230px,1fr]">
      <nav aria-label="Dashboard" className="mb-6 flex gap-1 overflow-x-auto lg:sticky lg:top-24 lg:mb-0 lg:h-fit lg:flex-col lg:rounded-2xl lg:bg-white lg:p-3 lg:shadow-sm lg:ring-1 lg:ring-slate-200">
        {items.map(([k, label]) => (
          <a key={k} href={`#/dashboard/${k}`} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium lg:rounded-xl ${current[0] === k ? "bg-brand text-white" : "text-slate-600 hover:bg-brand-light hover:text-brand"}`}>{label}</a>
        ))}
      </nav>
      <section className="min-w-0">
        <h1 className="mb-5 text-3xl font-bold">{current[1]}</h1>
        {view}
      </section>
    </main>
  );
}
export default Dashboard;
