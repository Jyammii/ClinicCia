import { useState } from "react";
import { api } from "../api";
import { useFetch } from "../hooks";
import { inputCls, btn, btnGhost } from "../lib";
import { Modal, Field, Notice, Loading, Table } from "./ui";

/**
 * Reusable list + search + add/edit modal + delete for a REST resource.
 *  fields:  [{ key, label, type: text|number|date|time|email|tel|password|textarea|select|checkbox|multi|list,
 *              options: [[value, label]], required, full, default, afterChange(value, form) }]
 *  columns: [{ key, label, render(row) }]
 */
const blank = (f) => (f.type === "checkbox" ? !!f.default : f.type === "multi" ? [] : f.default ?? "");

function toForm(fields, row) {
  return Object.fromEntries(
    fields.map((f) => {
      let v = row[f.key];
      if (v && typeof v === "object" && !Array.isArray(v) && v._id) v = v._id;
      if (f.type === "list") v = (v || []).join(", ");
      if (f.type === "password") v = "";
      return [f.key, v ?? blank(f)];
    })
  );
}

function toPayload(fields, form) {
  const out = {};
  for (const f of fields) {
    let v = form[f.key];
    if (f.type === "number") { if (v === "") continue; v = Number(v); }
    else if (f.type === "list") v = String(v).split(",").map((s) => s.trim()).filter(Boolean);
    else if (f.type === "password" && !v) continue;
    out[f.key] = v;
  }
  return out;
}

function Crud({ noun, endpoint, columns, fields, empty = {}, params = "", canCreate = true, canEdit = true, canDelete = true, rowActions, headerExtra, newLabel = "Add", searchable = true, modalWide = false, emptyText }) {
  const [q, setQ] = useState("");
  const [applied, setApplied] = useState("");
  const { data, loading, error, reload } = useFetch(`${endpoint}?q=${encodeURIComponent(applied)}${params}`);
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const open = (row) => {
    setErr("");
    setEditId(row ? row._id : null);
    setForm(row ? toForm(fields, row) : { ...Object.fromEntries(fields.map((f) => [f.key, blank(f)])), ...empty });
  };
  const set = (key, value) =>
    setForm((cur) => {
      const next = { ...cur, [key]: value };
      const f = fields.find((x) => x.key === key);
      return f?.afterChange ? { ...next, ...f.afterChange(value, next) } : next;
    });
  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setErr("");
    try {
      const body = toPayload(fields, form);
      if (editId) await api.put(`${endpoint}/${editId}`, body);
      else await api.post(endpoint, body);
      setForm(null); reload();
    } catch (ex) { setErr(ex.message); } finally { setSaving(false); }
  };
  const del = async (row) => {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    try { await api.del(`${endpoint}/${row._id}`); reload(); } catch (ex) { alert(ex.message); }
  };

  const renderField = (f) => {
    const v = form[f.key];
    const common = { className: inputCls, required: f.required, value: v, onChange: (e) => set(f.key, e.target.value) };
    let control;
    if (f.type === "textarea") {
      control = <textarea rows="3" {...common} />;
    } else if (f.type === "select") {
      control = (
        <select {...common}>
          <option value="">{f.required ? "Select…" : "None"}</option>
          {f.options.map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      );
    } else if (f.type === "checkbox") {
      return (
        <label key={f.key} className="flex items-center gap-2 text-sm text-[#172238]">
          <input
            type="checkbox"
            className="accent-[#2D8982] h-4 w-4 rounded"
            checked={!!v}
            onChange={(e) => set(f.key, e.target.checked)}
          />
          {f.label}
        </label>
      );
    } else if (f.type === "multi") {
      control = (
        <div className="flex flex-wrap gap-2">
          {f.options.map(([val, label]) => (
            <label
              key={val}
              className={`cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                v.includes(val)
                  ? "border-[#2D8982] bg-[#EAF5F1] text-[#2D8982]"
                  : "border-[#E2E9ED] text-slate-500 hover:border-[#2D8982]"
              }`}
            >
              <input
                type="checkbox"
                hidden
                checked={v.includes(val)}
                onChange={() => set(f.key, v.includes(val) ? v.filter((x) => x !== val) : [...v, val])}
              />
              {label}
            </label>
          ))}
        </div>
      );
    } else {
      control = (
        <input
          type={f.type === "list" ? "text" : f.type || "text"}
          step={f.type === "number" ? "any" : undefined}
          min={f.type === "number" ? 0 : undefined}
          placeholder={f.placeholder}
          autoComplete={f.type === "password" ? "new-password" : undefined}
          {...common}
        />
      );
    }
    return (
      <Field
        key={f.key}
        label={`${f.label}${f.required ? " *" : ""}`}
        className={f.full || f.type === "textarea" || f.type === "multi" ? "sm:col-span-2" : ""}
      >
        {control}
      </Field>
    );
  };

  const heads = [...columns.map((c) => c.label), ...(canEdit || canDelete || rowActions ? ["Actions"] : [])];

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {searchable && (
          <form
            onSubmit={(e) => { e.preventDefault(); setApplied(q); }}
            className="flex overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-[#E2E9ED]"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="w-48 px-4 py-2.5 text-sm text-[#172238] outline-none placeholder:text-slate-400 sm:w-64"
            />
            <button className="m-1 rounded-lg bg-[#2D8982] px-4 text-sm font-semibold text-white hover:bg-[#226b66]">
              Search
            </button>
          </form>
        )}
        {headerExtra}
        {canCreate && (
          <button onClick={() => open()} className={`${btn} ml-auto`}>
            + {newLabel}
          </button>
        )}
      </div>

      {/* Table */}
      {loading && !data ? (
        <Loading error={error} retry={reload} />
      ) : error ? (
        <Loading error={error} retry={reload} />
      ) : (
        <Table heads={heads} empty={emptyText}>
          {(data || []).map((row) => (
            <tr key={row._id} className="align-top">
              {columns.map((c) => (
                <td key={c.label} className="px-4 py-3 text-sm">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
              {heads.length > columns.length && (
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-3 text-sm font-medium">
                    {rowActions?.(row, reload)}
                    {canEdit && (
                      <button
                        onClick={() => open(row)}
                        className="rounded-lg bg-[#EAF5F1] px-3 py-1.5 text-xs font-semibold text-[#2D8982] transition hover:bg-[#d4eeeb]"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => del(row)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </Table>
      )}

      {/* Modal */}
      {form && (
        <Modal title={`${editId ? "Edit" : "New"} ${noun}`} onClose={() => setForm(null)} wide={modalWide}>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">{fields.map(renderField)}</div>
            <Notice>{err}</Notice>
            <div className="flex justify-end gap-2 border-t border-[#E2E9ED] pt-4">
              <button type="button" onClick={() => setForm(null)} className={btnGhost}>
                Cancel
              </button>
              <button disabled={saving} className={btn}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Crud;
