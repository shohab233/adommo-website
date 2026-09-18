'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ProtectedVideoPlayer from '@/components/ProtectedVideoPlayer';
import { Play, Sparkles, CheckCircle2, ShieldCheck, ArrowLeft, FileText, ExternalLink, Download, BookOpen, Key, Copy, Check, AlertCircle, RefreshCw } from 'lucide-react';

export default function DemoVideoPage() {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const defaultM3u8Url = '/api/stream/phyhunt?slug=cmp6vector_part1&file=master.m3u8';
  const [videoUrl, setVideoUrl] = useState(defaultM3u8Url);
  const [inputUrl, setInputUrl] = useState(defaultM3u8Url);
  const [activeMaterial, setActiveMaterial] = useState<string>('https://drive.google.com/file/d/1sRa-ELNL4XCvUJ2zP_budZH0QgkdEGJO/preview');
  const [customMaterialUrl, setCustomMaterialUrl] = useState<string>('');

  // Physics Hunters AES-128 Key & Token Management
  const [isKeyCached, setIsKeyCached] = useState<boolean | null>(null);
  const [keyOrTokenInput, setKeyOrTokenInput] = useState<string>('');
  const [isSavingKey, setIsSavingKey] = useState<boolean>(false);
  const [keyStatusMsg, setKeyStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);

  const checkKeyStatus = async () => {
    try {
      const res = await fetch('/api/stream/phyhunt?slug=cmp6vector_part1&file=status');
      const data = await res.json();
      setIsKeyCached(!!data.isKeyCached);
    } catch {
      setIsKeyCached(false);
    }
  };

  useEffect(() => {
    checkKeyStatus();
  }, []);

  const playPreset = (url: string) => {
    const finalUrl = url + (url.includes('?') ? '&' : '?') + '_r=' + Date.now();
    setInputUrl(url);
    setVideoUrl(finalUrl);
    setTimeout(() => {
      playerContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const handleSaveKeyOrToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyOrTokenInput.trim()) return;

    setIsSavingKey(true);
    setKeyStatusMsg(null);
    try {
      const val = keyOrTokenInput.trim();
      const payload = val.includes(':') 
        ? { slug: 'cmp6vector_part1', token: val }
        : { slug: 'cmp6vector_part1', keyHex: val };

      const res = await fetch('/api/stream/phyhunt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'কী বা টোকেন সংরক্ষণ করা সম্ভব হয়নি');
      }

      setKeyStatusMsg({ type: 'success', text: data.message });
      setIsKeyCached(true);
      // Reload video with fresh query to force player reload
      const newUrl = `/api/stream/phyhunt?slug=cmp6vector_part1&file=master.m3u8&_t=${Date.now()}`;
      setVideoUrl(newUrl);
      setInputUrl(newUrl);
      setKeyOrTokenInput('');
      setTimeout(() => {
        playerContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (err: any) {
      setKeyStatusMsg({ type: 'error', text: err.message || 'ব্যর্থ হয়েছে' });
    } finally {
      setIsSavingKey(false);
    }
  };

  const copyPhyhuntSnippet = () => {
    const snippet = `(async()=>{try{const r=await fetch('/course/lms-v2/api/hls/ticket/?slug=cmp6vector_part1');const d=await r.json();console.log('TOKEN:', d.token);const k=await fetch('/course/lms-v2/api/hls/master-key/?slug=cmp6vector_part1&token='+encodeURIComponent(d.token));const b=await k.arrayBuffer();const hex=Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');console.log('16-BYTE KEY HEX:', hex);prompt('Permanent 16-Byte Hex Key (Ctrl+C to copy):', hex);}catch(e){alert('Error: '+e.message);}})();`;
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  const demoMaterials = [
    { title: 'লেকচার স্লাইড (ভেক্টর পার্ট ১)', url: 'https://drive.google.com/file/d/1sRa-ELNL4XCvUJ2zP_budZH0QgkdEGJO/preview' },
    { title: 'স্লাইড [Without Solve]', url: 'https://drive.google.com/file/d/1KpEXtNXIxni2VPMYNSN6tfz198EsIbuJ/preview' },
    { title: 'Written PDF সমাধান', url: 'https://drive.google.com/file/d/14X2NhRPAzH92YzM48iqtptpvHzLBNIU0/preview' }
  ];

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      const u = inputUrl.trim();
      const finalUrl = u.includes('_r=') ? u : u + (u.includes('?') ? '&' : '?') + '_r=' + Date.now();
      setVideoUrl(finalUrl);
      setTimeout(() => {
        playerContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  };

  const handleApplyMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (customMaterialUrl.trim()) {
      let u = customMaterialUrl.trim();
      if (!u.startsWith('http')) {
        u = `https://drive.google.com/file/d/${u}/preview`;
      } else if (u.includes('/view')) {
        u = u.replace('/view', '/preview');
      }
      setActiveMaterial(u);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোমে ফিরুন</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#00c269]/10 text-[#00c269] border border-[#00c269]/30">
            <Sparkles className="w-3.5 h-3.5" />
            HLS .m3u8 স্ট্রিমিং ডেমো
          </span>
        </div>

        {/* Title Section */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            লাইভ HLS ভিডিও প্লেয়ার টেস্ট
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Physics Hunters ও BunnyCDN <code className="text-pink-400 bg-pink-950/50 px-2 py-0.5 rounded text-xs font-mono">playlist.m3u8</code> ভিডিও আমাদের কাস্টম প্লেয়ারের মাধ্যমে সরাসরি প্লে হচ্ছে।
          </p>
        </div>

        {/* Main Video Player Showcase */}
        <div ref={playerContainerRef} className="bg-slate-900/80 border border-white/10 rounded-3xl p-3 sm:p-5 shadow-2xl backdrop-blur-xl">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner border border-white/5">
            <ProtectedVideoPlayer
              key={videoUrl}
              videoUrl={videoUrl}
              title={videoUrl.includes('phyhunt') ? 'Physics Hunters: ভেক্টর পার্ট-১ (AES-128 HLS Stream)' : 'গতিবিদ্যা-০১ (BunnyCDN HLS Stream)'}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-slate-300">
                {videoUrl.includes('youtube') ? 'ইউটিউব স্ট্রিমিং সক্রিয়' : 'অ্যাডাপ্টিভ HLS স্ট্রিমিং সক্রিয়'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-400">কোয়ালিটি: Auto / 1080p / 720p / 480p</span>
              <span className="text-slate-400">DRM ওয়াটারমার্ক: এনাবল্ড</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl space-y-2">
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 text-[#ed347d] flex items-center justify-center">
              <Play className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">সকল সোর্স সাপোর্টেড</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              শিক্ষক যে-কোনো BunnyCDN HLS .m3u8, YouTube, Vimeo বা MP4 লিংক দিয়ে ক্লাস যুক্ত করতে পারবেন।
            </p>
          </div>

          <div className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">ডাইনামিক ওয়াটারমার্ক DRM</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              ভিডিওর উপর শিক্ষার্থীর নাম ও ফোন নম্বর সংবলিত ওয়াটারমার্ক প্রতিনিয়ত মুভ করবে, ফলে পাইরেসি রোধ হবে।
            </p>
          </div>

          <div className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">হটকি ও কন্ট্রোল বার</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              স্পেসবার (প্লে/পজ), অ্যারো কি (১০ সেকেন্ড স্কিপ), সাউন্ড ভলিউম এবং কোয়ালিটি পরিবর্তনের সুবিধা।
            </p>
          </div>
        </div>

        {/* Physics Hunters Key / Token Management Assistant */}
        {videoUrl.includes('phyhunt') && (
          <div className={`p-5 rounded-2xl border transition-all ${
            isKeyCached 
              ? 'bg-emerald-950/20 border-emerald-500/30' 
              : 'bg-amber-950/20 border-amber-500/40'
          } space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isKeyCached ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Physics Hunters AES-128 সিক্রেট কী স্ট্যাটাস</span>
                    {isKeyCached ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ✓ চিরস্থায়ী কী সংরক্ষিত (Active)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ⚠️ কী বা টোকেন প্রয়োজন (12h Expiration)
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isKeyCached
                      ? 'এই ক্লাসের ডিক্রিপশন কী পার্মানেন্টলি সেভ করা আছে, ভিডিও বাধাহীনভাবে প্লে হবে।'
                      : 'PhyHunt প্ল্যাটফর্মে টোকেনের মেয়াদ প্রতি ১২ ঘণ্টায় শেষ হয়ে যায়। নতুন টোকেন বা 16-Byte Hex Key দিয়ে এটি তাৎক্ষণিক চালু করুন।'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={copyPhyhuntSnippet}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-pink-400" />}
                  <span>{copiedSnippet ? 'স্ক্রিপ্ট কপি হয়েছে!' : '📋 PhyHunt এক্সট্র্যাক্ট কোড'}</span>
                </button>
                <button
                  type="button"
                  onClick={checkKeyStatus}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs border border-slate-700 transition-all cursor-pointer"
                  title="রিফ্রেশ স্ট্যাটাস"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick guide and Input form */}
            {!isKeyCached && (
              <div className="p-4 rounded-xl bg-[#0a121e] border border-white/5 space-y-3">
                <div className="text-xs text-slate-300 leading-relaxed space-y-1">
                  <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>কীভাবে PhyHunt থেকে ফ্রেশ টোকেন বা Hex Key আনবেন?</span>
                  </p>
                  <ol className="list-decimal list-inside pl-1 text-[11px] text-slate-400 space-y-1">
                    <li><strong className="text-slate-300">PhyHunt.com</strong>-এ লগইন করে ভেক্টর ক্লাসের পেজে যান।</li>
                    <li>কিবোর্ডে <strong>F12</strong> চেপে <strong>Console</strong> ট্যাবে যান।</li>
                    <li>ওপরের <strong>&quot;📋 PhyHunt এক্সট্র্যাক্ট কোড&quot;</strong> বাটনে চাপ দিয়ে কোডটি পেস্ট করে Enter দিন।</li>
                    <li>পপআপে পাওয়া <strong>16-Byte Hex Key</strong> অথবা <strong>Token</strong> নিচের বক্সে পেস্ট করে সেভ করুন।</li>
                  </ol>
                </div>

                <form onSubmit={handleSaveKeyOrToken} className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="text"
                    value={keyOrTokenInput}
                    onChange={(e) => setKeyOrTokenInput(e.target.value)}
                    placeholder="PhyHunt Token (109980:...) অথবা 32-অক্ষরের Hex Key পেস্ট করুন..."
                    className="flex-1 bg-black/60 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSavingKey || !keyOrTokenInput.trim()}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 hover:opacity-90 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>{isSavingKey ? 'যাচাই হচ্ছে...' : '🔑 কী সেভ ও আনলক করুন'}</span>
                  </button>
                </form>

                {keyStatusMsg && (
                  <div className={`p-2.5 rounded-lg text-xs font-medium ${
                    keyStatusMsg.type === 'success' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {keyStatusMsg.text}
                  </div>
                )}
              </div>
            )}

            {isKeyCached && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-emerald-500/20">
                <span className="text-xs text-emerald-300 font-medium">
                  🎉 ১৬-বাইটের AES-128 ডিক্রিপশন কী সফলভাবে সিস্টেমে সংরক্ষিত আছে!
                </span>
                <button
                  type="button"
                  onClick={() => playPreset('/api/stream/phyhunt?slug=cmp6vector_part1&file=master.m3u8')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:opacity-95 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>▶️ ভিডিও প্লে করুন ও দেখুন</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Custom URL Tester Form */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-white/10">
            <span className="text-[11px] text-slate-400 font-bold">টেস্ট প্রিসেট সিলেক্ট করুন:</span>
            <button
              type="button"
              onClick={() => playPreset('/api/stream/phyhunt?slug=cmp6vector_part1&file=master.m3u8')}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-90"
            >
              🔥 Physics Hunters: ভেক্টর পার্ট-১ (AES-128 Stream)
            </button>
            <button
              type="button"
              onClick={() => playPreset('https://vz-2d726a87-cba.b-cdn.net/50734d3b-3248-49c0-948b-ed31ffb9ad28/playlist.m3u8')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold cursor-pointer"
            >
              🐰 BunnyCDN: গতিবিদ্যা-০১ (সরাসরি সচল)
            </button>
          </div>

          <form onSubmit={handleApplyUrl} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... বা https://.../playlist.m3u8"
              className="flex-1 bg-black/50 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-xs font-bold text-white hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer shadow-lg"
            >
              প্লে করুন
            </button>
          </form>
        </div>

        {/* ========================================================================= */}
        {/* MATERIALS & PDF SHEETS VIEWER SECTION */}
        {/* ========================================================================= */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 mb-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Materials & Lecture Sheets Viewer</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                লেকচার শিট ও মেটেরিয়ালস PDF ভিউয়ার
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Physics Hunters বা যেকোনো কোর্সের গুগল ড্রাইভ লেকচার শিট, স্লাইড এবং রিটেন সমাধান সরাসরি ব্রাউজারে প্রিভিউ ও ডাউনলোড করুন।
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {demoMaterials.map((mat, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveMaterial(mat.url)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeMaterial === mat.url
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  {mat.title}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Material Input */}
          <form onSubmit={handleApplyMaterial} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customMaterialUrl}
              onChange={(e) => setCustomMaterialUrl(e.target.value)}
              placeholder="গুগল ড্রাইভ লিংক বা ফাইল আইডি দিন (যেমন: 1sRa-ELNL4XCvUJ2zP_budZH0QgkdEGJO)"
              className="flex-1 bg-black/50 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors whitespace-nowrap cursor-pointer shadow-lg flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>শিট প্রিভিউ দেখুন</span>
            </button>
          </form>

          {/* PDF Preview Iframe */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-black min-h-[500px]">
            {activeMaterial ? (
              <iframe
                src={activeMaterial}
                title="Lecture Sheet PDF"
                className="w-full h-[600px] border-0"
                allow="autoplay"
              />
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs">
                কোনো শিট লিংক নির্বাচন করা হয়নি
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
            <span className="font-mono text-[11px] truncate max-w-md text-slate-500">{activeMaterial}</span>
            <a
              href={activeMaterial.replace('/preview', '/view')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>নতুন উইন্ডোতে খুলুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
