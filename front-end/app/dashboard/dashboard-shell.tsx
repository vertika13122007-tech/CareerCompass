'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Upload,
  Map,
  MessageSquare,
  Sparkles,
  FileText,
  Wand2,
  LogOut,
  Briefcase,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  KeyRound,
  ChevronsUpDown,
  X,
  Eye,
  EyeOff,
  Check,
  Loader2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { AppleStyleDock } from '@/components/core/apple-style-dock';
import { ScrollProgress } from '@/components/core/scroll-progress';
import { API_BASE_URL, getAuthToken, getUserData, setUserData, removeAuthToken } from '@/lib/auth';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Profile and Modal states
  const [user, setUser] = useState<{ id?: number; name?: string; email?: string } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  // Delete account confirmation states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    const savedUser = getUserData();
    if (savedUser) {
      setUser(savedUser);
    }

    const token = getAuthToken();
    if (token && token !== 'demo-access-token-careercompass') {
      fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((userData) => {
          if (userData) {
            setUser(userData);
            setUserData(userData);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    removeAuthToken();
    router.push('/login');
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText.trim() !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm.');
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    const token = getAuthToken();
    if (token === 'demo-access-token-careercompass') {
      setTimeout(() => {
        removeAuthToken();
        router.push('/login');
      }, 500);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/account`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || 'Failed to delete account. Please try again.');
      }

      removeAuthToken();
      router.push('/login');
    } catch (err: any) {
      setDeleteError(err.message || 'Error deleting account.');
      setDeleteLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPwError('Please fill in both current and new password.');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    setPwLoading(true);
    setPwError(null);
    setPwSuccess(null);

    const token = getAuthToken();
    if (token === 'demo-access-token-careercompass') {
      setTimeout(() => {
        setPwLoading(false);
        setPwSuccess('Demo account password simulated successfully.');
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPwSuccess(null);
        }, 1500);
      }, 500);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setPwError(data?.detail || 'Failed to update password. Please check your current password.');
      } else {
        setPwSuccess('Password updated successfully!');
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPwSuccess(null);
        }, 1500);
      }
    } catch (err: any) {
      setPwError(err.message || 'Network error updating password.');
    } finally {
      setPwLoading(false);
    }
  };

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Job Pipeline', href: '/dashboard/jobs', icon: Briefcase },
    { name: 'Upload Resume', href: '/dashboard/upload', icon: Upload },
    { name: 'Learning Roadmap', href: '/dashboard/roadmap', icon: Map },
    { name: 'AI Coach', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'Optimizer', href: '/dashboard/optimizer', icon: Sparkles },
    { name: 'Tailor Resume', href: '/dashboard/tailor', icon: Wand2 },
    { name: 'Cover Letter', href: '/dashboard/cover-letter', icon: FileText },
  ];

  return (
    <div className="flex h-screen w-full bg-[#FDFBF7] text-[#2D3A2F] font-sans overflow-hidden relative">
      {/* Sleek Floating Expand Button when Sidebar is closed */}
      {mounted && !isSidebarOpen && (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          title="Expand Sidebar"
          className="fixed top-5 left-5 z-30 p-2.5 rounded-2xl bg-white border border-[#EAF0EB] shadow-md hover:bg-[#F5F3EC] text-[#2D3A2F] hover:text-[#52795C] flex items-center gap-2 text-xs font-bold transition-all cursor-pointer group"
        >
          <PanelLeftOpen className="w-5 h-5 text-[#52795C] group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Sidebar</span>
        </button>
      )}

      {/* Conditional Sidebar */}
      {(!mounted || isSidebarOpen) && (
        <aside className="w-72 bg-white border-r border-[#EAF0EB] flex flex-col z-20 shadow-sm shrink-0 transition-all duration-300">
          <div className="p-6 pb-8 flex items-center justify-between border-b border-[#EAF0EB]">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EAF0EB] text-[#52795C] flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight">
                <span className="text-[#2D3A2F]">Career</span>
                <span className="text-[#52795C]">Compass</span>
              </h1>
            </Link>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              title="Collapse to Dock mode"
              className="p-2 rounded-xl text-[#5C665D] hover:text-[#2D3A2F] hover:bg-[#F5F3EC] transition-all cursor-pointer"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium ${
                    active
                      ? 'bg-[#2D3A2F] text-white shadow-md shadow-[#2D3A2F]/20 font-bold scale-[1.02]'
                      : 'text-[#5C665D] hover:bg-[#F5F3EC] hover:text-[#2D3A2F] hover:scale-[1.01]'
                  }`}
                >
                  <Icon size={19} strokeWidth={active ? 2.5 : 2} />
                  <span className="text-sm">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer with Profile Dropdown & Sign Out */}
          <div ref={dropdownRef} className="p-4 border-t border-[#EAF0EB] relative">
            {/* Dropdown Menu popover */}
            {isDropdownOpen && (
              <div className="absolute bottom-full left-4 right-4 mb-2 z-50 bg-white border border-[#EAF0EB] rounded-2xl shadow-xl p-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="p-3 border-b border-[#EAF0EB] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2D3A2F] to-[#52795C] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#2D3A2F] truncate">
                      {user?.name || 'Career Explorer'}
                    </p>
                    <p className="text-[11px] text-[#5C665D] truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsInfoModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#2D3A2F] hover:bg-[#F5F3EC] transition-colors cursor-pointer text-left"
                  >
                    <User className="w-4 h-4 text-[#52795C]" />
                    <span>Personal Info</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setPwError(null);
                      setPwSuccess(null);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setIsPasswordModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#2D3A2F] hover:bg-[#F5F3EC] transition-colors cursor-pointer text-left"
                  >
                    <KeyRound className="w-4 h-4 text-[#52795C]" />
                    <span>Change Password</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-[#EAF0EB] space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#5C665D] hover:bg-[#F5F3EC] hover:text-[#2D3A2F] transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setDeleteConfirmText('');
                      setDeleteError(null);
                      setIsDeleteModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            )}

            {/* Profile Avatar Trigger Button */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-[#F5F3EC] transition-all cursor-pointer group text-left mb-1.5"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2D3A2F] to-[#52795C] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#2D3A2F] truncate">
                  {user?.name || 'Career Explorer'}
                </p>
                <p className="text-[11px] text-[#5C665D] truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              <ChevronsUpDown className="w-4 h-4 text-gray-400 group-hover:text-[#2D3A2F] transition-colors shrink-0" />
            </button>

            {/* Direct Sign Out Button */}
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[#5C665D] hover:bg-rose-50 hover:text-rose-600 transition-colors font-medium text-xs cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area with ScrollProgress */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <ScrollProgress containerRef={containerRef} className="absolute top-0 left-0 right-0" />
        <main ref={containerRef} className="flex-1 overflow-y-auto p-6 md:p-10 pb-20 transition-all">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Floating Apple-Style Dock: Only shown when mounted and sidebar is collapsed */}
      {mounted && !isSidebarOpen && <AppleStyleDock />}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EAF0EB] space-y-5 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EAF0EB] text-[#52795C] flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#2D3A2F]">Change Password</h3>
                  <p className="text-xs text-[#5C665D]">Update your account credentials</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-[#2D3A2F] hover:bg-[#F5F3EC] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pwError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-medium">
                {pwError}
              </div>
            )}

            {pwSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{pwSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#5C665D]">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#EAF0EB] rounded-xl text-xs font-medium text-[#2D3A2F] focus:outline-none focus:border-[#52795C] focus:bg-white transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2D3A2F] transition-colors cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#5C665D]">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#EAF0EB] rounded-xl text-xs font-medium text-[#2D3A2F] focus:outline-none focus:border-[#52795C] focus:bg-white transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2D3A2F] transition-colors cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#5C665D]">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#EAF0EB] rounded-xl text-xs font-medium text-[#2D3A2F] focus:outline-none focus:border-[#52795C] focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-[#5C665D] hover:bg-[#F5F3EC] rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="px-5 py-2.5 bg-[#52795C] hover:bg-[#3b5943] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#52795C]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {pwLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Personal Info Modal */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EAF0EB] space-y-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EAF0EB] text-[#52795C] flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#2D3A2F]">Personal Info</h3>
                  <p className="text-xs text-[#5C665D]">Your account profile overview</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInfoModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-[#2D3A2F] hover:bg-[#F5F3EC] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-[#F9FAFB] rounded-2xl border border-[#EAF0EB]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#5C665D]">Full Name</p>
                <p className="text-sm font-bold text-[#2D3A2F] mt-0.5">{user?.name || 'Career Explorer'}</p>
              </div>

              <div className="p-3.5 bg-[#F9FAFB] rounded-2xl border border-[#EAF0EB]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#5C665D]">Email Address</p>
                <p className="text-sm font-bold text-[#2D3A2F] mt-0.5">{user?.email || 'user@example.com'}</p>
              </div>

              <div className="p-3.5 bg-[#F9FAFB] rounded-2xl border border-[#EAF0EB] flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#5C665D]">Account Status</p>
                  <p className="text-sm font-bold text-emerald-700 mt-0.5">Active</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                  Verified
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsInfoModalOpen(false)}
                className="px-5 py-2.5 bg-[#2D3A2F] text-white text-xs font-bold rounded-xl hover:bg-[#3b5943] transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Safety Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-red-100 space-y-5 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#2D3A2F]">Delete Account</h3>
                  <p className="text-xs text-red-600 font-semibold">Irreversible action</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-[#2D3A2F] hover:bg-[#F5F3EC] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-red-50/80 rounded-2xl border border-red-200 text-xs text-red-700 leading-relaxed font-medium">
              Are you sure you want to delete your account? This action is permanent and will erase all your resumes, job applications, and AI chat history.
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-medium">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#5C665D]">
                  To confirm, type <span className="text-red-600 font-black tracking-wider">DELETE</span> below:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F9FAFB] border border-[#EAF0EB] rounded-xl text-xs font-bold tracking-wider text-[#2D3A2F] placeholder:font-normal focus:outline-none focus:border-red-500 focus:bg-white transition-all uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-[#5C665D] hover:bg-[#F5F3EC] rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteConfirmText.trim() !== 'DELETE' || deleteLoading}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Permanently Delete</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
