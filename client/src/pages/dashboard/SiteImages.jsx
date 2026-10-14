import { useState } from "react";
import { api } from "../../api";
import { useSite } from "../../store";
import { FEATURES } from "../../data/constants";
import { inputCls, btn } from "../../lib";
import { Notice } from "../../components/ui";
import ImageUpload from "../../components/ImageUpload";

const GROUPS = [["specialties", "Specialty images"], ["conditions", "Condition images"], ["services", "Service images"], ["hospitals", "Hospital images"]];
const box = "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200";

function SiteImages() {
  const { site, setSite } = useSite();
  const [name, setName] = useState(site.siteName);
  const [contact, setContact] = useState({ address: "", email: "", phone: "", ...site.contact });
  const [msg, setMsg] = useState({ text: "", tone: "red" });

  const patch = async (body, ok) => {
    try { setSite(await api.patch("/site", body)); setMsg(ok ? { text: ok, tone: "green" } : { text: "", tone: "red" }); }
    catch (e) { setMsg({ text: e.message, tone: "red" }); }
  };
  const setTile = (key, id, image) => patch({ [key]: site[key].map((i) => (i.id === id ? { ...i, image } : i)) });
  const setLanding = (key, image) => patch({ landing: { ...site.landing, [key]: image } });
  const onErr = (text) => setMsg({ text, tone: "red" });

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-500">Every image on the public site starts as a placeholder. Upload a picture (JPG, PNG, WEBP or GIF, up to 2MB) to replace it. Changes appear immediately.</p>
      <Notice tone={msg.tone}>{msg.text}</Notice>

      <section className={box}>
        <h2 className="mb-3 font-semibold">Site name & contact</h2>
        <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
          <input aria-label="Site name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Site name" />
          <input aria-label="Phone" className={inputCls} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="Phone" />
          <input aria-label="Email" className={inputCls} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="Email" />
          <input aria-label="Address" className={inputCls} value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} placeholder="Address" />
        </div>
        <button onClick={() => name.trim() ? patch({ siteName: name.trim(), contact }, "Saved.") : onErr("Site name cannot be empty.")} className={`${btn} mt-4`}>Save</button>
      </section>

      <section className={box}>
        <h2 className="mb-1 font-semibold">Clinic landing page</h2>
        <p className="mb-4 text-xs text-slate-500">Hero and the five feature sections on the home page.</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[["hero", "Hero image"], ...FEATURES.map((f) => [f.key, f.title])].map(([k, label]) => (
            <div key={k}>
              <ImageUpload image={site.landing?.[k]} onChange={(img) => setLanding(k, img)} onError={onErr} className="h-24" />
              <p className="mt-1 text-xs text-slate-600">{label}</p>
              {site.landing?.[k] && <button onClick={() => setLanding(k, "")} className="text-xs text-red-500">Remove</button>}
            </div>
          ))}
        </div>
      </section>

      <section className={box}>
        <h2 className="mb-3 font-semibold">Find-a-doctor banner</h2>
        <p className="mb-2 text-xs text-slate-500">Video consultation banner</p>
        <ImageUpload image={site.hero} onChange={(image) => patch({ hero: image })} onError={onErr} className="h-32 max-w-xs" />
        {site.hero && <button onClick={() => patch({ hero: "" })} className="mt-1 text-xs text-red-500">Remove</button>}
      </section>

      {GROUPS.map(([key, title]) => (
        <section key={key} className={box}>
          <h2 className="mb-4 font-semibold">{title}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {site[key].map((i) => (
              <div key={i.id}>
                <ImageUpload image={i.image} onChange={(img) => setTile(key, i.id, img)} onError={onErr} className="h-24" />
                <p className="mt-1 text-xs text-slate-600">{i.name}</p>
                {i.image && <button onClick={() => setTile(key, i.id, "")} className="text-xs text-red-500">Remove</button>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
export default SiteImages;
