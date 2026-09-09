import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCircle2,
  X,
} from "lucide-react";

import useAuthStore from "../../store/authStore";
import { useLanguage } from "../../context/LanguageContext";

const navItems = [
  { key: "dashboard", path: "/citizen/dashboard", icon: LayoutDashboard },
  { key: "report", path: "/citizen/report-problem", icon: FileText },
  { key: "myProblems", path: "/citizen/my-problems", icon: FileText },
  { key: "profile", path: "/citizen/profile", icon: UserCircle2 },
];

function CitizenLayout({ title, children, actions }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { language, changeLanguage, t } = useLanguage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const nav = useMemo(
    () => ({
      dashboard: t.citizen?.nav?.dashboard || "Dashboard",
      report: t.citizen?.nav?.reportProblem || "Report Problem",
      myProblems: t.citizen?.nav?.myProblems || "My Problems",
      profile: t.citizen?.nav?.profile || "Profile",
      logout: t.citizen?.nav?.logout || "Logout",
      languageLabel: t.citizen?.nav?.language || "Language",
    }),
    [t]
  );

  const signOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const activePage = navItems.find((item) => location.pathname.startsWith(item.path));

  return (
    <div className="relative min-h-screen bg-[#f4f7f5] text-slate-800">
      <div className="fixed inset-0 -z-10">
        <img src="/images/login.png" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#f4f7f5]/95" />
      </div>

      <div className="relative flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white text-slate-700 shadow-xl transition-transform duration-200 ${drawerOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">JanSamadhan</p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Citizen Services</p>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 hover:bg-emerald-50 lg:hidden"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="space-y-1 px-4 py-6">
            {navItems.map(({ key, path, icon: Icon }) => {
              const isActive = location.pathname === path || (key === "dashboard" && location.pathname === "/citizen");

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    navigate(path);
                    setDrawerOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 border-l-4 px-4 py-3 text-left text-sm font-semibold transition ${isActive ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-emerald-800"}`}
                >
                  <Icon size={18} />
                  <span>{nav[key]}</span>
                </button>
              );
            })}

            <div className="mt-8 border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={signOut}
                className="flex w-full items-center gap-3 border-l-4 border-transparent px-4 py-3 text-left text-sm font-semibold text-slate-600 transition hover:border-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut size={18} />
                <span>{nav.logout}</span>
              </button>
            </div>
          </nav>
        </aside>

        {drawerOpen && (
          <button
            type="button"
            aria-label="Close mobile overlay"
            className="fixed inset-0 z-30 bg-slate-900/20 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        <div className="min-w-0 flex-1 lg:ml-72">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="rounded-md border border-slate-200 bg-white p-2 text-slate-700 shadow-sm lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu size={18} />
                </button>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">{t.login?.badge || "JanSamadhan"}</p>
                  <h1 className="text-lg font-bold text-slate-900 sm:text-xl">{title}</h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-1 border border-slate-200 bg-slate-50 p-1 shadow-sm sm:flex">
                  <button
                    type="button"
                    onClick={() => changeLanguage("hi")}
                    className={`px-3 py-1.5 text-xs font-bold ${language === "hi" ? "bg-emerald-700 text-white" : "text-slate-600"}`}
                  >
                    हिन्दी
                  </button>
                  <button
                    type="button"
                    onClick={() => changeLanguage("en")}
                    className={`px-3 py-1.5 text-xs font-bold ${language === "en" ? "bg-emerald-700 text-white" : "text-slate-600"}`}
                  >
                    English
                  </button>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((current) => !current)}
                    className="flex items-center gap-2 border border-slate-200 bg-white px-2 py-1.5 shadow-sm"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
                      {user?.name?.charAt(0)?.toUpperCase() || "C"}
                    </div>
                    <div className="hidden text-left sm:block">
                      <p className="text-sm font-semibold text-slate-800">{user?.name || "Citizen"}</p>
                    </div>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-14 z-30 min-w-40 border border-slate-200 bg-white p-2 shadow-xl">
                      <button
                        type="button"
                        onClick={() => {
                          navigate("/citizen/profile");
                          setProfileOpen(false);
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50"
                      >
                        <span>{nav.profile}</span>
                        <ArrowRight size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          signOut();
                          setProfileOpen(false);
                        }}
                        className="mt-1 flex w-full items-center justify-between px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <span>{nav.logout}</span>
                        <LogOut size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            {actions && <div className="mb-6 flex items-center justify-end">{actions}</div>}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default CitizenLayout;
