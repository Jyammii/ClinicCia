import { useState, useEffect } from "react";
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

// [route, label, icon path, module permissions (null = every staff member)]
const NAV = [
  ["overview",      "Overview",            "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", null],
  ["appointments",  "Appointments",        "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", ["appointments"]],
  ["patients",      "Patients & EMR",      "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", ["emr", "appointments"]],
  ["billing",       "Billing & Claims",    "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z", ["billing"]],
  ["pharmacy",      "Pharmacy & Inventory","M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z", ["inventory"]],
  ["staff",         "Staff & Payroll",     "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", ["staff"]],
  ["reports",       "Reports",             "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", ["reports"]],
  ["doctors",       "Doctors",             "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0M19 21a7 7 0 10-14 0", ["settings"]],
  ["site",          "Site & Images",       "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", ["settings"]],
  ["inquiries",     "Demo Requests",       "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", ["settings"]],
  ["users",         "Users & Access",      "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z", ["users"]],
];

function NavIcon({ path }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

function Dashboard({ section = "overview", sub, query }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [section]);

  if (!isStaff(user))
    return (
      <main className="py-24 text-center text-slate-400">
        This area is for clinic staff only.
      </main>
    );

  const allowed = (mods) => !mods || mods.some((m) => can(user, m));
  const items = NAV.filter(([, , , mods]) => allowed(mods));
  const current = NAV.find(([k]) => k === section) || NAV[0];

  let view;
  if (!allowed(current[3])) {
    view = (
      <p className="py-20 text-center text-slate-400">
        You do not have access to this module. Ask an admin to update your permissions.
      </p>
    );
  } else {
    const props = { sub, query };
    view = {
      overview:     <Overview />,
      appointments: <AppointmentsAdmin />,
      patients:     <Patients {...props} />,
      billing:      <Billing {...props} />,
      pharmacy:     <Pharmacy />,
      staff:        <StaffPayroll />,
      reports:      <Reports />,
      doctors:      <Doctors />,
      site:         <SiteImages />,
      inquiries:    <Inquiries />,
      users:        <Users />,
    }[current[0]];
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#F0F4F7" }}>
      {/* ── Sidebar overlay (mobile) ── */}
      <div
        className={`sidebar-overlay ${mobileOpen ? "visible" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Sidebar ── */}
      <aside className={`dash-sidebar ${mobileOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="dash-sidebar-logo">
          <a href="#/" className="flex items-center">
            <img src="/logo-white.png" alt="ClinicNow" className="h-7 w-auto object-contain" />
          </a>
        </div>

        {/* Section label */}
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Navigation
        </p>

        {/* Nav items */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {items.map(([k, label, iconPath]) => (
            <a
              key={k}
              href={`#/dashboard/${k}`}
              className={`sidebar-link ${current[0] === k ? "active" : ""}`}
            >
              <NavIcon path={iconPath} />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        {/* User footer */}
        <div className="mt-auto border-t border-white/10 pt-4">
          <div className="mb-2 flex items-center gap-2.5 px-3 py-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2D8982] text-xs font-bold text-white">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{user.name}</p>
              <p className="truncate text-[10px] capitalize text-slate-400">{user.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="sidebar-link w-full text-slate-500 hover:text-red-400"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="dash-main flex-1">
        {/* Top bar */}
        <header className="dash-topbar">
          {/* Mobile menu button */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E9ED] text-slate-500 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle sidebar"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>

          {/* Page title */}
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-[#172238]">{current[1]}</h1>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:block">
              {user.name}
            </span>
            <a href="#/" className="rounded-lg border border-[#E2E9ED] px-3 py-1.5 text-xs font-medium text-[#172238] transition hover:border-[#2D8982] hover:text-[#2D8982]">
              Public site ↗
            </a>
          </div>
        </header>

        {/* Page content */}
        <div className="dash-content">
          {view}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
