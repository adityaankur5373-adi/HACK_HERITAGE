import GovernmentLayout from "../components/government/GovernmentLayout";
import useAuthStore from "../store/authStore";

export default function GovernmentInfoPage({ mode = "notifications" }) {
  const { user } = useAuthStore();
  const isProfile = mode === "profile";

  return (
    <GovernmentLayout title={isProfile ? "Government Profile" : "Notifications"}>
      <section className="border border-slate-200 border-t-4 border-t-emerald-700 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">JanSamadhan</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">
          {isProfile ? "Government Profile" : "Notifications"}
        </h2>
        {isProfile ? (
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["Name", user?.name],
              ["Employee ID", user?.employeeId],
              ["Email", user?.email],
              ["Department", user?.department],
              ["Designation", user?.designation],
              ["Office", user?.office],
              ["District", user?.district],
              ["State", user?.state],
            ].map(([label, value]) => (
              <div key={label} className="border border-slate-200 bg-slate-50 p-4">
                <dt className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</dt>
                <dd className="mt-2 text-sm font-semibold text-slate-900">{value || "-"}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-3 text-sm text-slate-600">No new government notifications.</p>
        )}
      </section>
    </GovernmentLayout>
  );
}