import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save, Send } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";

const statusLabel = (value) => String(value || "UNKNOWN").replaceAll("_", " ");

export default function StudentProjectPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", technologies: "", estimatedCost: "", estimatedDuration: "", implementationPlan: "" });
  const [state, setState] = useState({ loading: true, error: "", notice: "" });
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    try {
      setState({ loading: true, error: "", notice: "" });
      const response = await api.get(`/student/projects/${projectId}`);
      const loadedProject = response.data.project;
      const currentTeam = loadedProject.studentTeams?.find((item) => item.id === loadedProject.studentTeamId) || loadedProject.studentTeams?.[0];
      const existing = currentTeam?.solutions?.[0];
      setProject(loadedProject);
      if (existing) {
        setForm({
          title: existing.title || "",
          description: existing.description || "",
          technologies: Array.isArray(existing.technologies) ? existing.technologies.join(", ") : "",
          estimatedCost: existing.estimatedCost || "",
          estimatedDuration: existing.estimatedDuration || "",
          implementationPlan: existing.implementationPlan || "",
        });
      }
      setState({ loading: false, error: "", notice: "" });
    } catch (error) {
      setState({ loading: false, error: error.response?.data?.message || "Unable to load this project.", notice: "" });
    }
  }, [projectId]);

  useEffect(() => { void load(); }, [load]);

  const team = project?.studentTeams?.find((item) => item.id === project.studentTeamId) || project?.studentTeams?.[0];
  const solution = team?.solutions?.[0];
  const canEdit = solution?.status !== "UNIVERSITY_APPROVED" && solution?.status !== "REJECTED";
  const isLeader = project.currentStudentRole === "LEADER";
  const members = useMemo(() => team?.members || [], [team]);

  const saveSolution = async (event, submit) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setState((current) => ({ ...current, error: "Solution title and description are required." }));
      return;
    }
    try {
      setBusy(submit ? "submit" : "save");
      await api.put(`/student/projects/${projectId}/solution`, {
        title: form.title.trim(),
        description: form.description.trim(),
        technologies: form.technologies.split(",").map((item) => item.trim()).filter(Boolean),
        estimatedCost: form.estimatedCost.trim() || null,
        estimatedDuration: form.estimatedDuration.trim() || null,
        implementationPlan: form.implementationPlan.trim() || null,
        submit,
      });
      await load();
      setState((current) => ({ ...current, notice: submit ? "Solution submitted for university review." : "Solution draft saved." }));
    } catch (error) {
      setState((current) => ({ ...current, error: error.response?.data?.message || "Unable to save the solution." }));
    } finally {
      setBusy("");
    }
  };

  if (state.loading) return <main className="min-h-screen bg-slate-50 p-8 text-slate-600">Loading project...</main>;
  if (!project) return <main className="min-h-screen bg-slate-50 p-8"><p className="text-rose-700">{state.error || "Project not found."}</p></main>;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700"><ArrowLeft size={16} /> Back to dashboard</Link>
        <section className="mt-5 rounded-3xl bg-slate-900 p-7 text-white">
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-emerald-300">{project.report?.category || "Civic project"}</p>
          <h1 className="mt-3 text-3xl font-bold">{project.report?.title || "Student project"}</h1>
          <p className="mt-3 text-slate-300">{project.report?.description || "No description available."}</p>
          <span className="mt-5 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{statusLabel(project.status)}</span>
        </section>
        {state.error && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{state.error}</p>}
        {state.notice && <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{state.notice}</p>}

        <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold">{team?.name || "My team"}</h2>
          <p className="mt-2 text-sm text-slate-600">{members.map((member) => `${member.student?.name}${member.role === "LEADER" ? " (Leader)" : " (Member)"}`).filter(Boolean).join(", ") || "Team members unavailable"}</p>
          <p className="mt-2 text-xs font-semibold text-slate-500">Your role: {statusLabel(project.currentStudentRole)}</p>
        </section>

        <form onSubmit={(event) => saveSolution(event, false)} className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-xl font-bold">Solution</h2><p className="mt-1 text-sm text-slate-500">{solution ? `Status: ${statusLabel(solution.status)}` : "Prepare a solution for this project."}</p></div>
          </div>
          <div className="mt-4 grid gap-4">
            <input disabled={!canEdit} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Solution title" className="rounded-lg border p-3" />
            <textarea disabled={!canEdit} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Describe your solution" className="min-h-32 rounded-lg border p-3" />
            <input disabled={!canEdit} value={form.technologies} onChange={(event) => setForm((current) => ({ ...current, technologies: event.target.value }))} placeholder="Technologies (comma separated)" className="rounded-lg border p-3" />
            <div className="grid gap-4 sm:grid-cols-2"><input disabled={!canEdit} value={form.estimatedCost} onChange={(event) => setForm((current) => ({ ...current, estimatedCost: event.target.value }))} placeholder="Estimated cost" className="rounded-lg border p-3" /><input disabled={!canEdit} value={form.estimatedDuration} onChange={(event) => setForm((current) => ({ ...current, estimatedDuration: event.target.value }))} placeholder="Estimated duration" className="rounded-lg border p-3" /></div>
            <textarea disabled={!canEdit} value={form.implementationPlan} onChange={(event) => setForm((current) => ({ ...current, implementationPlan: event.target.value }))} placeholder="Implementation plan" className="min-h-28 rounded-lg border p-3" />
          </div>
          {canEdit && <div className="mt-4 flex flex-wrap gap-3"><button disabled={busy} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold text-emerald-700"><Save size={16} /> Save draft</button>{isLeader && <button type="button" disabled={busy} onClick={(event) => saveSolution(event, true)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white"><Send size={16} /> Submit solution</button>}</div>}
        </form>
      </div>
    </main>
  );
}
