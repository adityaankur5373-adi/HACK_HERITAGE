import { useEffect, useState } from "react";
import { AlertCircle, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import GovernmentLayout from "../components/government/GovernmentLayout";

export default function GovernmentReportsPage() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/government/reports");

        console.log("Government reports response:", response.data);

        setReports(response.data.reports || []);
      } catch (err) {
        console.error("Government reports error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load reports."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const visible = reports.filter((report) =>
    `${report.id} ${report.title} ${report.category} ${report.status} ${report.district} ${report.city}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <GovernmentLayout title="Reports">
      <section className="border border-slate-200 border-t-4 border-t-emerald-700 bg-white shadow-sm">

        {/* HEADER */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">
              Department Queue
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">
              Reports
            </h2>

            {!loading && (
              <p className="mt-1 text-xs text-slate-500">
                {reports.length} report
                {reports.length !== 1 ? "s" : ""} assigned
              </p>
            )}
          </div>

          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search reports"
              className="border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-700"
            />
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="m-5 flex gap-2 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            Loading government reports...
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && visible.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="font-semibold text-slate-800">
              {query
                ? "No reports match your search."
                : "No reports assigned to your department."}
            </p>

            {!query && (
              <p className="mt-2 text-sm text-slate-500">
                Reports will appear here after they are
                automatically routed to your government office.
              </p>
            )}
          </div>
        )}

        {/* REPORTS */}
        {!loading && visible.length > 0 && (
          <div className="divide-y divide-slate-200">

            {visible.map((report) => (
              <button
                key={report.id}
                type="button"
                onClick={() =>
                  navigate(
                    `/government/reports/${report.id}`
                  )
                }
                className="grid w-full gap-3 px-5 py-4 text-left transition hover:bg-emerald-50/60 md:grid-cols-[1.2fr_0.8fr_0.6fr_0.6fr]"
              >
                {/* REPORT */}
                <div>
                  <p className="break-all font-mono text-xs font-bold text-slate-500">
                    {report.id}
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {report.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {report.category}
                  </p>
                </div>

                {/* LOCATION */}
                <span className="text-sm text-slate-600">
                  {report.district ||
                    report.city ||
                    "Location unavailable"}
                </span>

                {/* PRIORITY */}
                <span className="text-sm font-semibold text-slate-700">
                  {report.priority || "-"}
                </span>

                {/* STATUS */}
                <span className="text-sm font-semibold text-emerald-800">
                  {report.status || "-"}
                </span>
              </button>
            ))}

          </div>
        )}
      </section>
    </GovernmentLayout>
  );
}