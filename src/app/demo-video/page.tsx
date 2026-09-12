'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ProtectedVideoPlayer from '@/components/ProtectedVideoPlayer';
import { Play, Sparkles, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function DemoVideoPage() {
  const defaultM3u8Url = 'https://vz-2d726a87-cba.b-cdn.net/50734d3b-3248-49c0-948b-ed31ffb9ad28/playlist.m3u8';
  const [videoUrl, setVideoUrl] = useState(defaultM3u8Url);
  const [inputUrl, setInputUrl] = useState(defaultM3u8Url);

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      setVideoUrl(inputUrl.trim());
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
            আপনার প্রদানকৃত BunnyCDN <code className="text-pink-400 bg-pink-950/50 px-2 py-0.5 rounded text-xs font-mono">playlist.m3u8</code> ভিডিওটি আমাদের কাস্টম প্লেয়ারের মাধ্যমে সরাসরি প্লে হচ্ছে।
          </p>
        </div>

        {/* Main Video Player Showcase */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-3 sm:p-5 shadow-2xl backdrop-blur-xl">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner border border-white/5">
            <ProtectedVideoPlayer
              videoUrl={videoUrl}
              title="গতিবিদ্যা-০১ (BunnyCDN HLS Stream)"
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

        {/* Custom URL Tester Form */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">অন্য কোনো লিংক টেস্ট করতে চান? (YouTube / HLS .m3u8 / MP4)</h4>
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

      </div>
    </div>
  );
}
