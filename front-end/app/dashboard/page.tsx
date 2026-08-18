import { Check, AlertCircle } from "lucide-react";

export default function DashboardOverview() {
  const strengths = [
    "Strong impact-driven bullet points",
    "Clear progressive career trajectory",
    "Excellent quantifiable achievements"
  ];

  const actionItems = [
    "Missing key cloud technologies (AWS, Docker)",
    "Summary section is too generic"
  ];

  const coreSkills = ["React", "TypeScript", "Node.js", "PostgreSQL", "Next.js", "Tailwind CSS"];
  const missingKeywords = ["Docker", "AWS", "CI/CD", "GraphQL"];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Area */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[#2D3A2F]">Resume Analysis Complete</h1>
        <p className="text-[#5C665D] text-lg">
          Here is how your resume aligns with top industry standards.
        </p>
      </div>

      {/* Top Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Card 1: ATS Score */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(214,211,204,0.4)] p-8 flex flex-col items-center justify-center text-center border border-[#F5F3EC]">
          <h2 className="text-[#5C665D] font-semibold mb-6">Overall ATS Match</h2>
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-[#F5F3EC]"
              />
              {/* Progress Circle (85%) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset="37.68"
                strokeLinecap="round"
                className="text-[#52795C]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-[#2D3A2F]">85<span className="text-2xl text-[#5C665D]">%</span></span>
            </div>
          </div>
          <p className="text-[#52795C] font-medium mt-6 bg-[#EAF0EB] px-4 py-1.5 rounded-full text-sm">Highly Competitive</p>
        </div>

        {/* Card 2: Strengths */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(214,211,204,0.4)] p-8 border border-[#F5F3EC] flex flex-col">
          <h2 className="text-xl font-bold text-[#2D3A2F] mb-6">Top Strengths</h2>
          <ul className="space-y-4 flex-1">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-4">
                <div className="mt-0.5 p-1.5 bg-[#EAF0EB] text-[#3B5942] rounded-full shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <span className="text-[#5C665D] leading-relaxed">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 3: Action Items */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(214,211,204,0.4)] p-8 border border-[#F5F3EC] flex flex-col">
          <h2 className="text-xl font-bold text-[#2D3A2F] mb-6">Action Items</h2>
          <ul className="space-y-5 flex-1">
            {actionItems.map((item, index) => (
              <li key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-[#FDFBF7] border border-[#F5F3EC]">
                <div className="mt-0.5 text-[#B07C50] shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <span className="text-[#5C665D] font-medium leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Bottom Area: Skills Analysis */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(214,211,204,0.4)] p-8 md:p-10 border border-[#F5F3EC]">
        <h2 className="text-2xl font-bold text-[#2D3A2F] mb-8">Keyword & Skill Extraction</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-[#2D3A2F] font-semibold mb-4 text-lg">Core Skills Found</h3>
            <div className="flex flex-wrap gap-3">
              {coreSkills.map((skill, index) => (
                <span 
                  key={index} 
                  className="rounded-full px-4 py-1.5 bg-[#F5F3EC] text-[#5C665D] text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[#2D3A2F] font-semibold mb-4 text-lg">Missing Keywords</h3>
            <div className="flex flex-wrap gap-3">
              {missingKeywords.map((skill, index) => (
                <span 
                  key={index} 
                  className="rounded-full px-4 py-1.5 border border-[#E6D5C3] text-[#8C6D53] bg-[#FDFBF7] text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
            <p className="text-sm text-[#8C938D] mt-4">
              *Adding these keywords may significantly boost your resume's visibility to ATS systems.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}