import React, { useState } from "react";
import {
  User,
  ShieldAlert,
  Check,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import ModernDatePicker from "./ModernDatePicker";

export default function RegisterDonorPage({
  onRegisterDonorSuccess,
  onGoToLogin,
  onGoToHome,
}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [donorForm, setDonorForm] = useState({
    fullName: "",
    age: "",
    gender: "Male",
    bloodGroup: "O+",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    state: "",
    lastDonationDate: "",
  });

  const handleDonorSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Required field checking
    if (
      !donorForm.fullName ||
      !donorForm.age ||
      !donorForm.phoneNumber ||
      !donorForm.email ||
      !donorForm.password ||
      !donorForm.confirmPassword ||
      !donorForm.address ||
      !donorForm.city ||
      !donorForm.state
    ) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    // Phone validation: exactly 10 digits, no country codes, letters, spaces, or special characters.
    if (!/^\d{10}$/.test(donorForm.phoneNumber)) {
      setErrorMsg(
        "Phone number must contain exactly 10 digits. Do not include country codes (e.g. +91), spaces, or special characters."
      );
      return;
    }

    if (Number(donorForm.age) < 18 || Number(donorForm.age) > 65) {
      setErrorMsg("Donors must be between 18 and 65 years old.");
      return;
    }

    if (donorForm.password !== donorForm.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register-donor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donorForm),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register donor.");
      }

      setSuccessMsg("Registration successful! Initiating dashboard session...");
      setTimeout(() => {
        onRegisterDonorSuccess(data.token, data.account);
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong.");
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
              Already have a donor account?{" "}
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
          <div className="p-5 bg-red-600 text-white flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <User size={24} className="text-white fill-white" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Become a Certified Donor</h3>
              <p className="text-xs text-red-100">
                Your medical profile will be securely mapped to broadcast critical alerts nearby.
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

            <form onSubmit={handleDonorSubmit} className="space-y-6">
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">
                Personal Particulars
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    id="donor-reg-name"
                    placeholder="e.g. Deepika Anand"
                    value={donorForm.fullName}
                    onChange={(e) =>
                      setDonorForm({ ...donorForm, fullName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Age (18 - 65) *
                  </label>
                  <input
                    type="number"
                    required
                    min={18}
                    max={65}
                    placeholder="e.g. 29"
                    value={donorForm.age}
                    onChange={(e) =>
                      setDonorForm({ ...donorForm, age: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Gender *
                  </label>
                  <select
                    value={donorForm.gender}
                    onChange={(e) =>
                      setDonorForm({ ...donorForm, gender: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">
                Medical Profile
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Blood Group *
                  </label>
                  <select
                    id="donor-reg-blood"
                    value={donorForm.bloodGroup}
                    onChange={(e) =>
                      setDonorForm({
                        ...donorForm,
                        bloodGroup: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    Last Donation Date
                  </label>
                  <ModernDatePicker
                    value={donorForm.lastDonationDate}
                    onChange={(val) =>
                      setDonorForm({ ...donorForm, lastDonationDate: val })
                    }
                    placeholder="Select last date"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit number"
                    value={donorForm.phoneNumber}
                    onChange={(e) =>
                      setDonorForm({
                        ...donorForm,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>

              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">
                Full Address & Credentials
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apartment, Building, Street Axis"
                    value={donorForm.address}
                    onChange={(e) =>
                      setDonorForm({ ...donorForm, address: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      id="donor-reg-city"
                      placeholder="e.g. CHENNAI"
                      value={donorForm.city}
                      onChange={(e) =>
                        setDonorForm({ ...donorForm, city: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tamil Nadu"
                      value={donorForm.state}
                      onChange={(e) =>
                        setDonorForm({ ...donorForm, state: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    id="donor-reg-email"
                    placeholder="yourname@gmail.com"
                    value={donorForm.email}
                    onChange={(e) =>
                      setDonorForm({ ...donorForm, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      id="donor-reg-pass"
                      placeholder="••••••••"
                      value={donorForm.password}
                      onChange={(e) =>
                        setDonorForm({
                          ...donorForm,
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
                      id="donor-reg-confirm"
                      placeholder="••••••••"
                      value={donorForm.confirmPassword}
                      onChange={(e) =>
                        setDonorForm({
                          ...donorForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-2xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-150 dark:border-gray-800">
                <button
                  type="submit"
                  disabled={loading}
                  id="donor-submit-reg-btn"
                  className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200 dark:shadow-none transition text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {loading
                    ? "Creating Account..."
                    : "Finalize Profile Registration"}
                  <ChevronRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
