import { useSite } from "../store";

const cols = {
  "For Patients": [["Find a Doctor", "/find"], ["Hospitals", "/browse/hospitals"], ["HMOs", "/browse/hmos"], ["Specialties", "/browse/specialties"], ["Conditions", "/browse/conditions"], ["Services", "/browse/services"], ["Online Consultation", "/search?online=1"]],
  "For Clinics": [["Clinic Management System", "/"], ["Request a Demo", "/?section=demo"], ["Staff Login", "/login"]],
  General: [["About Us", "/"], ["Terms & Conditions", "/"], ["Privacy Policy", "/"], ["Contact", "/?section=demo"]],
};
const YEAR = new Date().getFullYear();

function Footer() {
  const { site } = useSite();
  const c = site.contact || {};
  return (
    <footer className="mt-16 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xl font-bold text-white">{site.siteName}</p>
          <p className="mt-3 text-sm text-slate-400">For a seamless experience. Available on iOS and Android.</p>
          <div className="mt-4 flex gap-2 text-xs">
            <span className="rounded-lg bg-slate-800 px-3 py-2">App Store</span>
            <span className="rounded-lg bg-slate-800 px-3 py-2">Google Play</span>
          </div>
          {(c.address || c.email || c.phone) && (
            <p className="mt-4 space-y-1 text-xs text-slate-400">{[c.address, c.email, c.phone].filter(Boolean).map((x) => <span key={x} className="block">{x}</span>)}</p>
          )}
        </div>
        {Object.entries(cols).map(([title, links]) => (
          <div key={title}>
            <p className="mb-3 font-semibold text-white">{title}</p>
            <ul className="space-y-2 text-sm">
              {links.map(([t, to]) => <li key={t}><a href={`#${to}`} className="hover:text-white">{t}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <p className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">Copyright © {YEAR} {site.siteName}. All Rights Reserved.</p>
    </footer>
  );
}
export default Footer;
