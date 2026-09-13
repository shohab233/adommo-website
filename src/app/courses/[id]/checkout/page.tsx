'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import AdommoLogo from '@/components/AdommoLogo';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Copy, 
  Check, 
  CheckCircle2, 
  Phone, 
  Sparkles, 
  Zap,
  Lock,
  Tag,
  Clock,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CourseCheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const { courses, enrollInCourse, isEnrolled, showToast, currentUser } = useApp();

  const course = courses.find((c) => c.id === resolvedParams.id) || courses[0];
  const enrolled = course ? isEnrolled(course.id) : false;

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-slate-50">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full space-y-4">
          <h2 className="text-xl font-bold text-slate-800">কোর্সটি খুঁজে পাওয়া যায়নি</h2>
          <p className="text-xs text-slate-500">বর্তমানে কোনো কোর্স উপলব্ধ নেই অথবা কোর্সটি সরিয়ে নেওয়া হয়েছে।</p>
          <Link href="/courses" className="inline-block px-5 py-2.5 rounded-full bg-pink-500 text-white font-bold text-xs">
            কোর্স ক্যাটালগে ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [senderPhone, setSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(0);
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const paymentNumbers = {
    bKash: '01712-345678',
    Nagad: '01819-876543',
    Rocket: '01911-223344-9',
  };

  const finalAmount = Math.max(0, course.offerPrice - discountApplied);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(paymentNumbers[paymentMethod].replace(/-/g, ''));
    setCopied(true);
    showToast('নম্বর কপি করা হয়েছে!');
    setTimeout(() => setCopied(false), 2000);
  };

  const applyCoupon = (codeToUse?: string) => {
    const code = (codeToUse || couponCode).toUpperCase().trim();
    if (code === 'ADOMMO200') {
      const discount = Math.min(200, course.offerPrice);
      setDiscountApplied(discount);
      setCouponSuccess(true);
      setCouponCode('ADOMMO200');
      showToast('🎉 ২০০ টাকা স্পেশাল কুপন ডিসকাউন্ট সফলভাবে যুক্ত হয়েছে!');
    } else if (code === 'PHY2026') {
      const discount = Math.round(course.offerPrice * 0.15);
      setDiscountApplied(discount);
      setCouponSuccess(true);
      setCouponCode('PHY2026');
      showToast(`🎉 কুপন কোড PHY2026 সফলভাবে যুক্ত হয়েছে! ১৫% (৳${discount}) ছাড় পেলেন।`);
    } else {
      showToast('⚠️ সঠিক কুপন কোড লিখুন (যেমন: ADOMMO200)');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !currentUser.id || currentUser.id === 'usr_guest') {
      showToast('⚠️ কোর্সে ভর্তি হতে অনুগ্রহ করে আগে আপনার শিক্ষার্থী একাউন্টে লগইন করুন!');
      router.push(`/auth/login?redirect=/courses/${course.id}/checkout`);
      return;
    }

    if (!senderPhone.trim()) {
      showToast('দয়া করে যে নম্বর থেকে টাকা পাঠিয়েছেন তা লিখুন');
      return;
    }
    if (!trxId.trim()) {
      showToast('দয়া করে বিকাশ/নগদ এর TrxID লিখুন');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = enrollInCourse(course.id, paymentMethod, trxId, senderPhone);
      setLoading(false);
      if (res.success) {
        setIsSuccess(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        if (!currentUser || !currentUser.id || currentUser.id === 'usr_guest') {
          router.push(`/auth/login?redirect=/courses/${course.id}/checkout`);
        }
      }
    }, 600);
  };

  if (enrolled) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">আপনি ইতিমধ্যে এই কোর্সে যুক্ত আছেন!</h2>
          <p className="text-xs text-slate-500">আপনার ক্লাসরুম প্রস্তুত রয়েছে, যেকোনো সময় ক্লাস দেখতে পারেন।</p>
          <Link
            href={`/classroom/${course.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-white ph-btn-pink shadow-md"
          >
            <span>ক্লাসরুমে প্রবেশ করুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff5f8] via-[#fafafa] to-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Back & Header */}
        <div className="flex items-center justify-between">
          <Link
            href={`/courses/${course.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#ed347d] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>কোর্স বিস্তারিত পেজে ফিরে যান</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>নিরাপদ পেমেন্ট ভেরিফিকেশন</span>
          </div>
        </div>

        {isSuccess ? (
          /* Success Screen */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 sm:p-12 text-center space-y-5 max-w-xl mx-auto animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900">
                পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                ট্রানজাকশন আইডি: <strong className="text-slate-900">#{trxId}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-center space-y-1.5 text-slate-700">
              <p className="font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                পেমেন্ট ভেরিফিকেশন চলমান রয়েছে
              </p>
              <p className="text-[11px] text-slate-600">
                ভেরিফিকেশন সম্পন্ন হওয়া মাত্রই আপনার ড্যাশবোর্ডে ক্লাসরুম স্বয়ংক্রিয়ভাবে খুলে যাবে।
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/profile"
                className="w-full sm:w-auto px-8 py-3 rounded-full font-bold text-xs text-white ph-btn-pink shadow-lg"
              >
                আমার ড্যাশবোর্ডে যান
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                হোমে ফিরে যান
              </Link>
            </div>
          </div>
        ) : (
          /* Main 2-Col Checkout Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left 2 Cols: Payment Steps */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
              
              {/* Step 1: Provider selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#ed347d] text-white font-bold text-xs flex items-center justify-center">
                    ১
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    পেমেন্ট মেথড নির্বাচন করুন
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* bKash */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bKash')}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === 'bKash'
                        ? 'border-[#e2136e] bg-[#fff0f6] text-[#e2136e] shadow-md shadow-pink-500/10'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <span className="text-base font-black tracking-tight text-[#e2136e]">bKash</span>
                    <span className="text-[10px] font-bold">বিকাশ (Personal)</span>
                  </button>

                  {/* Nagad */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Nagad')}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === 'Nagad'
                        ? 'border-[#f7931e] bg-[#fffaf3] text-[#f7931e] shadow-md shadow-orange-500/10'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <span className="text-base font-black tracking-tight text-[#f7931e]">নগদ</span>
                    <span className="text-[10px] font-bold">নগদ (Personal)</span>
                  </button>

                  {/* Rocket */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Rocket')}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === 'Rocket'
                        ? 'border-[#8c388e] bg-[#fdf5fe] text-[#8c388e] shadow-md shadow-purple-500/10'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <span className="text-base font-black tracking-tight text-[#8c388e]">রকেট</span>
                    <span className="text-[10px] font-bold">রকেট (Personal)</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Send Money Details */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#ed347d] text-white font-bold text-xs flex items-center justify-center">
                    ২
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    সেন্ড মানি করার নম্বর (Send Money)
                  </h3>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block">
                      অফিশিয়াল {paymentMethod} পার্সোনাল নম্বর:
                    </span>
                    <strong className="text-base sm:text-lg text-slate-900 font-mono tracking-wider">
                      {paymentNumbers[paymentMethod]}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#fff8fa] border border-[#ffdbe7] text-[11px] text-slate-600 space-y-1">
                  <p className="font-bold text-[#ed347d]">কীভাবে টাকা পাঠাবেন?</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                    <li>আপনার {paymentMethod} অ্যাপ অথবা ইউএসএসডি কোড ডায়াল করুন।</li>
                    <li>'Send Money' অপশন সিলেক্ট করে উপরের নম্বরে ঠিক <strong>৳{finalAmount}</strong> পাঠান।</li>
                    <li>সফল লেনদেনের পর পাওয়া Transaction ID (TrxID) নিচে লিখে জমা দিন।</li>
                  </ol>
                </div>
              </div>

              {/* Step 3: Submission Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#ed347d] text-white font-bold text-xs flex items-center justify-center">
                    ৩
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    ট্রানজাকশন তথ্য প্রদান করুন
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      প্রেরকের মোবাইল নম্বর (Sender Phone)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#ed347d] focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      ট্রানজাকশন আইডি (TrxID)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: BKA7X89LM3"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-[#ed347d] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Prominent Coupon Box */}
                <div className="p-4 rounded-2xl bg-[#fff8fa] border border-[#fecdd3] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#ed347d] flex items-center gap-1.5">
                      <Tag className="w-4 h-4" />
                      <span>কুপন কোড ব্যবহার করুন:</span>
                    </span>
                    {couponSuccess && (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        ✓ কুপন প্রযোজ্য হয়েছে (-৳{discountApplied})
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="কুপন কোড (যেমন: ADOMMO200)"
                      className="flex-1 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#ed347d] uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => applyCoupon()}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#ed347d] hover:bg-[#d92269] text-white transition-colors shrink-0 shadow-xs"
                    >
                      প্রয়োগ করুন
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap pt-0.5">
                    <span className="font-semibold text-slate-400">ক্লিক করে কুপন নিন:</span>
                    <button
                      type="button"
                      onClick={() => applyCoupon('ADOMMO200')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-pink-200 text-[#ed347d] font-bold hover:bg-pink-50 transition-colors"
                    >
                      ADOMMO200 (৳২০০ ছাড়)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyCoupon('PHY2026')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-pink-200 text-[#ed347d] font-bold hover:bg-pink-50 transition-colors"
                    >
                      PHY2026 (১৫% ছাড়)
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full font-bold text-xs sm:text-sm text-white ph-btn-pink shadow-xl shadow-pink-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span>যাচাই হচ্ছে...</span>
                  ) : (
                    <>
                      <span>৳{finalAmount} পেমেন্ট ভেরিফাই ও এনরোল নিশ্চিত করুন</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>

            </div>

            {/* Right 1 Col: Summary & Guarantee */}
            <div className="space-y-5">
              
              {/* Summary Card */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
                
                <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100">
                  অর্ডার বিবরণী
                </h3>

                <div className="flex items-center gap-3">
                  <img
                    src={course.coverImage || '/courses/frb26_banner.png'}
                    alt={course.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/courses/frb26_banner.png';
                    }}
                    className="w-16 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{course.title}</h4>
                    <span className="text-[10px] text-[#ed347d] font-bold block">{course.batch}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>মূল কোর্স ফি:</span>
                    <span>৳{course.regularPrice}</span>
                  </div>
                  {course.regularPrice > course.offerPrice && (
                    <div className="flex justify-between text-[#ed347d] font-semibold">
                      <span>অফার ছাড়:</span>
                      <span>-৳{course.regularPrice - course.offerPrice}</span>
                    </div>
                  )}
                  {discountApplied > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>কুপন ছাড় (ADOMMO200):</span>
                      <span>-৳{discountApplied}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                    <span>মোট প্রদেয়:</span>
                    <span className="text-[#ed347d] text-base">৳{finalAmount}</span>
                  </div>
                </div>

              </div>

              {/* Course Benefits Pill */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3 text-xs text-slate-700">
                <h4 className="font-bold text-slate-900">এনরোল করলেই যা যা পাবেন:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>ফুল এইচডি লাইভ ও রেকর্ডেড ক্লাস অ্যাক্সেস</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>প্রিন্ট উপযোগী লেকচার শিট ও ফর্মুলা বুক PDF</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>টাইমার ও নেগেটিভ মার্কিং সহ ওএমআর এক্সাম</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>২৪/৭ ডাউট সলভ ও ডিসকাশন গ্রুপ অ্যাক্সেস</span>
                  </li>
                </ul>
              </div>

              {/* Help box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1 text-xs">
                <span className="text-slate-400 text-[11px] block">পেমেন্টে কোনো সহায়তা লাগলে:</span>
                <strong className="text-slate-800 text-sm block">+8809638123409</strong>
                <span className="text-[10px] text-slate-500">সকাল ১০টা থেকে রাত ৮টা পর্যন্ত</span>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
