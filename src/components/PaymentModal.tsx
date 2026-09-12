'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Course } from '@/types';
import { useApp } from '@/context/AppContext';
import { 
  X, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Tag,
  ExternalLink
} from 'lucide-react';

interface PaymentModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSuccessRedirect?: () => void;
}

export default function PaymentModal({ course, isOpen, onClose, onSuccessRedirect }: PaymentModalProps) {
  const router = useRouter();
  const { enrollInCourse, showToast, currentUser } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [senderPhone, setSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  if (!isOpen) return null;

  const paymentNumbers = {
    bKash: '01712-345678',
    Nagad: '01819-876543',
    Rocket: '01911-223344-9',
  };

  const finalAmount = Math.max(0, course.offerPrice - discountAmount);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      showToast('দয়া করে একটি কুপন কোড লিখুন');
      return;
    }

    if (code === 'ADOMMO200') {
      const discount = Math.min(200, course.offerPrice);
      setDiscountAmount(discount);
      setAppliedCoupon('ADOMMO200');
      setCouponInput('ADOMMO200');
      showToast('🎉 কুপন কোড ADOMMO200 প্রযোজ্য হয়েছে! ২০০ টাকা ছাড় পেলেন।');
    } else if (code === 'PHY2026') {
      const discount = Math.round(course.offerPrice * 0.15);
      setDiscountAmount(discount);
      setAppliedCoupon('PHY2026');
      setCouponInput('PHY2026');
      showToast(`🎉 কুপন কোড PHY2026 প্রযোজ্য হয়েছে! ১৫% (৳${discount}) ছাড় পেলেন।`);
    } else {
      showToast('⚠️ অবৈধ কুপন কোড। টেস্ট করতে "ADOMMO200" ব্যবহার করুন।');
    }
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(paymentNumbers[selectedMethod].replace(/-/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !currentUser.id || currentUser.id === 'usr_guest') {
      showToast('⚠️ কোর্সে ভর্তি হতে অনুগ্রহ করে আগে আপনার শিক্ষার্থী একাউন্টে লগইন করুন!');
      onClose();
      router.push(`/auth/login?redirect=/courses/${course.id}`);
      return;
    }

    if (!senderPhone || !trxId) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const res = enrollInCourse(course.id, selectedMethod, trxId, senderPhone);
      setIsSubmitting(false);
      if (res.success) {
        setSubmittedSuccess(true);
      } else {
        if (!currentUser || !currentUser.id || currentUser.id === 'usr_guest') {
          onClose();
          router.push(`/auth/login?redirect=/courses/${course.id}`);
        }
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        
        {/* Header bar */}
        <div className="flex items-center justify-between p-4 px-5 border-b border-slate-100 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#fff2f7] text-[#ed347d] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-tight">কোর্স এনরোলমেন্ট ও পেমেন্ট</h3>
              <p className="text-[11px] text-slate-400">বিকাশ / নগদ / রকেট সেন্ড মানি ভেরিফিকেশন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {submittedSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-extrabold text-slate-800">পেমেন্ট রিকোয়েস্ট জমা হয়েছে!</h4>
                <p className="text-xs text-slate-600">
                  আপনার ট্রানজাকশন আইডি <strong>#{trxId}</strong> যাচাইয়ের জন্য জমা রয়েছে।
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#fff3f7] border border-[#ffd2e2] text-xs text-slate-700 text-left space-y-1">
                <p className="flex items-center gap-2 text-[#ed347d] font-bold">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  সুপার অ্যাডমিন প্যানেল থেকে এটি ১ ক্লিকে অনুমোদন করা যাবে।
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    if (onSuccessRedirect) onSuccessRedirect();
                  }}
                  className="w-full py-3 rounded-full font-bold text-xs text-white ph-btn-pink shadow-md flex items-center justify-center gap-2"
                >
                  ক্লাসরুমে যান
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Course Order Summary Pill */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{course.title}</h4>
                  <span className="text-[11px] text-[#ed347d] font-bold">{course.batch}</span>
                </div>
                <div className="text-right shrink-0">
                  {course.regularPrice > course.offerPrice && (
                    <del className="text-[10px] text-slate-400 block">৳ {course.regularPrice}</del>
                  )}
                  <span className="text-base font-black text-[#ed347d]">
                    ৳ {finalAmount}
                  </span>
                </div>
              </div>

              {/* PROMINENT COUPON CODE SECTION */}
              <div className="p-3 rounded-2xl bg-[#fff8fa] border border-[#fecdd3] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#ed347d] flex items-center gap-1.5 text-xs">
                    <Tag className="w-3.5 h-3.5" />
                    <span>কুপন কোড ব্যবহার করুন:</span>
                  </span>
                  {appliedCoupon && (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✓ কুপন প্রযোজ্য (-৳{discountAmount})
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="কুপন কোড (যেমন: ADOMMO200)"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#ed347d] uppercase font-bold text-xs text-slate-800 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="px-3 py-1.5 rounded-xl bg-[#ed347d] hover:bg-[#d92269] text-white font-bold text-xs transition-colors shrink-0 shadow-xs"
                  >
                    প্রয়োগ করুন
                  </button>
                </div>

                {/* 1-Click Test Coupons */}
                <div className="flex items-center gap-2 pt-0.5 text-[10px] text-slate-500 flex-wrap">
                  <span className="font-semibold text-slate-400">ক্লিক করে কুপন নিন:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon('ADOMMO200')}
                    className="px-2 py-0.5 rounded-md bg-white border border-pink-200 text-[#ed347d] font-bold hover:bg-pink-50"
                  >
                    ADOMMO200 (৳২০০ ছাড়)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon('PHY2026')}
                    className="px-2 py-0.5 rounded-md bg-white border border-pink-200 text-[#ed347d] font-bold hover:bg-pink-50"
                  >
                    PHY2026 (১৫% ছাড়)
                  </button>
                </div>
              </div>

              {/* Payment Methods Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">পেমেন্ট মেথড নির্বাচন করুন:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('bKash')}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-0.5 transition-all ${
                      selectedMethod === 'bKash'
                        ? 'border-[#e2136e] bg-[#fff0f6] text-[#e2136e] shadow-xs'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-black text-[#e2136e]">bKash</span>
                    <span className="text-[9px] font-semibold">বিকাশ (Personal)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('Nagad')}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-0.5 transition-all ${
                      selectedMethod === 'Nagad'
                        ? 'border-[#f7931e] bg-[#fffaf3] text-[#f7931e] shadow-xs'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-black text-[#f7931e]">নগদ</span>
                    <span className="text-[9px] font-semibold">নগদ (Personal)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('Rocket')}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-0.5 transition-all ${
                      selectedMethod === 'Rocket'
                        ? 'border-[#8c388e] bg-[#fdf5fe] text-[#8c388e] shadow-xs'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-black text-[#8c388e]">রকেট</span>
                    <span className="text-[9px] font-semibold">রকেট (Personal)</span>
                  </button>
                </div>
              </div>

              {/* Number to send money */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">
                    অফিশিয়াল {selectedMethod} পার্সোনাল নম্বর:
                  </span>
                  <strong className="text-sm sm:text-base font-mono font-bold text-slate-800">
                    {paymentNumbers[selectedMethod]}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                  <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                </button>
              </div>

              {/* Submission Form */}
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 block">
                    যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Phone) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 block">
                    ট্রানজাকশন আইডি (TrxID) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: BKA879LMN2"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs uppercase font-mono focus:outline-none focus:border-[#ed347d]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white ph-btn-pink shadow-md hover:scale-[1.01] transition-transform flex items-center justify-center gap-1.5 mt-2"
                >
                  <span>{isSubmitting ? 'যাচাই হচ্ছে...' : `৳${finalAmount} পেমেন্ট নিশ্চিত করুন`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Link to Full Page Checkout */}
              <div className="pt-2 text-center border-t border-slate-100">
                <Link
                  href={`/courses/${course.id}/checkout`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ed347d] hover:underline"
                >
                  <span>অথবা ফুল-স্ক্রিন চেকআউট পেইজে যান</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

            </>
          )}
        </div>

      </div>
    </div>
  );
}
