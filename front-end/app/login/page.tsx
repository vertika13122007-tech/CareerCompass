"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, Eye, EyeOff, Check, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { API_BASE_URL, setAuthToken, setUserData } from "@/lib/auth";
import { BorderTrail } from "@/components/core/border-trail";
import { TextShimmer } from "@/components/core/text-shimmer";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email.trim());
      formData.append("password", password);

      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.detail || "Invalid email or password. Please try again.");
      }

      if (data?.access_token) {
        setAuthToken(data.access_token);
        if (data.user) {
          setUserData(data.user);
        }
        router.push("/dashboard");
      } else {
        throw new Error("Login failed: missing access token from server.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Quick-fill or demo login
    setEmail("vertika13122007@gmail.com");
    setPassword("password123");
  };

  const handleDirectDemoAccess = () => {
    // Allows instant demo entry to command center
    setAuthToken("demo-access-token-careercompass");
    setUserData({
      id: 1,
      name: "Demo Candidate",
      email: "demo@careercompass.ai"
    });
    router.push("/dashboard");
  };

  const valueProps = [
    "Real-Time ATS Score & Optimization",
    "Multi-Resume Portfolio Library",
    "Interactive Job Pipeline Kanban",
    "AI Coach & Mock Interviews",
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#2D3A2F] via-[#3b5943] to-[#52795C] text-white flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-hidden">
      {/* Background Subtle Glowing Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#52795C]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#2D3A2F]/50 rounded-full blur-3xl pointer-events-none" />

      {/* Main Split-Screen Container */}
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center z-10">
        
        {/* Left Side: Branding & Value Props (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-8 text-left py-4">
          {/* Logo & Brand Header */}
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-300 shadow-lg group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex items-center font-extrabold text-2xl tracking-tight">
              <span>Career</span>
              <span className="text-emerald-300 ml-0.5">Compass</span>
            </div>
          </Link>

          {/* Headline & Subtitle */}
          <div className="space-y-4 max-w-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-[1.15]">
              <TextShimmer
                as="span"
                className="text-4xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white [--base-color:theme(colors.white)] [--base-gradient-color:theme(colors.emerald.300)]"
                duration={1.5}
              >
                Master Your Career, Land Your Dream Role.
              </TextShimmer>
            </h1>
            <p className="text-base sm:text-lg text-emerald-100/80 leading-relaxed font-normal">
              The AI-powered command center for resume optimization, ATS scoring, and job application tracking.
            </p>
          </div>

          {/* Feature Checkmarks List */}
          <div className="space-y-3.5 pt-2 max-w-md">
            {valueProps.map((prop, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-400 text-[#2D3A2F] flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <span className="text-sm font-semibold text-white/95">
                  {prop}
                </span>
              </div>
            ))}
          </div>

          {/* Social Proof / Trust Badge */}
          <div className="pt-2 flex items-center gap-3 text-xs text-emerald-200/70">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Used by ambitious engineers and professionals accelerating their careers.</span>
          </div>
        </div>

        {/* Right Side: The Floating White Card Form (lg:col-span-5) */}
        <div className="lg:col-span-5 w-full flex justify-center">
          <div className="relative overflow-hidden bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-10 max-w-md w-full text-[#2D3A2F] border border-white/20 transition-all">
            <BorderTrail
              size={120}
              style={{
                boxShadow: '0px 0px 60px 30px rgba(82, 121, 92, 0.4), 0 0px 100px 50px rgba(45, 58, 47, 0.2)',
              }}
            />
            
            {/* Card Header */}
            <div className="mb-6 space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2D3A2F]">
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm text-[#5C665D]">
                Log in to continue to your command center.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3.5 rounded-xl flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#5C665D] block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#EAF0EB] rounded-xl text-sm font-medium text-[#2D3A2F] placeholder:text-gray-400 focus:outline-none focus:border-[#52795C] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5C665D] block">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-3 bg-[#F9FAFB] border border-[#EAF0EB] rounded-xl text-sm font-medium text-[#2D3A2F] placeholder:text-gray-400 focus:outline-none focus:border-[#52795C] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2D3A2F] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Toggle */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-[#5C665D] cursor-pointer font-medium select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-[#52795C] focus:ring-[#52795C] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <span className="text-xs text-[#52795C] hover:underline cursor-pointer font-semibold">
                  Forgot password?
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-[#52795C] hover:bg-[#3b5943] text-white font-bold py-3.5 rounded-xl shadow-md shadow-[#52795C]/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Options */}
            <div className="mt-5 pt-4 border-t border-[#EAF0EB] flex flex-col gap-2">
              <button
                type="button"
                onClick={handleDirectDemoAccess}
                className="w-full py-2.5 text-xs font-bold text-[#52795C] bg-[#F5F3EC] hover:bg-[#EAF0EB] rounded-xl transition-colors cursor-pointer"
              >
                ⚡ Explore as Guest / Demo Mode
              </button>
            </div>

            {/* Footer Toggle */}
            <p className="mt-6 text-center text-xs text-[#5C665D]">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-[#52795C] hover:text-[#3b5943] hover:underline transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
