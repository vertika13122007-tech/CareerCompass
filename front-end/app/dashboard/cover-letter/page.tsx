"use client";

import { useState } from "react";
import { FileText, Loader2, Copy, Check, RotateCcw, Sparkles } from "lucide-react";

export default function CoverLetterPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_description: jobDescription }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const generatedLetter = data.cover_letter || data.letter || "";
      setCoverLetter(generatedLetter);

      // Silent background call to save generated document
      fetch("http://127.0.0.1:8000/ai/save-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_type: "Cover Letter",
          job_title: "Generated Cover Letter",
          content: JSON.stringify({ text: generatedLetter })
        })
      }).catch(err => console.error("Failed to save:", err));
    } catch (error: any) {
      console.error("Failed to generate cover letter:", error);
      setErrorMessage(error.message || "Failed to generate cover letter. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!coverLetter) return;
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleReset = () => {
    setJobDescription("");
    setCoverLetter(null);
    setErrorMessage(null);
    setCopied(false);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 bg-transparent">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-[#F5F3EC] flex-shrink-0 px-6 pt-6">
        <div className="p-3.5 bg-[#EAF0EB] text-[#52795C] rounded-full shadow-sm">
          <FileText className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[#2D3A2F]">
            Cover Letter Generator
          </h1>
          <p className="text-sm text-[#5C665D] mt-1">
            Paste the job description and let Kiki write a highly tailored cover letter based on your resume.
          </p>
        </div>
      </div>

      <div className="mt-8 px-6 max-w-5xl mx-auto w-full flex flex-col gap-6">
        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-[#FCEAE8] text-[#B74134] p-4 rounded-2xl border border-[#F9D6D3] animate-in fade-in duration-300">
            {errorMessage}
          </div>
        )}

        {/* Input Section (Shows if coverLetter is null) */}
        {!coverLetter && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-500">
            <div className="bg-white border border-[#F5F3EC] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
              <label htmlFor="job-description-input" className="text-sm font-bold text-[#2D3A2F] uppercase tracking-wider">
                Job Description
              </label>
              <textarea
                id="job-description-input"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                className="bg-white border-2 border-[#F5F3EC] rounded-3xl p-6 text-[#2D3A2F] focus:border-[#52795C] focus:outline-none w-full min-h-[250px] resize-y shadow-inner transition-colors"
                disabled={isLoading}
              />
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!jobDescription.trim() || isLoading}
                  className="bg-[#2D3A2F] text-white rounded-full px-8 py-4 font-bold hover:bg-[#3B5942] transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Crafting Letter...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Letter
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Result Section (Shows if coverLetter exists) */}
        {coverLetter && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white border-2 border-[#EAF0EB] shadow-sm rounded-3xl p-8 sm:p-10 relative overflow-hidden">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#F5F3EC]">
                <div className="inline-flex items-center gap-2 bg-[#EAF0EB] text-[#52795C] text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Tailored Cover Letter
                </div>
                <span className="text-xs text-[#8C938D]">
                  Generated with Kiki AI
                </span>
              </div>

              {/* Cover Letter Content */}
              <div className="text-[#2D3A2F] leading-relaxed whitespace-pre-wrap font-serif text-base sm:text-lg">
                {coverLetter}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mt-10 pt-6 border-t border-[#F5F3EC]">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="bg-[#EAF0EB] text-[#52795C] hover:bg-[#DCE5DE] rounded-full px-6 py-3 font-bold flex items-center gap-2 transition-colors cursor-pointer text-sm shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#52795C]" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy to Clipboard
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[#5C665D] bg-white border border-[#F5F3EC] hover:bg-[#F5F3EC] rounded-full px-6 py-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Write Another
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
