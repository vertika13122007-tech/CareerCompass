"use client";

import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Wand2, Loader2, X, Check, CheckCircle2, Download, RotateCcw, Sparkles } from "lucide-react";

interface Suggestion {
  id?: string;
  section?: string;
  original_text?: string;
  original?: string;
  optimized_text?: string;
  optimized?: string;
  added_keywords?: string[];
  addedKeywords?: string[];
}

export default function TailorPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [queue, setQueue] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [acceptedChanges, setAcceptedChanges] = useState<any[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fullResume, setFullResume] = useState<any>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const handleDownload = useReactToPrint({
    contentRef: printRef,
    documentTitle: "My_Tailored_ATS_Resume",
  });

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/ai/current-resume");
        if (res.ok) {
          const data = await res.json();
          setFullResume(data.resume);
        }
      } catch (err) {
        console.error("Failed to fetch full resume:", err);
      }
    };
    fetchResume();
  }, []);

  useEffect(() => {
    if (isFinished && acceptedChanges.length > 0) {
      fetch("http://127.0.0.1:8000/ai/save-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_type: "Tailored Resume",
          job_title: "Resume Updates",
          content: JSON.stringify(acceptedChanges)
        })
      }).catch(err => console.error("Failed to save:", err));
    }
  }, [isFinished, acceptedChanges]);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/ai/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_description: jobDescription }),
      });

      if (!response.ok) {
        throw new Error("Failed to tailor resume");
      }

      const data = await response.json();
      const suggestionsArray = data.suggestions || [];
      if (suggestionsArray.length === 0) {
        setErrorMessage("No specific bullet points needed rewriting, or couldn't parse resume.");
      } else {
        setQueue(suggestionsArray);
        setTotalCount(suggestionsArray.length);
        setAcceptedChanges([]);
        setIsFinished(false);
      }
    } catch (error) {
      console.error("Error tailoring resume:", error);
      alert("Failed to generate suggestions. Please check the backend console.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = () => {
    const nextQueue = queue.slice(1);
    setQueue(nextQueue);
    if (nextQueue.length === 0) {
      setIsFinished(true);
    }
  };

  const handleAccept = () => {
    if (queue.length === 0) return;
    const currentItem = queue[0];
    setAcceptedChanges((prev) => [...prev, currentItem]);
    const nextQueue = queue.slice(1);
    setQueue(nextQueue);
    if (nextQueue.length === 0) {
      setIsFinished(true);
    }
  };

  const handleReset = () => {
    setJobDescription("");
    setQueue([]);
    setTotalCount(0);
    setAcceptedChanges([]);
    setIsFinished(false);
    setErrorMessage(null);
  };

  const currentItem = queue[0];
  const currentStep = totalCount > 0 ? totalCount - queue.length + 1 : 1;
  const originalText = currentItem?.original_text || currentItem?.original || "";
  const optimizedText = currentItem?.optimized_text || currentItem?.optimized || "";
  const addedKeywords = currentItem?.added_keywords || currentItem?.addedKeywords || [];
  const sectionName = currentItem?.section || "Experience";

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 bg-transparent">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-[#F5F3EC] flex-shrink-0 px-6 pt-6">
        <div className="p-3.5 bg-[#EAF0EB] text-[#52795C] rounded-full shadow-sm">
          <Wand2 className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[#2D3A2F]">
            Interactive Resume Tailor
          </h1>
          <p className="text-sm text-[#5C665D] mt-1">
            Review Kiki&apos;s line-by-line optimizations to beat the ATS.
          </p>
        </div>
      </div>

      <div className="mt-8 px-6 max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-[#FCEAE8] text-[#B74134] p-4 rounded-2xl border border-[#F9D6D3] mb-6 animate-in fade-in duration-300">
            {errorMessage}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500 text-center">
            <Loader2 className="w-10 h-10 text-[#52795C] animate-spin mb-4" />
            <p className="text-[#2D3A2F] font-semibold text-lg">
              Scanning ATS requirements and rewriting bullet points...
            </p>
            <p className="text-sm text-[#5C665D] mt-1">
              Extracting target keywords and enhancing impact metrics.
            </p>
          </div>
        )}

        {/* Step 1: Input (Shows if queue is empty & !isFinished) */}
        {!isLoading && queue.length === 0 && !isFinished && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-500">
            <div className="bg-white border border-[#F5F3EC] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
              <label htmlFor="job-desc" className="text-sm font-bold text-[#2D3A2F] uppercase tracking-wider">
                Target Job Description
              </label>
              <textarea
                id="job-desc"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here..."
                className="bg-white border-2 border-[#F5F3EC] rounded-3xl p-6 text-[#2D3A2F] focus:border-[#52795C] focus:outline-none w-full min-h-[200px] resize-y shadow-inner transition-colors"
                disabled={isLoading}
              />
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!jobDescription.trim() || isLoading}
                  className="bg-[#2D3A2F] text-white rounded-full px-8 py-4 font-bold hover:bg-[#3B5942] transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Wand2 className="w-5 h-5" />
                  Tailor My Resume
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: The Queue (Shows if queue.length > 0) */}
        {!isLoading && queue.length > 0 && !isFinished && currentItem && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Progress / Section Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#F5F3EC] px-6 py-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#2D3A2F]">
                  Reviewing Suggestion {currentStep} of {totalCount}
                </span>
                <div className="w-24 bg-[#F5F3EC] h-2 rounded-full overflow-hidden hidden sm:block">
                  <div
                    className="bg-[#52795C] h-full transition-all duration-300"
                    style={{ width: `${((currentStep - 1) / totalCount) * 100}%` }}
                  />
                </div>
              </div>
              <span className="bg-[#F5F3EC] text-[#5C665D] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#EDE8DE]">
                {sectionName}
              </span>
            </div>

            {/* Split View Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Left Card (Original) */}
              <div className="bg-[#F9FAFB] p-8 rounded-3xl border border-[#F5F3EC] flex flex-col justify-between shadow-sm">
                <div>
                  <div className="inline-block bg-[#F0EBE0] text-[#796352] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 border border-[#E5DEC9]">
                    Current Resume
                  </div>
                  <p className="text-[#5C665D] leading-relaxed text-base">
                    {originalText}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#F0EBE0] text-xs text-[#8C938D]">
                  Original wording from your parsed profile
                </div>
              </div>

              {/* Right Card (AI Optimized) */}
              <div className="bg-white border-2 border-[#EAF0EB] shadow-lg p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-[#EAF0EB] rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="inline-flex items-center gap-1.5 bg-[#EAF0EB] text-[#52795C] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#DCE5DE]">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI OPTIMIZED
                    </div>
                  </div>
                  <p className="text-[#2D3A2F] leading-relaxed text-base font-medium">
                    {optimizedText}
                  </p>
                </div>

                {/* Keyword Tags */}
                {addedKeywords.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-[#F5F3EC]">
                    <p className="text-xs font-bold text-[#5C665D] uppercase tracking-wider mb-2">
                      Target Keywords:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {addedKeywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="bg-[#EAF0EB] text-[#52795C] px-3 py-1 rounded-full text-xs font-bold border border-[#DCE5DE]"
                        >
                          +{keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
              <button
                type="button"
                onClick={handleReject}
                className="w-full sm:w-auto text-[#B74134] bg-white border-2 border-[#FCEAE8] hover:bg-[#FCEAE8] rounded-full px-8 py-4 font-bold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
                Reject
              </button>

              <button
                type="button"
                onClick={handleAccept}
                className="w-full sm:w-auto text-white bg-[#52795C] hover:bg-[#3B5942] rounded-full px-10 py-4 font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                Accept
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success Screen (Shows if isFinished is true) */}
        {!isLoading && isFinished && (
          <div className="flex flex-col items-center justify-center py-10 animate-in fade-in zoom-in-95 duration-500 text-center">
            <div className="bg-white border border-[#F5F3EC] rounded-3xl p-10 max-w-lg w-full shadow-[0_8px_30px_rgba(82,121,92,0.08)] flex flex-col items-center">
              <div className="w-20 h-20 bg-[#EAF0EB] text-[#52795C] rounded-full flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <h2 className="text-2xl font-extrabold text-[#2D3A2F]">
                Tailoring Complete!
              </h2>

              <p className="text-[#5C665D] mt-2 leading-relaxed text-base">
                You accepted{" "}
                <span className="font-bold text-[#52795C]">
                  {acceptedChanges.length} optimization{acceptedChanges.length === 1 ? "" : "s"}
                </span>
                .
              </p>

              {acceptedChanges.length > 0 && (
                <div
                  id="resume-summary-container"
                  className="mt-6 w-full text-left bg-[#FDFBF7] p-6 rounded-2xl border border-[#F5F3EC]"
                >
                  <p className="text-xs font-bold text-[#796352] uppercase tracking-wider mb-3">
                    Accepted Improvements:
                  </p>
                  <div className="space-y-4">
                    {acceptedChanges.map((change, idx) => {
                      const orig = change.original_text || change.original || "";
                      const opt = change.optimized_text || change.optimized || "";
                      return (
                        <div key={idx} className="p-3.5 bg-white rounded-xl border border-[#F5F3EC] text-xs">
                          <p className="font-bold text-[#2D3A2F] mb-1">{change.section || `Update ${idx + 1}`}</p>
                          <p className="text-[#B74134] line-through mb-1.5 leading-relaxed">{orig}</p>
                          <p className="text-[#52795C] font-semibold leading-relaxed">{opt}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="bg-[#2D3A2F] text-white rounded-full px-8 py-4 font-bold hover:bg-[#3B5942] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  Download Updated Resume
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[#5C665D] bg-white border border-[#F5F3EC] hover:bg-[#F5F3EC] rounded-full px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Tailor Another Job
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Hidden Full ATS Resume PDF Template */}
      <div className="hidden">
        <div ref={printRef} className="bg-white text-black p-10 font-sans w-[8.5in] min-h-[11in] text-sm leading-relaxed">
          {fullResume && (
            <>
              {/* Header */}
              <h1 className="text-3xl font-bold text-center mb-2">
                {fullResume.name || fullResume.personal_info?.name || fullResume.personal_info?.full_name || "Candidate Resume"}
              </h1>
              <p className="text-center mb-6 text-gray-600 text-xs">
                {[
                  fullResume.email || fullResume.personal_info?.email,
                  fullResume.phone || fullResume.personal_info?.phone,
                  fullResume.location || fullResume.personal_info?.location,
                  fullResume.linkedin || fullResume.personal_info?.linkedin,
                  fullResume.github || fullResume.personal_info?.github
                ].filter(Boolean).join(" | ")}
              </p>

              {/* Summary */}
              {(fullResume.summary || fullResume.professional_summary) && (
                <div className="mb-6">
                  <h2 className="text-base font-bold border-b border-black mb-2 uppercase tracking-wide">Professional Summary</h2>
                  <p className="text-xs leading-relaxed">{fullResume.summary || fullResume.professional_summary}</p>
                </div>
              )}

              {/* Experience Section (Only renders if it exists in the JSON) */}
              {fullResume.experience && fullResume.experience.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base font-bold border-b border-black mb-3 uppercase tracking-wide">Experience</h2>
                  {fullResume.experience.map((job: any, idx: number) => {
                    const jobTitle = job.title || job.role || "Role";
                    const jobCompany = job.company || job.organization || "Company";
                    const jobDates = job.dates || job.duration || "";
                    const rawBullets = job.bullet_points || job.description || [];
                    const safeBullets = Array.isArray(rawBullets) ? rawBullets : [rawBullets];

                    return (
                      <div key={idx} className="mb-4">
                        <div className="flex justify-between font-bold text-xs">
                          <span>{jobTitle} — {jobCompany}</span>
                          <span>{jobDates}</span>
                        </div>
                        <ul className="list-disc pl-5 mt-1.5 space-y-1">
                          {safeBullets.map((bullet: string, bIdx: number) => {
                            const appliedChange = acceptedChanges.find((change: any) => 
                              typeof bullet === 'string' && (bullet.includes(change.original_text || change.original) || (change.original_text || change.original)?.includes(bullet))
                            );
                            return (
                              <li key={bIdx} className="text-xs leading-relaxed mb-1">
                                {appliedChange ? (appliedChange.optimized_text || appliedChange.optimized) : bullet}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Projects Section (Maps user projects data) */}
              {fullResume.projects && fullResume.projects.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base font-bold border-b border-black mb-3 uppercase tracking-wide">Projects</h2>
                  {fullResume.projects.map((proj: any, idx: number) => {
                    const safeBullets = Array.isArray(proj.description) 
                      ? proj.description 
                      : (typeof proj.description === 'string' ? [proj.description] : (proj.bullet_points || proj.bullets || []));
                    
                    return (
                      <div key={idx} className="mb-4">
                        <div className="font-bold text-xs">{proj.title || proj.name || "Project"}</div>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          {safeBullets.map((bullet: string, bIdx: number) => {
                            // MAGIC SWAP for Projects!
                            const appliedChange = acceptedChanges.find((change: any) => 
                              typeof bullet === 'string' && (bullet.includes(change.original_text || change.original) || (change.original_text || change.original)?.includes(bullet))
                            );
                            return (
                              <li key={bIdx} className="text-xs leading-relaxed mb-1">
                                {appliedChange ? (appliedChange.optimized_text || appliedChange.optimized) : bullet}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Skills Section */}
              {(fullResume.skills || fullResume.technical_skills) && (
                <div className="mb-6">
                  <h2 className="text-base font-bold border-b border-black mb-2 uppercase tracking-wide">Technical Skills</h2>
                  <p className="text-xs leading-relaxed">
                    {Array.isArray(fullResume.skills)
                      ? fullResume.skills.join(", ")
                      : typeof fullResume.skills === "object"
                      ? Object.entries(fullResume.skills)
                          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                          .join(" | ")
                      : String(fullResume.skills || fullResume.technical_skills)}
                  </p>
                </div>
              )}

              {/* Education Section */}
              {fullResume.education && (
                <div className="mb-6">
                  <h2 className="text-base font-bold border-b border-black mb-2 uppercase tracking-wide">Education</h2>
                  {Array.isArray(fullResume.education) ? (
                    fullResume.education.map((edu: any, idx: number) => (
                      <p key={idx} className="text-xs mb-1">
                        <strong>{edu.degree || edu.qualification || "Degree"}</strong>, {edu.school || edu.institution || "Institution"} {edu.year ? `(${edu.year})` : ""}
                      </p>
                    ))
                  ) : (
                    <p className="text-xs">{String(fullResume.education)}</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
