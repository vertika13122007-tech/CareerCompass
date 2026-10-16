"use client";

import { useState, useEffect } from "react";
import {
  Map,
  BookOpen,
  Code,
  Database,
  BrainCircuit,
  Rocket,
  MapPin,
  Check,
  Plus,
  X,
  Sparkles,
} from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

// Fallback Mock Data
const dummyRoadmapData = [
  {
    phase: 1,
    title: "Phase 1: Python & Math Foundations",
    timeframe: "Weeks 1-4",
    icon: BookOpen,
    actionItems: [
      "Master Python basics and data structures",
      "Learn essential Linear Algebra and Calculus",
      "Understand Probability and Statistics basics",
    ],
  },
  {
    phase: 2,
    title: "Phase 2: EDA & Wrangling",
    timeframe: "Weeks 5-8",
    icon: Code,
    actionItems: [
      "Master Pandas and NumPy for data manipulation",
      "Learn data visualization with Matplotlib and Seaborn",
      "Practice cleaning real-world messy datasets",
    ],
  },
  {
    phase: 3,
    title: "Phase 3: Machine Learning",
    timeframe: "Weeks 9-14",
    icon: Database,
    actionItems: [
      "Implement supervised learning algorithms (Regression, Classification)",
      "Explore unsupervised learning (Clustering, PCA)",
      "Master model evaluation and hyperparameter tuning with scikit-learn",
    ],
  },
  {
    phase: 4,
    title: "Phase 4: Deep Learning & Big Data",
    timeframe: "Weeks 15-20",
    icon: BrainCircuit,
    actionItems: [
      "Learn Neural Networks fundamentals with PyTorch or TensorFlow",
      "Understand CNNs for images and RNNs/Transformers for text",
      "Introduction to Big Data tools (Spark, Hadoop)",
    ],
  },
  {
    phase: 5,
    title: "Phase 5: MLOps & Portfolio",
    timeframe: "Weeks 21-24",
    icon: Rocket,
    actionItems: [
      "Learn model deployment (Flask/FastAPI, Docker)",
      "Understand version control for ML (DVC, MLflow)",
      "Build and deploy an end-to-end capstone project",
    ],
  },
];

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [activeRoadmapId, setActiveRoadmapId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [durationNum, setDurationNum] = useState(3);
  const [durationUnit, setDurationUnit] = useState("Months");
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Persistent State: Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("careercompass_multiroadmaps_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.roadmaps)) {
          setRoadmaps(parsed.roadmaps);
          if (
            parsed.activeRoadmapId &&
            parsed.roadmaps.some((r: any) => r.id === parsed.activeRoadmapId)
          ) {
            setActiveRoadmapId(parsed.activeRoadmapId);
            setIsCreatingNew(false);
          } else if (parsed.roadmaps.length > 0) {
            setActiveRoadmapId(parsed.roadmaps[0].id);
            setIsCreatingNew(false);
          } else {
            setIsCreatingNew(true);
          }
        } else {
          setIsCreatingNew(true);
        }
      } catch (err) {
        console.error("Failed to parse saved multi-roadmaps state:", err);
        setIsCreatingNew(true);
      }
    } else {
      setIsCreatingNew(true);
    }
    setIsHydrated(true);
  }, []);

  // 1. Persistent State: Sync to localStorage whenever roadmaps or active ID changes
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(
      "careercompass_multiroadmaps_v1",
      JSON.stringify({
        roadmaps,
        activeRoadmapId,
      })
    );
  }, [roadmaps, activeRoadmapId, isHydrated]);

  // Handle roadmap generation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    const requestedTimeframe = `${durationNum} ${durationUnit}`;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    try {
      const response = await fetch(`${API_BASE_URL}/ai/roadmap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ target_role: targetRole.trim(), timeframe: requestedTimeframe }),
      });

      let returnedPhases: any = dummyRoadmapData;
      if (response.ok) {
        const data = await response.json();
        returnedPhases = data.roadmap || data.phases || data || dummyRoadmapData;
      } else {
        const errorDetails = await response.text();
        console.warn("Roadmap API error, using fallback dummy data:", errorDetails);
        returnedPhases = dummyRoadmapData;
      }

      const newId = Date.now().toString();
      const newRoadmap = {
        id: newId,
        targetRole: targetRole.trim(),
        timeframe: requestedTimeframe,
        durationNum,
        durationUnit,
        phases: Array.isArray(returnedPhases)
          ? returnedPhases
          : returnedPhases?.phases || returnedPhases?.steps || dummyRoadmapData,
        completedSteps: [],
        createdAt: new Date().toISOString(),
      };

      setRoadmaps((prev) => [...prev, newRoadmap]);
      setActiveRoadmapId(newId);
      setIsCreatingNew(false);
      setTargetRole("");
    } catch (err) {
      console.error(err);
      // Fallback on network error so user can still see the generated roadmap
      const newId = Date.now().toString();
      const newRoadmap = {
        id: newId,
        targetRole: targetRole.trim(),
        timeframe: requestedTimeframe,
        durationNum,
        durationUnit,
        phases: dummyRoadmapData,
        completedSteps: [],
        createdAt: new Date().toISOString(),
      };
      setRoadmaps((prev) => [...prev, newRoadmap]);
      setActiveRoadmapId(newId);
      setIsCreatingNew(false);
      setTargetRole("");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete roadmap tab
  const handleDeleteRoadmap = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const nextRoadmaps = roadmaps.filter((r) => r.id !== id);
    setRoadmaps(nextRoadmaps);

    if (activeRoadmapId === id) {
      if (nextRoadmaps.length > 0) {
        setActiveRoadmapId(nextRoadmaps[0].id);
        setIsCreatingNew(false);
      } else {
        setActiveRoadmapId(null);
        setIsCreatingNew(true);
      }
    }
  };

  // Toggle interactive milestone step completion
  const toggleStep = (stepKey: string) => {
    if (!activeRoadmapId) return;
    setRoadmaps((prev) =>
      prev.map((r) => {
        if (r.id !== activeRoadmapId) return r;
        const steps: string[] = r.completedSteps || [];
        const nextSteps = steps.includes(stepKey)
          ? steps.filter((k) => k !== stepKey)
          : [...steps, stepKey];
        return { ...r, completedSteps: nextSteps };
      })
    );
  };

  // Active roadmap object & derived progress
  const activeRoadmap = roadmaps.find((r) => r.id === activeRoadmapId);
  const activePhases = Array.isArray(activeRoadmap?.phases)
    ? activeRoadmap.phases
    : activeRoadmap?.phases?.phases ||
      activeRoadmap?.phases?.roadmap ||
      activeRoadmap?.phases?.steps ||
      [];

  const activeCompletedSteps = activeRoadmap?.completedSteps || [];

  const totalSteps = activePhases.reduce((acc: number, p: any) => {
    const tasks = p.action_items || p.actionItems || [];
    return acc + tasks.length;
  }, 0);

  const validCompletedCount = activePhases.reduce((acc: number, p: any, pIdx: number) => {
    const tasks = p.action_items || p.actionItems || [];
    const countInPhase = tasks.filter((_: any, sIdx: number) =>
      activeCompletedSteps.includes(`${pIdx}-${sIdx}`)
    ).length;
    return acc + countInPhase;
  }, 0);

  const progressPercentage =
    totalSteps > 0 ? Math.round((validCompletedCount / totalSteps) * 100) : 0;

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16 bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-[#F5F3EC] flex-shrink-0 px-6 pt-6">
        <div className="p-3.5 bg-[#EAF0EB] text-[#52795C] rounded-full shadow-sm">
          <Map className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[#2D3A2F]">Your Growth Roadmap</h1>
          <p className="text-sm text-[#5C665D] mt-1">
            Explore personalized learning paths, track milestone progress, and master key competencies.
          </p>
        </div>
      </div>

      {/* Multi-Tab Navigation Bar */}
      <div className="px-6 pt-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none max-w-5xl mx-auto">
          {roadmaps.map((r) => {
            const isActive = r.id === activeRoadmapId && !isCreatingNew;
            return (
              <button
                key={r.id}
                onClick={() => {
                  setActiveRoadmapId(r.id);
                  setIsCreatingNew(false);
                }}
                className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-2 shadow-sm ${
                  isActive
                    ? "bg-[#52795C] text-white border-[#52795C] shadow-md"
                    : "bg-white text-[#2D3A2F] border-[#EAF0EB] hover:border-[#52795C]/40 hover:bg-[#F5F3EC]"
                }`}
              >
                <span>{r.targetRole}</span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-[#F5F3EC] text-[#5C665D]"
                  }`}
                >
                  {r.timeframe}
                </span>
                <span
                  onClick={(e) => handleDeleteRoadmap(e, r.id)}
                  title="Delete roadmap"
                  className={`ml-1 p-0.5 rounded-full hover:bg-black/10 transition-colors ${
                    isActive ? "text-white/80 hover:text-white" : "text-gray-400 hover:text-red-500"
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setIsCreatingNew(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-2 shadow-sm ${
              isCreatingNew
                ? "bg-[#2D3A2F] text-white border-[#2D3A2F]"
                : "bg-white text-[#52795C] border-dashed border-[#52795C]/50 hover:bg-[#EAF0EB]/50"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>New Roadmap</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center px-6 mt-6">
        {errorMessage && (
          <div className="bg-[#FCEAE8] text-[#B74134] p-4 rounded-2xl mb-8 border border-[#F9D6D3] max-w-5xl w-full text-sm">
            {errorMessage}
          </div>
        )}

        {/* Loading State during generation */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-500">
            <div className="relative flex items-center justify-center w-20 h-20">
              <div className="absolute w-full h-full rounded-full bg-[#52795C] opacity-20 animate-ping"></div>
              <div
                className="absolute w-16 h-16 rounded-full bg-[#52795C] opacity-40 animate-ping"
                style={{ animationDelay: "200ms" }}
              ></div>
              <Map className="w-8 h-8 text-[#52795C] relative z-10 animate-pulse" />
            </div>
            <p className="text-[#5C665D] font-medium mt-6">
              Analyzing skill gaps and building your personalized roadmap...
            </p>
          </div>
        )}

        {/* View 1: Creator View (Form) */}
        {!isLoading && (isCreatingNew || roadmaps.length === 0) && (
          <div className="w-full max-w-3xl mx-auto py-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white rounded-3xl border-2 border-[#EAF0EB] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[#2D3A2F]">Generate a New Roadmap</h2>
                  <p className="text-sm text-[#5C665D] mt-1">
                    Enter your target role and timeline to craft a personalized milestone plan.
                  </p>
                </div>
                {roadmaps.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="text-xs font-bold text-[#5C665D] hover:text-[#2D3A2F] px-3 py-1.5 rounded-xl border border-[#EAF0EB] hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-[#2D3A2F] block mb-2">Target Role</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g., Senior Full Stack Engineer, Machine Learning Specialist"
                    className="w-full bg-white border-2 border-[#EAF0EB] rounded-2xl p-4 text-[#2D3A2F] text-sm focus:border-[#52795C] focus:outline-none transition-colors"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-[#2D3A2F] block mb-2">Duration</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={durationNum}
                      onChange={(e) => setDurationNum(Number(e.target.value) || 1)}
                      className="w-full bg-white border-2 border-[#EAF0EB] rounded-2xl p-4 text-[#2D3A2F] text-sm focus:border-[#52795C] focus:outline-none transition-colors"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-[#2D3A2F] block mb-2">Time Unit</label>
                    <select
                      value={durationUnit}
                      onChange={(e) => setDurationUnit(e.target.value)}
                      className="w-full bg-white border-2 border-[#EAF0EB] rounded-2xl p-4 text-[#2D3A2F] text-sm focus:border-[#52795C] focus:outline-none transition-colors cursor-pointer"
                      disabled={isLoading}
                    >
                      <option value="Weeks">Weeks</option>
                      <option value="Months">Months</option>
                      <option value="Years">Years</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!targetRole.trim() || isLoading}
                    className="w-full rounded-2xl bg-[#52795C] text-white p-4 font-bold hover:bg-[#3B5942] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Roadmap</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View 2: Active Roadmap View */}
        {!isLoading && !isCreatingNew && activeRoadmap && (
          <div className="w-full max-w-4xl mx-auto py-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Overall Progress Banner */}
            <div className="rounded-2xl border border-[#EAF0EB] p-5 mb-8 bg-white shadow-sm w-full">
              <div className="flex justify-between items-center mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#2D3A2F]">
                    Roadmap Progress: {validCompletedCount} of {totalSteps} milestones completed ({progressPercentage}%)
                  </span>
                </div>
                <span className="text-xs font-bold text-[#52795C]">
                  {progressPercentage === 100 ? "🎉 All Completed!" : `${progressPercentage}%`}
                </span>
              </div>
              <div className="w-full bg-[#EAF0EB] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#52795C] h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Alternating Vertical Timeline */}
            <div className="relative w-full">
              {/* Center Line */}
              <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 border-l-2 border-[#EAF0EB] hidden md:block"></div>

              <div className="space-y-12">
                {activePhases.map((item: any, index: number) => {
                  const phaseTitle = item.topic || item.title || `Phase ${index + 1}`;
                  const phaseDuration =
                    item.time_period || item.duration || item.timeframe || "";
                  const phaseTasks = item.action_items || item.actionItems || [];
                  const isEven = index % 2 === 0;

                  // Check if all steps in this phase are completed
                  const isPhaseCompleted =
                    phaseTasks.length > 0 &&
                    phaseTasks.every((_: any, i: number) =>
                      activeCompletedSteps.includes(`${index}-${i}`)
                    );

                  return (
                    <div
                      key={item.phase || item.title || index}
                      className={`relative flex flex-col md:flex-row items-center w-full ${
                        isEven ? "md:justify-start" : "md:justify-end"
                      }`}
                    >
                      {/* Center Node / Pin */}
                      <div
                        className={`absolute left-1/2 top-6 -translate-x-1/2 -translate-y-1/2 hidden md:flex w-14 h-14 rounded-full items-center justify-center z-10 shadow-sm border-4 border-white transition-all duration-300 ${
                          isPhaseCompleted
                            ? "bg-[#52795C] text-white shadow-md scale-105"
                            : "bg-[#EAF0EB] text-[#52795C]"
                        }`}
                      >
                        {isPhaseCompleted ? (
                          <Check className="w-6 h-6 stroke-[3]" />
                        ) : (
                          <MapPin className="w-6 h-6" />
                        )}
                      </div>

                      {/* Card */}
                      <div className={`w-full md:w-[45%] ${isEven ? "md:pr-10" : "md:pl-10"}`}>
                        <div className="bg-white border border-[#F5F3EC] rounded-3xl p-6 shadow-[0_8px_30px_rgba(214,211,204,0.4)] w-full relative z-0 transition-transform hover:-translate-y-1 duration-300">
                          {/* Mobile Node Indicator */}
                          <div
                            className={`flex md:hidden w-12 h-12 rounded-full items-center justify-center mb-4 shadow-sm transition-all duration-300 ${
                              isPhaseCompleted
                                ? "bg-[#52795C] text-white"
                                : "bg-[#EAF0EB] text-[#52795C]"
                            }`}
                          >
                            {isPhaseCompleted ? (
                              <Check className="w-5 h-5 stroke-[3]" />
                            ) : (
                              <MapPin className="w-5 h-5" />
                            )}
                          </div>

                          {/* Timeframe pill & Completed badge */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {phaseDuration && (
                              <div className="text-sm font-medium text-[#5C665D] bg-[#F5F3EC] px-3 py-1 rounded-full w-fit">
                                {phaseDuration}
                              </div>
                            )}
                            {isPhaseCompleted && (
                              <span className="text-xs font-bold text-[#52795C] bg-[#EAF0EB] px-2.5 py-1 rounded-full border border-[#D5E3D7] flex items-center gap-1 animate-in fade-in duration-300">
                                <Check className="w-3 h-3 stroke-[3]" /> Completed
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-[#2D3A2F] mb-4">{phaseTitle}</h3>

                          {/* Interactive Step Circles */}
                          <ol className="list-none pl-0 space-y-3">
                            {phaseTasks.map((action: string | any, i: number) => {
                              const actionText =
                                typeof action === "string"
                                  ? action
                                  : action.description || action.text || JSON.stringify(action);
                              const stepKey = `${index}-${i}`;
                              const isStepCompleted = activeCompletedSteps.includes(stepKey);

                              return (
                                <li
                                  key={i}
                                  onClick={() => toggleStep(stepKey)}
                                  className="flex gap-3 text-[#5C665D] leading-relaxed cursor-pointer select-none group items-start"
                                  title={
                                    isStepCompleted
                                      ? "Click to mark incomplete"
                                      : "Click to mark completed"
                                  }
                                >
                                  <span
                                    className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mt-0.5 transition-all duration-200 ${
                                      isStepCompleted
                                        ? "bg-[#52795C] text-white shadow-sm"
                                        : "bg-[#EAF0EB] text-[#52795C] group-hover:bg-[#d8e5da]"
                                    }`}
                                  >
                                    {isStepCompleted ? (
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    ) : (
                                      i + 1
                                    )}
                                  </span>
                                  <span
                                    className={`transition-all duration-200 ${
                                      isStepCompleted
                                        ? "line-through text-gray-400"
                                        : "text-[#5C665D] group-hover:text-[#2D3A2F]"
                                    }`}
                                  >
                                    {actionText}
                                  </span>
                                </li>
                              );
                            })}
                          </ol>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}