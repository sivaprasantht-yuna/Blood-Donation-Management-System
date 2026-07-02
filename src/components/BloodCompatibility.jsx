import React, { useState } from "react";
import { motion } from "motion/react";
import { Heart, ArrowUpRight, ArrowDownLeft } from "lucide-react";

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

export default function BloodCompatibility() {
  const [selectedGroup, setSelectedGroup] = useState("O+");

  const info = COMPATIBILITY_MAP[selectedGroup];

  return (
    <div
      id="blood-compatibility"
      className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-red-50/50"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <span className="text-xs font-semibold px-3 py-1 bg-red-50 text-red-600 rounded-full inline-flex items-center gap-1.5 mb-2">
            <Heart size={12} className="fill-red-600" /> Interactive Matrix
          </span>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
            Blood Type Matcher
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Select a blood group to discover its compatible donor/recipient
            relationships instantly.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {BLOOD_GROUPS.map((group) => (
            <button
              key={group}
              id={`btn-compat-${group}`}
              onClick={() => setSelectedGroup(group)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition duration-300 transform active:scale-95 ${
                selectedGroup === group
                  ? "bg-red-600 text-white shadow-md shadow-red-200"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Can Donate To */}
        <motion.div
          key={`donate-to-${selectedGroup}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-red-50/40 rounded-2xl p-6 border border-red-100/50"
        >
          <div className="flex items-center gap-3 mb-4 text-red-700">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <ArrowUpRight size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-red-500">
                Can Donate To
              </p>
              <p className="text-lg font-bold">Compatible Recipients</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {BLOOD_GROUPS.map((group) => {
              const isCompatible = info.donateTo.includes(group);
              return (
                <div
                  key={`donate-${group}`}
                  className={`w-12 h-12 flex items-center justify-center font-bold text-sm rounded-xl transition duration-500 ${
                    isCompatible
                      ? "bg-red-600 text-white shadow-sm ring-4 ring-red-100 border border-transparent"
                      : "bg-white text-gray-300 border border-gray-100"
                  }`}
                >
                  {group}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-red-600/80 mt-4 leading-relaxed font-medium">
            Donors with type{" "}
            <strong className="font-bold">{selectedGroup}</strong> can
            successfully transfer blood to individuals with these highlighted
            types without reaction risks.
          </p>
        </motion.div>

        {/* Can Receive From */}
        <motion.div
          key={`receive-from-${selectedGroup}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-emerald-50/40 rounded-2xl p-6 border border-emerald-100/50"
        >
          <div className="flex items-center gap-3 mb-4 text-emerald-700">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <ArrowDownLeft size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                Can Receive From
              </p>
              <p className="text-lg font-bold">Compatible Donors</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {BLOOD_GROUPS.map((group) => {
              const isCompatible = info.receiveFrom.includes(group);
              return (
                <div
                  key={`receive-${group}`}
                  className={`w-12 h-12 flex items-center justify-center font-bold text-sm rounded-xl transition duration-500 ${
                    isCompatible
                      ? "bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100 border border-transparent"
                      : "bg-white text-gray-300 border border-gray-100"
                  }`}
                >
                  {group}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-emerald-700/80 mt-4 leading-relaxed font-medium">
            Individuals of type{" "}
            <strong className="font-bold">{selectedGroup}</strong> can safely
            receive blood transfusions from any of these highlighted donor
            types.
          </p>
        </motion.div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 justify-around bg-gray-50/80 p-4 rounded-xl border border-gray-100 text-xs text-gray-500 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 block"></span>
          <span>
            Universal Donor:{" "}
            <strong className="text-gray-800 font-bold">O-</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 block"></span>
          <span>
            Universal Recipient:{" "}
            <strong className="text-gray-800 font-bold">AB+</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
