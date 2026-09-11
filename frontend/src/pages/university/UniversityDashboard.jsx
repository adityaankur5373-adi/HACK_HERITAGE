import { useEffect, useMemo, useState } from "react";
import { Building2, Check, GraduationCap, LogOut, X } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import useAuthStore from "../../store/authStore";
import useToast from "../../context/useToast";

const label = (value) => String(value || "UNKNOWN").replaceAll("_", " ");
const capabilityLines = (groups) => Object.entries(groups || {})
  .flatMap(([group, values]) => (Array.isArray(values) ? values.map((value) => `${group}: ${value}`) : []))
  .join("\n");

const capabilityGroups = (text) => {
  const groups = {
    skills: [],
    researchAreas: [],
    technologies: [],
    departments: [],
  };
  const typeMap = {
    SKILL: "skills",
    SKILLS: "skills",
    RESEARCH_AREA: "researchAreas",
    RESEARCH_AREAS: "researchAreas",
    TECHNOLOGY: "technologies",
    TECHNOLOGIES: "technologies",
    DEPARTMENT: "departments",
    DEPARTMENTS: "departments",
  };
  text.split("\n").forEach((line) => {
    const [type, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    const group = typeMap[type?.trim().toUpperCase()];
    if (group && value && !groups[group].includes(value)) groups[group].push(value);
  });
  return groups;
};

export default function UniversityDashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [data, setData] = useState({ invitations: [], projects: [], capabilities: [] });
  const [editing, setEditing] = useState(false);
  const [capabilities, setCapabilities] = useState("");
  const [busy, setBusy] = useState("");
  const [state, setState] = useState({ loading: true, error: "", notice: "" });
  const toast = useToast();
  const load = async () => { try { setState({ loading: true, error: "", notice: "" }); const [i, p, c] = await Promise.all([api.get("/university/invitations"), api.get("/university/projects"), api.get("/university/capabilities")]); const groups = c.data.capabilities || {}; const items = Object.entries(groups).flatMap(([type, values]) => (Array.isArray(values) ? values.map((value, index) => ({ id: `${type}-${index}`, type, value })) : [])); setData({ invitations: i.data.invitations || [], projects: p.data.projects || [], capabilities: items }); setCapabilities(capabilityLines(groups)); setState({ loading: false, error: "", notice: "" }); } catch (error) { setState({ loading: false, error: error.response?.data?.message || "Unable to load your dashboard.", notice: "" }); } };
  useEffect(() => { load(); }, []);
  const reviewCount = useMemo(() => data.projects.reduce((count, project) => count + (project.solutions || []).filter((solution) => solution.status === "UNIVERSITY_REVIEW").length, 0), [data.projects]);
  const respond = async (id, action) => { try { setBusy(id); await api.patch(`/university/invitations/${id}/${action}`); toast("Collaboration request updated.", "success"); await load(); } catch (error) { toast(error.response?.data?.message || "Unable to update collaboration request.", "error"); setState((current) => ({ ...current, error: error.response?.data?.message || "Unable to update collaboration request." })); } finally { setBusy(""); } };
  const saveCapabilities = async (event) => { event.preventDefault(); const groups = capabilityGroups(capabilities); if (!Object.values(groups).some((values) => values.length)) { setState((current) => ({ ...current, error: "Add at least one capability using TYPE: value." })); return; } try { setBusy("capabilities"); const response = await api.post("/university/capabilities", groups); setState({ loading: false, error: "", notice: response.data.embeddingStatus === "FAILED" ? "Capabilities saved, but AI synchronization is pending." : "Capabilities updated successfully." }); setEditing(false); await load(); } catch (error) { setState((current) => ({ ...current, error: error.response?.data?.message || "Unable to save capabilities." })); } finally { setBusy(""); } };
  return <main className="min-h-screen bg-slate-50 text-slate-900"><header className="border-b bg-white px-4 py-4 sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><Link to="/university/dashboard" className="flex items-center gap-3"><span className="rounded-xl bg-indigo-700 p-2 text-white"><Building2 size={19} /></span><span><b className="block">JanSamadhan</b><small className="text-slate-500">University workspace</small></span></Link><button onClick={logout} className="flex items-center gap-2 text-sm font-semibold text-slate-600"><LogOut size={16} /> Logout</button></div></header><div className="mx-auto max-w-7xl px-4 py-8 sm:px-8"><section className="rounded-3xl bg-indigo-950 p-7 text-white sm:p-10"><p className="text-sm font-semibold uppercase tracking-[.18em] text-indigo-300">University dashboard</p><h1 className="mt-3 text-3xl font-bold sm:text-4xl">Welcome back, {user?.name || "University"}</h1><p className="mt-3 text-indigo-100">Discover community problems, build student teams and collaborate on solutions.</p></section>{state.error && <Alert message={state.error} onRetry={load} />}{state.notice && <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{state.notice}</p>}<section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat title="Collaboration requests" value={data.invitations.filter((item) => item.status === "INVITED").length} /><Stat title="Accepted projects" value={data.projects.length} /><Stat title="Solutions to review" value={reviewCount} /><Stat title="Capabilities" value={data.capabilities.length} /></section><section className="mt-8"><h2 className="text-2xl font-bold">Collaboration requests</h2><div className="mt-4 grid gap-4 lg:grid-cols-2">{data.invitations.map((item) => <article key={item.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex justify-between gap-3"><h3 className="font-bold">{item.report?.title}</h3><Badge value={item.status} /></div><p className="mt-3 text-sm text-slate-600">{item.report?.description}</p><p className="mt-3 text-xs text-slate-500">{item.invitedByGovernment?.department || "Government office"} · {item.invitedByGovernment?.office || "Office unavailable"}</p>{item.status === "INVITED" && <div className="mt-4 flex gap-3"><button disabled={busy === item.id} onClick={() => respond(item.id, "accept")} className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-3 py-2 text-sm font-bold text-white"><Check size={15} /> Accept</button><button disabled={busy === item.id} onClick={() => respond(item.id, "decline")} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700"><X size={15} /> Decline</button></div>}</article>)}{!state.loading && !data.invitations.length && <Empty title="No collaboration requests yet" />}</div></section><section className="mt-8"><h2 className="text-2xl font-bold">Active projects</h2><div className="mt-4 grid gap-4 lg:grid-cols-2">{data.projects.map((project) => <article key={project.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex justify-between gap-3"><h3 className="font-bold">{project.report?.title}</h3><Badge value={project.status} /></div><p className="mt-3 text-sm text-slate-500">{project.studentTeams?.length || 0} teams · {(project.solutions || []).length} solutions</p><Link to={`/university/projects/${project.id}`} className="mt-4 inline-block rounded-lg bg-indigo-700 px-4 py-2 text-sm font-bold text-white">Open project</Link></article>)}</div></section><section className="mt-8 rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold">University capabilities</h2><p className="mt-1 text-sm text-slate-500">One capability per line: TYPE: value</p></div><button onClick={() => setEditing(!editing)} className="text-sm font-bold text-indigo-700">{editing ? "Cancel" : "Edit"}</button></div>{editing ? <form onSubmit={saveCapabilities}><textarea value={capabilities} onChange={(event) => setCapabilities(event.target.value)} className="mt-4 min-h-28 w-full rounded-lg border p-3 text-sm" /><button disabled={busy === "capabilities"} className="mt-3 rounded-lg bg-indigo-700 px-4 py-2 text-sm font-bold text-white">Save capabilities</button></form> : <div className="mt-4 flex flex-wrap gap-2">{data.capabilities.map((item) => <span key={item.id} className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-800">{item.type}: {item.value}</span>)}{!data.capabilities.length && <p className="text-sm text-slate-500">No capabilities added yet.</p>}</div>}</section></div></main>;
}
function Stat({ title, value }) { return <article className="rounded-2xl border bg-white p-5 shadow-sm"><GraduationCap size={19} className="text-indigo-700" /><p className="mt-4 text-3xl font-bold">{value}</p><p className="mt-1 text-sm text-slate-500">{title}</p></article>; }
function Badge({ value }) { return <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800">{label(value)}</span>; }
function Empty({ title }) { return <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500 lg:col-span-2">{title}</div>; }
function Alert({ message, onRetry }) { return <div className="mt-5 flex justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><span>{message}</span><button onClick={onRetry} className="font-bold underline">Retry</button></div>; }
