import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  RefreshCw,
  TrendingUp,
  XCircle,
} from "lucide-react";

import GovernmentLayout from "../components/government/GovernmentLayout";
import api from "../services/api";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatLabel(value) {
  if (!value) return "Unknown";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getStatusClass(status) {
  switch (status) {
    case "SUBMITTED":
      return "bg-blue-100 text-blue-700";

    case "UNDER_REVIEW":
      return "bg-amber-100 text-amber-700";

    case "VERIFIED":
      return "bg-emerald-100 text-emerald-700";

    case "ASSIGNED":
      return "bg-violet-100 text-violet-700";

    case "IMPLEMENTATION":
      return "bg-orange-100 text-orange-700";

    case "RESOLVED":
      return "bg-green-100 text-green-700";

    case "REJECTED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function GovernmentAnalyticsPage() {
  const [analytics, setAnalytics] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD ANALYTICS
  |--------------------------------------------------------------------------
  */

  const loadAnalytics = async ({
    showLoader = true,
  } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await api.get(
        "/government/analytics"
      );

      setAnalytics(
        response.data || null
      );
    } catch (err) {
      console.error(
        "Load government analytics error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load analytics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadAnalytics();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | DATA
  |--------------------------------------------------------------------------
  */

  const summary =
    analytics?.summary || {};

  const statusDistribution =
    analytics?.statusDistribution || [];

  const categoryDistribution =
    analytics?.categoryDistribution || [];

  const priorityDistribution =
    analytics?.priorityDistribution || [];

  const locationDistribution =
    analytics?.locationDistribution || [];

  const monthlyTrend =
    analytics?.monthlyTrend || [];

  /*
  |--------------------------------------------------------------------------
  | MAX VALUES
  |--------------------------------------------------------------------------
  */

  const maxCategoryCount = useMemo(
    () =>
      Math.max(
        ...categoryDistribution.map(
          (item) => item.count
        ),
        1
      ),
    [categoryDistribution]
  );

  const maxLocationCount = useMemo(
    () =>
      Math.max(
        ...locationDistribution.map(
          (item) => item.count
        ),
        1
      ),
    [locationDistribution]
  );

  const maxMonthlyCount = useMemo(
    () =>
      Math.max(
        ...monthlyTrend.map(
          (item) => item.count
        ),
        1
      ),
    [monthlyTrend]
  );

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <GovernmentLayout title="Analytics">

      <div className="mx-auto max-w-7xl space-y-6">

        {/* =========================================================
            HEADER
        ========================================================== */}

        <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">

          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-emerald-50 blur-3xl" />

          <div className="absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-blue-50 blur-3xl" />

          <div className="relative p-6 sm:p-8">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <BarChart3 size={28} />
                </div>

                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                      Government Analytics
                    </h1>

                    {summary.resolutionRate !==
                      undefined && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                        {summary.resolutionRate}%
                        resolution rate
                      </span>
                    )}

                  </div>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Monitor civic reports,
                    department workload,
                    priorities, locations and
                    resolution performance.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  loadAnalytics({
                    showLoader: false,
                  })
                }
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>

            </div>

          </div>

        </section>

        {/* =========================================================
            ERROR
        ========================================================== */}

        {error && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-4">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm font-bold text-red-800">
                  Unable to load analytics
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  loadAnalytics()
                }
                className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                Try again
              </button>

            </div>

          </section>
        )}

        {/* =========================================================
            LOADING
        ========================================================== */}

        {loading ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-[24px] border border-slate-200 bg-white shadow-sm">

            <div className="text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <BarChart3
                  size={30}
                  className="animate-pulse"
                />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                Loading analytics
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Preparing your department
                insights...
              </p>

            </div>

          </div>
        ) : (
          <>
            {/* =====================================================
                SUMMARY CARDS
            ====================================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {/* TOTAL */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Total Reports
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-950">
                      {summary.totalReports ||
                        0}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Assigned to your office
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <FileText size={21} />
                  </div>

                </div>

              </div>

              {/* PENDING */}

              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                      Pending
                    </p>

                    <p className="mt-2 text-3xl font-bold text-amber-800">
                      {summary.pendingReports ||
                        0}
                    </p>

                    <p className="mt-2 text-xs text-amber-700">
                      Need further action
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Clock3 size={21} />
                  </div>

                </div>

              </div>

              {/* RESOLVED */}

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Resolved
                    </p>

                    <p className="mt-2 text-3xl font-bold text-emerald-800">
                      {summary.resolvedReports ||
                        0}
                    </p>

                    <p className="mt-2 text-xs text-emerald-700">
                      {summary.resolutionRate ||
                        0}
                      % resolution rate
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={21} />
                  </div>

                </div>

              </div>

              {/* HIGH PRIORITY */}

              <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-red-700">
                      High Priority
                    </p>

                    <p className="mt-2 text-3xl font-bold text-red-800">
                      {summary.highPriorityReports ||
                        0}
                    </p>

                    <p className="mt-2 text-xs text-red-700">
                      High + Critical
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <AlertTriangle size={21} />
                  </div>

                </div>

              </div>

            </div>

            {/* =====================================================
                REPORT TREND
            ====================================================== */}

            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="font-bold text-slate-950">
                    Report Trend
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Reports submitted over the
                    last 6 months
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <TrendingUp size={20} />
                </div>

              </div>

              <div className="mt-8 flex h-64 items-end gap-3 sm:gap-6">

                {monthlyTrend.map(
                  (item) => {
                    const height =
                      Math.max(
                        (item.count /
                          maxMonthlyCount) *
                          100,
                        item.count > 0
                          ? 8
                          : 2
                      );

                    return (
                      <div
                        key={item.month}
                        className="flex h-full flex-1 flex-col items-center justify-end gap-3"
                      >

                        <span className="text-xs font-bold text-slate-600">
                          {item.count}
                        </span>

                        <div className="flex h-full w-full items-end justify-center">

                          <div
                            className="w-full max-w-12 rounded-t-xl bg-emerald-500 transition-all duration-500 hover:bg-emerald-600"
                            style={{
                              height: `${height}%`,
                            }}
                          />

                        </div>

                        <span className="text-center text-[11px] font-medium text-slate-400">
                          {item.label}
                        </span>

                      </div>
                    );
                  }
                )}

              </div>

            </section>

            {/* =====================================================
                CATEGORY + STATUS
            ====================================================== */}

            <div className="grid gap-6 xl:grid-cols-2">

              {/* CATEGORY */}

              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                <div className="flex items-center justify-between">

                  <div>
                    <h2 className="font-bold text-slate-950">
                      Reports by Category
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Most common civic problems
                    </p>
                  </div>

                  <BarChart3
                    size={20}
                    className="text-slate-400"
                  />

                </div>

                <div className="mt-6 space-y-5">

                  {categoryDistribution.length ===
                  0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">
                      No category data
                      available.
                    </p>
                  ) : (
                    categoryDistribution.map(
                      (item) => {
                        const width =
                          (item.count /
                            maxCategoryCount) *
                          100;

                        return (
                          <div
                            key={
                              item.category
                            }
                          >

                            <div className="mb-2 flex items-center justify-between">

                              <span className="text-sm font-semibold text-slate-700">
                                {formatLabel(
                                  item.category
                                )}
                              </span>

                              <span className="text-sm font-bold text-slate-900">
                                {item.count}
                              </span>

                            </div>

                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">

                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                style={{
                                  width: `${width}%`,
                                }}
                              />

                            </div>

                          </div>
                        );
                      }
                    )
                  )}

                </div>

              </section>

              {/* STATUS */}

              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                <div>
                  <h2 className="font-bold text-slate-950">
                    Report Status
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Current workflow distribution
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">

                  {statusDistribution.map(
                    (item) => (
                      <div
                        key={item.status}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                      >

                        <div className="flex items-center justify-between gap-2">

                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-bold ${getStatusClass(
                              item.status
                            )}`}
                          >
                            {formatLabel(
                              item.status
                            )}
                          </span>

                          <span className="text-lg font-bold text-slate-900">
                            {item.count}
                          </span>

                        </div>

                      </div>
                    )
                  )}

                </div>

              </section>

            </div>

            {/* =====================================================
                LOCATION + PRIORITY
            ====================================================== */}

            <div className="grid gap-6 xl:grid-cols-2">

              {/* LOCATION */}

              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <MapPin size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-950">
                      Reports by Location
                    </h2>

                    <p className="text-xs text-slate-500">
                      Areas receiving the most
                      reports
                    </p>
                  </div>

                </div>

                <div className="mt-6 space-y-4">

                  {locationDistribution.length ===
                  0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">
                      No location data
                      available.
                    </p>
                  ) : (
                    locationDistribution.map(
                      (item) => {
                        const width =
                          (item.count /
                            maxLocationCount) *
                          100;

                        return (
                          <div
                            key={
                              item.location
                            }
                          >

                            <div className="mb-2 flex items-center justify-between">

                              <span className="truncate pr-4 text-sm font-semibold text-slate-700">
                                {item.location}
                              </span>

                              <span className="text-sm font-bold text-slate-900">
                                {item.count}
                              </span>

                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                              <div
                                className="h-full rounded-full bg-blue-500"
                                style={{
                                  width: `${width}%`,
                                }}
                              />

                            </div>

                          </div>
                        );
                      }
                    )
                  )}

                </div>

              </section>

              {/* PRIORITY */}

              <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <AlertTriangle size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-950">
                      Priority Distribution
                    </h2>

                    <p className="text-xs text-slate-500">
                      Severity of assigned
                      reports
                    </p>
                  </div>

                </div>

                <div className="mt-6 space-y-3">

                  {priorityDistribution.map(
                    (item) => (
                      <div
                        key={item.priority}
                        className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
                      >

                        <span className="text-sm font-semibold text-slate-700">
                          {formatLabel(
                            item.priority
                          )}
                        </span>

                        <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-900 shadow-sm">
                          {item.count}
                        </span>

                      </div>
                    )
                  )}

                  {priorityDistribution.length ===
                    0 && (
                    <p className="py-8 text-center text-sm text-slate-400">
                      No priority data
                      available.
                    </p>
                  )}

                </div>

              </section>

            </div>

            {/* =====================================================
                PERFORMANCE
            ====================================================== */}

            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Activity size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-950">
                    Resolution Performance
                  </h2>

                  <p className="text-xs text-slate-500">
                    How quickly your department
                    resolves citizen problems
                  </p>
                </div>

              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Resolution Rate
                  </p>

                  <p className="mt-2 text-3xl font-bold text-emerald-700">
                    {summary.resolutionRate ||
                      0}
                    %
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Average Resolution
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {summary.averageResolutionDays ||
                      0}
                    <span className="ml-1 text-sm font-semibold text-slate-500">
                      days
                    </span>
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Rejected
                  </p>

                  <p className="mt-2 text-3xl font-bold text-red-700">
                    {summary.rejectedReports ||
                      0}
                  </p>
                </div>

              </div>

            </section>

          </>
        )}

      </div>
    </GovernmentLayout>
  );
}