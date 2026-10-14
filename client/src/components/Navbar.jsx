import { useState } from "react";
import { useAuth, useSite, isStaff } from "../store";

function Navbar() {
  const { user, logout } = useAuth();
  const { site } = useSite();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLink =
    "text-sm font-medium text-[#172238]/70 transition hover:text-[#102943]";

  return (
    <header className="sticky top-0 z-20 border-b border-[#E2E9ED] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5">
        {/* Logo */}
        <a href="#/" className="flex items-center gap-2">
          <img src="/logo.png" alt={site.siteName || "ClinicNow"} className="h-8 w-auto object-contain" />
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#/" className={navLink}>For Clinics</a>
          <a href="#/find" className={navLink}>Find a Doctor</a>
          {user && isStaff(user) && (
            <a href="#/dashboard" className={navLink}>Dashboard</a>
          )}
          {user && user.role === "patient" && (
            <a href="#/appointments" className={navLink}>My Appointments</a>
          )}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <span className="mr-1 text-sm text-slate-500">
                {user.name?.split(" ")[0]}
              </span>
              <button
                onClick={logout}
                className="rounded-xl border border-[#E2E9ED] px-4 py-2 text-sm font-medium text-[#172238] transition hover:border-[#2D8982] hover:text-[#2D8982]"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <a
                href="#/?section=demo"
                className="hidden rounded-xl border border-[#E2E9ED] px-4 py-2 text-sm font-medium text-[#172238] transition hover:border-[#2D8982] hover:text-[#2D8982] lg:block"
              >
                Request a Demo
              </a>
              <a
                href="#/login"
                className="rounded-xl bg-[#102943] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1a4a6e]"
              >
                Sign Up / Log In
              </a>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E9ED] text-[#172238] transition hover:bg-[#EAF5F1] md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[#E2E9ED] bg-white px-5 py-4 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-1">
            {[
              ["#/", "For Clinics"],
              ["#/find", "Find a Doctor"],
              ...(user && isStaff(user) ? [["#/dashboard", "Dashboard"]] : []),
              ...(user && user.role === "patient" ? [["#/appointments", "My Appointments"]] : []),
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#172238] hover:bg-[#EAF5F1] hover:text-[#2D8982]"
              >
                {label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-[#E2E9ED] pt-3">
              {user ? (
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full rounded-xl border border-[#E2E9ED] py-2.5 text-sm font-medium text-[#172238]"
                >
                  Log out
                </button>
              ) : (
                <>
                  <a href="#/?section=demo" className="rounded-xl border border-[#E2E9ED] py-2.5 text-center text-sm font-medium text-[#172238]">
                    Request a Demo
                  </a>
                  <a href="#/login" className="rounded-xl bg-[#102943] py-2.5 text-center text-sm font-semibold text-white">
                    Sign Up / Log In
                  </a>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
