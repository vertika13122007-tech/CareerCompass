"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
import { CheckCircle2, MessageSquare, Map, Sparkles, Lightbulb, ArrowRight, FileText, Wand2, Loader2 } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function DashboardOverviewPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [fullResume, setFullResume] = useState<any>(null);
  const [template, setTemplate] = useState<'classic' | 'modern' | 'faang'>('modern');
  const [atsData, setAtsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeResumeName, setActiveResumeName] = useState("your active resume");

  const [targetRole, setTargetRole] = useState<{ title: string; matchScore: number; missingSkills: string[] }>({
    title: "Frontend Developer",
    matchScore: 0,
    missingSkills: []
  });
  const [isMatching, setIsMatching] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleInput, setRoleInput] = useState("");

  const [jobStats, setJobStats] = useState({
    saved: 4,
    applied: 12,
    interviewing: 2,
    offers: 0
  });

  const [activities, setActivities] = useState([
    { id: 1, type: "score", text: "AI graded active resume: 45/100", time: "2 hours ago" },
    { id: 2, type: "upload", text: "Uploaded Fake_BTech_CSE_Resume.pdf", time: "3 hours ago" },
    { id: 3, type: "chat", text: "Completed Kiki mock interview", time: "1 day ago" },
  ]);

  const contentRef = useRef<HTMLDivElement>(null);
  const handleDownload = useReactToPrint({ contentRef, documentTitle: "Saved_Tailored_Resume" });

  const fetchTargetMatch = async (roleTitle: string) => {
    setIsMatching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/target-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_role: roleTitle })
      });
      const data = await res.json();
      if (res.ok) {
        setTargetRole({
          title: roleTitle,
          matchScore: data.matchScore || 0,
          missingSkills: data.missingSkills || []
        });
      }
    } catch (error) {
      console.error("Failed to match role:", error);
    } finally {
      setIsMatching(false);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/ai/history`);
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data.history || [];
          setHistory(items.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to fetch document history:", err);
      }
    };
    fetchHistory();

    fetch(`${API_BASE_URL}/ai/current-resume`)
      .then((res) => res.json())
      .then((data) => setFullResume(data.resume))
      .catch(console.error);

    fetch(`${API_BASE_URL}/resume/all`)
      .then(res => res.json())
      .then(data => {
        const active = data.find((r: any) => r.is_active);
        if (active) setActiveResumeName(active.resume_name || "Untitled Resume");
      })
      .catch(err => console.error("Failed to fetch resume name:", err));

    const fetchAtsScore = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/ai/ats-score`);
        if (res.ok) {
          const data = await res.json();
          setAtsData(data);
        }
      } catch (err) {
        console.error("Failed to fetch ATS score:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAtsScore();
    fetchTargetMatch("Frontend Developer");
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[#52795C]"; // Green
    if (score >= 60) return "text-amber-500"; // Yellow
    return "text-[#D97757]"; // Red
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 bg-transparent">
      {/* Header */}
      <div className="pb-4 pt-4">
        <h1 className="text-4xl font-extrabold text-[#2D3A2F] tracking-tight">
          Welcome to CareerCompass
        </h1>
        <p className="text-lg text-[#5C665D] mt-2">
          Your AI-powered career command center.
        </p>
      </div>

      {/* Full-Width Dashboard Layout */}
      <div className="flex flex-col gap-8 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* 1. ATS Scoreboard Card */}
        <div className="p-8 bg-white rounded-3xl border-2 border-[#EAF0EB] shadow-sm flex flex-col md:flex-row items-center gap-10 animate-in fade-in zoom-in duration-500 min-h-[190px]">
          {loading ? (
            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-6 py-6 text-[#5C665D]">
              <Loader2 className="w-10 h-10 text-[#52795C] animate-spin" />
              <div className="text-center sm:text-left">
                <p className="text-lg font-bold text-[#2D3A2F]">Auditing Active Resume...</p>
                <p className="text-sm text-[#5C665D]">Evaluating ATS readability, impact, and formatting with AI.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Score Circle */}
              <div className="relative flex items-center justify-center w-40 h-40 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#EAF0EB]"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${getScoreColor(atsData?.score || 0)} transition-all duration-1000 ease-out`}
                    strokeWidth="3"
                    strokeDasharray={`${atsData?.score || 0}, 100`}
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-[#2D3A2F]">{atsData?.score ?? 0}</span>
                  <span className="text-sm font-bold text-[#5C665D]">/ 100</span>
                </div>
              </div>

              {/* Audit Feedback */}
              <div className="flex-1 w-full">
                <h2 className="text-2xl font-bold text-[#2D3A2F] mb-2">Resume Health: {atsData?.status || "Audit Ready"}</h2>
                <p className="text-sm text-[#5C665D] mb-5">
                  Based on: <span className="font-bold text-[#2D3A2F]">{activeResumeName}</span>
                </p>
                <ul className="space-y-3">
                  {atsData?.feedback?.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-sm font-medium text-[#2D3A2F]">
                      <span className={`mt-0.5 ${index === (atsData?.feedback?.length ?? 0) - 1 && (atsData?.score ?? 0) > 60 ? 'text-[#52795C]' : 'text-[#D97757]'}`}>
                        {index === (atsData?.feedback?.length ?? 0) - 1 && (atsData?.score ?? 0) > 60 ? '✓' : '⚠️'}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
                <Link
                  href="/dashboard/chat"
                  className="px-6 py-3 bg-[#52795C] text-white font-bold rounded-xl hover:bg-[#3b5943] transition-all shadow-sm text-center"
                >
                  Fix with AI Coach
                </Link>
                <Link
                  href="/dashboard/upload"
                  className="px-6 py-3 bg-[#F5F3EC] text-[#2D3A2F] font-bold rounded-xl hover:bg-[#EAF0EB] transition-colors text-center text-sm shadow-sm"
                >
                  Change Resume
                </Link>
              </div>
            </>
          )}
        </div>

        {/* 2. Side-by-Side Widgets Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Target Role & Skills Match */}
          <div className="p-6 bg-white rounded-3xl border-2 border-[#EAF0EB] shadow-sm flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#2D3A2F]">Target Role: {targetRole.title}</h3>
                  <p className="text-sm text-[#5C665D]">Compare your resume to your dream job.</p>
                </div>
                <button
                  onClick={() => {
                    setRoleInput(targetRole.title);
                    setIsRoleModalOpen(true);
                  }}
                  className="text-[#52795C] text-sm font-bold hover:underline cursor-pointer"
                >
                  Edit Role
                </button>
              </div>
              
              {isMatching ? (
                <div className="space-y-4 py-2 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-[#F5F3EC] h-4 rounded-full overflow-hidden">
                      <div className="bg-[#52795C]/40 h-full w-1/2 rounded-full animate-pulse"></div>
                    </div>
                    <span className="font-bold text-[#5C665D] text-sm">Analyzing match...</span>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs font-bold text-[#5C665D] uppercase tracking-wider mb-2">Analyzing keywords...</p>
                    <div className="flex gap-2">
                      <div className="h-6 w-20 bg-gray-100 rounded-lg"></div>
                      <div className="h-6 w-24 bg-gray-100 rounded-lg"></div>
                      <div className="h-6 w-16 bg-gray-100 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 bg-[#F5F3EC] h-4 rounded-full overflow-hidden">
                      <div className="bg-[#52795C] h-full rounded-full transition-all duration-500" style={{ width: `${targetRole.matchScore}%` }}></div>
                    </div>
                    <span className="font-bold text-[#2D3A2F]">{targetRole.matchScore}% Match</span>
                  </div>
                  
                  <div>
                    <p className="text-xs font-bold text-[#5C665D] uppercase tracking-wider mb-3">Missing Keywords to Add:</p>
                    {targetRole.missingSkills && targetRole.missingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {targetRole.missingSkills.map(skill => (
                          <span key={skill} className="px-3 py-1 bg-[#FDF8F6] text-[#D97757] text-xs font-bold rounded-lg border border-[#FBECE7]">
                            + {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#52795C] font-bold">✨ No critical missing skills detected for this role!</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Job Application Tracker */}
          <div className="p-6 bg-white rounded-3xl border-2 border-[#EAF0EB] shadow-sm flex flex-col justify-between">
            <h3 className="text-lg font-bold text-[#2D3A2F] mb-6">Pipeline Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Saved", count: jobStats.saved, color: "bg-gray-100 text-gray-700" },
                { label: "Applied", count: jobStats.applied, color: "bg-blue-100 text-blue-700" },
                { label: "Interviewing", count: jobStats.interviewing, color: "bg-amber-100 text-amber-700" },
                { label: "Offers", count: jobStats.offers, color: "bg-[#EAF0EB] text-[#52795C]" }
              ].map(stat => (
                <div key={stat.label} className="flex flex-col items-center justify-center p-4 bg-[#F9FAFB] rounded-2xl border border-gray-100">
                  <span className={`text-3xl font-black mb-1 ${stat.color.split(' ')[1]}`}>{stat.count}</span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Action Cards */}
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

        {/* 4. Recent Activity (Horizontal Full-Width Card) */}
        <div className="p-6 bg-white rounded-3xl border-2 border-[#EAF0EB] shadow-sm w-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-[#2D3A2F]">Recent Activity</h3>
            <span className="text-xs font-bold text-[#52795C] bg-[#F5F3EC] px-3 py-1 rounded-full">Live Feed</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4 p-4 bg-[#F9FAFB] rounded-2xl border border-gray-100 items-start">
                <div className="w-9 h-9 rounded-full bg-[#F5F3EC] flex items-center justify-center shrink-0 border-2 border-white text-[#52795C] text-sm">
                  {activity.type === 'score' ? '🎯' : activity.type === 'upload' ? '📄' : '💬'}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#2D3A2F] leading-snug">{activity.text}</p>
                  <p className="text-xs text-[#5C665D] mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-sm font-bold text-[#5C665D] hover:bg-gray-50 rounded-xl transition-all border-2 border-transparent hover:border-gray-100 cursor-pointer">
            View All Activity
          </button>
        </div>

        {/* 5. Daily Tip Section */}
        <div className="bg-[#2D3A2F] text-white rounded-3xl p-6 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-white/10 rounded-2xl flex-shrink-0 text-[#EAF0EB]">
            <Lightbulb className="w-7 h-7" />
          </div>
          <p className="text-sm font-medium leading-relaxed">
            <span className="font-bold text-[#EAF0EB]">Kiki&apos;s Tip of the Day:</span>{" "}
            Tailoring your resume for each application increases your ATS match rate by up to 40%.
          </p>
        </div>

        {/* 6. Recent Documents Section */}
        <div className="mt-2">
          <h3 className="text-2xl font-bold text-[#2D3A2F] mb-6">Recent Documents</h3>

          {history.length === 0 ? (
            <p className="text-[#5C665D] italic p-6 bg-[#F9FAFB] rounded-2xl border border-[#F5F3EC]">
              No documents saved yet. Generate a cover letter or tailor your resume to see them here!
            </p>
          ) : (
            <div className="space-y-4">
              {history.map((doc: any, idx: number) => {
                const isCoverLetter = doc.document_type?.toLowerCase().includes("cover");
                const formattedDate = doc.created_at
                  ? new Date(doc.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recent";

                return (
                  <div
                    key={doc.id || idx}
                    className="bg-white border-2 border-[#EAF0EB] rounded-2xl p-5 flex justify-between items-center hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#EAF0EB] text-[#52795C] rounded-xl flex-shrink-0">
                        {isCoverLetter ? (
                          <FileText className="w-5 h-5" />
                        ) : (
                          <Wand2 className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#2D3A2F] text-base">
                          {doc.document_type || "Document"}{" "}
                          <span className="text-xs font-normal text-[#5C665D] ml-2">
                            ({doc.job_title || "Untitled Role"})
                          </span>
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">{formattedDate}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedDoc(doc)}
                      className="bg-[#F5F3EC] text-[#52795C] px-5 py-2 rounded-xl font-bold text-sm hover:bg-[#EAF0EB] transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Visible Modal UI */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-black font-bold cursor-pointer"
            >
              ✕ Close
            </button>
            <h2 className="text-2xl font-bold text-[#2D3A2F] mb-2">{selectedDoc.job_title}</h2>
            <p className="text-[#5C665D] mb-6">{selectedDoc.document_type}</p>

            {selectedDoc.document_type === "Cover Letter" ? (
              <div className="bg-[#F9FAFB] p-6 rounded-2xl text-[#2D3A2F] whitespace-pre-wrap leading-relaxed border border-[#EAF0EB]">
                {typeof selectedDoc.content === "string"
                  ? JSON.parse(selectedDoc.content || "{}").text
                  : selectedDoc.content?.text}
              </div>
            ) : (
              <div className="bg-[#F9FAFB] p-6 rounded-2xl border border-[#EAF0EB] flex flex-col items-center text-center">
                <p className="text-[#2D3A2F] mb-6">
                  Your tailored resume changes have been loaded successfully.
                </p>

                <div className="mb-6 w-full max-w-sm">
                  <p className="text-sm font-bold text-[#5C665D] mb-2 text-left">Select Resume Style:</p>
                  <div className="flex bg-[#F5F3EC] p-1 rounded-xl">
                    <button
                      onClick={() => setTemplate('classic')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                        template === 'classic' ? 'bg-white shadow-sm text-black' : 'text-[#5C665D]'
                      }`}
                    >
                      Classic
                    </button>
                    <button
                      onClick={() => setTemplate('modern')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                        template === 'modern' ? 'bg-white shadow-sm text-[#52795C]' : 'text-[#5C665D]'
                      }`}
                    >
                      Modern
                    </button>
                    <button
                      onClick={() => setTemplate('faang')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                        template === 'faang' ? 'bg-white shadow-sm text-gray-800' : 'text-[#5C665D]'
                      }`}
                    >
                      FAANG
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  className="bg-[#52795C] text-white px-8 py-4 rounded-full font-bold hover:bg-[#3b5943] transition-all cursor-pointer"
                >
                  Download PDF Resume
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden PDF Printable Template */}
      <div className="hidden">
        <div
          ref={contentRef}
          className={`bg-white p-10 w-full max-w-[8.5in] min-h-[11in] leading-relaxed ${
            template === 'classic'
              ? 'font-serif text-black text-sm'
              : template === 'modern'
              ? 'font-sans text-[#2D3A2F] text-sm'
              : 'font-mono text-gray-900 text-xs tracking-tight'
          }`}
        >
          {fullResume && selectedDoc && selectedDoc.document_type === "Tailored Resume" && (
            <>
              <h1
                className={`text-center mb-2 ${
                  template === 'classic'
                    ? 'text-3xl font-bold uppercase'
                    : template === 'modern'
                    ? 'text-4xl font-extrabold text-[#52795C]'
                    : 'text-2xl font-bold'
                }`}
              >
                {fullResume.name || "Your Name"}
              </h1>
              <p className="text-center mb-6 text-gray-600">
                {fullResume.email} | {fullResume.phone} | {fullResume.location}
              </p>

              {fullResume.experience && fullResume.experience.length > 0 && (
                <>
                  <h2
                    className={`font-bold mt-4 mb-3 ${
                      template === 'classic'
                        ? 'text-lg border-b-2 border-black uppercase'
                        : template === 'modern'
                        ? 'text-xl border-b-2 border-[#EAF0EB] text-[#52795C]'
                        : 'text-md border-b border-gray-400 uppercase tracking-widest'
                    }`}
                  >
                    Experience
                  </h2>
                  {fullResume.experience.map((job: any, idx: number) => {
                    const safeBullets = Array.isArray(job.bullet_points || job.description)
                      ? job.bullet_points || job.description
                      : [job.bullet_points || job.description];
                    const acceptedChanges = typeof selectedDoc.content === "string"
                      ? JSON.parse(selectedDoc.content || "[]")
                      : (selectedDoc.content || []);
                    return (
                      <div key={idx} className="mb-4">
                        <div className="flex justify-between font-bold">
                          <span>
                            {job.title || job.role} — {job.company || job.organization}
                          </span>
                          <span>{job.dates}</span>
                        </div>
                        <ul className="list-disc pl-5 mt-2">
                          {safeBullets.map((bullet: string, bIdx: number) => {
                            const appliedChange = acceptedChanges.find(
                              (change: any) =>
                                typeof bullet === "string" &&
                                (bullet.includes(change.original_text) ||
                                  change.original_text.includes(bullet))
                            );
                            return (
                              <li key={bIdx} className="mb-1">
                                {appliedChange ? appliedChange.optimized_text : bullet}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </>
              )}

              {fullResume.projects && fullResume.projects.length > 0 && (
                <>
                  <h2
                    className={`font-bold mt-4 mb-3 ${
                      template === 'classic'
                        ? 'text-lg border-b-2 border-black uppercase'
                        : template === 'modern'
                        ? 'text-xl border-b-2 border-[#EAF0EB] text-[#52795C]'
                        : 'text-md border-b border-gray-400 uppercase tracking-widest'
                    }`}
                  >
                    Projects
                  </h2>
                  {fullResume.projects.map((proj: any, idx: number) => {
                    const safeBullets = Array.isArray(proj.description)
                      ? proj.description
                      : [proj.description];
                    const acceptedChanges = typeof selectedDoc.content === "string"
                      ? JSON.parse(selectedDoc.content || "[]")
                      : (selectedDoc.content || []);
                    return (
                      <div key={idx} className="mb-4">
                        <div className="font-bold">{proj.title}</div>
                        <ul className="list-disc pl-5 mt-1">
                          {safeBullets.map((bullet: string, bIdx: number) => {
                            const appliedChange = acceptedChanges.find(
                              (change: any) =>
                                typeof bullet === "string" &&
                                (bullet.includes(change.original_text) ||
                                  change.original_text.includes(bullet))
                            );
                            return (
                              <li key={bIdx} className="mb-1">
                                {appliedChange ? appliedChange.optimized_text : bullet}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Target Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[#2D3A2F] mb-2">Change Target Role</h3>
            <p className="text-sm text-[#5C665D] mb-5">Enter the specific job title you are aiming for, and AI will analyze your skill gaps.</p>
            
            <input 
              type="text" 
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              placeholder="e.g., Senior React Developer"
              className="w-full px-4 py-3 border-2 border-[#EAF0EB] rounded-xl focus:outline-none focus:border-[#52795C] text-[#2D3A2F] font-medium mb-6 transition-colors"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (roleInput && roleInput.trim() !== "") {
                    fetchTargetMatch(roleInput.trim());
                  }
                  setIsRoleModalOpen(false);
                }
              }}
            />
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsRoleModalOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-[#5C665D] hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (roleInput && roleInput.trim() !== "") {
                    fetchTargetMatch(roleInput.trim());
                  }
                  setIsRoleModalOpen(false);
                }}
                className="px-5 py-2.5 text-sm font-bold bg-[#52795C] text-white hover:bg-[#3b5943] rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Analyze Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}