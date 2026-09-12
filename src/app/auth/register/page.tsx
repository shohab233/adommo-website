'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import AdommoLogo from '@/components/AdommoLogo';
import { 
  User, 
  Phone, 
  Mail, 
  Lock, 
  School, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  KeyRound,
  RotateCcw,
  Check,
  GraduationCap
} from 'lucide-react';

export default function StudentRegisterPage() {
  const router = useRouter();
  const { registerWithApi, showToast } = useApp();

  // 4 Steps: 1: Personal, 2: Academic, 3: Email OTP, 4: Password
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Personal Info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Step 2: Academic Info
  const [college, setCollege] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [targetBatch, setTargetBatch] = useState('HSC 2026');

  // Step 3: Email OTP Verification (Real 6-Digit Gmail OTP)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(45);

  // Step 4: Security & Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (currentStep === 3 && resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep, resendTimer]);

  // Handle OTP digit changes with full paste and backspace auto-focus
  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length > 1) {
      // User pasted multiple characters (e.g. 6-digit OTP)
      const updated = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        if (cleaned[i]) updated[i] = cleaned[i];
      }
      setOtpDigits(updated);
      const nextIdx = Math.min(cleaned.length, 5);
      const nextEl = document.getElementById(`otp-reg-input-${nextIdx}`);
      if (nextEl) nextEl.focus();
      return;
    }

    const singleChar = cleaned.slice(-1);
    const updated = [...otpDigits];
    updated[index] = singleChar;
    setOtpDigits(updated);

    // Auto focus next input
    if (singleChar && index < 5) {
      const nextInput = document.getElementById(`otp-reg-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-reg-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // Step 1 Validator
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('দয়া করে আপনার পুরো নাম লিখুন');
      return;
    }
    if (!phone.trim() || phone.trim().length < 11) {
      showToast('দয়া করে সচল ১১ ডিজিটের মোবাইল নম্বর দিন');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showToast('দয়া করে সঠিক ইমেইল এড্রেস লিখুন (OTP কোড পাঠানো হবে)');
      return;
    }
    setCurrentStep(2);
  };

  // Step 2 Validator
  const handleStep2Next = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!college.trim()) {
      showToast('দয়া করে আপনার কলেজ বা স্কুলের নাম লিখুন');
      return;
    }
    setCurrentStep(3);
    setResendTimer(45);
    showToast(`📩 ${email} এ ওটিপি কোড পাঠানো হচ্ছে...`);

    // Live API Call to send real Gmail OTP
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), purpose: 'registration' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`📩 ${email} এ ওটিপি সফলভাবে পাঠানো হয়েছে!`);
      }
    } catch {}
  };

  // Real Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setResendTimer(45);
    showToast(`📩 ${email} এ পুনরায় ওটিপি পাঠানো হচ্ছে...`);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), purpose: 'registration' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`📩 নতুন ওটিপি সফলভাবে ${email} এ পাঠানো হয়েছে!`);
      } else {
        showToast(data.error || 'ওটিপি পাঠাতে সমস্যা হয়েছে।');
      }
    } catch {
      showToast('সার্ভার এরর, পুনরায় চেষ্টা করুন।');
    }
  };

  // Step 3 OTP Validator (Strict 6-Digit Real Verification)
  const handleStep3Verify = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpDigits.join('');
    if (enteredCode.length < 6) {
      showToast('দয়া করে ৬ ডিজিটের সম্পূর্ণ ওটিপি কোডটি লিখুন');
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
          purpose: 'registration'
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setOtpVerified(true);
        showToast('✅ ইমেইল ওটিপি সফলভাবে যাচাই সম্পন্ন হয়েছে!');
        setTimeout(() => {
          setCurrentStep(4);
        }, 250);
      } else {
        showToast(data.error || 'ভুল ওটিপি কোড। পুনরায় চেষ্টা করুন।');
      }
    } catch {
      setLoading(false);
      showToast('সার্ভারের সাথে সংযোগে ত্রুটি দেখা দিয়েছে।');
    }
  };

  // Step 4 Final Submit Validator
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      showToast('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }
    if (password !== confirmPassword) {
      showToast('উভয় পাসওয়ার্ড একই হতে হবে');
      return;
    }
    if (!agreeTerms) {
      showToast('শর্তাবলীতে সম্মতি প্রদান করুন');
      return;
    }

    setLoading(true);
    const result = await registerWithApi({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      college: `${college.trim()} (${district})`,
      password: password.trim(),
      role: 'student',
    });
    setLoading(false);

    if (result.success) {
      router.push('/profile');
    }
  };

  const stepsMeta = [
    { num: 1, title: 'ব্যক্তিগত', icon: User },
    { num: 2, title: 'একাডেমিক', icon: GraduationCap },
    { num: 3, title: 'ইমেইল OTP', icon: ShieldCheck },
    { num: 4, title: 'পাসওয়ার্ড', icon: KeyRound },
  ];

  return (
    <div className="min-h-[calc(100vh-108px)] bg-gradient-to-br from-[#fff4f8] via-[#fafbfc] to-[#f4f3ff] flex items-center justify-center py-10 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Ambient Glow Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-pink-300/30 via-rose-200/20 to-indigo-300/25 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-[530px] relative z-10 space-y-4 animate-fade-in">
        
        {/* Top bar with back to login & indicator */}
        <div className="flex items-center justify-between px-2">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#ed347d] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>লগইনে ফিরে যান</span>
          </Link>

          <span className="text-[11px] font-bold text-[#ed347d] flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-pink-200/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#ed347d] animate-pulse" />
            <span>ধাপ {currentStep} / ৪ : {stepsMeta[currentStep - 1].title}</span>
          </span>
        </div>

        {/* Centered Spacious Premium Glass Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[36px] border border-pink-100 shadow-2xl shadow-pink-500/10 p-8 sm:p-10 space-y-6">
          
          {/* Logo & Heading */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <AdommoLogo />
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-[#fff0f5] text-[#ed347d] border border-pink-200 shadow-xs">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>নতুন শিক্ষার্থী রেজিস্ট্রেশন</span>
              </span>
              <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight pt-0.5">
                অ্যাকাউন্ট তৈরি করুন
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                ৪টি সহজ ধাপে অদম্য প্ল্যাটফর্মে যুক্ত হয়ে শুরু করুন আপনার অনলাইন প্রস্তুতি
              </p>
            </div>
          </div>

          {/* Redesigned Segmented Capsule Step Bar */}
          <div className="bg-slate-50/80 p-2 rounded-2xl border border-slate-200/80 shadow-inner">
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {stepsMeta.map((s) => {
                const Icon = s.icon;
                const isCompleted = currentStep > s.num;
                const isActive = currentStep === s.num;

                return (
                  <div
                    key={s.num}
                    className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-white shadow-md shadow-pink-500/10 border border-pink-200 text-[#ed347d] scale-[1.02]'
                        : isCompleted
                        ? 'text-emerald-600 bg-emerald-50/50'
                        : 'text-slate-400 opacity-70'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black mb-1 transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white shadow-sm shadow-pink-500/30'
                          : isCompleted
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                    </div>
                    <span className="text-[11px] font-bold tracking-tight truncate max-w-full text-center">
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Smooth animated progress line */}
            <div className="mt-2 h-1.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#fa507e] to-[#ec376d] transition-all duration-500 ease-out rounded-full shadow-sm"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* STEP 1: Personal Info Form */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-4 pt-1 animate-in fade-in slide-in-from-right-3 duration-300">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">আপনার পূর্ণ নাম *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: তানভীর আহমেদ"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 transition-all text-slate-800 bg-slate-50/40 focus:bg-white shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">সচল মোবাইল নম্বর *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 transition-all text-slate-800 bg-slate-50/40 focus:bg-white shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  ইমেইল ঠিকানা * <span className="text-[11px] font-medium text-slate-400">(পরবর্তী ধাপে ওটিপি কোড যাবে)</span>
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
                    placeholder="student@example.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 transition-all text-slate-800 bg-slate-50/40 focus:bg-white shadow-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white ph-btn-pink shadow-lg shadow-pink-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer"
              >
                <span>পরবর্তী ধাপ (একাডেমিক তথ্য)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Academic Info Form */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2Next} className="space-y-4 pt-1 animate-in fade-in slide-in-from-right-3 duration-300">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">কলেজ / শিক্ষাপ্রতিষ্ঠানের নাম *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <School className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="যেমন: নটর ডেম কলেজ, ঢাকা"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 transition-all text-slate-800 bg-slate-50/40 focus:bg-white shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">আপনার জেলা</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 text-slate-800 bg-slate-50/40 focus:bg-white transition-all shadow-xs font-medium"
                  >
                    <option value="ঢাকা">ঢাকা</option>
                    <option value="চট্টগ্রাম">চট্টগ্রাম</option>
                    <option value="রাজশাহী">রাজশাহী</option>
                    <option value="খুলনা">খুলনা</option>
                    <option value="বরিশাল">বরিশাল</option>
                    <option value="সিলেট">সিলেট</option>
                    <option value="রংপুর">রংপুর</option>
                    <option value="ময়মনসিংহ">ময়মনসিংহ</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">টার্গেট ব্যাচ</label>
                  <select
                    value={targetBatch}
                    onChange={(e) => setTargetBatch(e.target.value)}
                    className="w-full px-3.5 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 text-slate-800 bg-slate-50/40 focus:bg-white transition-all shadow-xs font-medium"
                  >
                    <option value="HSC 2026">HSC 2026</option>
                    <option value="HSC 2025">HSC 2025</option>
                    <option value="Varsity A Unit">ভার্সিটি 'ক' ইউনিট</option>
                    <option value="Medical Admission">মেডিকেল এডমিশন</option>
                    <option value="Engineering">ইঞ্জিনিয়ারিং গুচ্ছ</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-1/3 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>পূর্ববর্তী</span>
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white ph-btn-pink shadow-lg shadow-pink-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>ইমেইল ওটিপি ধাপে যান</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Email OTP Verification Form */}
          {currentStep === 3 && (
            <form onSubmit={handleStep3Verify} className="space-y-5 pt-1 animate-in fade-in slide-in-from-right-3 duration-300 text-center">
              
              <div className="w-16 h-16 mx-auto rounded-3xl bg-[#fff0f5] border border-pink-200 flex items-center justify-center text-[#ed347d] shadow-sm shadow-pink-500/10">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">ইমেইল ওটিপি যাচাইকরণ</h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  <strong className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md font-mono">{email}</strong> ঠিকানায় পাঠানো ৬-সংখ্যার ভেরিফিকেশন কোডটি লিখুন
                </p>
              </div>

              {/* 6 Box OTP Input */}
              <div className="flex justify-center gap-2 sm:gap-2.5 py-1">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-reg-input-${idx}`}
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

              {/* Timer & Real Resend */}
              <div className="flex items-center justify-between text-xs text-slate-500 px-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                <span className="text-slate-500 font-medium">কোড পাননি?</span>
                <div className="text-slate-600 font-medium">
                  {resendTimer > 0 ? (
                    <span>পুনরায় পাঠান (<span className="text-[#ed347d] font-bold font-mono">{resendTimer}s</span>)</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[#ed347d] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>পুনরায় ওটিপি পাঠান</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-1/3 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>পূর্ববর্তী</span>
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white ph-btn-pink shadow-lg shadow-pink-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>ওটিপি যাচাই সম্পন্ন করুন</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Password & Submit Form */}
          {currentStep === 4 && (
            <form onSubmit={handleFinalSubmit} className="space-y-4 pt-1 animate-in fade-in slide-in-from-right-3 duration-300">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 transition-all text-slate-800 bg-slate-50/40 focus:bg-white shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">পাসওয়ার্ড নিশ্চিত করুন *</label>
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

              <div className="pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#ed347d] focus:ring-[#ed347d]"
                  />
                  <span>আমি অদম্য এডটেক-এর সেবা এবং নীতিমালা শর্তাবলীতে সম্মতি প্রদান করছি।</span>
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="w-1/3 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>পূর্ববর্তী</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white ph-btn-pink shadow-lg shadow-pink-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  <span>{loading ? 'অ্যাকাউন্ট প্রস্তুত হচ্ছে...' : 'রেজিস্ট্রেশন সম্পন্ন করুন'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Link to Login */}
          <div className="pt-4 text-center border-t border-slate-100 text-xs sm:text-sm">
            <span className="text-slate-500">ইতিমধ্যে অ্যাকাউন্ট আছে? </span>
            <Link
              href="/auth/login"
              className="font-extrabold text-[#ed347d] hover:underline ml-1"
            >
              লগইন করুন
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
