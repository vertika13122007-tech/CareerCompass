"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Note: If our FastAPI router for resumes has a prefix, change the URL to http://localhost:8000/resume/upload
      const response = await fetch("http://127.0.0.1:8000/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('success');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      console.error(error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-[#2D3A2F]">Upload Your Resume</h1>
        <p className="text-[#5C665D] text-lg">
          Let our AI analyze your experience and generate a personalized roadmap.
        </p>
      </div>

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
                <p className="text-[#5C665D] mt-1">{formatFileSize(file.size)} MB</p>
              </div>
              {uploadStatus !== 'success' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setUploadStatus('idle');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-sm text-[#8C938D] hover:text-[#2D3A2F] underline underline-offset-4"
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

        <div className="mt-8">
          <button
            onClick={handleUpload}
            disabled={!file || isUploading || uploadStatus === 'success'}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              !file || uploadStatus === 'success'
                ? "bg-[#F5F3EC] text-[#8C938D] cursor-not-allowed"
                : "bg-[#2D3A2F] text-white hover:bg-[#3B5942] hover:-translate-y-1 shadow-lg hover:shadow-xl"
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Uploading...
              </>
            ) : uploadStatus === 'success' ? (
              <>
                <CheckCircle className="w-6 h-6 text-[#52795C]" />
                <span className="text-[#52795C]">Upload Complete</span>
              </>
            ) : (
              "Upload Resume"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
