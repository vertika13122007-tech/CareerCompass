"use client";

import { useState } from "react";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";

export default function OptimizerPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    
    setErrorMessage(null);
    setIsLoading(true);
    setResults(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_description: jobDescription }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (error: any) {
      console.error("Failed to analyze:", error);
      setErrorMessage(error.message || "Failed to analyze resume");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 bg-transparent">
      
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-[#F5F3EC] flex-shrink-0 px-6 pt-6">
        <div className="p-3.5 bg-[#EAF0EB] text-[#52795C] rounded-full shadow-sm">
          <Sparkles className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[#2D3A2F]">
            Resume Optimizer
          </h1>
          <p className="text-sm text-[#5C665D] mt-1">
            Paste a job description below to see how well your resume matches and get optimization tips.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-8 px-6 max-w-5xl mx-auto w-full flex flex-col gap-8">
        
        {/* Input Section */}
        <div className="flex flex-col gap-4">
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            className="bg-white border-2 border-[#F5F3EC] rounded-3xl p-6 text-[#2D3A2F] focus:border-[#52795C] focus:outline-none w-full min-h-[200px] resize-y shadow-sm transition-colors"
            disabled={isLoading}
          />
          <div className="flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={!jobDescription.trim() || isLoading}
              className="bg-[#2D3A2F] text-white rounded-full px-8 py-4 font-bold hover:bg-[#3B5942] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze Match
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error State */}
        {errorMessage && (
          <div className="bg-[#FCEAE8] text-[#B74134] p-4 rounded-2xl border border-[#F9D6D3] animate-in fade-in duration-300">
            {errorMessage}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 animate-in fade-in duration-500">
            <Loader2 className="w-10 h-10 text-[#52795C] animate-spin mb-4" />
            <p className="text-[#5C665D] font-medium">Scanning for keywords and ATS compatibility...</p>
          </div>
        )}

        {/* Results Section */}
        {!isLoading && results && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Top Row: Score & Missing Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Score Card */}
              <div className="bg-white border border-[#F5F3EC] rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center col-span-1">
                <p className="text-sm font-bold text-[#5C665D] uppercase tracking-wider mb-2">Match Score</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-extrabold text-[#2D3A2F]">
                    {results.match_score ?? results.score ?? 0}
                  </span>
                  <span className="text-2xl font-bold text-[#5C665D]">%</span>
                </div>
              </div>

              {/* Missing Keywords Card */}
              <div className="bg-white border border-[#F5F3EC] rounded-3xl p-8 shadow-sm col-span-1 md:col-span-2">
                <h3 className="text-lg font-bold text-[#2D3A2F] mb-4">Missing Keywords</h3>
                <p className="text-sm text-[#5C665D] mb-4">
                  Consider adding these skills to your resume if you have experience with them:
                </p>
                <div className="flex flex-wrap gap-2">
                  {(results.missing_keywords || results.missingKeywords || []).map((keyword: string, index: number) => (
                    <span 
                      key={index}
                      className="bg-[#FCEAE8] text-[#B74134] px-4 py-1.5 rounded-full text-sm font-bold shadow-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Actionable Improvements Card */}
            <div className="bg-white border border-[#F5F3EC] rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-[#2D3A2F] mb-6">Actionable Improvements</h3>
              <ul className="space-y-4">
                {(results.improvements || []).map((improvement: string, index: number) => (
                  <li key={index} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <ArrowRight className="w-5 h-5 text-[#52795C]" />
                    </div>
                    <p className="text-[#5C665D] leading-relaxed font-medium">
                      {improvement}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
