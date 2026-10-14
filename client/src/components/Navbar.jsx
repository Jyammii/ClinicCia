import { useAuth, useSite, isStaff } from "../store";

function Navbar() {
  const { user, logout } = useAuth();
  const { site } = useSite();
  const link = "text-slate-600 hover:text-brand";
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <a href="#/" className="text-2xl font-bold tracking-tight text-brand">{site.siteName}</a>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <a href="#/" className={`hidden md:block ${link}`}>For Clinics</a>
          <a href="#/find" className={`hidden sm:block ${link}`}>Find a Doctor</a>
          {user ? (
            <>
              {isStaff(user) && <a href="#/dashboard" className={link}>Dashboard</a>}
              {user.role === "patient" && <a href="#/appointments" className={link}>My Appointments</a>}
              <button onClick={logout} className="rounded-full border border-brand px-4 py-1.5 text-brand hover:bg-brand-light">Log out</button>
            </>
          ) : (
            <>
              <a href="#/?section=demo" className="hidden rounded-full border border-brand px-4 py-1.5 text-xs font-semibold text-brand hover:bg-brand-light sm:block">REQUEST A DEMO</a>
              <a href="#/login" className="rounded-full bg-brand px-5 py-2 text-xs font-semibold tracking-wide text-white hover:bg-brand-dark">SIGN UP / LOG IN</a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
export default Navbar;
