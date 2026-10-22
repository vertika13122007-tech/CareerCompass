"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  Kanban,
  Wand2,
  Compass,
  Zap,
  Mic,
  Menu,
  X,
  BarChart3,
  Award
} from "lucide-react";
import { BorderTrail } from "@/components/core/border-trail";
import { TextShimmer } from "@/components/core/text-shimmer";
import { setAuthToken, setUserData } from "@/lib/auth";

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ats" | "kanban" | "kiki">("ats");

  const handleDirectDemoAccess = () => {
    setAuthToken("demo-access-token-careercompass");
    setUserData({
      id: 1,
      name: "Demo Candidate",
      email: "demo@careercompass.ai",
    });
    router.push("/dashboard");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2D3A2F] font-sans antialiased selection:bg-[#52795C]/25 selection:text-[#2D3A2F]">
      
      {/* ========================================================= */}
      {/* 1. TOP NAVBAR                                             */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#FAF9F6]/85 border-b border-[#EAF0EB] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#52795C] to-[#2D3A2F] text-white flex items-center justify-center shadow-md shadow-[#52795C]/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex items-center text-xl sm:text-2xl font-extrabold tracking-tight text-[#2D3A2F]">
              <span>Career</span>
              <span className="text-[#52795C] ml-0.5">Compass</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#5C665D]">
            <a href="#features" className="hover:text-[#52795C] transition-colors">
              Features
            </a>
            <a href="#preview" className="hover:text-[#52795C] transition-colors">
              Interactive Preview
            </a>
            <a href="#how-it-works" className="hover:text-[#52795C] transition-colors">
              How It Works
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-bold text-[#2D3A2F] hover:text-[#52795C] px-4 py-2.5 rounded-xl transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="bg-[#52795C] hover:bg-[#3b5943] text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-[#52795C]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#2D3A2F] hover:bg-[#EAF0EB] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-6 bg-[#FAF9F6] border-b border-[#EAF0EB] flex flex-col gap-4 animate-in fade-in">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-[#5C665D] hover:text-[#52795C] py-2"
            >
              Features
            </a>
            <a
              href="#preview"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-[#5C665D] hover:text-[#52795C] py-2"
            >
              Interactive Preview
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-[#5C665D] hover:text-[#52795C] py-2"
            >
              How It Works
            </a>
            <div className="pt-2 border-t border-[#EAF0EB] flex flex-col gap-2.5">
              <Link
                href="/login"
                className="w-full text-center text-sm font-bold text-[#2D3A2F] py-2.5 rounded-xl border border-[#EAF0EB] bg-white"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="w-full text-center text-sm font-bold text-white bg-[#52795C] py-2.5 rounded-xl shadow-md shadow-[#52795C]/20"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* 2. HERO SECTION WITH FRAMER-MOTION                        */}
      {/* ========================================================= */}
      <section className="relative pt-14 pb-20 sm:pt-24 sm:pb-32 overflow-hidden">
        {/* Soft Background Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] bg-gradient-to-tr from-[#52795C]/12 via-[#8FA89B]/10 to-[#FAF9F6] rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-[#EAF0EB] rounded-full blur-2xl pointer-events-none -z-10" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          {/* Top Pill / Shimmer Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF0EB] border border-[#52795C]/20 text-[#2D3A2F] text-xs font-semibold mb-8 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#52795C] animate-pulse" />
            <TextShimmer className="text-xs font-bold text-[#2D3A2F]">
              Next-Gen Career Intelligence Platform
            </TextShimmer>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#2D3A2F] leading-[1.12] max-w-4xl mx-auto mb-6"
          >
            Your AI-Powered Career <span className="text-[#52795C]">Command Center</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-[#5C665D] max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Optimize resumes for ATS, track job applications on a live Kanban pipeline, and practice interviews with Kiki.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-8"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#52795C] hover:bg-[#3b5943] text-white font-bold text-base shadow-lg shadow-[#52795C]/25 hover:shadow-xl hover:shadow-[#52795C]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              type="button"
              onClick={handleDirectDemoAccess}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-[#F5F3EC] text-[#2D3A2F] font-bold text-base border border-[#EAF0EB] shadow-xs hover:border-[#52795C]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-[#52795C] fill-[#52795C]/20" />
              <span>Explore Demo</span>
            </button>
          </motion.div>

          {/* Trust Checkmarks */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#5C665D] font-medium"
          >
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#52795C] stroke-[3]" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#52795C] stroke-[3]" /> Instant ATS score analysis
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#52795C] stroke-[3]" /> Free full guest demo access
            </span>
          </motion.div>

          {/* ========================================================= */}
          {/* INTERACTIVE PREVIEW CARD                                  */}
          {/* ========================================================= */}
          <motion.div
            id="preview"
            variants={itemVariants}
            className="mt-14 sm:mt-20 relative max-w-5xl mx-auto"
          >
            {/* Ambient Backlight Glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#52795C]/25 via-emerald-400/20 to-[#8FA89B]/25 rounded-3xl blur-xl opacity-80 -z-10" />

            {/* Clean Container Shell */}
            <div className="overflow-hidden bg-white border border-[#EAF0EB] shadow-2xl rounded-3xl">
              
              {/* Minimalist Top Control Bar */}
              <div className="bg-[#F9FAFB] border-b border-[#EAF0EB] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#52795C]/15 flex items-center justify-center text-[#52795C]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#2D3A2F]">
                    Live Platform Preview
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#166534] border border-[#DCFCE7] hidden sm:inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Interactive
                  </span>
                </div>

                {/* Switcher Tabs */}
                <div className="flex items-center bg-[#EAF0EB]/80 p-1 rounded-xl text-xs font-semibold text-[#5C665D]">
                  <button
                    type="button"
                    onClick={() => setActiveTab("ats")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeTab === "ats"
                        ? "bg-white text-[#2D3A2F] shadow-xs font-bold"
                        : "hover:text-[#2D3A2F]"
                    }`}
                  >
                    ATS Scoreboard
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("kanban")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeTab === "kanban"
                        ? "bg-white text-[#2D3A2F] shadow-xs font-bold"
                        : "hover:text-[#2D3A2F]"
                    }`}
                  >
                    Kanban Pipeline
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("kiki")}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeTab === "kiki"
                        ? "bg-white text-[#2D3A2F] shadow-xs font-bold"
                        : "hover:text-[#2D3A2F]"
                    }`}
                  >
                    Kiki Voice AI
                  </button>
                </div>
              </div>

              {/* Viewport Content */}
              <div className="p-5 sm:p-8 bg-[#FAF9F6] text-left">
                <AnimatePresence mode="wait">
                  {/* TAB 1: ATS SCOREBOARD */}
                  {activeTab === "ats" && (
                    <motion.div
                      key="ats"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-white border border-[#EAF0EB] shadow-xs">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#5C665D]">
                              ATS Score
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#166534]">
                              Ready to Apply
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-[#2D3A2F]">94</span>
                            <span className="text-sm text-[#5C665D]">/ 100</span>
                          </div>
                          <div className="w-full bg-[#EAF0EB] h-2 rounded-full mt-3 overflow-hidden">
                            <div className="bg-[#52795C] h-full rounded-full w-[94%]" />
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white border border-[#EAF0EB] shadow-xs">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#5C665D]">
                              Keywords Matched
                            </span>
                            <span className="text-xs text-[#52795C] font-bold">91% Match</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold text-[#2D3A2F]">21</span>
                            <span className="text-sm text-[#5C665D]">/ 23 extracted</span>
                          </div>
                          <div className="w-full bg-[#EAF0EB] h-2 rounded-full mt-3 overflow-hidden">
                            <div className="bg-[#52795C] h-full rounded-full w-[91%]" />
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white border border-[#EAF0EB] shadow-xs">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#5C665D]">
                              Target Role
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#92400E]">
                              High Fit
                            </span>
                          </div>
                          <p className="text-base font-bold text-[#2D3A2F] truncate">
                            Staff Software Engineer
                          </p>
                          <p className="text-xs text-[#5C665D] mt-1">Stripe • Remote • Full-Time</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-white border border-[#EAF0EB]">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C665D] mb-3">
                            Verified Skills in Resume
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {[
                              "FastAPI",
                              "React 19",
                              "Next.js App Router",
                              "PostgreSQL",
                              "System Architecture",
                              "Docker & Kubernetes",
                              "CI/CD Automation",
                            ].map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F0FDF4] text-[#166534] border border-[#DCFCE7]"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#52795C]" />
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-white border border-[#EAF0EB]">
                          <div className="flex items-center gap-2 mb-2 text-[#52795C] text-xs font-bold uppercase tracking-wider">
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>AI Quantified Bullet Rewriter</span>
                          </div>
                          <div className="p-3 rounded-xl bg-[#F5F3EC] border border-[#EAE6DB] text-xs text-[#2D3A2F] leading-relaxed">
                            <p className="line-through text-gray-400 mb-1">
                              &quot;Responsible for backend API performance and queries.&quot;
                            </p>
                            <p className="font-semibold text-[#2D3A2F]">
                              &quot;Architected asynchronous FastAPI endpoints &amp; optimized indexing, reducing p99 query latency by 42%.&quot;
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: KANBAN PIPELINE */}
                  {activeTab === "kanban" && (
                    <motion.div
                      key="kanban"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-[#2D3A2F]">
                          Live Application Tracker Pipeline
                        </h4>
                        <span className="text-xs text-[#5C665D]">18 Active Opportunities</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-2xl bg-white border border-[#EAF0EB] shadow-xs">
                          <div className="flex items-center justify-between text-xs font-bold text-[#334155] mb-2.5">
                            <span>Wishlist</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-[#F1F5F9] text-[10px]">4</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] mb-2">
                            <p className="text-xs font-bold text-[#2D3A2F]">OpenAI</p>
                            <p className="text-[11px] text-[#5C665D]">AI Application Engineer</p>
                            <span className="inline-block mt-2 text-[10px] font-semibold text-[#52795C] bg-[#EAF0EB] px-2 py-0.5 rounded-md">
                              $210k - $240k
                            </span>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-white border border-[#EAF0EB] shadow-xs">
                          <div className="flex items-center justify-between text-xs font-bold text-[#713F12] mb-2.5">
                            <span>Applied</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-[#FEF3C7] text-[10px]">8</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] mb-2">
                            <p className="text-xs font-bold text-[#2D3A2F]">Vercel</p>
                            <p className="text-[11px] text-[#5C665D]">Frontend Platform</p>
                            <span className="inline-block mt-2 text-[10px] font-semibold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md">
                              Submitted 2d ago
                            </span>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-white border border-[#EAF0EB] shadow-xs">
                          <div className="flex items-center justify-between text-xs font-bold text-[#6B21A8] mb-2.5">
                            <span>Interviewing</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-[#F3E8FF] text-[10px]">3</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] mb-2">
                            <p className="text-xs font-bold text-[#2D3A2F]">Stripe</p>
                            <p className="text-[11px] text-[#5C665D]">System Design Round</p>
                            <span className="inline-block mt-2 text-[10px] font-semibold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-md">
                              Tomorrow @ 2:00 PM
                            </span>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-white border-2 border-[#52795C] shadow-xs">
                          <div className="flex items-center justify-between text-xs font-bold text-[#166534] mb-2.5">
                            <span>Offers</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-[#52795C] text-white text-[10px]">1</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] mb-2">
                            <p className="text-xs font-bold text-[#166534]">Linear</p>
                            <p className="text-[11px] text-[#2D3A2F]">Senior Full-Stack</p>
                            <span className="inline-block mt-2 text-[10px] font-bold text-white bg-[#52795C] px-2 py-0.5 rounded-md">
                              $195,000 + Equity
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: KIKI AI INTERVIEW PREP */}
                  {activeTab === "kiki" && (
                    <motion.div
                      key="kiki"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <div className="p-5 rounded-2xl bg-[#1E2B22] text-white border border-[#52795C]/30">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#52795C] text-white flex items-center justify-center">
                              <Mic className="w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold">Kiki AI Voice Coach</h4>
                              <p className="text-xs text-[#8FA89B]">Session: Stripe Behavioral &amp; STAR Alignment</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live Audio
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="p-3.5 rounded-xl bg-white/10 text-xs leading-relaxed border border-white/10 text-white/90">
                            <span className="font-bold text-emerald-300">Kiki: </span>
                            &quot;Tell me about a time you had to resolve a high-severity production latency spike with ambiguous root causes. How did you diagnose it?&quot;
                          </div>
                          <div className="p-3.5 rounded-xl bg-[#52795C]/30 text-xs leading-relaxed border border-[#52795C]/40 text-emerald-100">
                            <span className="font-bold text-white">Instant Feedback: </span>
                            &quot;Excellent STAR framework usage. Quantify your team impact by mentioning how many downstream microservices benefited from your database index tuning.&quot;
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* ========================================================= */}
      {/* 3. METRICS / PROOF STRIP                                  */}
      {/* ========================================================= */}
      <section className="py-12 border-y border-[#EAF0EB] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#2D3A2F]">14,500+</p>
              <p className="text-xs sm:text-sm text-[#5C665D] mt-1 font-medium">Resumes Scanned</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#52795C]">3.2x</p>
              <p className="text-xs sm:text-sm text-[#5C665D] mt-1 font-medium">Interview Callback Rate</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#2D3A2F]">94%</p>
              <p className="text-xs sm:text-sm text-[#5C665D] mt-1 font-medium">Average ATS Match Score</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#52795C]">4.9 / 5</p>
              <p className="text-xs sm:text-sm text-[#5C665D] mt-1 font-medium">Candidate Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. FEATURES BENTO GRID / CARDS                            */}
      {/* ========================================================= */}
      <section id="features" className="py-20 sm:py-28 bg-[#FAF9F6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#52795C] bg-[#EAF0EB] border border-[#52795C]/20 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Modern Career Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D3A2F] tracking-tight">
              Engineered for Ambitious Job Seekers
            </h2>
            <p className="text-[#5C665D] mt-3 text-base">
              Outsmart modern Applicant Tracking Systems and manage your entire application pipeline.
            </p>
          </div>

          {/* 4 Clean Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Card 1 */}
            <div className="p-8 rounded-3xl bg-[#F0FDF4] border border-[#DCFCE7] hover:border-[#52795C]/40 transition-all hover:-translate-y-1 shadow-xs hover:shadow-md group">
              <div className="w-12 h-12 rounded-2xl bg-[#52795C] text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xs">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#2D3A2F] mb-3">
                Real-Time ATS Scoreboard
              </h3>
              <p className="text-[#5C665D] text-sm leading-relaxed mb-6">
                Uncover the exact parsing algorithms Fortune 500 ATS systems use. Detect missing keywords, formatting errors, and section gaps before sending your application.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-[#DCFCE7] text-xs font-semibold text-[#166534]">
                  Keyword Gap Analysis
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-[#DCFCE7] text-xs font-semibold text-[#166534]">
                  Formatting Verification
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-[#DCFCE7] text-xs font-semibold text-[#166534]">
                  Hard Skills Matrix
                </span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-3xl bg-[#F5F3EC] border border-[#EAE6DB] hover:border-[#52795C]/40 transition-all hover:-translate-y-1 shadow-xs hover:shadow-md group">
              <div className="w-12 h-12 rounded-2xl bg-[#3b5943] text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xs">
                <Kanban className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#2D3A2F] mb-3">
                Interactive Kanban Pipeline
              </h3>
              <p className="text-[#5C665D] text-sm leading-relaxed mb-6">
                Replace fragmented spreadsheets with an intuitive, drag-and-drop tracker. Organize applications across Wishlist, Applied, Interview, and Offer stages.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-[#EAE6DB] text-xs font-semibold text-[#713F12]">
                  Drag &amp; Drop Columns
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-[#EAE6DB] text-xs font-semibold text-[#713F12]">
                  Offer Comparison
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-[#EAE6DB] text-xs font-semibold text-[#713F12]">
                  Deadline Alerts
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-3xl bg-[#F0F4F8] border border-[#DCE4EC] hover:border-[#52795C]/40 transition-all hover:-translate-y-1 shadow-xs hover:shadow-md group">
              <div className="w-12 h-12 rounded-2xl bg-[#2D3A2F] text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xs">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#2D3A2F] mb-3">
                AI Resume Tailoring Engine
              </h3>
              <p className="text-[#5C665D] text-sm leading-relaxed mb-6">
                Powered by Google Gemini AI, transform passive descriptions into quantified, high-impact accomplishment statements tailored specifically to the target job description.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-[#DCE4EC] text-xs font-semibold text-[#334155]">
                  Quantified Impact Verbs
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-[#DCE4EC] text-xs font-semibold text-[#334155]">
                  Role-Specific Rewriting
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-[#DCE4EC] text-xs font-semibold text-[#334155]">
                  Multi-Resume Storage
                </span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-8 rounded-3xl bg-[#F7F3FB] border border-[#ECE4F5] hover:border-[#52795C]/40 transition-all hover:-translate-y-1 shadow-xs hover:shadow-md group">
              <div className="w-12 h-12 rounded-2xl bg-[#52795C] text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xs">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#2D3A2F] mb-3">
                Interactive Career Roadmaps
              </h3>
              <p className="text-[#5C665D] text-sm leading-relaxed mb-6">
                Discover exact skill requirements for your dream senior or staff role. Get customized week-by-week learning roadmaps to bridge knowledge gaps effectively.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-[#ECE4F5] text-xs font-semibold text-[#6B21A8]">
                  Skill Trees
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-[#ECE4F5] text-xs font-semibold text-[#6B21A8]">
                  Curated Milestones
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/80 border border-[#ECE4F5] text-xs font-semibold text-[#6B21A8]">
                  Promotion Tracking
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. HOW IT WORKS                                           */}
      {/* ========================================================= */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-white border-t border-[#EAF0EB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#52795C] bg-[#EAF0EB] px-3.5 py-1.5 rounded-full inline-block mb-3">
              Simple 3-Step Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D3A2F] tracking-tight">
              From Resume Upload to Signed Offer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-[#FAF9F6] border border-[#EAF0EB] relative">
              <span className="text-5xl font-black text-[#52795C]/20 absolute top-6 right-6">
                01
              </span>
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#EAF0EB] flex items-center justify-center text-[#52795C] font-bold text-lg mb-6 shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2D3A2F] mb-2">
                Upload &amp; Target
              </h3>
              <p className="text-sm text-[#5C665D] leading-relaxed">
                Upload your resume and paste the target job description to establish an instant ATS baseline match score.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-[#FAF9F6] border border-[#EAF0EB] relative">
              <span className="text-5xl font-black text-[#52795C]/20 absolute top-6 right-6">
                02
              </span>
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#EAF0EB] flex items-center justify-center text-[#52795C] font-bold text-lg mb-6 shadow-xs">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2D3A2F] mb-2">
                Optimize &amp; Practice
              </h3>
              <p className="text-sm text-[#5C665D] leading-relaxed">
                Apply one-click AI bullet suggestions to quantify accomplishments and practice behavioral questions with Kiki.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-[#FAF9F6] border border-[#EAF0EB] relative">
              <span className="text-5xl font-black text-[#52795C]/20 absolute top-6 right-6">
                03
              </span>
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#EAF0EB] flex items-center justify-center text-[#52795C] font-bold text-lg mb-6 shadow-xs">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2D3A2F] mb-2">
                Track to Offer
              </h3>
              <p className="text-sm text-[#5C665D] leading-relaxed">
                Manage all applications on your visual Kanban board, track interview rounds, and compare compensation packages.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. BOTTOM CTA BANNER                                      */}
      {/* ========================================================= */}
      <section className="py-20 sm:py-28 bg-[#FAF9F6]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="relative overflow-hidden rounded-3xl bg-[#1E2B22] p-8 sm:p-14 text-white shadow-2xl border border-[#52795C]/30 text-center">
            
            {/* Animated Motion Primitive BorderTrail */}
            <BorderTrail
              size={90}
              className="bg-gradient-to-r from-[#52795C] via-emerald-400 to-[#8FA89B]"
            />

            <div className="max-w-2xl mx-auto relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold mb-6 border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Take Control of Your Career Path</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                Ready to land your dream role with confidence?
              </h2>

              <p className="text-[#8FA89B] text-base sm:text-lg mb-8 leading-relaxed">
                Join thousands of software engineers and professionals who accelerated their job search with CareerCompass.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#52795C] hover:bg-[#3b5943] text-white font-bold text-base shadow-lg shadow-[#52795C]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  type="button"
                  onClick={handleDirectDemoAccess}
                  className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4 text-emerald-300 fill-emerald-300/20" />
                  <span>Launch Demo Mode</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. FOOTER                                                 */}
      {/* ========================================================= */}
      <footer className="bg-white border-t border-[#EAF0EB] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#5C665D]">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#52795C] text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-[#2D3A2F]">CareerCompass AI</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#features" className="hover:text-[#52795C] transition-colors">Features</a>
            <a href="#preview" className="hover:text-[#52795C] transition-colors">Interactive Preview</a>
            <a href="#how-it-works" className="hover:text-[#52795C] transition-colors">How It Works</a>
            <Link href="/login" className="hover:text-[#52795C] transition-colors">Log In</Link>
            <Link href="/register" className="hover:text-[#52795C] transition-colors">Register</Link>
          </div>

          <div>
            © {new Date().getFullYear()} CareerCompass AI. All rights reserved.
          </div>

        </div>
      </footer>

    </div>
  );
}
