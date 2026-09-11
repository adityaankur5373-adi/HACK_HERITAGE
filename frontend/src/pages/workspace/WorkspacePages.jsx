import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import RoleLayout from "../../components/role/RoleLayout";
import useToast from "../../context/useToast";
import api from "../../services/api";
import useAuthStore from "../../store/authStore";

const label = (value) => String(value || "UNKNOWN").replaceAll("_", " ");

function Status({ value }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{label(value)}</span>;
}

function Loading({ text = "Loading..." }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">{text}</div>;
}

function ErrorState({ message, retry }) {
  return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700"><div className="flex flex-wrap items-center justify-between gap-3"><span>{message}</span><button type="button" onClick={retry} className="font-bold underline">Try again</button></div></div>;
}

function Empty({ title, text = "Nothing to show yet." }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><h2 className="font-bold text-slate-800">{title}</h2><p className="mt-2 text-sm text-slate-500">{text}</p></div>;
}

function useLoader(loader, initial) {
  const [data, setData] = useState(initial);
  const [state, setState] = useState({ loading: true, error: "" });
  const load = useCallback(async () => {
    setState({ loading: true, error: "" });
    try { setData(await loader()); setState({ loading: false, error: "" }); }
    catch (error) { setState({ loading: false, error: error.response?.data?.message || "Unable to load this page." }); }
  }, [loader]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);
  return { data, setData, state, load };
}

function ProfilePage({ role, title, endpoint, entity = "user" }) {
  const user = useAuthStore((state) => state.user);
  const loader = useCallback(async () => {
    if (!endpoint) return user || {};
    const response = await api.get(endpoint);
    return response.data[entity] || response.data.user || {};
  }, [endpoint, entity, user]);
  const { data, state, load } = useLoader(loader, user || {});
  return <RoleLayout role={role} title={title}>{state.error ? <ErrorState message={state.error} retry={load} /> : <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Your account details</p><dl className="mt-6 grid gap-4 sm:grid-cols-2">{Object.entries(data || {}).filter(([key, value]) => typeof value !== "object" && key !== "password").map(([key, value]) => <div key={key} className="rounded-xl bg-slate-50 p-4"><dt className="text-xs font-bold uppercase tracking-wider text-slate-500">{label(key)}</dt><dd className="mt-2 break-words text-sm font-semibold">{value || "-"}</dd></div>)}</dl></section>}</RoleLayout>;
}

function UnavailablePage({ role, title, message }) {
  return <RoleLayout role={role} title={title}><Empty title="Notifications are not available yet" text={message} /></RoleLayout>;
}

export function StudentProjectsPage() {
  const loader = useCallback(async () => (await api.get("/student/projects")).data.projects || [], []);
  const { data, state, load } = useLoader(loader, []);
  return <RoleLayout role="student" title="Projects"><div className="mb-6"><p className="text-sm text-slate-500">Projects assigned to your teams.</p></div>{state.loading ? <Loading text="Loading projects..." /> : state.error ? <ErrorState message={state.error} retry={load} /> : !data.length ? <Empty title="No projects yet" text="Projects will appear after you join a university team." /> : <div className="grid gap-4 lg:grid-cols-2">{data.map((project) => <article key={project.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{project.report?.category || "Civic project"}</p><h2 className="mt-2 text-lg font-bold">{project.report?.title || "Untitled project"}</h2></div><Status value={project.status} /></div><p className="mt-3 line-clamp-3 text-sm text-slate-600">{project.report?.description || "No description available."}</p><p className="mt-4 text-xs text-slate-500">{project.university?.name || "University"} · {project.studentTeams?.length || 0} team(s)</p><Link to={`/student/projects/${project.id}`} className="mt-5 inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white">Open project</Link></article>)}</div>}</RoleLayout>;
}

function studentData(loader) {
  return async () => {
    const projects = (await api.get("/student/projects")).data.projects || [];
    return loader(projects);
  };
}

export function StudentTeamsPage() {
  const loader = useMemo(() => studentData((projects) => projects.flatMap((project) => (project.studentTeams || []).map((team) => ({ ...team, project })))), []);
  const { data, state, load } = useLoader(loader, []);
  return <RoleLayout role="student" title="My teams">{state.loading ? <Loading text="Loading teams..." /> : state.error ? <ErrorState message={state.error} retry={load} /> : !data.length ? <Empty title="No teams yet" text="Your university will assign you to a project team." /> : <div className="grid gap-4 md:grid-cols-2">{data.map((team) => <article key={team.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><h2 className="font-bold">{team.name}</h2><Status value={team.project.status} /></div><p className="mt-2 text-sm text-slate-500">{team.project.report?.title || "Project"}</p><ul className="mt-4 space-y-2 text-sm text-slate-700">{(team.members || []).map((member) => <li key={member.id}>{member.student?.name || "Team member"} <span className="text-xs text-slate-400">({label(member.role)})</span></li>)}</ul></article>)}</div>}</RoleLayout>;
}

export function StudentSolutionsPage() {
  const loader = useMemo(() => studentData((projects) => projects.flatMap((project) => (project.solutions || []).map((solution) => ({ ...solution, project })))), []);
  const { data, state, load } = useLoader(loader, []);
  return <RoleLayout role="student" title="Solutions">{state.loading ? <Loading text="Loading solutions..." /> : state.error ? <ErrorState message={state.error} retry={load} /> : !data.length ? <Empty title="No solutions yet" text="Solutions submitted by your teams will appear here." /> : <div className="space-y-4">{data.map((solution) => <article key={solution.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">{solution.title}</h2><p className="mt-1 text-sm text-slate-500">{solution.project.report?.title || "Project"}</p></div><Status value={solution.status} /></div><p className="mt-4 text-sm text-slate-600">{solution.description}</p></article>)}</div>}</RoleLayout>;
}

export function StudentProfilePage() { return <ProfilePage role="student" title="Profile" />; }
export function StudentNotificationsPage() { return <UnavailablePage role="student" title="Notifications" message="There is no student notification endpoint in the current backend yet." />; }

export function UniversityInvitationsPage() {
  const loader = useCallback(async () => (await api.get("/university/invitations")).data.invitations || [], []);
  const { data, setData, state, load } = useLoader(loader, []);
  const toast = useToast();
  const [busy, setBusy] = useState("");
  const respond = async (id, action) => {
    try { setBusy(id); await api.patch(`/university/invitations/${id}/${action}`); setData((current) => current.map((item) => item.id === id ? { ...item, status: action === "accept" ? "ACCEPTED" : "DECLINED" } : item)); toast("Invitation updated successfully.", "success"); }
    catch (error) { toast(error.response?.data?.message || "Unable to update invitation.", "error"); }
    finally { setBusy(""); }
  };
  return <RoleLayout role="university" title="Invitations">{state.loading ? <Loading text="Loading invitations..." /> : state.error ? <ErrorState message={state.error} retry={load} /> : !data.length ? <Empty title="No collaboration invitations" /> : <div className="grid gap-4 lg:grid-cols-2">{data.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex justify-between gap-3"><h2 className="font-bold">{item.report?.title || "Community project"}</h2><Status value={item.status} /></div><p className="mt-3 text-sm text-slate-600">{item.report?.description || "No description available."}</p><p className="mt-3 text-xs text-slate-500">{item.invitedByGovernment?.department || "Government office"} · {item.invitedByGovernment?.office || "Office unavailable"}</p>{item.status === "INVITED" && <div className="mt-4 flex gap-3"><button type="button" disabled={busy === item.id} onClick={() => respond(item.id, "accept")} className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Accept</button><button type="button" disabled={busy === item.id} onClick={() => respond(item.id, "decline")} className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 disabled:opacity-50">Decline</button></div>}</article>)}</div>}</RoleLayout>;
}

function OpportunityCard({ item, role }) {
  const report = item.report || {};
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-wider text-indigo-700">{report.category || "Civic project"}</p><h2 className="mt-2 text-lg font-bold">{report.title || "Untitled report"}</h2></div>
      <Status value={item.status} />
    </div>
    <p className="mt-3 text-sm text-slate-600">{report.description || "No description available."}</p>
    <p className="mt-3 text-xs text-slate-500">{[report.address, report.city, report.district, report.state, report.pincode].filter(Boolean).join(" · ") || "Location not provided"}</p>
    <p className="mt-3 text-sm font-semibold text-slate-700">Match score: {typeof item.score === "number" ? item.score.toFixed(2) : "-"}</p>
    {item.reason && <p className="mt-2 text-sm text-slate-500">{item.reason}</p>}
    {role === "industry" && (report.universitySolutions || []).map((solution) => <div key={solution.id} className="mt-4 rounded-xl bg-teal-50 p-3 text-sm"><p className="font-bold">{solution.title}</p><p className="mt-1 text-slate-600">{solution.university?.name || "University solution"}</p></div>)}
  </article>;
}

export function UniversityOpportunitiesPage() {
  const loader = useCallback(async () => (await api.get("/university/opportunities")).data.opportunities || [], []);
  const { data, state, load } = useLoader(loader, []);
  return <RoleLayout role="university" title="Opportunities">{state.loading ? <Loading text="Loading opportunities..." /> : state.error ? <ErrorState message={state.error} retry={load} /> : !data.length ? <Empty title="No opportunities yet" text="Real university recommendations will appear here after government matching." /> : <div className="grid gap-4 lg:grid-cols-2">{data.map((item) => <OpportunityCard key={item.id} item={item} role="university" />)}</div>}</RoleLayout>;
}

export function UniversityProjectsPage() {
  const loader = useCallback(async () => (await api.get("/university/projects")).data.projects || [], []);
  const { data, state, load } = useLoader(loader, []);
  return <RoleLayout role="university" title="Projects">{state.loading ? <Loading text="Loading projects..." /> : state.error ? <ErrorState message={state.error} retry={load} /> : !data.length ? <Empty title="No accepted projects" text="Accept an invitation to start a project." /> : <div className="grid gap-4 lg:grid-cols-2">{data.map((project) => <article key={project.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex justify-between gap-3"><h2 className="font-bold">{project.report?.title || "Project"}</h2><Status value={project.status} /></div><p className="mt-3 text-sm text-slate-500">{project.studentTeams?.length || 0} teams · {(project.solutions || []).length} solutions</p><Link to={`/university/projects/${project.id}`} className="mt-5 inline-flex rounded-lg bg-indigo-700 px-4 py-2 text-sm font-bold text-white">Open project</Link></article>)}</div>}</RoleLayout>;
}

export function UniversitySolutionsPage() {
  const loader = useCallback(async () => {
    const projects = (await api.get("/university/projects")).data.projects || [];
    return projects.flatMap((project) => (project.solutions || []).map((solution) => ({ ...solution, project })));
  }, []);
  const { data, state, load } = useLoader(loader, []);
  return <RoleLayout role="university" title="Solutions">{state.loading ? <Loading text="Loading solutions..." /> : state.error ? <ErrorState message={state.error} retry={load} /> : !data.length ? <Empty title="No student solutions yet" text="Submitted team solutions will appear here for review." /> : <div className="space-y-4">{data.map((solution) => <article key={solution.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">{solution.title}</h2><p className="mt-1 text-sm text-slate-500">{solution.project?.report?.title || "Project"} · {solution.team?.name || "Team"}</p></div><Status value={solution.status} /></div><p className="mt-4 text-sm text-slate-600">{solution.description}</p><Link to={`/university/projects/${solution.projectId}`} className="mt-4 inline-flex rounded-lg bg-indigo-700 px-4 py-2 text-sm font-bold text-white">Review project</Link></article>)}</div>}</RoleLayout>;
}

export function UniversityCapabilitiesPage() {
  const loader = useCallback(async () => (await api.get("/university/capabilities")).data.capabilities || {}, []);
  const { data, state, load } = useLoader(loader, {});
  const [form, setForm] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  useEffect(() => {
    const timer = window.setTimeout(() => setForm(Object.entries(data).flatMap(([type, values]) => (values || []).map((value) => `${type}: ${value}`)).join("\n")), 0);
    return () => window.clearTimeout(timer);
  }, [data]);
  const save = async (event) => {
    event.preventDefault();
    const groups = { skills: [], researchAreas: [], technologies: [], departments: [] };
    const map = { SKILL: "skills", SKILLS: "skills", RESEARCH_AREA: "researchAreas", RESEARCH_AREAS: "researchAreas", TECHNOLOGY: "technologies", TECHNOLOGIES: "technologies", DEPARTMENT: "departments", DEPARTMENTS: "departments" };
    form.split("\n").forEach((line) => { const [type, ...rest] = line.split(":"); const value = rest.join(":").trim(); if (map[type?.trim().toUpperCase()] && value) groups[map[type.trim().toUpperCase()]].push(value); });
    if (!Object.values(groups).some((values) => values.length)) { toast("Add at least one capability as TYPE: value.", "error"); return; }
    try { setBusy(true); await api.post("/university/capabilities", groups); toast("Capabilities saved successfully.", "success"); await load(); }
    catch (error) { toast(error.response?.data?.message || "Unable to save capabilities.", "error"); }
    finally { setBusy(false); }
  };
  return <RoleLayout role="university" title="Capabilities">{state.loading ? <Loading /> : state.error ? <ErrorState message={state.error} retry={load} /> : <form onSubmit={save} className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">University capabilities</h2><p className="mt-2 text-sm text-slate-500">Use one entry per line: SKILL, RESEARCH_AREA, TECHNOLOGY or DEPARTMENT.</p><textarea value={form} onChange={(event) => setForm(event.target.value)} className="mt-5 min-h-48 w-full rounded-xl border border-slate-300 p-3 text-sm" /><button type="submit" disabled={busy} className="mt-4 rounded-lg bg-indigo-700 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? "Saving..." : "Save capabilities"}</button></form>}</RoleLayout>;
}

export function UniversityProfilePage() { return <ProfilePage role="university" title="Profile" />; }
export function UniversityNotificationsPage() {
  const loader = useCallback(async () => (await api.get("/university/notifications")).data.notifications || [], []);
  const { data, setData, state, load } = useLoader(loader, []);
  const toast = useToast();
  const markRead = async (item) => {
    try {
      const response = await api.patch(`/university/notifications/${item.id}/read`);
      setData((current) => current.map((entry) => entry.id === item.id ? response.data.notification : entry));
      toast("Notification marked as read.", "success");
    } catch (error) { toast(error.response?.data?.message || "Unable to update notification.", "error"); }
  };
  return <RoleLayout role="university" title="Notifications">{state.loading ? <Loading text="Loading notifications..." /> : state.error ? <ErrorState message={state.error} retry={load} /> : !data.length ? <Empty title="No notifications yet" /> : <div className="space-y-3">{data.map((item) => <article key={item.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${item.isRead ? "border-slate-200" : "border-indigo-300 bg-indigo-50/30"}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold">{item.title}</h2><p className="mt-1 text-sm text-slate-600">{item.message}</p><p className="mt-2 text-xs text-slate-500">{item.report?.title || "Related report"} · {new Date(item.createdAt).toLocaleString()}</p></div>{!item.isRead && <button type="button" onClick={() => markRead(item)} className="rounded-lg bg-indigo-700 px-3 py-2 text-xs font-bold text-white">Mark read</button>}</div></article>)}</div>}</RoleLayout>;
}

export function IndustryInvitationsPage() {
  const loader = useCallback(async () => (await api.get("/industry/invitations")).data.invitations || [], []);
  const { data, setData, state, load } = useLoader(loader, []);
  const [busy, setBusy] = useState("");
  const toast = useToast();
  const respond = async (id, action) => {
    try { setBusy(id); await api.patch(`/industry/invitations/${id}/${action}`); setData((current) => current.map((item) => item.id === id ? { ...item, status: action === "accept" ? "ACCEPTED" : "DECLINED" } : item)); toast("Invitation updated successfully.", "success"); }
    catch (error) { toast(error.response?.data?.message || "Unable to update invitation.", "error"); }
    finally { setBusy(""); }
  };
  return <RoleLayout role="industry" title="Invitations">{state.loading ? <Loading /> : state.error ? <ErrorState message={state.error} retry={load} /> : !data.length ? <Empty title="No collaboration invitations" /> : <div className="grid gap-4 lg:grid-cols-2">{data.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex justify-between gap-3"><h2 className="font-bold">{item.report?.title || "Community project"}</h2><Status value={item.status} /></div><p className="mt-3 text-sm text-slate-600">{item.report?.description || "No description available."}</p><p className="mt-3 text-xs text-slate-500">{item.invitedByGovernment?.department || "Government office"} · {item.invitedByGovernment?.office || "Office unavailable"}</p>{item.status === "INVITED" && <div className="mt-4 flex gap-3"><button type="button" disabled={busy === item.id} onClick={() => respond(item.id, "accept")} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Accept</button><button type="button" disabled={busy === item.id} onClick={() => respond(item.id, "decline")} className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700 disabled:opacity-50">Decline</button></div>}</article>)}</div>}</RoleLayout>;
}

export function IndustryContributionsPage() {
  const loader = useCallback(async () => (await api.get("/industry/contributions")).data.contributions || [], []);
  const { data, setData, state, load } = useLoader(loader, []);
  const [busy, setBusy] = useState("");
  const toast = useToast();
  const next = { PROPOSED: "ACCEPTED", ACCEPTED: "IN_PROGRESS", IN_PROGRESS: "COMPLETED" };
  const advance = async (item) => { try { setBusy(item.id); const response = await api.patch(`/industry/contributions/${item.id}`, { status: next[item.status] }); setData((current) => current.map((entry) => entry.id === item.id ? response.data.contribution : entry)); toast("Contribution status updated.", "success"); } catch (error) { toast(error.response?.data?.message || "Unable to update contribution.", "error"); } finally { setBusy(""); } };
  return <RoleLayout role="industry" title="Contributions">{state.loading ? <Loading /> : state.error ? <ErrorState message={state.error} retry={load} /> : !data.length ? <Empty title="No contributions yet" text="Accepted opportunities will appear here." /> : <div className="space-y-3">{data.map((item) => <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div><h2 className="font-bold">{item.type}</h2><p className="mt-1 text-sm text-slate-500">{item.project?.report?.title || "Project"}</p><p className="mt-2 text-sm text-slate-600">{item.description}</p></div><div className="flex items-center gap-3"><Status value={item.status} />{next[item.status] && <button type="button" disabled={busy === item.id} onClick={() => advance(item)} className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{busy === item.id ? "Saving..." : `Mark ${label(next[item.status])}`}</button>}</div></article>)}</div>}</RoleLayout>;
}

export function IndustryOpportunitiesPage() {
  const loader = useCallback(async () => (await api.get("/industry/opportunities")).data.opportunities || [], []);
  const { data, state, load } = useLoader(loader, []);
  return <RoleLayout role="industry" title="Opportunities">{state.loading ? <Loading text="Loading opportunities..." /> : state.error ? <ErrorState message={state.error} retry={load} /> : !data.length ? <Empty title="No opportunities yet" text="Real industry recommendations will appear here after an approved solution is matched." /> : <div className="grid gap-4 lg:grid-cols-2">{data.map((item) => <OpportunityCard key={item.id} item={item} role="industry" />)}</div>}</RoleLayout>;
}

export function IndustryCapabilitiesPage() {
  const loader = useCallback(async () => (await api.get("/industry/capabilities")).data.capabilities || [], []);
  const { data, setData, state, load } = useLoader(loader, []);
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const save = async (event) => { event.preventDefault(); const capabilities = data.filter((item) => item.type?.trim() && item.value?.trim()); if (!capabilities.length) { toast("Add at least one capability.", "error"); return; } try { setBusy(true); await api.put("/industry/capabilities", { capabilities }); toast("Capabilities saved successfully.", "success"); await load(); } catch (error) { toast(error.response?.data?.message || "Unable to save capabilities.", "error"); } finally { setBusy(false); } };
  const update = (index, key, value) => setData((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  return <RoleLayout role="industry" title="Capabilities">{state.loading ? <Loading /> : state.error ? <ErrorState message={state.error} retry={load} /> : <form onSubmit={save} className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Industry capabilities</h2><div className="mt-5 space-y-3">{data.map((item, index) => <div key={item.id || index} className="grid gap-3 sm:grid-cols-2"><input value={item.type || ""} onChange={(event) => update(index, "type", event.target.value)} placeholder="Type" className="rounded-lg border p-3 text-sm" /><input value={item.value || ""} onChange={(event) => update(index, "value", event.target.value)} placeholder="Capability" className="rounded-lg border p-3 text-sm" /></div>)}<button type="button" onClick={() => setData((current) => [...current, { type: "", value: "" }])} className="text-sm font-bold text-teal-700">+ Add capability</button></div><button type="submit" disabled={busy} className="mt-5 rounded-lg bg-teal-700 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? "Saving..." : "Save capabilities"}</button></form>}</RoleLayout>;
}

export function IndustryProfilePage() {
  const loader = useCallback(async () => (await api.get("/industry/profile")).data.industry || {}, []);
  const { data, setData, state, load } = useLoader(loader, {});
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const fields = ["name", "description", "address", "area", "city", "district", "state", "pincode", "phone", "website"];
  const save = async (event) => { event.preventDefault(); try { setBusy(true); await api.patch("/industry/profile", data); toast("Profile updated successfully.", "success"); await load(); } catch (error) { toast(error.response?.data?.message || "Unable to update profile.", "error"); } finally { setBusy(false); } };
  return <RoleLayout role="industry" title="Profile">{state.loading ? <Loading /> : state.error ? <ErrorState message={state.error} retry={load} /> : <form onSubmit={save} className="max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Industry profile</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">{fields.map((field) => <label key={field} className="text-sm font-semibold text-slate-700">{label(field)}<input value={data[field] || ""} onChange={(event) => setData((current) => ({ ...current, [field]: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 p-3 font-normal" /></label>)}</div><button type="submit" disabled={busy} className="mt-5 rounded-lg bg-teal-700 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? "Saving..." : "Save profile"}</button></form>}</RoleLayout>;
}

export function IndustryNotificationsPage() { return <UnavailablePage role="industry" title="Notifications" message="There is no industry notification endpoint in the current backend yet." />; }
