import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

import CitizenLayout from "../components/citizen/CitizenLayout";
import api from "../services/api";
import useAuthStore from "../store/authStore";
import useLanguage from "../context/useLanguage";

function ProfilePage() {
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get("/auth/me");
        const data = response.data?.user || response.data;

        if (active) {
          setProfile(data.citizen || data);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setError(err.response?.data?.message || "Unable to load profile.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, []);

  const citizen = profile || user || {};

  return (
    <CitizenLayout title={t.citizen?.profile?.title || "Profile"}>
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-slate-500">{t.citizen?.profile?.loading || "Loading profile..."}</div>
      ) : (
        <div className="border border-slate-200 border-t-4 border-t-emerald-700 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-4 border-b border-slate-200 pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-800">{(citizen.name || "C").charAt(0).toUpperCase()}</div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">Citizen Services Account</p>
              <h2 className="text-2xl font-bold text-slate-900">{citizen.name || "Citizen"}</h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoField label={t.citizen?.profile?.name || "Name"} value={citizen.name || "-"} />
            <InfoField label={t.citizen?.profile?.email || "Email"} value={citizen.email || "-"} />
            <InfoField label={t.citizen?.profile?.phone || "Phone"} value={citizen.mobile || "-"} />
            <InfoField label={t.citizen?.profile?.address || "Address"} value={citizen.address || "-"} />
            <InfoField label={t.citizen?.profile?.city || "City"} value={citizen.city || "-"} />
            <InfoField label={t.citizen?.profile?.district || "District"} value={citizen.district || "-"} />
            <InfoField label={t.citizen?.profile?.state || "State"} value={citizen.state || "-"} />
            <InfoField label={t.citizen?.profile?.pincode || "Pincode"} value={citizen.pincode || "-"} />
          </div>
        </div>
      )}
    </CitizenLayout>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

export default ProfilePage;
