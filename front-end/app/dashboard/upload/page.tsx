"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from 'next/navigation';

const API_BASE_URL = "http://127.0.0.1:8000";

const loadingMessages = [
  "Uploading document... 📄",
  "Extracting raw text... 🧠",
  "Identifying technical skills... ⚙️",
  "Structuring experience timeline... ⏳",
  "Finalizing candidate profile... ✨"
];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isEditing, setIsEditing] = useState(false);
  const [parsedData, setParsedData] = useState<string>("");
  const [resumes, setResumes] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const fetchResumes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/resume/all`);
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
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
      });
      if (res.ok) {
        await fetchResumes();
      }
    } catch (e) {
      console.error("Failed to activate resume:", e);
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
      console.log("🚀 Attempting to fetch:", targetUrl);

      const response = await fetch(targetUrl, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        let extracted = data.parsed_resume || data.resume || data;

        // If data only contains message, fetch from current-resume endpoint
        if (!data.parsed_resume && !data.resume && data.message) {
          try {
            const currentRes = await fetch(`${API_BASE_URL}/ai/current-resume`);
            if (currentRes.ok) {
              const currentData = await currentRes.json();
              extracted = currentData.resume || currentData;
            }
          } catch (e) {
            console.error("Could not fetch current resume:", e);
          }
        }

        setParsedData(JSON.stringify(extracted, null, 2));
        setIsEditing(true);
        setUploadStatus('success');
        fetchResumes();
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
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-[#2D3A2F]">Upload Your Resume</h1>
        <p className="text-[#5C665D] text-lg">
          Let our AI analyze your experience and generate a personalized roadmap.
        </p>
      </div>

      {isEditing ? (
        <div className="mt-8 p-8 bg-white rounded-3xl border-2 border-[#EAF0EB] shadow-sm w-full max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-[#2D3A2F]">Review Extracted Data</h3>
            <span className="text-xs font-bold bg-[#F5F3EC] text-[#52795C] px-3 py-1 rounded-full">AI Confidence: High</span>
          </div>
          <p className="text-sm text-[#5C665D] mb-4">
            Our AI extracted the following details from your resume. Please review and fix any mislabeled sections (like moving "projects" to "experience") before finalizing.
          </p>
          <textarea
            value={parsedData}
            onChange={(e) => setParsedData(e.target.value)}
            className="w-full h-[400px] p-4 bg-[#F9FAFB] text-[#2D3A2F] font-mono text-sm rounded-xl border border-[#EAF0EB] focus:ring-2 focus:ring-[#52795C] outline-none resize-y"
          />
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => {
                setIsEditing(false);
                router.push('/dashboard');
              }}
              className="px-6 py-3 text-[#5C665D] font-bold hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
            >
              Skip
            </button>
            <button
              onClick={async () => {
                try {
                  const jsonData = JSON.parse(parsedData);
                  await fetch(`${API_BASE_URL}/ai/current-resume`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ parsed_data: jsonData }),
                  });
                  setIsEditing(false);
                  router.push('/dashboard');
                } catch (e) {
                  alert("Invalid JSON format. Please check for missing commas or quotes.");
                }
              }}
              className="px-6 py-3 bg-[#52795C] text-white font-bold rounded-xl hover:bg-[#3b5943] transition-all shadow-sm cursor-pointer"
            >
              Confirm & Save
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgba(214,211,204,0.4)] border border-[#F5F3EC]">
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
                ? "border-[#52795C] bg-[#EAF0EB]"
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
                  <p className="text-[#5C665D] mt-1">PDF, DOC, or DOCX (max. 10MB)</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white rounded-full text-[#52795C] shadow-sm">
                  <FileText className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-[#2D3A2F] font-semibold text-lg">{file.name}</p>
                  <p className="text-[#5C665D] mt-1">
                    <span className="text-sm font-medium text-[#5C665D]">
                      {file ? formatFileSize(file.size) : '0.00 MB'}
                    </span>
                  </p>
                </div>
                {uploadStatus !== 'success' && (
                  <button
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

          {uploadStatus === 'error' && (
            <div className="mt-6 flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">Failed to upload file. Please try again.</p>
            </div>
          )}

          {isUploading ? (
            <div className="mt-8 flex flex-col items-center justify-center p-8 bg-[#F9FAFB] rounded-3xl border-2 border-[#EAF0EB] shadow-sm w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-300">
              <div className="w-12 h-12 border-4 border-[#EAF0EB] border-t-[#52795C] rounded-full animate-spin mb-6"></div>
              <p className="text-lg font-bold text-[#2D3A2F] animate-pulse text-center">
                {loadingMessages[loadingStep]}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-6 overflow-hidden">
                <div
                  className="bg-[#52795C] h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <button
                onClick={handleUpload}
                disabled={!file || uploadStatus === 'success'}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                  !file || uploadStatus === 'success'
                    ? "bg-[#F5F3EC] text-[#8C938D] cursor-not-allowed"
                    : "bg-[#2D3A2F] text-white hover:bg-[#3B5942] hover:-translate-y-1 shadow-lg hover:shadow-xl cursor-pointer"
                }`}
              >
                {uploadStatus === 'success' ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-[#52795C]" />
                    <span className="text-[#52795C]">Upload Complete</span>
                  </>
                ) : (
                  "Upload Resume"
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Resume Library Section */}
      <div className="mt-12 w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h3 className="text-xl font-bold text-[#2D3A2F] mb-4">Your Resume Library</h3>
        {resumes.length === 0 ? (
          <div className="p-6 bg-white border-2 border-[#EAF0EB] rounded-2xl text-center text-[#5C665D]">
            No resumes uploaded yet. Upload your first resume above!
          </div>
        ) : (
          <div className="grid gap-4">
            {resumes.slice(0, 5).map((resume: any) => (
              <div key={resume.id} className="flex items-center justify-between p-5 bg-white border-2 border-[#EAF0EB] rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div>
                  <h4 className="font-bold text-[#2D3A2F] text-lg">
                    {resume.resume_name || "Untitled Resume"}
                  </h4>
                  <p className="text-xs text-[#5C665D] mt-1">
                    Uploaded on {new Date(resume.created_at).toLocaleDateString()}
                  </p>
                </div>
                {resume.is_active ? (
                  <span className="px-4 py-2 bg-[#F5F3EC] text-[#52795C] text-sm font-bold rounded-xl border border-[#EAF0EB]">
                    Active Default
                  </span>
                ) : (
                  <button 
                    onClick={() => handleSetActive(resume.id)}
                    className="px-4 py-2 text-sm font-bold text-[#5C665D] hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                  >
                    Set as Active
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
