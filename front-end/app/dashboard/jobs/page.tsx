"use client";

import { useState, useEffect } from "react";
import { Plus, Briefcase, Trash2 } from "lucide-react";
import { TextEffect } from "@/components/core/text-effect";
import { AnimatedNumber } from "@/components/core/animated-number";

const API_BASE_URL = "http://127.0.0.1:8000";
const COLUMNS = ["Saved", "Applied", "Interviewing", "Offer"];

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({ company_name: "", job_title: "", status: "Saved" });

  const fetchJobs = () => {
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
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAddJob = async () => {
    if (!newJob.company_name.trim() || !newJob.job_title.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/jobs/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob)
      });

      if (res.ok) {
        const addedJob = await res.json();
        setJobs((prev) => [addedJob, ...prev]);
        setIsModalOpen(false);
        setNewJob({ company_name: "", job_title: "", status: "Saved" });
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

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <TextEffect className="text-3xl sm:text-4xl font-extrabold text-[#2D3A2F] tracking-tight" preset="fade-in-blur" speedReveal={1.1} speedSegment={0.3}>
            Job Pipeline
          </TextEffect>
          <p className="text-[#5C665D] mt-2 text-base">
            Track and manage your active applications through every stage of your job hunt.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-auto px-5 py-3 bg-[#52795C] hover:bg-[#3b5943] text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Job</span>
        </button>
      </div>

      {/* 4-Column Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {COLUMNS.map((columnStatus) => {
          const columnJobs = jobs.filter((j: any) => j.status === columnStatus);

          return (
            <div
              key={columnStatus}
              className="bg-white/80 rounded-3xl p-4 border-2 border-[#EAF0EB] shadow-xs flex flex-col min-h-[550px] transition-all"
            >
              {/* Column Title Bar */}
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#EAF0EB] px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    columnStatus === 'Saved' ? 'bg-slate-400' :
                    columnStatus === 'Applied' ? 'bg-blue-500' :
                    columnStatus === 'Interviewing' ? 'bg-amber-500' :
                    'bg-[#52795C]'
                  }`} />
                  <h2 className="font-extrabold text-[#2D3A2F] text-base">{columnStatus}</h2>
                </div>
                <span className="bg-[#F5F3EC] text-xs font-bold px-2.5 py-1 rounded-full text-[#52795C] border border-[#EAF0EB] shadow-xs">
                  <AnimatedNumber value={columnJobs.length} />
                </span>
              </div>

              {/* Job Application Cards List */}
              <div className="space-y-3 flex-1">
                {isLoading ? (
                  <div className="space-y-3 py-2">
                    <div className="h-24 bg-[#F5F3EC]/70 rounded-2xl animate-pulse" />
                    <div className="h-24 bg-[#F5F3EC]/50 rounded-2xl animate-pulse" />
                  </div>
                ) : columnJobs.length === 0 ? (
                  <div className="text-xs text-[#8C938D] italic text-center py-12 flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-[#EAF0EB] rounded-2xl my-2">
                    <Briefcase className="w-6 h-6 text-[#D6D3CC]" />
                    <span>No jobs in {columnStatus.toLowerCase()}</span>
                  </div>
                ) : (
                  columnJobs.map((job: any) => (
                    <div
                      key={job.id}
                      className="bg-white p-4 rounded-2xl border-2 border-[#EAF0EB] shadow-sm hover:shadow-md transition-all group overflow-hidden"
                    >
                      {/* Job Header & Delete Button */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-[#2D3A2F] text-base leading-tight truncate" title={job.job_title}>
                            {job.job_title}
                          </h3>
                          <p className="text-sm font-medium text-[#5C665D] mt-0.5 truncate" title={job.company_name}>
                            {job.company_name}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Delete Job"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Status Dropdown and Date */}
                      <div className="mt-4 pt-3 border-t border-[#EAF0EB]/80 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-gray-400 shrink-0">
                          {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recent'}
                        </span>

                        <select
                          value={job.status}
                          onChange={(e) => handleStatusChange(job.id, e.target.value)}
                          className="px-2 py-1 text-xs font-bold text-[#52795C] bg-[#F5F3EC] rounded-lg border border-[#EAF0EB] focus:outline-none focus:border-[#52795C] cursor-pointer"
                        >
                          {COLUMNS.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl border border-[#EAF0EB] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#EAF0EB]">
              <h3 className="text-xl font-bold text-[#2D3A2F]">Add New Application</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-[#2D3A2F] text-lg font-bold px-2 py-1 rounded-xl transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#5C665D] mb-1.5 block">
                  Company Name
                </label>
                <input
                  type="text"
                  value={newJob.company_name}
                  onChange={(e) => setNewJob({ ...newJob, company_name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#EAF0EB] rounded-2xl focus:outline-none focus:border-[#52795C] text-[#2D3A2F] text-sm placeholder:text-gray-400"
                  placeholder="e.g., Microsoft, Google, Stripe"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#5C665D] mb-1.5 block">
                  Job Title
                </label>
                <input
                  type="text"
                  value={newJob.job_title}
                  onChange={(e) => setNewJob({ ...newJob, job_title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#EAF0EB] rounded-2xl focus:outline-none focus:border-[#52795C] text-[#2D3A2F] text-sm placeholder:text-gray-400"
                  placeholder="e.g., Senior Full Stack Engineer"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#5C665D] mb-1.5 block">
                  Status
                </label>
                <select
                  value={newJob.status}
                  onChange={(e) => setNewJob({ ...newJob, status: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#EAF0EB] rounded-2xl focus:outline-none focus:border-[#52795C] bg-white text-[#2D3A2F] text-sm cursor-pointer"
                >
                  {COLUMNS.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#EAF0EB]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-[#5C665D] hover:bg-[#F5F3EC] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddJob}
                disabled={!newJob.company_name.trim() || !newJob.job_title.trim()}
                className="px-5 py-2.5 text-sm font-bold bg-[#52795C] hover:bg-[#3b5943] text-white rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
