"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  Bot,
  Target,
  Compass,
  Edit3,
  Check,
  Plus,
  X,
  RotateCcw,
} from "lucide-react";
import { TextEffect } from "@/components/core/text-effect";
import { BorderTrail } from "@/components/core/border-trail";
import { TextShimmer } from "@/components/core/text-shimmer";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface ChatSession {
  id: string;
  title: string;
  mode: "interview" | "advisor";
  targetRole: string;
  messages: Message[];
  createdAt: string;
}

import { API_BASE_URL, getAuthHeaders } from "@/lib/auth";

const QUICK_PROMPTS = {
  interview: [
    "Start a technical question on my top project",
    "Ask me a behavioral STAR question",
    "Simulate a tough question about my employment gaps",
  ],
  advisor: [
    "How can I stand out for senior roles?",
    "Review the flow of my resume experience",
    "Tips to negotiate higher equity",
  ],
};

// 2. Markdown cleaner helper
const cleanMarkdown = (text: string) => {
  if (!text) return "";
  return text
    .replace(/###\s*/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "");
};

const getDefaultMessage = (currentMode: "interview" | "advisor", role: string): Message => ({
  role: "assistant",
  content:
    currentMode === "interview"
      ? `Hi! I'm Kiki, your AI Coach and technical interviewer. I've reviewed your active resume. Whenever you're ready, choose a prompt below or send a message to kick off your mock interview for ${role}!`
      : `Hi! I'm Kiki, your executive tech career coach. I've analyzed your active resume. Ask me anything about career acceleration, positioning, resume strategy, or navigating interview challenges!`,
  timestamp: "Just now",
});

const createNewSessionObject = (m: "interview" | "advisor", role: string): ChatSession => ({
  id: Date.now().toString(),
  title: m === "interview" ? `Mock Interview: ${role}` : `Career Advice: ${role}`,
  mode: m,
  targetRole: role,
  messages: [getDefaultMessage(m, role)],
  createdAt: new Date().toISOString(),
});

export default function CoachChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [roleInput, setRoleInput] = useState("Software Engineer");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Fix Hydration & 4. Multi-Chat: Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("careercompass_multichats_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.sessions) && parsed.sessions.length > 0) {
          setSessions(parsed.sessions);
          if (
            parsed.activeSessionId &&
            parsed.sessions.some((s: any) => s.id === parsed.activeSessionId)
          ) {
            setActiveSessionId(parsed.activeSessionId);
          } else {
            setActiveSessionId(parsed.sessions[0].id);
          }
          return;
        }
      } catch (err) {
        console.error("Failed to parse saved multi-chat sessions:", err);
      }
    }

    // Default initial session if none saved
    const initialSession = createNewSessionObject("interview", "Software Engineer");
    setSessions([initialSession]);
    setActiveSessionId(initialSession.id);
  }, []);

  // 4. Multi-Chat: Sync all sessions and active ID to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(
      "careercompass_multichats_v1",
      JSON.stringify({
        sessions,
        activeSessionId,
      })
    );
  }, [sessions, activeSessionId, mounted]);

  // Active session and derived values
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const currentMessages = activeSession?.messages || [];
  const currentMode = activeSession?.mode || "interview";
  const currentTargetRole = activeSession?.targetRole || "Software Engineer";

  useEffect(() => {
    setRoleInput(currentTargetRole);
  }, [currentTargetRole]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isLoading]);

  // Update messages in current active session
  const updateActiveSessionMessages = (newMsgs: Message[]) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSession?.id) return s;
        // Optionally update title from first user message
        let newTitle = s.title;
        const firstUser = newMsgs.find((m) => m.role === "user");
        if (firstUser && s.messages.length <= 1) {
          const snippet = firstUser.content.slice(0, 22);
          newTitle = `${s.mode === "interview" ? "Interview" : "Advice"}: ${snippet}...`;
        }
        return { ...s, messages: newMsgs, title: newTitle };
      })
    );
  };

  // 4. Create New Chat Session
  const handleNewChat = () => {
    const newSession = createNewSessionObject(currentMode, currentTargetRole);
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  // 4. Delete Chat Session
  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const nextSessions = sessions.filter((s) => s.id !== id);
    if (nextSessions.length === 0) {
      const freshSession = createNewSessionObject(currentMode, currentTargetRole);
      setSessions([freshSession]);
      setActiveSessionId(freshSession.id);
    } else {
      setSessions(nextSessions);
      if (activeSessionId === id) {
        setActiveSessionId(nextSessions[0].id);
      }
    }
  };

  // Reset active conversation
  const handleResetActiveSession = () => {
    if (!activeSession) return;
    updateActiveSessionMessages([getDefaultMessage(currentMode, currentTargetRole)]);
  };

  // Mode Toggle
  const handleModeChange = (newMode: "interview" | "advisor") => {
    if (!activeSession || newMode === currentMode) return;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSession.id) return s;
        const updated = { ...s, mode: newMode };
        if (s.messages.length <= 1) {
          updated.messages = [getDefaultMessage(newMode, s.targetRole)];
          updated.title =
            newMode === "interview"
              ? `Mock Interview: ${s.targetRole}`
              : `Career Advice: ${s.targetRole}`;
        }
        return updated;
      })
    );
  };

  // Target Role Edit
  const handleSaveRole = () => {
    if (!activeSession || !roleInput.trim()) {
      setIsEditingRole(false);
      return;
    }
    const trimmed = roleInput.trim();
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSession.id) return s;
        const updated = { ...s, targetRole: trimmed };
        if (s.messages.length <= 1) {
          updated.messages = [getDefaultMessage(s.mode, trimmed)];
          updated.title = `${s.mode === "interview" ? "Mock Interview" : "Career Advice"}: ${trimmed}`;
        }
        return updated;
      })
    );
    setIsEditingRole(false);
  };

  // Send message
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading || !activeSession) return;

    const userText = textToSend.trim();
    setInput("");
    setIsLoading(true);

    const nowTime = mounted
      ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "Just now";

    const userMsg: Message = {
      role: "user",
      content: userText,
      timestamp: nowTime,
    };

    const updatedMessages = [...currentMessages, userMsg];
    updateActiveSessionMessages(updatedMessages);

    try {
      const response = await fetch(`${API_BASE_URL}/ai/coach-chat`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          mode: currentMode,
          target_role: currentTargetRole,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const botReply =
        data.response ||
        "I'm here to support your career journey. Let me know what you'd like to work on next!";

      const botTime = mounted
        ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "Just now";

      const botMsg: Message = {
        role: "assistant",
        content: botReply,
        timestamp: botTime,
      };

      updateActiveSessionMessages([...updatedMessages, botMsg]);
    } catch (err) {
      console.error("Coach chat error:", err);
      const botTime = mounted
        ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "Just now";

      const errorMsg: Message = {
        role: "assistant",
        content:
          "Sorry, I had trouble connecting to the AI Coach service. Please ensure the backend server is running.",
        timestamp: botTime,
      };
      updateActiveSessionMessages([...updatedMessages, errorMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-3 animate-in fade-in zoom-in-95 duration-500 flex flex-col h-full">
      {/* Header Card */}
      <div className="bg-white rounded-3xl border-2 border-[#EAF0EB] p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 flex-shrink-0">
        {/* Left: Title & Online Status */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#EAF0EB] text-[#52795C] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <TextEffect className="text-xl font-black text-[#2D3A2F]" preset="fade-in-blur" speedReveal={1.1} speedSegment={0.3}>
                AI Coach Kiki
              </TextEffect>
              <span
                className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"
                title="Online & Ready"
              ></span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-[#5C665D]">Technical interviewer & career strategist</p>
              <span className="text-gray-300">•</span>
              {isEditingRole ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className="text-xs px-2 py-0.5 border border-[#52795C] rounded-md text-[#2D3A2F] focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleSaveRole()}
                  />
                  <button
                    onClick={handleSaveRole}
                    className="p-1 text-[#52795C] hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingRole(true)}
                  className="group flex items-center gap-1 text-xs font-semibold text-[#52795C] bg-[#EAF0EB]/70 px-2 py-0.5 rounded-full hover:bg-[#EAF0EB] transition-colors cursor-pointer"
                  title="Click to edit target role"
                >
                  <span>{currentTargetRole}</span>
                  <Edit3 className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Mode Toggle Buttons & Reset Active */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Mode Pills */}
          <div className="bg-[#F5F3EC] p-1 rounded-2xl flex items-center gap-1 border border-[#EAF0EB]">
            <button
              onClick={() => handleModeChange("interview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentMode === "interview"
                  ? "bg-[#52795C] text-white shadow-sm"
                  : "text-[#5C665D] hover:text-[#2D3A2F]"
                }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Mock Interview</span>
            </button>

            <button
              onClick={() => handleModeChange("advisor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentMode === "advisor"
                  ? "bg-[#52795C] text-white shadow-sm"
                  : "text-[#5C665D] hover:text-[#2D3A2F]"
                }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Career Advisor</span>
            </button>
          </div>

          {/* Reset Active Session Button */}
          <button
            onClick={handleResetActiveSession}
            className="text-[#D97757] bg-[#FDF8F6] border border-[#FBECE7] hover:bg-[#FBECE7] rounded-xl px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer whitespace-nowrap"
            title="Reset current conversation"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 4. Multi-Chat Session Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-shrink-0">
        {sessions.map((s) => {
          const isActive = s.id === (activeSession?.id || activeSessionId);
          return (
            <button
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border shadow-sm ${isActive
                  ? "bg-[#52795C] text-white border-[#52795C]"
                  : "bg-white text-[#2D3A2F] border-[#EAF0EB] hover:border-[#52795C]/40 hover:bg-[#F5F3EC]"
                }`}
            >
              <span className="max-w-[160px] truncate">{s.title}</span>
              <span
                onClick={(e) => handleDeleteSession(e, s.id)}
                title="Delete chat session"
                className={`p-0.5 rounded-md transition-colors ${isActive
                    ? "text-white/80 hover:text-white hover:bg-black/10"
                    : "text-gray-400 hover:text-red-500"
                  }`}
              >
                <X className="w-3 h-3" />
              </span>
            </button>
          );
        })}

        <button
          onClick={handleNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border border-dashed border-[#52795C]/50 text-[#52795C] bg-white hover:bg-[#EAF0EB]/60 flex-shrink-0 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* 3. Fixed UI Layout Chat Container */}
      <div className="flex flex-col h-[calc(100vh-14rem)] bg-white rounded-3xl border-2 border-[#EAF0EB] shadow-sm overflow-hidden">
        {/* Scrollable messages area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {currentMessages.map((msg, index) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={index}
                className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#EAF0EB] text-[#52795C] flex items-center justify-center flex-shrink-0 mt-1 shadow-sm font-bold text-xs">
                    K
                  </div>
                )}

                <div
                  className={`relative p-4 rounded-2xl text-sm leading-relaxed max-w-[80%] shadow-sm ${isUser
                      ? "bg-[#52795C] text-white rounded-tr-sm"
                      : "bg-[#F5F3EC] text-[#2D3A2F] rounded-tl-sm border border-[#EAF0EB]"
                    }`}
                >
                  {/* 2. Cleaned Markdown formatting for Kiki */}
                  <p className="whitespace-pre-wrap">
                    {isUser ? msg.content : cleanMarkdown(msg.content)}
                  </p>
                  {/* 1. Prevent Hydration Mismatch on timestamps */}
                  {mounted && msg.timestamp && (
                    <span
                      className={`text-[10px] mt-1.5 block text-right font-medium ${isUser ? "text-white/70" : "text-gray-400"
                        }`}
                    >
                      {msg.timestamp}
                    </span>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#2D3A2F] text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm font-bold text-xs">
                    You
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start animate-in fade-in duration-300">
              <div className="w-8 h-8 rounded-full bg-[#EAF0EB] text-[#52795C] flex items-center justify-center flex-shrink-0 mt-1 shadow-sm font-bold text-xs">
                K
              </div>
              <div className="bg-[#F5F3EC] text-[#5C665D] border border-[#EAF0EB] rounded-2xl rounded-tl-sm px-4 py-3 text-xs flex items-center gap-2 shadow-sm">
                <span className="font-semibold text-[#2D3A2F]">Kiki is analyzing & typing</span>
                <div className="flex items-center gap-1">
                  <span
                    className="w-1.5 h-1.5 bg-[#52795C] rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 bg-[#52795C] rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 bg-[#52795C] rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sticky bottom input & quick prompts area */}
        <div className="p-4 bg-white border-t border-[#EAF0EB] space-y-3 flex-shrink-0">
          {/* Quick Prompt Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-[#5C665D] uppercase tracking-wider flex items-center gap-1 flex-shrink-0 mr-1">
              <Sparkles className="w-3 h-3 text-[#52795C]" /> Quick Prompts:
            </span>
            {QUICK_PROMPTS[currentMode].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                disabled={isLoading}
                className="bg-[#FDFBF7] text-[#2D3A2F] border border-[#EAF0EB] hover:border-[#52795C] hover:bg-[#EAF0EB]/50 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm cursor-pointer whitespace-nowrap flex-shrink-0 disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Input Field */}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={
                currentMode === "interview"
                  ? "Answer the question or ask for technical feedback..."
                  : "Ask for career progression, resume, or negotiation advice..."
              }
              className="flex-1 bg-[#FDFBF7] border-2 border-[#EAF0EB] rounded-2xl px-5 py-3 text-sm text-[#2D3A2F] focus:outline-none focus:border-[#52795C] focus:bg-white placeholder:text-gray-400 transition-all shadow-sm"
            />
            {isLoading ? (
              <div className="relative p-3 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden font-bold text-[#52795C] shadow-sm flex-shrink-0">
                <BorderTrail size={50} style={{ boxShadow: '0px 0px 30px 15px rgba(82, 121, 92, 0.4)' }} />
                <Send className="w-4 h-4 animate-pulse text-[#52795C]" />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleSendMessage(input)}
                disabled={!input.trim()}
                className="bg-[#52795C] hover:bg-[#3b5943] text-white p-3 rounded-2xl shadow-sm transition-all disabled:opacity-40 disabled:hover:bg-[#52795C] cursor-pointer disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
