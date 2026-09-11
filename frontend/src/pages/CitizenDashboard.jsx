import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FilePlus2,
  MapPin,
  SearchCheck,
  ShieldCheck,
  Timer,
} from "lucide-react";

import CitizenLayout from "../components/citizen/CitizenLayout";
import useAuthStore from "../store/authStore";
import api from "../services/api";
import useLanguage from "../context/useLanguage";
import {
  formatDate,
  getStatusTone,
  readReports,
} from "../utils/citizenStorage";

function CitizenDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useLanguage();

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
          console.warn(
            "Unable to fetch reports from API, using local reports:",
            listError
          );

          const localReports = readReports();

          if (!active) {
            return;
          }

          setReports(localReports);
        }
      } catch (err) {
        console.error(err);

        if (active) {
          setError(
            err.response?.data?.message ||
              "Something went wrong while loading dashboard data."
          );
        }
      } finally {
        if (active) {
          Promise.resolve().then(() => {
            if (active) {
              setLoading(false);
            }
          });
        }
      }
    };

    if (user?.id) {
      fetchReports();
    } else {
      Promise.resolve().then(() => {
        if (active) {
          setLoading(false);
        }
      });
    }

    return () => {
      active = false;
    };
  }, [user?.id]);

  /*
   * --------------------------------------------------------------------------
   * REPORT STATISTICS
   * --------------------------------------------------------------------------
   *
   * Current JanSamadhan Report.status lifecycle:
   *
   * DRAFT
   * SUBMITTED
   * UNDER_REVIEW
   * VERIFIED
   * IMPLEMENTATION
   * RESOLVED
   * REJECTED
   *
   * IMPORTANT:
   * IMPLEMENTATION is the actual "In Progress" state.
   */

  const stats = useMemo(() => {
    const getStatus = (report) =>
      String(report?.status || "DRAFT")
        .toUpperCase()
        .replace(/-/g, "_")
        .replace(/ /g, "_");

    const total = reports.length;

    const submitted = reports.filter(
      (report) => getStatus(report) === "SUBMITTED"
    ).length;

    const underReview = reports.filter(
      (report) => getStatus(report) === "UNDER_REVIEW"
    ).length;

    const verified = reports.filter(
      (report) => getStatus(report) === "VERIFIED"
    ).length;

    const inProgress = reports.filter((report) => {
      const status = getStatus(report);

      return (
        status === "IMPLEMENTATION" ||
        // Legacy compatibility in case an older record/API still returns this.
        status === "IN_PROGRESS"
      );
    }).length;

    const resolved = reports.filter(
      (report) => getStatus(report) === "RESOLVED"
    ).length;

    const rejected = reports.filter(
      (report) => getStatus(report) === "REJECTED"
    ).length;

    return {
      total,
      submitted,
      underReview,
      verified,
      inProgress,
      resolved,
      rejected,
    };
  }, [reports]);

  /*
   * Show the five most recently created reports.
   */
  const recentReports = useMemo(() => {
    return [...reports]
      .sort(
        (a, b) =>
          new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
      )
      .slice(0, 5);
  }, [reports]);

  return (
    <CitizenLayout
      title={t.citizen?.dashboard?.title || "Citizen Dashboard"}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ---------------------------------------------------------------- */}
        {/* WELCOME SECTION                                                  */}
        {/* ---------------------------------------------------------------- */}

        <section className="border border-slate-200 border-t-4 border-t-emerald-700 bg-white px-5 py-6 shadow-sm sm:px-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                {t.login?.badge || "JanSamadhan"}
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
                {t.citizen?.dashboard?.welcome || "Welcome back"},{" "}
                {user?.name || "Citizen"}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {t.citizen?.dashboard?.subtitle ||
                  "Report civic problems easily and track their progress."}
              </p>
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

        {/* ---------------------------------------------------------------- */}
        {/* ERROR MESSAGE                                                    */}
        {/* ---------------------------------------------------------------- */}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* STATISTICS                                                       */}
        {/* ---------------------------------------------------------------- */}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="h-4 w-24 rounded bg-slate-200" />

                <div className="mt-6 h-8 w-16 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : (
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={
                t.citizen?.dashboard?.totalProblems || "Total Problems"
              }
              value={stats.total}
              icon={<BarChart3 size={18} />}
              accent="border-l-slate-500"
            />

            <StatCard
              label={t.citizen?.dashboard?.submitted || "Submitted"}
              value={stats.submitted}
              icon={<ShieldCheck size={18} />}
              accent="border-l-violet-600"
            />

            <StatCard
              label={
                t.citizen?.dashboard?.underReview || "Under Review"
              }
              value={stats.underReview}
              icon={<Timer size={18} />}
              accent="border-l-blue-600"
            />

            <StatCard
              label={t.citizen?.dashboard?.verified || "Verified"}
              value={stats.verified}
              icon={<SearchCheck size={18} />}
              accent="border-l-emerald-500"
            />

            <StatCard
              label={t.citizen?.dashboard?.inProgress || "In Progress"}
              value={stats.inProgress}
              icon={<Clock3 size={18} />}
              accent="border-l-amber-500"
            />

            <StatCard
              label={t.citizen?.dashboard?.resolved || "Resolved"}
              value={stats.resolved}
              icon={<CheckCircle2 size={18} />}
              accent="border-l-emerald-600"
            />

            <StatCard
              label={t.citizen?.dashboard?.rejected || "Rejected"}
              value={stats.rejected}
              icon={<AlertCircle size={18} />}
              accent="border-l-red-500"
            />
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* RECENT PROBLEMS                                                  */}
        {/* ---------------------------------------------------------------- */}

        <section className="border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
                {t.citizen?.dashboard?.title || "Citizen Dashboard"}
              </p>

              <h3 className="mt-1 text-lg font-bold text-slate-950">
                {t.citizen?.dashboard?.recentProblems || "Recent Problems"}
              </h3>
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

          {/* -------------------------------------------------------------- */}
          {/* LOADING                                                        */}
          {/* -------------------------------------------------------------- */}

          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : recentReports.length === 0 ? (
            /* ------------------------------------------------------------ */
            /* EMPTY STATE                                                  */
            /* ------------------------------------------------------------ */

            <div className="m-5 border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              {t.citizen?.dashboard?.noReports || "No reports yet."}
            </div>
          ) : (
            /* ------------------------------------------------------------ */
            /* REPORT LIST                                                   */
            /* ------------------------------------------------------------ */

            <div className="divide-y divide-slate-200">
              {recentReports.map((report) => (
                <button
                  key={report.id}
                  type="button"
                  onClick={() =>
                    navigate(`/citizen/problems/${report.id}`)
                  }
                  className="flex w-full flex-col gap-3 px-5 py-4 text-left transition hover:bg-emerald-50/60 md:flex-row md:items-center md:justify-between md:px-6"
                >
                  <div>
                    {/* Report ID */}
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                      <span>ID {report.id}</span>
                    </div>

                    {/* Title */}
                    <h4 className="text-base font-bold text-slate-950">
                      {report.title || "Untitled problem"}
                    </h4>

                    {/* Category / Priority / Status */}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-700">
                        {report.category || "General"}
                      </span>

                      <span className="border border-amber-200 bg-amber-50 px-2 py-1 font-semibold text-amber-700">
                        {report.priority || "MEDIUM"}
                      </span>

                      <span
                        className={`px-2 py-1 font-semibold ${getStatusTone(
                          report.status
                        )}`}
                      >
                        {formatStatus(
                          report.status,
                          t.citizen?.status,
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Location / Date / Details */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 md:justify-end">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />

                      {report.city ||
                        report.district ||
                        report.state ||
                        "Location not set"}
                    </span>

                    <span>{formatDate(report.createdAt)}</span>

                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                      {t.citizen?.dashboard?.viewDetails ||
                        "View Details"}

                      <ArrowRight size={14} />
                    </span>
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

/*
|--------------------------------------------------------------------------
| STATUS FORMATTER
|--------------------------------------------------------------------------
|
| Converts backend status values into citizen-friendly labels.
|
| Backend:
|   DRAFT
|   SUBMITTED
|   UNDER_REVIEW
|   VERIFIED
|   IMPLEMENTATION
|   RESOLVED
|   REJECTED
|
| UI:
|   Draft
|   Submitted
|   Under Review
|   Verified
|   In Progress
|   Resolved
|   Rejected
|--------------------------------------------------------------------------
*/

function formatStatus(status, labels = {}) {
  const normalized = String(status || "DRAFT")
    .toUpperCase()
    .replace(/-/g, "_")
    .replace(/ /g, "_");

  const key = {
    DRAFT: "draft",
    SUBMITTED: "submitted",
    UNDER_REVIEW: "underReview",
    VERIFIED: "verified",
    IMPLEMENTATION: "inProgress",

    // Legacy compatibility.
    IN_PROGRESS: "inProgress",

    RESOLVED: "resolved",
    REJECTED: "rejected",
  }[normalized];

  if (key && labels[key]) {
    return labels[key];
  }

  /*
   * Fallback when a translation is not available.
   */
  const fallbackLabels = {
    DRAFT: "Draft",
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under Review",
    VERIFIED: "Verified",
    IMPLEMENTATION: "In Progress",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    REJECTED: "Rejected",
  };

  return (
    fallbackLabels[normalized] ||
    normalized.replace(/_/g, " ")
  );
}

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

function StatCard({ label, value, icon, accent }) {
  return (
    <div
      className={`border border-slate-200 border-l-4 bg-white p-5 shadow-sm ${accent}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
          {label}
        </span>

        <span className="text-slate-500">{icon}</span>
      </div>

      <div className="mt-4 text-3xl font-bold text-slate-950">
        {value}
      </div>
    </div>
  );
}

export default CitizenDashboard;