import React from "react";
import { motion } from "motion/react";
import { X, Signal, Battery, Wifi } from "lucide-react";

export default function MockPhoneFrame({ isOpen, onClose, sms }) {
  if (!isOpen || !sms) return null;

  const timeStr = sms.timestamp
    ? new Date(sms.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Now";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.85 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 80, scale: 0.85 }}
        transition={{ type: "spring", damping: 22, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-[320px] sm:w-[360px]"
      >
        {/* Phone bezel */}
        <div className="bg-gray-900 rounded-[40px] p-3 shadow-2xl shadow-black/50 border border-gray-700/50">
          {/* Notch */}
          <div className="flex justify-center mb-1">
            <div className="w-28 h-6 bg-black rounded-full flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-700" />
              <div className="w-3 h-3 rounded-full bg-gray-800 border border-gray-700" />
            </div>
          </div>

          {/* Screen */}
          <div className="bg-gray-950 rounded-[28px] overflow-hidden min-h-[480px] flex flex-col">
            {/* Status bar */}
            <div className="flex items-center justify-between px-6 py-2 text-[10px] text-gray-400 font-semibold">
              <span>
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <div className="flex items-center gap-1.5">
                <Signal size={10} />
                <Wifi size={10} />
                <Battery size={10} />
              </div>
            </div>

            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-xs">
                  LD
                </div>
                <div>
                  <p className="text-white font-bold text-sm">LifeDrop</p>
                  <p className="text-gray-500 text-[10px]">SMS Alert</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-800 text-gray-500 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 px-4 py-6 flex flex-col justify-end gap-3">
              {/* Incoming message bubble */}
              <motion.div
                initial={{ opacity: 0, x: -30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 20 }}
                className="max-w-[85%] self-start"
              >
                <div className="bg-gray-800 text-gray-100 text-xs leading-relaxed px-4 py-3 rounded-2xl rounded-bl-sm shadow-lg">
                  {sms.body}
                </div>
                <div className="flex items-center gap-2 mt-1.5 px-1">
                  <span className="text-[9px] text-gray-600">{timeStr}</span>
                  <span
                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      sms.status === "DELIVERED"
                        ? "text-emerald-400 bg-emerald-950/40"
                        : "text-red-400 bg-red-950/40"
                    }`}
                  >
                    {sms.status}
                  </span>
                </div>
              </motion.div>

              {/* Typing indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="self-start flex items-center gap-1 px-3 py-2 bg-gray-800/50 rounded-full"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-gray-500"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            </div>

            {/* Input bar */}
            <div className="px-4 py-3 border-t border-gray-800 flex items-center gap-2">
              <div className="flex-1 bg-gray-800 text-gray-500 text-xs px-4 py-2.5 rounded-full">
                iMessage
              </div>
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white">
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </div>
            </div>

            {/* Home indicator */}
            <div className="flex justify-center py-2">
              <div className="w-32 h-1 rounded-full bg-gray-700" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
