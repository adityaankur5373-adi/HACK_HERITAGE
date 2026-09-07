import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, GraduationCap, Landmark, LockKeyhole, Mail, University, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuthStore from "../store/authStore";
import { useLanguage } from "../context/LanguageContext";

const roleConfig = {
  student: {
    key: "student",
    icon: GraduationCap,
    registerPath: "/auth/student/register",
    loginPath: "/auth/student/login",
    dashboard: "/student/dashboard",
    fields: [
      ["name", "name"],
      ["email", "email"],
      ["studentId", "studentId"],
      ["universityId", "universityId"],
    ],
  },
  university: {
    key: "university",
    icon: University,
    registerPath: "/auth/university/register",
    loginPath: "/auth/university/login",
    dashboard: "/university/dashboard",
    fields: [
      ["name", "universityName"],
      ["email", "email"],
      ["registrationNumber", "registrationNumber"],
    ],
  },
  government: {
    key: "government",
    icon: Landmark,
    registerPath: "/auth/government/register",
    loginPath: "/auth/government/login",
    dashboard: "/government/dashboard",
    fields: [
      ["name", "name"],
      ["email", "email"],
      ["employeeId", "employeeId"],
      ["department", "department"],
    ],
  },
};

function RoleAuth({ role }) {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { t } = useLanguage();
  const config = roleConfig[role];
  const Icon = config.icon;
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({});
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email?.trim() || !password) {
      setError(t.roleAuth.emailPasswordRequired);
      return;
    }

    if (isRegister && config.fields.some(([field]) => !form[field]?.trim())) {
      setError(t.roleAuth.completeFields);
      return;
    }

    if (password.length < 8) {
      setError(t.roleAuth.passwordRequired);
      return;
    }

    const payload = isRegister
      ? { ...form, password }
      : { email: form.email.trim(), password };

    try {
      setLoading(true);
      const response = await api.post(
        isRegister ? config.registerPath : config.loginPath,
        payload
      );
      const data = response.data;

      if (!data?.token || !data?.user) {
        throw new Error("Authentication failed");
      }

      login(data.token, data.user);
      navigate(config.dashboard, { replace: true });
    } catch (requestError) {
      const validationMessage = requestError.response?.data?.errors
        ?.map((item) => item.message)
        .join(" ");

      setError(
        validationMessage ||
        requestError.response?.data?.message ||
          t.roleAuth.networkError
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-slate-50 px-4 py-8 sm:px-6">
      <div className="fixed inset-0 z-0">
        <img src="/images/login.png" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <section className="w-full max-w-md rounded-2xl border border-white/80 bg-white/90 p-6 shadow-2xl backdrop-blur sm:p-8">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-green-800"
          >
            <ArrowLeft size={16} /> {t.roleAuth.backToRoles}
          </button>

          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-800 text-white">
              <Icon size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-700">{t.login.badge}</p>
              <h1 className="text-2xl font-bold text-slate-900">
                {isRegister
                  ? `${t.roleAuth.create} ${t.roleAuth.roles[config.key]} ${t.roleAuth.account}`
                  : `${t.roleAuth.roles[config.key]} ${t.roleAuth.login}`}
              </h1>
            </div>
          </div>

          <p className="mb-6 text-sm text-slate-500">
            {isRegister
              ? `${t.roleAuth.registerToAccess} ${t.roleAuth.roles[config.key].toLowerCase()} ${t.roleAuth.portal}.`
              : `${t.roleAuth.signInTo} ${t.roleAuth.roles[config.key].toLowerCase()} ${t.roleAuth.portal}.`}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {isRegister && config.fields.map(([field, fieldKey]) => (
              <label key={field} className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">{t.roleAuth.fields[fieldKey].label}</span>
                <div className="relative">
                  {field === "email" ? (
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  ) : (
                    <UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  )}
                  <input
                    type={field === "email" ? "email" : "text"}
                    value={form[field] || ""}
                    onChange={(event) => updateField(field, event.target.value)}
                    placeholder={t.roleAuth.fields[fieldKey].placeholder}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </label>
            ))}

            {!isRegister && (
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-700">{t.roleAuth.fields.email.label}</span>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={form.email || ""}
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder={t.roleAuth.fields.email.placeholder}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                  />
                </div>
              </label>
            )}

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-700">{t.roleAuth.password}</span>
              <div className="relative">
                <LockKeyhole size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder={t.roleAuth.passwordPlaceholder}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-10 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-label={showPassword ? t.roleAuth.hidePassword : t.roleAuth.showPassword}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-green-800 text-sm font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t.roleAuth.pleaseWait : isRegister ? t.roleAuth.createAccount : t.roleAuth.login}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isRegister ? t.roleAuth.alreadyAccount : t.roleAuth.noAccount}{" "}
            <button
              type="button"
              onClick={() => {
                setIsRegister((current) => !current);
                setError("");
              }}
              className="font-semibold text-green-800 hover:text-green-950"
            >
              {isRegister ? t.roleAuth.login : t.roleAuth.register}
            </button>
          </p>
        </section>
      </main>
    </div>
  );
}

export default RoleAuth;
