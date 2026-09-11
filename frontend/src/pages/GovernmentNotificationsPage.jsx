import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Clock3,
  FileCheck2,
  FileText,
  Filter,
  MapPin,
  Search,
  ShieldAlert,
  UserCheck,
  Wrench,
  XCircle,
  ChevronRight,
  Circle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import GovernmentLayout from "../components/government/GovernmentLayout";
import api from "../services/api";

/*
|--------------------------------------------------------------------------
| FILTERS
|--------------------------------------------------------------------------
*/

const FILTERS = [
  { value: "ALL", label: "All notifications" },
  { value: "UNREAD", label: "Unread" },
  { value: "HIGH_PRIORITY", label: "High priority" },
  { value: "NEW_REPORT", label: "New reports" },
  { value: "REVIEW", label: "Review" },
  { value: "VERIFIED", label: "Verified" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IMPLEMENTATION", label: "Implementation" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "REJECTED", label: "Rejected" },
];

/*
|--------------------------------------------------------------------------
| NOTIFICATION ICON
|--------------------------------------------------------------------------
*/

function getNotificationIcon(type) {
  switch (type) {
    case "HIGH_PRIORITY":
      return ShieldAlert;

    case "NEW_REPORT":
      return FileText;

    case "REVIEW":
      return Clock3;

    case "VERIFIED":
      return FileCheck2;

    case "ASSIGNED":
      return UserCheck;

    case "IMPLEMENTATION":
      return Wrench;

    case "RESOLVED":
      return CheckCheck;

    case "REJECTED":
      return XCircle;

    default:
      return Bell;
  }
}

/*
|--------------------------------------------------------------------------
| NOTIFICATION STYLE
|--------------------------------------------------------------------------
*/

function getNotificationStyle(type) {
  switch (type) {
    case "HIGH_PRIORITY":
      return {
        icon: "bg-red-100 text-red-600",
        badge: "bg-red-50 text-red-700 border-red-200",
        label: "High Priority",
      };

    case "NEW_REPORT":
      return {
        icon: "bg-blue-100 text-blue-600",
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        label: "New Report",
      };

    case "REVIEW":
      return {
        icon: "bg-amber-100 text-amber-600",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Needs Review",
      };

    case "VERIFIED":
      return {
        icon: "bg-emerald-100 text-emerald-600",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Verified",
      };

    case "ASSIGNED":
      return {
        icon: "bg-violet-100 text-violet-600",
        badge: "bg-violet-50 text-violet-700 border-violet-200",
        label: "Assigned",
      };

    case "IMPLEMENTATION":
      return {
        icon: "bg-orange-100 text-orange-600",
        badge: "bg-orange-50 text-orange-700 border-orange-200",
        label: "Implementation",
      };

    case "RESOLVED":
      return {
        icon: "bg-green-100 text-green-600",
        badge: "bg-green-50 text-green-700 border-green-200",
        label: "Resolved",
      };

    case "REJECTED":
      return {
        icon: "bg-slate-100 text-slate-600",
        badge: "bg-slate-50 text-slate-700 border-slate-200",
        label: "Rejected",
      };

    default:
      return {
        icon: "bg-slate-100 text-slate-600",
        badge: "bg-slate-50 text-slate-700 border-slate-200",
        label: "Notification",
      };
  }
}

/*
|--------------------------------------------------------------------------
| FORMAT DATE / TIME
|--------------------------------------------------------------------------
*/

function formatNotificationTime(date) {
  if (!date) {
    return "";
  }

  const now = new Date();
  const created = new Date(date);

  if (Number.isNaN(created.getTime())) {
    return "";
  }

  const diffMs = now - created;
  const diffMinutes = Math.floor(
    diffMs / (1000 * 60)
  );

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(
    diffMinutes / 60
  );

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.floor(
    diffHours / 24
  );

  if (diffDays < 7) {
    return `${diffDays} day${
      diffDays > 1 ? "s" : ""
    } ago`;
  }

  return created.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function GovernmentNotificationsPage() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);

  const [activeFilter, setActiveFilter] =
    useState("ALL");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD NOTIFICATIONS
  |--------------------------------------------------------------------------
  */

  const loadNotifications = useCallback(async ({
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
        "/government/notifications"
      );

      setNotifications(
        response.data?.notifications || []
      );
    } catch (err) {
      console.error(
        "Load government notifications error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    void Promise.resolve().then(loadNotifications);
  }, [loadNotifications]);

  /*
  |--------------------------------------------------------------------------
  | UNREAD COUNT
  |--------------------------------------------------------------------------
  */

  const unreadCount = notifications.filter(
    (notification) =>
      !notification.isRead
  ).length;

  /*
  |--------------------------------------------------------------------------
  | HIGH PRIORITY COUNT
  |--------------------------------------------------------------------------
  */

  const highPriorityCount =
    notifications.filter(
      (notification) =>
        notification.type ===
        "HIGH_PRIORITY"
    ).length;

  /*
  |--------------------------------------------------------------------------
  | FILTER + SEARCH
  |--------------------------------------------------------------------------
  */

  const filteredNotifications = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return notifications.filter(
      (notification) => {
        const matchesFilter =
          activeFilter === "ALL"
            ? true
            : activeFilter === "UNREAD"
            ? !notification.isRead
            : notification.type ===
              activeFilter;

        const matchesSearch =
          !query ||
          String(
            notification.title || ""
          )
            .toLowerCase()
            .includes(query) ||
          String(
            notification.message || ""
          )
            .toLowerCase()
            .includes(query) ||
          String(
            notification.reportTitle || ""
          )
            .toLowerCase()
            .includes(query) ||
          String(
            notification.reportId || ""
          )
            .toLowerCase()
            .includes(query) ||
          String(
            notification.location || ""
          )
            .toLowerCase()
            .includes(query);

        return (
          matchesFilter &&
          matchesSearch
        );
      }
    );
  }, [
    notifications,
    activeFilter,
    search,
  ]);

  /*
  |--------------------------------------------------------------------------
  | MARK SINGLE NOTIFICATION AS READ
  |--------------------------------------------------------------------------
  */

  const markAsRead = async (id) => {
    try {
      await api.patch(
        `/government/notifications/${id}/read`
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (err) {
      console.error(
        "Mark notification read error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to update notification."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | MARK ALL AS READ
  |--------------------------------------------------------------------------
  */

  const markAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      setError("");

      await api.patch(
        "/government/notifications/read-all"
      );

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (err) {
      console.error(
        "Mark all notifications read error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to mark notifications as read."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | HANDLE NOTIFICATION CLICK
  |--------------------------------------------------------------------------
  */

  const handleNotificationClick = async (
    notification
  ) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.reportId) {
      navigate(
        `/government/reports/${notification.reportId}`
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RETRY
  |--------------------------------------------------------------------------
  */

  const handleRetry = () => {
    loadNotifications();
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <GovernmentLayout title="Notifications">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =========================================================
            HEADER
        ========================================================== */}

        <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-50 blur-2xl" />

          <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-blue-50 blur-3xl" />

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Bell size={27} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                      Notifications
                    </h1>

                    {unreadCount > 0 && (
                      <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Stay updated with new citizen
                    reports, review requests,
                    verification updates and
                    implementation progress.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">

                {/* REFRESH */}

                <button
                  type="button"
                  onClick={() =>
                    loadNotifications({
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

                {/* MARK ALL READ */}

                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={
                    unreadCount === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <CheckCheck size={17} />

                  Mark all as read
                </button>
              </div>
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
                  Unable to load notifications
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          </section>
        )}

        {/* =========================================================
            SUMMARY CARDS
        ========================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* TOTAL */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {loading
                    ? "—"
                    : notifications.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Bell size={21} />
              </div>

            </div>
          </div>

          {/* UNREAD */}

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Unread
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-800">
                  {loading
                    ? "—"
                    : unreadCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Circle
                  size={19}
                  fill="currentColor"
                />
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
                  {loading
                    ? "—"
                    : highPriorityCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <ShieldAlert size={21} />
              </div>

            </div>
          </div>

        </div>

        {/* =========================================================
            SEARCH + FILTER
        ========================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

            {/* SEARCH */}

            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search notifications, reports or locations..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* FILTER */}

            <div className="flex items-center gap-2 overflow-x-auto">
              <Filter
                size={17}
                className="shrink-0 text-slate-400"
              />

              <select
                value={activeFilter}
                onChange={(event) =>
                  setActiveFilter(
                    event.target.value
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {FILTERS.map((filter) => (
                  <option
                    key={filter.value}
                    value={filter.value}
                  >
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </section>

        {/* =========================================================
            NOTIFICATION LIST
        ========================================================== */}

        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">

          {/* LIST HEADER */}

          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-slate-950">
                Recent notifications
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {loading
                  ? "Loading notifications..."
                  : `${filteredNotifications.length} notification${
                      filteredNotifications.length !==
                      1
                        ? "s"
                        : ""
                    }`}
              </p>
            </div>
          </div>

          {/* =======================================================
              LOADING
          ======================================================== */}

          {loading ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Loader2
                  size={30}
                  className="animate-spin"
                />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Loading notifications
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Fetching the latest updates
                for your government department.
              </p>

            </div>
          ) : filteredNotifications.length ===
            0 ? (

            /* =====================================================
                EMPTY STATE
            ====================================================== */

            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Bell size={28} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                No notifications found
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {search ||
                activeFilter !== "ALL"
                  ? "Try changing the filter or search term."
                  : "New government notifications will appear here when reports need your attention."}
              </p>

              {(search ||
                activeFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setActiveFilter("ALL");
                  }}
                  className="mt-5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Clear filters
                </button>
              )}

            </div>
          ) : (

            /* =====================================================
                NOTIFICATION ITEMS
            ====================================================== */

            <div className="divide-y divide-slate-100">

              {filteredNotifications.map(
                (notification) => {
                  const Icon =
                    getNotificationIcon(
                      notification.type
                    );

                  const style =
                    getNotificationStyle(
                      notification.type
                    );

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() =>
                        handleNotificationClick(
                          notification
                        )
                      }
                      className={`group block w-full text-left transition hover:bg-slate-50 ${
                        !notification.isRead
                          ? "bg-emerald-50/30"
                          : "bg-white"
                      }`}
                    >
                      <div className="flex gap-4 px-5 py-5 sm:px-6">

                        {/* ICON */}

                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}
                        >
                          <Icon size={21} />
                        </div>

                        {/* CONTENT */}

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                            <div className="flex min-w-0 items-center gap-2">

                              {!notification.isRead && (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                              )}

                              <h3 className="truncate font-bold text-slate-900">
                                {notification.title}
                              </h3>

                            </div>

                            <span className="shrink-0 text-xs font-medium text-slate-400">
                              {formatNotificationTime(
                                notification.createdAt
                              )}
                            </span>

                          </div>

                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {notification.message}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">

                            {/* TYPE */}

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${style.badge}`}
                            >
                              {style.label}
                            </span>

                            {/* REPORT ID */}

                            {notification.reportId && (
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                <FileText
                                  size={13}
                                />

                                {notification.reportId}
                              </span>
                            )}

                            {/* LOCATION */}

                            {notification.location && (
                              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                <MapPin
                                  size={13}
                                />

                                {notification.location}
                              </span>
                            )}

                          </div>

                        </div>

                        {/* ARROW */}

                        <div className="hidden shrink-0 items-center text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600 sm:flex">
                          <ChevronRight
                            size={21}
                          />
                        </div>

                      </div>
                    </button>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* =========================================================
            FOOTER INFO
        ========================================================== */}

        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-800">

          <Bell
            size={18}
            className="mt-0.5 shrink-0"
          />

          <p className="leading-6">
            Notifications help your department
            respond quickly to citizen problems.
            Select any notification to open the
            related report and take action.
          </p>

        </div>

      </div>
    </GovernmentLayout>
  );
}