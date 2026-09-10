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

  useEffect(() => {
    const loadReport = async () => {
      try {
        setError("");

        const response = await api.get(
          `/government/reports/${reportId}`
        );

        setReport(response.data.report);
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

              {/* VERIFIED */}
              {report.status === "VERIFIED" && (
                <button
                  disabled={saving}
                  onClick={() => review("ASSIGNED")}
                  className="bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  Assign
                </button>
              )}

              {/* ASSIGNED */}
              {report.status === "ASSIGNED" && (
                <button
                  disabled={saving}
                  onClick={() => review("IMPLEMENTATION")}
                  className="bg-indigo-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  Start Implementation
                </button>
              )}

              {/* IMPLEMENTATION */}
              {report.status === "IMPLEMENTATION" && (
                <button
                  disabled={saving}
                  onClick={() => review("RESOLVED")}
                  className="bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  Mark Resolved
                </button>
              )}

              {/* REJECT */}
              {["SUBMITTED", "UNDER_REVIEW", "VERIFIED", "ASSIGNED", "IMPLEMENTATION"].includes(
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