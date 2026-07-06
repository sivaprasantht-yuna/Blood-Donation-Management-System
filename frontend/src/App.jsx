import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, X } from "lucide-react";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import DashboardDonor from "./components/DashboardDonor";
import DashboardHospital from "./components/DashboardHospital";
import DashboardAdmin from "./components/DashboardAdmin";

export default function App() {
  // Session States
  const [currentView, setCurrentView] = useState("home");
  const [token, setToken] = useState(null);
  const [userType, setUserType] = useState(null);
  const [account, setAccount] = useState(null);

  // Global Data States
  const [stats, setStats] = useState({
    registeredDonors: 25000,
    livesSaved: 8500,
    partnerHospitals: 120,
    totalRequests: 430,
  });
  const [camps, setCamps] = useState([]);

  // Advanced Feature States: Theme & Notifications
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState([]);

  // SSE and Real-time triggers
  const [sseStatus, setSseStatus] = useState("connecting");
  const [liveTrigger, setLiveTrigger] = useState(0);
  // Floating Live Notification Banners
  const [livePopup, setLivePopup] = useState(null);

  // Synchronize HTML element classes for Dark Mode
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [theme]);

  // Fetch notifications globally
  const fetchGlobalNotifications = async () => {
    if (!token || !account) {
      setNotifications([]);
      return;
    }
    try {
      let query = "";
      if (userType === "donor") query = `?userId=${account.id}`;
      else if (userType === "hospital") query = `?hospitalId=${account.id}`;
      const res = await fetch(`/api/notifications${query}`);
      if (res.ok) {
        const list = await res.json();
        setNotifications(list);
      }
    } catch (e) {
      console.error("Failed to fetch notification core list", e);
    }
  };

  useEffect(() => {
    fetchGlobalNotifications();
  }, [token, account, userType, liveTrigger]);

  const handleMarkNotificationsRead = async (ids) => {
    try {
      const res = await fetch("/api/notifications/mark-read", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        fetchGlobalNotifications();
        setLiveTrigger(Date.now()); // alert dashboards to update
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTheme = async () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("ld_theme", nextTheme);

    // Sync preference dynamically with user profile in backend database if authenticated
    if (token && account) {
      try {
        const res = await fetch("/api/auth/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: account.id,
            userType,
            theme: nextTheme,
            emailEnabled: account.emailEnabled ?? true,
            smsEnabled: account.smsEnabled ?? true,
          }),
        });
        if (res.ok) {
          const result = await res.json();
          setAccount(result.account);
          localStorage.setItem("ld_account", JSON.stringify(result.account));
        }
      } catch (e) {
        console.warn("Theme offline update fallback active", e);
      }
    }
  };

  // Read Session initially
  useEffect(() => {
    const savedToken = localStorage.getItem("ld_token");
    const savedUserType = localStorage.getItem("ld_userType");
    const savedAccount = localStorage.getItem("ld_account");
    const savedView = localStorage.getItem("ld_view");
    const savedTheme = localStorage.getItem("ld_theme");

    // Restore saved theme preference
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }

    if (savedToken && savedUserType && savedAccount) {
      setToken(savedToken);
      setUserType(savedUserType);
      const parsedAccount = JSON.parse(savedAccount);
      setAccount(parsedAccount);
      // Load preference theme saved on profile
      if (parsedAccount.theme === "dark" || parsedAccount.theme === "light") {
        setTheme(parsedAccount.theme);
        localStorage.setItem("ld_theme", parsedAccount.theme);
      }
      if (savedView) {
        setCurrentView(savedView);
      } else {
        // Redirection based on roles
        if (savedUserType === "donor") setCurrentView("dashboard-donor");
        else if (savedUserType === "hospital")
          setCurrentView("dashboard-hospital");
        else if (savedUserType === "admin") setCurrentView("dashboard-admin");
      }
    }
    fetchGlobalData();
  }, []);

  const fetchGlobalData = async () => {
    try {
      const statsRes = await fetch("/api/stats");
      if (statsRes.ok) setStats(await statsRes.json());

      const campsRes = await fetch("/api/camps");
      if (campsRes.ok) setCamps(await campsRes.json());
    } catch (e) {
      console.error("Failed to load global landing metadata", e);
    }
  };

  // Real-Time Server Sent Events Stream Listener
  useEffect(() => {
    setSseStatus("connecting");
    const eventSource = new EventSource("/api/live");

    eventSource.onopen = () => {
      setSseStatus("connected");
    };

    eventSource.onerror = () => {
      setSseStatus("disconnected");
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { type, data } = payload;

        // Trigger reactive dashboard table refreshes when state changes
        setLiveTrigger(Date.now());
        fetchGlobalData();

        // Check contextual user rules to serve live floating warnings
        const savedAccountStr = localStorage.getItem("ld_account");
        const activeAccount = savedAccountStr
          ? JSON.parse(savedAccountStr)
          : null;
        const activeType = localStorage.getItem("ld_userType");

        if (type === "EMERGENCY_BROADCAST") {
          // If current logged-in user is a matching Donor nearby
          if (activeType === "donor" && activeAccount) {
            const req = data.request;
            const targetedDonorIds = data.targetedDonorIds || [];

            if (
              req.city.toUpperCase() === activeAccount.city.toUpperCase() &&
              req.bloodGroup === activeAccount.bloodGroup &&
              targetedDonorIds.includes(activeAccount.id)
            ) {
              setLivePopup({
                id: `pop_${Date.now()}`,
                title: `URGENT: Emergency ${req.bloodGroup} Needed!`,
                message: `${req.hospitalName} requires immediate assistance for Patient reference ${req.patientReference}. Click 'My Portal' to accept!`,
                type: "emergency",
              });
            }
          }
        } else if (type === "REQUEST_ACCEPTED") {
          // If current logged-in user is the Hospital who created the request
          if (
            activeType === "hospital" &&
            activeAccount &&
            activeAccount.id === data.hospitalId
          ) {
            setLivePopup({
              id: `pop_${Date.now()}`,
              title: `Donor Matched!`,
              message: `${data.donorName} (${data.bloodGroup}) has accepted your emergency broadcast! Contacting them immediately.`,
              type: "match",
            });
          }
        } else if (type === "HOSPITAL_APPROVED") {
          // general diagnostic alert
          console.log("[SSE Monitor] Hospital Approved:", data.name);
        }
      } catch (err) {
        console.error("Failed to parse incoming SSE message", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleLoginSuccess = (userToken, typeOfUser, clientAccount) => {
    setToken(userToken);
    setUserType(typeOfUser);
    setAccount(clientAccount);

    localStorage.setItem("ld_token", userToken);
    localStorage.setItem("ld_userType", typeOfUser);
    localStorage.setItem("ld_account", JSON.stringify(clientAccount));

    // Restore saved user theme settings immediately
    if (clientAccount.theme === "dark" || clientAccount.theme === "light") {
      setTheme(clientAccount.theme);
      localStorage.setItem("ld_theme", clientAccount.theme);
    }

    let nextView = "home";
    if (typeOfUser === "donor") nextView = "dashboard-donor";
    else if (typeOfUser === "hospital") nextView = "dashboard-hospital";
    else if (typeOfUser === "admin") nextView = "dashboard-admin";

    setCurrentView(nextView);
    localStorage.setItem("ld_view", nextView);
    fetchGlobalData();
  };

  const handleRegisterDonorSuccess = (userToken, donorAccount) => {
    handleLoginSuccess(userToken, "donor", donorAccount);
  };

  const handleLogout = () => {
    setToken(null);
    setUserType(null);
    setAccount(null);
    setCurrentView("home");

    localStorage.removeItem("ld_token");
    localStorage.removeItem("ld_userType");
    localStorage.removeItem("ld_account");
    localStorage.removeItem("ld_view");
  };

  const handleAddCamp = async (newCampData) => {
    try {
      const response = await fetch("/api/camps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCampData),
      });
      if (response.ok) {
        fetchGlobalData();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const setViewWithLocal = (viewName) => {
    setCurrentView(viewName);
    localStorage.setItem("ld_view", viewName);
  };

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#111827] min-h-screen flex flex-col font-sans antialiased text-gray-900 dark:text-white transition-colors duration-250 selection:bg-red-500 selection:text-white">
      {/* Dynamic Floating Matching Popup alerts */}
      <AnimatePresence>
        {livePopup && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 max-w-sm w-full bg-[#111827] text-white rounded-3xl p-5 shadow-2xl border border-red-500/30 flex flex-col gap-3.5"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-red-505">
                <Heart
                  size={18}
                  className="fill-red-500 text-red-500 animate-pulse animate-duration-1000"
                />
                <span className="font-extrabold text-xs tracking-wider text-red-500 uppercase">
                  Emergency Matching Radar
                </span>
              </div>
              <button
                onClick={() => setLivePopup(null)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1 text-left">
              <h4 className="font-black text-sm text-gray-50">
                {livePopup.title}
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                {livePopup.message}
              </p>
            </div>

            <div className="pt-2 border-t border-white/5 flex gap-2">
              <button
                onClick={() => {
                  setLivePopup(null);
                  if (userType === "donor") setViewWithLocal("dashboard-donor");
                  else if (userType === "hospital")
                    setViewWithLocal("dashboard-hospital");
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs text-center transition active:scale-95"
              >
                My Portal
              </button>
              <button
                onClick={() => setLivePopup(null)}
                className="py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-3.5 rounded-xl text-xs transition font-semibold"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar
        currentView={currentView}
        onChangeView={setViewWithLocal}
        isAuthenticated={token !== null}
        userType={userType}
        account={account}
        onLogout={handleLogout}
        sseStatus={sseStatus}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* RENDER VIEWS MANUALLY FOR COMPACTNESS AND RESILIENCY */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {currentView === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LandingPage
                stats={stats}
                camps={camps}
                onBecomeDonor={() => setViewWithLocal("register")}
                onHospitalPortal={() => {
                  if (token && userType === "hospital")
                    setViewWithLocal("dashboard-hospital");
                  else setViewWithLocal("login");
                }}
                onAddCamp={handleAddCamp}
                isAuthenticated={token !== null}
                userType={userType}
              />
            </motion.div>
          )}

          {currentView === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <LoginPage
                onLoginSuccess={handleLoginSuccess}
                onGoToRegister={() => setViewWithLocal("register")}
                onGoToHome={() => setViewWithLocal("home")}
              />
            </motion.div>
          )}

          {currentView === "register" && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <RegisterPage
                onRegisterDonorSuccess={handleRegisterDonorSuccess}
                onRegisterHospitalSuccess={() => {
                  setLivePopup({
                    id: `reg_${Date.now()}`,
                    title: "Application Received!",
                    message:
                      "Hospital account requested. License registration submitted and pending verify.",
                    type: "system",
                  });
                }}
                onGoToLogin={() => setViewWithLocal("login")}
                onGoToHome={() => setViewWithLocal("home")}
              />
            </motion.div>
          )}

          {currentView === "dashboard-donor" &&
            token &&
            donorIdFromToken(token) && (
              <motion.div
                key="dashboard-donor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DashboardDonor
                  donorId={donorIdFromToken(token)}
                  onLogout={handleLogout}
                  liveTrigger={liveTrigger}
                  theme={theme}
                />
              </motion.div>
            )}

          {currentView === "dashboard-hospital" &&
            token &&
            hospitalIdFromToken(token) && (
              <motion.div
                key="dashboard-hospital"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DashboardHospital
                  hospitalId={hospitalIdFromToken(token)}
                  onLogout={handleLogout}
                  liveTrigger={liveTrigger}
                  theme={theme}
                />
              </motion.div>
            )}

          {currentView === "dashboard-admin" && token && (
            <motion.div
              key="dashboard-admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DashboardAdmin
                onLogout={handleLogout}
                liveTrigger={liveTrigger}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-white dark:bg-slate-950 text-gray-500 dark:text-gray-400 border-t border-gray-150 dark:border-white/5 py-10 px-4 transition-colors duration-250">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-left text-sm">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                <Heart size={16} className="text-white fill-white" />
              </div>
              <span className="font-extrabold text-lg text-gray-900 dark:text-white">
                LifeDrop
              </span>
            </div>
            <p className="leading-relaxed text-xs">
              A premium, full-scale, real-time blood transfusion management
              network bridging accredited partner hospitals with healthy
              compatible volunteer blood donors nearby during critical
              healthcare emergencies.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 uppercase text-xs tracking-wider">
              Clinical Partners
            </h4>
            <ul className="space-y-2 text-xs">
              <li>City General Hospital, T Nagar</li>
              <li>Metro Health Care Center, Adyar</li>
              <li>Apex Emergency Center, Mumbai Hub</li>
              <li>Red Cross Society blood drive centers</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 uppercase text-xs tracking-wider font-mono">
              Real-Time Core
            </h4>
            <div className="flex items-center gap-2 mb-2 p-2.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-200 transition-colors duration-250">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[11px] font-mono leading-none">
                STREAM STATUS: ACTIVE (PORT: 3000)
              </p>
            </div>
            <p className="text-[11px] leading-relaxed">
              Every broadcast emergency automatically maps location,
              constraints, availability, and eligibility periods under verified
              administrative guidelines.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-150 dark:border-white/5 text-center text-xs text-gray-400 dark:text-gray-500">
          LifeDrop Platform • Designed for secure, zero-friction medical
          coordination. All rights reserved © 2026.
        </div>
      </footer>
    </div>
  );
}

// Token parser parsers
function donorIdFromToken(t) {
  if (t.startsWith("token_donor_")) {
    return t.replace("token_donor_", "");
  }
  return "";
}

function hospitalIdFromToken(t) {
  if (t.startsWith("token_hospital_")) {
    return t.replace("token_hospital_", "");
  }
  return "";
}
