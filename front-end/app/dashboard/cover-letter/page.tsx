"use client";

import { useState } from "react";
import { FileText, Copy, Check, RotateCcw, Sparkles, Send, Download } from "lucide-react";
import { BorderTrail } from "@/components/core/border-trail";
import { TextShimmer } from "@/components/core/text-shimmer";
import { TextEffect } from "@/components/core/text-effect";

import { API_BASE_URL, getAuthHeaders } from "@/lib/auth";

const TONE_OPTIONS = [
  "Professional",
  "Enthusiastic",
  "Confident",
  "Concise",
  "Executive",
  "Persuasive",
];

export default function CoverLetterPage() {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [tone, setTone] = useState("Professional");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!jobDescription.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/ai/cover-letter`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          company_name: companyName.trim() || "Hiring Team",
          job_title: jobTitle.trim() || "Target Position",
          job_description: jobDescription.trim(),
          tone: tone,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.detail || `API Error ${response.status}: Failed to generate cover letter.`);
      }

      const data = await response.json();
      const generatedLetter = data.cover_letter || data.letter || "";
      setCoverLetter(generatedLetter);

      // Silent background call to save generated document in history
      fetch(`${API_BASE_URL}/ai/save-document`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          document_type: "Cover Letter",
          job_title: jobTitle.trim() || "Cover Letter",
          content: JSON.stringify({ text: generatedLetter, company: companyName, tone })
        })
      }).catch(err => console.error("Failed to save document:", err));
    } catch (error: any) {
      console.error("Failed to generate cover letter:", error);
      setErrorMessage(error.message || "Failed to generate cover letter. Please verify that your active resume is uploaded.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!coverLetter) return;
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleDownload = () => {
    if (!coverLetter) return;
    const blob = new Blob([coverLetter], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${companyName ? `${companyName}_` : ""}Cover_Letter.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setJobDescription("");
    setCompanyName("");
    setJobTitle("");
    setTone("Professional");
    setCoverLetter(null);
    setErrorMessage(null);
    setCopied(false);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full px-2 sm:px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAF0EB]">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-[#EAF0EB] text-[#52795C] rounded-2xl shadow-sm">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <TextEffect className="text-3xl font-extrabold text-[#2D3A2F] tracking-tight" preset="fade-in-blur" speedReveal={1.1} speedSegment={0.3}>
              Cover Letter Generator
            </TextEffect>
            <p className="text-sm text-[#5C665D] mt-1">
              Craft a personalized, compelling cover letter tailored to your active resume and target role.
            </p>
          </div>
        </div>

        {coverLetter && (
          <button
            type="button"
            onClick={handleReset}
            className="self-start sm:self-center px-4 py-2 text-xs font-bold text-[#5C665D] hover:text-[#2D3A2F] bg-white border border-[#EAF0EB] hover:bg-[#F5F3EC] rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Write Another</span>
          </button>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-[#FCEAE8] text-[#B74134] p-4 rounded-2xl border border-[#F9D6D3] animate-in fade-in duration-300 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Split-Layout Interface: Left Form / Right Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Generation Form (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white border-2 border-[#EAF0EB] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D3A2F] uppercase tracking-wider block">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Google, Stripe, Netflix"
                className="w-full bg-[#FAF9F5] border-2 border-[#EAF0EB] rounded-2xl px-4 py-3 text-sm text-[#2D3A2F] placeholder-[#8A958C] focus:bg-white focus:border-[#52795C] focus:outline-none transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Job Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D3A2F] uppercase tracking-wider block">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Full Stack Engineer"
                className="w-full bg-[#FAF9F5] border-2 border-[#EAF0EB] rounded-2xl px-4 py-3 text-sm text-[#2D3A2F] placeholder-[#8A958C] focus:bg-white focus:border-[#52795C] focus:outline-none transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Tone Selector Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D3A2F] uppercase tracking-wider block">
                Tone &amp; Style
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-[#FAF9F5] border-2 border-[#EAF0EB] rounded-2xl px-4 py-3 text-sm text-[#2D3A2F] focus:bg-white focus:border-[#52795C] focus:outline-none transition-all cursor-pointer"
                disabled={isLoading}
              >
                {TONE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Job Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D3A2F] uppercase tracking-wider flex items-center justify-between">
                <span>Job Description</span>
                <span className="text-[11px] font-normal text-[#5C665D] normal-case">Required</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job requirements, qualifications, and role responsibilities here..."
                className="w-full h-56 bg-[#FAF9F5] border-2 border-[#EAF0EB] rounded-2xl p-4 text-sm text-[#2D3A2F] leading-relaxed placeholder-[#8A958C] focus:bg-white focus:border-[#52795C] focus:outline-none transition-all resize-y font-sans"
                disabled={isLoading}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              {isLoading ? (
                <div className="relative w-full py-3.5 rounded-2xl bg-[#F5F3EC] flex items-center justify-center overflow-hidden font-bold text-sm text-[#52795C] shadow-sm">
                  <BorderTrail
                    size={100}
                    style={{
                      boxShadow: '0px 0px 60px 30px rgba(82, 121, 92, 0.4), 0 0px 100px 50px rgba(0, 0, 0, 0.2)',
                    }}
                  />
                  <TextShimmer className="font-mono text-sm font-bold text-[#52795C]" duration={1.2}>
                    Drafting Tailored Cover Letter...
                  </TextShimmer>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!jobDescription.trim()}
                  className="w-full bg-[#52795C] hover:bg-[#3b5943] text-white rounded-2xl py-3.5 px-6 font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>✨ Generate Cover Letter</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Preview Container (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col">
          {!coverLetter ? (
            /* Empty State Placeholder */
            <div className="bg-white border-2 border-[#EAF0EB] rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col items-center justify-center text-center min-h-[480px] space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#F5F3EC] text-[#52795C] flex items-center justify-center shadow-xs">
                <FileText className="w-8 h-8 opacity-80" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-xl font-bold text-[#2D3A2F]">
                  Your Tailored Cover Letter Will Appear Here
                </h3>
                <p className="text-sm text-[#5C665D] leading-relaxed">
                  Fill in the company name, target role, and job description on the left, then click{" "}
                  <strong className="text-[#52795C]">Generate Cover Letter</strong> to draft an executive-grade letter.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap justify-center gap-2 text-xs text-[#8A958C]">
                <span className="bg-[#FAF9F5] border border-[#EAF0EB] px-3 py-1 rounded-full">✓ ATS-Optimized</span>
                <span className="bg-[#FAF9F5] border border-[#EAF0EB] px-3 py-1 rounded-full">✓ Aligned with Active Resume</span>
                <span className="bg-[#FAF9F5] border border-[#EAF0EB] px-3 py-1 rounded-full">✓ Recruiter-Grade STAR Tone</span>
              </div>
            </div>
          ) : (
            /* Generated Cover Letter Document Preview Card */
            <div className="bg-white border-2 border-[#EAF0EB] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
              {/* Card Top Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAF0EB]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#EAF0EB] text-[#52795C] rounded-xl shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#2D3A2F]">
                      {companyName ? `${companyName} Cover Letter` : "Generated Cover Letter"}
                    </h3>
                    <p className="text-xs text-[#5C665D]">
                      {jobTitle || "Custom Role"} • {tone} Tone
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#52795C] hover:bg-[#3b5943] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>📋 Copy to Clipboard</span>
                      </>
                    )}
                  </button>

                  {/* Download Button */}
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="p-2 text-[#5C665D] hover:text-[#2D3A2F] bg-[#FAF9F5] hover:bg-[#EAF0EB] border border-[#EAF0EB] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    title="Download as .txt"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cover Letter Content Body */}
              <div className="bg-[#FAF9F5] border border-[#EAF0EB] rounded-2xl p-6 sm:p-8 text-[#2D3A2F] leading-relaxed whitespace-pre-wrap font-serif text-sm sm:text-base shadow-inner">
                {coverLetter}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
