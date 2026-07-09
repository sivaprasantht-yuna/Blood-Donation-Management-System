import React, { useState } from "react";
import {
  Landmark,
  ShieldAlert,
  Check,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

export default function RegisterHospitalPage({
  onRegisterHospitalSuccess,
  onGoToLogin,
  onGoToHome,
}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [hospitalForm, setHospitalForm] = useState({
    hospitalName: "",
    licenseNumber: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    password: "",
    confirmPassword: "",
  });

  const handleHospitalSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (
      !hospitalForm.hospitalName ||
      !hospitalForm.licenseNumber ||
      !hospitalForm.email ||
      !hospitalForm.phone ||
      !hospitalForm.address ||
      !hospitalForm.city ||
      !hospitalForm.password ||
      !hospitalForm.confirmPassword
    ) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    // Phone validation: exactly 10 digits, no country codes, letters, spaces, or special characters.
    if (!/^\d{10}$/.test(hospitalForm.phone)) {
      setErrorMsg(
        "Phone number must contain exactly 10 digits. Do not include country codes (e.g. +91), spaces, or special characters."
      );
      return;
    }

    if (hospitalForm.password !== hospitalForm.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register-hospital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hospitalForm),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register hospital.");
      }

      setSuccessMsg(
        "Application received! Admin approval is required before signing in."
      );
      
      // Clear form
      setHospitalForm({
        hospitalName: "",
        licenseNumber: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        onRegisterHospitalSuccess();
        onGoToLogin();
      }, 3500);
    } catch (err) {
      setErrorMsg(err.message || "Failed to process application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAFAFA] dark:bg-[#111827] text-gray-900 dark:text-white selection:bg-red-500 selection:text-white py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-250">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={onGoToHome}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Landing Page
          </button>

          <div className="text-center sm:text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Already have a hospital account?{" "}
              <button
                onClick={onGoToLogin}
                className="text-red-650 dark:text-red-500 hover:text-red-700 font-bold hover:underline cursor-pointer"
              >
                Sign In Instead
              </button>
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-[#1F2937] rounded-3xl border border-gray-150 dark:border-gray-800 shadow-2xl overflow-hidden text-left transition-colors duration-250">
          <div className="p-5 bg-gray-900 text-white flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Landmark size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Register Clinical Facility</h3>
              <p className="text-xs text-gray-300">
                Credentials undergo administrative licensing validation within 24 hours.
              </p>
            </div>
          </div>

          <div className="p-6 md:p-10 space-y-6">
            {errorMsg && (
              <div className="p-4 bg-red-50 dark:bg-red-950/35 border border-red-100 dark:border-red-900 text-red-750 dark:text-red-400 rounded-2xl text-xs font-semibold flex items-start gap-2.5">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-100 dark:border-emerald-900 text-emerald-750 dark:text-emerald-400 rounded-2xl text-xs font-semibold flex items-start gap-2.5">
                <Check size={16} className="shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleHospitalSubmit} className="space-y-6">
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">
                Medical Facility License
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. City General Hospital"
                    value={hospitalForm.hospitalName}
                    onChange={(e) =>
                      setHospitalForm({
                        ...hospitalForm,
                        hospitalName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Accredited License Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CGH-9912-TN"
                    value={hospitalForm.licenseNumber}
                    onChange={(e) =>
                      setHospitalForm({
                        ...hospitalForm,
                        licenseNumber: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>

              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">
                Clinical Location & Logistics
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metro Block Road, Adyar"
                    value={hospitalForm.address}
                    onChange={(e) =>
                      setHospitalForm({
                        ...hospitalForm,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                      City / District *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CHENNAI"
                      value={hospitalForm.city}
                      onChange={(e) =>
                        setHospitalForm({
                          ...hospitalForm,
                          city: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Duty Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit number"
                      value={hospitalForm.phone}
                      onChange={(e) =>
                        setHospitalForm({
                          ...hospitalForm,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                </div>
              </div>

              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">
                Login Credentials
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Contact Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="clinical@hospital.com"
                    value={hospitalForm.email}
                    onChange={(e) =>
                      setHospitalForm({
                        ...hospitalForm,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={hospitalForm.password}
                    onChange={(e) =>
                      setHospitalForm({
                        ...hospitalForm,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={hospitalForm.confirmPassword}
                    onChange={(e) =>
                      setHospitalForm({
                        ...hospitalForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-150 dark:border-gray-800 flex flex-col md:flex-row items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl shadow-md transition text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {loading
                    ? "Submitting Application..."
                    : "Apply Clinical Sign Up"}
                  <ChevronRight size={16} />
                </button>
                <span className="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold">
                  🏥 Hospital accounts must undergo administrative license verification.
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
