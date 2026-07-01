import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Plus,
  Check,
} from "lucide-react";
import { motion } from "motion/react";

export default function DonationCamps({
  camps,
  onAddCamp,
  isAuthenticated,
  userType,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    city: "",
    date: "",
    time: "",
    organizer: "",
    contact: "",
  });

  const handleCopy = (id, contact) => {
    navigator.clipboard.writeText(contact);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onAddCamp) return;

    if (
      !formData.title ||
      !formData.location ||
      !formData.city ||
      !formData.date ||
      !formData.time ||
      !formData.organizer
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const success = await onAddCamp(formData);
    if (success) {
      setSuccessMsg("Donation Camp registered successfully!");
      setFormData({
        title: "",
        location: "",
        city: "",
        date: "",
        time: "",
        organizer: "",
        contact: "",
      });
      setTimeout(() => {
        setSuccessMsg("");
        setShowAddForm(false);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
            Active Donation Camps
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Join local donation campaigns happening in major cities near you.
          </p>
        </div>

        {/* Only hospitals or admins can host a new camp */}
        {isAuthenticated &&
          (userType === "hospital" || userType === "admin") && (
            <button
              id="register-camp-btn"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition flex items-center gap-2 shadow-md shadow-red-100"
            >
              <Plus size={16} /> Host Donation Camp
            </button>
          )}
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-red-50 shadow-lg max-w-2xl"
        >
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            Register a Donation Camp
          </h4>
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold flex items-center gap-2">
              <Check size={16} /> {successMsg}
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Camp Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. LifeSaviors Blood Drive"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Camp Location Address *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. YMCA Ground, Nandanam"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CHENNAI"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Organizer Hospital/NGO *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. City General Hospital"
                value={formData.organizer}
                onChange={(e) =>
                  setFormData({ ...formData, organizer: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Timing *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 09:00 AM - 04:00 PM"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Inquiries Contact Phone
              </label>
              <input
                type="tel"
                placeholder="e.g. 9840012345"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition"
              >
                Submit Camp
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {camps.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400">
          No camps scheduled at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {camps.map((camp) => (
            <div
              key={camp.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-red-100/80 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold tracking-wider text-red-600 uppercase px-2.5 py-1 bg-red-50 rounded-md inline-block mb-3">
                  {camp.city}
                </span>
                <h4 className="font-bold text-gray-900 text-lg leading-snug line-clamp-2">
                  {camp.title}
                </h4>

                <div className="space-y-2.5 mt-4 text-sm text-gray-600">
                  <div className="flex items-start gap-2.5">
                    <MapPin
                      size={16}
                      className="text-gray-400 mt-0.5 shrink-0"
                    />
                    <span>{camp.location}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar size={16} className="text-gray-400 shrink-0" />
                    <span>{camp.date}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock size={16} className="text-gray-400 shrink-0" />
                    <span>{camp.time}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <User size={16} className="text-gray-400 shrink-0" />
                    <span className="text-xs truncate">
                      Hosted by:{" "}
                      <strong className="font-semibold text-gray-700">
                        {camp.organizer}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {camp.contact && (
                <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    Inquiries:
                  </span>
                  <button
                    onClick={() => handleCopy(camp.id, camp.contact)}
                    className="text-xs text-red-600 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition active:scale-95"
                  >
                    {copiedId === camp.id ? (
                      <>
                        <Check size={12} /> Copied!
                      </>
                    ) : (
                      <>
                        <Phone size={12} /> {camp.contact}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
