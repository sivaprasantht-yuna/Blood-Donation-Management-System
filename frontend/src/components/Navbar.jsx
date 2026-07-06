import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  Landmark,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  Bell,
  Check,
  Clock,
  Sun,
  Moon,
} from "lucide-react";

export default function Navbar({
  currentView,
  onChangeView,
  isAuthenticated,
  userType,
  account,
  onLogout,
  sseStatus,
  notifications,
  onMarkNotificationsRead,
  theme,
  onToggleTheme,
}) {
  const [bellOpen, setBellOpen] = useState(false);

  const getDashboardView = () => {
    if (userType === "donor") return "dashboard-donor";
    if (userType === "hospital") return "dashboard-hospital";
    if (userType === "admin") return "dashboard-admin";
    return "home";
  };

  const unreadNotifications = notifications.filter((n) => !n.read);
  const unreadCount = unreadNotifications.length;

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      onMarkNotificationsRead(unreadNotifications.map((n) => n.id));
    }
  };

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24)
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#1F2937]/90 backdrop-blur-md border-b border-gray-150 dark:border-gray-800 transition-colors duration-205">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          id="brand-navigation"
          onClick={() => onChangeView("home")}
          className="flex items-center gap-2 cursor-pointer transition active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-md shadow-red-200 dark:shadow-none group-hover:bg-red-700 transition duration-300">
            <Heart size={20} className="text-white fill-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white group-hover:text-red-600 transition">
              Life<span className="text-red-500 font-extrabold">Drop</span>
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-gray-400 dark:text-gray-300 font-bold uppercase tracking-wider">
                Live Health Core
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full block animate-pulse ${
                  sseStatus === "connected"
                    ? "bg-emerald-500"
                    : sseStatus === "connecting"
                      ? "bg-amber-400"
                      : "bg-red-400"
                }`}
                title={`Live Stream Connection: ${sseStatus}`}
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <nav className="flex items-center gap-2 sm:gap-3">
          {/* Animated Sun/Moon Theme Toggle */}
          <motion.button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            className="relative p-2 text-gray-600 dark:text-gray-200 hover:text-amber-500 dark:hover:text-amber-400 bg-gray-50 dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 rounded-xl transition cursor-pointer"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            whileTap={{ scale: 0.85, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
          >
            <AnimatePresence mode="wait">
              {theme === "dark" ? (
                <motion.div
                  key="moon"
                  initial={{ rotate: -90, scale: 0, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Moon size={16} />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ rotate: 90, scale: 0, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: -90, scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Sun size={16} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
          {/* Genuine Notification Bell Dropdown */}
          {isAuthenticated && (
            <div className="relative">
              <button
                id="noti-bell-btn"
                onClick={() => setBellOpen(!bellOpen)}
                className="relative p-2 text-gray-600 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-500 bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700 rounded-xl transition active:scale-95 cursor-pointer"
                title={`${unreadCount} Unread Notifications`}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black leading-none text-white animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Center Dropdown Portal */}
              {bellOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setBellOpen(false)}
                  />
                  <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white dark:bg-[#1F2937] border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-3">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-750 flex justify-between items-center bg-gray-50/50 dark:bg-[#111827]/40">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-gray-900 dark:text-white">
                          Notification Alert Core
                        </span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 font-extrabold px-1.5 py-0.5 rounded">
                            {unreadCount} New
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-black text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Check size={12} /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-750">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-gray-400 dark:text-gray-300">
                          Bell is quiet. No notifications received yet.
                        </div>
                      ) : (
                        notifications.map((not) => (
                          <div
                            key={not.id}
                            className={`p-4 transition hover:bg-gray-50/85 dark:hover:bg-slate-700/40 relative ${
                              !not.read
                                ? "bg-red-50/15 dark:bg-red-500/5 border-l-2 border-red-500"
                                : ""
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <h5
                                className={`text-xs font-black leading-tight ${
                                  !not.read
                                    ? "text-gray-900 dark:text-gray-50"
                                    : "text-gray-700 dark:text-gray-350"
                                }`}
                              >
                                {not.title}
                              </h5>
                              <span className="text-[10px] text-gray-400 dark:text-gray-300 font-bold flex items-center gap-1 whitespace-nowrap">
                                <Clock size={10} /> {formatTime(not.createdAt)}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-300 leading-relaxed">
                              {not.message}
                            </p>
                            {!not.read && (
                              <button
                                onClick={() =>
                                  onMarkNotificationsRead([not.id])
                                }
                                className="absolute right-3 bottom-2 text-[10px] text-gray-400 dark:text-gray-300 hover:text-red-600 font-bold flex items-center gap-0.5"
                                title="Mark as Read"
                              >
                                <Check size={10} /> Dismiss
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Render regular links */}
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => onChangeView("home")}
                className={`px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer select-none border ${
                  currentView === "home"
                    ? "text-red-650 bg-white border-gray-200 shadow-sm dark:text-red-500 dark:bg-white dark:border-transparent"
                    : "text-gray-600 border-transparent dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onChangeView("register")}
                className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer select-none"
              >
                Become a Donor
              </button>
              <button
                onClick={() => onChangeView("login")}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-905 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 shadow-sm cursor-pointer select-none"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              {/* Authenticated user status bar */}
              <div className="hidden md:flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-100/55 dark:border-gray-700 px-3 py-1.5 rounded-xl">
                {userType === "donor" && (
                  <Heart
                    size={14}
                    className="text-red-500 fill-red-500 animate-pulse"
                  />
                )}
                {userType === "hospital" && (
                  <Landmark size={14} className="text-emerald-500" />
                )}
                {userType === "admin" && (
                  <ShieldCheck size={14} className="text-amber-500" />
                )}

                <span className="text-xs font-semibold text-gray-750 dark:text-gray-200">
                  {userType === "donor" &&
                    `Donor: ${account?.fullName?.split(" ")[0]}`}
                  {userType === "hospital" &&
                    `Hosp: ${account?.hospitalName?.split(" ")[0]}`}
                  {userType === "admin" && `Admin: ${account?.name}`}
                </span>

                {userType === "donor" && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 rounded">
                    {account?.bloodGroup}
                  </span>
                )}
              </div>

              {/* Show active Dashboard redirect if viewing landing page */}
              {currentView === "home" && (
                <button
                  onClick={() => onChangeView(getDashboardView())}
                  className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/60 rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer select-none"
                >
                  <LayoutDashboard size={14} /> Portal
                </button>
              )}

              {/* Go to dashboard if viewing login/reg but authenticated */}
              {currentView !== "home" && currentView !== getDashboardView() && (
                <button
                  onClick={() => onChangeView(getDashboardView())}
                  className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-250 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer select-none"
                >
                  <LayoutDashboard size={14} /> My Portal
                </button>
              )}

              {/* Home Link */}
              {currentView !== "home" && (
                <button
                  onClick={() => onChangeView("home")}
                  className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer select-none"
                >
                  Home
                </button>
              )}

              {/* Sign Out Button */}
              <button
                id="signout-nav-btn"
                onClick={onLogout}
                className="text-xs font-bold text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/20 p-2 sm:px-3 sm:py-2 rounded-xl flex items-center gap-1.5 border border-gray-100 dark:border-gray-750 transition active:scale-95 cursor-pointer"
                title="Log Out Session"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
