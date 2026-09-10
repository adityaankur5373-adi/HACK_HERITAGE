import { useState } from "react";
import {
  BarChart3,
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCircle2,
  X,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { useLanguage } from "../../context/LanguageContext";

const items = [
  {
    label: "Dashboard",
    path: "/government/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Reports",
    path: "/government/reports",
    icon: FileText,
  },
  {
    label: "Notifications",
    path: "/government/notifications",
    icon: Bell,
  },
  {
    label: "Analytics",
    path: "/government/analytics",
    icon: BarChart3,
  },
  {
    label: "Profile",
    path: "/government/profile",
    icon: UserCircle2,
  },
];

export default function GovernmentLayout({
  title,
  children,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const { logout, user } = useAuthStore();
  const { t } = useLanguage();

  const [open, setOpen] = useState(false);

  const signOut = () => {
    logout();
    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-800">

      {/* =========================================================
          SIDEBAR
      ========================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white shadow-xl transition-transform lg:translate-x-0 ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* =====================================================
            SIDEBAR HEADER
        ====================================================== */}

        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">

          <button
            type="button"
            onClick={() =>
              navigate("/government/dashboard")
            }
            className="text-left"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
              JanSamadhan
            </p>

            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
              Government Operations
            </p>
          </button>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>

        </div>

        {/* =====================================================
            DEPARTMENT
        ====================================================== */}

        <div className="border-b border-slate-200 px-6 py-4">

          <p className="text-xs text-slate-500">
            Department
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            {user?.department ||
              "Government"}
          </p>

        </div>

        {/* =====================================================
            NAVIGATION
        ====================================================== */}

        <nav className="space-y-1 px-4 py-6">

          {items.map(
            ({
              label,
              path,
              icon: Icon,
            }) => {

              const active =
                location.pathname.startsWith(
                  path
                );

              return (
                <button
                  key={path}
                  type="button"
                  onClick={() => {
                    navigate(path);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 border-l-4 px-4 py-3 text-left text-sm font-semibold transition ${
                    active
                      ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                      : "border-transparent text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={18} />

                  {label}
                </button>
              );
            }
          )}

          {/* ===================================================
              LOGOUT
          ==================================================== */}

          <button
            type="button"
            onClick={signOut}
            className="mt-8 flex w-full items-center gap-3 border-l-4 border-transparent px-4 py-3 text-left text-sm font-semibold text-slate-600 transition hover:border-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={18} />

            {t.dashboard.logout}
          </button>

        </nav>
      </aside>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}

      <div className="lg:ml-72">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">

          <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-md border border-slate-200 p-2 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
                JanSamadhan
              </p>

              <h1 className="text-xl font-bold text-slate-950">
                {title}
              </h1>

            </div>

          </div>

        </header>

        {/* =====================================================
            PAGE CONTENT
        ====================================================== */}

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>

      </div>

    </div>
  );
}