import { useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";

import CitizenLayout from "../components/citizen/CitizenLayout";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { formatDate, getStatusTone } from "../utils/citizenStorage";

function MyProblemsPage() {
  const { language, t } = useLanguage();

  const [reportId, setReportId] = useState("");
  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const copy = {
    title: t.citizen?.track?.title || (language === "hi" ? "अपनी समस्या ट्रैक करें" : "Track Your Problem"),
    subtitle:
      t.citizen?.track?.subtitle ||
      (language === "hi"
        ? "दर्ज की गई रिपोर्ट आईडी डालें और वर्तमान स्थिति देखें।"
        : "Enter the report ID and check the current status of your complaint."),
    placeholder:
      t.citizen?.track?.placeholder ||
      (language === "hi" ? "अपनी रिपोर्ट आईडी दर्ज करें" : "Enter your Report ID"),
    button:
      t.citizen?.track?.button || (language === "hi" ? "स्थिति देखें" : "Track Status"),
    checking:
      t.citizen?.track?.checking || (language === "hi" ? "जांच हो रही है..." : "Checking..."),
    empty:
      t.citizen?.track?.empty ||
      (language === "hi"
        ? "कृपया रिपोर्ट आईडी दर्ज करें।"
        : "Please enter your Report ID."),
    notFound:
      t.citizen?.track?.notFound ||
      (language === "hi"
        ? "इस रिपोर्ट आईडी से कोई रिपोर्ट नहीं मिली।"
        : "No report was found with this Report ID."),
    unauthorized:
      t.citizen?.track?.unauthorized ||
      (language === "hi"
        ? "आप इस रिपोर्ट को देखने के लिए अधिकृत नहीं हैं।"
        : "You are not authorized to view this report."),
    generic:
      t.citizen?.track?.generic ||
      (language === "hi"
        ? "रिपोर्ट स्थिति जांचने में समस्या हुई। कृपया फिर से प्रयास करें।"
        : "Unable to check the report status. Please try again."),
    reportId: t.citizen?.track?.reportId || (language === "hi" ? "रिपोर्ट आईडी" : "Report ID"),
    problem: t.citizen?.track?.problem || (language === "hi" ? "समस्या" : "Problem"),
    description: t.citizen?.track?.description || (language === "hi" ? "विवरण" : "Description"),
    category: t.citizen?.track?.category || (language === "hi" ? "श्रेणी" : "Category"),
    priority: t.citizen?.track?.priority || (language === "hi" ? "प्राथमिकता" : "Priority"),
    location: t.citizen?.track?.location || (language === "hi" ? "स्थान" : "Location"),
    submitted: t.citizen?.track?.submitted || (language === "hi" ? "दर्ज किया गया" : "Submitted"),
    currentStatus: t.citizen?.track?.currentStatus || (language === "hi" ? "वर्तमान स्थिति" : "Current Status"),
    statusHistory: t.citizen?.track?.statusHistory || (language === "hi" ? "स्थिति इतिहास" : "Status History"),
    helpTitle: t.citizen?.track?.helpTitle || (language === "hi" ? "अपनी रिपोर्ट की स्थिति जांचें" : "Check your report status"),
    helpText:
      t.citizen?.track?.helpText ||
      (language === "hi"
        ? "उपरोक्त रिपोर्ट आईडी दर्ज करें ताकि आप जान सकें कि आपकी समस्या जमा हुई है, समीक्षा में है, प्रगति में है, या हल हो चुकी है।"
        : "Enter the Report ID above to see whether your problem has been submitted, is under review, is in progress, or has been resolved."),
    example: t.citizen?.track?.example || (language === "hi" ? "उदाहरण: रिपोर्ट आईडी दर्ज करें" : "Example: Enter the Report ID provided when your problem was submitted."),
  };

  // =========================================================
  // CHECK REPORT STATUS
  // =========================================================

  const checkStatus = async (event) => {
    event.preventDefault();

    const trimmedId = reportId.trim();

    if (!trimmedId) {
      setError(copy.empty);
      setReport(null);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setReport(null);

      // -----------------------------------------------------
      // GET REPORT BY ID
      // -----------------------------------------------------

      const response = await api.get(
        `/reports/${encodeURIComponent(trimmedId)}`
      );

      const data =
        response.data?.report ||
        response.data;

      if (!data) {
        setError(copy.notFound);
        return;
      }

      setReport(data);

    } catch (err) {
      console.error("Check Report Status Error:", err);

      setReport(null);

      if (err.response?.status === 404) {
        setError(copy.notFound);
      } else if (err.response?.status === 403) {
        setError(copy.unauthorized);
      } else {
        setError(err.response?.data?.message || copy.generic);
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // STATUS ICON
  // =========================================================

  const getStatusIcon = (status) => {
    const normalized = String(
      status || ""
    ).toUpperCase();

    if (normalized === "RESOLVED") {
      return <CheckCircle2 size={22} />;
    }

    if (
      normalized === "IN_PROGRESS" ||
      normalized === "IN PROGRESS"
    ) {
      return <LoaderCircle size={22} />;
    }

    if (normalized === "SUBMITTED") {
      return <ShieldCheck size={22} />;
    }

    if (normalized === "UNDER REVIEW") {
      return <Clock3 size={22} />;
    }

    return <FileText size={22} />;
  };

  return (
    <CitizenLayout
      title={
        t.citizen?.problems?.title ||
        "Track My Problem"
      }
    >
      <div className="mx-auto max-w-5xl space-y-6">

        {/* ===================================================
            HEADER
        ==================================================== */}

        <section className="border border-slate-200 border-t-4 border-t-emerald-700 bg-white p-6 shadow-sm sm:p-8">

          <div className="mx-auto max-w-2xl text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center bg-emerald-100 text-emerald-800">
              <Search size={25} />
            </div>

            <h1 className="mt-4 text-2xl font-bold text-slate-950 sm:text-3xl">
              {copy.title}
            </h1>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              {copy.subtitle}
            </p>

          </div>

        </section>

        {/* ===================================================
            SEARCH BOX
        ==================================================== */}

        <section className="border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <form
            onSubmit={checkStatus}
            className="mx-auto max-w-2xl"
          >

            <label
              htmlFor="reportId"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              {copy.reportId}
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">

              <div className="relative flex-1">

                <FileText
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="reportId"
                  type="text"
                  value={reportId}
                  onChange={(event) =>
                    setReportId(event.target.value)
                  }
                  placeholder={copy.placeholder}
                  autoComplete="off"
                  className="w-full border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />

                    {copy.checking}
                  </>
                ) : (
                  <>
                    <Search size={17} />

                    {copy.button}
                  </>
                )}

              </button>

            </div>

            <p className="mt-2 text-xs text-slate-400">
              {copy.example}
            </p>

          </form>

        </section>

        {/* ===================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">

            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Unable to find report
              </p>

              <p className="mt-1 text-red-600">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* ===================================================
            REPORT RESULT
        ==================================================== */}

        {report && (
          <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">

            {/* RESULT HEADER */}

            <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {copy.reportId}
                  </p>

                  <p className="mt-1 break-all font-mono text-sm font-bold text-slate-800">
                    {report.id || reportId}
                  </p>

                </div>

                <div
                  className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-sm font-bold ${getStatusTone(
                    report.status
                  )}`}
                >
                  {getStatusIcon(report.status)}

                  {formatStatus(report.status, t.citizen?.status)}
                </div>

              </div>

            </div>

            {/* REPORT DETAILS */}

            <div className="space-y-6 p-5 sm:p-6">

              {/* TITLE */}

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {copy.problem}
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  {report.title ||
                    "Untitled Problem"}
                </h2>

              </div>

              {/* DESCRIPTION */}

              {report.description && (
                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {copy.description}
                  </p>

                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {report.description}
                  </p>

                </div>
              )}

              {/* INFORMATION */}

              <div className="grid gap-3 sm:grid-cols-2">

                <InfoCard
                  label={copy.category}
                  value={
                    report.category ||
                    (language === "hi" ? "सामान्य" : "General")
                  }
                />

                <InfoCard
                  label={copy.priority}
                  value={
                    report.priority ||
                    "MEDIUM"
                  }
                />

                <InfoCard
                  label={copy.location}
                  value={
                    [
                      report.address,
                      report.city,
                      report.district,
                      report.state,
                      report.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ") ||
                    (language === "hi" ? "उपलब्ध नहीं" : "Not provided")
                  }
                  icon={<MapPin size={15} />}
                />

                <InfoCard
                  label={copy.submitted}
                  value={
                    formatDate(
                      report.createdAt
                    ) || (language === "hi" ? "उपलब्ध नहीं" : "Not available")
                  }
                  icon={<Calendar size={15} />}
                />

              </div>

              {/* STATUS MESSAGE */}

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                    {getStatusIcon(
                      report.status
                    )}
                  </div>

                  <div>

                    <h3 className="text-sm font-bold text-slate-900">
                      {copy.currentStatus}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {getStatusMessage(
                        report.status,
                        language
                      )}
                    </p>

                  </div>

                </div>

              </div>

              {/* STATUS HISTORY */}

              {Array.isArray(
                report.statusHistory
              ) &&
                report.statusHistory.length > 0 && (
                  <StatusHistory
                    history={
                      report.statusHistory
                    }
                    title={copy.statusHistory}
                        statusLabels={t.citizen?.status}
                  />
                )}

            </div>

          </section>
        )}

        {/* ===================================================
            INITIAL HELP
        ==================================================== */}

        {!report && !loading && !error && (
          <section className="rounded-[26px] border border-dashed border-slate-300 bg-white px-5 py-10 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileText size={24} />
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-900">
              {copy.helpTitle}
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
              {copy.helpText}
            </p>

          </section>
        )}

      </div>
    </CitizenLayout>
  );
}


// ============================================================
// INFO CARD
// ============================================================

function InfoCard({
  label,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">

      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400">

        {icon}

        {label}

      </div>

      <p className="mt-2 wrap-break-word text-sm font-semibold text-slate-700">
        {value}
      </p>

    </div>
  );
}


// ============================================================
// STATUS HISTORY
// ============================================================

function StatusHistory({
  history,
  title,
  statusLabels,
}) {
  return (
    <div>

      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {title}
      </p>

      <div className="mt-4 space-y-4">

        {history.map((entry, index) => (
          <div
            key={`${entry.status}-${index}`}
            className="flex gap-3"
          >

            <div className="flex flex-col items-center">

              <div className="mt-1 h-3 w-3 rounded-full bg-emerald-500" />

              {index <
                history.length - 1 && (
                <div className="mt-1 h-full min-h-8 w-px bg-slate-200" />
              )}

            </div>

            <div className="pb-3">

              <p className="text-sm font-bold text-slate-800">
                {formatStatus(
                  entry.status,
                  statusLabels
                )}
              </p>

              {entry.note && (
                <p className="mt-1 text-sm text-slate-500">
                  {entry.note}
                </p>
              )}

              {entry.createdAt && (
                <p className="mt-1 text-xs text-slate-400">
                  {formatDate(
                    entry.createdAt
                  )}
                </p>
              )}

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}


// ============================================================
// STATUS FORMATTER
// ============================================================

function formatStatus(status, statusLabels = {}) {
  if (!status) {
    return statusLabels.draft || "DRAFT";
  }

  const normalized = String(status).toUpperCase().replace(/ /g, "_");
  const labelKey = {
    DRAFT: "draft",
    SUBMITTED: "submitted",
    UNDER_REVIEW: "underReview",
    IN_PROGRESS: "inProgress",
    RESOLVED: "resolved",
    REJECTED: "rejected",
  }[normalized];

  return statusLabels[labelKey] || String(status).replace(/_/g, " ");
}


// ============================================================
// STATUS MESSAGE
// ============================================================

function getStatusMessage(status, language = "en") {
  const normalized = String(
    status || ""
  ).toUpperCase();

  switch (normalized) {
    case "SUBMITTED":
      return language === "hi"
        ? "आपकी रिपोर्ट सफलतापूर्वक दर्ज हो गई है और आगे की कार्रवाई की प्रतीक्षा में है।"
        : "Your report has been successfully submitted and is awaiting further action.";

    case "UNDER REVIEW":
    case "UNDER_REVIEW":
      return language === "hi"
        ? "संबंधित विभाग आपकी रिपोर्ट की समीक्षा कर रहा है।"
        : "Your report is currently being reviewed by the concerned department.";

    case "IN PROGRESS":
    case "IN_PROGRESS":
      return language === "hi"
        ? "संबंधित विभाग आपकी समस्या के समाधान पर काम कर रहा है।"
        : "The concerned department is currently working on resolving your reported problem.";

    case "RESOLVED":
      return language === "hi"
        ? "आपकी समस्या का समाधान हो चुका है।"
        : "Your reported problem has been marked as resolved.";

    case "REJECTED":
      return language === "hi"
        ? "आपकी रिपोर्ट अस्वीकार कर दी गई है। कृपया विवरण देखें या संबंधित विभाग से संपर्क करें।"
        : "Your report has been rejected. Please check the report details or contact the concerned department.";

    case "DRAFT":
      return language === "hi"
        ? "यह रिपोर्ट अभी ड्राफ्ट है और जमा नहीं की गई है।"
        : "This report is still a draft and has not been submitted yet.";

    default:
      return language === "hi"
        ? "आपकी रिपोर्ट प्राप्त हो गई है। स्थिति अपडेट के लिए बाद में फिर जांचें।"
        : "Your report has been received. Please check again later for status updates.";
  }
}


export default MyProblemsPage;