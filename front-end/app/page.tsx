'use client'; 

import { useState, useRef } from 'react';

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadStatus('❌ Please upload a PDF file.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading and analyzing...');


    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/resume/upload?user_id=1', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log("Success from FastAPI:", data);
      
      setUploadStatus('✅ Resume uploaded and parsed successfully!');
      
      
    } catch (error) {
      console.error(error);
      setUploadStatus('❌ Error uploading resume. Is FastAPI running?');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center space-y-8">
        
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
            Career<span className="text-blue-600">Compass</span> AI
          </h1>
          <p className="text-xl text-gray-600">
            Upload your resume to get instant ATS scoring, personalized roadmaps, and AI career coaching.
          </p>
        </div>

        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-500" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"></path>
            </svg>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Upload your Resume (PDF)</h3>
            <p className="text-gray-500 text-sm">Select your resume to begin analysis</p>
          </div>

          {/* Hidden file input */}
          <input 
            type="file" 
            accept=".pdf" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />

          <button 
            onClick={handleButtonClick}
            disabled={isUploading}
            className={`font-medium py-3 px-8 rounded-full transition-all text-white ${
              isUploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isUploading ? 'Analyzing...' : 'Select PDF File'}
          </button>

          {/* Status Message */}
          {uploadStatus && (
            <p className={`text-sm font-medium ${uploadStatus.includes('✅') ? 'text-green-600' : uploadStatus.includes('❌') ? 'text-red-600' : 'text-blue-600'}`}>
              {uploadStatus}
            </p>
          )}

        </div>
      </div>
    </main>
  );
}