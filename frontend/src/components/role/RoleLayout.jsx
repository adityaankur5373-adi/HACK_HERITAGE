import { useState } from "react";
import { Bell, BriefcaseBusiness, Building2, CheckSquare, CircleUserRound, FolderKanban, GraduationCap, LayoutDashboard, LogOut, Menu, Network, Settings2, Users, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const roleConfig = {
  student: { label: "Student workspace", accent: "bg-emerald-700", active: "border-emerald-700 bg-emerald-50 text-emerald-900", icon: GraduationCap, links: [["Dashboard", "/student/dashboard", LayoutDashboard], ["Projects", "/student/projects", FolderKanban], ["Teams", "/student/teams", Users], ["Solutions", "/student/solutions", CheckSquare], ["Profile", "/student/profile", CircleUserRound], ["Notifications", "/student/notifications", Bell]] },
  university: { label: "University workspace", accent: "bg-indigo-700", active: "border-indigo-700 bg-indigo-50 text-indigo-900", icon: Building2, links: [["Dashboard", "/university/dashboard", LayoutDashboard], ["Opportunities", "/university/opportunities", BriefcaseBusiness], ["Invitations", "/university/invitations", Network], ["Projects", "/university/projects", FolderKanban], ["Solutions", "/university/solutions", CheckSquare], ["Capabilities", "/university/capabilities", Settings2], ["Profile", "/university/profile", CircleUserRound], ["Notifications", "/university/notifications", Bell]] },
  industry: { label: "Industry workspace", accent: "bg-teal-700", active: "border-teal-700 bg-teal-50 text-teal-900", icon: BriefcaseBusiness, links: [["Dashboard", "/industry/dashboard", LayoutDashboard], ["Opportunities", "/industry/opportunities", BriefcaseBusiness], ["Invitations", "/industry/invitations", Network], ["Contributions", "/industry/contributions", FolderKanban], ["Capabilities", "/industry/capabilities", Settings2], ["Profile", "/industry/profile", CircleUserRound], ["Notifications", "/industry/notifications", Bell]] },
};

export default function RoleLayout({ role, title, children }) {
  const config = roleConfig[role];
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const Icon = config.icon;
  const signOut = () => { logout(); navigate("/login", { replace: true }); };
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6"><button type="button" onClick={() => navigate(`/${role}/dashboard`)} className="flex items-center gap-3 text-left"><span className={`rounded-xl ${config.accent} p-2 text-white`}><Icon size={19} /></span><span><b className="block">JanSamadhan</b><small className="text-xs text-slate-500">{config.label}</small></span></button><button type="button" className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
        <div className="border-b border-slate-200 px-6 py-4"><p className="text-xs uppercase tracking-wider text-slate-400">{role}</p><p className="mt-1 truncate font-semibold">{user?.name || user?.email || "Workspace member"}</p></div>
        <nav className="flex-1 space-y-1 px-4 py-6">{config.links.map(([label, path, LinkIcon]) => <NavLink key={path} to={path} end={path.endsWith("dashboard")} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-lg border-l-4 px-4 py-3 text-sm font-semibold transition ${isActive ? config.active : "border-transparent text-slate-600 hover:bg-slate-50"}`}><LinkIcon size={18} />{label}</NavLink>)}</nav>
        <div className="border-t border-slate-200 p-4"><button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-rose-50 hover:text-rose-700"><LogOut size={18} /> Sign out</button></div>
      </aside>
      <div className="lg:ml-72"><header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-8"><button type="button" onClick={() => setOpen(true)} className="rounded-lg border border-slate-200 p-2 lg:hidden" aria-label="Open navigation"><Menu size={18} /></button><div><p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">{config.label}</p><h1 className="text-xl font-bold">{title}</h1></div></header><main className="px-4 py-6 sm:px-8">{children}</main></div>
    </div>
  );
}
