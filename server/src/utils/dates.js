// Clinic operates on Philippine time (UTC+8).
export const todayPH = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
export const startOfDayPH = (iso) => new Date(`${iso}T00:00:00+08:00`);
export const endOfDayPH = (iso) => new Date(`${iso}T23:59:59.999+08:00`);
export const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const eachDay = (from, to) => {
  const out = [];
  for (let d = from; d <= to && out.length < 400; d = addDays(d, 1)) out.push(d);
  return out;
};
export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
