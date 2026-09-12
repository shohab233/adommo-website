'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import AdommoLogo from '@/components/AdommoLogo';
import { 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  GraduationCap, 
  ArrowLeft,
  Sparkles,
  LogIn,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/profile';
  const { loginWithApi, showToast } = useApp();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      showToast('দয়া করে আপনার সচল মোবাইল নম্বর বা ইমেইল লিখুন');
      return;
    }
    if (!password) {
      showToast('দয়া করে পাসওয়ার্ড লিখুন');
      return;
    }

    setLoading(true);
    const result = await loginWithApi({
      identifier: identifier.trim(),
      password: password.trim(),
      role: 'student',
    });
    setLoading(false);

    if (result.success) {
      router.push(redirectUrl);
    }
  };

  return (
    <div className="min-h-[calc(100vh-108px)] bg-gradient-to-br from-[#fff4f8] via-[#fafbfc] to-[#f4f3ff] flex items-center justify-center py-10 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Ambient Glow Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[480px] h-[480px] bg-gradient-to-tr from-pink-300/30 to-indigo-300/25 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-[490px] relative z-10 space-y-4 animate-fade-in">
        
        {/* Top bar with back to home */}
        <div className="flex items-center justify-between px-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#ed347d] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোমপেজে ফিরে যান</span>
          </Link>

          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200/80 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>১০০% নিরাপদ অ্যাক্সেস</span>
          </span>
        </div>

        {/* Centered Premium Glass Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[36px] border border-pink-100 shadow-2xl shadow-pink-500/10 p-8 sm:p-10 space-y-6">
          
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <AdommoLogo />
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-[#fff0f5] text-[#ed347d] border border-pink-200 shadow-xs">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>শিক্ষার্থী লগইন পোর্টাল</span>
              </span>
              <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight pt-1">
                অ্যাকাউন্টে প্রবেশ করুন
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                আপনার ক্লাসরুম, লেকচার শিট ও লাইভ পরীক্ষার ফলাফলে প্রবেশ করতে লগইন করুন
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 pt-1">
            
            {/* Phone or Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                মোবাইল নম্বর অথবা ইমেইল *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="01XXXXXXXXX অথবা email@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 transition-all text-slate-800 bg-slate-50/40 focus:bg-white shadow-xs"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">পাসওয়ার্ড *</label>
                <Link
                  href="/auth/forgot-password?role=student"
                  className="text-xs font-bold text-[#ed347d] hover:underline"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 transition-all text-slate-800 bg-slate-50/40 focus:bg-white shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#ed347d] focus:ring-[#ed347d]"
                />
                <span>আমাকে মনে রাখুন</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl text-sm font-bold text-white ph-btn-pink shadow-xl shadow-pink-500/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'লগইন যাচাই হচ্ছে...' : 'অ্যাকাউন্টে প্রবেশ করুন'}</span>
            </button>

          </form>


          {/* Link to Register */}
          <div className="pt-2 text-center border-t border-slate-100 text-xs sm:text-sm">
            <span className="text-slate-500">আপনার কি কোনো অ্যাকাউন্ট নেই? </span>
            <Link
              href="/auth/register"
              className="font-black text-[#ed347d] hover:underline ml-1"
            >
              নতুন অ্যাকাউন্ট তৈরি করুন
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}

export default function StudentLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-50">
        <div className="text-center font-bold text-slate-500 text-sm">লোড হচ্ছে...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
