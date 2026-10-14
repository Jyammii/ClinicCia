const BASE = import.meta.env.VITE_API_URL || "/api";
const ASSET = import.meta.env.VITE_ASSET_URL || "";
const TOKEN = "clinicnow-token";

export const getToken = () => localStorage.getItem(TOKEN);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN, t) : localStorage.removeItem(TOKEN));
// Uploaded images are stored as "/uploads/xyz.jpg" on the server.
export const assetUrl = (u) => (u && u.startsWith("/uploads") ? ASSET + u : u);

async function request(method, url, body) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const isForm = body instanceof FormData;
  if (body && !isForm) headers["Content-Type"] = "application/json";
  let res;
  try {
    res = await fetch(BASE + url, { method, headers, body: body ? (isForm ? body : JSON.stringify(body)) : undefined });
  } catch {
    throw new Error("Cannot reach the server. Make sure the API is running (npm run dev).");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) window.dispatchEvent(new Event("auth:expired"));
    throw Object.assign(new Error(data.message || "Something went wrong."), { status: res.status, errors: data.errors });
  }
  return data;
}

export const api = {
  get: (u) => request("GET", u),
  post: (u, b) => request("POST", u, b ?? {}),
  put: (u, b) => request("PUT", u, b),
  patch: (u, b) => request("PATCH", u, b ?? {}),
  del: (u) => request("DELETE", u),
  upload: async (file) => {
    const form = new FormData();
    form.append("image", file);
    return (await request("POST", "/upload", form)).url;
  },
};
