import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Heart,
  Activity,
  Users,
  Landmark,
  Zap,
  Shield,
  ArrowRight,
  Check,
} from "lucide-react";
import BloodCompatibility from "./BloodCompatibility";
import SuccessStories from "./SuccessStories";
import DonationCamps from "./DonationCamps";

// Animated Counter Hook — counts from 0 to target when element is in viewport
function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const step = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // EaseOutQuart for a snappy deceleration
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}+</span>;
}

// Stagger container for How It Works cards
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const fadeUpChild = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};
export default function LandingPage({
  stats,
  camps,
  onBecomeDonor,
  onHospitalRegister,
  onHospitalPortal,
  onAddCamp,
  isAuthenticated,
  userType,
}) {
  return (
    <div className="bg-[#FAFAFA] dark:bg-gray-950 min-h-screen text-gray-900 dark:text-gray-100 pb-20 selection:bg-red-500 selection:text-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-radial from-red-50/70 dark:from-red-950/30 via-[#FAFAFA] dark:via-gray-950 to-[#FAFAFA] dark:to-gray-950">
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
                <Activity size={12} className="animate-pulse" /> Emergency
                Response Network
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-901 tracking-tight leading-[1.1] text-center lg:text-left"
              >
                Every Drop <br className="hidden lg:inline" />
                <span className="text-red-650 bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                  Saves A Life
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-gray-650 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
              >
                Connect hospitals with verified, eligible blood donors in
                real-time. Speed up critical transfusions instantly, bypassing
                traditional delays during medical emergencies.
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
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200 dark:shadow-none transition duration-300 flex items-center justify-center gap-2 transform active:scale-95 text-base w-full sm:w-auto cursor-pointer"
                >
                  Become a Donor <ArrowRight size={18} />
                </button>
                <button
                  id="hero-hospital-register-btn"
                  onClick={onHospitalRegister}
                  className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-bold rounded-2xl shadow-sm transition duration-300 flex items-center justify-center gap-2 transform active:scale-95 text-base w-full sm:w-auto cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-700"
                >
                  Hospital Register
                </button>
              </motion.div>
            </div>

            {/* Right Illustrative Column with PULSING BLOOD DROP & FLOATING CARDS */}
            <div className="lg:col-span-5 relative mt-12 lg:mt-0 flex items-center justify-center min-h-[480px] w-full max-w-[450px] mx-auto select-none">
              {/* Decorative Circle Gradients (Background glow) */}
              <div className="absolute w-72 h-72 rounded-full bg-red-200/10 blur-3xl -top-10 -left-10 pointer-events-none" />
              <div className="absolute w-72 h-72 rounded-full bg-rose-300/15 blur-3xl -bottom-10 -right-10 pointer-events-none" />

              {/* Blue Circular Halo (Background Circle from Image) */}
              <div className="absolute w-72 h-72 rounded-full bg-blue-50/40 border border-blue-100/50 flex items-center justify-center z-0 pointer-events-none">
                {/* Concentric Pulsing Radar Rings */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-full h-full rounded-full border border-blue-200/35 bg-blue-100/5"
                    initial={{ scale: 0.8, opacity: 0.7 }}
                    animate={{ scale: 1.35, opacity: 0 }}
                    transition={{
                      repeat: Infinity,
                      duration: 4,
                      delay: i * 1.3,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </div>

              {/* Heartbeat Line (EKG Pulse Line spanning the background of the drop) */}
              <div className="absolute inset-x-0 top-[58%] -translate-y-1/2 w-full h-24 pointer-events-none z-0">
                <svg viewBox="0 0 400 100" className="w-full h-full opacity-30" preserveAspectRatio="none">
                  {/* Faded background path */}
                  <path
                    d="M 0 50 H 150 L 158 58 L 168 15 L 180 85 L 188 35 L 195 50 H 400"
                    fill="none"
                    stroke="#FCA5A5"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  {/* Moving pulse indicator */}
                  <motion.path
                    d="M 0 50 H 150 L 158 58 L 168 15 L 180 85 L 188 35 L 195 50 H 400"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "400", strokeDashoffset: "400" }}
                    animate={{ strokeDashoffset: [400, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 3.5,
                      ease: "linear",
                    }}
                  />
                </svg>
              </div>

              {/* Pulsing Central Blood Drop Wrapper */}
              <motion.div
                className="relative flex items-center justify-center z-10"
                animate={{
                  scale: [1, 1.03, 1],
                  y: [0, -3, 0]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut",
                }}
              >
                {/* Blood Drop SVG */}
                <svg
                  viewBox="0 0 200 240"
                  className="w-[180px] h-[216px] sm:w-[200px] sm:h-[240px] drop-shadow-[0_25px_40px_rgba(239,68,68,0.3)] relative z-10"
                >
                  <defs>
                    <linearGradient id="bloodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="60%" stopColor="#e11d48" />
                      <stop offset="100%" stopColor="#be123c" />
                    </linearGradient>
                  </defs>
                  
                  {/* Blood Drop Path */}
                  <path
                    d="M 100 20 C 100 20, 170 110, 170 170 A 70 70 0 1 1 30 170 C 30 110, 100 20, 100 20 Z"
                    fill="url(#bloodGrad)"
                  />

                  {/* White EKG Heartbeat Line overlay inside the blood drop */}
                  <motion.path
                    d="M 15 170 H 75 L 82 178 L 92 110 L 104 220 L 114 155 L 120 170 H 185"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    animate={{
                      opacity: [0.75, 1, 0.75],
                      strokeWidth: [3.5, 4.5, 3.5]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeInOut"
                    }}
                  />
                </svg>

                {/* White Heart inside the drop */}
                <motion.div
                  className="absolute top-[40%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-20 pointer-events-none"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                >
                  <Heart className="text-rose-50 fill-rose-50 w-11 h-11 sm:w-12 sm:h-12 drop-shadow-sm" />
                </motion.div>
              </motion.div>

              {/* FLOATING ACTION CARDS */}

              {/* 1. Blood Group Card (Top-Right) */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4.2,
                  ease: "easeInOut",
                }}
                whileHover={{ scale: 1.05, y: -12, transition: { duration: 0.2 } }}
                className="absolute top-2 right-[-10px] sm:right-[-25px] bg-white/95 backdrop-blur-xs border border-gray-100 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col gap-1 w-40 sm:w-44 z-30"
              >
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Blood Group
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="bg-red-500 text-white font-extrabold text-xs px-2.5 py-1.5 rounded-lg"
                  >
                    O+
                  </motion.div>
                  <span className="text-sm font-extrabold text-gray-800">
                    Available
                  </span>
                </div>
              </motion.div>

              {/* 2. Status Card (Bottom-Left) */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 3.8,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                whileHover={{ scale: 1.05, y: 12, transition: { duration: 0.2 } }}
                className="absolute bottom-6 left-[-15px] sm:left-[-35px] bg-white/95 backdrop-blur-xs border border-gray-100 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col gap-1 w-40 sm:w-44 z-30"
              >
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Status
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="bg-emerald-500 text-white rounded-lg p-1 flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={4} />
                  </div>
                  <span className="text-sm font-extrabold text-emerald-600">
                    Donor Matched
                  </span>
                </div>
              </motion.div>

              {/* 3. Emergency Card (Middle-Right / Bottom-Right) */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                  delay: 1.2,
                }}
                whileHover={{ scale: 1.05, y: -10, transition: { duration: 0.2 } }}
                className="absolute bottom-16 right-[-10px] sm:right-[-25px] bg-white/95 backdrop-blur-xs border border-gray-100 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col gap-1 w-40 sm:w-44 z-20"
              >
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Emergency
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <motion.span 
                    animate={{ rotate: [-8, 8, -8] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                    className="text-base leading-none select-none"
                  >
                    🚨
                  </motion.span>
                  <span className="text-sm font-extrabold text-rose-500">
                    Alert Sent
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section className="py-10 bg-white dark:bg-gray-900 border-t border-b border-gray-100 dark:border-gray-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4 sm:gap-8 text-center">
            <motion.div
              className="space-y-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="text-red-500" size={24} />
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                  <AnimatedCounter target={stats.registeredDonors} />
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Registered Donors
              </p>
            </motion.div>

            <motion.div
              className="space-y-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Heart
                  className="text-emerald-500 fill-emerald-100 dark:fill-emerald-900"
                  size={24}
                />
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                  <AnimatedCounter target={stats.livesSaved} />
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Lives Saved
              </p>
            </motion.div>

            <motion.div
              className="space-y-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Landmark className="text-blue-500" size={24} />
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                  <AnimatedCounter target={stats.partnerHospitals} />
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Partner Hospitals
              </p>
            </motion.div>

            <motion.div
              className="space-y-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Activity className="text-amber-500" size={24} />
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                  <AnimatedCounter target={stats.totalRequests} />
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Broadcasting Requests
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-20 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              How LifeDrop Works
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
              Saving lives requires no friction. We connect hearts in three
              simple steps.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-10 relative"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Step 1 */}
            <motion.div
              variants={fadeUpChild}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 space-y-4 shadow-xl shadow-gray-100/50 dark:shadow-black/20 hover:shadow-2xl transition duration-300 relative group"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-extrabold text-lg flex items-center justify-center">
                01
              </div>
              <h3 className="text-xl font-bold text-gray-950 dark:text-white">
                Register Profile
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Create your account as either an eligible blood donor or an
                accredited hospital. Add location, contact information, and
                blood groups.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              variants={fadeUpChild}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 space-y-4 shadow-xl shadow-gray-100/50 dark:shadow-black/20 hover:shadow-2xl transition duration-300 relative"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-extrabold text-lg flex items-center justify-center">
                02
              </div>
              <h3 className="text-xl font-bold text-gray-950 dark:text-white">
                Get Real-Time Match
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                When hospitals broadcast an urgent demand, our matching
                algorithm scans and alerts eligible healthy matching donors in
                the exact city instantly.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              variants={fadeUpChild}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8 space-y-4 shadow-xl shadow-gray-100/50 dark:shadow-black/20 hover:shadow-2xl transition duration-300 relative"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold text-lg flex items-center justify-center">
                03
              </div>
              <h3 className="text-xl font-bold text-gray-950 dark:text-white">Save Lives</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Donors accept the alert with one click. Hospital staff gets
                matching alerts, coordinate with the donor, fulfill the
                requirement, and issue dynamic certificates.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* BLOOD COMPATIBILITY MATRIX MAP */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <BloodCompatibility />
        </div>
      </section>

      {/* TESTIMONIAL SUCCESS STORIES SECTION */}
      <section className="py-20 bg-[#FAFAFA] dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SuccessStories />
        </div>
      </section>

      {/* UPCOMING CLINICAL CAMPS Drives */}
      <section className="py-20 bg-white dark:bg-gray-900 border-t border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DonationCamps
            camps={camps}
            onAddCamp={onAddCamp}
            isAuthenticated={isAuthenticated}
            userType={userType || ""}
          />
        </div>
      </section>

      {/* CALL TO ACTION SECTION */}
      <section className="mx-4 sm:mx-8 lg:mx-auto max-w-5xl mt-20">
        <div className="bg-slate-900 rounded-3xl p-10 md:p-14 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute w-72 h-72 rounded-full bg-red-600/20 blur-3xl -top-20 -left-20" />
          <div className="absolute w-72 h-72 rounded-full bg-red-400/10 blur-3xl -bottom-20 -right-20" />

          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Ready To Save Lives?
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Join the fastest real-time blood transfusion registry. Sign up
              today and play your part in secure, live clinical response during
              emergency medical procedures.
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
