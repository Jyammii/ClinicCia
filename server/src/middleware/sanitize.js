// Strips MongoDB operator keys ("$gt", "a.b") from user input to block NoSQL injection.
const clean = (v) => {
  if (Array.isArray(v)) return v.map(clean);
  if (v && typeof v === "object") {
    for (const k of Object.keys(v)) {
      if (k.startsWith("$") || k.includes(".")) delete v[k];
      else v[k] = clean(v[k]);
    }
  }
  return v;
};
export const sanitize = (req, res, next) => {
  clean(req.body); clean(req.params);
  for (const k of Object.keys(req.query)) { if (k.startsWith("$")) delete req.query[k]; else req.query[k] = clean(req.query[k]); }
  next();
};
