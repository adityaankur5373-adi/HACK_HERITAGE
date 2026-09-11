import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Clock3, LogOut, Users } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import useAuthStore from "../../store/authStore";

const statusLabel = (value) => String(value || "UNKNOWN").replaceAll("_", " ");

export default function StudentDashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [projects, setProjects] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });

  const load = async () => {
    try {
      const response = await api.get("/student/projects");
      setProjects(response.data.projects || []);
    } catch (error) {
      setState({ loading: false, error: error.response?.data?.message || "Unable to load your dashboard." });
      return;
    }
    setState({ loading: false, error: "" });
  };

  useEffect(() => { void Promise.resolve().then(load); }, []);
  const solutions = useMemo(() => projects.flatMap((project) => project.solutions || []), [projects]);
  const teams = useMemo(() => projects.flatMap((project) => project.studentTeams || []), [projects]);
  const approved = solutions.filter((solution) => solution.status === "UNIVERSITY_APPROVED" || solution.status === "APPROVED").length;

  return <DashboardShell title={`Welcome back, ${user?.name || "Student"}`} subtitle="Track your projects, teams and solutions for real community problems." logout={logout}>
    {state.error && <Alert message={state.error} onRetry={load} />}
    <Stats items={[
      ["Active Projects", projects.length, BookOpen],
      ["My Teams", teams.length, Users],
      ["Solutions Submitted", solutions.filter((solution) => solution.status !== "DRAFT").length, Clock3],
      ["Approved Solutions", approved, CheckCircle2],
    ]} />
    <section className="mt-8"><SectionHeading title="My projects" /><div className="mt-4 grid gap-5 lg:grid-cols-2">
      {!state.loading && projects.map((project) => <ProjectCard key={project.id} project={project} />)}
      {state.loading && <Loading />}
      {!state.loading && !projects.length && <Empty title="No projects yet" text="Projects related to verified community problems will appear here." />}
    </div></section>
    <section className="mt-8"><SectionHeading title="Submitted solutions" /><div className="mt-4 grid gap-4 md:grid-cols-2">
      {solutions.map((solution) => <article key={solution.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex justify-between gap-3"><h3 className="font-bold">{solution.title}</h3><Badge value={solution.status} /></div><p className="mt-2 text-sm text-slate-500">{projects.find((project) => project.id === solution.projectId)?.report?.title || "Project solution"}</p><p className="mt-3 line-clamp-2 text-sm text-slate-600">{solution.description}</p></article>)}
      {!state.loading && !solutions.length && <Empty title="No solutions submitted yet" text="Your submitted solutions will appear here." />}
    </div></section>
  </DashboardShell>;
}

function ProjectCard({ project }) {
  const team = project.studentTeams?.[0];
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{project.report?.category || "Civic problem"}</p><h3 className="mt-2 text-lg font-bold">{project.report?.title || "Untitled project"}</h3></div><Badge value={project.status} /></div><p className="mt-3 line-clamp-2 text-sm text-slate-600">{project.report?.description || "No description available."}</p><div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500"><span>{project.university?.name || "University"}</span><span>{team?.name || "Team formation pending"}</span><span>{team?.members?.length || 0} members</span></div><Link to={`/student/projects/${project.id}`} className="mt-5 inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white">View project</Link></article>;
}

function DashboardShell({ title, subtitle, children, logout }) { return <main className="min-h-screen bg-slate-50 text-slate-900"><header className="border-b bg-white px-4 py-4 sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><Link to="/student/dashboard" className="flex items-center gap-3"><span className="rounded-xl bg-emerald-700 p-2 text-white"><BookOpen size={19} /></span><span><b className="block">JanSamadhan</b><small className="text-slate-500">Student workspace</small></span></Link><button onClick={logout} className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700"><LogOut size={16} /> Logout</button></div></header><div className="mx-auto max-w-7xl px-4 py-8 sm:px-8"><section className="rounded-3xl bg-slate-900 p-7 text-white sm:p-10"><p className="text-sm font-semibold uppercase tracking-[.18em] text-emerald-300">Student dashboard</p><h1 className="mt-3 text-3xl font-bold sm:text-4xl">{title}</h1><p className="mt-3 text-slate-300">{subtitle}</p></section>{children}</div></main>; }
function Stats({ items }) { return <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map(([label, value, Icon]) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Icon size={20} className="text-emerald-700" /><p className="mt-4 text-3xl font-bold">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></article>)}</section>; }
function SectionHeading({ title }) { return <h2 className="text-2xl font-bold">{title}</h2>; }
function Badge({ value }) { return <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{statusLabel(value)}</span>; }
function Empty({ title, text }) { return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 md:col-span-2"><h3 className="font-bold text-slate-700">{title}</h3><p className="mt-2 text-sm">{text}</p></div>; }
function Loading() { return <div className="animate-pulse rounded-2xl bg-white p-8 text-slate-400">Loading your projects...</div>; }
function Alert({ message, onRetry }) { return <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><span>{message}</span><button onClick={onRetry} className="font-bold underline">Retry</button></div>; }
