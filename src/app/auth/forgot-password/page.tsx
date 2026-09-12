'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import AdommoLogo from '@/components/AdommoLogo';
import {
  Mail,
  Lock,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  GraduationCap,
  Briefcase
} from 'lucide-react';

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const isTeacher = roleParam === 'teacher';

  const { showToast } = useApp();

  // 3-Step Wizard: 1: Email, 2: OTP, 3: New Password, 4: Success
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(45);

  // Timer for resend
  useEffect(() => {
    if (step === 2 && countdown > 0) {
      const timer = setInterval(() => setCountdown(c => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, countdown]);

  // Handle 6-Box OTP digit changes with paste and backspace support
  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length > 1) {
      const updated = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        if (cleaned[i]) updated[i] = cleaned[i];
      }
      setOtpDigits(updated);
      const nextIdx = Math.min(cleaned.length, 5);
      const nextEl = document.getElementById(`fp-otp-input-${nextIdx}`);
      if (nextEl) nextEl.focus();
      return;
    }

    const singleChar = cleaned.slice(-1);
    const updated = [...otpDigits];
    updated[index] = singleChar;
    setOtpDigits(updated);

    if (singleChar && index < 5) {
      const nextInput = document.getElementById(`fp-otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`fp-otp-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // Step 1: Send Real Gmail OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast('⚠️ অনুগ্রহ করে সঠিক জিমেইল বা ইমেইল ঠিকানা দিন');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), purpose: 'forgot_password' }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setStep(2);
        setCountdown(45);
        showToast(`📩 ${email} ঠিকানায় ৬-সংখ্যার ওটিপি কোড পাঠানো হয়েছে!`);
      } else {
        showToast(data.error || 'ওটিপি পাঠাতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      setLoading(false);
      showToast('সার্ভার সংযোগে ত্রুটি দেখা দিয়েছে।');
    }
  };

  // Step 2: Verify OTP (Strict 6-Digit Real Verification)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpDigits.join('');
    if (enteredCode.length < 6) {
      showToast('⚠️ অনুগ্রহ করে ৬ ডিজিটের সম্পূর্ণ ওটিপি কোডটি লিখুন');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: enteredCode,
          purpose: 'forgot_password'
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success && data.resetToken) {
        setResetToken(data.resetToken);
        setStep(3);
        showToast('✅ ওটিপি যাচাই সফল হয়েছে! এবার নতুন পাসওয়ার্ড সেট করুন।');
      } else {
        showToast(data.error || 'ওটিপি সঠিক নয় বা মেয়াদ শেষ হয়ে গেছে।');
      }
    } catch (err) {
      setLoading(false);
      showToast('সার্ভার সংযোগে ত্রুটি দেখা দিয়েছে।');
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('⚠️ পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('⚠️ উভয় পাসওয়ার্ড একই হতে হবে');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          newPassword: newPassword.trim(),
          resetToken,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setStep(4);
        showToast('🎉 আপনার পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!');
      } else {
        showToast(data.error || 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      setLoading(false);
      showToast('সার্ভার সংযোগে ত্রুটি দেখা দিয়েছে।');
    }
  };

  const loginRedirectPath = isTeacher ? '/teacher' : '/auth/login';

  return (
    <div className="min-h-[calc(100vh-108px)] bg-gradient-to-br from-[#fff4f8] via-[#fafbfc] to-[#f4f3ff] flex items-center justify-center py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Glow Backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-pink-300/30 via-rose-200/20 to-indigo-300/25 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[500px] relative z-10 space-y-4 animate-fade-in">
        {/* Top bar navigation */}
        <div className="flex items-center justify-between px-2">
          <Link
            href={loginRedirectPath}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#ed347d] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>লগইন পেজে ফিরে যান</span>
          </Link>

          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200/80 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>নিরাপদ পাসওয়ার্ড রিকভারি</span>
          </span>
        </div>

        {/* Central Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[36px] border border-pink-100 shadow-2xl shadow-pink-500/10 p-8 sm:p-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <AdommoLogo />
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-[#fff0f5] text-[#ed347d] border border-pink-200 shadow-xs">
                {isTeacher ? <Briefcase className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                <span>{isTeacher ? 'শিক্ষক পাসওয়ার্ড রিকভারি' : 'শিক্ষার্থী পাসওয়ার্ড রিকভারি'}</span>
              </span>
              <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight pt-1">
                পাসওয়ার্ড পরিবর্তন ও রিসেট
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                আপনার রেজিস্টার্ড জিমেইল এ ওটিপি ভেরিফিকেশনের মাধ্যমে নিরাপদে নতুন পাসওয়ার্ড সেট করুন।
              </p>
            </div>
          </div>

          {/* Stepper indicator if not completed */}
          {step < 4 && (
            <div className="flex items-center justify-center gap-2 pt-1">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step === s ? 'w-10 bg-[#ed347d]' : step > s ? 'w-6 bg-emerald-500' : 'w-6 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4 pt-1 animate-in fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  রেজিস্টার্ড ইমেইল এড্রেস *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="যেমন: student@example.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 transition-all text-slate-800 bg-slate-50/40 focus:bg-white shadow-xs"
                  />
                </div>
              </div>

              {/* Quick pre-fill helper for demo */}
              <div className="flex justify-end">
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl text-sm font-bold text-white ph-btn-pink shadow-xl shadow-pink-500/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-75"
              >
                <span>{loading ? 'ওটিপি পাঠানো হচ্ছে...' : 'জিমেইলে ওটিপি কোড পাঠান'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 pt-1 animate-in fade-in">
              <div className="p-3 bg-pink-50/60 rounded-2xl border border-pink-100 text-center space-y-1">
                <span className="text-xs text-slate-600 font-medium">ওটিপি পাঠানো হয়েছে:</span>
                <p className="text-xs font-bold text-slate-900 font-mono">{email}</p>
              </div>

              <div className="space-y-2 text-center">
                <label className="text-xs font-bold text-slate-700 block">
                  জিমেইলে আসা ৬-সংখ্যার ভেরিফিকেশন কোড লিখুন *
                </label>
                
                {/* 6 Box OTP Input */}
                <div className="flex justify-center gap-2 sm:gap-2.5 py-1">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`fp-otp-input-${idx}`}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-2xl border-2 border-slate-200 focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 focus:outline-none text-slate-900 bg-slate-50/60 focus:bg-white transition-all shadow-sm"
                    />
                  ))}
                </div>
              </div>

              {/* Resend button & timer */}
              <div className="flex items-center justify-between text-xs px-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-500 hover:text-slate-800 font-medium"
                >
                  ইমেইল পরিবর্তন
                </button>

                <div>
                  {countdown > 0 ? (
                    <span className="text-slate-500 font-medium">
                      পুনরায় পাঠান (<span className="text-[#ed347d] font-bold font-mono">{countdown}s</span>)
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[#ed347d] font-bold hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>পুনরায় কোড পাঠান</span>
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl text-sm font-bold text-white ph-btn-pink shadow-xl shadow-pink-500/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-75"
              >
                <span>{loading ? 'যাচাই করা হচ্ছে...' : 'ওটিপি যাচাই সম্পন্ন করুন'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 3: Enter New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4 pt-1 animate-in fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  নতুন পাসওয়ার্ড নিশ্চিত করুন *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 transition-all text-slate-800 bg-slate-50/40 focus:bg-white shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl text-sm font-bold text-white ph-btn-pink shadow-xl shadow-pink-500/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-75"
              >
                <span>{loading ? 'পাসওয়ার্ড আপডেট হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন সম্পন্ন করুন'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 4: Success View */}
          {step === 4 && (
            <div className="text-center space-y-5 py-4 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900">
                  পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  আপনার নতুন পাসওয়ার্ড ডাটাবেসে সফলভাবে সংরক্ষিত হয়েছে। এবার আপনার নতুন পাসওয়ার্ড দিয়ে অ্যাকাউন্টে লগইন করুন।
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push(loginRedirectPath)}
                className="w-full py-4 px-6 rounded-2xl text-sm font-bold text-white ph-btn-pink shadow-xl shadow-pink-500/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>লগইন পেজে প্রবেশ করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">লোড হচ্ছে...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
