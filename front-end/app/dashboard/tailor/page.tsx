"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wand2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  FileText,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Download,
} from "lucide-react";
import { BorderTrail } from "@/components/core/border-trail";
import { TextShimmer } from "@/components/core/text-shimmer";
import { TextEffect } from "@/components/core/text-effect";

import { API_BASE_URL, getAuthHeaders, getAuthBearerHeader } from "@/lib/auth";

export default function TailorPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [isTailoring, setIsTailoring] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [tailoredOutput, setTailoredOutput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"formatted" | "raw">("formatted");
  const [activeResumeName, setActiveResumeName] = useState<string | null>(null);

  // Fetch current active resume info to display as context
  useEffect(() => {
    const fetchActiveResume = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/ai/current-resume`, {
          headers: getAuthBearerHeader(),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.resume_name) {
            setActiveResumeName(data.resume_name);
          }
        }
      } catch (err) {
        console.error("Could not fetch active resume context:", err);
      }
    };
    fetchActiveResume();
  }, []);

  const handleTailor = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!jobDescription.trim() || !resumeName.trim() || isTailoring) return;

    setIsTailoring(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/ai/tailor-resume`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          job_description: jobDescription,
          resume_name: resumeName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to tailor resume. Please ensure an active resume is uploaded.");
      }

      setSuccessMessage("Successfully generated and added to your Resume Library!");
      setTailoredOutput(data.extracted_text || data.tailored_text || "");
    } catch (err: any) {
      console.error("Error tailoring resume:", err);
      setErrorMessage(err.message || "An unexpected error occurred while tailoring your resume.");
    } finally {
      setIsTailoring(false);
    }
  };

  const handleCopy = () => {
    if (!tailoredOutput) return;
    navigator.clipboard.writeText(tailoredOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!tailoredOutput) return;
    const blob = new Blob([tailoredOutput], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${resumeName || "tailored_resume"}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to format inline markdown (bolding, italics, links)
  const formatInlineText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-[#2D3A2F]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={i} className="italic text-[#5C665D]">
            {part.slice(1, -1)}
          </em>
        );
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={i}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#52795C] hover:underline"
          >
            {linkMatch[1]}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto w-full px-2 sm:px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAF0EB]">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-[#EAF0EB] text-[#52795C] rounded-2xl shadow-sm">
            <Wand2 className="w-7 h-7" />
          </div>
          <div>
            <TextEffect className="text-3xl font-extrabold text-[#2D3A2F] tracking-tight" preset="fade-in-blur" speedReveal={1.1} speedSegment={0.3}>
              Tailor Resume
            </TextEffect>
            <p className="text-sm text-[#5C665D] mt-1">
              Generate a custom version of your active resume for a specific job and save it to your library.
            </p>
          </div>
        </div>

        {activeResumeName && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#F5F3EC] rounded-full border border-[#EAF0EB] text-xs font-semibold text-[#5C665D] self-start sm:self-center shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#52795C] animate-pulse" />
            <span>Active Source: <strong className="text-[#2D3A2F]">{activeResumeName}</strong></span>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-[#FCEAE8] text-[#B74134] p-4 rounded-2xl border border-[#F9D6D3] flex items-start gap-3 animate-in fade-in duration-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-medium">
            <p>{errorMessage}</p>
            {errorMessage.toLowerCase().includes("upload") && (
              <Link
                href="/dashboard/upload"
                className="inline-flex items-center gap-1 font-bold underline mt-1 hover:text-[#902A1E]"
              >
                Go to Resume Library <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="bg-[#EDF7F0] text-[#2E6A3E] p-4 rounded-2xl border border-[#D1EBD9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-[#D1EBD9] rounded-full text-[#2E6A3E]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-[#2D3A2F]">{successMessage}</p>
          </div>
          <Link
            href="/dashboard/upload"
            className="inline-flex items-center justify-center gap-1.5 bg-[#52795C] hover:bg-[#3b5943] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <span>View in Resume Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Main Workspace Form Card */}
      <div className="bg-white border-2 border-[#EAF0EB] rounded-3xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleTailor} className="space-y-6">
          {/* New Resume Name Field */}
          <div className="space-y-2">
            <label
              htmlFor="resume-name-input"
              className="text-xs font-bold text-[#2D3A2F] uppercase tracking-wider flex items-center justify-between"
            >
              <span>New Resume Name</span>
              <span className="text-[11px] font-normal text-[#5C665D] normal-case">
                Identifies this tailored copy in your library
              </span>
            </label>
            <input
              id="resume-name-input"
              type="text"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              placeholder="e.g., Google SDE Tailored, Stripe Backend Engineer"
              className="w-full bg-[#FAF9F5] border-2 border-[#EAF0EB] rounded-2xl px-5 py-3.5 text-[#2D3A2F] text-sm font-medium placeholder-[#8A958C] focus:bg-white focus:border-[#52795C] focus:outline-none transition-all shadow-inner"
              disabled={isTailoring}
              required
            />
          </div>

          {/* Target Job Description Field */}
          <div className="space-y-2">
            <label
              htmlFor="job-description-input"
              className="text-xs font-bold text-[#2D3A2F] uppercase tracking-wider flex items-center justify-between"
            >
              <span>Target Job Description</span>
              <span className="text-[11px] font-normal text-[#5C665D] normal-case">
                Paste the full job post requirements
              </span>
            </label>
            <textarea
              id="job-description-input"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description here (requirements, qualifications, responsibilities, tech stack)..."
              className="w-full h-64 bg-[#FAF9F5] border-2 border-[#EAF0EB] rounded-2xl p-5 text-[#2D3A2F] text-sm leading-relaxed placeholder-[#8A958C] focus:bg-white focus:border-[#52795C] focus:outline-none transition-all shadow-inner resize-y font-mono"
              disabled={isTailoring}
              required
            />
          </div>

          {/* Action Button & Note */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-[#5C665D]">
              Rewrites your experience and skills using Gemini AI to maximize ATS keyword alignment.
            </p>
            {isTailoring ? (
              <div className="relative rounded-2xl px-8 py-4 bg-[#F5F3EC] flex items-center justify-center overflow-hidden font-bold text-sm text-[#52795C] shadow-sm flex-shrink-0">
                <BorderTrail
                  size={100}
                  style={{
                    boxShadow: '0px 0px 60px 30px rgba(82, 121, 92, 0.4), 0 0px 100px 50px rgba(0, 0, 0, 0.2)',
                  }}
                />
                <TextShimmer className="font-mono text-sm font-bold text-[#52795C]" duration={1.2}>
                  Tailoring Resume with Gemini AI...
                </TextShimmer>
              </div>
            ) : (
              <button
                type="submit"
                disabled={!resumeName.trim() || !jobDescription.trim()}
                className="w-full sm:w-auto bg-[#52795C] hover:bg-[#3b5943] text-white rounded-2xl px-8 py-4 font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Sparkles className="w-5 h-5" />
                <span>✨ Generate &amp; Save Tailored Resume</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Clean Markdown Preview Card Displaying Generated Resume */}
      {tailoredOutput && (
        <div className="bg-white border-2 border-[#EAF0EB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Card Top Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAF0EB]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#EAF0EB] text-[#52795C] rounded-xl shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#2D3A2F]">
                  Tailored Resume Preview
                </h2>
                <p className="text-xs text-[#5C665D]">
                  ATS-optimized markdown formatted and saved to your profile
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Toggle view mode */}
              <div className="flex bg-[#F5F3EC] p-1 rounded-xl text-xs font-bold text-[#5C665D] border border-[#EAF0EB]">
                <button
                  type="button"
                  onClick={() => setViewMode("formatted")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${viewMode === "formatted"
                      ? "bg-white text-[#2D3A2F] shadow-xs font-extrabold"
                      : "hover:text-[#2D3A2F]"
                    }`}
                >
                  Formatted
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("raw")}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${viewMode === "raw"
                      ? "bg-white text-[#2D3A2F] shadow-xs font-extrabold"
                      : "hover:text-[#2D3A2F]"
                    }`}
                >
                  Raw Markdown
                </button>
              </div>

              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF9F5] hover:bg-[#EAF0EB] border border-[#EAF0EB] text-[#2D3A2F] rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#52795C]" />
                    <span className="text-[#52795C]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#5C665D]" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {/* Download Button */}
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF9F5] hover:bg-[#EAF0EB] border border-[#EAF0EB] text-[#2D3A2F] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Download as Markdown"
              >
                <Download className="w-3.5 h-3.5 text-[#5C665D]" />
                <span>Export .md</span>
              </button>

              {/* Quick Library Link */}
              <Link
                href="/dashboard/upload"
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#52795C] hover:bg-[#3b5943] text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
              >
                <span>Resume Library</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Resume Body */}
          {viewMode === "formatted" ? (
            <div className="bg-[#FAF9F5] border border-[#EAF0EB] rounded-2xl p-6 sm:p-10 text-[#2D3A2F] leading-relaxed shadow-inner">
              <div className="max-w-3xl mx-auto space-y-4">
                {tailoredOutput.split("\n").map((line, idx) => {
                  const trimmed = line.trim();
                  if (!trimmed) {
                    return <div key={idx} className="h-2" />;
                  }

                  if (trimmed.startsWith("# ")) {
                    return (
                      <h1
                        key={idx}
                        className="text-2xl sm:text-3xl font-black text-[#2D3A2F] tracking-tight pb-2 border-b-2 border-[#2D3A2F]"
                      >
                        {trimmed.slice(2)}
                      </h1>
                    );
                  }

                  if (trimmed.startsWith("## ")) {
                    return (
                      <h2
                        key={idx}
                        className="text-lg sm:text-xl font-extrabold text-[#2D3A2F] uppercase tracking-wide pt-4 pb-1 border-b border-[#DCE5DE]"
                      >
                        {trimmed.slice(3)}
                      </h2>
                    );
                  }

                  if (trimmed.startsWith("### ")) {
                    return (
                      <h3
                        key={idx}
                        className="text-base font-bold text-[#2D3A2F] pt-2"
                      >
                        {trimmed.slice(4)}
                      </h3>
                    );
                  }

                  if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
                    const bulletContent = trimmed.replace(/^[-*•]\s+/, "");
                    return (
                      <div key={idx} className="flex items-start gap-2 text-sm pl-2">
                        <span className="text-[#52795C] font-bold mt-1 text-xs">•</span>
                        <p className="flex-1 text-[#2D3A2F]">
                          {formatInlineText(bulletContent)}
                        </p>
                      </div>
                    );
                  }

                  if (trimmed === "---") {
                    return <hr key={idx} className="my-4 border-[#EAF0EB]" />;
                  }

                  return (
                    <p key={idx} className="text-sm text-[#2D3A2F]">
                      {formatInlineText(trimmed)}
                    </p>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-[#FAF9F5] border border-[#EAF0EB] rounded-2xl p-6 text-sm font-mono leading-relaxed text-[#2D3A2F] whitespace-pre-wrap overflow-x-auto shadow-inner max-h-[600px] overflow-y-auto">
              {tailoredOutput}
            </div>
          )}

          {/* Quick Library Footer Call to Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-[#5C665D]">
              Want to make this new version your active default resume?
            </p>
            <Link
              href="/dashboard/upload"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#52795C] hover:text-[#3b5943] underline"
            >
              <span>Manage in Resume Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
