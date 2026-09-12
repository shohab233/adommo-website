'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Sparkles, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Link as LinkIcon, 
  KeyRound, 
  Layers, 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  Trash2, 
  Clock, 
  Info,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FolderSync,
  Copy,
  Check,
  Smartphone,
  FileUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';

interface AcsLiveBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenJsonUpload?: () => void;
}

interface BridgeItem {
  id: string;
  courseId: string;
  title: string;
  targetCourseId: string;
  subdomain: string;
  apiBase: string;
  tokenMasked?: string;
  archiveCourseId?: string;
  lastSyncedAt: string;
  totalLectures: number;
  status: 'connected' | 'error';
  lastError?: string;
  lastDiff?: any;
}

export default function AcsLiveBridgeModal({ isOpen, onClose, onOpenJsonUpload }: AcsLiveBridgeModalProps) {
  const { courses, addCourse, updateCourse, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'connect' | 'active'>('connect');
  const [bridges, setBridges] = useState<BridgeItem[]>([]);
  const [loadingBridges, setLoadingBridges] = useState(false);

  // Form States
  const [courseUrlOrId, setCourseUrlOrId] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [archiveUrlOrId, setArchiveUrlOrId] = useState('');
  const [token, setToken] = useState('');
  const [showTokenHelp, setShowTokenHelp] = useState(false);

  // Action States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveStep, setLiveStep] = useState('');
  const [syncingBridgeId, setSyncingBridgeId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    message: string;
    raw?: string;
    time: string;
    isDeviceError: boolean;
    isExpiredError: boolean;
  } | null>(null);
  const [copiedError, setCopiedError] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const errorBoxRef = useRef<HTMLDivElement>(null);

  // Token update state
  const [updatingTokenBridgeId, setUpdatingTokenBridgeId] = useState<string | null>(null);
  const [newTokenInput, setNewTokenInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchBridges();
    }
  }, [isOpen]);

  const fetchBridges = async () => {
    setLoadingBridges(true);
    try {
      const res = await fetch('/api/course/bridge');
      const data = await res.json();
      if (data.success && data.bridges) {
        setBridges(data.bridges);
        if (data.bridges.length > 0 && !courseUrlOrId) {
          // If already has bridges, default tab can stay or switch
        }
      }
    } catch (e) {
      console.error('Failed to fetch bridges:', e);
    } finally {
      setLoadingBridges(false);
    }
  };

  if (!isOpen) return null;

  const resetForm = () => {
    setCourseUrlOrId('');
    setCourseTitle('');
    setArchiveUrlOrId('');
    setToken('');
    setErrorMessage(null);
    setErrorDetails(null);
    setSuccessData(null);
    setIsSubmitting(false);
    setLiveStep('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // ১. নতুন কোর্স কানেক্ট ও লাইভ ফেচ
  const handleConnectCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseUrlOrId.trim()) {
      setErrorMessage('অনুগ্রহ করে ACS কোর্সের লিংক বা আইডি দিন!');
      return;
    }
    if (!token.trim()) {
      setErrorMessage('অনুগ্রহ করে ACS একাউন্টের অথেন্টিকেশন টোকেন (JWT Token) দিন!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setErrorDetails(null);
    setSuccessData(null);
    setLiveStep('১/৩: কোর্স আইডি ও টোকেন বিশ্লেষণ করা হচ্ছে...');

    try {
      setLiveStep('২/৩: ACS ক্লাউড সার্ভারের সাথে সরাসরি সংযোগ স্থাপন ও ক্লাস ফেচ করা হচ্ছে...');
      const res = await fetch('/api/course/bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseUrlOrId: courseUrlOrId.trim(),
          courseTitle: courseTitle.trim() || undefined,
          archiveUrlOrId: archiveUrlOrId.trim() || undefined,
          token: token.trim(),
          forceNew: false
        })
      });

      setLiveStep('৩/৩: সার্ভার রেসপন্স প্রসেস করা হচ্ছে...');
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'কোর্স কানেক্ট করতে সমস্যা হয়েছে!');
      }

      setSuccessData(data);
      fetchBridges();

      // AppContext আপডেট
      if (data.course) {
        const exists = courses.some(c => c.id === data.course.id);
        if (exists) {
          updateCourse(data.course.id, data.course);
        } else {
          addCourse(data.course);
        }
      }

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      showToast('🎉 ACS কোর্স সফলভাবে সরাসরি সংযুক্ত ও সিঙ্ক হয়েছে!');
    } catch (err: any) {
      const msg = err.message || 'কানেক্ট করতে সমস্যা হয়েছে!';
      setErrorMessage(msg);
      setErrorDetails({
        message: msg,
        raw: JSON.stringify(err, null, 2),
        time: new Date().toLocaleTimeString('bn-BD'),
        isDeviceError: msg.includes('ডিভাইস') || msg.includes('device') || msg.includes('300'),
        isExpiredError: msg.includes('Session expired') || msg.includes('মেয়াদ') || msg.includes('406')
      });
      setTimeout(() => {
        errorBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } finally {
      setIsSubmitting(false);
      setLiveStep('');
    }
  };

  // ২. ১-ক্লিক রিয়েল-টাইম রি-সিঙ্ক
  const handleTriggerSync = async (bridge: BridgeItem) => {
    setSyncingBridgeId(bridge.id);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/course/bridge', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bridgeId: bridge.id
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'সিঙ্ক ব্যর্থ হয়েছে!');
      }

      showToast(`⚡ ${bridge.title} কোর্স লাইভ সিঙ্ক সম্পন্ন হয়েছে!`);
      fetchBridges();

      if (data.course) {
        updateCourse(data.course.id, data.course);
      }
    } catch (err: any) {
      showToast('❌ সিঙ্ক ব্যর্থ: ' + err.message);
    } finally {
      setSyncingBridgeId(null);
    }
  };

  // ৩. টোকেন আপডেট
  const handleUpdateToken = async (bridgeId: string) => {
    if (!newTokenInput.trim()) return;
    setSyncingBridgeId(bridgeId);

    try {
      const res = await fetch('/api/course/bridge', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bridgeId,
          token: newTokenInput.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'টোকেন আপডেট ব্যর্থ হয়েছে!');
      }

      showToast('🔑 টোকেন সফলভাবে আপডেট ও যাচাই হয়েছে!');
      setUpdatingTokenBridgeId(null);
      setNewTokenInput('');
      fetchBridges();
    } catch (err: any) {
      showToast('❌ ' + err.message);
    } finally {
      setSyncingBridgeId(null);
    }
  };

  // ৪. ডিসকানেক্ট ব্রিজ
  const handleDeleteBridge = async (bridgeId: string, title: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${title}" এর সরাসরি API কানেকশন মুছে ফেলতে চান? (ওয়েবসাইটের বিদ্যমান ক্লাসগুলো সংরক্ষিত থাকবে)`)) {
      return;
    }

    try {
      const res = await fetch(`/api/course/bridge?id=${bridgeId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('সংযোগ বিচ্ছিন্ন করা হয়েছে।');
        fetchBridges();
      }
    } catch (e) {}
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-pink-50/50 via-purple-50/30 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#fa507e] to-[#ec376d] text-white flex items-center justify-center shadow-md shadow-pink-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  ডিরেক্ট ACS কোর্স কানেক্টর (Live API Bridge)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
                  REAL-TIME SYNC
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                কোনো ফাইল ডাউনলোড বা আপলোড ছাড়াই সরাসরি সার্ভার-টু-সার্ভার লাইভ ক্লাস যুক্ত ও অটো-সিঙ্ক করুন
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-2 text-xs font-bold gap-2">
          <button
            type="button"
            onClick={() => { setActiveTab('connect'); setSuccessData(null); }}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'connect'
                ? 'border-[#ed347d] text-[#ed347d]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ নতুন কোর্স কানেক্ট করুন</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'active'
                ? 'border-[#ed347d] text-[#ed347d]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FolderSync className="w-3.5 h-3.5" />
            <span>সক্রিয় কানেকশনসমূহ ({bridges.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Error Box */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in shake duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <strong>সমস্যা দেখা দিয়েছে:</strong>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* TAB 1: CONNECT NEW COURSE */}
          {activeTab === 'connect' && (
            <>
              {successData ? (
                /* Success View */
                <div className="space-y-4 text-center py-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-9 h-9 animate-bounce" />
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      কোর্স সফলভাবে সরাসরি সংযুক্ত হয়েছে!
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      সার্ভার সরাসরি ACS API থেকে সকল ক্লাস ও শিট ফেচ করে ওয়েবসাইটে প্রস্তুত করে নিয়েছে।
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-left text-xs max-w-lg mx-auto space-y-2">
                    <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2 font-bold text-emerald-900">
                      <span>কোর্স শিরোনাম:</span>
                      <span className="truncate max-w-[200px]">{successData.course?.title || successData.diff?.courseTitle}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-700 text-[11px] pt-1">
                      <div>মেইন ক্লাস: <strong>{successData.diff?.totalLectures || successData.course?.totalLectures} টি</strong></div>
                      <div>ড্রাইভ শিট: <strong>{successData.diff?.totalSheets || successData.course?.totalSheets} টি</strong></div>
                      <div>কানেকশন স্ট্যাটাস: <strong className="text-emerald-600">🟢 লাইভ ব্রিজ সক্রিয়</strong></div>
                      <div>পুনরায় সিঙ্ক: <strong>১-ক্লিক অটো</strong></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      আরেকটি কোর্স কানেক্ট করুন
                    </button>
                    {successData.course?.id && (
                      <Link
                        href={`/classroom/${successData.course.id}`}
                        target="_blank"
                        className="px-5 py-2.5 rounded-xl ph-btn-pink text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow"
                      >
                        <span>ক্লাসরুম ওপেন করুন</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                /* Connection Form */
                <form onSubmit={handleConnectCourse} className="space-y-4">
                  {/* Course URL / ID */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-[#ed347d]" />
                      <span>ACS কোর্স লিংক বা কোর্স আইডি *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={courseUrlOrId}
                      onChange={(e) => setCourseUrlOrId(e.target.value)}
                      placeholder="e.g. https://engineering.aparsclassroom.com/course/0776a7b0-... অথবা আইডি"
                      className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#ed347d] focus:outline-none transition-all"
                    />
                    <p className="text-[11px] text-slate-400">
                      Engineering, Varsity, FRB, Medical বা Admission সাবডোমেনের যেকোনো কোর্স লিংক দিতে পারেন।
                    </p>
                  </div>

                  {/* Course Title (Optional override) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>কোর্স শিরোনাম (ঐচ্ছিক)</span>
                      <span className="text-[10px] text-slate-400 font-normal">ফাঁকা রাখলে ACS এর আসল নাম নেবে</span>
                    </label>
                    <input
                      type="text"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      placeholder="যেমন: COME BACK HSC 2025"
                      className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#ed347d] focus:outline-none transition-all"
                    />
                  </div>

                  {/* Archive URL / ID (Optional) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>আর্কাইভ কোর্স লিংক বা আইডি (ঐচ্ছিক)</span>
                      <span className="text-[10px] text-slate-400 font-normal">যদি বিগত বছরের আর্কাইভ ব্যাচ থাকে</span>
                    </label>
                    <input
                      type="text"
                      value={archiveUrlOrId}
                      onChange={(e) => setArchiveUrlOrId(e.target.value)}
                      placeholder="e.g. 52acc196-55a7-4499-9ca2-... অথবা লিংক"
                      className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#ed347d] focus:outline-none transition-all"
                    />
                  </div>

                  {/* Auth Token Input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                        <span>ACS অ্যাকাউন্ট টোকেন (JWT Bearer Token) *</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowTokenHelp(!showTokenHelp)}
                        className="text-[11px] text-[#ed347d] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>৫ সেকেন্ডে যেভাবে টোকেন পাবেন</span>
                        {showTokenHelp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    <textarea
                      required
                      rows={2}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="eyJh..."
                      className="w-full px-3.5 py-2 text-xs font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#ed347d] focus:outline-none transition-all"
                    />

                    {/* Token Help Box */}
                    {showTokenHelp && (
                      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-1.5 animate-in fade-in duration-150">
                        <strong className="block text-amber-950 font-black">💡 ১-ক্লিকে টোকেন পাওয়ার সহজ উপায়:</strong>
                        <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed">
                          <li>আপনার ব্রাউজারে ACS (Apar's Classroom)-এ লগইন অবস্থায় থাকুন।</li>
                          <li>কিবোর্ডে <strong>F12</strong> চেপে (Inspect) <strong>Console</strong> ট্যাবে যান।</li>
                          <li>কনসোলে নিচের ১-লাইনের কোডটি পেস্ট করে <strong>Enter</strong> চাপুন (টোকেন নিজে থেকেই কপি হয়ে যাবে):
                            <code className="block bg-amber-100/90 p-2 rounded-xl font-mono text-[10px] my-1 text-slate-800 break-all select-all border border-amber-300">
                              (function()&#123;for(let i=0;i&lt;localStorage.length;i++)&#123;const m=(localStorage.getItem(localStorage.key(i))||'').match(/ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/);if(m)&#123;copy(m[0]);return '✅ টোকেন কপি হয়েছে: '+m[0].slice(0,25)+'...';&#125;&#125;for(let i=0;i&lt;sessionStorage.length;i++)&#123;const m=(sessionStorage.getItem(sessionStorage.key(i))||'').match(/ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/);if(m)&#123;copy(m[0]);return '✅ টোকেন কপি হয়েছে: '+m[0].slice(0,25)+'...';&#125;&#125;const c=document.cookie.match(/(?:token|access_token|jwt)=([^;]+)/i);if(c)&#123;copy(c[1]);return '✅ টোকেন কপি হয়েছে: '+c[1].slice(0,25)+'...';&#125;return '❌ লগইন টোকেন পাওয়া যায়নি!';&#125;)()
                            </code>
                          </li>
                          <li>তারপর এই বক্সে এসে সরাসরি <strong>Ctrl + V</strong> (Paste) চেপে দিন!</li>
                        </ol>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-3.5 rounded-2xl text-xs font-black text-white flex items-center justify-center gap-2 shadow-md transition-all ${
                        isSubmitting
                          ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                          : 'ph-btn-pink hover:shadow-lg active:scale-[0.99] cursor-pointer'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>সার্ভার থেকে সরাসরি কোর্স লাইভ ফেচ ও সিঙ্ক হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4" />
                          <span>কোর্স কানেক্ট ও লাইভ সিঙ্ক শুরু করুন</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Live Progress Diagnostic Indicator */}
                  {isSubmitting && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 border border-pink-200 text-xs text-pink-900 flex items-center gap-3 animate-pulse shadow-xs">
                      <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>ACS ক্লাউড সংযোগ প্রক্রিয়া চলছে...</span>
                          <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                        </div>
                        <p className="text-[11px] text-pink-700 mt-0.5 font-medium">{liveStep}</p>
                      </div>
                    </div>
                  )}

                  {/* High Visibility Error Diagnostic Console */}
                  {errorDetails && (
                    <div 
                      ref={errorBoxRef}
                      className="p-4 sm:p-5 rounded-2xl bg-rose-50/90 border-2 border-rose-300 text-slate-800 space-y-3.5 animate-in fade-in zoom-in-95 duration-200 shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-rose-200 pb-2.5">
                        <div className="flex items-center gap-2 text-rose-700 font-black text-xs sm:text-sm">
                          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                          <span>সার্ভার রেসপন্স ও ত্রুটি রিপোর্ট (Error Diagnostic)</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-mono font-bold">
                          {errorDetails.time}
                        </span>
                      </div>

                      {/* Main Message Display */}
                      <div className="bg-white p-3.5 rounded-xl border border-rose-200 text-xs text-rose-950 font-bold leading-relaxed">
                        {errorDetails.message}
                      </div>

                      {/* Diagnostic breakdown */}
                      <div className="text-[11px] text-slate-600 space-y-1 bg-rose-100/40 p-3 rounded-xl border border-rose-200/60 font-mono">
                        <div><strong>টার্গেট কোর্স:</strong> {courseUrlOrId.trim().slice(0, 45)}...</div>
                        <div><strong>টোকেন অবস্থা:</strong> {token.trim().length} অক্ষরের JWT শনাক্ত হয়েছে</div>
                      </div>

                      {/* Actionable guidance: Single device restriction */}
                      {errorDetails.isDeviceError && (
                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-2">
                          <div className="flex items-center gap-1.5 font-black text-amber-900">
                            <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>ACS সিঙ্গেল ডিভাইস নীতি সতর্কবার্তা:</span>
                          </div>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            ACS-এর সিকিউরিটি নীতি অনুযায়ী একটি অ্যাকাউন্ট থেকে একই সময়ে একাধিক ডিভাইসে থাকা যায় না। আপনার অ্যাকাউন্টটি বর্তমানে ব্রাউজারে লগইন থাকায়, আমাদের সার্ভার একই অ্যাকাউন্টের টোকেন দিয়ে সরাসরি ক্লাউড থেকে সব ডেটা টানার সময় ACS সাময়িকভাবে রিকোয়েস্ট আটকে দিচ্ছে।
                          </p>
                          <div className="bg-amber-100/70 p-2.5 rounded-lg text-[11px] text-amber-900 space-y-1">
                            <strong className="block text-amber-950">সহজ সমাধান:</strong>
                            <div>১. ACS থেকে অন্য কোনো ডিভাইসের সেশন থাকলে তা বন্ধ করে ৫-১০ মিনিট পর পুনরায় ট্রাই করুন।</div>
                            <div>২. <strong>অথবা (১০০% নিশ্চিত বিকল্প):</strong> ব্রাউজার কনসোলে ১-ক্লিক ডাউনলোডার স্ক্রিপ্ট চালিয়ে সরাসরি JSON ফাইল নামিয়ে নিন এবং নিচের বাটনে ক্লিক করে আপলোড করুন।</div>
                          </div>
                          {onOpenJsonUpload && (
                            <button
                              type="button"
                              onClick={onOpenJsonUpload}
                              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-[0.99] transition-all cursor-pointer mt-1"
                            >
                              <FileUp className="w-4 h-4" />
                              <span>📂 বিকল্প: ১-ক্লিকে কোর্স JSON আপলোড মোডাল খুলুন</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Actionable guidance: Session expired */}
                      {errorDetails.isExpiredError && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                          <strong>💡 পরামর্শ:</strong> আপনার ব্রাউজারে ACS লগইন সেশনের মেয়াদ হয়তো ফুরিয়ে গেছে। ACS পেজটি রিফ্রেশ করে আবার কনসোল থেকে নতুন টোকেন কপি করে পেস্ট করুন।
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(errorDetails.message);
                            setCopiedError(true);
                            setTimeout(() => setCopiedError(false), 2000);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 text-[11px] font-bold flex items-center gap-1.5 hover:bg-rose-100/50 transition-colors cursor-pointer"
                        >
                          {copiedError ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedError ? 'এরর কপি হয়েছে!' : 'ত্রুটি কপি করুন'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setErrorDetails(null)}
                          className="text-[11px] text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
                        >
                          লুকান
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </>
          )}

          {/* TAB 2: ACTIVE BRIDGES & 1-CLICK SYNC */}
          {activeTab === 'active' && (
            <div className="space-y-4">
              {loadingBridges ? (
                <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#ed347d]" />
                  <span>কানেকশন ডাটা লোড হচ্ছে...</span>
                </div>
              ) : bridges.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <Globe className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-700">কোনো সরাসরি ব্রিজ সক্রিয় নেই</h4>
                  <p className="text-[11px] text-slate-400">
                    &quot;+ নতুন কোর্স কানেক্ট করুন&quot; ট্যাব থেকে প্রথম কোর্সটি সংযুক্ত করুন।
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('connect')}
                    className="px-4 py-2 rounded-xl text-xs font-bold ph-btn-pink text-white"
                  >
                    + কানেক্ট শুরু করুন
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bridges.map((b) => (
                    <div 
                      key={b.id} 
                      className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs space-y-3 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <h4 className="text-xs font-black text-slate-900">{b.title}</h4>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            ডোমেন: {b.subdomain} • আইডি: {b.courseId.slice(0, 8)}...
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {b.totalLectures} টি ক্লাস
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(b.lastSyncedAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</span>
                          </span>
                        </div>
                      </div>

                      {/* Token Update Accordion */}
                      {updatingTokenBridgeId === b.id ? (
                        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
                          <label className="font-bold text-amber-900 block">নতুন একাউন্ট টোকেন দিন:</label>
                          <input
                            type="text"
                            value={newTokenInput}
                            onChange={(e) => setNewTokenInput(e.target.value)}
                            placeholder="eyJh..."
                            className="w-full text-xs font-mono px-3 py-1.5 bg-white border border-amber-300 rounded-lg focus:outline-none"
                          />
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setUpdatingTokenBridgeId(null)}
                              className="px-3 py-1 rounded-lg text-slate-600 hover:bg-slate-100"
                            >
                              বাতিল
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateToken(b.id)}
                              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
                            >
                              সংরক্ষণ ও সিঙ্ক
                            </button>
                          </div>
                        </div>
                      ) : null}

                      {/* Bridge Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setUpdatingTokenBridgeId(updatingTokenBridgeId === b.id ? null : b.id);
                              setNewTokenInput('');
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <KeyRound className="w-3 h-3 text-amber-500" />
                            <span>টোকেন পরিবর্তন</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBridge(b.id, b.title)}
                            className="px-2 py-1 rounded-lg text-[11px] font-bold text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>মুছে ফেলুন</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/classroom/${b.targetCourseId}`}
                            target="_blank"
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1"
                          >
                            <span>ক্লাসরুম</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>

                          <button
                            type="button"
                            disabled={syncingBridgeId === b.id}
                            onClick={() => handleTriggerSync(b)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-xs cursor-pointer ${
                              syncingBridgeId === b.id
                                ? 'bg-slate-300'
                                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                            }`}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${syncingBridgeId === b.id ? 'animate-spin' : ''}`} />
                            <span>{syncingBridgeId === b.id ? 'সিঙ্ক হচ্ছে...' : 'এখনই রি-সিঙ্ক করুন'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>সিকিউর সার্ভার ক্যাশ: ACS একাউন্ট ব্যান হওয়ার কোনো ঝুঁকি নেই</span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
}
