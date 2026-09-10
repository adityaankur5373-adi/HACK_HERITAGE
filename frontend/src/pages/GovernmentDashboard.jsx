import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Flag,
  LoaderCircle,
  MapPin,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import api from "../services/api";
import GovernmentLayout from "../components/government/GovernmentLayout";

function normalizeStatus(status) {
  return String(status || "")
    .trim()
    .toUpperCase()
    .replace(/[- ]/g, "_");
}

function getStatusStyle(status) {
  const normalized = normalizeStatus(status);

  const styles = {
    SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
    UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
    VERIFIED: "bg-violet-50 text-violet-700 border-violet-200",
    ASSIGNED: "bg-indigo-50 text-indigo-700 border-indigo-200",
    IMPLEMENTATION: "bg-orange-50 text-orange-700 border-orange-200",
    RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    styles[normalized] ||
    "bg-slate-50 text-slate-600 border-slate-200"
  );
}

function getPriorityStyle(priority) {
  const normalized = String(priority || "").toUpperCase();

  if (normalized === "CRITICAL") {
    return "bg-red-100 text-red-700";
  }

  if (normalized === "HIGH") {
    return "bg-orange-100 text-orange-700";
  }

  if (normalized === "MEDIUM") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-100 text-slate-600";
}

function formatStatus(status) {
  return String(status || "UNKNOWN")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function GovernmentDashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/government/dashboard");

      setData(response.data?.data || null);
    } catch (err) {
      console.error("Government Dashboard Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load government dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const summary = data?.summary || {};
  const government = data?.government || {};
  const recentReports = data?.recentReports || [];

  const cards = useMemo(
    () => [
      {
        label: "Total Reports",
        value: summary.total,
        icon: FileText,
        description: "Reports in your jurisdiction",
      },
      {
        label: "New Reports",
        value: summary.submitted,
        icon: Flag,
        description: "Waiting for review",
      },
      {
        label: "Under Review",
        value: summary.underReview,
        icon: Clock3,
        description: "Currently being reviewed",
      },
      {
        label: "Assigned",
        value: summary.assigned,
        icon: ShieldCheck,
        description: "Assigned for action",
      },
      {
        label: "In Progress",
        value: summary.implementation,
        icon: LoaderCircle,
        description: "Implementation underway",
      },
      {
        label: "Resolved",
        value: summary.resolved,
        icon: CheckCircle2,
        description: "Successfully resolved",
      },
      {
        label: "Rejected",
        value: summary.rejected,
        icon: XCircle,
        description: "Rejected reports",
      },
      {
        label: "High Priority",
        value: summary.highPriority,
        icon: AlertCircle,
        description: "High or critical priority",
      },
    ],
    [summary]
  );

  return (
    <GovernmentLayout title="Government Dashboard">
      <div className="space-y-6">

        {/* =========================================================
            ERROR
        ========================================================= */}

        {error && (
          <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={loadDashboard}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* =========================================================
            DEPARTMENT HEADER
        ========================================================= */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 px-6 py-7 text-white sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                  <ShieldCheck size={14} />
                  Government Control Room
                </div>

                <h2 className="text-2xl font-bold sm:text-3xl">
                  {government.department || "Government Department"}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50">
                  Monitor, review and coordinate civic problems
                  reported by citizens in your jurisdiction.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/government/reports")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                View All Reports
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid border-t border-slate-200 sm:grid-cols-3">

            <InfoItem
              label="Officer"
              value={government.name || "Government Officer"}
            />

            <InfoItem
              label="Office"
              value={government.office || "Not specified"}
            />

            <InfoItem
              label="Jurisdiction"
              value={[
                government.district,
                government.state,
              ]
                .filter(Boolean)
                .join(", ") || "All jurisdictions"}
              icon={<MapPin size={14} />}
            />

          </div>
        </section>

        {/* =========================================================
            LOADING
        ========================================================= */}

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* =====================================================
                STAT CARDS
            ===================================================== */}

            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    Department Overview
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Current report workload and resolution status
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <div
                      key={card.label}
                      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                            {card.label}
                          </p>

                          <p className="mt-3 text-3xl font-bold text-slate-950">
                            {card.value ?? 0}
                          </p>
                        </div>

                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700 transition group-hover:bg-emerald-100">
                          <Icon size={20} />
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-slate-500">
                        {card.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* =====================================================
                PRIORITY + WORKLOAD
            ===================================================== */}

            <section className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-950">
                      Recent Reports
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Latest citizen reports routed to your office
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/government/reports")
                    }
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    View all
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {recentReports.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                      <FileText
                        size={28}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 text-sm font-semibold text-slate-600">
                        No reports yet
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        New citizen reports will appear here.
                      </p>
                    </div>
                  ) : (
                    recentReports.map((report) => (
                      <button
                        key={report.id}
                        type="button"
                        onClick={() =>
                          navigate(
                            `/government/reports/${report.id}`
                          )
                        }
                        className="group w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/50"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">

                              <span className="rounded-md bg-white px-2 py-1 font-mono text-[10px] font-bold text-slate-500">
                                {report.id}
                              </span>

                              <span
                                className={`rounded-full px-2 py-1 text-[10px] font-bold ${getPriorityStyle(
                                  report.priority
                                )}`}
                              >
                                {report.priority || "MEDIUM"}
                              </span>

                              <span
                                className={`rounded-full border px-2 py-1 text-[10px] font-bold ${getStatusStyle(
                                  report.status
                                )}`}
                              >
                                {formatStatus(report.status)}
                              </span>
                            </div>

                            <h4 className="mt-2 truncate text-sm font-bold text-slate-900">
                              {report.title || "Untitled report"}
                            </h4>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">

                              <span>
                                {report.category || "General"}
                              </span>

                              <span className="flex items-center gap-1">
                                <MapPin size={12} />

                                {[
                                  report.city,
                                  report.district,
                                ]
                                  .filter(Boolean)
                                  .join(", ") ||
                                  "Location not specified"}
                              </span>

                              <span>
                                {formatDate(report.createdAt)}
                              </span>

                            </div>
                          </div>

                          <ArrowRight
                            size={18}
                            className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600"
                          />

                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* ===================================================
                  ACTION PANEL
              =================================================== */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div>
                  <h3 className="font-bold text-slate-950">
                    Quick Actions
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Manage your department workload
                  </p>
                </div>

                <div className="mt-5 space-y-3">

                  <QuickAction
                    icon={<Flag size={18} />}
                    title="New Reports"
                    value={summary.submitted ?? 0}
                    description="Needs review"
                    onClick={() =>
                      navigate(
                        "/government/reports?status=SUBMITTED"
                      )
                    }
                  />

                  <QuickAction
                    icon={<Clock3 size={18} />}
                    title="Under Review"
                    value={summary.underReview ?? 0}
                    description="Currently reviewing"
                    onClick={() =>
                      navigate(
                        "/government/reports?status=UNDER_REVIEW"
                      )
                    }
                  />

                  <QuickAction
                    icon={<LoaderCircle size={18} />}
                    title="In Progress"
                    value={summary.implementation ?? 0}
                    description="Implementation underway"
                    onClick={() =>
                      navigate(
                        "/government/reports?status=IMPLEMENTATION"
                      )
                    }
                  />

                  <QuickAction
                    icon={<CheckCircle2 size={18} />}
                    title="Resolved"
                    value={summary.resolved ?? 0}
                    description="Completed problems"
                    onClick={() =>
                      navigate(
                        "/government/reports?status=RESOLVED"
                      )
                    }
                  />

                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/government/reports")
                  }
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                >
                  Open Report Management
                  <ArrowRight size={15} />
                </button>
              </div>

            </section>
          </>
        )}
      </div>
    </GovernmentLayout>
  );
}

/*
|--------------------------------------------------------------------------
| INFO ITEM
|--------------------------------------------------------------------------
*/

function InfoItem({ label, value, icon }) {
  return (
    <div className="px-6 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
        {icon}
        {value}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| QUICK ACTION
|--------------------------------------------------------------------------
*/

function QuickAction({
  icon,
  title,
  value,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
    >
      <div className="rounded-lg bg-white p-2 text-emerald-700 shadow-sm">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-800">
          {title}
        </p>

        <p className="text-[11px] text-slate-500">
          {description}
        </p>
      </div>

      <span className="text-lg font-bold text-slate-900">
        {value}
      </span>

      <ArrowRight
        size={14}
        className="text-slate-300"
      />
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| LOADING SKELETON
|--------------------------------------------------------------------------
*/

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div
            key={item}
            className="h-36 rounded-2xl bg-slate-200"
          />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="h-96 rounded-2xl bg-slate-200" />
        <div className="h-96 rounded-2xl bg-slate-200" />
      </div>

    </div>
  );
}