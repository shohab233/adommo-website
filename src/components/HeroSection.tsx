'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Play, 
  BookOpen, 
  FileText, 
  Award, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  CheckCircle2
} from 'lucide-react';

import { useApp } from '@/context/AppContext';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  categories: string[];
}

export default function HeroSection({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
}: HeroSectionProps) {
  const { courses } = useApp();
  const published = courses.filter((c) => !c.isDraft);

  const slides = published.length > 0 
    ? published.slice(0, 3).map((c, i) => ({
        id: c.id,
        title: c.title,
        subtitle: c.tagline || c.level || 'অনলাইন লাইভ ও রেকর্ডেড ক্লাস',
        link: `/courses/${c.id}`,
        image: c.coverImage,
      }))
    : [
        {
          id: 'slide_welcome',
          title: 'অদম্য এডটেক - উচ্চশিক্ষা ও ভর্তি প্রস্তুতি প্ল্যাটফর্ম',
          subtitle: 'পদার্থবিজ্ঞান, গণিত, রসায়ন ও জীববিজ্ঞানের সেরা প্রস্তুতি',
          link: '/courses',
          image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=1200&q=80',
        }
      ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="w-full bg-white pt-6 pb-8 space-y-12">
      
      {/* 1. Exact PhyHunt Hero Carousel with ambient glow */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative overflow-hidden">
        {/* Subtle Ambient Glow Behind Carousel */}
        <div className="absolute -top-10 left-1/4 w-96 h-64 bg-pink-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-1/4 w-96 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full aspect-[16/8] sm:aspect-[16/6.5] rounded-3xl overflow-hidden bg-slate-900 shadow-2xl group border border-slate-800/60">
          
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-12 text-white">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[11px] font-extrabold text-[#f53278] bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    ADOMMO অফিশিয়াল ব্যাচ
                  </span>
                  <span className="text-[11px] font-bold text-amber-300 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/30">
                    ⭐ ৪.৯ স্টার রেটেড
                  </span>
                </div>
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight drop-shadow-sm">
                  {slide.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 mt-2 max-w-2xl line-clamp-2 leading-relaxed font-medium">
                  {slide.subtitle}
                </p>
                <div className="pt-5 flex items-center gap-3">
                  <Link
                    href={slide.link}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white ph-btn-pink shadow-lg shadow-pink-500/25 hover:scale-105 transition-all"
                  >
                    <span>বিস্তারিত দেখুন</span>
                    <span className="font-bold">→</span>
                  </Link>
                  <a
                    href="#courses"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-slate-900 bg-white/95 hover:bg-white hover:text-[#ed347d] transition-all shadow-lg"
                  >
                    <span>সকল কোর্সসমূহ</span>
                  </a>
                </div>
              </div>
            </div>
          ))}

          {/* Controls: Left & Right */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-[#ed347d] text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all text-2xl font-light cursor-pointer shadow-lg"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-[#ed347d] text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all text-2xl font-light cursor-pointer shadow-lg"
            aria-label="Next"
          >
            ›
          </button>

          {/* Indicator Pills */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlide ? 'w-6 bg-gradient-to-r from-[#ff6b6b] to-[#f72585]' : 'w-2 bg-white/60 hover:bg-white'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>

        {/* Floating Trust Proof Counters below Hero Banner */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#ed347d] flex items-center justify-center font-bold text-lg shrink-0">
              🎓
            </div>
            <div>
              <div className="text-base font-black text-slate-800">৫০,০০০+</div>
              <div className="text-[11px] text-slate-500 font-medium">সক্রিয় শিক্ষার্থী</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg shrink-0">
              ⭐
            </div>
            <div>
              <div className="text-base font-black text-slate-800">৪.৯ / ৫.০</div>
              <div className="text-[11px] text-slate-500 font-medium">শিক্ষার্থী সন্তুষ্টি</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg shrink-0">
              🔴
            </div>
            <div>
              <div className="text-base font-black text-slate-800">১০০% লাইভ</div>
              <div className="text-[11px] text-slate-500 font-medium">ডুয়াল টিচার ইন্টারঅ্যাক্টিভ</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
              ⚡
            </div>
            <div>
              <div className="text-base font-black text-slate-800">লাইভ ওএমআর</div>
              <div className="text-[11px] text-slate-500 font-medium">মেধা তালিকা ও ব্যাখ্যা</div>
            </div>
          </div>
        </div>

      </div>

      {/* Course Search Bar Box with Popular Search Chips */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-3">
        <div className="p-2.5 sm:p-3.5 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-100/80 flex flex-col sm:flex-row items-center gap-2.5">
          <div className="w-full flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 focus-within:border-pink-300 focus-within:bg-white transition-all">
            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="যেকোনো কোর্স, অধ্যায় বা বিষয় লিখে সার্চ করুন (যেমন: ভেক্টর, ক্যাম্পাস ৬.০)..."
              className="w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-none placeholder-slate-400 text-slate-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
              >
                ✕
              </button>
            )}
          </div>
          <a
            href="#courses"
            className="w-full sm:w-auto px-7 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white ph-btn-pink shadow-md text-center shrink-0 hover:scale-[1.02] transition-transform"
          >
            কোর্স খুঁজুন
          </a>
        </div>

        {/* Popular Quick-Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-500 font-medium scrollbar-none justify-center">
          <span className="shrink-0 text-slate-400 font-bold">জনপ্রিয় বিষয়:</span>
          {['ভেক্টর', 'স্থির তড়িৎ', 'ক্যাম্পাস ৬.০', 'মেডিকেল ফিজিক্স', 'মডেল টেস্ট'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setSearchQuery(tag);
                const el = document.getElementById('courses');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-pink-50 hover:text-[#ed347d] text-slate-600 transition-colors shrink-0 cursor-pointer font-semibold border border-transparent hover:border-pink-200"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* 2. "কেন ADOMMO" (Why ADOMMO) Quick 4 Icons Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fff0f5] text-[#ed347d]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>আমাদের বৈশিষ্ট্যসমূহ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            কেন ADOMMO (অদম্য) এডটেক?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            পদার্থবিজ্ঞান ও বিজ্ঞানের কাঠিন্যতাকে দূর করে স্বপ্নের বিশ্ববিদ্যালয়ে পৌঁছানোর বিশ্বস্ত ডিজিটাল ক্লাসরুম
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <a
            href="#courses"
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[#ffd2e2] transition-all text-center flex flex-col items-center justify-center group hover:-translate-y-1 duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#fff2f7] text-[#ed347d] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-slate-800 group-hover:text-[#ed347d] transition-colors">পেইড ব্যাচ</h3>
            <span className="text-[11px] text-slate-500 mt-1">ভার্সিটি ও মেডিকেল ফুল কোর্স</span>
          </a>

          <a
            href="#courses"
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all text-center flex flex-col items-center justify-center group hover:-translate-y-1 duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-slate-800 group-hover:text-emerald-600 transition-colors">ফ্রি প্রোগ্রাম</h3>
            <span className="text-[11px] text-slate-500 mt-1">ওপেন মেগা মডেল টেস্ট ও ক্লাস</span>
          </a>

          <Link
            href="/exam"
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all text-center flex flex-col items-center justify-center group hover:-translate-y-1 duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
              <Flame className="w-7 h-7 fill-amber-500 text-amber-500" />
            </div>
            <h3 className="text-sm font-black text-slate-800 group-hover:text-amber-600 transition-colors">লাইভ ওএমআর</h3>
            <span className="text-[11px] text-slate-500 mt-1">টাইমার, নেগেটিভ মার্কিং ও র‍্যাংক</span>
          </Link>

          <Link
            href="/courses"
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all text-center flex flex-col items-center justify-center group hover:-translate-y-1 duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">অদম্য স্পেশাল PDF</h3>
            <span className="text-[11px] text-slate-500 mt-1">প্রিন্ট-রেডি লেকচার বুক ও শিট</span>
          </Link>

        </div>
      </div>

    </div>
  );
}
