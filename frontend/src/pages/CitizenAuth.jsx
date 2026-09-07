import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  UserRound,
  Mail,
  MapPin,
  Building2,
  MapPinned,
} from "lucide-react";

import api from "../services/api";
import useAuthStore from "../store/authStore";
import { useLanguage } from "../context/LanguageContext";

const CitizenAuth = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const login = useAuthStore((state) => state.login);

  const [isRegister, setIsRegister] = useState(false);

  // Login
  const [loginMobile, setLoginMobile] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (registerMode) => {
    setIsRegister(registerMode);
    setError("");
    setShowPassword(false);
  };

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    const mobileRegex = /^[6-9][0-9]{9}$/;

    if (!mobileRegex.test(loginMobile)) {
      setError(t.login.citizenLogin.invalidMobile);
      return;
    }

    if (!loginPassword) {
      setError(t.login.citizenLogin.passwordRequired);
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/citizen/login", {
        mobile: loginMobile,
        password: loginPassword,
      });

      const data = response.data;

      if (!data?.token || !data?.user) {
        setError(t.login.citizenLogin.loginFailed);
        return;
      }

      login(data.token, data.user);

      navigate("/citizen/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          t.login.citizenLogin.networkError
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // REGISTER
  // --------------------------------------------------

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError(t.login.citizenRegister.invalidName);
      return;
    }

    const mobileRegex = /^[6-9][0-9]{9}$/;

    if (!mobileRegex.test(mobile)) {
      setError(t.login.citizenRegister.invalidMobile);
      return;
    }

    if (
      email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      setError(t.login.citizenRegister.invalidEmail);
      return;
    }

    if (password.length < 8) {
      setError(t.login.citizenRegister.passwordRequired);
      return;
    }

    const pincodeRegex = /^[1-9][0-9]{5}$/;

    if (!pincodeRegex.test(pincode)) {
      setError(t.login.citizenRegister.invalidPincode);
      return;
    }

    try {
      setLoading(true);
      console.log("REGISTER PAYLOAD:", {
  name: name.trim(),
  mobile: mobile.trim(),
  email: email.trim() || undefined,
  password,
  address: address.trim(),
  city: city.trim(),
  district: district.trim(),
  state: state.trim(),
  pincode: pincode.trim(),
});
      const response = await api.post(
        "/auth/citizen/register",
        {
          name: name.trim(),
          mobile: mobile.trim(),
          email: email.trim() || undefined,
          password,

          // Required address fields
          address: address.trim(),
          city: city.trim(),
          district: district.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        }
      );

      const data = response.data;

      if (!data?.token || !data?.user) {
        setError(
          t.login.citizenRegister.registrationFailed
        );
        return;
      }

      login(data.token, data.user);

      navigate("/citizen/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          t.login.citizenRegister.networkError
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // MOBILE
  // --------------------------------------------------

  const handleMobileChange = (e, type) => {
    const value = e.target.value.replace(/\D/g, "");

    if (value.length > 10) return;

    if (type === "login") {
      setLoginMobile(value);
    } else {
      setMobile(value);
    }

    setError("");
  };

  // --------------------------------------------------
  // PINCODE
  // --------------------------------------------------

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");

    if (value.length <= 6) {
      setPincode(value);
    }

    setError("");
  };

  // --------------------------------------------------
  // INPUT STYLE
  // --------------------------------------------------

  const inputClass =
    "h-10 w-full rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100";

  return (
    <div className="relative min-h-screen w-full">

      {/* Background */}

      <div className="fixed inset-0 -z-10">
        <img
          src="/images/login.png"
          alt=""
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/25" />
      </div>

      {/* Main */}

      <main className="flex min-h-screen items-center justify-center px-4 py-4">

        {/* SMALL CARD */}

        <section className="w-full max-w-xl rounded-2xl bg-white/95 shadow-2xl backdrop-blur-md">

          <div className="px-5 py-5 sm:px-7 sm:py-6">

            {/* Back */}

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mb-3 flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-green-700"
            >
              <ArrowLeft size={15} />
              Back
            </button>

            {/* Header */}

            <div className="mb-4 text-center">

              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
                <UserRound size={20} />
              </div>

              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {isRegister
                  ? t.login.citizenRegister.title
                  : t.login.citizenLogin.title}
              </h1>

              <p className="mt-1 text-xs text-gray-500">
                {isRegister
                  ? t.login.citizenRegister.subtitle
                  : t.login.citizenLogin.subtitle}
              </p>
            </div>

            {/* Tabs */}

            <div className="mx-auto mb-4 flex max-w-sm rounded-lg bg-gray-100 p-1">

              <button
                type="button"
                onClick={() => switchMode(false)}
                className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
                  !isRegister
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                {t.login.citizenLogin.loginButton}
              </button>

              <button
                type="button"
                onClick={() => switchMode(true)}
                className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
                  isRegister
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                {t.login.citizenLogin.registerButton}
              </button>

            </div>

            {/* Error */}

            {error && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* ======================================================
                LOGIN
            ======================================================= */}

            {!isRegister ? (

              <form
                onSubmit={handleLogin}
                className="mx-auto max-w-sm space-y-3"
              >

                {/* Mobile */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    {t.login.citizenLogin.mobile}
                  </label>

                  <div className="relative">

                    <Phone
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="tel"
                      value={loginMobile}
                      onChange={(e) =>
                        handleMobileChange(e, "login")
                      }
                      maxLength={10}
                      placeholder={
                        t.login.citizenLogin.mobilePlaceholder
                      }
                      className={`${inputClass} pl-9 pr-3`}
                    />

                  </div>

                </div>

                {/* Password */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    {t.login.citizenLogin.password}
                  </label>

                  <div className="relative">

                    <LockKeyhole
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        setError("");
                      }}
                      placeholder={
                        t.login.citizenLogin.passwordPlaceholder
                      }
                      className={`${inputClass} pl-9 pr-10`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>

                  </div>

                </div>

                {/* Login */}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-green-700 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-60"
                >

                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      {t.login.citizenLogin.loginButton}
                      <ArrowRight size={16} />
                    </>
                  )}

                </button>

                {/* Register */}

                <div className="text-center text-xs">

                  <span className="text-gray-500">
                    {t.login.citizenLogin.registerText}
                  </span>

                  <button
                    type="button"
                    onClick={() => switchMode(true)}
                    className="ml-1 font-semibold text-green-700 hover:underline"
                  >
                    {t.login.citizenLogin.registerButton}
                  </button>

                </div>

              </form>

            ) : (

              /* ====================================================
                  REGISTER
              ===================================================== */

              <form
                onSubmit={handleRegister}
                className="grid grid-cols-1 gap-x-3 gap-y-2.5 sm:grid-cols-2"
              >

                {/* Name */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    {t.login.citizenRegister.name}
                  </label>

                  <div className="relative">

                    <UserRound
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError("");
                      }}
                      placeholder={
                        t.login.citizenRegister.namePlaceholder
                      }
                      className={`${inputClass} pl-9 pr-3`}
                    />

                  </div>

                </div>

                {/* Mobile */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    {t.login.citizenRegister.mobile}
                  </label>

                  <div className="relative">

                    <Phone
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) =>
                        handleMobileChange(
                          e,
                          "register"
                        )
                      }
                      maxLength={10}
                      placeholder={
                        t.login.citizenRegister.mobilePlaceholder
                      }
                      className={`${inputClass} pl-9 pr-3`}
                    />

                  </div>

                </div>

                {/* Email */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    {t.login.citizenRegister.email}
                  </label>

                  <div className="relative">

                    <Mail
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder={
                        t.login.citizenRegister.emailPlaceholder
                      }
                      className={`${inputClass} pl-9 pr-3`}
                    />

                  </div>

                </div>

                {/* Password */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    {t.login.citizenRegister.password}
                  </label>

                  <div className="relative">

                    <LockKeyhole
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      placeholder={
                        t.login.citizenRegister.passwordPlaceholder
                      }
                      className={`${inputClass} pl-9 pr-9`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? (
                        <EyeOff size={15} />
                      ) : (
                        <Eye size={15} />
                      )}
                    </button>

                  </div>

                </div>

                {/* Address */}

                <div className="sm:col-span-2">

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    {t.login.citizenRegister.address}
                  </label>

                  <div className="relative">

                    <MapPin
                      size={15}
                      className="absolute left-3 top-3 text-gray-400"
                    />

                    <textarea
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        setError("");
                      }}
                      rows={1}
                      placeholder={
                        t.login.citizenRegister.addressPlaceholder
                      }
                      className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                    />

                  </div>

                </div>

                {/* City */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    {t.login.citizenRegister.city}
                  </label>

                  <div className="relative">

                    <Building2
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setError("");
                      }}
                      placeholder={
                        t.login.citizenRegister.cityPlaceholder
                      }
                      className={`${inputClass} pl-9 pr-3`}
                    />

                  </div>

                </div>

                {/* District */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    {t.login.citizenRegister.district}
                  </label>

                  <div className="relative">

                    <MapPinned
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      value={district}
                      onChange={(e) => {
                        setDistrict(e.target.value);
                        setError("");
                      }}
                      placeholder={
                        t.login.citizenRegister.districtPlaceholder
                      }
                      className={`${inputClass} pl-9 pr-3`}
                    />

                  </div>

                </div>

                {/* State */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    {t.login.citizenRegister.state}
                  </label>

                  <div className="relative">

                    <MapPinned
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value);
                        setError("");
                      }}
                      placeholder={
                        t.login.citizenRegister.statePlaceholder
                      }
                      className={`${inputClass} pl-9 pr-3`}
                    />

                  </div>

                </div>

                {/* Pincode */}

                <div>

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    {t.login.citizenRegister.pincode}
                  </label>

                  <input
                    type="text"
                    value={pincode}
                    onChange={handlePincodeChange}
                    maxLength={6}
                    placeholder={
                      t.login.citizenRegister.pincodePlaceholder
                    }
                    className={`${inputClass} px-3`}
                  />

                </div>

                {/* Register Button */}

                <div className="flex items-end">

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-green-700 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-60"
                  >

                    {loading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        {t.login.citizenRegister.registerButton}
                        <ArrowRight size={16} />
                      </>
                    )}

                  </button>

                </div>

                {/* Login */}

                <div className="pt-1 text-center text-xs sm:col-span-2">

                  <span className="text-gray-500">
                    {t.login.citizenRegister.alreadyAccount}
                  </span>

                  <button
                    type="button"
                    onClick={() => switchMode(false)}
                    className="ml-1 font-semibold text-green-700 hover:underline"
                  >
                    {t.login.citizenRegister.loginButton}
                  </button>

                </div>

              </form>
            )}

            {/* Security */}

            <div className="mt-3 border-t border-gray-100 pt-2 text-center">

              <p className="text-[10px] text-gray-400">
                Your information is securely processed by JanSamadhan.
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
};

export default CitizenAuth;