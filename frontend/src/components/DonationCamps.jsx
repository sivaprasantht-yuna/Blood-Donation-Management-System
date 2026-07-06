import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  Plus,
  Check,
  Search,
  X,
  Frown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const campCardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 22 },
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

export default function DonationCamps({
  camps,
  onAddCamp,
  isAuthenticated,
  userType,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    city: "",
    date: "",
    time: "",
    organizer: "",
    contact: "",
  });

  // Extract unique cities dynamically from camps
  const allCities = useMemo(() => {
    const cities = [...new Set(camps.map((c) => c.city?.toUpperCase()).filter(Boolean))];
    return cities.sort();
  }, [camps]);

  // Filter camps by search query and city
  const filteredCamps = useMemo(() => {
    return camps.filter((camp) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        camp.title?.toLowerCase().includes(q) ||
        camp.location?.toLowerCase().includes(q) ||
        camp.city?.toLowerCase().includes(q) ||
        camp.organizer?.toLowerCase().includes(q);

      const matchesCity =
        !selectedCity || camp.city?.toUpperCase() === selectedCity;

      return matchesSearch && matchesCity;
    });
  }, [camps, searchQuery, selectedCity]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Active Donation Camps
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Join local donation campaigns happening in major cities near you.
          </p>
        </div>

        {/* Only hospitals or admins can host a new camp */}
        {isAuthenticated &&
          (userType === "hospital" || userType === "admin") && (
            <motion.button
              id="register-camp-btn"
              onClick={() => setShowAddForm(!showAddForm)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition flex items-center gap-2 shadow-md shadow-red-100 dark:shadow-red-900/30 cursor-pointer shrink-0"
            >
              <Plus size={16} /> Host Donation Camp
            </motion.button>
          )}
      </div>

      {/* Search + City Filters */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
          />
          <input
            id="camp-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search camps by name, location, organizer..."
            className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 dark:focus:border-red-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* City Filter Pills */}
        {allCities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setSelectedCity(null)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition cursor-pointer ${
                selectedCity === null
                  ? "bg-red-600 text-white shadow-sm shadow-red-200 dark:shadow-red-900/30"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              All Cities
            </motion.button>
            {allCities.map((city) => (
              <motion.button
                key={city}
                id={`filter-city-${city.toLowerCase()}`}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() =>
                  setSelectedCity(selectedCity === city ? null : city)
                }
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition cursor-pointer ${
                  selectedCity === city
                    ? "bg-red-600 text-white shadow-sm shadow-red-200 dark:shadow-red-900/30"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <MapPin size={10} className="inline mr-1 -mt-0.5" />
                {city}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-red-50 dark:border-gray-700 shadow-lg max-w-2xl"
        >
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Register a Donation Camp
          </h4>
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-semibold flex items-center gap-2">
              <Check size={16} /> {successMsg}
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
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
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
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
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
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
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
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
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
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
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Inquiries Contact Phone
              </label>
              <input
                type="tel"
                placeholder="e.g. 9840012345"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold transition"
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

      {filteredCamps.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-12 text-center"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="inline-block mb-4"
          >
            <Frown size={48} className="text-gray-300 dark:text-gray-600 mx-auto" />
          </motion.div>
          <p className="text-gray-400 dark:text-gray-500 font-semibold text-sm">
            {searchQuery || selectedCity
              ? "No camps match your search criteria."
              : "No camps scheduled at the moment."}
          </p>
          {(searchQuery || selectedCity) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCity(null);
              }}
              className="mt-3 text-xs text-red-600 dark:text-red-400 hover:text-red-700 font-semibold underline underline-offset-2 transition"
            >
              Clear all filters
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          key={`${searchQuery}-${selectedCity}`}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredCamps.map((camp) => (
              <motion.div
                key={camp.id}
                variants={campCardVariants}
                layout
                className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:border-red-200 dark:hover:border-red-800/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-red-600 dark:text-red-400 uppercase px-2.5 py-1 bg-red-50 dark:bg-red-950/30 rounded-md inline-block mb-3">
                    {camp.city}
                  </span>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-snug line-clamp-2">
                    {camp.title}
                  </h4>

                  <div className="space-y-2.5 mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-start gap-2.5">
                      <MapPin
                        size={16}
                        className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0"
                      />
                      <span>{camp.location}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Calendar size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
                      <span>{camp.date}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
                      <span>{camp.time}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <User size={16} className="text-gray-400 dark:text-gray-500 shrink-0" />
                      <span className="text-xs truncate">
                        Hosted by:{" "}
                        <strong className="font-semibold text-gray-700 dark:text-gray-300">
                          {camp.organizer}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {camp.contact && (
                  <div className="mt-5 pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Inquiries:
                    </span>
                    <button
                      onClick={() => handleCopy(camp.id, camp.contact)}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 font-bold bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition active:scale-95"
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
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Results counter */}
      {camps.length > 0 && (
        <div className="text-center">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            Showing {filteredCamps.length} of {camps.length} camp
            {camps.length !== 1 ? "s" : ""}
            {selectedCity ? ` in ${selectedCity}` : ""}
          </span>
        </div>
      )}
    </div>
  );
}
