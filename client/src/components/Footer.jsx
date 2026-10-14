import { useSite } from "../store";

const cols = {
  "For Patients": [
    ["Find a Doctor", "/find"],
    ["Hospitals", "/browse/hospitals"],
    ["HMOs", "/browse/hmos"],
    ["Specialties", "/browse/specialties"],
    ["Conditions", "/browse/conditions"],
    ["Services", "/browse/services"],
    ["Online Consultation", "/search?online=1"],
  ],
  "For Clinics": [
    ["Clinic Management System", "/"],
    ["Request a Demo", "/?section=demo"],
    ["Staff Login", "/login"],
  ],
  General: [
    ["About Us", "/"],
    ["Terms & Conditions", "/"],
    ["Privacy Policy", "/"],
    ["Contact", "/?section=demo"],
  ],
};

const YEAR = new Date().getFullYear();

function Footer() {
  const { site } = useSite();
  const c = site.contact || {};
  return (
    <footer className="mt-0 bg-[#0d2035] text-slate-400">
      {/* Main footer grid */}
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand col */}
        <div>
          <a href="#/" className="inline-block">
            <img src="/logo-white.png" alt={site.siteName || "ClinicNow"} className="h-8 w-auto object-contain" />
          </a>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Complete clinic management for Philippine healthcare providers. From booking to billing, all in one system.
          </p>
          <div className="mt-5 flex gap-2 text-xs">
            <span className="cursor-default rounded-lg bg-white/10 px-3 py-2 text-slate-300 transition hover:bg-white/20">
              App Store
            </span>
            <span className="cursor-default rounded-lg bg-white/10 px-3 py-2 text-slate-300 transition hover:bg-white/20">
              Google Play
            </span>
          </div>
          {(c.address || c.email || c.phone) && (
            <div className="mt-5 space-y-1 text-xs text-slate-500">
              {[c.address, c.email, c.phone].filter(Boolean).map((x) => (
                <p key={x}>{x}</p>
              ))}
            </div>
          )}
        </div>

        {/* Link columns */}
        {Object.entries(cols).map(([title, links]) => (
          <div key={title}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-300">
              {title}
            </p>
            <ul className="space-y-2.5 text-sm">
              {links.map(([t, to]) => (
                <li key={t}>
                  <a
                    href={`#${to}`}
                    className="transition hover:text-[#2D8982]"
                  >
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-5">
        <p className="text-center text-xs text-slate-600">
          Copyright © {YEAR} {site.siteName}. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
