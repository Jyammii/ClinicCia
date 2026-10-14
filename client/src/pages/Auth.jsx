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
    setBusy(true);
    setErr("");
    try {
      const u = signup
        ? await register(f.name.trim(), email, f.password)
        : await login(email, f.password);
      go(next && next !== "/" ? next : isStaff(u) ? "/dashboard" : "/find");
    } catch (ex) {
      setErr(ex.message);
      setBusy(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#EAF5F1]">
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-5 py-16">
        <div className="w-full max-w-md animate-fade-up">
          {/* Header */}
          <div className="mb-8 text-center">
            <a href="#/" className="mb-4 inline-block transition hover:opacity-90">
              <img src="/logo.png" alt="ClinicNow" className="mx-auto h-11 w-auto object-contain" />
            </a>
            <h1 className="font-serif text-3xl font-normal text-[#172238]">
              {signup ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {notice ||
                (signup
                  ? "Sign up to book appointments."
                  : "Log in to book appointments or open your clinic dashboard.")}
            </p>
          </div>

          {/* Form card */}
          <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-[#E2E9ED]">
            {signup && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Full Name
                </label>
                <input
                  className={inputCls}
                  placeholder="Your name"
                  value={f.name}
                  onChange={set("name")}
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email address
              </label>
              <input
                className={inputCls}
                type="email"
                placeholder="you@example.com"
                value={f.email}
                onChange={set("email")}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Password
              </label>
              <input
                className={inputCls}
                type="password"
                placeholder={signup ? "At least 8 characters" : "Your password"}
                value={f.password}
                onChange={set("password")}
                autoComplete={signup ? "new-password" : "current-password"}
              />
            </div>

            <Notice>{err}</Notice>

            <button
              disabled={busy}
              className="w-full rounded-xl bg-[#102943] py-3.5 font-semibold text-white transition hover:bg-[#1a4a6e] disabled:opacity-50"
            >
              {busy ? "Please wait…" : signup ? "Sign Up" : "Log In"}
            </button>

            <p className="text-center text-sm text-slate-500">
              {signup ? "Already have an account?" : "New here?"}{" "}
              <button
                type="button"
                onClick={() => { setSignup(!signup); setErr(""); }}
                className="font-semibold text-[#2D8982] hover:underline"
              >
                {signup ? "Log in" : "Sign up"}
              </button>
            </p>

            {!signup && (
              <p className="rounded-xl bg-[#EAF5F1] px-4 py-3 text-center text-xs text-slate-500">
                Demo admin: <span className="font-mono font-semibold text-[#172238]">admin@clinic.ph</span>{" "}
                / <span className="font-mono font-semibold text-[#172238]">admin123</span>
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}

export default Auth;
