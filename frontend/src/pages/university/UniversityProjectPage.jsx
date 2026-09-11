import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Check, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";

const statusLabel = (value) => String(value || "UNKNOWN").replaceAll("_", " ");

export default function UniversityProjectPage() {
  const { projectId } = useParams();
  const [data, setData] = useState({ project: null, students: [] });
  const [teamName, setTeamName] = useState("");
  const [studentIds, setStudentIds] = useState([]);
  const [leaderId, setLeaderId] = useState("");
  const [state, setState] = useState({ loading: true, error: "", notice: "" });
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    try {
      setState({ loading: true, error: "", notice: "" });
      const response = await api.get(`/university/projects/${projectId}`);
      setData({ project: response.data.project, students: response.data.students || [] });
      setState({ loading: false, error: "", notice: "" });
    } catch (error) {
      setState({ loading: false, error: error.response?.data?.message || "Unable to load this project.", notice: "" });
    }
  }, [projectId]);

  useEffect(() => { void load(); }, [load]);

  const createTeam = async (event) => {
    event.preventDefault();
    if (!teamName.trim() || !studentIds.length) {
      setState((current) => ({ ...current, error: "Enter a team name and select at least one student." }));
      return;
    }
    const selectedLeaderId = leaderId || studentIds[0];
    if (!selectedLeaderId) {
      setState((current) => ({ ...current, error: "Select a team leader." }));
      return;
    }
    try {
      setBusy("team");
      await api.post(`/university/projects/${projectId}/teams`, { name: teamName.trim(), studentIds, leaderId: selectedLeaderId });
      setTeamName("");
      setStudentIds([]);
      setLeaderId("");
      await load();
      setState((current) => ({ ...current, notice: "Student team created successfully." }));
    } catch (error) {
      setState((current) => ({ ...current, error: error.response?.data?.message || "Unable to create the team." }));
    } finally {
      setBusy("");
    }
  };

  const reviewSolution = async (solutionId, action) => {
    try {
      setBusy(solutionId);
      await api.patch(`/university/solutions/${solutionId}/review`, { action });
      await load();
      setState((current) => ({ ...current, notice: "Solution review saved." }));
    } catch (error) {
      setState((current) => ({ ...current, error: error.response?.data?.message || "Unable to review the solution." }));
    } finally {
      setBusy("");
    }
  };

  if (state.loading) return <main className="min-h-screen bg-slate-50 p-8 text-slate-600">Loading project...</main>;
  if (!data.project) return <main className="min-h-screen bg-slate-50 p-8"><p className="text-rose-700">{state.error || "Project not found."}</p></main>;

  const { project } = data;
  const canCreateTeam = ["TEAM_FORMATION", "IN_PROGRESS"].includes(project.status);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <Link to="/university/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-700"><ArrowLeft size={16} /> Back to dashboard</Link>
        <section className="mt-5 rounded-3xl bg-indigo-950 p-7 text-white">
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-indigo-300">{project.report?.category || "Civic project"}</p>
          <h1 className="mt-3 text-3xl font-bold">{project.report?.title || "University project"}</h1>
          <p className="mt-3 text-indigo-100">{project.report?.description || "No description available."}</p>
          <span className="mt-5 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{statusLabel(project.status)}</span>
        </section>
        {state.error && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{state.error}</p>}
        {state.notice && <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{state.notice}</p>}

        <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold">Student team</h2>
          {project.studentTeams?.map((team) => <div key={team.id} className="mt-4 rounded-xl bg-indigo-50 p-4"><p className="font-bold">{team.name}</p><p className="mt-2 text-sm text-slate-600">{team.members?.map((member) => `${member.student?.name}${member.role === "LEADER" ? " (Leader)" : " (Member)"}`).join(", ") || "No members"}</p></div>)}
          {canCreateTeam && <form onSubmit={createTeam} className="mt-4 space-y-3"><input value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="Team name" className="w-full rounded-lg border p-3" /><div className="grid gap-2 sm:grid-cols-2">{data.students.map((student) => <label key={student.id} className="flex items-center gap-2 rounded-lg border p-3 text-sm"><input type="checkbox" checked={studentIds.includes(student.id)} onChange={(event) => setStudentIds((current) => event.target.checked ? [...current, student.id] : current.filter((id) => id !== student.id))} />{student.name} ({student.department || student.course || "Student"})</label>)}</div><select value={leaderId} onChange={(event) => setLeaderId(event.target.value)} className="w-full rounded-lg border p-3"><option value="">Select team leader</option>{data.students.filter((student) => studentIds.includes(student.id)).map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select><button disabled={busy === "team"} className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-4 py-2 text-sm font-bold text-white"><Users size={16} /> Create team</button></form>}
        </section>

        <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold">Solutions</h2>
          <div className="mt-4 space-y-4">{project.solutions?.map((solution) => <article key={solution.id} className="rounded-xl border p-4"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold">{solution.title}</h3><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800">{statusLabel(solution.status)}</span></div><p className="mt-2 text-sm text-slate-600">{solution.description}</p>{solution.status === "UNIVERSITY_REVIEW" && <div className="mt-4 flex gap-2"><button disabled={busy === solution.id} onClick={() => reviewSolution(solution.id, "approve")} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white"><Check size={15} /> Approve</button><button disabled={busy === solution.id} onClick={() => reviewSolution(solution.id, "request_changes")} className="rounded-lg border px-3 py-2 text-sm font-bold text-amber-700">Request changes</button><button disabled={busy === solution.id} onClick={() => reviewSolution(solution.id, "reject")} className="rounded-lg border px-3 py-2 text-sm font-bold text-rose-700">Reject</button></div>}</article>)}</div>
          {!project.solutions?.length && <p className="mt-4 text-sm text-slate-500">No solutions submitted yet.</p>}
        </section>
      </div>
    </main>
  );
}
