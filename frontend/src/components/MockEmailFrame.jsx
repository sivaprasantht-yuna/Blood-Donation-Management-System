import React from "react";
import { motion } from "motion/react";
import { X, Star, Reply, Trash2, Archive, MoreHorizontal } from "lucide-react";

export default function MockEmailFrame({ isOpen, onClose, email }) {
  if (!isOpen || !email) return null;

  const timeStr = email.timestamp
    ? new Date(email.timestamp).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Just now";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.9, rotateX: 15 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, y: 60, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl"
      >
        {/* Email client frame */}
        <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-2xl shadow-black/30 border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Window chrome */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#141825] border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
              LifeDrop Mail Client
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-white transition"
            >
              <X size={14} />
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 dark:border-gray-800">
            {[
              { icon: Archive, label: "Archive" },
              { icon: Trash2, label: "Delete" },
              { icon: Reply, label: "Reply" },
              { icon: Star, label: "Star" },
              { icon: MoreHorizontal, label: "More" },
            ].map(({ icon: Icon, label }) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                title={label}
              >
                <Icon size={14} />
              </motion.button>
            ))}
          </div>

          {/* Email header */}
          <div className="px-6 py-5 space-y-3 border-b border-gray-100 dark:border-gray-800">
            <motion.h3
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="text-lg font-bold text-gray-900 dark:text-white leading-tight"
            >
              {email.subject}
            </motion.h3>

            <div className="flex items-start gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-md"
              >
                LD
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    LifeDrop Network{" "}
                    <span className="font-normal text-gray-400 dark:text-gray-500">
                      &lt;noreply@lifedrop.org&gt;
                    </span>
                  </p>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap font-semibold">
                    {timeStr}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  To:{" "}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {email.to}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Email body */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="px-6 py-6"
          >
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line font-[Poppins,sans-serif]">
              {email.body}
            </div>

            {/* Signature */}
            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    LifeDrop Emergency Network
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Secure medical coordination platform
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 dark:bg-[#141825] border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span
              className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                email.status === "SENT"
                  ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40"
                  : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/40"
              }`}
            >
              ✓ {email.status}
            </span>
            <span className="text-[10px] text-gray-400">
              Encrypted • Simulated Dispatch
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
