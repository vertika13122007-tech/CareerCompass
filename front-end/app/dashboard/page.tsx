"use client";

import Link from "next/link";
import { CheckCircle2, MessageSquare, Map, Sparkles, Lightbulb, ArrowRight } from "lucide-react";

export default function DashboardOverviewPage() {
  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 bg-transparent">
      {/* Header */}
      <div className="pb-8 pt-4">
        <h1 className="text-4xl font-extrabold text-[#2D3A2F] tracking-tight">
          Welcome to CareerCompass
        </h1>
        <p className="text-lg text-[#5C665D] mt-2">
          Your AI-powered career command center.
        </p>
      </div>

      {/* Resume Status Card (The Anchor) */}
      <div className="bg-white border-2 border-[#EAF0EB] rounded-3xl p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#EAF0EB] text-[#52795C] rounded-2xl flex-shrink-0">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2D3A2F]">
              Resume Active
            </h2>
            <p className="text-sm text-[#5C665D] mt-0.5">
              Kiki has your latest experience memorized and ready.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/upload"
          className="bg-[#F5F3EC] text-[#2D3A2F] px-6 py-3 rounded-full font-bold hover:bg-[#EAF0EB] transition-colors flex-shrink-0 text-sm shadow-sm"
        >
          Update Resume
        </Link>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: AI Coach */}
        <Link
          href="/dashboard/chat"
          className="group bg-[#F9FAFB] rounded-3xl p-6 border border-[#F5F3EC] hover:shadow-md hover:border-[#DCE5DE] transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-[#EAF0EB] text-[#52795C] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#2D3A2F] mb-1">
              Talk to Kiki
            </h3>
            <p className="text-sm text-[#5C665D] leading-relaxed">
              Practice interviews or get career advice.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#52795C] group-hover:translate-x-1 transition-transform">
            <span>Start chatting</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Card 2: Roadmap */}
        <Link
          href="/dashboard/roadmap"
          className="group bg-[#F9FAFB] rounded-3xl p-6 border border-[#F5F3EC] hover:shadow-md hover:border-[#DCE5DE] transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-[#EAF0EB] text-[#52795C] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#2D3A2F] mb-1">
              Learning Roadmap
            </h3>
            <p className="text-sm text-[#5C665D] leading-relaxed">
              Generate a 3-6 month growth plan.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#52795C] group-hover:translate-x-1 transition-transform">
            <span>View roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Card 3: Optimizer */}
        <Link
          href="/dashboard/optimizer"
          className="group bg-[#FCEAE8] rounded-3xl p-6 border border-[#F9D6D3] hover:shadow-md hover:border-[#F4BDB7] transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-white text-[#B74134] rounded-2xl flex items-center justify-center mb-4 shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#2D3A2F] mb-1">
              Resume Optimizer
            </h3>
            <p className="text-sm text-[#5C665D] leading-relaxed">
              Tailor your resume to a job description.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#B74134] group-hover:translate-x-1 transition-transform">
            <span>Optimize now</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Daily Tip Section */}
      <div className="mt-8 bg-[#2D3A2F] text-white rounded-3xl p-6 flex items-center gap-4 shadow-sm">
        <div className="p-3 bg-white/10 rounded-2xl flex-shrink-0 text-[#EAF0EB]">
          <Lightbulb className="w-7 h-7" />
        </div>
        <p className="text-sm font-medium leading-relaxed">
          <span className="font-bold text-[#EAF0EB]">Kiki&apos;s Tip of the Day:</span>{" "}
          Tailoring your resume for each application increases your ATS match rate by up to 40%.
        </p>
      </div>
    </div>
  );
}