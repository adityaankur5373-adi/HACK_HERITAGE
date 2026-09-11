import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Calendar, CheckCircle2, Edit3, LoaderCircle, ThumbsUp } from "lucide-react";

import CitizenLayout from "../components/citizen/CitizenLayout";
import api from "../services/api";
import useLanguage from "../context/useLanguage";
import { formatDate, getStatusTone, readReports } from "../utils/citizenStorage";

const API_ORIGIN = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

function getMediaUrl(url) {
  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${API_ORIGIN}/${url.replace(/^\//, "")}`;
}

function ProblemDetailsPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [supportCount, setSupportCount] = useState(0);
  const [supportedByMe, setSupportedByMe] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchReport = async () => {
      try {
        setLoading(true);
        setError("");

        try {
          const response = await api.get(`/reports/${reportId}`);
          const data = response.data?.report || response.data;

          if (!active) return;

          setReport(data);
          setHistory(Array.isArray(data?.statusHistory) ? data.statusHistory : []);
          setSupportCount(Number(data?.supportCount || 0));
          setSupportedByMe(Boolean(data?.supportedByMe));
        } catch (detailsError) {
          const localReports = readReports();
          const localReport = localReports.find((item) => item.id === reportId) || null;
          if (active) {
            setReport(localReport);
            setHistory(Array.isArray(localReport?.statusHistory) ? localReport.statusHistory : []);
            setSupportCount(Number(localReport?.supportCount || 0));
            setSupportedByMe(Boolean(localReport?.supportedByMe));
            if (!localReport) {
              setError(detailsError.response?.data?.message || t.citizen?.details?.notFound || "This problem could not be found.");
            }
          }
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setError(err.response?.data?.message || "Unable to load the problem details.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (reportId) {
      fetchReport();
    }

    return () => {
      active = false;
    };
  }, [reportId, t.citizen?.details?.notFound]);

  const isDraft = String(report?.status || "").toUpperCase() === "DRAFT";

  const handleSubmitDraft = async () => {
    if (!report?.id) return;

    try {
      setActionLoading(true);
      const response = await api.post(`/citizen/report/${report.id}/submit`);
      const submittedReport = response.data?.report || { ...report, status: "SUBMITTED" };

      setReport((current) => ({ ...current, ...submittedReport, status: "SUBMITTED" }));
      setHistory((current) => [
        ...current,
        {
          status: "SUBMITTED",
          note: language === "hi" ? "नागरिक द्वारा रिपोर्ट दर्ज की गई" : "Report submitted by citizen",
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || (language === "hi" ? "रिपोर्ट जमा नहीं हो सकी।" : "Unable to submit this report."));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSupport = async () => {
    if (!report?.id || supportedByMe || isDraft) return;

    try {
      setActionLoading(true);
      const response = await api.post(`/reports/${report.id}/support`);
      setSupportCount(Number(response.data?.supportCount || supportCount + 1));
      setSupportedByMe(true);
    } catch (err) {
      setError(err.response?.data?.message || (language === "hi" ? "समर्थन दर्ज नहीं हो सका।" : "Unable to support this problem."));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <CitizenLayout title={t.citizen?.details?.title || "Problem Details"}>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">{t.citizen?.details?.loading || "Loading problem details..."}</div>
      </CitizenLayout>
    );
  }

  if (error || !report) {
    return (
      <CitizenLayout title={t.citizen?.details?.title || "Problem Details"}>
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} />
          {error || t.citizen?.details?.notFound || "This problem could not be found."}
        </div>
      </CitizenLayout>
    );
  }

  return (
    <CitizenLayout title={t.citizen?.details?.title || "Problem Details"}>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="border border-slate-200 border-t-4 border-t-emerald-700 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="border border-slate-200 bg-slate-100 px-2 py-1">Report ID</span>
                <span className="font-semibold text-slate-700">{reportId || report.id || "-"}</span>
              </div>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">{report.title || "Untitled problem"}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700">{report.category || (language === "hi" ? "सामान्य" : "General")}</span>
                <span className="rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-700">{report.priority || "MEDIUM"}</span>
                <span className={`rounded-full px-2 py-1 font-semibold ${getStatusTone(report.status)}`}>{formatStatus(report.status, t.citizen?.status)}</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {isDraft ? (
                  <>
                    <button type="button" onClick={() => navigate(`/citizen/report-problem?reportId=${encodeURIComponent(report.id)}`)} className="inline-flex items-center gap-2 border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                      <Edit3 size={16} />
                      {language === "hi" ? "ड्राफ्ट संपादित करें" : "Edit Draft"}
                    </button>
                    <button type="button" onClick={handleSubmitDraft} disabled={actionLoading} className="inline-flex items-center gap-2 bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60">
                      {actionLoading ? <LoaderCircle size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      {language === "hi" ? "रिपोर्ट जमा करें" : "Submit Report"}
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={handleSupport} disabled={actionLoading || supportedByMe} className="inline-flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-100 disabled:opacity-60">
                    {actionLoading ? <LoaderCircle size={16} className="animate-spin" /> : <ThumbsUp size={16} />}
                    {supportedByMe ? (language === "hi" ? "आपने समर्थन किया" : "Supported") : (language === "hi" ? "समर्थन करें" : "Support Problem")}
                  </button>
                )}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">
              <span className="font-semibold text-slate-700">{t.citizen?.details?.created || "Created"}:</span> {formatDate(report.createdAt)}
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">{t.citizen?.details?.description || "Description"}</p>
              <p className="mt-2 text-base leading-7 text-slate-700">{report.description || "No description available."}</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <InfoField label={t.citizen?.details?.category || "Category"} value={report.category || (language === "hi" ? "सामान्य" : "General")} />
              <InfoField label={t.citizen?.details?.priority || "Priority"} value={report.priority || "MEDIUM"} />
              <InfoField label={t.citizen?.details?.location || "Location"} value={[report.address, report.city, report.district, report.state, report.pincode].filter(Boolean).join(", ") || (language === "hi" ? "उपलब्ध नहीं" : "Not provided")} />
              <InfoField label={t.citizen?.details?.created || "Created"} value={formatDate(report.createdAt)} />
            </div>

            {report.media && report.media.length > 0 && (
              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">{t.citizen?.details?.attachments || "Attachments"}</p>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {report.media.map((item) => (
                    <a key={item.id} href={getMediaUrl(item.url)} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      {item.type === "IMAGE" ? (
                        <img src={getMediaUrl(item.url)} alt={item.filename || "Report attachment"} className="h-32 w-full object-cover" />
                      ) : (
                        <div className="flex h-32 items-center justify-center bg-slate-100 text-sm font-medium text-slate-600">Video</div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">{t.citizen?.details?.statusTimeline || "Status Timeline"}</h3>
          {!isDraft && (
            <div className="mt-4 flex items-center gap-2 border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <ThumbsUp size={16} className="text-emerald-700" />
              <span className="font-bold">{supportCount}</span>
              <span>{language === "hi" ? "नागरिकों ने समर्थन किया" : "citizens support this problem"}</span>
            </div>
          )}
          <div className="mt-5 space-y-5">
            {(history.length ? history : [{ status: report.status || "DRAFT", note: "Report created", createdAt: report.createdAt }]).map((entry, index) => (
              <div key={`${entry.status}-${index}`} className="relative pl-6">
                <div className="absolute left-0 top-1 h-3 w-3 rounded-full bg-emerald-500" />
                <div className="border-l border-slate-200 pl-4">
                  <p className="text-sm font-semibold text-slate-800">{formatStatus(entry.status, t.citizen?.status)}</p>
                  <p className="mt-1 text-sm text-slate-600">{entry.note || (language === "hi" ? "स्थिति अपडेट की गई" : "Status updated")}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <Calendar size={12} />
                    <span>{formatDate(entry.createdAt || report.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </CitizenLayout>
  );
}

function formatStatus(status, labels = {}) {
  const normalized = String(status || "DRAFT").toUpperCase().replace(/ /g, "_");
  const key = {
    DRAFT: "draft",
    SUBMITTED: "submitted",
    UNDER_REVIEW: "underReview",
    IN_PROGRESS: "inProgress",
    RESOLVED: "resolved",
    REJECTED: "rejected",
  }[normalized];

  return labels[key] || normalized.replace(/_/g, " ");
}

function InfoField({ label, value }) {
  return (
    <div className="border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

export default ProblemDetailsPage;
