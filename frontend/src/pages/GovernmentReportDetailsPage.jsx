import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  MapPin,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import GovernmentLayout from "../components/government/GovernmentLayout";

export default function GovernmentReportDetailsPage() {
  const { reportId } = useParams();

  const [report, setReport] = useState(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedUniversityIds, setSelectedUniversityIds] = useState([]);
  const [selectionMessage, setSelectionMessage] = useState("");
  const [solutions, setSolutions] = useState([]);
  const [industryRecommendations, setIndustryRecommendations] = useState([]);
  const [selectedIndustryIds, setSelectedIndustryIds] = useState([]);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setError("");

        const response = await api.get(
          `/government/reports/${reportId}`
        );

        const loadedReport = response.data.report;
        setReport(loadedReport);
        setSelectedUniversityIds(
          (loadedReport.universityRecommendations || [])
            .filter((item) => item.status === "SELECTED")
            .map((item) => item.universityId)
        );
        if (loadedReport.status === "VERIFIED") {
          const solutionsResponse = await api.get(`/government/reports/${reportId}/solutions`);
          setSolutions(solutionsResponse.data.solutions || []);
          if ((solutionsResponse.data.solutions || []).some((solution) => solution.status === "APPROVED")) {
            const industryResponse = await api.get(`/government/reports/${reportId}/industries`);
            const recommendations = industryResponse.data.recommendations || [];
            setIndustryRecommendations(recommendations);
            setSelectedIndustryIds(recommendations.filter((item) => item.status === "SELECTED").map((item) => item.industryId));
          }
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load report."
        );
      }
    };

    loadReport();
  }, [reportId]);

  const review = async (status) => {
    try {
      setSaving(true);
      setError("");

      const response = await api.patch(
        `/government/reports/${reportId}/review`,
        {
          status,
          note,
        }
      );

      setReport((current) => ({
        ...current,
        ...response.data.report,
        status,
      }));

      setNote("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update report."
      );
    } finally {
      setSaving(false);
    }
  };

  const selectFinalSolution = async (solutionId) => {
    if (!window.confirm("Are you sure you want to select this solution as the final solution?")) return;
    try {
      setSaving(true); setError("");
      await api.patch(`/government/solutions/${solutionId}/select`);
      const response = await api.get(`/government/reports/${reportId}/solutions`);
      setSolutions(response.data.solutions || []);
      const industryResponse = await api.get(`/government/reports/${reportId}/industries`);
      setIndustryRecommendations(industryResponse.data.recommendations || []);
    } catch (err) { setError(err.response?.data?.message || "Unable to select final solution."); } finally { setSaving(false); }
  };

  const toggleIndustry = (industryId) => setSelectedIndustryIds((current) => current.includes(industryId) ? current.filter((id) => id !== industryId) : [...current, industryId]);
  const confirmIndustrySelection = async () => {
    if (!selectedIndustryIds.length || !window.confirm("Send collaboration invitations to the selected industries?")) return;
    try { setSaving(true); setError(""); const response = await api.patch(`/government/reports/${reportId}/industries`, { industryIds: selectedIndustryIds }); setIndustryRecommendations(response.data.recommendations || []); }
    catch (err) { setError(err.response?.data?.message || "Unable to select industries."); } finally { setSaving(false); }
  };

  const toggleUniversity = (universityId) => {
    setSelectedUniversityIds((current) =>
      current.includes(universityId)
        ? current.filter((id) => id !== universityId)
        : [...current, universityId]
    );
  };

  const confirmUniversitySelection = async () => {
    if (!selectedUniversityIds.length) {
      setError("Select at least one recommended university.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const response = await api.patch(
        `/government/reports/${reportId}/universities`,
        { universityIds: selectedUniversityIds, message: selectionMessage }
      );
      setReport((current) => ({
        ...current,
        universityRecommendations: response.data.recommendations,
      }));
      setSelectionMessage("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send university invitations.");
    } finally {
      setSaving(false);
    }
  };

  if (error || !report) {
    return (
      <GovernmentLayout title="Report Details">
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Loading report..."}
        </div>
      </GovernmentLayout>
    );
  }

  const location = [
    report.address,
    report.city,
    report.district,
    report.state,
    report.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const media = report.media || [];

  return (
    <GovernmentLayout title="Report Details">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">

        {/* MAIN */}
        <section className="border border-slate-200 border-t-4 border-t-emerald-700 bg-white p-6 shadow-sm">

          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            Report ID
          </p>

          <p className="mt-1 break-all font-mono text-sm text-slate-700">
            {report.id}
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-950">
            {report.title}
          </h2>

          {/* STATUS */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="bg-slate-100 px-3 py-1 font-bold">
              {report.category}
            </span>

            <span className="bg-amber-50 px-3 py-1 font-bold text-amber-800">
              {report.priority}
            </span>

            <span className="bg-emerald-50 px-3 py-1 font-bold text-emerald-800">
              {report.status}
            </span>
          </div>

          {/* DESCRIPTION */}
          <div className="mt-6 border-t border-slate-200 pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              Description
            </p>

            <p className="mt-2 leading-7 text-slate-700">
              {report.description}
            </p>

            <p className="mt-5 flex gap-2 text-sm text-slate-700">
              <MapPin
                size={17}
                className="mt-0.5 shrink-0 text-emerald-700"
              />

              {location || "Location unavailable"}
            </p>
          </div>

          {/* MEDIA */}
          {media.length > 0 && (
            <div className="mt-6 border-t border-slate-200 pt-5">
              <p className="text-sm font-bold text-slate-900">
                Evidence / Media
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {media.map((item) => {
                  const mediaUrl = item.url?.startsWith("http")
                    ? item.url
                    : `http://localhost:5000${item.url}`;

                  if (item.type === "VIDEO") {
                    return (
                      <div
                        key={item.id}
                        className="overflow-hidden border border-slate-200 bg-slate-50"
                      >
                        <video
                          src={mediaUrl}
                          controls
                          className="h-56 w-full object-cover"
                        />

                        <div className="flex items-center gap-2 p-3 text-xs font-semibold text-slate-600">
                          <Video size={15} />
                          {item.filename || "Video"}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      className="overflow-hidden border border-slate-200 bg-slate-50"
                    >
                      <img
                        src={mediaUrl}
                        alt={item.filename || "Report evidence"}
                        className="h-56 w-full object-cover"
                      />

                      <div className="flex items-center gap-2 p-3 text-xs font-semibold text-slate-600">
                        <ImageIcon size={15} />
                        {item.filename || "Image"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* GOVERNMENT REVIEW */}
          <div className="mt-6 border-t border-slate-200 pt-5">
            <p className="text-sm font-bold text-slate-900">
              Government Review
            </p>

            <textarea
              value={note}
              onChange={(event) =>
                setNote(event.target.value)
              }
              placeholder="Add a review note"
              className="mt-3 min-h-24 w-full border border-slate-300 p-3 text-sm outline-none focus:border-emerald-700"
            />

            <div className="mt-3 flex flex-wrap gap-2">

              {/* SUBMITTED */}
              {report.status === "SUBMITTED" && (
                <button
                  disabled={saving}
                  onClick={() => review("UNDER_REVIEW")}
                  className="bg-amber-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  Start Review
                </button>
              )}

              {/* UNDER REVIEW */}
              {report.status === "UNDER_REVIEW" && (
                <button
                  disabled={saving}
                  onClick={() => review("VERIFIED")}
                  className="bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  Verify
                </button>
              )}

              {/* REJECT */}
              {["SUBMITTED", "UNDER_REVIEW"].includes(
                report.status
              ) && (
                <button
                  disabled={saving}
                  onClick={() => review("REJECTED")}
                  className="bg-rose-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  Reject
                </button>
              )}
            </div>
          </div>

          {report.status === "VERIFIED" && (
            <div className="mt-6 border-t border-slate-200 pt-5">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">Recommended Universities</p>
                  <p className="mt-1 text-sm text-slate-600">Select one or more institutions, then confirm to send invitations.</p>
                </div>
                <span className="shrink-0 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">Selected: {selectedUniversityIds.length}</span>
              </div>

              <div className="mt-4 space-y-3">
                {(report.universityRecommendations || []).map((recommendation) => {
                  const selectable = ["RECOMMENDED", "SELECTED"].includes(recommendation.status);
                  const checked = selectedUniversityIds.includes(recommendation.universityId);
                  return (
                    <label key={recommendation.id} className={`flex gap-3 border p-4 ${selectable ? "cursor-pointer border-slate-200 hover:border-emerald-500" : "border-slate-100 bg-slate-50 opacity-70"}`}>
                      <input type="checkbox" checked={checked} disabled={!selectable || saving} onChange={() => toggleUniversity(recommendation.universityId)} className="mt-1 h-4 w-4 accent-emerald-700" />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center justify-between gap-2 font-bold text-slate-900">
                          {recommendation.university?.name || "University"}
                          <span className="text-sm text-emerald-700">{Number(recommendation.score || 0).toFixed(1)}%</span>
                        </span>
                        <span className="mt-1 block text-sm text-slate-600">{recommendation.reason || "Relevant university capabilities"}</span>
                        <span className="mt-2 block text-xs font-semibold text-slate-500">{[recommendation.university?.city, recommendation.university?.state].filter(Boolean).join(", ") || "Location unavailable"} · {recommendation.status}</span>
                      </span>
                    </label>
                  );
                })}
              </div>

              {(!report.universityRecommendations || report.universityRecommendations.length === 0) && <p className="mt-4 text-sm text-slate-500">No university recommendations are available yet.</p>}

              <textarea value={selectionMessage} onChange={(event) => setSelectionMessage(event.target.value)} placeholder="Optional message to selected universities" className="mt-4 min-h-20 w-full border border-slate-300 p-3 text-sm outline-none focus:border-emerald-700" />
              <button disabled={saving || selectedUniversityIds.length === 0} onClick={confirmUniversitySelection} className="mt-3 bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
                {saving ? "Sending invitations..." : "Confirm Selection"}
              </button>
            </div>
          )}

          {report.status === "VERIFIED" && solutions.length > 0 && <div className="mt-6 border-t border-slate-200 pt-5"><h3 className="text-lg font-bold text-slate-900">University-Approved Solutions</h3><div className="mt-4 space-y-4">{solutions.map((solution) => <article key={solution.id} className="border border-slate-200 p-4"><div className="flex flex-wrap justify-between gap-2"><h4 className="font-bold">{solution.title}</h4><span className="text-xs font-bold text-emerald-800">{solution.status}</span></div><p className="mt-2 text-sm text-slate-700">{solution.description}</p><p className="mt-3 text-sm"><b>University:</b> {solution.university.name} · <b>Team:</b> {solution.team.name}</p><p className="mt-1 text-sm"><b>Cost:</b> {solution.estimatedCost || "Not provided"} · <b>Duration:</b> {solution.estimatedDuration || "Not provided"}</p><p className="mt-1 text-sm"><b>Technologies:</b> {(solution.technologies || []).join(", ") || "Not provided"}</p>{solution.status === "UNIVERSITY_APPROVED" && <button disabled={saving} onClick={() => selectFinalSolution(solution.id)} className="mt-3 bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Select Final Solution</button>}</article>)}</div></div>}

          {industryRecommendations.length > 0 && <div className="mt-6 border-t border-slate-200 pt-5"><h3 className="text-lg font-bold text-slate-900">Industry Recommendations</h3><div className="mt-4 space-y-3">{industryRecommendations.map((item) => { const industry = item.industry; const eligible = item.status === "RECOMMENDED"; return <article key={item.id} className="border border-slate-200 p-4"><div className="flex flex-wrap justify-between gap-3"><div className="flex gap-3"><input aria-label={`Select ${industry.name}`} type="checkbox" disabled={!eligible} checked={selectedIndustryIds.includes(item.industryId)} onChange={() => toggleIndustry(item.industryId)} /><div><h4 className="font-bold">{industry.name}</h4><p className="text-xs text-slate-600">{[industry.area, industry.city, industry.district, industry.state].filter(Boolean).join(", ") || "Location unavailable"}</p></div></div><span className="text-xs font-bold text-emerald-800">{item.status} · {(Number(item.score) * 100).toFixed(1)}%</span></div><p className="mt-2 text-sm text-slate-700">{item.reason || "Semantic capability match"}</p><p className="mt-2 text-xs text-slate-600"><b>Skills:</b> {(industry.capabilities || []).filter((x) => /SKILL/i.test(x.type)).map((x) => x.value).join(", ") || "—"}</p><p className="mt-1 text-xs text-slate-600"><b>Technologies:</b> {(industry.capabilities || []).filter((x) => /TECH/i.test(x.type)).map((x) => x.value).join(", ") || "—"}</p><p className="mt-1 text-xs text-slate-600"><b>Services:</b> {(industry.capabilities || []).filter((x) => /SERVICE/i.test(x.type)).map((x) => x.value).join(", ") || "—"}</p></article>; })}</div>{industryRecommendations.some((item) => item.status === "RECOMMENDED") && <button disabled={saving || !selectedIndustryIds.length} onClick={confirmIndustrySelection} className="mt-4 bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Select Industries</button>}</div>}
        </section>

        {/* SIDEBAR */}
        <aside className="border border-slate-200 bg-white p-6 shadow-sm">

          <h3 className="font-bold text-slate-950">
            Timeline
          </h3>

          <div className="mt-5 space-y-5">
            {(report.statusHistory || []).map((entry) => (
              <div
                key={entry.id}
                className="border-l-2 border-emerald-200 pl-4"
              >
                <p className="font-bold text-slate-800">
                  {entry.status}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {entry.note || "Status updated"}
                </p>

                <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                  <Calendar size={12} />

                  {new Date(
                    entry.createdAt
                  ).toLocaleDateString("en-IN")}
                </p>
              </div>
            ))}

            {(!report.statusHistory ||
              report.statusHistory.length === 0) && (
              <p className="text-sm text-slate-500">
                No status history available.
              </p>
            )}
          </div>

          {/* SUPPORTERS */}
          <div className="mt-6 flex items-center gap-2 border border-slate-200 bg-slate-50 px-3 py-3 text-sm">
            <CheckCircle2
              size={16}
              className="text-emerald-700"
            />

            <strong>
              {report.supportCount || 0}
            </strong>

            citizen supporters
          </div>
        </aside>
      </div>
    </GovernmentLayout>
  );
}
