import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, ArrowUpRight, ArrowDownLeft, Droplet, Info } from "lucide-react";

const BLOOD_GROUPS = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

const COMPATIBILITY_MAP = {
  "O-": {
    donateTo: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    receiveFrom: ["O-"],
  },
  "O+": {
    donateTo: ["O+", "A+", "B+", "AB+"],
    receiveFrom: ["O-", "O+"],
  },
  "A-": {
    donateTo: ["A-", "A+", "AB-", "AB+"],
    receiveFrom: ["O-", "A-"],
  },
  "A+": {
    donateTo: ["A+", "AB+"],
    receiveFrom: ["O-", "O+", "A-", "A+"],
  },
  "B-": {
    donateTo: ["B-", "B+", "AB-", "AB+"],
    receiveFrom: ["O-", "B-"],
  },
  "B+": {
    donateTo: ["B+", "AB+"],
    receiveFrom: ["O-", "O+", "B-", "B+"],
  },
  "AB-": {
    donateTo: ["AB-", "AB+"],
    receiveFrom: ["O-", "A-", "B-", "AB-"],
  },
  "AB+": {
    donateTo: ["AB+"],
    receiveFrom: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  },
};

const BLOOD_FACTS = {
  "O-": {
    title: "Universal Donor",
    fact: "O- blood can be transfused to anyone in an emergency! Only ~7% of the world's population has this type.",
    emoji: "🌍",
    color: "text-red-600",
  },
  "O+": {
    title: "Most Common",
    fact: "O+ is the most common blood type globally — about 38% of people carry it. It's always in high demand.",
    emoji: "🔥",
    color: "text-orange-600",
  },
  "A-": {
    title: "Rare & Valuable",
    fact: "Only ~6% of people have A- blood. It's critical for A- and A+ patients with immune challenges.",
    emoji: "💎",
    color: "text-purple-600",
  },
  "A+": {
    title: "Second Most Common",
    fact: "About 34% of people are A+. These donors are backbone donors for hospital supplies.",
    emoji: "⭐",
    color: "text-amber-600",
  },
  "B-": {
    title: "Very Rare",
    fact: "Only ~2% of people have B- blood worldwide. B- donors are essential for emergency reserves.",
    emoji: "🦄",
    color: "text-pink-600",
  },
  "B+": {
    title: "Important Contributor",
    fact: "~9% of people carry B+. They can receive from B-, B+, O-, and O+ donors.",
    emoji: "💪",
    color: "text-blue-600",
  },
  "AB-": {
    title: "Rarest Type",
    fact: "AB- is the rarest blood type — only ~1% of people have it. They're universal plasma donors!",
    emoji: "✨",
    color: "text-violet-600",
  },
  "AB+": {
    title: "Universal Recipient",
    fact: "AB+ can receive blood from anyone! Only ~3% have this type. They're also universal plasma donors.",
    emoji: "🏆",
    color: "text-emerald-600",
  },
};

// Stagger container + child animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const chipVariants = {
  hidden: { opacity: 0, scale: 0.5, y: 10 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 18 },
  },
};

export default function BloodCompatibility() {
  const [selectedGroup, setSelectedGroup] = useState("O+");

  const info = COMPATIBILITY_MAP[selectedGroup];
  const funFact = BLOOD_FACTS[selectedGroup];

  return (
    <div
      id="blood-compatibility"
      className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-xl border border-red-50/50 dark:border-gray-700/50"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <span className="text-xs font-semibold px-3 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full inline-flex items-center gap-1.5 mb-2">
            <Heart size={12} className="fill-red-600 dark:fill-red-400" /> Interactive Matrix
          </span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Blood Type Matcher
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Select a blood group to discover its compatible donor/recipient
            relationships instantly.
          </p>
        </div>

        {/* Animated Blood Drop */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedGroup}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 30 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="hidden md:flex flex-col items-center gap-1"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="relative"
            >
              <Droplet
                size={48}
                className="text-red-500 dark:text-red-400 fill-red-500/20 dark:fill-red-400/20"
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-red-700 dark:text-red-300 pt-1">
                {selectedGroup}
              </span>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Blood group selector pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {BLOOD_GROUPS.map((group) => (
          <motion.button
            key={group}
            id={`btn-compat-${group}`}
            onClick={() => setSelectedGroup(group)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors duration-300 cursor-pointer ${
              selectedGroup === group
                ? "bg-red-600 text-white shadow-md shadow-red-200 dark:shadow-red-900/50"
                : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {group}
          </motion.button>
        ))}
      </div>

      {/* Fun Fact Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`fact-${selectedGroup}`}
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="mb-6 overflow-hidden"
        >
          <div className="flex items-start gap-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-4 border border-amber-100/50 dark:border-amber-800/30">
            <span className="text-2xl shrink-0">{funFact.emoji}</span>
            <div>
              <p
                className={`text-xs font-bold uppercase tracking-wider ${funFact.color} dark:opacity-80`}
              >
                {funFact.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                {funFact.fact}
              </p>
            </div>
            <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Compatibility Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Can Donate To */}
        <motion.div
          key={`donate-to-${selectedGroup}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-red-50/40 dark:bg-red-950/20 rounded-2xl p-6 border border-red-100/50 dark:border-red-800/30"
        >
          <div className="flex items-center gap-3 mb-4 text-red-700 dark:text-red-400">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center"
            >
              <ArrowUpRight size={20} />
            </motion.div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-red-500 dark:text-red-400">
                Can Donate To
              </p>
              <p className="text-lg font-bold">Compatible Recipients</p>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            key={`donate-chips-${selectedGroup}`}
            className="flex flex-wrap gap-2.5"
          >
            {BLOOD_GROUPS.map((group) => {
              const isCompatible = info.donateTo.includes(group);
              return (
                <motion.div
                  key={`donate-${group}`}
                  variants={chipVariants}
                  className={`w-12 h-12 flex items-center justify-center font-bold text-sm rounded-xl transition-colors duration-500 ${
                    isCompatible
                      ? "bg-red-600 text-white shadow-sm ring-4 ring-red-100 dark:ring-red-900/50 border border-transparent"
                      : "bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 border border-gray-100 dark:border-gray-700"
                  }`}
                >
                  {isCompatible && (
                    <motion.span
                      className="absolute inset-0 rounded-xl bg-red-400/20"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.5,
                        delay: Math.random() * 1,
                      }}
                    />
                  )}
                  <span className="relative z-10">{group}</span>
                </motion.div>
              );
            })}
          </motion.div>

          <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-4 leading-relaxed font-medium">
            Donors with type{" "}
            <strong className="font-bold">{selectedGroup}</strong> can
            successfully transfer blood to individuals with these highlighted
            types without reaction risks.
          </p>
        </motion.div>

        {/* Can Receive From */}
        <motion.div
          key={`receive-from-${selectedGroup}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl p-6 border border-emerald-100/50 dark:border-emerald-800/30"
        >
          <div className="flex items-center gap-3 mb-4 text-emerald-700 dark:text-emerald-400">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center"
            >
              <ArrowDownLeft size={20} />
            </motion.div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
                Can Receive From
              </p>
              <p className="text-lg font-bold">Compatible Donors</p>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            key={`receive-chips-${selectedGroup}`}
            className="flex flex-wrap gap-2.5"
          >
            {BLOOD_GROUPS.map((group) => {
              const isCompatible = info.receiveFrom.includes(group);
              return (
                <motion.div
                  key={`receive-${group}`}
                  variants={chipVariants}
                  className={`relative w-12 h-12 flex items-center justify-center font-bold text-sm rounded-xl transition-colors duration-500 ${
                    isCompatible
                      ? "bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100 dark:ring-emerald-900/50 border border-transparent"
                      : "bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-600 border border-gray-100 dark:border-gray-700"
                  }`}
                >
                  {isCompatible && (
                    <motion.span
                      className="absolute inset-0 rounded-xl bg-emerald-400/20"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.5,
                        delay: Math.random() * 1,
                      }}
                    />
                  )}
                  <span className="relative z-10">{group}</span>
                </motion.div>
              );
            })}
          </motion.div>

          <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-4 leading-relaxed font-medium">
            Individuals of type{" "}
            <strong className="font-bold">{selectedGroup}</strong> can safely
            receive blood transfusions from any of these highlighted donor
            types.
          </p>
        </motion.div>
      </div>

      {/* EKG Heartbeat Line */}
      <div className="mt-6 mb-2 overflow-hidden rounded-xl">
        <svg viewBox="0 0 600 40" className="w-full h-8" preserveAspectRatio="none">
          <motion.path
            d="M0,20 L100,20 L120,20 L130,5 L140,35 L150,10 L160,30 L170,20 L200,20 L300,20 L320,20 L330,5 L340,35 L350,10 L360,30 L370,20 L400,20 L500,20 L520,20 L530,5 L540,35 L550,10 L560,30 L570,20 L600,20"
            fill="none"
            stroke="url(#ekgGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            key={`ekg-${selectedGroup}`}
          />
          <defs>
            <linearGradient id="ekgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#ef4444" stopOpacity="1" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-around bg-gray-50/80 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 font-medium">
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 block" />
          <span>
            Universal Donor:{" "}
            <strong className="text-gray-800 dark:text-gray-200 font-bold">O-</strong>
          </span>
        </motion.div>
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 block" />
          <span>
            Universal Recipient:{" "}
            <strong className="text-gray-800 dark:text-gray-200 font-bold">AB+</strong>
          </span>
        </motion.div>
      </div>
    </div>
  );
}
