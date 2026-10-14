import { useState } from "react";
import { go } from "../hooks";
import { useAuth, isStaff } from "../store";
import { inputCls } from "../lib";
import { Notice } from "../components/ui";

function Auth({ next, notice }) {
  const { login, register } = useAuth();
  const [signup, setSignup] = useState(false);
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    const email = f.email.trim().toLowerCase();
    if (!email || !f.password) return setErr("Email and password are required.");
    if (signup && !f.name.trim()) return setErr("Please enter your name.");
    setBusy(true); setErr("");
    try {
      const u = signup ? await register(f.name.trim(), email, f.password) : await login(email, f.password);
      // Staff land on their dashboard unless they were sent here from a specific page.
      go(next && next !== "/" ? next : isStaff(u) ? "/dashboard" : "/find");
    } catch (ex) { setErr(ex.message); setBusy(false); }
  };
  return (
    <main className="mx-auto max-w-md px-5 py-14">
      <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold">{signup ? "Create your account" : "Welcome back"}</h1>
        <p className="text-sm text-slate-500">{notice || (signup ? "Sign up to book appointments." : "Log in to book appointments or open your clinic dashboard.")}</p>
        {signup && <input className={inputCls} placeholder="Full name" value={f.name} onChange={set("name")} autoComplete="name" />}
        <input className={inputCls} type="email" placeholder="Email" value={f.email} onChange={set("email")} autoComplete="email" />
        <input className={inputCls} type="password" placeholder={signup ? "Password (at least 8 characters)" : "Password"} value={f.password} onChange={set("password")} autoComplete={signup ? "new-password" : "current-password"} />
        <Notice>{err}</Notice>
        <button disabled={busy} className="w-full rounded-full bg-brand py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-50">{busy ? "Please wait..." : signup ? "Sign Up" : "Log In"}</button>
        <p className="text-center text-sm text-slate-500">
          {signup ? "Already have an account?" : "New here?"}{" "}
          <button type="button" onClick={() => { setSignup(!signup); setErr(""); }} className="font-semibold text-brand">{signup ? "Log in" : "Sign up"}</button>
        </p>
        {!signup && <p className="text-center text-xs text-slate-400">Demo admin: admin@clinic.ph / admin123</p>}
      </form>
    </main>
  );
}
export default Auth;
