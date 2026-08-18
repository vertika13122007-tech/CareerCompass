"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  sender: "kiki" | "user";
  text: string;
}

export default function ChatPage() {
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: trimmedInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate Kiki's response 1 second later
    setTimeout(() => {
      const kikiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "kiki",
        text: "I am analyzing your request...",
      };
      setMessages((prev) => [...prev, kikiResponse]);
      setIsTyping(false);
    }, 1000);
  };

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
                <p className="whitespace-pre-wrap">{message.text}</p>
              </div>

              {!isKiki && (
                <div className="w-9 h-9 rounded-2xl bg-[#2D3A2F] text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-9 h-9 rounded-2xl bg-[#EAF0EB] text-[#52795C] flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white shadow-[0_4px_20px_rgba(214,211,204,0.3)] border border-[#F5F3EC] rounded-3xl rounded-tl-sm px-6 py-4 text-[#5C665D] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#52795C] animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 rounded-full bg-[#52795C] animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-[#52795C] animate-bounce"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-4 border-t border-[#F5F3EC] flex-shrink-0">
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
