import React, { useState } from "react";
import { motion } from "motion/react";
import { Heart, Activity, Mail, Lock, AlertCircle } from "lucide-react";

export default function LoginPage({
  onLoginSuccess,
  onGoToRegister,
  onGoToHome,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [activePreset, setActivePreset] = useState(null);

  // Quick fill helper for the previewer
  const fillPreset = (type) => {
    if (type === "donor") {
      setEmail("deepika@donor.com");
      setPassword("donor123");
      setActivePreset("donor");
    } else if (type === "hospital") {
      setEmail("citygeneral@hospital.com");
      setPassword("hosp123");
      setActivePreset("hospital");
    } else if (type === "admin") {
      setEmail("admin@lifedrop.org");
      setPassword("admin123");
      setActivePreset("admin");
    }
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          throw new Error(
            `Invalid server response: ${response.status} ${response.statusText}`,
          );
        }
      }

      if (!response.ok) {
        const errorMessage = data?.error || response.statusText || "Authentication failed. Try again.";
        throw new Error(errorMessage);
      }

      if (!data || !data.token) {
        throw new Error("Unexpected login response from server.");
      }

      onLoginSuccess(data.token, data.userType, data.account);
    } catch (err) {
      setErrorMessage(err.message || "Unable to reach server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-[#FAFAFA] dark:bg-[#111827] text-gray-900 dark:text-white transition-colors duration-250">
      {/* Split-Screen - Left panel (Atmospheric Graphic, hidden on small) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-50/60 via-slate-50 to-white dark:from-[#0b1329] dark:via-[#111827] dark:to-[#0b1329] p-12 flex-col justify-between relative overflow-hidden text-gray-900 dark:text-white border-r border-gray-150 dark:border-white/5 transition-colors duration-250">
        {/* Animated ambient overlay */}
        <div className="absolute w-80 h-80 rounded-full bg-red-600/10 dark:bg-red-600/20 blur-3xl -top-20 -left-20" />
        <div className="absolute w-80 h-80 rounded-full bg-red-400/5 dark:bg-red-400/10 blur-3xl -bottom-20 -right-20" />

        {/* Top brand header */}
        <div
          onClick={onGoToHome}
          className="flex items-center gap-2.5 cursor-pointer z-10"
        >
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/10">
            <Heart size={20} className="fill-white text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">
            LifeDrop
          </span>
        </div>

        {/* Floating Content Card */}
        <div className="z-10 max-w-md space-y-6 self-center my-auto text-left">
          <span className="text-xs font-semibold px-3 py-1 bg-red-50 dark:bg-white/5 border border-red-100 dark:border-white/10 text-red-600 dark:text-red-400 rounded-full inline-flex items-center gap-1.5 uppercase tracking-wide">
            <Activity size={12} className="animate-pulse" /> Verified Network
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-gray-900 dark:text-white">
            Connect Instantly.
            <br />
            Save Immediately.
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium">
            Logging in grants secure workspace access. Hospitals coordinate
            emergencies, while our donors retrieve certified active alerts on
            local demands instantly.
          </p>

          {/* Quick Stats Panel inside left screen */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-150 dark:border-white/5">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">25k+</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                Active Donors
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">Chennai</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                Central hub
              </p>
            </div>
          </div>
        </div>

        {/* Bottom micro branding details */}
        <div className="z-10 text-xs text-gray-400 dark:text-gray-500 font-medium">
          Licensed medical security authentication. © 2026 LifeDrop.
        </div>
      </div>

      {/* Split-Screen - Right panel (Login Form UI) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative bg-white dark:bg-[#111827] transition-colors">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Welcome Back
            </h3>
            <p className="text-sm text-gray-450 dark:text-gray-300">
              Sign in to manage your donations or emergency requirements.
            </p>
          </div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 text-red-700 dark:text-red-400 rounded-2xl text-xs font-semibold flex items-start gap-2 max-w-full text-left"
            >
              <AlertCircle
                size={16}
                className="shrink-0 mt-0.5 animate-bounce"
              />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* QUICK PRESETS FOR PREVIEW TESTING */}
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-2.5 text-left">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-300 uppercase tracking-widest text-center">
              Fast Simulation Logins
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="preset-donor-btn"
                onClick={() => fillPreset("donor")}
                className={`py-2 px-1 text-[10px] font-bold rounded-xl border transition cursor-pointer ${
                  activePreset === "donor"
                    ? "bg-red-650 text-white border-transparent hover:scale-[1.02] hover:shadow-sm"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-150 dark:border-gray-700 hover:scale-[1.02] hover:shadow-xs"
                }`}
              >
                Test Donor
              </button>
              <button
                type="button"
                id="preset-hospital-btn"
                onClick={() => fillPreset("hospital")}
                className={`py-2 px-1 text-[10px] font-bold rounded-xl border transition cursor-pointer ${
                  activePreset === "hospital"
                    ? "bg-red-650 text-white border-transparent hover:scale-[1.02] hover:shadow-sm"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-150 dark:border-gray-700 hover:scale-[1.02] hover:shadow-xs"
                }`}
              >
                Test Hospital
              </button>
              <button
                type="button"
                id="preset-admin-btn"
                onClick={() => fillPreset("admin")}
                className={`py-2 px-1 text-[10px] font-bold rounded-xl border transition cursor-pointer ${
                  activePreset === "admin"
                    ? "bg-red-650 text-white border-transparent hover:scale-[1.02] hover:shadow-sm"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-150 dark:border-gray-700 hover:scale-[1.02] hover:shadow-xs"
                }`}
              >
                Test Admin
              </button>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center leading-relaxed">
              * Click any button to pre-fill validated accounts.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-650 dark:text-gray-300 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  id="login-email-input"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setActivePreset(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-650 dark:text-gray-300 uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      "A password recovery stream is pre-configured on production. For now, please use the provided test login presets!",
                    );
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-bold"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  id="login-password-input"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setActivePreset(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl active:scale-[98%] transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2 cursor-pointer shadow-md"
            >
              {loading ? <>Authenticating Session...</> : <>Sign In Securely</>}
            </button>
          </form>

          {/* Registration redirects */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-450 dark:text-gray-400">
              Don't have an account?{" "}
              <button
                type="button"
                id="login-go-register-btn"
                onClick={onGoToRegister}
                className="text-red-650 hover:text-red-700 font-bold hover:underline cursor-pointer"
              >
                Register as Donor or Hospital
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
