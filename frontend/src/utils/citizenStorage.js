export const REPORT_STORAGE_KEY = "janSamadhan_reports";
export const CONVERSATION_STORAGE_KEY = "janSamadhan_conversations";
export const SUPPORT_STORAGE_KEY = "janSamadhan_supported_reports";

export function readReports() {
  try {
    const raw = localStorage.getItem(REPORT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to read reports", error);
    return [];
  }
}

export function writeReports(reports) {
  localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(reports));
}

export function upsertReport(report) {
  const reports = readReports();
  const index = reports.findIndex((item) => item.id === report.id);

  if (index >= 0) {
    reports[index] = { ...reports[index], ...report };
  } else {
    reports.unshift({
      ...report,
      createdAt: report.createdAt || new Date().toISOString(),
    });
  }

  writeReports(reports);
  return reports;
}

export function readConversation(conversationId) {
  if (!conversationId) {
    return [];
  }

  try {
    const raw = localStorage.getItem(`${CONVERSATION_STORAGE_KEY}_${conversationId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to read conversation", error);
    return [];
  }
}

export function writeConversation(conversationId, messages) {
  if (!conversationId) {
    return;
  }

  localStorage.setItem(
    `${CONVERSATION_STORAGE_KEY}_${conversationId}`,
    JSON.stringify(messages)
  );
}

export function readSupportedReports() {
  try {
    const raw = localStorage.getItem(SUPPORT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

export function setSupportedReport(reportId) {
  const supported = readSupportedReports();
  supported[reportId] = true;
  localStorage.setItem(SUPPORT_STORAGE_KEY, JSON.stringify(supported));
}

export function isReportSupported(reportId) {
  return !!readSupportedReports()[reportId];
}

export function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getStatusTone(status) {
  const normalized = (status || "").toUpperCase();

  if (normalized === "RESOLVED") return "bg-emerald-100 text-emerald-700";
  if (normalized === "IN PROGRESS" || normalized === "IN_PROGRESS") return "bg-amber-100 text-amber-700";
  if (normalized === "UNDER REVIEW" || normalized === "UNDER_REVIEW") return "bg-sky-100 text-sky-700";
  if (normalized === "REJECTED") return "bg-rose-100 text-rose-700";
  if (normalized === "SUBMITTED") return "bg-violet-100 text-violet-700";
  if (normalized === "DRAFT") return "bg-slate-200 text-slate-700";
  return "bg-slate-100 text-slate-600";
}
