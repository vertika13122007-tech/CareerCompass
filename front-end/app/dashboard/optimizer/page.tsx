"use client";

import { useState, useEffect } from "react";
import { Sparkles, Copy, Check, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { BorderTrail } from "@/components/core/border-trail";
import { TextShimmer } from "@/components/core/text-shimmer";
import { TextEffect } from "@/components/core/text-effect";
import { AnimatedNumber } from "@/components/core/animated-number";

import { API_BASE_URL, getAuthHeaders } from "@/lib/auth";

export default function OptimizerPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedIndexes, setAppliedIndexes] = useState<number[]>([]);
  const [allApplied, setAllApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load persisted state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("careercompass_optimizer_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.jobDescription !== undefined) setJobDescription(parsed.jobDescription);
        if (parsed.result !== undefined) setResult(parsed.result);
        if (parsed.appliedIndexes !== undefined) setAppliedIndexes(parsed.appliedIndexes);
        if (parsed.allApplied !== undefined) setAllApplied(parsed.allApplied);
      } catch (err) {
        console.error("Failed to parse saved optimizer state:", err);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save state changes to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(
      "careercompass_optimizer_state",
      JSON.stringify({
        jobDescription,
        result,
        appliedIndexes,
        allApplied,
      })
    );
  }, [jobDescription, result, appliedIndexes, allApplied, isHydrated]);

  const handleReset = () => {
    setJobDescription("");
    setResult(null);
    setAppliedIndexes([]);
    setAllApplied(false);
    setError(null);
    localStorage.removeItem("careercompass_optimizer_state");
  };

  const handleOptimize = async () => {
    if (!jobDescription.trim() || isOptimizing) return;
    setIsOptimizing(true);
    setError(null);
    setAppliedIndexes([]);
    setAllApplied(false);

    try {
      const res = await fetch(`${API_BASE_URL}/ai/optimize`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ job_description: jobDescription }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || `Server returned error ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error("Optimization failed:", err);
      setError(err.message || "Failed to optimize resume");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const handleApplySingle = async (upgrade: any, idx: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/apply-optimizations`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          missing_keywords: [],
          bullet_upgrades: [{ original: upgrade.original, optimized: upgrade.optimized }],
        }),
      });
      if (res.ok) {
        setAppliedIndexes((prev) => [...prev, idx]);
      }
    } catch (err) {
      console.error("Failed to apply bullet:", err);
    }
  };

  const handleApplyAll = async () => {
    if (!result) return;
    setIsApplying(true);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/apply-optimizations`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          missing_keywords: result.missingKeywords || result.missing_keywords || [],
          bullet_upgrades: result.bulletUpgrades || [],
        }),
      });
      if (res.ok) {
        setAllApplied(true);
        setAppliedIndexes((result.bulletUpgrades || []).map((_: any, i: number) => i));
      }
    } catch (err) {
      console.error("Failed to apply all optimizations:", err);
    }
    setIsApplying(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#EAF0EB]">
        <div>
          <TextEffect className="text-3xl sm:text-4xl font-extrabold text-[#2D3A2F] tracking-tight" preset="fade-in-blur" speedReveal={1.1} speedSegment={0.3}>
            AI Resume Optimizer
          </TextEffect>
          <p className="text-[#5C665D] mt-2 text-base">
            Compare your active resume against any target job description and get recruiter-grade bullet point upgrades.
          </p>
        </div>

        {(jobDescription || result) && (
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-xs font-bold text-[#D97757] bg-[#FDF8F6] border border-[#FBECE7] hover:bg-[#FBECE7] rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            ↺ Reset Optimizer
          </button>
        )}
      </div>

      {/* Main Split-Screen Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Target Job Description (lg:col-span-5) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border-2 border-[#EAF0EB] p-6 sm:p-7 shadow-sm flex flex-col gap-4">
            <div>
              <label className="text-sm font-bold text-[#2D3A2F] block mb-1">
                Target Job Description
              </label>
              <p className="text-xs text-[#5C665D]">
                Paste the requirements, role description, or responsibilities below.
              </p>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description here (e.g., requirements, tech stack, responsibilities)..."
              className="w-full h-80 p-4 border-2 border-[#EAF0EB] rounded-2xl text-sm text-[#2D3A2F] focus:outline-none focus:border-[#52795C] transition-colors resize-none placeholder:text-gray-400 leading-relaxed font-sans"
              disabled={isOptimizing}
            />

            {isOptimizing ? (
              <div className="relative w-full py-3.5 rounded-xl bg-[#F5F3EC] flex items-center justify-center overflow-hidden font-bold text-sm text-[#52795C] shadow-sm">
                <BorderTrail
                  size={100}
                  style={{
                    boxShadow: '0px 0px 60px 30px rgba(82, 121, 92, 0.4), 0 0px 100px 50px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <TextShimmer className="font-mono text-sm font-bold text-[#52795C]" duration={1}>
                  Generating AI Magic &amp; Parsing ATS Matrix...
                </TextShimmer>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleOptimize}
                disabled={!jobDescription.trim()}
                className="w-full bg-[#52795C] hover:bg-[#3b5943] text-white font-bold py-3.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>✨ Optimize My Active Resume</span>
              </button>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3.5 rounded-xl flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Analysis & Upgrades (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Empty State */}
          {!result && !isOptimizing && (
            <div className="bg-white rounded-3xl border-2 border-[#EAF0EB] p-8 sm:p-12 shadow-sm text-center flex flex-col items-center justify-center min-h-[420px] space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#F5F3EC] flex items-center justify-center mb-2 text-[#52795C] shadow-xs">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#2D3A2F]">Ready to Boost Your Match Rate?</h3>
              <p className="text-sm text-[#5C665D] max-w-md leading-relaxed">
                Paste a target Job Description on the left. Kiki will analyze your active resume, identify missing ATS keywords, and rewrite your bullet points into quantifiable, high-impact achievements.
              </p>
            </div>
          )}

          {/* Loading State */}
          {isOptimizing && (
            <div className="bg-white rounded-3xl border-2 border-[#EAF0EB] p-8 shadow-sm flex flex-col items-center justify-center min-h-[420px] text-center space-y-3">
              <Loader2 className="w-10 h-10 text-[#52795C] animate-spin mb-2" />
              <h3 className="text-lg font-bold text-[#2D3A2F]">Analyzing &amp; Rewriting...</h3>
              <p className="text-sm text-[#5C665D] max-w-sm leading-relaxed">
                Comparing active resume against target requirements &amp; crafting recruiter-grade STAR upgrades.
              </p>
            </div>
          )}

          {/* Results State */}
          {!isOptimizing && result && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* 1. Score Boost Banner */}
              <div className="bg-[#F5F3EC] border border-[#EAF0EB] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5C665D]">
                    ATS Compatibility Boost
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-semibold text-gray-500">Current Match:</span>
                      <span className="text-2xl font-black text-[#2D3A2F] flex items-center">
                        <AnimatedNumber value={result.currentScore ?? result.match_score ?? 0} duration={1200} />%
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#52795C]" />
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-semibold text-emerald-600">Projected Match:</span>
                      <span className="text-2xl font-black text-emerald-600 flex items-center">
                        <AnimatedNumber value={result.projectedScore ?? 92} duration={1500} />%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-[#52795C] text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#52795C]/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      +{Math.max(0, (result.projectedScore ?? 92) - (result.currentScore ?? result.match_score ?? 0))}% Boost
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyAll}
                    disabled={allApplied || isApplying}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                      allApplied
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                        : "bg-[#2D3A2F] text-white hover:bg-[#1f2820]"
                    }`}
                  >
                    {allApplied ? "✓ Applied to Active Resume" : isApplying ? "Applying..." : "🚀 Apply All to Active Resume"}
                  </button>
                </div>
              </div>

              {/* 2. Missing ATS Keywords */}
              {((result.missingKeywords && result.missingKeywords.length > 0) ||
                (result.missing_keywords && result.missing_keywords.length > 0)) && (
                <div className="bg-white rounded-2xl border-2 border-[#EAF0EB] p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#2D3A2F] uppercase tracking-wider">
                      Missing ATS Keywords
                    </h3>
                    <span className="text-xs font-medium text-gray-400">
                      {(result.missingKeywords || result.missing_keywords).length} recommended
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(result.missingKeywords || result.missing_keywords).map((kw: string, index: number) => (
                      <span
                        key={index}
                        className="bg-[#FDF8F6] text-[#D97757] border border-[#FBECE7] px-3 py-1 rounded-full text-xs font-bold"
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Before & After Bullet Upgrades */}
              {result.bulletUpgrades && result.bulletUpgrades.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#2D3A2F] uppercase tracking-wider">
                      Before &amp; After Bullet Upgrades
                    </h3>
                    <span className="text-xs text-[#5C665D]">Click Copy to use or Apply directly</span>
                  </div>

                  {result.bulletUpgrades.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border-2 border-[#EAF0EB] p-5 shadow-sm space-y-3"
                    >
                      {/* Original Bullet */}
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 block mb-1">
                          Original Weak Bullet
                        </span>
                        <div className="bg-rose-50/50 text-gray-600 line-through text-sm p-3 rounded-xl border border-rose-100 leading-relaxed font-sans">
                          {item.original}
                        </div>
                      </div>

                      {/* Optimized Bullet */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#52795C]">
                            ✨ Optimized (ATS-Beating)
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleApplySingle(item, idx)}
                              disabled={appliedIndexes.includes(idx)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                appliedIndexes.includes(idx)
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                                  : "bg-[#52795C] text-white hover:bg-[#3b5943] shadow-xs"
                              }`}
                            >
                              {appliedIndexes.includes(idx) ? "✓ Applied" : "✨ Apply to Resume"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopy(item.optimized, idx)}
                              className="px-3 py-1 text-xs font-bold rounded-lg border border-[#EAF0EB] bg-white text-[#52795C] hover:bg-[#EAF0EB] transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-600">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="bg-[#F5F3EC] text-[#2D3A2F] font-semibold text-sm p-4 rounded-xl border border-[#EAF0EB] leading-relaxed">
                          {item.optimized}
                        </div>
                      </div>

                      {/* Reason */}
                      {item.reason && (
                        <p className="text-xs text-[#5C665D] italic pt-1">
                          💡 {item.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
