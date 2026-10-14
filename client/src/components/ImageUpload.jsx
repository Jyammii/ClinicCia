import { useState } from "react";
import { api, assetUrl } from "../api";

const MAX_SIZE = 2 * 1024 * 1024;

// Uploads the chosen file to the server and reports the stored URL through onChange.
function ImageUpload({ image, onChange, onError = () => {}, className = "h-40" }) {
  const [busy, setBusy] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return onError("Please choose an image file.");
    if (file.size > MAX_SIZE) return onError("Image is too large. Maximum size is 2MB.");
    setBusy(true);
    try { onChange(await api.upload(file)); onError(""); }
    catch (err) { onError(err.message); }
    finally { setBusy(false); }
  };
  return (
    <label className={`relative flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 text-xs text-slate-400 transition hover:border-brand hover:text-brand ${className}`}>
      {image ? <img src={assetUrl(image)} alt="Preview" className="h-full w-full object-cover" /> : <span className="px-2 text-center">{busy ? "Uploading..." : "+ Upload image (max 2MB)"}</span>}
      {busy && image && <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-brand">Uploading...</span>}
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFile} hidden />
    </label>
  );
}
export default ImageUpload;
