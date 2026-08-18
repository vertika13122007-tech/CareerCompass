"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, Square, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  sender: "kiki" | "user";
  text: string;
  isBot?: boolean;
}

export default function ChatPage() {
  const [hasResume, setHasResume] = useState<boolean | null>(null);

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
        setHasResume(false);
      }
    };
    
    checkResume();
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-1",
      sender: "kiki",
      text: "Hi! I'm Kiki, your personal career coach. I've already read through your uploaded resume. What would you like to focus on today? We can do a mock interview, or I can help you rewrite specific bullet points!",
    },
  ]);
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

  // Clean up any ongoing timeout or abort controller on component unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isTyping) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      sender: "user",
      text: trimmedInput,
      isBot: false,
    };

    const formattedHistory = messages.slice(1).map((msg) => ({
      role: msg.sender === "kiki" ? "model" : "user",
      text: msg.text,
    }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Initialize new AbortController
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("http://127.0.0.1:8000/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedInput, history: formattedHistory }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev, 
        { id: crypto.randomUUID(), text: data.reply || data.response || data.text || "I am analyzing your request...", isBot: true, sender: "kiki" }
      ]);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Chat error:", error);
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), text: "Sorry, my connection dropped. Please try again.", isBot: true, sender: "kiki" }
        ]);
      } else if (!(error instanceof Error)) {
        console.error("Chat error:", error);
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), text: "Sorry, my connection dropped. Please try again.", isBot: true, sender: "kiki" }
        ]);
      }
    } finally {
      setIsTyping(false);
    }
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
      <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#52795C] animate-spin mb-4" />
        <p className="text-[#5C665D] font-medium">Waking Kiki up...</p>
      </div>
    );
  }

  if (hasResume === false) {
    return (
      <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-10 rounded-3xl shadow-sm border border-[#F5F3EC] text-center bg-white">
          <div className="w-16 h-16 bg-[#EAF0EB] text-[#52795C] rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#2D3A2F] mt-4">Kiki needs your resume!</h2>
          <p className="text-[#5C665D] mt-2">Before Kiki can coach you, she needs to know your background.</p>
          <Link 
            href="/dashboard/upload" 
            className="bg-[#2D3A2F] text-white px-6 py-3 rounded-full mt-6 inline-block hover:scale-105 transition-transform"
          >
            Upload Resume
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-[#F5F3EC] flex-shrink-0">
        <div className="p-3.5 bg-[#EAF0EB] text-[#52795C] rounded-full shadow-sm">
          <Sparkles className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-[#2D3A2F]">
              Chat with Kiki
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-[#52795C] animate-pulse"></span>
          </div>
          <p className="text-sm text-[#5C665D]">
            Your AI Career Coach • Always active & ready to help
          </p>
        </div>
      </div>

      {/* Chat History Area */}
      <div className="flex-1 overflow-y-auto space-y-6 py-6 pr-4">
        {messages.map((message) => {
          const isKiki = message.sender === "kiki";

          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                isKiki ? "justify-start" : "justify-end"
              }`}
            >
              {isKiki && (
                <div className="w-9 h-9 rounded-2xl bg-[#EAF0EB] text-[#52795C] flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
              )}

              <div
                className={
                  isKiki
                    ? "bg-white shadow-[0_4px_20px_rgba(214,211,204,0.3)] border border-[#F5F3EC] rounded-3xl rounded-tl-sm p-5 text-[#5C665D] max-w-[80%] leading-relaxed"
                    : "bg-[#EAF0EB] text-[#2D3A2F] rounded-3xl rounded-tr-sm p-5 max-w-[80%] ml-auto font-medium leading-relaxed shadow-sm"
                }
              >
                <div className="space-y-3">
                  <ReactMarkdown 
                    components={{
                      p: ({node, ...props}) => <p className="leading-relaxed" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-[#2D3A2F]" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg font-bold text-[#2D3A2F] mt-4 mb-2" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 my-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />,
                      li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                      hr: ({node, ...props}) => <hr className="border-[#F5F3EC] my-4" {...props} />
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                </div>
              </div>

              {!isKiki && (
                <div className="w-9 h-9 rounded-2xl bg-[#2D3A2F] text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-3 justify-start animate-in fade-in duration-300">
            <div className="w-9 h-9 rounded-2xl bg-[#EAF0EB] text-[#52795C] flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white shadow-sm border border-[#F5F3EC] rounded-3xl rounded-tl-sm p-5 w-fit flex items-center gap-1.5">
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
      <div className="pt-4 border-t border-[#F5F3EC] flex-shrink-0 relative">
        {/* Cancel Request Button positioned centered above input box */}
        {isTyping && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-[#FCEAE8] text-[#B74134] rounded-full text-sm font-medium hover:bg-[#F9D6D3] transition-colors shadow-sm cursor-pointer z-10 animate-in fade-in slide-in-from-bottom-2"
            >
              <Square size={14} className="fill-current" />
              <span>Stop generating</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Kiki anything about your resume, career goals, or interview prep..."
            className="w-full bg-white border-2 border-[#F5F3EC] rounded-full pl-6 pr-16 py-4 focus:outline-none focus:border-[#52795C] shadow-sm text-[#2D3A2F] placeholder-[#8C938D] transition-colors text-base"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2D3A2F] text-white p-3 rounded-full hover:bg-[#3B5942] transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center shadow-md cursor-pointer disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
