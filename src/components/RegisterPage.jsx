import React, { useState } from "react";
import {
  Landmark,
  User,
  ShieldAlert,
  Check,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

export default function RegisterPage({
  onRegisterDonorSuccess,
  onRegisterHospitalSuccess,
  onGoToLogin,
  onGoToHome,
}) {
  const [activeTab, setActiveTab] = useState("donor");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Donor form
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

  // Hospital form
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

  const handleDonorSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validations
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

    const cleanPhone = donorForm.phoneNumber.replace(/[\s\-()]/g, "");
    const indianPhoneRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;
    if (!indianPhoneRegex.test(cleanPhone)) {
      setErrorMsg(
        "Please enter a valid Indian mobile number (e.g. 9876543210, with optional +91 prefix).",
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
        "Application received! Admin approval is required before signing in.",
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
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAFAFA] text-gray-900 selection:bg-red-500 selection:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={onGoToHome}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition"
          >
            <ArrowLeft size={16} /> Back to Landing Page
          </button>

          <div className="text-center sm:text-right">
            <p className="text-xs text-gray-400">
              Already have an account?{" "}
              <button
                onClick={onGoToLogin}
                className="text-red-650 hover:text-red-700 font-bold hover:underline"
              >
                Sign In Instead
              </button>
            </p>
          </div>
        </div>

        {/* Global form structure */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden">
          {/* Tabs Selector Header */}
          <div className="grid grid-cols-2 border-b border-gray-100 bg-gray-50">
            <button
              id="tab-donor-select"
              onClick={() => {
                setActiveTab("donor");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`py-5 px-4 text-center font-bold text-base transition flex items-center justify-center gap-2 border-b-2 ${
                activeTab === "donor"
                  ? "bg-white text-red-600 border-red-600"
                  : "text-gray-500 border-transparent hover:bg-gray-100/50 hover:text-gray-700"
              }`}
            >
              <User size={18} /> Register as Donor
            </button>

            <button
              id="tab-hospital-select"
              onClick={() => {
                setActiveTab("hospital");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`py-5 px-4 text-center font-bold text-base transition flex items-center justify-center gap-2 border-b-2 ${
                activeTab === "hospital"
                  ? "bg-white text-red-600 border-red-600"
                  : "text-gray-500 border-transparent hover:bg-gray-100/50 hover:text-gray-700"
              }`}
            >
              <Landmark size={18} /> Hospital Signup
            </button>
          </div>

          <div className="p-6 md:p-10 space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-1.5">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {activeTab === "donor"
                  ? "Become a Certified Hero"
                  : "Register Clinical Facility"}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {activeTab === "donor"
                  ? "Your physical coordinates will be mapped securely. In an emergency, we will alert you instantly."
                  : "Requires legitimate licensing validation. Credentials undergo verification processes within 24 hours."}
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs font-semibold flex items-start gap-2.5">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs font-semibold flex items-start gap-2.5">
                <Check size={16} className="shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* DONOR FORM LAYOUT */}
            {activeTab === "donor" && (
              <form
                onSubmit={handleDonorSubmit}
                className="space-y-6 text-left"
              >
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">
                  Personal Particulars
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">
                      Gender *
                    </label>
                    <select
                      value={donorForm.gender}
                      onChange={(e) =>
                        setDonorForm({ ...donorForm, gender: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm bg-white focus:outline-none focus:border-red-500"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">
                  Medical Profile
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm bg-white focus:outline-none focus:border-red-500"
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                        (group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">
                      Last Donation Date
                    </label>
                    <input
                      type="date"
                      value={donorForm.lastDonationDate}
                      onChange={(e) =>
                        setDonorForm({
                          ...donorForm,
                          lastDonationDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9840012345"
                      value={donorForm.phoneNumber}
                      onChange={(e) =>
                        setDonorForm({
                          ...donorForm,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">
                  Full Address & Credentials
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-600">
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
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-600">
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
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-600">
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
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-600">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        required
                        id="donor-reg-confirm"
                        placeholder="•••••••• animate"
                        value={donorForm.confirmPassword}
                        onChange={(e) =>
                          setDonorForm({
                            ...donorForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    id="donor-submit-reg-btn"
                    className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200 transition text-sm flex items-center justify-center gap-2"
                  >
                    {loading
                      ? "Creating Account..."
                      : "Finalize Profile Registration"}
                    <ChevronRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* HOSPITAL FORM LAYOUT */}
            {activeTab === "hospital" && (
              <form
                onSubmit={handleHospitalSubmit}
                className="space-y-6 text-left"
              >
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">
                  Medical Facility License
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">
                  Clinical Location & Logistics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-600">
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
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-600">
                        Duty Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 0442345678"
                        value={hospitalForm.phone}
                        onChange={(e) =>
                          setHospitalForm({
                            ...hospitalForm,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">
                  Login Credentials
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-600">
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row items-center gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl shadow-md transition text-sm flex items-center justify-center gap-2"
                  >
                    {loading
                      ? "Submitting Application..."
                      : "Apply Clinical Sign Up"}
                    <ChevronRight size={16} />
                  </button>
                  <span className="text-[11px] text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold">
                    <ShieldAlert size={14} /> Hospital accounts must undergo
                    administrative license verification.
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
