"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollProgress } from "@/components/core/scroll-progress";
import { InView } from "@/components/core/in-view";
import { setAuthToken, setUserData } from "@/lib/auth";

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePeekTab, setActivePeekTab] = useState<"tab-resume" | "tab-coach" | "tab-offers">("tab-resume");

  const handleDirectDemoAccess = () => {
    setAuthToken("demo-access-token-careercompass");
    setUserData({
      id: 1,
      name: "Demo Candidate",
      email: "demo@careercompass.ai",
    });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen w-full bg-[#123124] text-white font-sans antialiased selection:bg-[#62fead]/30 selection:text-white overflow-x-clip">
      
      {/* 0. Top Scroll Progress Tracker */}
      <ScrollProgress className="fixed top-0 inset-x-0 h-1 bg-gradient-to-r from-[#3ee093] via-[#62fead] to-[#388452] z-[100]" />

      {/* 1. TOP NAVBAR */}
      <header className="fixed top-0 w-full z-50 bg-[#143527]/95 backdrop-blur-md border-b border-emerald-500/20 shadow-[0_8px_25px_rgba(0,0,0,0.25)]">
        <div className="h-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-1.5 rounded-2xl bg-[#1e4e3b] shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.25),inset_-1.5px_1.5px_3px_rgba(0,0,0,0.4)] flex items-center justify-center group-hover:scale-105 transition-transform">
              <img
                alt="CareerCompass Logo"
                className="h-7 w-auto object-contain brightness-0 invert"
                src="/landing_page/images/logo.png"
              />
            </div>
            <span className="font-sans-ui font-bold text-xl text-white tracking-tight">
              CareerCompass
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 font-sans-ui">
            <a
              href="#features"
              className="text-sm font-semibold text-[#62fead] hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#preview"
              className="text-sm font-medium text-emerald-100/80 hover:text-white transition-colors"
            >
              Interactive Preview
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-emerald-100/80 hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a
              href="#live-command-center"
              className="text-sm font-medium text-emerald-100/80 hover:text-white transition-colors"
            >
              Outcomes
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 font-sans-ui">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center text-xs font-bold px-5 py-2.5 rounded-full clay-btn-secondary transition-all cursor-pointer"
            >
              Log In
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold px-6 py-2.5 rounded-full clay-btn-primary transition-all font-sans-ui cursor-pointer shadow-md"
            >
              <span>Get Started Free</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>

            {/* Quick Demo Access Avatar */}
            <button
              type="button"
              onClick={handleDirectDemoAccess}
              title="Launch Instant Demo Mode"
              className="w-9 h-9 rounded-full bg-[#1e4634] clay-pill-badge-dark flex items-center justify-center text-[#62fead] hover:scale-105 transition-transform cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-6 pt-3 pb-6 bg-[#143527] border-b border-emerald-500/30 flex flex-col gap-3 font-sans-ui animate-in fade-in duration-200">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-[#62fead] py-2"
            >
              Features
            </a>
            <a
              href="#preview"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-emerald-100/90 py-2"
            >
              Interactive Preview
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-emerald-100/90 py-2"
            >
              How It Works
            </a>
            <a
              href="#live-command-center"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-emerald-100/90 py-2"
            >
              Outcomes &amp; Metrics
            </a>
            <div className="pt-3 border-t border-emerald-500/20 flex flex-col gap-2.5">
              <Link
                href="/login"
                className="w-full text-center text-xs font-bold py-3 rounded-full clay-btn-secondary"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="w-full text-center text-xs font-bold py-3 rounded-full clay-btn-primary"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* MAIN DOCUMENT FLOW */}
      <main className="w-full pt-20">
        <div className="flex flex-col w-full">

          {/* ========================================================= */}
          {/* 2. HERO SECTION                                           */}
          {/* ========================================================= */}
          <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#0b281d] via-[#123a2b] to-[#174634] text-white px-4 sm:px-6 lg:px-8 pt-14 pb-24 lg:pt-20 lg:pb-32">
            
            {/* Ambient Background Workspace Image */}
            <div className="pointer-events-none absolute inset-0 opacity-15 mix-blend-luminosity overflow-hidden">
              <img
                alt="Career workspace ambient backdrop"
                className="w-full h-full object-cover blur-md scale-110"
                src="/landing_page/images/image_1.png"
              />
            </div>

            {/* Ambient Emerald Radial Glows */}
            <div className="pointer-events-none absolute -top-36 -left-36 h-[580px] w-[580px] rounded-full bg-[#1e6f4a]/30 blur-[120px]" />
            <div className="pointer-events-none absolute top-1/3 right-0 h-[520px] w-[520px] rounded-full bg-[#3ee093]/20 blur-[130px]" />
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-[420px] w-[420px] rounded-full bg-[#0d593d]/35 blur-[110px]" />

            <div className="relative mx-auto max-w-7xl z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                
                {/* Left Column: Hero Copy */}
                <InView
                  viewOptions={{ margin: "0px 0px -60px 0px" }}
                  variants={{
                    hidden: { opacity: 0, y: 25 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="lg:col-span-6 flex flex-col items-start text-left"
                >
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#1b4835] clay-pill-badge-dark px-5 py-2 border border-emerald-400/20">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#3ee093] shadow-[0_0_8px_#3ee093]" />
                      <span className="font-sans-ui text-xs font-bold uppercase tracking-wider text-emerald-200">
                        AI-POWERED CAREER COMMAND CENTER FOR STUDENTS
                      </span>
                    </div>
                  </div>

                  <h1 className="font-serif-heading text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.14] tracking-tight mb-6">
                    Land Your Dream Job{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#62fead] via-[#a6d1af] to-[#c2edca] italic font-normal">
                      10x Faster
                    </span>{" "}
                    with Intelligent AI
                  </h1>

                  <p className="text-base sm:text-lg text-emerald-100/90 max-w-xl leading-relaxed font-normal mb-8">
                    CareerCompass turns chaotic campus job hunting into a strategic, automated system. Tailor your resume in seconds, practice with personalized AI coaching, and track every application in one high-performance command center.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full sm:w-auto font-sans-ui">
                    <Link
                      href="/register"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-bold px-8 py-4 rounded-full clay-btn-primary transition-all cursor-pointer"
                    >
                      <span>Get Started Free</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleDirectDemoAccess}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-bold px-8 py-4 rounded-full clay-btn-secondary transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px] text-[#24412d]">play_circle</span>
                      <span>Explore Interactive Demo</span>
                    </button>
                  </div>

                  {/* Social Proof Strip */}
                  <div className="flex flex-wrap items-center gap-3 text-emerald-200/90 font-sans-ui text-xs">
                    <div className="flex -space-x-2 overflow-hidden">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1b5e3f] text-[10px] font-bold text-white shadow-md border border-white/20">ST</div>
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#24412d] text-[10px] font-bold text-emerald-200 shadow-md border border-white/20">UM</div>
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#356143] text-[10px] font-bold text-white shadow-md border border-white/20">UC</div>
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0a2318] text-[10px] font-bold text-emerald-300 shadow-md border border-white/20">GT</div>
                    </div>

                    <div className="flex items-center gap-1 text-[#62fead]">
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-bold text-white ml-1 text-xs">4.9/5</span>
                    </div>

                    <span className="hidden sm:inline text-emerald-400/50">•</span>
                    <span className="text-emerald-100/90">
                      Loved by 45,000+ students from Stanford, Michigan, Berkeley &amp; Georgia Tech
                    </span>
                  </div>
                </InView>

                {/* Right Column: 3D Command Center Workspace Visual */}
                <InView
                  viewOptions={{ margin: "0px 0px -60px 0px" }}
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="lg:col-span-6 w-full"
                >
                  <div className="relative w-full max-w-xl mx-auto lg:max-w-none" id="preview">
                    <div className="relative rounded-3xl p-3 sm:p-5 clay-card-forest border border-emerald-400/30 shadow-2xl">
                      
                      {/* Floating Badges */}
                      <div className="hidden sm:flex absolute -top-4 -left-3 z-20 items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#3ee093] text-[#00381e] font-sans-ui text-xs font-bold clay-pill-badge">
                        <span className="material-symbols-outlined text-[15px]">verified</span>
                        <span>+98% Profile Match</span>
                      </div>
                      <div className="hidden sm:flex absolute -top-4 -right-3 z-20 items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF7F2] text-[#1a3824] font-sans-ui text-xs font-bold clay-pill-badge">
                        <span className="material-symbols-outlined text-[15px] text-[#24412d]">tune</span>
                        <span>Fall 2025 Cycle</span>
                      </div>

                      {/* Header bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 mb-2 border-b border-emerald-500/20">
                        <div className="flex items-center gap-2.5">
                          <span className="h-3 w-3 rounded-full bg-[#3ee093] shadow-[0_0_8px_#3ee093]" />
                          <div>
                            <h3 className="font-sans-ui font-bold text-base sm:text-lg text-white">
                              Student Career Command Center
                            </h3>
                            <p className="text-[11px] text-emerald-200/80">
                              Real-time candidate pipeline, ATS scorecards &amp; offer tracker
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1a3d2c] clay-pill-badge-dark text-[#62fead] font-sans-ui flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">bolt</span> Active Offer Queue
                          </span>
                        </div>
                      </div>

                      {/* 3D Illustration Frame */}
                      <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-emerald-300/20 bg-[#FAF7F2]">
                        <img
                          alt="3D claymorphism illustration of an ambitious young college student's high-tech career command center workspace"
                          className="w-full h-auto object-cover object-center max-h-[520px] transition-transform duration-500 hover:scale-[1.01]"
                          src="/landing_page/images/image_2.png"
                        />
                        <div className="absolute bottom-3 left-3 right-3 hidden md:flex items-center justify-between p-3.5 rounded-xl bg-[#1b3b2b]/90 backdrop-blur-md border border-emerald-400/25 text-white shadow-lg">
                          <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-[#3ee093] text-[20px]">psychology</span>
                            <span className="text-xs font-semibold font-sans-ui">
                              Tactile 3D Career Command Center — AI Sprints &amp; Live Tracking
                            </span>
                          </div>
                          <span className="text-xs font-bold text-[#62fead] bg-[#0c261b] px-3 py-1 rounded-full border border-emerald-500/30 font-sans-ui flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span> Verified AI System
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                </InView>

              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 3. TRUSTED BY / SOCIAL PROOF STRIP                         */}
          {/* ========================================================= */}
          <section className="w-full bg-[#EAF0EB] border-y border-[#d2e2d5] py-10 px-4 sm:px-6 lg:px-8 shadow-inner">
            <div className="mx-auto max-w-7xl text-center">
              <p className="font-sans-ui text-xs uppercase tracking-widest text-[#3d5e46] font-bold mb-6">
                TRUSTED BY AMBITIOUS STUDENTS JOINING TOP TEAMS WORLDWIDE
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                <div className="px-5 py-2.5 rounded-full bg-[#FAF7F2] clay-pill-badge text-[#24412d] font-serif-heading text-lg font-bold">Google</div>
                <div className="px-5 py-2.5 rounded-full bg-[#FAF7F2] clay-pill-badge text-[#24412d] font-sans-ui text-base font-bold">Microsoft</div>
                <div className="px-5 py-2.5 rounded-full bg-[#FAF7F2] clay-pill-badge text-[#24412d] font-sans-ui text-base font-bold">Figma</div>
                <div className="px-5 py-2.5 rounded-full bg-[#FAF7F2] clay-pill-badge text-[#24412d] font-serif-heading text-lg font-bold">Stripe</div>
                <div className="px-5 py-2.5 rounded-full bg-[#FAF7F2] clay-pill-badge text-[#24412d] font-sans-ui text-base font-bold">Spotify</div>
                <div className="px-5 py-2.5 rounded-full bg-[#FAF7F2] clay-pill-badge text-[#24412d] font-serif-heading text-lg font-bold">McKinsey</div>
                <div className="px-5 py-2.5 rounded-full bg-[#FAF7F2] clay-pill-badge text-[#24412d] font-sans-ui text-base font-bold">Airbnb</div>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 4. FEATURES BENTO GRID SECTION                            */}
          {/* ========================================================= */}
          <section className="w-full bg-[#dbe8dc] py-20 lg:py-28 px-4 sm:px-6 lg:px-8" id="features">
            <div className="mx-auto max-w-7xl">
              
              {/* Section Header */}
              <InView
                viewOptions={{ margin: "0px 0px -100px 0px" }}
                variants={{
                  hidden: { opacity: 0, y: 30, scale: 0.95, filter: "blur(4px)" },
                  visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-center max-w-3xl mx-auto mb-16"
              >
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF7F2] clay-pill-badge px-4 py-1.5 mb-4">
                  <span className="font-sans-ui text-xs font-bold uppercase tracking-wider text-[#123e25]">
                    ALL-IN-ONE CAREER COMMAND SUITE
                  </span>
                </div>
                <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl text-[#122e1e] tracking-tight">
                  Everything You Need to Go from Applicant to Offer
                </h2>
                <p className="mt-4 text-base sm:text-lg text-[#2f4f3a] font-normal leading-relaxed">
                  Inspired by top performance platforms, purpose-built for college students and graduates navigating hyper-competitive tech, finance, and design hiring cycles.
                </p>
              </InView>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-7">
                
                {/* Bento Card 1: ATS Optimization (col-span-7) */}
                <InView
                  viewOptions={{ margin: "0px 0px -100px 0px" }}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95, filter: "blur(4px)" },
                    visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
                  }}
                  transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="md:col-span-7 rounded-3xl clay-card-light p-6 sm:p-8 flex flex-col justify-between border border-[#e8dfd3]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-sans-ui text-xs font-bold uppercase tracking-wider text-emerald-900 bg-[#dbeef0]/60 clay-pill-badge px-3.5 py-1.5 rounded-full">
                        INSTANT RESUME TAILORING
                      </span>
                      <div className="w-9 h-9 rounded-2xl bg-[#EAF0EB] clay-pill-badge flex items-center justify-center text-[#1b5e3f]">
                        <span className="material-symbols-outlined text-[20px]">tune</span>
                      </div>
                    </div>
                    <h3 className="font-sans-ui font-bold text-2xl text-[#102a1b] tracking-tight mb-2">
                      ATS Optimization &amp; Goal Benchmarking
                    </h3>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                      Scan job descriptions, analyze keyword gaps against successful alumni hires, and tailor bullet points that pass automated ATS filters with a verified 94%+ rate.
                    </p>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-[#d8e6da] shadow-md bg-[#eef6f0] p-3">
                    <div className="flex items-center justify-between mb-2.5 px-1">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-800 text-[18px]">checklist</span>
                        <span className="font-sans-ui text-xs font-bold text-gray-800">Target Match &amp; Role Milestones</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-900 bg-[#c6e9cf] clay-pill-badge px-3 py-0.5 rounded-full font-sans-ui">
                        96% Accuracy
                      </span>
                    </div>

                    <div className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden shadow-inner bg-white">
                      <img
                        alt="OKR and Target Match Goals visual preview"
                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                        src="/landing_page/images/image_3.png"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent flex items-end p-3">
                        <span className="text-xs font-medium text-white drop-shadow font-sans-ui flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-[#62fead]">verified</span>
                          Real-time keyword calibration against verified campus hires
                        </span>
                      </div>
                    </div>
                  </div>
                </InView>

                {/* Bento Card 2: Kanban Matrix (col-span-5) */}
                <InView
                  viewOptions={{ margin: "0px 0px -100px 0px" }}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95, filter: "blur(4px)" },
                    visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
                  }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="md:col-span-5 rounded-3xl clay-card-sage p-6 sm:p-8 flex flex-col justify-between border border-[#cbe0cf]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-sans-ui text-xs font-bold uppercase tracking-wider text-[#1a4a2b] bg-[#FAF7F2] clay-pill-badge px-3.5 py-1.5 rounded-full">
                        NEVER MISS A DEADLINE
                      </span>
                      <div className="w-9 h-9 rounded-2xl bg-[#FAF7F2] clay-pill-badge flex items-center justify-center text-[#24412d]">
                        <span className="material-symbols-outlined text-[20px]">view_kanban</span>
                      </div>
                    </div>
                    <h3 className="font-sans-ui font-bold text-2xl text-[#1a2e21] tracking-tight mb-2">
                      Automated Application Matrix
                    </h3>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                      Visual kanban tracker that automatically logs interview cycles, status updates, and actionable follow-ups across your entire search.
                    </p>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-[#c8decb] shadow-md bg-[#FAF7F2] p-3">
                    <div className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden bg-white">
                      <img
                        alt="Strategic Tracking Matrix and review panels"
                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                        src="/landing_page/images/image_4.png"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0e2115]/75 via-transparent to-transparent flex items-end p-3">
                        <div className="text-white text-xs font-sans-ui font-medium flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-[#3ee093]">bolt</span>
                          <span>Auto-syncs application status across 25+ job boards</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </InView>

                {/* Bento Card 3: AI Career Coach Kiki (col-span-5) */}
                <InView
                  viewOptions={{ margin: "0px 0px -100px 0px" }}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95, filter: "blur(4px)" },
                    visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
                  }}
                  transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="md:col-span-5 rounded-3xl clay-card-light p-6 sm:p-8 flex flex-col justify-between border border-[#e8dfd3]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-sans-ui text-xs font-bold uppercase tracking-wider text-[#0e3b20] bg-[#daf0e0] clay-pill-badge px-3.5 py-1.5 rounded-full">
                        24/7 PERSONALIZED MENTORSHIP
                      </span>
                      <div className="w-9 h-9 rounded-2xl bg-[#EAF0EB] clay-pill-badge flex items-center justify-center text-[#18532f]">
                        <span className="material-symbols-outlined text-[20px]">psychology</span>
                      </div>
                    </div>
                    <h3 className="font-sans-ui font-bold text-2xl text-[#0b331b] tracking-tight mb-2">
                      AI Career Coach (Kiki)
                    </h3>
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                      On-demand behavioral mock interviews, salary negotiation scripts, and custom portfolio feedback tailored specifically to your degree and target dream roles.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#EAF0EB] p-4.5 shadow-inner border border-[#d2e4d5] flex flex-col gap-3.5">
                    <div className="flex items-center gap-3.5 w-full">
                      <img
                        alt="Kiki AI Career Coach"
                        className="w-14 h-14 rounded-full object-cover shadow-md ring-3 ring-[#3ee093] shrink-0"
                        src="/landing_page/images/image_5.png"
                      />
                      <div>
                        <h4 className="font-sans-ui font-bold text-base text-gray-900">
                          Kiki • Senior AI Mentor
                        </h4>
                        <p className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5 font-sans-ui">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#1e7e4e] animate-pulse" />
                          Ready for mock review
                        </p>
                      </div>
                    </div>

                    <div className="w-full rounded-2xl bg-[#FAF7F2] p-3.5 text-xs text-gray-800 leading-relaxed clay-pill-badge border border-white">
                      “Your answer for the cross-functional conflict question was solid! Let’s sharpen the measurable impact in the final STAR sentence.”
                    </div>
                  </div>
                </InView>

                {/* Bento Card 4: Strategic Roadmaps (col-span-7) */}
                <InView
                  viewOptions={{ margin: "0px 0px -100px 0px" }}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95, filter: "blur(4px)" },
                    visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
                  }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="md:col-span-7 rounded-3xl clay-card-charcoal text-white p-6 sm:p-8 flex flex-col justify-between border border-[#485d4d]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-sans-ui text-xs font-bold uppercase tracking-wider text-[#62fead] bg-[#1a281d] clay-pill-badge-dark px-3.5 py-1.5 rounded-full">
                        BRIDGE YOUR SKILL GAPS
                      </span>
                      <div className="w-9 h-9 rounded-2xl bg-[#1d2d22] clay-pill-badge-dark flex items-center justify-center text-[#62fead]">
                        <span className="material-symbols-outlined text-[20px]">alt_route</span>
                      </div>
                    </div>
                    <h3 className="font-sans-ui font-bold text-2xl text-white tracking-tight mb-2">
                      Strategic Learning Roadmaps &amp; Performance
                    </h3>
                    <p className="text-sm text-emerald-200/80 mb-6 leading-relaxed">
                      AI generates adaptive weekly skill sprints tailored to the exact requirements of your target companies, turning resume red flags into verified portfolio strengths.
                    </p>
                  </div>

                  <div className="rounded-2xl overflow-hidden border border-[#3e5643] bg-[#1a281e] p-3 shadow-inner">
                    <div className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden bg-[#101b13]">
                      <img
                        alt="Strategic learning and performance dashboard visual"
                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                        src="/landing_page/images/image_6.png"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0e1a12] via-transparent to-transparent flex items-end justify-between p-4">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#62fead] shadow-[0_0_8px_#62fead]" />
                          <span className="text-xs font-semibold text-white font-sans-ui">
                            Strategic Talent Performance &amp; Reviews
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#62fead] bg-[#0c1e13] px-3 py-1 rounded-full clay-pill-badge-dark font-sans-ui">
                          Active Sprints
                        </span>
                      </div>
                    </div>
                  </div>
                </InView>

              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 5. HOW IT WORKS SECTION                                   */}
          {/* ========================================================= */}
          <section className="w-full bg-[#FAF7F2] py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-t border-[#ede7de]" id="how-it-works">
            <div className="mx-auto max-w-7xl">
              
              {/* Section Header */}
              <InView
                viewOptions={{ margin: "0px 0px -100px 0px" }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-center max-w-2xl mx-auto mb-16"
              >
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF0EB] clay-pill-badge px-4 py-1.5 mb-4">
                  <span className="font-sans-ui text-xs font-bold uppercase tracking-wider text-[#1d472c]">
                    EFFORTLESS 3-STEP ONBOARDING
                  </span>
                </div>
                <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl text-[#1a2d1f] tracking-tight">
                  How You Land Top Offers with CareerCompass
                </h2>
                <p className="mt-4 text-base sm:text-lg text-[#4a6350] font-normal leading-relaxed">
                  Start applying smarter, interviewing with conviction, and landing competitive offers in less than 5 minutes.
                </p>
              </InView>

              {/* 3 Chunky 3D Clay Step Cards with horizontal slide-in animation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                
                {/* Step 1 */}
                <InView
                  viewOptions={{ margin: "0px 0px -100px 0px" }}
                  variants={{
                    hidden: { opacity: 0, x: 100 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="relative rounded-3xl clay-card-light p-7 sm:p-8 flex flex-col justify-between border border-[#e8dfd3] hover:-translate-y-1 transition-transform"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-sans-ui text-xs font-bold px-3.5 py-1.5 rounded-full bg-[#EAF0EB] clay-pill-badge text-[#1b4e2c]">
                        STEP 01
                      </span>
                      <div className="w-20 h-20 rounded-2xl bg-[#EAF0EB] clay-pill-badge p-1 flex items-center justify-center shadow-md">
                        <img
                          alt="3D clay resume and goal setting illustration"
                          className="w-full h-full object-contain drop-shadow"
                          src="/landing_page/images/image_7.png"
                        />
                      </div>
                    </div>
                    <h3 className="font-sans-ui font-bold text-xl text-[#122618] tracking-tight mb-3">
                      Upload Resume &amp; Set Goals
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-normal">
                      Import your existing CV or LinkedIn profile. CareerCompass parses your projects, coursework, and target sectors in seconds.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-gray-200/60 flex items-center gap-2 text-xs text-[#1e5833] font-semibold font-sans-ui">
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                    <span>Takes under 60 seconds</span>
                  </div>
                </InView>

                {/* Step 2 */}
                <InView
                  viewOptions={{ margin: "0px 0px -100px 0px" }}
                  variants={{
                    hidden: { opacity: 0, x: 100 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="relative rounded-3xl clay-card-light p-7 sm:p-8 flex flex-col justify-between border border-[#e8dfd3] hover:-translate-y-1 transition-transform"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-sans-ui text-xs font-bold px-3.5 py-1.5 rounded-full bg-[#EAF0EB] clay-pill-badge text-[#1b4e2c]">
                        STEP 02
                      </span>
                      <div className="w-20 h-20 rounded-2xl bg-[#EAF0EB] clay-pill-badge p-1 flex items-center justify-center shadow-md">
                        <img
                          alt="3D clay neural wand and tuning sliders illustration"
                          className="w-full h-full object-contain drop-shadow"
                          src="/landing_page/images/step-2.png"
                        />
                      </div>
                    </div>
                    <h3 className="font-sans-ui font-bold text-xl text-[#122618] tracking-tight mb-3">
                      AI Optimizes &amp; Bridges Gaps
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-normal">
                      Our models benchmark your profile against thousands of verified hires, rewrite bullets for ATS dominance, and generate personalized interview prep.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-gray-200/60 flex items-center gap-2 text-xs text-[#1e5833] font-semibold font-sans-ui">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>94%+ ATS pass guarantee</span>
                  </div>
                </InView>

                {/* Step 3 */}
                <InView
                  viewOptions={{ margin: "0px 0px -100px 0px" }}
                  variants={{
                    hidden: { opacity: 0, x: 100 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="relative rounded-3xl clay-card-light p-7 sm:p-8 flex flex-col justify-between border border-[#e8dfd3] hover:-translate-y-1 transition-transform"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-sans-ui text-xs font-bold px-3.5 py-1.5 rounded-full bg-[#EAF0EB] clay-pill-badge text-[#1b4e2c]">
                        STEP 03
                      </span>
                      <div className="w-20 h-20 rounded-2xl bg-[#EAF0EB] clay-pill-badge p-1 flex items-center justify-center shadow-md">
                        <img
                          alt="3D clay trophy and offer letter envelope illustration"
                          className="w-full h-full object-contain drop-shadow"
                          src="/landing_page/images/step-3.png"
                        />
                      </div>
                    </div>
                    <h3 className="font-sans-ui font-bold text-xl text-[#122618] tracking-tight mb-3">
                      Track, Interview &amp; Land Offers
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-normal">
                      Apply with hyper-tailored collateral, track stage updates automatically in your visual kanban pipeline, and negotiate top-tier compensation.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-gray-200/60 flex items-center gap-2 text-xs text-[#1e5833] font-semibold font-sans-ui">
                    <span className="material-symbols-outlined text-[16px]">celebration</span>
                    <span>Average 3.2 offers per user</span>
                  </div>
                </InView>

              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 6. OUTCOMES & LIVE COMMAND CENTER PEEK SECTION            */}
          {/* ========================================================= */}
          <section className="w-full bg-[#dbe8dc] py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-t border-[#c8decb]" id="live-command-center">
            <div className="mx-auto max-w-7xl">
              
              {/* Header */}
              <div className="text-center max-w-3xl mx-auto mb-16">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF7F2] clay-pill-badge px-4 py-1.5 mb-4">
                  <span className="material-symbols-outlined text-[16px] text-[#1b5e3f]">analytics</span>
                  <span className="font-sans-ui text-xs font-bold uppercase tracking-wider text-[#123e25]">
                    PROVEN STUDENT OUTCOMES
                  </span>
                </div>
                <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl text-[#122e1e] tracking-tight">
                  Built for High-Stakes Campus Recruiting
                </h2>
                <p className="mt-4 text-base sm:text-lg text-[#2f4f3a] font-normal leading-relaxed">
                  Explore real performance metrics and test-drive the automated tools students use to turn cold submissions into competing six-figure offers.
                </p>
              </div>

              {/* 4 Outcome Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                
                {/* Metric 1 */}
                <div className="rounded-3xl clay-card-light p-6 sm:p-7 flex flex-col justify-between border border-[#e8dfd3] hover:-translate-y-1 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#EAF0EB] clay-pill-badge flex items-center justify-center text-[#18532f]">
                      <span className="material-symbols-outlined text-[22px]">task_alt</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-900 bg-[#c6e9cf] clay-pill-badge px-3 py-1 rounded-full font-sans-ui">
                      Verified 2025
                    </span>
                  </div>
                  <div>
                    <div className="font-serif-heading text-4xl sm:text-5xl font-bold text-[#102a1b] tracking-tight mb-1">
                      94.8%
                    </div>
                    <div className="font-sans-ui font-bold text-sm text-[#18532f] mb-2">
                      ATS Screening Pass Rate
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-normal">
                      +38% higher clearance vs standard university career centers and static resume templates.
                    </p>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="rounded-3xl clay-card-light p-6 sm:p-7 flex flex-col justify-between border border-[#e8dfd3] hover:-translate-y-1 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#EAF0EB] clay-pill-badge flex items-center justify-center text-[#18532f]">
                      <span className="material-symbols-outlined text-[22px]">trending_up</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-900 bg-[#c6e9cf] clay-pill-badge px-3 py-1 rounded-full font-sans-ui">
                      Avg Offer Multiplier
                    </span>
                  </div>
                  <div>
                    <div className="font-serif-heading text-4xl sm:text-5xl font-bold text-[#102a1b] tracking-tight mb-1">
                      3.2x
                    </div>
                    <div className="font-sans-ui font-bold text-sm text-[#18532f] mb-2">
                      Multiple Offer Velocity
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-normal">
                      Students holding at least 2 competing offers within 45 days of active search activation.
                    </p>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="rounded-3xl clay-card-light p-6 sm:p-7 flex flex-col justify-between border border-[#e8dfd3] hover:-translate-y-1 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#EAF0EB] clay-pill-badge flex items-center justify-center text-[#18532f]">
                      <span className="material-symbols-outlined text-[22px]">groups</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-900 bg-[#c6e9cf] clay-pill-badge px-3 py-1 rounded-full font-sans-ui">
                      Campus Network
                    </span>
                  </div>
                  <div>
                    <div className="font-serif-heading text-4xl sm:text-5xl font-bold text-[#102a1b] tracking-tight mb-1">
                      45,000+
                    </div>
                    <div className="font-sans-ui font-bold text-sm text-[#18532f] mb-2">
                      Active Student Cohort
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-normal">
                      Undergraduates &amp; grad students from 120+ top engineering, tech, and business programs.
                    </p>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="rounded-3xl clay-card-light p-6 sm:p-7 flex flex-col justify-between border border-[#e8dfd3] hover:-translate-y-1 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#EAF0EB] clay-pill-badge flex items-center justify-center text-[#18532f]">
                      <span className="material-symbols-outlined text-[22px]">payments</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-900 bg-[#c6e9cf] clay-pill-badge px-3 py-1 rounded-full font-sans-ui">
                      Tech &amp; Finance
                    </span>
                  </div>
                  <div>
                    <div className="font-serif-heading text-4xl sm:text-5xl font-bold text-[#102a1b] tracking-tight mb-1">
                      $118,500
                    </div>
                    <div className="font-sans-ui font-bold text-sm text-[#18532f] mb-2">
                      Median Starting Package
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-normal">
                      Verified alumni salary benchmarking across software, product, quantitative, and strategy roles.
                    </p>
                  </div>
                </div>

              </div>

              {/* Interactive Platform Simulation Frame */}
              <div className="rounded-3xl clay-card-forest p-6 sm:p-10 border border-emerald-400/30 shadow-2xl">
                
                {/* Simulation Top Bar & Switcher */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-emerald-500/20">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#1b4835] clay-pill-badge-dark px-3.5 py-1.5 border border-emerald-400/20 mb-3">
                      <span className="material-symbols-outlined text-[#3ee093] text-[16px]">terminal</span>
                      <span className="font-sans-ui text-xs font-bold uppercase tracking-wider text-emerald-200">
                        LIVE COMMAND CENTER PEEK
                      </span>
                    </div>
                    <h3 className="font-serif-heading text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
                      Interactive Platform Simulation
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 font-sans-ui">
                    <button
                      type="button"
                      onClick={() => setActivePeekTab("tab-resume")}
                      className={`px-5 py-2.5 rounded-full text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                        activePeekTab === "tab-resume" ? "font-bold clay-tab-active" : "font-semibold clay-tab-inactive"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">description</span>
                      <span>ATS Resume Diagnostic</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActivePeekTab("tab-coach")}
                      className={`px-5 py-2.5 rounded-full text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                        activePeekTab === "tab-coach" ? "font-bold clay-tab-active" : "font-semibold clay-tab-inactive"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">psychology</span>
                      <span>Interview Simulation (Kiki)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActivePeekTab("tab-offers")}
                      className={`px-5 py-2.5 rounded-full text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                        activePeekTab === "tab-offers" ? "font-bold clay-tab-active" : "font-semibold clay-tab-inactive"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">candlestick_chart</span>
                      <span>Offer Negotiation Matrix</span>
                    </button>
                  </div>
                </div>

                {/* Tab 1 Panel: Resume Diagnostic */}
                {activePeekTab === "tab-resume" && (
                  <div className="tab-content-panel block pt-8 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      
                      <div className="lg:col-span-5 flex flex-col gap-5 text-white">
                        <div className="rounded-2xl clay-card-charcoal p-5 border border-[#3e5643]">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 font-sans-ui">
                              Job Match Diagnostic
                            </span>
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#1b5e3f] text-[#62fead] clay-pill-badge-dark">
                              96% Keyword Density
                            </span>
                          </div>
                          <div className="w-full bg-[#142017] rounded-full h-3 mb-2 p-0.5 border border-emerald-500/30">
                            <div
                              className="bg-gradient-to-r from-[#3ee093] to-[#62fead] h-2 rounded-full shadow-[0_0_8px_#3ee093]"
                              style={{ width: "96%" }}
                            />
                          </div>
                          <p className="text-xs text-emerald-100/70 font-sans-ui">
                            Role: Senior SWE Intern (L4 Platform Services)
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#1a281e] p-5 border border-[#3e5643]">
                          <div className="text-xs font-bold uppercase tracking-wider text-emerald-300 font-sans-ui mb-3 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-[#3ee093]">add_circle</span>
                            <span>Recommended Keywords to Inject</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3.5 py-1.5 rounded-full bg-[#183626] border border-emerald-500/30 text-xs font-semibold text-emerald-100 font-sans-ui cursor-pointer shadow-[0_3px_0_#0f241a] hover:translate-y-0.5 transition-transform flex items-center gap-1">
                              <span className="text-[#62fead] font-bold">+</span> Distributed Systems
                            </span>
                            <span className="px-3.5 py-1.5 rounded-full bg-[#183626] border border-emerald-500/30 text-xs font-semibold text-emerald-100 font-sans-ui cursor-pointer shadow-[0_3px_0_#0f241a] hover:translate-y-0.5 transition-transform flex items-center gap-1">
                              <span className="text-[#62fead] font-bold">+</span> Cross-functional OKRs
                            </span>
                            <span className="px-3.5 py-1.5 rounded-full bg-[#183626] border border-emerald-500/30 text-xs font-semibold text-emerald-100 font-sans-ui cursor-pointer shadow-[0_3px_0_#0f241a] hover:translate-y-0.5 transition-transform flex items-center gap-1">
                              <span className="text-[#62fead] font-bold">+</span> System Design Tradeoffs
                            </span>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#1b3b2b]/80 border border-emerald-400/20 text-xs text-emerald-100 leading-relaxed font-sans-ui flex items-center gap-3">
                          <span className="material-symbols-outlined text-[#3ee093] text-[24px]">verified_user</span>
                          <div>
                            <strong className="text-white font-semibold">Automated Verification:</strong> Parsed against 14,200+ confirmed hire resumes across Stripe, Figma, and Google.
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-emerald-400/30 shadow-2xl bg-[#FAF7F2] p-2 sm:p-3">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200/60 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                            <span className="font-sans-ui text-xs font-bold text-gray-800">
                              Lattice Goal Benchmark &amp; Live Alignment
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-800 bg-[#EAF0EB] clay-pill-badge px-2.5 py-0.5 rounded-full font-sans-ui">
                            Live Sync Active
                          </span>
                        </div>

                        <div className="relative w-full h-[280px] sm:h-[320px] rounded-xl overflow-hidden bg-white">
                          <img
                            alt="Lattice benchmark live interface"
                            className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                            src="/landing_page/images/image_3.png"
                          />
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-3 rounded-xl bg-[#0b281d]/90 backdrop-blur-md border border-emerald-400/30 text-white shadow-lg text-xs font-sans-ui">
                            <span className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[#3ee093] text-[18px]">check_circle</span>
                              18 target skills matched directly to open reqs
                            </span>
                            <span className="text-[#62fead] font-bold">Calibrated</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* Tab 2 Panel: Interview Simulation (Kiki) */}
                {activePeekTab === "tab-coach" && (
                  <div className="tab-content-panel block pt-8 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      
                      <div className="lg:col-span-6 flex flex-col gap-4">
                        <div className="rounded-2xl clay-card-charcoal p-6 border border-[#485d4d] text-white flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                alt="Kiki AI Coach Avatar"
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#3ee093] shadow-md"
                                src="/landing_page/images/image_5.png"
                              />
                              <div>
                                <h4 className="font-sans-ui font-bold text-sm text-white">Kiki • Senior AI Coach</h4>
                                <p className="text-[11px] text-[#62fead] font-medium flex items-center gap-1">
                                  <span className="h-2 w-2 rounded-full bg-[#3ee093] animate-pulse" />
                                  Active Simulation Session
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-[#00381e] bg-[#3ee093] px-3 py-1 rounded-full font-sans-ui clay-pill-badge">
                              Round 2 Behavioral
                            </span>
                          </div>

                          <div className="rounded-xl bg-[#142017] p-4 border border-emerald-500/20 text-xs text-emerald-100 font-sans-ui leading-relaxed">
                            <span className="font-bold text-[#62fead] block mb-1">Kiki:</span>
                            “Tell me about a time when an engineer disagreed with your architectural specification right before an alpha freeze. How did you de-escalate and reach consensus?”
                          </div>

                          <div className="rounded-xl bg-[#1a3d2c]/60 p-3.5 border border-emerald-400/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[#3ee093] text-[20px]">mic</span>
                              <div className="flex items-center gap-1 h-5">
                                <span className="w-1 bg-[#62fead] h-3 rounded-full animate-pulse" />
                                <span className="w-1 bg-[#62fead] h-5 rounded-full animate-pulse" />
                                <span className="w-1 bg-[#62fead] h-2 rounded-full animate-pulse" />
                                <span className="w-1 bg-[#62fead] h-4 rounded-full animate-pulse" />
                                <span className="w-1 bg-[#62fead] h-5 rounded-full animate-pulse" />
                                <span className="w-1 bg-[#62fead] h-2 rounded-full animate-pulse" />
                              </div>
                              <span className="text-[11px] text-emerald-200/90 font-sans-ui ml-2">
                                Candidate Voice Response: 0:42 / 1:30
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleDirectDemoAccess}
                              className="text-[11px] font-bold text-white px-4 py-1.5 rounded-full font-sans-ui clay-btn-primary cursor-pointer"
                            >
                              Analyze Tone
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-6 flex flex-col gap-4 text-white">
                        <div className="rounded-2xl bg-[#1a281e] p-6 border border-[#3e5643]">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 font-sans-ui flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[18px] text-[#3ee093]">grade</span>
                              STAR Rubric Live Scoring
                            </span>
                            <span className="text-xs font-bold text-[#62fead] bg-[#0c261b] px-3 py-1 rounded-full border border-emerald-500/30 font-sans-ui">
                              89 / 100 Impact Score
                            </span>
                          </div>

                          <div className="space-y-3 font-sans-ui text-xs">
                            <div className="flex items-center justify-between text-emerald-100">
                              <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[#3ee093] text-[16px]">check</span>
                                Situation &amp; Task Definition
                              </span>
                              <span className="font-bold text-white">95%</span>
                            </div>
                            <div className="flex items-center justify-between text-emerald-100">
                              <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[#3ee093] text-[16px]">check</span>
                                Action &amp; Technical Ownership
                              </span>
                              <span className="font-bold text-white">92%</span>
                            </div>
                            <div className="flex items-center justify-between text-emerald-100">
                              <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[#62fead] text-[16px]">tune</span>
                                Quantified Result &amp; Metric Impact
                              </span>
                              <span className="font-bold text-[#62fead]">78% (Sharpenable)</span>
                            </div>
                          </div>

                          <div className="mt-5 pt-4 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <p className="text-[11px] text-emerald-200/80 font-sans-ui">
                              Recommended: State latency reduction % in the closing STAR phrase.
                            </p>
                            <button
                              type="button"
                              onClick={handleDirectDemoAccess}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full clay-btn-primary text-xs font-bold font-sans-ui cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[15px]">autorenew</span>
                              <span>Practice Follow-Up</span>
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* Tab 3 Panel: Offer Negotiation Matrix */}
                {activePeekTab === "tab-offers" && (
                  <div className="tab-content-panel block pt-8 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      
                      <div className="lg:col-span-7 flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          <div className="rounded-2xl clay-card-charcoal p-5 border border-emerald-500/30 text-white flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-sans-ui font-bold text-base text-white">Linear</div>
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#1b5e3f] text-[#62fead] clay-pill-badge-dark">
                                Full-Time Return
                              </span>
                            </div>
                            <div className="mb-4">
                              <div className="font-serif-heading text-2xl font-bold text-white">$145,000</div>
                              <p className="text-xs text-emerald-200/80 font-sans-ui">Base Salary + 0.04% ISO Equity</p>
                            </div>
                            <div className="text-[11px] text-emerald-100/70 font-sans-ui pt-3 border-t border-emerald-500/20 flex items-center justify-between">
                              <span>Location: San Francisco (Hybrid)</span>
                              <span className="text-[#62fead] font-semibold">4 yr vest</span>
                            </div>
                          </div>

                          <div className="rounded-2xl clay-card-charcoal p-5 border border-[#62fead]/50 text-white flex flex-col justify-between shadow-[0_0_15px_rgba(98,254,173,0.15)]">
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-sans-ui font-bold text-base text-[#62fead]">Figma</div>
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#3ee093] text-[#00381e] font-sans-ui">
                                High Benchmark
                              </span>
                            </div>
                            <div className="mb-4">
                              <div className="font-serif-heading text-2xl font-bold text-white">$152,000</div>
                              <p className="text-xs text-emerald-200/80 font-sans-ui">Base Salary + $20k Sign-on + RSUs</p>
                            </div>
                            <div className="text-[11px] text-emerald-100/70 font-sans-ui pt-3 border-t border-emerald-500/20 flex items-center justify-between">
                              <span>Location: New York City</span>
                              <span className="text-[#3ee093] font-semibold">1 yr cliff</span>
                            </div>
                          </div>

                        </div>

                        <div className="rounded-2xl bg-[#142017] p-5 border border-emerald-500/30 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#1e4634] clay-pill-badge-dark flex items-center justify-center text-[#3ee093]">
                              <span className="material-symbols-outlined text-[20px]">gavel</span>
                            </div>
                            <div>
                              <div className="font-sans-ui font-bold text-xs text-white">AI Counter-Offer Script Engine</div>
                              <p className="text-[11px] text-emerald-200/80 font-sans-ui">
                                Generates diplomatic, leverage-backed emails citing competing comp numbers.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleDirectDemoAccess}
                            className="w-full sm:w-auto px-6 py-3 rounded-full clay-btn-primary font-sans-ui text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">send</span>
                            <span>Run Counter-Offer Script</span>
                          </button>
                        </div>
                      </div>

                      <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-emerald-400/30 shadow-2xl bg-[#FAF7F2] p-2 sm:p-3">
                        <div className="relative w-full h-[280px] sm:h-[300px] rounded-xl overflow-hidden bg-white">
                          <img
                            alt="Lattice compensation and talent overview"
                            className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                            src="/landing_page/images/image_4.png"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0e2115]/85 via-transparent to-transparent flex items-end p-4">
                            <div className="flex items-center justify-between w-full text-white text-xs font-sans-ui">
                              <span className="font-semibold flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[#3ee093] text-[18px]">verified</span>
                                Market-calibrated pay bands
                              </span>
                              <span className="text-[#62fead] font-bold">+14.2% negotiated delta</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>

            </div>
          </section>

          {/* ========================================================= */}
          {/* 7. BOTTOM CLOSING CTA BANNER                               */}
          {/* ========================================================= */}
          <section className="w-full bg-[#122118] py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl relative overflow-hidden rounded-3xl clay-card-charcoal text-white p-8 sm:p-14 lg:p-20 border border-emerald-500/20">
              
              {/* Ambient emerald radial glow */}
              <div className="pointer-events-none absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full bg-[#3ee093]/15 blur-[120px]" />
              <div className="pointer-events-none absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full bg-[#176a44]/25 blur-[110px]" />

              <div className="relative z-10 max-w-3xl mx-auto text-center">
                <h2 className="font-serif-heading text-3xl sm:text-5xl text-white tracking-tight leading-tight mb-6">
                  Ready to Land Your Next Big Opportunity?
                </h2>
                <p className="text-base sm:text-lg text-emerald-100/85 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
                  Join over 45,000 university students and early career grads who transformed rejected cold applications into top-tier tech, consulting, and design offers.
                </p>

                {/* CTA Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-10 font-sans-ui">
                  <Link
                    href="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-bold px-8 py-4 rounded-full clay-btn-primary transition-all cursor-pointer"
                  >
                    <span>Start Free Today — No Credit Card Required</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleDirectDemoAccess}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-bold px-8 py-4 rounded-full clay-btn-secondary transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#24412d]">school</span>
                    <span>Explore Campus Demo</span>
                  </button>
                </div>

                {/* Trust Badges Strip with 3D Clay Pills */}
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-sans-ui font-medium">
                  <span className="px-3.5 py-1.5 rounded-full bg-[#1e2e22] clay-pill-badge-dark text-emerald-200 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#62fead]">lock</span>
                    Student Data Privacy Guaranteed
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full bg-[#1e2e22] clay-pill-badge-dark text-emerald-200 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#62fead]">school</span>
                    Free for .edu accounts
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full bg-[#1e2e22] clay-pill-badge-dark text-emerald-200 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#62fead]">bolt</span>
                    2-minute setup
                  </span>
                </div>
              </div>

            </div>
          </section>

        </div>
      </main>

      {/* ========================================================= */}
      {/* 8. FOOTER WITH 3D CLAYMORPHIC ELEMENTS                     */}
      {/* ========================================================= */}
      <footer className="w-full bg-[#142017] text-white border-t border-emerald-900/60 font-sans-ui">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
            
            <div className="lg:col-span-2 flex flex-col items-start">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-1.5 rounded-2xl bg-[#1e4e3b] shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,0.25),inset_-1.5px_1.5px_3px_rgba(0,0,0,0.4)] flex items-center justify-center">
                  <img
                    alt="CareerCompass Logo"
                    className="h-7 w-auto object-contain brightness-0 invert"
                    src="/landing_page/images/logo.png"
                  />
                </div>
                <span className="font-bold text-xl text-white tracking-tight">CareerCompass</span>
              </div>
              <p className="text-sm text-emerald-100/70 max-w-sm mb-6 font-normal leading-relaxed">
                AI-powered career command center engineered for university students, recent graduates, and ambitious job seekers navigating the modern hiring landscape.
              </p>
              <div className="flex items-center gap-3">
                <a
                  aria-label="Community Channel"
                  className="w-9 h-9 rounded-full bg-[#1a2d21] clay-pill-badge-dark flex items-center justify-center text-emerald-200 hover:bg-[#3ee093] hover:text-[#00341c] transition-colors"
                  href="#"
                >
                  <span className="material-symbols-outlined text-[18px]">forum</span>
                </a>
                <a
                  aria-label="Global Network"
                  className="w-9 h-9 rounded-full bg-[#1a2d21] clay-pill-badge-dark flex items-center justify-center text-emerald-200 hover:bg-[#3ee093] hover:text-[#00341c] transition-colors"
                  href="#"
                >
                  <span className="material-symbols-outlined text-[18px]">public</span>
                </a>
                <a
                  aria-label="Support Center"
                  className="w-9 h-9 rounded-full bg-[#1a2d21] clay-pill-badge-dark flex items-center justify-center text-emerald-200 hover:bg-[#3ee093] hover:text-[#00341c] transition-colors"
                  href="#"
                >
                  <span className="material-symbols-outlined text-[18px]">headset_mic</span>
                </a>
                <a
                  aria-label="Announcements"
                  className="w-9 h-9 rounded-full bg-[#1a2d21] clay-pill-badge-dark flex items-center justify-center text-emerald-200 hover:bg-[#3ee093] hover:text-[#00341c] transition-colors"
                  href="#"
                >
                  <span className="material-symbols-outlined text-[18px]">campaign</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-emerald-300 mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><a className="text-xs text-emerald-100/70 hover:text-[#62fead] transition-colors" href="#features">Features</a></li>
                <li><Link className="text-xs text-emerald-100/70 hover:text-[#62fead] transition-colors" href="/dashboard">Career Tracker</Link></li>
                <li><Link className="text-xs text-emerald-100/70 hover:text-[#62fead] transition-colors" href="/dashboard/kiki">AI Coach</Link></li>
                <li><Link className="text-xs text-emerald-100/70 hover:text-[#62fead] transition-colors" href="/dashboard/roadmap">Roadmap</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-emerald-300 mb-4">Ecosystem</h4>
              <ul className="space-y-3">
                <li><a className="text-xs text-emerald-100/70 hover:text-[#62fead] transition-colors" href="#live-command-center">Outcomes</a></li>
                <li><a className="text-xs text-emerald-100/70 hover:text-[#62fead] transition-colors" href="#preview">Interactive Preview</a></li>
                <li><a className="text-xs text-emerald-100/70 hover:text-[#62fead] transition-colors" href="#how-it-works">How It Works</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-emerald-300 mb-4">Trust &amp; Legal</h4>
              <ul className="space-y-3">
                <li><Link className="text-xs text-emerald-100/70 hover:text-[#62fead] transition-colors" href="/login">Login</Link></li>
                <li><Link className="text-xs text-emerald-100/70 hover:text-[#62fead] transition-colors" href="/register">Register</Link></li>
                <li><a className="text-xs text-emerald-100/70 hover:text-[#62fead] transition-colors" href="#">Privacy</a></li>
                <li><a className="text-xs text-emerald-100/70 hover:text-[#62fead] transition-colors" href="#">Terms</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/10">
            <p className="text-xs text-emerald-200/50">© 2025 CareerCompass Inc. All rights reserved.</p>
            <p className="text-xs text-emerald-200/50">Empowering the next generation of leaders.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
