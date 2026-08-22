"use client";

import { useState } from "react";
import { Target, Map, BookOpen, Code, Database, BrainCircuit, Rocket, MapPin } from "lucide-react";

// Mock Data
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
  const [targetRole, setTargetRole] = useState("");
  const [timeframeValue, setTimeframeValue] = useState("6");
  const [timeframeUnit, setTimeframeUnit] = useState("Months");
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setErrorMessage(null);
    setRoadmapData(null);

    const requestedTimeframe = `${timeframeValue} ${timeframeUnit}`;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://127.0.0.1:8000/ai/roadmap", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ target_role: targetRole, timeframe: requestedTimeframe }),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        setErrorMessage(`FastAPI Error ${response.status}: ${errorDetails}`);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      
      // Use returned data if valid, else fallback to dummy data
      setRoadmapData(data.roadmap || data || dummyRoadmapData);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch roadmap");
      setRoadmapData(dummyRoadmapData);
    } finally {
      setIsLoading(false);
    }
  };

  const phases = Array.isArray(roadmapData) 
    ? roadmapData 
    : roadmapData?.phases || roadmapData?.roadmap || roadmapData?.steps || [];

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-[#F5F3EC] flex-shrink-0 px-6 pt-6">
        <div className="p-3.5 bg-[#EAF0EB] text-[#3d7b4c] rounded-full shadow-sm">
          <Map className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[#2D3A2F]">
            Your Growth Roadmap
          </h1>
          <p className="text-sm text-[#5C665D] mt-1">
            Enter your target role and let Kiki generate a customized learning plan.
          </p>
        </div>
      </div>

      {/* Target Role Input Form */}
      <div className="mt-8 px-6">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-center max-w-5xl mx-auto w-full">
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g., Senior Product Manager, Data Scientist"
            className="flex-1 bg-white border-2 border-[#F5F3EC] rounded-2xl p-4 pl-6 text-[#2D3A2F] focus:border-[#52795C] focus:outline-none transition-colors w-full"
            disabled={isLoading}
          />
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="number"
              min="1"
              value={timeframeValue}
              onChange={(e) => setTimeframeValue(e.target.value)}
              className="w-20 bg-white border-2 border-[#F5F3EC] rounded-2xl p-4 text-center text-[#2D3A2F] focus:border-[#52795C] focus:outline-none transition-colors"
              disabled={isLoading}
            />
            <select
              value={timeframeUnit}
              onChange={(e) => setTimeframeUnit(e.target.value)}
              className="bg-white border-2 border-[#F5F3EC] rounded-2xl p-4 text-[#2D3A2F] focus:border-[#52795C] focus:outline-none transition-colors cursor-pointer"
              disabled={isLoading}
            >
              <option value="Weeks">Weeks</option>
              <option value="Months">Months</option>
              <option value="Years">Years</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={!targetRole.trim() || isLoading}
            className="w-full md:w-auto rounded-full bg-[#2D3A2F] text-white px-8 py-4 font-semibold hover:bg-[#3B5942] transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {isLoading ? "Generating..." : "Generate Roadmap"}
          </button>
        </form>
      </div>

      {/* Main Content Area */}
      <div className="mt-12 flex-1 flex flex-col items-center px-6">
        {errorMessage && (
          <div className="bg-[#FCEAE8] text-[#B74134] p-4 rounded-2xl mb-8 border border-[#F9D6D3] max-w-5xl w-full">
            {errorMessage}
          </div>
        )}
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
            <div className="relative flex items-center justify-center w-20 h-20">
              <div className="absolute w-full h-full rounded-full bg-[#52795C] opacity-20 animate-ping"></div>
              <div className="absolute w-16 h-16 rounded-full bg-[#52795C] opacity-40 animate-ping" style={{ animationDelay: "200ms" }}></div>
              <Map className="w-8 h-8 text-[#52795C] relative z-10 animate-pulse" />
            </div>
            <p className="text-[#5C665D] font-medium mt-6">Analyzing skill gaps and building your path...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && phases.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500 w-full">
            <div className="max-w-md w-full p-10 rounded-3xl shadow-[0_8px_30px_rgba(214,211,204,0.4)] text-center bg-white border border-[#F5F3EC]">
              <div className="w-16 h-16 bg-[#EAF0EB] text-[#52795C] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Map className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-[#2D3A2F] mt-4">Ready to level up?</h2>
              <p className="text-[#5C665D] mt-2 leading-relaxed">
                Enter a target role above to begin your journey. Kiki will analyze your resume and craft a step-by-step roadmap to get you there.
              </p>
            </div>
          </div>
        )}

        {/* Timeline UI */}
        {!isLoading && phases.length > 0 && (
          <div className="relative w-full max-w-4xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Center Line */}
            <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 border-l-2 border-[#EAF0EB] hidden md:block"></div>
            
            <div className="space-y-12">
              {phases.map((item: any, index: number) => {
                const phaseTitle = item.topic || item.title || `Phase ${index + 1}`;
                const phaseDuration = item.time_period || item.duration || "";
                const phaseTasks = item.action_items || item.actionItems || [];
                const technologies = item.specific_technologies || [];
                const isEven = index % 2 === 0;
                return (
                  <div key={item.phase || item.title || index} className={`relative flex flex-col md:flex-row items-center w-full ${isEven ? 'md:justify-start' : 'md:justify-end'}`}>
                    
                    {/* Center Node */}
                    <div className="absolute left-1/2 top-6 -translate-x-1/2 -translate-y-1/2 hidden md:flex w-14 h-14 bg-[#EAF0EB] text-[#52795C] rounded-full items-center justify-center z-10 shadow-sm border-4 border-white">
                      <MapPin className="w-6 h-6" />
                    </div>

                    {/* Card */}
                    <div className={`w-full md:w-[45%] ${isEven ? 'md:pr-10' : 'md:pl-10'}`}>
                      <div className="bg-white border border-[#F5F3EC] rounded-3xl p-6 shadow-[0_8px_30px_rgba(214,211,204,0.4)] w-full relative z-0 transition-transform hover:-translate-y-1 duration-300">
                        {/* Mobile Node Indicator */}
                        <div className="flex md:hidden w-12 h-12 bg-[#EAF0EB] text-[#52795C] rounded-full items-center justify-center mb-4 shadow-sm">
                          <MapPin className="w-5 h-5" />
                        </div>
                        
                        <div className="text-sm font-medium text-[#5C665D] bg-[#F5F3EC] px-3 py-1 rounded-full w-fit mb-3">
                          {phaseDuration}
                        </div>
                        <h3 className="text-xl font-bold text-[#2D3A2F] mb-4">{phaseTitle}</h3>
                        <ol className="list-none pl-0 space-y-3">
                          {phaseTasks.map((action: string | any, i: number) => {
                            const actionText = typeof action === 'string' ? action : action.description || action.text || JSON.stringify(action);
                            return (
                              <li key={i} className="flex gap-3 text-[#5C665D] leading-relaxed">
                                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#EAF0EB] text-[#52795C] text-xs font-bold mt-0.5">
                                  {i + 1}
                                </span>
                                <span>{actionText}</span>
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
        )}
      </div>
    </div>
  );
}