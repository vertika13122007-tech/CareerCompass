"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, Square, FileText, Loader2, Plus, Trash2, MessageSquare, Pencil, Download } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  sender: "kiki" | "user";
  text: string;
  isBot?: boolean;
}

interface ChatSession {
  id: number;
  title: string;
  messages: Array<{ role: string; text: string }>;
  created_at: string;
  updated_at: string;
}

export default function ChatPage() {
  const [hasResume, setHasResume] = useState<boolean | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Check resume existence
  useEffect(() => {
    const checkResume = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/resume/latest");
        if (response.ok) {
          setHasResume(true);
        } else {
          setHasResume(false);
        }
      } catch (error) {
        console.error("Failed to check resume:", error);
        setHasResume(false);
      }
    };

    checkResume();
  }, []);

  // Fetch initial chat sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/ai/coach/sessions");
      if (res.ok) {
        const data: ChatSession[] = await res.json();
        setSessions(data);
        if (data.length === 0) {
          handleNewChat();
        } else if (!activeSessionId) {
          setActiveSessionId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Listen to activeSessionId changes and load corresponding history
  useEffect(() => {
    if (!activeSessionId || sessions.length === 0) return;

    const currentSession = sessions.find((s) => s.id === activeSessionId);
    if (currentSession && Array.isArray(currentSession.messages) && currentSession.messages.length > 0) {
      const loadedMessages: Message[] = currentSession.messages.map((m: any, idx: number) => ({
        id: `session-msg-${idx}`,
        sender: m.role === "model" || m.sender === "kiki" ? "kiki" : "user",
        text: m.text || m.content || "",
        isBot: m.role === "model" || m.sender === "kiki",
      }));
      setMessages(loadedMessages);
    } else {
      setMessages([]);
    }
  }, [activeSessionId, sessions]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleNewChat = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/ai/coach/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });
      if (res.ok) {
        const newSession: ChatSession = await res.json();
        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to create new chat session:", err);
    }
  };

  const handleRenameChat = async (id: number, newTitle: string) => {
    if (!newTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    try {
      await fetch(`http://127.0.0.1:8000/ai/coach/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      // Update local state to reflect new title instantly
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
      );
      setEditingSessionId(null);
    } catch (error) {
      console.error("Failed to rename chat:", error);
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, sessionId: number) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://127.0.0.1:8000/ai/coach/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const updated = sessions.filter((s) => s.id !== sessionId);
        setSessions(updated);

        if (activeSessionId === sessionId) {
          if (updated.length > 0) {
            setActiveSessionId(updated[0].id);
          } else {
            handleNewChat();
          }
        }
      }
    } catch (err) {
      console.error("Failed to delete chat session:", err);
    }
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;
    const activeSession = sessions.find((s) => s.id === activeSessionId);
    const title = activeSession ? activeSession.title : "Chat_History";

    const chatText = messages
      .map(
        (m) =>
          `${m.sender === "user" || (m as any).role === "user" ? "You" : "Kiki"}:\n${m.text}\n\n`
      )
      .join("");
    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendMessage = async (customText?: string) => {
    const trimmedInput = (customText ?? input).trim();
    if (!trimmedInput || isTyping) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      text: trimmedInput,
      isBot: false,
    };

    const formattedHistory = messages.map((msg) => ({
      role: msg.sender === "kiki" ? "model" : "user",
      text: msg.text,
    }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("http://127.0.0.1:8000/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmedInput,
          session_id: activeSessionId,
          history: formattedHistory,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      const replyText = data.reply || data.response || data.text || "I am analyzing your request...";

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), text: replyText, isBot: true, sender: "kiki" },
      ]);

      // Refresh session list to show updated title and messages
      const sessionsRes = await fetch("http://127.0.0.1:8000/ai/coach/sessions");
      if (sessionsRes.ok) {
        const refreshedData: ChatSession[] = await sessionsRes.json();
        setSessions(refreshedData);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Chat error:", error);
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), text: "Sorry, my connection dropped. Please try again.", isBot: true, sender: "kiki" },
        ]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setIsTyping(false);
  };

  if (hasResume === null) {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#52795C] animate-spin mb-4" />
        <p className="text-[#5C665D] font-medium">Waking Kiki up...</p>
      </div>
    );
  }

  if (hasResume === false) {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-10 rounded-3xl shadow-sm border border-[#F5F3EC] text-center bg-white">
          <div className="w-16 h-16 bg-[#EAF0EB] text-[#52795C] rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#2D3A2F] mt-4">Kiki needs your resume!</h2>
          <p className="text-[#5C665D] mt-2">Before Kiki can coach you, she needs to know your background.</p>
          <Link
            href="/dashboard/upload"
            className="bg-[#2D3A2F] text-white px-6 py-3 rounded-full mt-6 inline-block hover:scale-105 transition-transform font-bold"
          >
            Upload Resume
          </Link>
        </div>
      </div>
    );
  }

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Left Sidebar (w-1/4, min-w-[250px]) */}
      <aside className="w-1/4 min-w-[250px] max-w-[300px] flex flex-col bg-white border border-[#EAF0EB] rounded-3xl p-4 shadow-sm flex-shrink-0">
        {/* Big New Chat Button */}
        <button
          onClick={handleNewChat}
          className="bg-[#52795C] text-white w-full py-3 rounded-2xl mb-4 font-bold flex items-center justify-center gap-2 hover:bg-[#3B5942] transition-all cursor-pointer shadow-sm hover:shadow"
        >
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
        </button>

        {/* Scrollable List of Sessions */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <p className="text-xs font-bold text-[#8C938D] uppercase tracking-wider px-2 mb-2">
            Conversations
          </p>

          {sessions.length === 0 ? (
            <p className="text-xs text-[#8C938D] italic px-2">No past conversations</p>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isEditing = session.id === editingSessionId;

              if (isEditing) {
                return (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-2xl border ${
                      isActive
                        ? "bg-[#EAF0EB] text-[#2D3A2F] border-[#DCE5DE]"
                        : "bg-[#F9FAFB] text-[#5C665D] border-transparent"
                    }`}
                  >
                    <input
                      type="text"
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRenameChat(session.id, editTitle);
                        } else if (e.key === "Escape") {
                          setEditingSessionId(null);
                        }
                      }}
                      onBlur={() => handleRenameChat(session.id, editTitle)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-white border border-[#52795C] rounded-xl px-2.5 py-1 text-sm text-[#2D3A2F] focus:outline-none shadow-xs"
                    />
                  </div>
                );
              }

              return (
                <div
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`group flex items-center justify-between px-3.5 py-3 rounded-2xl cursor-pointer transition-all border ${
                    isActive
                      ? "bg-[#EAF0EB] font-bold text-[#2D3A2F] border-[#DCE5DE] shadow-xs"
                      : "bg-[#F9FAFB] text-[#5C665D] border-transparent hover:bg-[#F5F3EC] hover:text-[#2D3A2F]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1 mr-2">
                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#52795C]" : "text-[#8C938D]"}`} />
                    <span className="text-sm truncate">
                      {session.title || "New Chat"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSessionId(session.id);
                        setEditTitle(session.title || "New Chat");
                      }}
                      className="p-1 hover:bg-[#EAF0EB] hover:text-[#52795C] text-[#8C938D] rounded-lg transition-all flex-shrink-0 cursor-pointer"
                      title="Rename Chat"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteChat(e, session.id)}
                      className="p-1 hover:bg-[#FCEAE8] hover:text-[#B74134] text-[#8C938D] rounded-lg transition-all flex-shrink-0 cursor-pointer"
                      title="Delete Chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Right Chat Area (flex-1) */}
      <section className="flex-1 flex flex-col bg-white border border-[#EAF0EB] rounded-3xl p-6 shadow-sm overflow-hidden min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#F5F3EC] flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#EAF0EB] text-[#52795C] rounded-2xl shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#2D3A2F]">
                  {activeSession?.title || "Chat with Kiki"}
                </h1>
                <span className="w-2.5 h-2.5 rounded-full bg-[#52795C] animate-pulse"></span>
              </div>
              <p className="text-xs text-[#5C665D] mt-0.5">
                Your AI Career Coach • Always active & ready to help
              </p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleExportChat}
              className="flex items-center gap-1.5 bg-[#F5F3EC] text-[#52795C] px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#EAF0EB] transition-colors cursor-pointer shadow-xs"
              title="Export Conversation History"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Chat</span>
            </button>
          )}
        </div>

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto space-y-5 py-6 pr-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-14 h-14 bg-[#EAF0EB] text-[#52795C] rounded-2xl flex items-center justify-center mb-4 shadow-xs">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-[#2D3A2F] mb-2">How can I help your career today?</h3>
              <p className="text-[#5C665D] mb-8 text-sm max-w-md">
                Select a quick-start prompt below or type your own question.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {[
                  "Run a mock behavioral interview with me.",
                  "Review my resume for a Full Stack role.",
                  "Help me write a cold email to a recruiter.",
                  "What technical skills should I learn next?",
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(prompt)}
                    className="bg-[#F9FAFB] hover:bg-[#EAF0EB] text-[#2D3A2F] border border-[#EAF0EB] hover:border-[#DCE5DE] p-4 rounded-2xl text-left text-sm font-semibold transition-all hover:shadow-xs cursor-pointer flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <Send className="w-4 h-4 text-[#52795C] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isKiki = message.sender === "kiki";

              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    isKiki ? "justify-start" : "justify-end"
                  }`}
                >
                  {isKiki && (
                    <div className="w-8 h-8 rounded-xl bg-[#EAF0EB] text-[#52795C] flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={
                      isKiki
                        ? "bg-[#F9FAFB] shadow-xs border border-[#EAF0EB] rounded-3xl rounded-tl-sm p-4 text-[#5C665D] max-w-[85%] leading-relaxed text-sm"
                        : "bg-[#52795C] text-white rounded-3xl rounded-tr-sm p-4 max-w-[85%] ml-auto font-medium leading-relaxed shadow-sm text-sm"
                    }
                  >
                    <div className="space-y-2.5">
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => <p className="leading-relaxed" {...props} />,
                          strong: ({ node, ...props }) => (
                            <strong
                              className={`font-semibold ${isKiki ? "text-[#2D3A2F]" : "text-white"}`}
                              {...props}
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3
                              className={`text-base font-bold mt-3 mb-1.5 ${
                                isKiki ? "text-[#2D3A2F]" : "text-white"
                              }`}
                              {...props}
                            />
                          ),
                          ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-1 my-1.5" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-1 my-1.5" {...props} />,
                          li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                          hr: ({ node, ...props }) => <hr className="border-[#EAF0EB] my-3" {...props} />,
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {!isKiki && (
                    <div className="w-8 h-8 rounded-xl bg-[#2D3A2F] text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-3 justify-start animate-in fade-in duration-300">
              <div className="w-8 h-8 rounded-xl bg-[#EAF0EB] text-[#52795C] flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#F9FAFB] shadow-xs border border-[#EAF0EB] rounded-3xl rounded-tl-sm p-4 w-fit flex items-center gap-1.5">
                <span
                  className="w-2 h-2 bg-[#8C938D] rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-[#8C938D] rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-[#8C938D] rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area with Cancel Button */}
        <div className="pt-3 border-t border-[#F5F3EC] flex-shrink-0 relative">
          {isTyping && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FCEAE8] text-[#B74134] rounded-full text-xs font-semibold hover:bg-[#F9D6D3] transition-colors shadow-sm cursor-pointer z-10 animate-in fade-in slide-in-from-bottom-2"
              >
                <Square size={12} className="fill-current" />
                <span>Stop generating</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative w-full">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Kiki anything about your career goals, interview prep, or resume..."
              className="w-full bg-[#F9FAFB] border-2 border-[#EAF0EB] rounded-full pl-5 pr-14 py-3.5 focus:outline-none focus:border-[#52795C] focus:bg-white shadow-xs text-[#2D3A2F] placeholder-[#8C938D] transition-all text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#52795C] text-white p-2.5 rounded-full hover:bg-[#3B5942] transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center shadow-sm cursor-pointer disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

