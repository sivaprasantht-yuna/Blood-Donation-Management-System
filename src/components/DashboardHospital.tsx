import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Landmark, Activity, Heart, ShieldCheck, Plus, Minus, AlertTriangle, Send, CheckCircle2, ChevronRight, Bell, Sparkles, MapPin, Eye, FileText, Check, Phone, Search, Filter, Settings, RefreshCw, Calendar, Mail, MessageSquare } from 'lucide-react';
import { BloodRequest, Notification } from '../types';

interface DashboardHospitalProps {
  hospitalId: string;
  onLogout: () => void;
  liveTrigger: any;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DashboardHospital({ hospitalId, onLogout, liveTrigger }: DashboardHospitalProps) {
  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [smsLogs, setSmsLogs] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submittingBroadcast, setSubmittingBroadcast] = useState(false);
  const [updatingInventory, setUpdatingInventory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'operations' | 'search' | 'logs' | 'settings'>('operations');

  const [toastMsg, setToastMsg] = useState("");

  // Broadcast Form State
  const [formData, setFormData] = useState({
    bloodGroup: 'B+',
    unitsRequired: '2',
    urgency: 'Medium' as any,
    patientReference: '',
    notes: ''
  });

  // Settings Toggles Form State
  const [preferences, setPreferences] = useState({
    emailEnabled: true,
    smsEnabled: true
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBlood, setSearchBlood] = useState("ALL");
  const [filterAvailability, setFilterAvailability] = useState("ALL"); // ALL, Yes, No
  const [filterEligibility, setFilterEligibility] = useState("ALL");   // ALL, Yes, No

  const fetchHospitalData = async () => {
    try {
      // 1. Profile
      const profRes = await fetch(`/api/hospitals/${hospitalId}`);
      if (!profRes.ok) throw new Error("Failed to fetch hospital profiles");
      const profData = await profRes.json();
      setProfile(profData);
      setPreferences({
        emailEnabled: profData.emailEnabled !== false,
        smsEnabled: profData.smsEnabled !== false
      });

      // 2. My requests
      const reqRes = await fetch('/api/admin/requests');
      if (reqRes.ok) {
        const all: BloodRequest[] = await reqRes.json();
        setRequests(all.filter(r => r.hospitalId === hospitalId));
      }

      // 3. Notifications
      const notRes = await fetch(`/api/notifications?hospitalId=${hospitalId}`);
      if (notRes.ok) {
        const nots = await notRes.json();
        setNotifications(nots);
      }

      // 4. Donors for search directory
      const donorRes = await fetch('/api/admin/donors');
      if (donorRes.ok) {
        const donorList = await donorRes.json();
        setDonors(donorList);
      }

      // 5. Activity Logs
      const logsRes = await fetch('/api/activity-logs');
      if (logsRes.ok) {
        const systemLogs = await logsRes.json();
        setActivityLogs(systemLogs);
      }

      // 6. Email/SMS logs
      const commsRes = await fetch('/api/email-sms-logs');
      if (commsRes.ok) {
        const commsData = await commsRes.json();
        setEmailLogs(commsData.emailLogs);
        setSmsLogs(commsData.smsLogs);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalData();
  }, [hospitalId, liveTrigger]);

  const handleUpdateStock = async (group: string, operation: 'add' | 'subtract') => {
    if (!profile || updatingInventory) return;
    setUpdatingInventory(group);

    const currentCount = profile.bloodInventory[group] || 0;
    let nextCount = operation === 'add' ? currentCount + 1 : currentCount - 1;
    if (nextCount < 0) nextCount = 0;

    const nextInventory = {
      ...profile.bloodInventory,
      [group]: nextCount
    };

    try {
      const response = await fetch(`/api/hospitals/${hospitalId}/inventory`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory: nextInventory })
      });
      if (response.ok) {
        setProfile((prev: any) => ({ ...prev, bloodInventory: nextInventory }));
        setToastMsg(`Inventory for ${group} adjusted to ${nextCount} units.`);
        setTimeout(() => setToastMsg(""), 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingInventory(null);
    }
  };

  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || submittingBroadcast) return;

    if (!formData.patientReference || !formData.unitsRequired) {
      alert("Please fill in patient reference and units amount.");
      return;
    }

    setSubmittingBroadcast(true);

    try {
      const response = await fetch(`/api/hospitals/${hospitalId}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to finalize broadcast");
      }

      setToastMsg(`Success! Scanned matching database: Broadcast dispatched to matching donors!`);
      setTimeout(() => setToastMsg(""), 3000);
      setFormData({
        bloodGroup: 'B+',
        unitsRequired: '2',
        urgency: 'Medium',
        patientReference: '',
        notes: ''
      });
      
      // Trigger update
      fetchHospitalData();
    } catch (err: any) {
      alert(err.message || "Something went wrong.");
    } finally {
      setSubmittingBroadcast(false);
    }
  };

  const handleCompleteRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/hospitals/${hospitalId}/requests/${requestId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setToastMsg("Perfect! Broadcast completed & accredited inventory updated.");
        setTimeout(() => setToastMsg(""), 2000);
        fetchHospitalData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingSettings) return;
    setSavingSettings(true);

    try {
      const res = await fetch('/api/auth/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: hospitalId,
          userType: 'hospital',
          theme: profile?.theme || 'light',
          emailEnabled: preferences.emailEnabled,
          smsEnabled: preferences.smsEnabled
        })
      });
      if (res.ok) {
        const result = await res.json();
        setProfile(result.account);
        setToastMsg("Notification preferences successfully saved to account!");
        setTimeout(() => setToastMsg(""), 2000);
        fetchHospitalData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  const markNotificationsAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: unreadIds })
      });
      fetchHospitalData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-screen">
        <RefreshCw className="animate-spin text-red-600 mb-4 h-12 w-12" />
        <h4 className="font-extrabold text-sm uppercase text-gray-500 tracking-wider">Accessing LifeDrop Health Core</h4>
      </div>
    );
  }

  // Stock aggregations
  const totalStockUnits = Object.values(profile.bloodInventory as Record<string, number>).reduce((a, b) => a + b, 0);
  const activeRequestsCount = requests.filter(r => r.status !== 'completed').length;
  const fulfilledRequestsCount = requests.filter(r => r.status === 'completed').length;

  // Filter donor list logic
  const filteredDonors = donors.filter(donor => {
    // 1. Search blood group
    if (searchBlood !== "ALL" && donor.bloodGroup !== searchBlood) return false;
    
    // 2. Search query (City or State)
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const cityMatch = donor.city?.toLowerCase().includes(searchLower);
      const stateMatch = donor.state?.toLowerCase().includes(searchLower);
      const nameMatch = donor.fullName?.toLowerCase().includes(searchLower);
      if (!cityMatch && !stateMatch && !nameMatch) return false;
    }

    // 3. Availability status
    if (filterAvailability !== "ALL") {
      const wantsAvailable = filterAvailability === "Yes";
      if (donor.isAvailable !== wantsAvailable) return false;
    }

    // 4. Eligibility status (assume 90-day window check)
    if (filterEligibility !== "ALL") {
      const wantsEligible = filterEligibility === "Yes";
      const lastDon = donor.lastDonationDate;
      let eligible = true;
      if (lastDon) {
        const lastDate = new Date(lastDon);
        const daysDiff = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
        eligible = daysDiff >= 90;
      }
      if (eligible !== wantsEligible) return false;
    }

    return true;
  });

  return (
    <div className="py-8 bg-[#FAFAFA] dark:bg-[#111827] text-gray-900 dark:text-white transition-colors duration-250 min-h-screen text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Floating Toast Notification Panel */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-4 sm:right-10 z-50 bg-[#1F2937] dark:bg-red-950 text-white border border-red-500/30 px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3.5"
            >
              <Sparkles size={18} className="text-red-400 animate-pulse" />
              <span className="text-xs font-bold leading-normal">{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CLINICAL HERO HEADER CARD */}
        <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 md:p-8 border border-gray-150 dark:border-gray-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden transition-colors">
          <div className="absolute w-60 h-60 rounded-full bg-red-100/10 dark:bg-red-500/5 blur-3xl -top-10 -left-10" />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-2xl shrink-0">
              <Landmark size={28} />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{profile.hospitalName}</h2>
                <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-100 dark:border-emerald-900/40 uppercase inline-flex items-center gap-0.5">
                  <ShieldCheck size={12} /> VERIFIED HUB
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-300">
                <span className="flex items-center gap-1"><MapPin size={12} /> {profile.city}</span>
                <span>• License: {profile.licenseNumber}</span>
                <span>• Contact: {profile.phone}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 dark:text-gray-300 font-mono font-bold bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 self-stretch md:self-auto flex md:flex-col justify-between md:justify-center items-center md:items-start gap-1">
            <span>Accredited Portal active</span>
            <span className="text-gray-950 dark:text-white font-semibold">{profile.email}</span>
          </div>
        </div>

        {/* TABS SELECTOR MENU BAR */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('operations')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'operations'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            📊 Operations & Stock
          </button>
          
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'search'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Search size={14} /> Find Volunteers
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            📋 Audit logs
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'settings'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Settings size={14} /> Alerts settings
          </button>
        </div>

        {/* TAB 1: OPERATIONS TAB */}
        {activeTab === 'operations' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* ANALYTICS MODULES COUNTERS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-gray-150 dark:border-gray-800 shadow-md flex flex-col justify-between transition-colors">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-300 uppercase tracking-widest">Total Stock</span>
                <div className="my-4 text-left">
                  <p className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{totalStockUnits}</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">Available Units</p>
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-300 font-semibold">Allocated across categories.</p>
              </div>

              <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-gray-150 dark:border-gray-800 shadow-md flex flex-col justify-between transition-colors">
                <span className="text-xs font-bold text-[#DC2626] uppercase tracking-widest">Broadcasting Alert</span>
                <div className="my-4 text-left">
                  <p className="text-5xl font-black text-red-600 dark:text-red-500 tracking-tight leading-none">{activeRequestsCount}</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-250 mt-1">Active requests</p>
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-300 font-semibold">Scanning local donors.</p>
              </div>

              <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-gray-150 dark:border-gray-800 shadow-md flex flex-col justify-between transition-colors">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Completed Drives</span>
                <div className="my-4 text-left">
                  <p className="text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">{fulfilledRequestsCount}</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-250 mt-1">Fulfilled patients</p>
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-300 font-semibold">Fulfillment completed.</p>
              </div>

              <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-gray-150 dark:border-gray-800 shadow-md flex flex-col justify-between transition-colors">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest text-[10px]">Multiplier Estimate</span>
                <div className="my-4 text-left">
                  <p className="text-5xl font-black text-blue-600 dark:text-blue-400 tracking-tight leading-none">{fulfilledRequestsCount * 3}</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-250 mt-1">Lives saved scoring</p>
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-300 font-semibold">1 blood unit saves 3 patients.</p>
              </div>
            </div>

            {/* BLOOD TYPE STOCK INVENTORY MANAGER */}
            <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-gray-150 dark:border-gray-800 shadow-xl space-y-4 transition-colors">
              <div>
                <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Hospital Blood Inventory Manager</h3>
                <p className="text-xs text-gray-500 dark:text-gray-350 mt-0.5">Edit available clinical quantities. Local donors can view compatible inventories near Chennai.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                {BLOOD_GROUPS.map((group) => {
                  const count = profile.bloodInventory[group] || 0;
                  return (
                    <div
                      key={group}
                      className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shrink-0 hover:border-red-100 dark:hover:border-red-950 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 flex flex-col justify-between text-center min-h-[140px]"
                    >
                      <span className="font-extrabold text-sm text-red-600 dark:text-red-400 font-mono">{group}</span>
                      
                      <div className="my-2">
                        <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{count}</p>
                        <p className="text-[9px] text-gray-400 dark:text-gray-300 font-bold uppercase mt-1">Units</p>
                      </div>

                      <div className="flex gap-1.5 justify-center">
                        <button
                          onClick={() => handleUpdateStock(group, 'subtract')}
                          disabled={count === 0 || updatingInventory !== null}
                          className="p-1 px-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-white transition font-bold disabled:opacity-40 cursor-pointer"
                        >
                          <Minus size={11} />
                        </button>
                        <button
                          onClick={() => handleUpdateStock(group, 'add')}
                          disabled={updatingInventory !== null}
                          className="p-1 px-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition font-bold cursor-pointer"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BROADCAST FORM & NOTIFICATION INBOX */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Form column (2 cols) */}
              <div className="lg:col-span-2 bg-white dark:bg-[#1F2937] rounded-3xl p-6 md:p-8 border border-gray-150 dark:border-gray-800 shadow-xl space-y-6 text-left relative overflow-hidden transition-colors">
                <span className="absolute -top-12 -right-12 bg-red-50 dark:bg-red-950/20 text-red-500 w-32 h-32 rounded-full opacity-10 flex items-center justify-center">
                  <Send size={44} />
                </span>

                <div>
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-xl flex items-center gap-2"><Send size={18} className="text-red-500" /> Live Emergency Broadcast Center</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-350 mt-1">Dispatches an instant emergency alert. The match system maps matching, available and eligible donors instantly.</p>
                </div>

                <form onSubmit={handleCreateBroadcast} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300">Required Group *</label>
                      <select
                        id="broadcast-blood"
                        value={formData.bloodGroup}
                        onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-250 dark:border-gray-700 rounded-xl text-xs bg-white dark:bg-gray-800 focus:outline-none focus:border-red-500 dark:text-white"
                      >
                        {BLOOD_GROUPS.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300">Units *</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        required
                        id="broadcast-units"
                        value={formData.unitsRequired}
                        onChange={e => setFormData({ ...formData, unitsRequired: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-250 dark:border-gray-700 rounded-xl text-xs bg-white dark:bg-gray-800 focus:outline-none focus:border-red-500 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300">Urgency level *</label>
                      <select
                        value={formData.urgency}
                        onChange={e => setFormData({ ...formData, urgency: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-250 dark:border-gray-700 rounded-xl text-xs bg-white dark:bg-gray-800 focus:outline-none focus:border-red-500 dark:text-white"
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300">Patient Case ID *</label>
                      <input
                        type="text"
                        required
                        id="broadcast-patient-id"
                        placeholder="e.g. PAT-9502"
                        value={formData.patientReference}
                        onChange={e => setFormData({ ...formData, patientReference: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-250 dark:border-gray-700 rounded-xl text-xs bg-white dark:bg-gray-800 focus:outline-none focus:border-red-500 dark:text-white"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-300">Case clinical notes / summary</label>
                      <input
                        type="text"
                        id="broadcast-notes"
                        placeholder="e.g. ICU surgery support."
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-250 dark:border-gray-700 rounded-xl text-xs bg-white dark:bg-gray-800 focus:outline-none focus:border-red-500 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingBroadcast}
                      className="px-6 py-3 bg-red-650 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-lg active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {submittingBroadcast ? "Matching Engine Scanning..." : "Send Emergency Alert Broadcast"}
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Alert box column (1 col) */}
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell size={18} className="text-gray-500 dark:text-gray-350" />
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Hospital Inbox</h3>
                  </div>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <button
                      onClick={markNotificationsAsRead}
                      className="text-xs text-red-650 hover:text-red-700 font-extrabold transition cursor-pointer"
                    >
                      Clear Unread
                    </button>
                  )}
                </div>

                <div className="bg-white dark:bg-[#1F2937] rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xl p-4 divide-y divide-gray-50 dark:divide-gray-700 max-h-[350px] overflow-y-auto transition-colors">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 dark:text-gray-300 text-xs">
                      No notifications matching hospital profile.
                    </div>
                  ) : (
                    notifications.map((not) => (
                      <div key={not.id} className={`py-3 first:pt-0 last:pb-0 ${!not.read ? 'bg-red-500/5 px-2 rounded-lg' : ''}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[8px] font-bold tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded uppercase">
                            {not.type}
                          </span>
                          <span className="text-[9px] text-gray-400 dark:text-gray-300">Just now</span>
                        </div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{not.title}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-300 leading-normal mt-0.5">{not.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* MY BROADCASTED LOGS TRACKERS */}
            <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 border border-gray-150 dark:border-gray-800 shadow-xl text-left space-y-4 transition-colors">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Broadcast Requests Tracker</h3>
              
              {requests.length === 0 ? (
                <div className="py-12 text-center text-gray-400 dark:text-gray-300 text-xs">
                  No active broadcasts registered yet. Emit emergencies using the panel above.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-gray-500 dark:text-gray-300">
                    <thead className="text-[10px] text-gray-400 dark:text-gray-300 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40">
                      <tr>
                        <th scope="col" className="px-6 py-3 font-semibold">Patient Ref</th>
                        <th scope="col" className="px-6 py-3 font-semibold">Category</th>
                        <th scope="col" className="px-6 py-3 font-semibold">Requirement</th>
                        <th scope="col" className="px-6 py-3 font-semibold">Urgency</th>
                        <th scope="col" className="px-6 py-3 font-semibold">Status</th>
                        <th scope="col" className="px-6 py-3 font-semibold">Matched Volunteer Phone</th>
                        <th scope="col" className="px-6 py-3 font-semibold">Action controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-750">
                      {requests.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                          <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{req.patientReference}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-650 dark:text-red-300 rounded text-xs font-black">{req.bloodGroup}</span>
                          </td>
                          <td className="px-6 py-4 font-bold">{req.unitsRequired} units</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              req.urgency === 'Critical' ? 'bg-red-600 text-white animate-pulse' : req.urgency === 'Medium' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                            }`}>
                              {req.urgency}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold uppercase inline-flex items-center gap-1 ${
                              req.status === 'completed' ? 'text-emerald-500' : req.status === 'accepted' ? 'text-blue-500' : 'text-amber-500'
                            }`}>
                              {req.status === 'completed' && <CheckCircle2 size={12} />} {req.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold">
                            {req.acceptedByDonorName ? (
                              <div className="flex flex-col text-left">
                                <span className="text-gray-900 dark:text-white font-black">{req.acceptedByDonorName}</span>
                                {req.acceptedByDonorPhone && (
                                  <a href={`tel:${req.acceptedByDonorPhone}`} className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 mt-1 font-bold">
                                    <Phone size={11} className="text-emerald-500 animate-bounce" /> {req.acceptedByDonorPhone}
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-300 dark:text-gray-500 font-medium">Matching scan in progress...</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {req.status === 'accepted' ? (
                              <button
                                onClick={() => handleCompleteRequest(req.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg transition active:scale-95 flex items-center gap-1 shadow-sm cursor-pointer"
                              >
                                <Check size={11} strokeWidth={3} /> Complete & Certify
                              </button>
                            ) : req.status === 'completed' ? (
                              <span className="text-emerald-650 dark:text-emerald-400 font-extrabold text-[10px] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded">Drive Complete</span>
                            ) : (
                              <span className="text-gray-300 dark:text-gray-500">Wait for accepts</span>
                            )}
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

        {/* TAB 2: FIND VOLUNTEERS SEARCH ENHANCED */}
        {activeTab === 'search' && (
          <div className="space-y-6 animate-in fade-in duration-250">
            
            {/* Search Filters Card */}
            <div className="bg-white dark:bg-[#1F2937] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xl space-y-4 text-left transition-colors">
              <div>
                <h3 className="font-extrabold text-gray-900 dark:text-white text-lg flex items-center gap-1.5">
                  <Filter size={18} className="text-red-500" />
                  Advanced Volunteer Match scans
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-300">Scan and locate vetted volunteer blood donors in specific regions during times of disaster.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Search by Name/City</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="e.g. Mumbai, Adyar or Donor Name"
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Blood Category</label>
                  <select
                    value={searchBlood}
                    onChange={e => setSearchBlood(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="ALL">All Categories</option>
                    {BLOOD_GROUPS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Is Available</label>
                  <select
                    value={filterAvailability}
                    onChange={e => setFilterAvailability(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="ALL">Any Status</option>
                    <option value="Yes">Currently Available</option>
                    <option value="No">Unavailable / Active rest</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Is Eligible</label>
                  <select
                    value={filterEligibility}
                    onChange={e => setFilterEligibility(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="ALL">Any Eligibility</option>
                    <option value="Yes">Eligible Drive Ready</option>
                    <option value="No">Under 90 Days Rest Required</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dir cards representation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {filteredDonors.length === 0 ? (
                <div className="col-span-full py-16 text-center bg-white dark:bg-[#1F2937] border border-gray-150 dark:border-gray-800 rounded-3xl text-gray-400 dark:text-gray-300">
                  No compatible volunteer donor profiles matched those filters. Try broad terms!
                </div>
              ) : (
                filteredDonors.map((donor) => {
                  // Determine eligibility (under 90 days checking)
                  let eligible = true;
                  let diffDays = 0;
                  if (donor.lastDonationDate) {
                    const lastDate = new Date(donor.lastDonationDate);
                    diffDays = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                    eligible = diffDays >= 90;
                  }

                  return (
                    <div 
                      key={donor.id}
                      className="bg-white dark:bg-[#1F2937] rounded-3xl border border-gray-150 dark:border-gray-800 shadow-md p-6 flex flex-col justify-between hover:scale-[101%] transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 h-16 w-16 bg-red-500/5 dark:bg-red-500/10 rounded-bl-[40px] flex items-center justify-center font-mono font-black text-red-650 dark:text-red-300 text-lg">
                        {donor.bloodGroup}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-extrabold text-sm text-gray-850 dark:text-white">
                            {donor.fullName.split(' ')[0][0]}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-gray-900 dark:text-white text-sm leading-tight">{donor.fullName}</h4>
                            <p className="text-[10px] text-gray-400 font-semibold">{donor.city}, {donor.state}</p>
                          </div>
                        </div>

                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between items-center text-[10px] border-b border-gray-50 dark:border-gray-750 pb-1.5 text-gray-500 dark:text-gray-300">
                            <span>Availability status</span>
                            {donor.isAvailable ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">Available Drive Ready</span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 font-bold uppercase">Resting</span>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-center text-[10px] border-b border-[#fafafa] dark:border-gray-750 py-1.5 text-gray-500 dark:text-gray-300">
                            <span>Eligibility window</span>
                            {eligible ? (
                              <span className="text-red-600 dark:text-red-400 font-extrabold uppercase inline-flex items-center gap-0.5"><CheckCircle2 size={10} /> Eligible</span>
                            ) : (
                              <span className="text-amber-500 font-bold uppercase inline-flex items-center gap-0.5"><AlertTriangle size={10} /> resting ({90 - diffDays}d left)</span>
                            )}
                          </div>

                          <div className="flex justify-between items-center text-[10px] pt-1.5 text-gray-500 dark:text-gray-300">
                            <span>Last Donated</span>
                            <span className="font-mono font-bold text-gray-900 dark:text-white">{donor.lastDonationDate || "Never Registered"}</span>
                          </div>
                        </div>

                        <div className="flex gap-1.5 flex-wrap pt-1">
                          {donor.badges && donor.badges.map((badge: string, bidx: number) => (
                            <span key={bidx} className="text-[9px] bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                              ⭐ {badge}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-750 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-300 font-semibold">
                        <span>Score: {donor.totalDonations} drive units</span>
                        <a href={`tel:${donor.phoneNumber}`} className="text-red-600 dark:text-red-400 hover:underline flex items-center gap-0.5 font-bold">
                          <Phone size={10} /> Contact Donor
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* TAB 3: AUDIT LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1F2937] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xl text-left space-y-4 transition-colors">
              <div>
                <h3 className="font-black text-gray-900 dark:text-white text-lg">Vetted System Logs Core</h3>
                <p className="text-xs text-gray-500 dark:text-gray-350">Chronological history registry tracking real-time broadcast dispatches, credentials verification states, database edits, matching acceptances, and logs dispatch audits.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-gray-500 dark:text-gray-300">
                  <thead className="text-[10px] text-gray-400 dark:text-gray-300 uppercase tracking-widest border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40">
                    <tr>
                      <th scope="col" className="px-6 py-3 font-semibold">Role author</th>
                      <th scope="col" className="px-6 py-3 font-semibold">Action label</th>
                      <th scope="col" className="px-6 py-3 font-semibold">Description details</th>
                      <th scope="col" className="px-6 py-3 font-semibold">Timestamp UTC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-750">
                    {activityLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-300">No events logged yet.</td>
                      </tr>
                    ) : (
                      activityLogs.slice(0, 50).map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                          <td className="px-6 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              log.role === 'admin' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : log.role === 'hospital' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                            }`}>
                              {log.role}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 font-bold font-mono tracking-tight text-[10px] text-gray-900 dark:text-white">{log.action}</td>
                          <td className="px-6 py-3.5 leading-relaxed text-gray-650 dark:text-gray-300">{log.description}</td>
                          <td className="px-6 py-3.5 font-mono text-gray-400 dark:text-gray-300 font-bold whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SIMULATED EMAIL & SMS AUDITING TRACKS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              
              {/* Simulated Mailbox logs */}
              <div className="bg-white dark:bg-[#1F2937] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xl space-y-3 transition-colors">
                <h4 className="font-extrabold text-gray-900 dark:text-white text-md flex items-center gap-1.5">
                  <Mail size={16} className="text-[#DC2626]" />
                  Simulated Notification Emails Log
                </h4>
                <p className="text-[11px] text-gray-400 leading-normal">Audit tracker logs of dispatches sent to matching donors' emails to ensure eligibility alerts.</p>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-750 pr-1">
                  {emailLogs.length === 0 ? (
                    <p className="text-center text-gray-400 dark:text-gray-300 py-6 text-xs">No email packets emitted yet in this session.</p>
                  ) : (
                    emailLogs.map((mail) => (
                      <div key={mail.id} className="pt-3 first:pt-0">
                        <div className="flex justify-between items-center mb-1 text-[10px] text-gray-400 dark:text-gray-350">
                          <span>To: <strong>{mail.to}</strong></span>
                          <span>{new Date(mail.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <h5 className="text-xs font-black text-gray-900 dark:text-white">Subject: {mail.subject}</h5>
                        <pre className="text-[10px] font-sans text-gray-500 dark:text-gray-300 whitespace-pre-line leading-relaxed bg-gray-50/60 dark:bg-gray-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 mt-1">
                          {mail.body}
                        </pre>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Simulated SMS dispatches */}
              <div className="bg-white dark:bg-[#1F2937] p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xl space-y-3 transition-colors">
                <h4 className="font-extrabold text-[#DC2626] text-md flex items-center gap-1.5">
                  <MessageSquare size={16} />
                  Simulated Emergency SMS Alerts Log
                </h4>
                <p className="text-[11px] text-gray-400 leading-normal">Audit tracker log of Indian SMS dispatches parsed to active mobile numbers.</p>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-750 pr-1">
                  {smsLogs.length === 0 ? (
                    <p className="text-center text-gray-400 dark:text-gray-300 py-6 text-xs">No SMS dispatches triggered yet.</p>
                  ) : (
                    smsLogs.map((sms) => (
                      <div key={sms.id} className="pt-3 first:pt-0">
                        <div className="flex justify-between items-center mb-1 text-[10px] text-gray-400 dark:text-gray-350">
                          <span>Phone: <strong>{sms.to}</strong></span>
                          <span className={`${sms.status === 'DELIVERED' ? 'text-emerald-500' : 'text-red-500'} font-black text-[9px] uppercase bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded`}>
                            {sms.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-650 dark:text-gray-300 leading-relaxed font-mono bg-red-500/5 p-2 rounded-xl border border-red-500/10">
                          {sms.body}
                        </p>
                        {sms.error && (
                          <p className="text-[9px] text-red-500 mt-0.5 font-bold">Error: {sms.error}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: SETTINGS & PREFERENCES */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-[#1F2937] p-6 md:p-8 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-xl space-y-6 text-left animate-in fade-in duration-200 transition-colors">
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-xl flex items-center gap-2"><Settings size={18} className="text-red-650" /> Alerts & Settings Preference</h3>
              <p className="text-xs text-gray-500 dark:text-gray-330 mt-1">Control active parameters and notifications channels allowed on your medical hub.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="space-y-4">
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-850/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="space-y-0.5 pr-4">
                    <label className="block text-sm font-extrabold text-gray-900 dark:text-white">Email dispatching alerts</label>
                    <span className="text-xs text-gray-400 dark:text-gray-350 leading-relaxed">Emits digital mail alerts to target clinical admins and matching compatible donors.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, emailEnabled: !preferences.emailEnabled })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      preferences.emailEnabled ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.emailEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="p-2 text-center text-xs text-gray-400 dark:text-gray-300 font-mono">
                  Email Notifications: <span className="font-bold text-gray-900 dark:text-white">{preferences.emailEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-850/30 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="space-y-0.5 pr-4">
                    <label className="block text-sm font-extrabold text-gray-900 dark:text-white">SMS broadcast dispatching</label>
                    <span className="text-xs text-gray-400 dark:text-gray-350 leading-relaxed">Pushes immediate emergency matching updates over vetted mobile numbers inside India.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, smsEnabled: !preferences.smsEnabled })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      preferences.smsEnabled ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.smsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="p-2 text-center text-xs text-gray-400 dark:text-gray-300 font-mono">
                  SMS Notifications: <span className="font-bold text-gray-900 dark:text-white">{preferences.smsEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>

              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs transition active:scale-95 cursor-pointer shadow-md"
                >
                  {savingSettings ? "Saving Settings..." : "Save Preferences"}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
