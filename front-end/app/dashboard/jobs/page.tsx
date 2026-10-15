"use client";

import { useState, useEffect } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";
const COLUMNS = ["Saved", "Applied", "Interviewing", "Offer"];

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({ company_name: "", job_title: "", status: "Saved" });

  const handleAddJob = async () => {
    if (!newJob.company_name || !newJob.job_title) return;

    try {
      const res = await fetch(`${API_BASE_URL}/jobs/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob)
      });

      if (res.ok) {
        const addedJob = await res.json();
        setJobs([addedJob, ...jobs]); // Update UI instantly
        setIsModalOpen(false);
        setNewJob({ company_name: "", job_title: "", status: "Saved" }); // Reset form
      }
    } catch (error) {
      console.error("Failed to add job:", error);
    }
  };

  const handleStatusChange = async (jobId: number, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setJobs((prevJobs) =>
          prevJobs.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setJobs((prevJobs) => prevJobs.filter((j) => j.id !== jobId));
      }
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/jobs/all`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setJobs(data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch jobs:", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#2D3A2F] tracking-tight">Job Pipeline</h1>
          <p className="text-[#5C665D] mt-2">Track and manage your active applications.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#52795C] text-white font-bold rounded-xl shadow-sm hover:bg-[#3b5943] transition-all cursor-pointer"
        >
          + Add Job
        </button>
      </div>

      {isLoading ? (
        <p className="text-[#5C665D] font-medium">Loading your pipeline...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {COLUMNS.map((columnStatus) => {
            const columnJobs = jobs.filter((j: any) => j.status === columnStatus);

            return (
              <div
                key={columnStatus}
                className="bg-gray-50/50 rounded-2xl p-4 min-h-[500px] border border-gray-100"
              >
                <div className="flex justify-between items-center mb-4 px-2">
                  <h2 className="font-bold text-[#2D3A2F]">{columnStatus}</h2>
                  <span className="bg-white text-xs font-bold px-2 py-1 rounded-full text-[#5C665D] border border-gray-200">
                    {columnJobs.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {columnJobs.map((job: any) => (
                    <div key={job.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-bold text-[#2D3A2F] leading-tight">{job.job_title}</h3>
                          <p className="text-sm text-[#5C665D] mt-1">{job.company_name}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-gray-400 hover:text-[#D97757] text-xs font-bold px-1.5 py-0.5 rounded transition-colors"
                          title="Delete Job"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-gray-400">
                          Added {new Date(job.created_at).toLocaleDateString()}
                        </span>
                        
                        <select
                          value={job.status}
                          onChange={(e) => handleStatusChange(job.id, e.target.value)}
                          className="text-xs font-bold text-[#52795C] bg-[#F5F3EC] px-2.5 py-1.5 rounded-lg border border-[#EAF0EB] focus:outline-none focus:border-[#52795C] cursor-pointer"
                        >
                          {COLUMNS.map(col => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  {columnJobs.length === 0 && (
                    <div className="text-xs text-gray-400 italic text-center py-8">
                      No jobs in {columnStatus.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-xl font-bold text-[#2D3A2F] mb-4">Add New Application</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-bold text-[#5C665D] mb-1 block">Company Name</label>
                <input
                  type="text"
                  value={newJob.company_name}
                  onChange={(e) => setNewJob({ ...newJob, company_name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#EAF0EB] rounded-xl focus:outline-none focus:border-[#52795C]"
                  placeholder="e.g., Microsoft"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-[#5C665D] mb-1 block">Job Title</label>
                <input
                  type="text"
                  value={newJob.job_title}
                  onChange={(e) => setNewJob({ ...newJob, job_title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#EAF0EB] rounded-xl focus:outline-none focus:border-[#52795C]"
                  placeholder="e.g., Backend Engineer"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-[#5C665D] mb-1 block">Status</label>
                <select
                  value={newJob.status}
                  onChange={(e) => setNewJob({ ...newJob, status: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[#EAF0EB] rounded-xl focus:outline-none focus:border-[#52795C] bg-white"
                >
                  {COLUMNS.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 text-sm font-bold text-[#5C665D] hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAddJob}
                className="px-5 py-2 text-sm font-bold bg-[#52795C] text-white hover:bg-[#3b5943] rounded-xl"
              >
                Save Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
