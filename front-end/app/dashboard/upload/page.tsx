"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, FileText, CheckCircle, AlertCircle, Eye, Check, Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { BorderTrail } from "@/components/core/border-trail";
import { TextShimmer } from "@/components/core/text-shimmer";
import { TextEffect } from "@/components/core/text-effect";

import { API_BASE_URL, getAuthHeaders, getAuthBearerHeader } from "@/lib/auth";

const loadingMessages = [
  "Uploading document... 📄",
  "Extracting raw text... 🧠",
  "Identifying technical skills... ⚙️",
  "Structuring experience timeline... ⏳",
  "Finalizing candidate profile... ✨"
];

const cleanResumeMarkdown = (text: string) => {
  if (!text) return "";
  return text
    .replace(/#{1,6}\s*/g, "") // Remove headers like #, ##, ###
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold **text** -> text
    .replace(/\*(.*?)\*/g, "$1") // Remove italic *text* -> text
    .replace(/---/g, "___________________") // Replace horizontal rules with clean lines
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1") // Convert markdown links [text](url) -> text
    .replace(/^\s*\*\s+/gm, "• "); // Convert markdown bullets * to clean dots •
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isEditing, setIsEditing] = useState(false);
  const [parsedData, setParsedData] = useState<string>("");
  const [resumes, setResumes] = useState<any[]>([]);
  const [viewingResume, setViewingResume] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const fetchResumes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/resume/all`, {
        headers: getAuthBearerHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setResumes(data);
        }
      }
    } catch (e) {
      console.error("Failed to fetch resumes:", e);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleSetActive = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/resume/${id}/activate`, {
        method: "PATCH",
        headers: getAuthBearerHeader(),
      });
      if (res.ok) {
        await fetchResumes();
      }
    } catch (e) {
      console.error("Failed to activate resume:", e);
    }
  };

  const handleDeleteResume = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/resume/${id}`, {
        method: "DELETE",
        headers: getAuthBearerHeader(),
      });
      if (res.ok) {
        setResumes((prev) => prev.filter((r) => r.id !== id));
        await fetchResumes();
      }
    } catch (e) {
      console.error("Failed to delete resume:", e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus('idle');
    }
  };

  const handleDropZoneClick = () => {
    if (uploadStatus !== 'success') {
      fileInputRef.current?.click();
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('idle');
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const targetUrl = `${API_BASE_URL}/resume/upload`;
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: getAuthBearerHeader(),
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        let extracted = data.parsed_resume || data.resume || data;

        // If data only contains message, fetch from current-resume endpoint
        if (!data.parsed_resume && !data.resume && data.message) {
          try {
            const currentRes = await fetch(`${API_BASE_URL}/ai/current-resume`, {
              headers: getAuthBearerHeader(),
            });
            if (currentRes.ok) {
              const currentData = await currentRes.json();
              extracted = currentData.resume || currentData;
            }
          } catch (currentErr) {
            console.error("Failed to fetch current-resume:", currentErr);
          }
        }

        setParsedData(JSON.stringify(extracted, null, 2));
        setUploadStatus('success');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        await fetchResumes();
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      console.error(error);
      setUploadStatus('error');
    } finally {
      clearInterval(stepInterval);
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0.00 MB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploadStatus === 'success') return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setUploadStatus('idle');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Header */}
      <div className="space-y-2">
        <TextEffect className="text-4xl font-extrabold text-[#2D3A2F]" preset="fade-in-blur" speedReveal={1.1} speedSegment={0.3}>
          Upload Your Resume
        </TextEffect>
        <p className="text-[#5C665D] text-lg">
          Let our AI analyze your experience and generate a personalized roadmap.
        </p>
      </div>

      {/* File Dropzone Input Container */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-[#EAF0EB] shadow-sm animate-in fade-in duration-300">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <div
          onClick={handleDropZoneClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
            uploadStatus === 'success' ? 'cursor-default' : 'cursor-pointer'
          } ${
            file
              ? "border-[#52795C] bg-[#EAF0EB]/50"
              : "border-[#D6D3CC] hover:border-[#52795C] hover:bg-[#FDFBF7]"
          }`}
        >
          {!file ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-[#F5F3EC] rounded-full text-[#5C665D]">
                <UploadCloud className="w-10 h-10" />
              </div>
              <div>
                <p className="text-[#2D3A2F] font-semibold text-lg">Click to upload or drag and drop</p>
                <p className="text-[#5C665D] mt-1 text-sm">PDF, DOC, or DOCX (max. 10MB)</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-full text-[#52795C] shadow-sm">
                <FileText className="w-10 h-10" />
              </div>
              <div>
                <p className="text-[#2D3A2F] font-semibold text-lg">{file.name}</p>
                <p className="text-[#5C665D] mt-1 text-sm">
                  {formatFileSize(file.size)}
                </p>
              </div>
              {uploadStatus !== 'success' && !isUploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setUploadStatus('idle');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-sm text-[#8C938D] hover:text-[#2D3A2F] underline underline-offset-4 cursor-pointer"
                >
                  Remove file
                </button>
              )}
            </div>
          )}
        </div>

        {/* Upload Status Text: Idle, Uploading, Error, or Success */}
        {uploadStatus === 'error' && (
          <div className="mt-6 flex items-center gap-2 text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100 text-sm font-medium animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>Failed to upload file. Please check file format and try again.</p>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[#EDF7F0] text-[#2E6A3E] border border-[#D1EBD9] rounded-2xl animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-[#52795C] flex-shrink-0" />
              <p className="text-sm font-bold text-[#2D3A2F]">
                Resume successfully uploaded and added to your Library!
              </p>
            </div>
            {parsedData && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-xs font-bold bg-[#52795C] hover:bg-[#3b5943] text-white rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                Review Parsed Data
              </button>
            )}
          </div>
        )}

        {/* Upload Action Button */}
        <div className="mt-8">
          {isUploading ? (
            <div className="relative w-full py-4 rounded-2xl bg-[#F5F3EC] flex items-center justify-center overflow-hidden font-bold text-sm text-[#52795C] shadow-sm">
              <BorderTrail
                size={100}
                style={{
                  boxShadow: '0px 0px 60px 30px rgba(82, 121, 92, 0.4), 0 0px 100px 50px rgba(0, 0, 0, 0.1)',
                }}
              />
              <TextShimmer className="font-mono text-sm font-bold text-[#52795C]" duration={1.2}>
                {loadingMessages[loadingStep]}
              </TextShimmer>
            </div>
          ) : (
            <button
              onClick={handleUpload}
              disabled={!file || uploadStatus === 'success'}
              className={`w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-sm ${
                !file || uploadStatus === 'success'
                  ? "bg-[#F5F3EC] text-[#8C938D] cursor-not-allowed"
                  : "bg-[#52795C] hover:bg-[#3b5943] text-white cursor-pointer"
              }`}
            >
              {uploadStatus === 'success' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-[#52795C]" />
                  <span className="text-[#52795C] font-bold">Upload Complete</span>
                </>
              ) : (
                "Upload Resume"
              )}
            </button>
          )}
        </div>
      </div>

      {/* Resume Library Section (capped at 5 recent entries) */}
      <div className="mt-12 w-full max-w-3xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#2D3A2F]">Your Resume Library</h3>
          <span className="text-xs text-[#5C665D] font-medium">
            Showing {Math.min(5, resumes.length)} of {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'}
          </span>
        </div>

        {resumes.length === 0 ? (
          <div className="p-8 bg-white border-2 border-[#EAF0EB] rounded-2xl text-center text-[#5C665D] shadow-sm">
            No resumes uploaded yet. Upload your first resume above!
          </div>
        ) : (
          <div className="grid gap-4">
            {resumes.slice(0, 5).map((resume: any) => (
              <div
                key={resume.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border-2 border-[#EAF0EB] rounded-2xl shadow-sm hover:shadow-md transition-all gap-4"
              >
                <div>
                  <h4 className="font-bold text-[#2D3A2F] text-lg">
                    {resume.resume_name || "Untitled Resume"}
                  </h4>
                  <p className="text-xs text-[#5C665D] mt-1">
                    Uploaded on {new Date(resume.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center">
                  <button
                    onClick={() => setViewingResume(resume)}
                    className="px-3.5 py-2 text-sm font-bold text-[#52795C] bg-[#F5F3EC] hover:bg-[#ebe7d9] rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  {resume.is_active ? (
                    <span className="px-3.5 py-2 bg-[#52795C] text-white text-sm font-bold rounded-xl shadow-xs flex items-center gap-1">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Active Default</span>
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleSetActive(resume.id)}
                      className="px-3.5 py-2 text-sm font-bold text-[#5C665D] hover:bg-[#F5F3EC] hover:text-[#2D3A2F] rounded-xl transition-all cursor-pointer border border-[#EAF0EB]"
                    >
                      Set as Active
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteResume(resume.id)}
                    className="p-2 text-rose-500 hover:text-white hover:bg-rose-500 bg-rose-50 border border-rose-100 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center"
                    title="Delete Resume"
                    aria-label="Delete Resume"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resume Viewer Modal */}
      {viewingResume && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col p-6 shadow-2xl border border-[#EAF0EB] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#EAF0EB]">
              <div>
                <h3 className="text-xl font-bold text-[#2D3A2F]">
                  {viewingResume.resume_name || "Untitled Resume"}
                </h3>
                <p className="text-xs text-[#5C665D] mt-0.5">
                  Uploaded on {new Date(viewingResume.created_at).toLocaleDateString()} {viewingResume.is_active && "• (Active Default)"}
                </p>
              </div>
              <button
                onClick={() => setViewingResume(null)}
                className="text-gray-400 hover:text-[#2D3A2F] text-lg font-bold px-2 py-1 rounded-xl transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-white p-6 rounded-2xl border border-gray-200 shadow-inner">
              <div className="whitespace-pre-wrap text-sm text-[#2D3A2F] font-sans leading-relaxed">
                {cleanResumeMarkdown(viewingResume.extracted_text) || "No text content available for this resume."}
              </div>
            </div>

            <div className="flex justify-end mt-4 pt-3 border-t border-[#EAF0EB]">
              <button
                onClick={() => setViewingResume(null)}
                className="px-5 py-2.5 text-sm font-bold bg-[#52795C] hover:bg-[#3b5943] text-white rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Extracted Data Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col p-6 sm:p-8 shadow-2xl border border-[#EAF0EB] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#EAF0EB]">
              <div>
                <h3 className="text-xl font-bold text-[#2D3A2F]">Review Extracted Data</h3>
                <p className="text-xs text-[#5C665D] mt-0.5">
                  AI extracted your details. You can review or adjust parsed JSON before saving.
                </p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-[#2D3A2F] text-lg font-bold px-2 py-1 rounded-xl transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mb-4">
              <textarea
                value={parsedData}
                onChange={(e) => setParsedData(e.target.value)}
                className="w-full h-80 p-4 bg-[#F9FAFB] text-[#2D3A2F] font-mono text-sm rounded-xl border border-[#EAF0EB] focus:ring-2 focus:ring-[#52795C] outline-none resize-y"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#EAF0EB]">
              <button
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 text-[#5C665D] font-bold hover:bg-[#F5F3EC] rounded-xl transition-all cursor-pointer text-sm"
              >
                Skip
              </button>
              <button
                onClick={async () => {
                  try {
                    const jsonData = JSON.parse(parsedData);
                    await fetch(`${API_BASE_URL}/ai/current-resume`, {
                      method: "PATCH",
                      headers: getAuthHeaders(),
                      body: JSON.stringify({ parsed_data: jsonData }),
                    });
                    setIsEditing(false);
                    fetchResumes();
                  } catch (e) {
                    alert("Invalid JSON format. Please check for missing commas or quotes.");
                  }
                }}
                className="px-5 py-2.5 bg-[#52795C] hover:bg-[#3b5943] text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer text-sm"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
