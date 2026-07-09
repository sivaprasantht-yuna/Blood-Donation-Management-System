import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  Landmark,
  Users,
  Heart,
  Clipboard,
  Check,
  Trash2,
  AlertCircle,
  Sparkles,
  Search,
  Mail,
  MessageSquare,
} from "lucide-react";

export default function DashboardAdmin({ onLogout, liveTrigger }) {
  const [stats, setStats] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [smsLogs, setSmsLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const fetchAdminData = async () => {
    try {
      const resStats = await fetch("/api/admin/overview");
      if (resStats.ok) setStats(await resStats.json());

      const resHosp = await fetch("/api/admin/hospitals");
      if (resHosp.ok) setHospitals(await resHosp.json());

      const resDonors = await fetch("/api/admin/donors");
      if (resDonors.ok) setDonors(await resDonors.json());

      const resReq = await fetch("/api/admin/requests");
      if (resReq.ok) setRequests(await resReq.json());

      // Fetch System Activity Logs
      const logsRes = await fetch("/api/activity-logs");
      if (logsRes.ok) {
        setActivityLogs(await logsRes.json());
      }

      // Fetch Email & SMS Logs
      const commsRes = await fetch("/api/email-sms-logs");
      if (commsRes.ok) {
        const data = await commsRes.json();
        setEmailLogs(data.emailLogs);
        setSmsLogs(data.smsLogs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [liveTrigger]);

  const handleApproveHospital = async (id, name) => {
    try {
      const response = await fetch(`/api/admin/hospitals/approve/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        setHospitals((prev) =>
          prev.map((h) => (h.id === id ? { ...h, isApproved: true } : h)),
        );
        setToastMsg(`Verified clinical credentials for ${name} successfully.`);
        setTimeout(() => setToastMsg(""), 2000);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDonor = async (id, name) => {
    if (!confirm(`Are you sure you want to delete donor ${name}?`)) return;
    try {
      const response = await fetch(`/api/admin/donors/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setDonors((prev) => prev.filter((d) => d.id !== id));
        setToastMsg(`Removed donor profile ${name}.`);
        setTimeout(() => setToastMsg(""), 1500);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHospital = async (id, name) => {
    if (!confirm(`Are you sure you want to delete hospital ${name}?`)) return;
    try {
      const response = await fetch(`/api/admin/hospitals/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setHospitals((prev) => prev.filter((h) => h.id !== id));
        setToastMsg(`Removed hospital profile ${name}.`);
        setTimeout(() => setToastMsg(""), 1500);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#111827] text-gray-400">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 animate-spin text-red-650 mx-auto rounded-full border-4 border-red-200 border-t-red-600" />
          <p className="text-sm font-semibold">
            Resolving Command Center metrics...
          </p>
        </div>
      </div>
    );
  }

  const pendingApprovals = hospitals.filter((h) => !h.isApproved);

  const filteredDonors = donors.filter(
    (d) =>
      d.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#111827] text-gray-950 dark:text-gray-100 transition-colors duration-250 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8 text-left">
        {/* Toast Notifier */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50 bg-[#1F2937] dark:bg-red-950 border border-red-500/20 text-white rounded-2xl py-3.5 px-6 shadow-2xl text-xs font-bold flex items-center gap-2"
            >
              <Sparkles className="text-amber-400 fill-amber-400" size={14} />
              <span>{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO TITLE HEADER CARD */}
        <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 md:p-8 border border-gray-150 dark:border-gray-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden transition-colors">
          <div className="absolute w-60 h-60 rounded-full bg-amber-100/10 dark:bg-amber-950/10 blur-3xl -top-10 -left-10" />

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-2xl shrink-0">
              <ShieldCheck size={28} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                  Admin Command Center
                </h2>
                <span className="text-[10px] bg-red-150 dark:bg-red-950 text-red-650 dark:text-red-400 font-black px-2.5 py-1 rounded border border-red-200 dark:border-red-900 uppercase">
                  SYS SECURE
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-300">
                Oversee vetted hospitals, donor records passports, and audit
                live emergency request streams.
              </p>
            </div>
          </div>

          <div className="text-xs text-gray-400 font-mono font-bold bg-gray-50 dark:bg-gray-800 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700 self-stretch md:self-auto flex md:flex-col justify-between md:justify-center items-center md:items-start gap-1">
            <span>Root administrative access</span>
            <span className="text-gray-901 dark:text-white font-semibold">
              administrator@lifedrop.in
            </span>
          </div>
        </div>

        {/* TABS FOR ADMIN VIEW */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 gap-1.5 pb-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-[#EF4444] text-white shadow-md"
                : "text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            🏰 General Core Overview
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "audit"
                ? "bg-[#EF4444] text-white shadow-md"
                : "text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            📋 Live Auditing & Communications Logs
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* STATS BENTO MATRIX */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-gray-150 dark:border-gray-800 shadow-md flex items-center justify-between transition-colors">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-300 uppercase tracking-widest">
                    Active Donors
                  </span>
                  <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                    {stats.totalDonors}
                  </p>
                  <span className="text-[11px] text-gray-500 dark:text-gray-300 block font-semibold">
                    Pre-screened passports
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                  <Users size={22} />
                </div>
              </div>

              <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-gray-150 dark:border-gray-800 shadow-md flex items-center justify-between transition-colors">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-300 uppercase tracking-widest">
                    Hospitals Hub
                  </span>
                  <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                    {stats.totalHospitals}
                  </p>
                  <span className="text-[11px] text-gray-500 dark:text-gray-300 block font-semibold">
                    {pendingApprovals.length} Licenses pending
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-55 bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Landmark size={22} />
                </div>
              </div>

              <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-gray-150 dark:border-gray-800 shadow-md flex items-center justify-between transition-colors">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-300 uppercase tracking-widest">
                    Total Matches
                  </span>
                  <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                    {stats.totalRequests}
                  </p>
                  <span className="text-[11px] text-gray-500 dark:text-gray-300 block font-semibold">
                    {stats.completedRequests} Fulfilled and certified
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#DC2626]/5 dark:bg-[#DC2626]/20 flex items-center justify-center text-[#DC2626] shrink-0">
                  <Heart size={22} className="fill-red-500 text-red-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-gray-150 dark:border-gray-800 shadow-md flex items-center justify-between transition-colors">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#DC2626] uppercase tracking-widest">
                    Lives Saved Scoring
                  </span>
                  <p className="text-4xl font-black text-red-650 dark:text-red-400 tracking-tight leading-none">
                    {stats.livesSaved}
                  </p>
                  <span className="text-[11px] text-gray-500 dark:text-gray-300 block font-semibold">
                    Active transfusions registered
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <Clipboard size={22} />
                </div>
              </div>
            </div>

            {/* PENDING APPROVALS SCREEN */}
            {pendingApprovals.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-amber-500 font-bold" size={20} />
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">
                    Hospital Licensing Credentials Pending Approval (
                    {pendingApprovals.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {pendingApprovals.map((hosp) => (
                    <div
                      key={hosp.id}
                      className="bg-white dark:bg-[#1F2937] rounded-3xl border border-amber-100 dark:border-amber-900/50 p-6 space-y-4 shadow-md transition-colors"
                    >
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-905 dark:text-white leading-tight">
                          {hosp.hospitalName}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-bold uppercase tracking-wider">
                          {hosp.city} sector
                        </p>
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-300">
                        <p className="flex justify-between">
                          <span>License No:</span>
                          <span className="font-mono font-bold text-gray-700 dark:text-white">
                            {hosp.licenseNumber}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span>Admin Contact:</span>
                          <span className="font-semibold text-gray-700 dark:text-white">
                            {hosp.phone}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span>Email Hub:</span>
                          <span className="font-semibold text-gray-700 dark:text-white break-all">
                            {hosp.email}
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span>Address:</span>
                          <span className="font-semibold text-gray-700 dark:text-white text-right">
                            {hosp.address}, {hosp.city}
                          </span>
                        </p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() =>
                            handleApproveHospital(hosp.id, hosp.hospitalName)
                          }
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] py-2 rounded-xl transition cursor-pointer shadow-md text-center inline-flex items-center justify-center gap-1"
                        >
                          <Check size={12} strokeWidth={3} /> Approve License
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteHospital(hosp.id, hosp.hospitalName)
                          }
                          className="p-2 border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-600 rounded-xl transition"
                          title="Reject Licensing"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SYSTEM MANAGER SECTION - HOVER EFFECT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
              {/* Vetted Hospitals list */}
              <div className="bg-white dark:bg-[#1F2937] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xl space-y-4 transition-colors">
                <h3 className="font-bold text-gray-905 dark:text-white text-lg">
                  Hospital Operations Hubs ({hospitals.length})
                </h3>

                <div className="divide-y divide-gray-50 dark:divide-gray-750 max-h-[400px] overflow-y-auto pr-2">
                  {hospitals.map((hosp) => (
                    <div
                      key={hosp.id}
                      className="py-3 flex justify-between items-center gap-4"
                    >
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-901 dark:text-white">
                          {hosp.hospitalName}
                        </h4>
                        <p className="text-[10px] text-gray-450 dark:text-gray-300 font-bold">
                          {hosp.city} sector • Code: {hosp.licenseNumber}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                          📞 {hosp.phone} | ✉️ {hosp.email}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          📍 {hosp.address}, {hosp.city}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {hosp.isApproved ? (
                          <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 font-black px-2.5 py-1 rounded border border-emerald-100 dark:border-emerald-900 uppercase">
                            VETTED ACTIVE
                          </span>
                        ) : (
                          <span className="text-[9px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-405 font-bold px-2 py-1 rounded border border-amber-100 dark:border-amber-900 uppercase">
                            PENDING APPROVAL
                          </span>
                        )}
                        <button
                          onClick={() =>
                            handleDeleteHospital(hosp.id, hosp.hospitalName)
                          }
                          className="bg-gray-50 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-950/50 text-gray-400 hover:text-red-700 p-2 rounded-xl transition duration-200 cursor-pointer"
                          title="Purge Hospital Portal"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vetted Donors Passport directory */}
              <div className="bg-white dark:bg-[#1F2937] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xl space-y-4 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                  <h3 className="font-bold text-gray-901 dark:text-white text-lg">
                    Vetted Donor Passports ({filteredDonors.length})
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter category or city"
                      className="pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div className="divide-y divide-gray-50 dark:divide-gray-750 max-h-[400px] overflow-y-auto pr-2">
                  {filteredDonors.map((donor) => (
                    <div
                      key={donor.id}
                      className="py-3 flex justify-between items-center gap-4"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950 text-red-650 dark:text-red-400 font-black text-xs flex items-center justify-center uppercase">
                          {donor.bloodGroup}
                        </span>
                        <div>
                          <h4 className="font-bold text-xs text-gray-901 dark:text-white">
                            {donor.fullName}
                          </h4>
                          <p className="text-[10px] text-gray-450 dark:text-gray-300 font-semibold">
                            {donor.city} • Impact score: {donor.totalDonations}{" "}
                            units
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                            📞 {donor.phoneNumber} | ✉️ {donor.email}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            📍 {donor.address}, {donor.city}, {donor.state}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {donor.isAvailable ? (
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-450 font-bold uppercase bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                            Active ready
                          </span>
                        ) : (
                          <span className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                            Resting
                          </span>
                        )}
                        <button
                          onClick={() =>
                            handleDeleteDonor(donor.id, donor.fullName)
                          }
                          className="bg-gray-50 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-950/50 text-gray-400 hover:text-red-700 p-2 rounded-xl transition duration-200 cursor-pointer"
                          title="Purge Donor passport"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AUDIT & LIVE COMMUNICATIONS LOGS */}
        {activeTab === "audit" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Vetted system activity tracker */}
            <div className="bg-white dark:bg-[#1F2937] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xl text-left space-y-4 transition-colors">
              <div>
                <h3 className="font-black text-gray-901 dark:text-white text-lg">
                  Vetted System Logs Core
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-350">
                  Systematic administrative log trace for regulatory auditing.
                  Tracks matching acceptances, security settings modifications,
                  credentials verification states, and communications streams.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-gray-505 dark:text-gray-300">
                  <thead className="text-[10px] text-gray-400 dark:text-gray-300 uppercase tracking-widest border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40">
                    <tr>
                      <th scope="col" className="px-6 py-3 font-semibold">
                        Author level
                      </th>
                      <th scope="col" className="px-6 py-3 font-semibold">
                        Action label
                      </th>
                      <th scope="col" className="px-6 py-3 font-semibold">
                        Details description
                      </th>
                      <th scope="col" className="px-6 py-3 font-semibold">
                        Timestamp UTC
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-750">
                    {activityLogs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-8 text-center text-gray-300"
                        >
                          Quiet server core. No activity alerts logged.
                        </td>
                      </tr>
                    ) : (
                      activityLogs.slice(0, 100).map((log) => (
                        <tr
                          key={log.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                        >
                          <td className="px-6 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                log.role === "admin"
                                  ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                                  : log.role === "hospital"
                                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                    : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                              }`}
                            >
                              {log.role}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 font-bold font-mono text-[10px] text-gray-900 dark:text-white">
                            {log.action}
                          </td>
                          <td className="px-6 py-3.5 text-gray-650 dark:text-gray-305 leading-relaxed">
                            {log.description}
                          </td>
                          <td className="px-6 py-3.5 font-mono text-gray-400 dark:text-gray-300 font-bold whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SIMULATED DIRECT MAIL AND SMS TRACES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {/* Email Logs (Global) */}
              <div className="bg-white dark:bg-[#1F2937] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xl space-y-3 transition-colors">
                <h4 className="font-extrabold text-[#DC2626] text-md flex items-center gap-1.5">
                  <Mail size={16} />
                  Simulated Notification Emails Log
                </h4>
                <p className="text-[11px] text-gray-400 leading-normal">
                  Systematic trace registry of outgoing mock clinical email
                  transmissions.
                </p>

                <div className="space-y-3 max-h-[350px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-750 pr-1 text-xs">
                  {emailLogs.length === 0 ? (
                    <p className="text-center text-gray-400 dark:text-gray-300 py-8">
                      No email packets sent currently.
                    </p>
                  ) : (
                    emailLogs.slice(0, 50).map((mail) => (
                      <div key={mail.id} className="pt-3 first:pt-0">
                        <div className="flex justify-between items-center mb-1 text-[10px] text-gray-450 dark:text-gray-350">
                          <span>
                            To: <strong>{mail.to}</strong>
                          </span>
                          <span>
                            {new Date(mail.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <h5 className="font-black text-gray-901 dark:text-white">
                          Subject: {mail.subject}
                        </h5>
                        <pre className="text-[10px] font-sans text-gray-500 dark:text-gray-300 bg-gray-50/60 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-150 dark:border-gray-700 whitespace-pre-line mt-1 leading-relaxed">
                          {mail.body}
                        </pre>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SMS Logs (Global) */}
              <div className="bg-white dark:bg-[#1F2937] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xl space-y-3 transition-colors">
                <h4 className="font-extrabold text-red-650 text-md flex items-center gap-1.5">
                  <MessageSquare size={16} />
                  Simulated Emergency SMS Alerts Log
                </h4>
                <p className="text-[11px] text-gray-400 leading-normal">
                  Systematic log registry of SMS text broadcasts pushed over
                  mock devices.
                </p>

                <div className="space-y-3 max-h-[350px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-750 pr-1 text-xs">
                  {smsLogs.length === 0 ? (
                    <p className="text-center text-gray-400 dark:text-gray-300 py-8">
                      No SMS text broadcasts pushed of yet.
                    </p>
                  ) : (
                    smsLogs.slice(0, 50).map((sms) => (
                      <div key={sms.id} className="pt-3 first:pt-0">
                        <div className="flex justify-between items-center mb-1 text-[10px] text-gray-450 dark:text-gray-350">
                          <span>
                            Phone: <strong>{sms.to}</strong>
                          </span>
                          <span className="text-emerald-500 font-bold uppercase text-[9px]">
                            {sms.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-650 dark:text-gray-300 font-mono bg-red-500/5 p-2 rounded-xl border border-red-500/10 leading-normal">
                          {sms.body}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
