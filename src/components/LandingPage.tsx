import React from 'react';
import { motion } from 'motion/react';
import { Heart, Activity, Users, Landmark, Zap, Shield, ArrowRight, Award, MapPin } from 'lucide-react';
import BloodCompatibility from './BloodCompatibility';
import SuccessStories from './SuccessStories';
import DonationCamps from './DonationCamps';
import { DonationCamp, GlobalStats } from '../types';

interface LandingPageProps {
  stats: GlobalStats;
  camps: DonationCamp[];
  onBecomeDonor: () => void;
  onHospitalPortal: () => void;
  onAddCamp?: (camp: Omit<DonationCamp, 'id'>) => Promise<boolean>;
  isAuthenticated: boolean;
  userType: string | null;
}

export default function LandingPage({
  stats,
  camps,
  onBecomeDonor,
  onHospitalPortal,
  onAddCamp,
  isAuthenticated,
  userType
}: LandingPageProps) {
  return (
    <div className="bg-[#FAFAFA] min-h-screen text-gray-900 pb-20 selection:bg-red-500 selection:text-white">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-radial from-red-50/70 via-[#FAFAFA] to-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Info Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start justify-center">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-100/50 border border-red-200 text-red-600 rounded-full font-bold text-xs tracking-wide"
              >
                <Activity size={12} className="animate-pulse" /> Emergency Response Network
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-901 tracking-tight leading-[1.1] text-center lg:text-left"
              >
                Every Drop <br className="hidden lg:inline" />
                <span className="text-red-600 bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">Saves A Life</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-gray-650 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
              >
                Connect hospitals with verified, eligible blood donors in real-time. Speed up critical transfusions instantly, bypassing traditional delays during medical emergencies.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 pt-2 w-full sm:w-auto justify-center"
              >
                <button
                  id="hero-become-donor-btn"
                  onClick={onBecomeDonor}
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200 transition duration-300 flex items-center justify-center gap-2 transform active:scale-95 text-base w-full sm:w-auto"
                >
                  Become a Donor <ArrowRight size={18} />
                </button>
                <button
                  id="hero-hospital-portal-btn"
                  onClick={onHospitalPortal}
                  className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-bold rounded-2xl shadow-sm transition duration-300 flex items-center justify-center gap-2 transform active:scale-95 text-base w-full sm:w-auto"
                >
                  Hospital Portal
                </button>
              </motion.div>
            </div>

            {/* Right Illustrative Column with FLOAT live widgets */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0 flex justify-center">
              
              {/* Decorative Circle Gradients */}
              <div className="absolute w-72 h-72 rounded-full bg-red-300/20 blur-3xl -top-10 -left-10" />
              <div className="absolute w-72 h-72 rounded-full bg-rose-200/20 blur-3xl -bottom-10 -right-10" />

              {/* Heart Beat & Interactive Mock Frame representing system */}
              <div className="relative w-full max-w-sm bg-white rounded-3xl border border-gray-100 p-8 shadow-2xl flex flex-col items-center">
                
                {/* Heart Center Visual */}
                <div className="w-24 h-24 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-6 relative">
                  <Heart size={44} className="text-red-600 fill-red-600 animate-pulse" />
                  <span className="absolute inline-flex h-full w-full rounded-2xl bg-red-400 opacity-10 animate-ping -z-10" />
                </div>

                <h4 className="text-gray-900 font-bold text-lg">LifeDrop Match Engine</h4>
                <p className="text-xs text-gray-500 font-medium mt-1">Live Emergency Tracker Active</p>
                
                {/* FLOATING ACTION CARDS */}
                <div className="w-full space-y-3.5 mt-8 relative">
                  
                  {/* Floating Cell 1 */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                    className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-gray-100 shadow-md transform hover:scale-[1.02] transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center font-extrabold text-red-600 text-sm shrink-0">
                      O+
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-gray-400">Available Donors</p>
                      <p className="text-sm font-bold text-gray-800">12 Donors Match Chennai</p>
                    </div>
                  </motion.div>

                  {/* Floating Cell 2 */}
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
                    className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-gray-100 shadow-md transform hover:scale-[1.02] transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <Zap size={14} className="text-amber-500 fill-amber-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-gray-400">Emergency Alert Sent</p>
                      <p className="text-sm font-bold text-gray-800">City General Hospital</p>
                    </div>
                  </motion.div>

                  {/* Floating Cell 3 */}
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut", delay: 1 }}
                    className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-gray-100 shadow-md transform hover:scale-[1.02] transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                      <Shield size={14} className="text-emerald-500 fill-emerald-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-gray-400">Real-Time Response</p>
                      <p className="text-sm font-bold text-gray-800">Donor Matched instantly</p>
                    </div>
                  </motion.div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section className="py-10 bg-white border-t border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4 sm:gap-8 text-center">
            
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="text-red-500" size={24} />
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                  {stats.registeredDonors.toLocaleString()}+
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registered Donors</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Heart className="text-emerald-500 fill-emerald-100" size={24} />
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                  {stats.livesSaved.toLocaleString()}+
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lives Saved</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Landmark className="text-blue-500" size={24} />
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                  {stats.partnerHospitals.toLocaleString()}+
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Partner Hospitals</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Activity className="text-amber-500" size={24} />
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                  {stats.totalRequests.toLocaleString()}+
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Broadcasting Requests</p>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">How LifeDrop Works</h2>
            <p className="text-gray-500 mt-2 text-sm">Saving lives requires no friction. We connect hearts in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            
            {/* Step 1 */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-4 shadow-xl shadow-gray-100/50 hover:shadow-2xl transition duration-300 relative group">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 font-extrabold text-lg flex items-center justify-center">
                01
              </div>
              <h3 className="text-xl font-bold text-gray-950">Register Profile</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Create your account as either an eligible blood donor or an accredited hospital. Add location, contact information, and blood groups.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-4 shadow-xl shadow-gray-100/50 hover:shadow-2xl transition duration-300 relative">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 font-extrabold text-lg flex items-center justify-center">
                02
              </div>
              <h3 className="text-xl font-bold text-gray-950">Get Real-Time Match</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                When hospitals broadcast an urgent demand, our matching algorithm scans and alerts eligible healthy matching donors in the exact city instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-4 shadow-xl shadow-gray-100/50 hover:shadow-2xl transition duration-300 relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-extrabold text-lg flex items-center justify-center">
                03
              </div>
              <h3 className="text-xl font-bold text-gray-950">Save Lives</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Donors accept the alert with one click. Hospital staff gets matching alerts, coordinate with the donor, fulfill the requirement, and issue dynamic certificates.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* BLOOD COMPATIBILITY MATRIX MAP */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <BloodCompatibility />
        </div>
      </section>

      {/* TESTIMONIAL SUCCESS STORIES SECTION */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SuccessStories />
        </div>
      </section>

      {/* UPCOMING CLINICAL CAMPS Drives */}
      <section className="py-20 bg-white border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DonationCamps
            camps={camps}
            onAddCamp={onAddCamp}
            isAuthenticated={isAuthenticated}
            userType={userType || ''}
          />
        </div>
      </section>

      {/* CALL TO ACTION SECTION */}
      <section className="mx-4 sm:mx-8 lg:mx-auto max-w-5xl mt-20">
        <div className="bg-slate-900 rounded-3xl p-10 md:p-14 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute w-72 h-72 rounded-full bg-red-600/20 blur-3xl -top-20 -left-20" />
          <div className="absolute w-72 h-72 rounded-full bg-red-400/10 blur-3xl -bottom-20 -right-20" />

          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Ready To Save Lives?</h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Join the fastest real-time blood transfusion registry. Sign up today and play your part in secure, live clinical response during emergency medical procedures.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={onBecomeDonor}
                className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-600/30 transition transform active:scale-95 text-sm"
              >
                Become a Donor
              </button>
              <button
                onClick={onHospitalPortal}
                className="px-6 py-3.5 bg-transparent hover:bg-white/5 border border-white/20 text-white font-bold rounded-2xl transition transform active:scale-95 text-sm"
              >
                Register Accredited Hospital
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
