import { LogOut, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useLanguage from "../context/useLanguage";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { language, changeLanguage, t } = useLanguage();
  const role = t.dashboard.role[user?.role?.toLowerCase()] || t.dashboard.role.user;

  const signOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-700">{t.login.badge}</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">{role} {t.dashboard.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <button type="button" onClick={() => changeLanguage("hi")} className={`rounded px-2 py-1 text-xs ${language === "hi" ? "bg-green-800 text-white" : "text-slate-500"}`}>हिन्दी</button>
              <button type="button" onClick={() => changeLanguage("en")} className={`rounded px-2 py-1 text-xs ${language === "en" ? "bg-green-800 text-white" : "text-slate-500"}`}>English</button>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:text-red-700"
            >
              <LogOut size={16} /> {t.dashboard.logout}
            </button>
          </div>
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl bg-green-900 p-8 text-white shadow-xl">
            <ShieldCheck size={30} />
            <p className="mt-8 text-sm text-green-100">{t.dashboard.welcome}</p>
            <h2 className="mt-2 text-3xl font-bold">{user?.name || t.dashboard.accountHolder}</h2>
            <p className="mt-3 max-w-lg text-green-100">
              {t.dashboard.workspace}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">{t.dashboard.accountDetails}</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-slate-400">{t.dashboard.contact}</dt>
                <dd className="mt-1 font-medium text-slate-800">{user?.email || user?.mobile || "-"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">{t.dashboard.roleLabel}</dt>
                <dd className="mt-1 font-medium text-slate-800">{role}</dd>
              </div>
              {user?.department && (
                <div>
                  <dt className="text-slate-400">{t.dashboard.department}</dt>
                  <dd className="mt-1 font-medium text-slate-800">{user.department}</dd>
                </div>
              )}
              {user?.designation && (
                <div>
                  <dt className="text-slate-400">{t.dashboard.designation}</dt>
                  <dd className="mt-1 font-medium text-slate-800">{user.designation}</dd>
                </div>
              )}
              {user?.office && (
                <div>
                  <dt className="text-slate-400">{t.dashboard.office}</dt>
                  <dd className="mt-1 font-medium text-slate-800">{user.office}</dd>
                </div>
              )}
              {user?.district && (
                <div>
                  <dt className="text-slate-400">{t.dashboard.district}</dt>
                  <dd className="mt-1 font-medium text-slate-800">{user.district}</dd>
                </div>
              )}
              {user?.state && (
                <div>
                  <dt className="text-slate-400">{t.dashboard.state}</dt>
                  <dd className="mt-1 font-medium text-slate-800">{user.state}</dd>
                </div>
              )}
              {user?.studentId && (
                <div>
                  <dt className="text-slate-400">{t.dashboard.studentId}</dt>
                  <dd className="mt-1 font-medium text-slate-800">{user.studentId}</dd>
                </div>
              )}
            </dl>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
