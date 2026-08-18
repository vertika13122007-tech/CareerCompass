"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Loader2,
  UploadCloud,
  User,
  Mail,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function DashboardOverview() {
  const [resumeData, setResumeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("http://127.0.0.1:8000/resume/latest");

        if (response.status === 404) {
          setResumeData(null);
        } else if (response.ok) {
          const data = await response.json();
          setResumeData(data);
        } else {
          setResumeData(null);
        }
      } catch (err: any) {
        console.error("Failed to fetch resume data:", err);
        setError("Unable to connect to backend service");
        setResumeData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumeData();
  }, []);

  // Dummy fallback data
  const fallbackSkills = [
    "React",
    "TypeScript",
    "Node.js",
    "PostgreSQL",
    "Next.js",
    "Tailwind CSS",
  ];
  const missingKeywords = ["Docker", "AWS", "CI/CD", "GraphQL"];
  const actionItems = [
    "Quantify your accomplishments with measurable metrics & percentages.",
    "Add more industry-standard cloud technologies (e.g., AWS, Docker).",
  ];

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-[#52795C] animate-spin" />
        <p className="text-lg font-medium text-[#5C665D] animate-pulse">
          Loading your insights...
        </p>
      </div>
    );
  }

  // 2. Empty State (No Resume)
  if (!resumeData) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white rounded-3xl p-10 md:p-12 text-center shadow-[0_8px_30px_rgba(214,211,204,0.4)] border border-[#F5F3EC] flex flex-col items-center">
          <div className="p-5 bg-[#EAF0EB] text-[#52795C] rounded-full mb-6">
            <UploadCloud className="w-12 h-12 stroke-[1.75]" />
          </div>

          <h2 className="text-3xl font-extrabold text-[#2D3A2F] mb-3">
            No Resume Data Yet
          </h2>

          <p className="text-[#5C665D] text-lg max-w-md mb-8 leading-relaxed">
            Upload your resume to get instant ATS compatibility scoring, skill
            extractions, and tailored recommendations.
          </p>

          <Link
            href="/dashboard/upload"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#2D3A2F] text-white font-semibold rounded-2xl hover:bg-[#3B5942] transition-all hover:-translate-y-0.5 shadow-md"
          >
            <span>Go to Upload</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  // 3. Populated Dashboard State
  const extractedSkills =
    Array.isArray(resumeData.skills) && resumeData.skills.length > 0
      ? resumeData.skills
      : fallbackSkills;

  const candidateName =
    resumeData.contact_info?.name || resumeData.name || "Candidate";
  const candidateEmail =
    resumeData.contact_info?.email ||
    resumeData.email ||
    "No contact email found";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Area */}
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-[#2D3A2F]">
          Resume Analysis Complete
        </h1>
        <p className="text-[#5C665D] text-lg">
          Here is how your resume aligns with top industry standards.
        </p>
      </div>

      {/* Top Grid (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1: ATS Score */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(214,211,204,0.4)] p-8 flex flex-col items-center justify-center text-center border border-[#F5F3EC]">
          <h2 className="text-[#5C665D] font-semibold mb-6">Overall ATS Match</h2>
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Background Circle */}
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-[#F5F3EC]"
              />
              {/* Progress Circle (85%) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset="37.68"
                strokeLinecap="round"
                className="text-[#52795C]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-[#2D3A2F]">
                85<span className="text-2xl text-[#5C665D]">%</span>
              </span>
            </div>
          </div>
          <p className="text-[#52795C] font-medium mt-6 bg-[#EAF0EB] px-4 py-1.5 rounded-full text-sm">
            Highly Competitive
          </p>
        </div>

        {/* Card 2: Candidate Overview */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(214,211,204,0.4)] p-8 border border-[#F5F3EC] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-[#52795C]" />
              <h2 className="text-xl font-bold text-[#2D3A2F]">
                Profile Summary
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#F5F3EC]">
                <div className="p-2 bg-[#EAF0EB] text-[#52795C] rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-[#8C938D] font-medium">Name</p>
                  <p className="text-[#2D3A2F] font-semibold truncate">
                    {candidateName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FDFBF7] border border-[#F5F3EC]">
                <div className="p-2 bg-[#EAF0EB] text-[#52795C] rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-[#8C938D] font-medium">Email</p>
                  <p className="text-[#2D3A2F] font-semibold truncate">
                    {candidateEmail}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F5F3EC] flex justify-between items-center text-sm text-[#5C665D]">
            <span>Status</span>
            <span className="text-[#52795C] font-semibold bg-[#EAF0EB] px-3 py-1 rounded-full text-xs">
              Analyzed
            </span>
          </div>
        </div>

        {/* Card 3: Action Items */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(214,211,204,0.4)] p-8 border border-[#F5F3EC] flex flex-col">
          <h2 className="text-xl font-bold text-[#2D3A2F] mb-6">Action Items</h2>
          <ul className="space-y-4 flex-1">
            {actionItems.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-4 p-4 rounded-2xl bg-[#FDFBF7] border border-[#F5F3EC]"
              >
                <div className="mt-0.5 text-[#B07C50] shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <span className="text-[#5C665D] font-medium leading-relaxed text-sm">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Area: Skills Analysis */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(214,211,204,0.4)] p-8 md:p-10 border border-[#F5F3EC]">
        <h2 className="text-2xl font-bold text-[#2D3A2F] mb-8">
          Keyword & Skill Extraction
        </h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-[#2D3A2F] font-semibold mb-4 text-lg">
              Core Skills Found
            </h3>
            <div className="flex flex-wrap gap-3">
              {extractedSkills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="rounded-full px-4 py-1.5 bg-[#F5F3EC] text-[#5C665D] text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[#2D3A2F] font-semibold mb-4 text-lg">
              Missing Keywords
            </h3>
            <div className="flex flex-wrap gap-3">
              {missingKeywords.map((keyword: string, index: number) => (
                <span
                  key={index}
                  className="rounded-full px-4 py-1.5 border border-[#E6D5C3] text-[#8C6D53] bg-[#FDFBF7] text-sm font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
            <p className="text-sm text-[#8C938D] mt-4">
              *Adding these keywords may significantly boost your resume&apos;s
              visibility to ATS systems.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}