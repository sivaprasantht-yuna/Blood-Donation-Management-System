import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Award,
  CheckCircle,
  Bell,
  Sparkles,
  MapPin,
  Eye,
  Download,
  Mail,
  MessageSquare,
  Settings,
} from "lucide-react";
import CertificateModal from "./CertificateModal";

export default function DashboardDonor({ donorId, onLogout, liveTrigger }) {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [smsLogs, setSmsLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [activeTab, setActiveTab] = useState("hub");
  const [preferences, setPreferences] = useState({
    emailEnabled: true,
    smsEnabled: true,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Modal toggle
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const fetchDonorData = async () => {
    try {
      // 1. Fetch profile with eligibility
      const profRes = await fetch(`/api/donors/${donorId}`);
      if (!profRes.ok) throw new Error("Failed to load donor profile");
      const profData = await profRes.json();
      setProfile(profData);
      setPreferences({
        emailEnabled: profData.emailEnabled !== false,
        smsEnabled: profData.smsEnabled !== false,
      });

      // 2. Fetch history
      const histRes = await fetch(`/api/donors/${donorId}/history`);
      if (histRes.ok) {
        const histData = await histRes.json();
        setHistory(histData);
      }

      // 3. Fetch notifications
      const notRes = await fetch(`/api/notifications?userId=${donorId}`);
      if (notRes.ok) {
        const notData = await notRes.json();
        setNotifications(notData);
      }

      // 4. Fetch matching blood requests
      const reqRes = await fetch("/api/admin/requests");
      if (reqRes.ok) {
        const allRequests = await reqRes.json();
        if (profData) {
          const userCity = profData.city.toUpperCase();
          const userGroup = profData.bloodGroup;
          const filtered = allRequests.filter(
            (req) =>
              req.city.toUpperCase() === userCity &&
              req.bloodGroup === userGroup &&
              req.status !== "completed",
          );
          setAlerts(filtered);
        }
      }

      // 5. Fetch matching communications logs (email/sms logs matching donor email)
      const logsRes = await fetch("/api/email-sms-logs");
      if (logsRes.ok) {
        const commData = await logsRes.json();
        if (profData) {
          setEmailLogs(
            commData.emailLogs.filter((m) => m.to === profData.email),
          );
          setSmsLogs(
            commData.smsLogs.filter((s) => s.to === profData.phoneNumber),
          );
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorData();
  }, [donorId, liveTrigger]);

  const handleToggleAvailability = async () => {
    if (!profile || toggling) return;
    setToggling(true);
    try {
      const response = await fetch(`/api/donors/${donorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !profile.isAvailable }),
      });
      if (response.ok) {
        const updated = await response.json();
        setProfile((prev) => ({ ...prev, isAvailable: updated.isAvailable }));
        setToastMsg(
          `Safety status modified: You are now ${updated.isAvailable ? "Available for matches" : "Resting/Unavailable"}`,
        );
        setTimeout(() => setToastMsg(""), 2000);
        fetchDonorData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(false);
    }
  };

  const handleAcceptAlert = async (requestId) => {
    setAcceptingId(requestId);
    try {
      const response = await fetch(
        `/api/donors/${donorId}/accept/${requestId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to accept emergency request.");
      }

      setToastMsg(
        "Success! Alert accepted. Hospital has been notified with your Indian mobile number!",
      );
      setTimeout(() => setToastMsg(""), 4000);
      // Trigger update
      fetchDonorData();
    } catch (err) {
      alert(err.message || "Something went wrong.");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (savingSettings) return;
    setSavingSettings(true);

    try {
      const res = await fetch("/api/auth/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: donorId,
          userType: "donor",
          theme: profile?.theme || "light",
          emailEnabled: preferences.emailEnabled,
          smsEnabled: preferences.smsEnabled,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setProfile(result.account);
        setToastMsg(
          "Notification settings successfully saved to profile database!",
        );
        setTimeout(() => setToastMsg(""), 2000);
        fetchDonorData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  const markNotificationsAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    try {
      await fetch("/api/notifications/mark-read", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: unreadIds }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-screen">
        <div className="animate-spin text-red-650 h-10 w-10 border-4 border-red-200 border-t-red-600 rounded-full mb-3" />
        <h4 className="font-extrabold text-sm uppercase text-gray-500 tracking-wider">
          Accessing LifeDrop Health Core
        </h4>
      </div>
    );
  }

  // Calculate dynamic eligibility (90 day donation interval checks)
  let isEligible = true;
  let remainingDays = 0;
  if (profile.lastDonationDate) {
    const lastDate = new Date(profile.lastDonationDate);
    const diffMs = Date.now() - lastDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 90) {
      isEligible = false;
      remainingDays = 90 - diffDays;
    }
  }

  return (
    <div className="py-8 bg-[#FAFAFA] dark:bg-[#111827] text-gray-900 dark:text-white transition-colors duration-250 min-h-screen text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Toast Warning banner */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-4 sm:right-10 z-50 bg-[#1F2937] dark:bg-red-950 text-white border border-red-500/35 px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3"
            >
              <Sparkles
                size={18}
                className="text-red-400 animate-pulse animate-duration-1000"
              />
              <span className="text-xs font-bold leading-normal">
                {toastMsg}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DONOR HEADER BIO PANEL */}
        <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 md:p-8 border border-gray-150 dark:border-gray-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden transition-colors">
          <div className="absolute w-60 h-60 rounded-full bg-red-100/10 dark:bg-red-505/5 blur-3xl -top-10 -left-10" />

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100/30 dark:border-red-900/30 flex items-center justify-center text-red-650 dark:text-red-400 font-black text-2xl shrink-0 uppercase shadow-inner">
              {profile.bloodGroup}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  {profile.fullName}
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-md uppercase inline-flex items-center gap-0.5">
                  ⭐ pre-screened VOLUNTEER
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-300">
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {profile.city}, {profile.state}
                </span>
                <span>• Group: {profile.bloodGroup}</span>
                <span>• Contact number: {profile.phoneNumber}</span>
              </div>
            </div>
          </div>

          {/* Quick Availability Action Switcher */}
          <div className="self-stretch md:self-auto bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between gap-5">
            <div className="text-left space-y-0.5">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Matching Switch
              </span>
              <span className="text-xs font-black text-gray-800 dark:text-white">
                {profile.isAvailable
                  ? "🟢 Available Drive Ready"
                  : "🔴 Resting / Unavailable"}
              </span>
            </div>
            <button
              onClick={handleToggleAvailability}
              disabled={toggling}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-red-604 focus:outline-none"
              style={{
                backgroundColor: profile.isAvailable ? "#10B981" : "#D1D5DB",
              }}
              title="Toggle Availability Settings"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  profile.isAvailable ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* TABS SELECTOR MENU BAR */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("hub")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "hub"
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            🏩 Volunteer Hub & Alerts
          </button>

          <button
            onClick={() => setActiveTab("comms")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "comms"
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            🏆 Comms Audit & Certificates
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "settings"
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Settings size={14} /> Alert Settings
          </button>
        </div>

        {/* TAB 1: VOLUNTEER HUB */}
        {activeTab === "hub" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* STATS BENTO MATRIX */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-gray-150 dark:border-gray-800 shadow-md flex flex-col justify-between transition-colors">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-300 uppercase tracking-widest">
                  Total Drive Donations
                </span>
                <div className="my-4 text-left">
                  <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                    {profile.totalDonations} Units
                  </p>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-250 mt-1">
                    Sustained Donations
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-300 leading-normal">
                  Registered and certified in hospital portal.
                </p>
              </div>

              <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-gray-150 dark:border-gray-800 shadow-md flex flex-col justify-between transition-colors">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                  Lives Saved Scorecard
                </span>
                <div className="my-4 text-left">
                  <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">
                    {profile.livesSaved} Lives
                  </p>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-250 mt-1">
                    Impact scorecard
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-300 leading-normal">
                  Each donation assists 3 critical patients.
                </p>
              </div>

              {/* Eligibility card */}
              <div className="bg-white dark:bg-[#1F2937] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-md flex flex-col justify-between transition-colors">
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest ${isEligible ? "text-red-500" : "text-amber-500"}`}
                >
                  {isEligible ? "Drive Eligibility: Ready" : "Resting Required"}
                </span>
                <div className="my-3 text-left">
                  {isEligible ? (
                    <div>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">
                        Eligible & Active
                      </p>
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                        90 Day Intervallic Safety Clear
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl font-black text-amber-500">
                        {remainingDays} Days Left
                      </p>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 mt-1">
                        Transfusion interval rest period
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-300">
                  Mandatory clinical interval.
                </p>
              </div>

              {/* Badge Milestone achievements */}
              <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-gray-150 dark:border-gray-800 shadow-md flex flex-col justify-between transition-colors">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                  Accredited Badges
                </span>
                <div className="my-3 space-y-1 text-left">
                  {profile.badges && profile.badges.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {profile.badges.map((badge, bidx) => (
                        <span
                          key={bidx}
                          className="text-[9px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-black px-1.5 py-0.5 rounded border border-amber-100 dark:border-amber-900"
                        >
                          ⭐ {badge}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">
                      Complete donations to earn milestones!
                    </p>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-300">
                  Official LifeSaver Milestones.
                </p>
              </div>
            </div>

            {/* REAL-TIME EMERGENCY ALERTS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Alerts Box (2 columns) */}
              <div className="lg:col-span-2 space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-650"></span>
                    </span>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      Active Matching Emergency Broadcasts
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-gray-400 font-mono pr-2">
                    {alerts.length} matching Chennai
                  </span>
                </div>

                {alerts.length === 0 ? (
                  <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-12 border border-gray-150 dark:border-gray-800 text-center text-gray-400 dark:text-gray-300 shadow">
                    No active emergency requirements matched with your
                    O-negative category in the Adyar sector at present.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`bg-white dark:bg-[#1F2937] rounded-2xl border p-5 flex flex-col justify-between hover:shadow-lg transition relative ${
                          alert.urgency === "Critical"
                            ? "border-red-100 dark:border-red-900 ring-2 ring-red-500/10"
                            : "border-gray-150 dark:border-gray-800"
                        }`}
                      >
                        {alert.urgency === "Critical" && (
                          <span className="absolute -top-2.5 -right-2.5 px-2 py-0.5 bg-red-600 text-white font-black text-[9px] rounded-full uppercase shadow">
                            CRITICAL
                          </span>
                        )}

                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400 font-mono">
                              Case: {alert.patientReference}
                            </span>
                            <span className="text-xs font-bold font-mono bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-400 px-2 py-0.5 rounded">
                              Require {alert.unitsRequired} Units
                            </span>
                          </div>

                          <h4 className="font-extrabold text-gray-900 dark:text-white mt-2.5 leading-snug">
                            {alert.hospitalName}
                          </h4>
                          <p className="text-xs text-gray-400 mt-0.5 font-semibold flex items-center gap-1">
                            <MapPin size={10} /> {alert.city}
                          </p>

                          {alert.notes && (
                            <p className="text-xs text-gray-500 dark:text-gray-350 italic bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-xl mt-3 line-clamp-2 leading-relaxed">
                              "{alert.notes}"
                            </p>
                          )}
                        </div>

                        <div className="mt-5 pt-4 border-t border-gray-50 dark:border-gray-750 flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptAlert(alert.id)}
                            disabled={
                              !isEligible ||
                              !profile.isAvailable ||
                              acceptingId !== null
                            }
                            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition duration-300 transform active:scale-95 text-center cursor-pointer ${
                              acceptingId === alert.id
                                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                                : !isEligible
                                  ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 pointer-events-none text-[10px]"
                                  : !profile.isAvailable
                                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed text-[10px]"
                                    : "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                            }`}
                          >
                            {acceptingId === alert.id ? (
                              <>Accepting...</>
                            ) : !isEligible ? (
                              <>Restricted Period Left</>
                            ) : !profile.isAvailable ? (
                              <>Go Active to Accept</>
                            ) : (
                              <>Accept and Match</>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications column (1 column) */}
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell
                      size={18}
                      className="text-gray-500 dark:text-gray-300"
                    />
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      My Alert Inbox
                    </h3>
                  </div>
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <button
                      onClick={markNotificationsAsRead}
                      className="text-xs text-red-650 hover:text-red-700 font-bold transition cursor-pointer"
                    >
                      Clear Unread
                    </button>
                  )}
                </div>

                <div className="bg-white dark:bg-[#1F2937] rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xl p-4 divide-y divide-gray-50 dark:divide-gray-750 max-h-[360px] overflow-y-auto transition-colors">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 dark:text-gray-300 text-xs">
                      Inbox is empty. Notifications appear here when hospitals
                      request you or register accepts.
                    </div>
                  ) : (
                    notifications.map((not) => (
                      <div
                        key={not.id}
                        className={`py-3 first:pt-0 last:pb-0 ${!not.read ? "bg-red-500/5 px-2 rounded-lg" : ""}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[8px] font-bold tracking-wider px-2 py-0.5 rounded uppercase bg-red-100 dark:bg-red-950 text-red-650 dark:text-red-400`}
                          >
                            {not.type || "system"}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {not.createdAt
                              ? new Date(not.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "just now"}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                          {not.title}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-350 leading-relaxed mt-0.5">
                          {not.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* DONATION LEDGER HISTORY */}
            <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-gray-150 dark:border-gray-800 shadow-xl text-left space-y-4 transition-colors animate-in slide-in-from-bottom-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                My Historical Donation Achievements
              </h3>

              {history.length === 0 ? (
                <div className="py-12 text-center text-gray-400 dark:text-gray-300 text-xs">
                  No verified donations recorded under this account passport
                  scorecard. Accept hospital emergencies to record milestones
                  and download certificate credentials!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-gray-500 dark:text-gray-300">
                    <thead className="text-[10px] text-gray-400 dark:text-gray-300 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40">
                      <tr>
                        <th scope="col" className="px-6 py-3 font-semibold">
                          Incident/Hospital
                        </th>
                        <th scope="col" className="px-6 py-3 font-semibold">
                          Transfused Blood
                        </th>
                        <th scope="col" className="px-6 py-3 font-semibold">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 font-semibold">
                          Fulfillment Date
                        </th>
                        <th scope="col" className="px-6 py-3 font-semibold">
                          Credentials verification
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-750">
                      {history.map((record) => (
                        <tr
                          key={record.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                        >
                          <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">
                            {record.hospitalName}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 bg-red-105 bg-red-650 text-white rounded text-xs font-black">
                              {record.bloodGroup}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                            {record.units} Pint
                          </td>
                          <td className="px-6 py-4 font-medium">
                            {record.date}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-300 font-extrabold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded inline-flex items-center gap-1">
                              <CheckCircle size={10} /> ACCREDITED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AUDIT COMMS & CERTIFICATIONS LIST */}
        {activeTab === "comms" && (
          <div className="space-y-8 animate-in fade-in duration-200 text-left">
            {/* Vetted Certifications Center */}
            <div className="bg-white dark:bg-[#1F2937] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xl space-y-4 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-lg flex items-center gap-1.5">
                    <Award size={18} className="text-red-500" />
                    Electronic Lifesaver Certifications
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-300">
                    Generate, view and print official accredited LifeSaver
                    badges linked to completed hospital requirements.
                  </p>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={() => setIsCertOpen(true)}
                    className="px-5 py-2 w-full sm:w-auto text-xs font-black uppercase text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 active:scale-95 transition"
                  >
                    <Download size={12} /> Claim Official Diploma Certificate
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="py-12 text-center text-gray-400 dark:text-gray-300 border border-gray-100 dark:border-gray-700 rounded-2xl">
                  ⚠️ Certificates become claimable immediately once you accept
                  and complete a donation drive at an accredited hospital.
                </div>
              ) : (
                <div className="p-6 bg-red-650/5 border border-red-500/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                      Gold LifeDrop Accreditation Badge
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-300 leading-normal">
                      Our algorithms verified clinical records matching{" "}
                      <strong>{profile.fullName}</strong>. Certificate file
                      compiled on June 9, 2026.
                    </p>
                    <span className="text-[10px] font-mono text-gray-400 block">
                      Serial Hash: LD-VERIFY-
                      {donorId.substring(0, 6).toUpperCase()}-2026
                    </span>
                  </div>
                  <button
                    onClick={() => setIsCertOpen(true)}
                    className="p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 border border-gray-200 dark:border-gray-750 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition"
                  >
                    <Eye size={14} /> Preview certificate canvas
                  </button>
                </div>
              )}
            </div>

            {/* Simulated Comms Dispatches */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {/* Mail logs */}
              <div className="bg-white dark:bg-[#1F2937] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xl space-y-3 transition-colors">
                <h4 className="font-extrabold text-[#DC2626] text-md flex items-center gap-1.5">
                  <Mail size={16} />
                  Simulated Notification Emails Log
                </h4>
                <p className="text-[11px] text-gray-400 leading-normal">
                  Actual log registry of direct e-mails pushed to client inbox.
                </p>

                <div className="space-y-3 max-h-[300px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-750 pr-1">
                  {emailLogs.length === 0 ? (
                    <p className="text-center text-gray-400 dark:text-gray-300 py-8 text-xs">
                      No email packets sent to {profile.email} yet.
                    </p>
                  ) : (
                    emailLogs.map((mail) => (
                      <div key={mail.id} className="pt-3 first:pt-0">
                        <div className="flex justify-between items-center mb-1 text-[10px] text-gray-400 dark:text-gray-350">
                          <span>
                            To: <strong>{mail.to}</strong>
                          </span>
                          <span>
                            {new Date(mail.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <h5 className="text-xs font-black text-gray-900 dark:text-white">
                          Subject: {mail.subject}
                        </h5>
                        <pre className="text-[10px] font-sans text-gray-500 dark:text-gray-300 whitespace-pre-line leading-relaxed bg-gray-50/60 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 mt-1">
                          {mail.body}
                        </pre>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* SMS Dispatches */}
              <div className="bg-white dark:bg-[#1F2937] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xl space-y-3 transition-colors">
                <h4 className="font-extrabold text-[#DC2626] text-md flex items-center gap-1.5">
                  <MessageSquare size={16} />
                  Simulated SMS emergency notifications
                </h4>
                <p className="text-[11px] text-gray-400 leading-normal">
                  Actual log of text dispatches pushed to {profile.phoneNumber}.
                </p>

                <div className="space-y-3 max-h-[300px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-750 pr-1">
                  {smsLogs.length === 0 ? (
                    <p className="text-center text-gray-400 dark:text-gray-300 py-8 text-xs">
                      No SMS alerts pushed to {profile.phoneNumber} yet.
                    </p>
                  ) : (
                    smsLogs.map((sms) => (
                      <div key={sms.id} className="pt-3 first:pt-0">
                        <div className="flex justify-between items-center mb-1 text-[10px] text-gray-400 dark:text-gray-350">
                          <span>
                            Phone: <strong>{sms.to}</strong>
                          </span>
                          <span className="text-emerald-500 font-bold uppercase text-[9px] bg-slate-50 dark:bg-slate-800 p-1 rounded">
                            {sms.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-650 dark:text-gray-300 font-mono bg-red-500/5 p-2 rounded-xl border border-red-500/10 leading-relaxed">
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

        {/* TAB 3: ALERT PREFERENCES SETTINGS */}
        {activeTab === "settings" && (
          <div className="max-w-xl mx-auto bg-white dark:bg-[#1F2937] p-6 md:p-8 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xl space-y-6 text-left animate-in fade-in duration-200 transition-colors">
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                <Settings size={18} className="text-red-650" /> Alerts &
                Communications channels
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-330 mt-1">
                Configure enabled channels to prevent matching alarms from
                waking or overwhelming your schedule.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-850/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="space-y-0.5 pr-4">
                    <label className="block text-sm font-extrabold text-gray-900 dark:text-white">
                      Email alerts
                    </label>
                    <span className="text-xs text-gray-400 dark:text-gray-350 leading-relaxed">
                      Sends details of urgent nearby cases matching your type to
                      your e-mail address.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPreferences({
                        ...preferences,
                        emailEnabled: !preferences.emailEnabled,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      preferences.emailEnabled
                        ? "bg-red-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        preferences.emailEnabled
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="p-2 text-center text-xs text-gray-400 dark:text-gray-300 font-mono">
                  Email Notifications:{" "}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {preferences.emailEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-850/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="space-y-0.5 pr-4">
                    <label className="block text-sm font-extrabold text-gray-900 dark:text-white">
                      Mobile SMS alerts
                    </label>
                    <span className="text-xs text-gray-400 dark:text-gray-350 leading-relaxed">
                      Transmits real-time alert codes directly to your matching
                      Indian mobile line.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPreferences({
                        ...preferences,
                        smsEnabled: !preferences.smsEnabled,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      preferences.smsEnabled
                        ? "bg-red-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        preferences.smsEnabled
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="p-2 text-center text-xs text-gray-400 dark:text-gray-300 font-mono">
                  SMS Notifications:{" "}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {preferences.smsEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs transition active:scale-95 cursor-pointer shadow-md"
                >
                  {savingSettings ? "Saving Settings..." : "Save preferences"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {profile && (
        <CertificateModal
          isOpen={isCertOpen}
          onClose={() => setIsCertOpen(false)}
          donorName={profile.fullName}
          bloodGroup={profile.bloodGroup}
        />
      )}
    </div>
  );
}
