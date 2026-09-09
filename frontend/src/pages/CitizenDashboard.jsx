import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FilePlus2,
  LoaderCircle,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import CitizenLayout from "../components/citizen/CitizenLayout";
import useAuthStore from "../store/authStore";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { formatDate, getStatusTone, readReports } from "../utils/citizenStorage";

function CitizenDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { language, t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchReports = async () => {
      try {
        setLoading(true);
        setError("");

        try {
          const response = await api.get("/reports");
          const data = Array.isArray(response.data)
            ? response.data
            : response.data?.reports || [];

          if (!active) {
            return;
          }

          setReports(data);
        } catch (listError) {
          const localReports = readReports();
          if (!active) {
            return;
          }
          setReports(localReports);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setError(err.response?.data?.message || "Something went wrong while loading dashboard data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (user?.id) {
      fetchReports();
    }

    return () => {
      active = false;
    };
  }, [user?.id]);

  const stats = useMemo(() => {
    const total = reports.length;
    const submitted = reports.filter((report) => (report.status || "").toUpperCase() === "SUBMITTED").length;
    const inProgress = reports.filter((report) => (report.status || "").toUpperCase() === "IN PROGRESS" || (report.status || "").toUpperCase() === "IN_PROGRESS").length;
    const resolved = reports.filter((report) => (report.status || "").toUpperCase() === "RESOLVED").length;

    return { total, submitted, inProgress, resolved };
  }, [reports]);

  const recentReports = [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <CitizenLayout title={t.citizen?.dashboard?.title || "Citizen Dashboard"}>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="border border-slate-200 border-t-4 border-t-emerald-700 bg-white px-5 py-6 shadow-sm sm:px-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{t.login?.badge || "JanSamadhan"}</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">{t.citizen?.dashboard?.welcome || "Welcome back"}, {user?.name || "Citizen"}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t.citizen?.dashboard?.subtitle || "Report civic problems easily and track their progress."}</p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/citizen/report-problem")}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
            >
              <FilePlus2 size={17} />
              {t.citizen?.dashboard?.reportProblem || "Report a Problem"}
            </button>
          </div>
        </section>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse">
                <div className="h-4 w-20 rounded bg-slate-200" />
                <div className="mt-6 h-8 w-16 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : (
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label={t.citizen?.dashboard?.totalProblems || "Total Problems"} value={stats.total} icon={<BarChart3 size={18} />} accent="border-l-slate-500" />
            <StatCard label={t.citizen?.dashboard?.submitted || "Submitted"} value={stats.submitted} icon={<ShieldCheck size={18} />} accent="border-l-violet-600" />
            <StatCard label={t.citizen?.dashboard?.inProgress || "In Progress"} value={stats.inProgress} icon={<Clock3 size={18} />} accent="border-l-amber-500" />
            <StatCard label={t.citizen?.dashboard?.resolved || "Resolved"} value={stats.resolved} icon={<CheckCircle2 size={18} />} accent="border-l-emerald-600" />
          </section>
        )}

        <section className="border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">{t.citizen?.dashboard?.title || "Citizen Dashboard"}</p>
              <h3 className="mt-1 text-lg font-bold text-slate-950">{t.citizen?.dashboard?.recentProblems || "Recent Problems"}</h3>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 self-start text-sm font-bold text-emerald-700 hover:text-emerald-900 sm:self-auto"
              onClick={() => navigate("/citizen/my-problems")}
            >
              {t.citizen?.dashboard?.viewDetails || "View Details"}
              <ArrowRight size={15} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : recentReports.length === 0 ? (
            <div className="m-5 border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              {t.citizen?.dashboard?.noReports || "No reports yet."}
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {recentReports.map((report) => (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => navigate(`/citizen/problems/${report.id}`)}
                  className="flex w-full flex-col gap-3 px-5 py-4 text-left transition hover:bg-emerald-50/60 md:flex-row md:items-center md:justify-between md:px-6"
                >
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                      <span>ID {report.id}</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-950">{report.title || "Untitled problem"}</h4>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-700">{report.category || "General"}</span>
                      <span className="border border-amber-200 bg-amber-50 px-2 py-1 font-semibold text-amber-700">{report.priority || "MEDIUM"}</span>
                      <span className={`px-2 py-1 font-semibold ${getStatusTone(report.status)}`}>{formatStatus(report.status, t.citizen?.status, language)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 md:justify-end">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {report.city || report.district || report.state || "Location not set"}</span>
                    <span>{formatDate(report.createdAt)}</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">{t.citizen?.dashboard?.viewDetails || "View Details"}<ArrowRight size={14} /></span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </CitizenLayout>
  );
}

function formatStatus(status, labels = {}, language = "en") {
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

function StatCard({ label, value, icon, accent }) {
  return (
    <div className={`border border-slate-200 border-l-4 bg-white p-5 shadow-sm ${accent}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</span>
        <span className="text-slate-500">{icon}</span>
      </div>
      <div className="mt-4 text-3xl font-bold text-slate-950">{value}</div>
    </div>
  );
}

export default CitizenDashboard;
