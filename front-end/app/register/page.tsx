"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, User, Eye, EyeOff, Check, ArrowRight, Loader2, AlertCircle, KeyRound } from "lucide-react";
import { API_BASE_URL, setAuthToken, setUserData } from "@/lib/auth";
import { BorderTrail } from "@/components/core/border-trail";
import { TextShimmer } from "@/components/core/text-shimmer";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OTP Verification state if backend requires email verification
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("careercompass_token") : null;
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.detail || "Registration failed. Please check your details.");
      }

      // If backend asks for OTP verification
      setIsOtpStep(true);
      setOtpNotice(data?.message || "An OTP code has been sent to your email address.");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.detail || "Invalid or expired OTP code.");
      }

      // Automatically log the user in after verification
      const loginFormData = new URLSearchParams();
      loginFormData.append("username", email.trim());
      loginFormData.append("password", password);

      const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: loginFormData.toString(),
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        setAuthToken(loginData.access_token);
        if (loginData.user) setUserData(loginData.user);
        router.push("/dashboard");
      } else {
        // Fallback: direct to login with success feedback
        router.push("/login?verified=true");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Verification failed. Please check your OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectDemoAccess = () => {
    setAuthToken("demo-access-token-careercompass");
    setUserData({
      id: 1,
      name: name.trim() || "New Candidate",
      email: email.trim() || "candidate@careercompass.ai"
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
            <span>Join thousands of job seekers speeding up their hiring process.</span>
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
                {isOtpStep ? "Verify Email" : "Create Account"}
              </h2>
              <p className="text-xs sm:text-sm text-[#5C665D]">
                {isOtpStep
                  ? "Enter the 6-digit verification code sent to your email."
                  : "Start optimizing your career today."}
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-600 text-xs p-3.5 rounded-xl flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Initial Registration Form */}
            {!isOtpStep ? (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Full Name Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5C665D] block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Alex Johnson"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#EAF0EB] rounded-xl text-sm font-medium text-[#2D3A2F] placeholder:text-gray-400 focus:outline-none focus:border-[#52795C] focus:bg-white transition-all"
                    />
                  </div>
                </div>

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
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5C665D] block">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
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

                {/* Terms Agreement Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-xs text-[#5C665D] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      required
                      className="mt-0.5 rounded border-gray-300 text-[#52795C] focus:ring-[#52795C] cursor-pointer"
                    />
                    <span>
                      I agree to the CareerCompass{" "}
                      <span className="text-[#52795C] font-semibold hover:underline">Terms of Service</span> and{" "}
                      <span className="text-[#52795C] font-semibold hover:underline">Privacy Policy</span>.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !agreeTerms}
                  className="w-full mt-2 bg-[#52795C] hover:bg-[#3b5943] text-white font-bold py-3.5 rounded-xl shadow-md shadow-[#52795C]/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: OTP Verification Form */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {otpNotice && (
                  <div className="bg-emerald-50 border border-emerald-200 text-[#52795C] text-xs p-3 rounded-xl">
                    {otpNotice}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5C665D] block">
                    6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#EAF0EB] rounded-xl text-center text-lg font-mono font-bold tracking-widest text-[#2D3A2F] placeholder:text-gray-300 focus:outline-none focus:border-[#52795C] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="w-full bg-[#52795C] hover:bg-[#3b5943] text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Confirm &amp; Launch Command Center</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsOtpStep(false)}
                  className="w-full text-xs font-bold text-[#5C665D] hover:text-[#2D3A2F] py-2 transition-colors cursor-pointer"
                >
                  ← Back to Registration Details
                </button>
              </form>
            )}

            {/* Quick Demo Bypass */}
            <div className="mt-5 pt-4 border-t border-[#EAF0EB]">
              <button
                type="button"
                onClick={handleDirectDemoAccess}
                className="w-full py-2.5 text-xs font-bold text-[#52795C] bg-[#F5F3EC] hover:bg-[#EAF0EB] rounded-xl transition-colors cursor-pointer"
              >
                ⚡ Skip Registration &amp; Explore Demo
              </button>
            </div>

            {/* Footer Toggle */}
            <p className="mt-6 text-center text-xs text-[#5C665D]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-[#52795C] hover:text-[#3b5943] hover:underline transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
