'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import HeroSection from '@/components/HeroSection';
import CourseCard from '@/components/CourseCard';
import { 
  Sparkles, 
  BookOpen, 
  Flame, 
  CheckCircle2, 
  Play, 
  Users, 
  Award, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight,
  Video,
  FileCheck2,
  HelpCircle,
  ChevronDown,
  GraduationCap,
  Clock,
  ShieldCheck,
  Star
} from 'lucide-react';

export default function HomePage() {
  const { courses } = useApp();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('সকল কোর্স');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Exact category tabs matching all course creation types
  const categoryTabs = [
    { label: 'সকল কোর্স', filter: 'all' },
    { label: 'ভার্সিটি এডমিশন', filter: 'Engineering' },
    { label: 'মেডিকেল এডমিশন', filter: 'Medical' },
    { label: 'কৃষি বিশ্ববিদ্যালয়', filter: 'Agri Admission' },
    { label: 'HSC একাডেমি', filter: 'HSC' },
    { label: 'ফ্রি মডেল টেস্ট', filter: 'Free Tests' },
  ];

  const uniqueCourses = Array.from(new Map(courses.map((c) => [c.id, c])).values());
  const publishedCourses = uniqueCourses.filter((c) => !c.isDraft && !c.isArchived && c.isPublished !== false);

  // Home page strictly shows Top 3 courses with the highest enrollments
  const topEnrolledCourses = [...publishedCourses]
    .filter((c) => {
      const activeTabObj = categoryTabs.find((t) => t.label === selectedCategory);
      const matchesCategory =
        !activeTabObj || activeTabObj.filter === 'all' || c.category?.toLowerCase() === activeTabObj.filter.toLowerCase();

      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.batch && c.batch.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0))
    .slice(0, 3);

  const faqs = [
    {
      q: '১. আমি কীভাবে অদম্য এডটেকের যেকোনো কোর্সে ভর্তি হতে পারি?',
      a: 'যে কোর্সটিতে ভর্তি হতে চান সেটির "বিস্তারিত" বাটনে ক্লিক করুন। এরপর "এখনই ভর্তি হোন" বাটনে ট্যাপ করে আপনার সুবিধাজনক পেমেন্ট মেথড (bKash / Nagad / Rocket) সিলেক্ট করুন। প্রদর্শিত নম্বরে কোর্স ফি পাঠিয়ে Transaction ID (TrxID) ও প্রেরকের নম্বর সাবমিট করলেই তাৎক্ষণিকভাবে আপনি ক্লাসরুমে যুক্ত হয়ে যাবেন।'
    },
    {
      q: '২. লাইভ ক্লাস মিস করলে কি পরবর্তীতে রেকর্ডেড ক্লাস দেখতে পারব?',
      a: 'হ্যাঁ, অবশ্যই! প্রতিটি লাইভ ক্লাসের পরপরই তার ফুল এইচডি রেকর্ডিং এবং সাথে শিক্ষকের হাতের লেখা লেকচার নোটস ক্লাসরুমে স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়ে যায়। পরীক্ষার আগের দিন পর্যন্ত যতবার খুশি যেকোনো সময় রিভিশন দিতে পারবেন।'
    },
    {
      q: '৩. লেকচার শিট ও প্র্যাকটিস বুকগুলো কীভাবে পাওয়া যাবে?',
      a: 'কোর্সের প্রতিটি অধ্যায়ের সাথে হাই-কোয়ালিটি প্রিন্ট-রেডি পিডিএফ শিট ও প্র্যাকটিস বুক যুক্ত থাকে। আপনি ক্লাসরুমের "লেকচার ও শিট" ট্যাব থেকে এক ক্লিকে ডাউনলোড ও প্রিন্ট করে নিতে পারবেন।'
    },
    {
      q: '৪. লাইভ ওএমআর ও সিকিউ পরীক্ষা কীভাবে নেওয়া হয়?',
      a: 'আমাদের রয়েছে নিজস্ব রিয়েল-টাইম এক্সাম ইঞ্জিন। নির্দিষ্ট সময়ে অনলাইনে টাইমার ও নেগেটিভ মার্কিং সহ ওএমআর পরীক্ষা দিতে পারবেন। লিখিত পরীক্ষার জন্য অ্যাপ বা ওয়েবসাইটেই ছবি তুলে সাবমিট করলে শিক্ষকেরা স্বহস্তে নম্বর ও ফিডব্যাক প্রদান করেন।'
    },
    {
      q: '৫. ভর্তি সংক্রান্ত যেকোনো প্রয়োজনে কীভাবে যোগাযোগ করব?',
      a: 'আমাদের অফিশিয়াল হটলাইন নম্বর +8809638123409 (সকাল ১০টা থেকে রাত ৮টা) এ সরাসরি কল করতে পারেন অথবা আমাদের ফেসবুক পেজে ইনবক্স করলেই কাস্টমার সাপোর্ট টিম আপনাকে সহযোগিতা করবে।'
    }
  ];

  return (
    <div className="bg-white min-h-screen pb-16 space-y-16">
      
      {/* 1. Hero Carousel & "কেন ফিজিক্স হান্টার্স" */}
      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categoryTabs.map((t) => t.label)}
      />

      {/* 2. "কোর্স সমূহ" Section (Exact PhyHunt Layout) */}
      <section id="courses" className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fff0f5] text-[#ed347d]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>শীর্ষ পছন্দ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            জনপ্রিয় কোর্স সমূহ
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            সর্বোচ্চ শিক্ষার্থী এনরোলকৃত শীর্ষ ৩টি প্রিমিয়াম ব্যাচ
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {categoryTabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setSelectedCategory(tab.label)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === tab.label
                  ? 'bg-gradient-to-r from-[#f53278] to-[#e9287a] text-white shadow-md shadow-pink-500/25 border border-[#ff695f]'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-[#ffd2e2] hover:bg-[#fff5f8] hover:text-[#ed347d]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Top 3 Highest Enrolled Courses Grid */}
        {topEnrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {topEnrolledCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-200/80 p-8 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">এই ক্যাটাগরিতে বর্তমানে কোনো কোর্স পাওয়া যায়নি।</p>
            <button
              type="button"
              onClick={() => { setSelectedCategory('সকল কোর্স'); setSearchQuery(''); }}
              className="text-xs font-extrabold text-[#ed347d] underline hover:opacity-80 cursor-pointer"
            >
              সকল কোর্স দেখুন
            </button>
          </div>
        )}

        {/* View All Courses CTA Button */}
        <div className="text-center pt-4">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm text-white ph-btn-pink shadow-xl shadow-pink-500/25 hover:scale-105 transition-all"
          >
            <span>সবগুলো কোর্স দেখুন {mounted && publishedCourses.length > 0 ? `(${publishedCourses.length}টি কোর্স)` : ''}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </section>

      {/* 3. Live Examination & Model Test Banner */}
      <section className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#fff0f5] via-white to-[#fff5f8] border border-[#fecdd3] p-8 sm:p-10 shadow-sm overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
              লাইভ এক্সাম ইঞ্জিন
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800">
              ভেক্টর মেগা উইকলি টেস্ট ও অনলাইন ওএমআর মডেল টেস্ট
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              টাইমার ও নেগেটিভ মার্কিং সহ ফুল ওএমআর টেস্ট দিন এবং মুহূর্তেই জেনে নিন সঠিক উত্তরের ব্যাখ্যা ও দেশসেরা মেধা তালিকা (Leaderboard)।
            </p>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-700 pt-1 justify-center md:justify-start flex-wrap">
              <span className="flex items-center gap-1 text-rose-600">
                <CheckCircle2 className="w-4 h-4" /> নেগেটিভ মার্কিং
              </span>
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /> ইনস্ট্যান্ট ব্যাখ্যা
              </span>
              <span className="flex items-center gap-1 text-amber-600">
                <CheckCircle2 className="w-4 h-4" /> অল বাংলাদেশ র‍্যাংকিং
              </span>
            </div>
          </div>

          <div className="shrink-0 relative z-10">
            <Link
              href="/exam/exam_vec_01"
              className="px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white ph-btn-pink shadow-xl shadow-pink-500/25 flex items-center gap-2 hover:scale-105 transition-all"
            >
              <span>এখনই পরীক্ষা দিন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Why ADOMMO Leads (Learning Experience 4-Pillar Grid) */}
      <section className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-[#ed347d]">
            <Award className="w-3.5 h-3.5" />
            <span>অদম্য লার্নিং ইকোসিস্টেম</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            অদম্য যেভাবে তোমার সর্বোচ্চ প্রস্তুতি নিশ্চিত করে
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            শুধু পড়া নয়, বুঝে পড়া ও নিয়মিত পরীক্ষার মাধ্যমে ভর্তি পরীক্ষার শতভাগ প্রস্তুতি
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-pink-300 transition-all duration-300 space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#ed347d] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-slate-900">ডুয়াল টিচার লাইভ ক্লাস</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              একজন মূল শিক্ষক বোর্ড ও স্লাইডে কনসেপ্ট বুঝাবেন এবং সহকারী শিক্ষক লাইভ চ্যাটে তাৎক্ষণিক তোমার ডাউট ক্লিয়ার করবেন।
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all duration-300 space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6 fill-amber-500" />
            </div>
            <h4 className="text-base font-black text-slate-900">ওএমআর ও সিকিউ এক্সাম</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              বাস্তব পরীক্ষার আদলে টাইমারযুক্ত ওএমআর পরীক্ষা ও লিখিত সিকিউ খাতা সরাসরি শিক্ষক কর্তৃক রিভিউ ও নম্বর প্রদান।
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-slate-900">প্রিন্ট-রেডি লেকচার শিট</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              প্রতিটি ক্লাসের সাথে টাইপভিত্তিক সমাধান, শর্টকাট টেকনিক ও বিগত ২০ বছরের প্রশ্নব্যাংক সংবলিত বুকলেট পিডিএফ।
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 space-y-3 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-slate-900">মেধা তালিকা ও ড্যাশবোর্ড</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              অল বাংলাদেশ লিডারবোর্ডে নিজের অবস্থান নির্ণয় ও দুর্বল বিষয়গুলো চিহ্নিত করে স্বয়ংক্রিয় প্রগ্রেস ট্র্যাকিং।
            </p>
          </div>

        </div>
      </section>

      {/* 5. Student Testimonials (Success Stories) */}
      <section className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>সফলতার গল্প</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            শিক্ষার্থীরা যা বলছে অদম্য সম্পর্কে
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            স্বপ্নের বিশ্ববিদ্যালয়ে চান্স পাওয়া কৃতি শিক্ষার্থীদের বাস্তব অভিজ্ঞতা ও মতামত
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:bg-white hover:shadow-lg transition-all">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-500 text-xs">
                ★★★★★
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                “অদম্য-এর ভেক্টর ও গতিবিদ্যার ক্লাসগুলো আমার বেসিক একদম ক্লিয়ার করে দিয়েছিল। জটিল ম্যাথগুলো যেভাবে শর্টকাটে কিন্তু সঠিক নিয়মে বোঝানো হতো, তা আমাকে বুয়েট ভর্তি পরীক্ষায় অনেক কনফিডেন্স যুগিয়েছে।”
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-200/80">
              <div className="w-10 h-10 rounded-full bg-pink-100 text-[#ed347d] font-bold flex items-center justify-center text-sm">
                তা
              </div>
              <div>
                <h5 className="text-xs font-black text-slate-900">তানভীর আহমেদ</h5>
                <span className="text-[11px] text-[#ed347d] font-bold">বুয়েট '২৩ ব্যাচ (মেকানিক্যাল)</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:bg-white hover:shadow-lg transition-all">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-500 text-xs">
                ★★★★★
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                “মেডিকেল এডমিশনে ফিজিক্স অনেকের জন্য ভয়ের কারণ হয়। কিন্তু অদম্য-এর লাইন বাই লাইন ব্যাখ্যা এবং চ্যাপ্টারভিত্তিক ওএমআর টেস্ট আমাকে মেডিকেলের কঠিন লড়াইয়ে এগিয়ে রেখেছে।”
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-200/80">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                সা
              </div>
              <div>
                <h5 className="text-xs font-black text-slate-900">সাদিয়া আফরিন</h5>
                <span className="text-[11px] text-emerald-600 font-bold">ঢাকা মেডিকেল কলেজ (DMC '২৩)</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:bg-white hover:shadow-lg transition-all">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-500 text-xs">
                ★★★★★
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                “লাইভ এক্সাম ইঞ্জিন এবং পরীক্ষার পর সাথে সাথে অ্যানালাইসিস রিপোর্ট দেখার ব্যবস্থা চমৎকার! কোন টপিকে আমার দুর্বলতা ছিল তা খুব দ্রুত চিহ্নিত করে শুধরে নিতে পেরেছিলাম।”
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-slate-200/80">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                ফা
              </div>
              <div>
                <h5 className="text-xs font-black text-slate-900">ফাহিম হাসান</h5>
                <span className="text-[11px] text-blue-600 font-bold">ঢাকা বিশ্ববিদ্যালয় (DU A Unit)</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. FAQ Accordion Section */}
      <section className="max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            <HelpCircle className="w-3.5 h-3.5 text-[#ed347d]" />
            <span>সচরাচর জিজ্ঞাসা</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            ভর্তি ও কোর্স সম্পর্কিত সাধারণ প্রশ্নের সহজ উত্তর
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#ed347d]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. "আমাদের সম্পর্কে" (About ADOMMO) Section */}
      <section id="about" className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 scroll-mt-24">
        <div className="rounded-3xl bg-slate-50 border border-slate-200/80 p-8 sm:p-12 space-y-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#fff0f5] text-[#ed347d]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>আমাদের পরিচয় ও মিশন</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              ADOMMO (অদম্য) এডটেক
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>ADOMMO (অদম্য)</strong> বাংলাদেশের একটি আধুনিক শিক্ষামূলক প্ল্যাটফর্ম। আমাদের মূল লক্ষ্য হলো বিজ্ঞান ও গণিতের ভীতিকে দূর করে শিক্ষার্থীদের কাছে বিষয়গুলোকে অত্যন্ত বাস্তবসম্মত, আকর্ষণীয় ও আনন্দদায়কভাবে উপস্থাপন করা।
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              এইচএসসি একাডেমি, প্রকৌশল গুচ্ছ, মেডিকেল এডমিশন, সাধারণ বিশ্ববিদ্যালয় (ঢাবি, রাবি, জাবি, চবি) ও কৃষি গুচ্ছ ভর্তি প্রস্তুতিতে অদম্য টিম নিরলসভাবে কাজ করে যাচ্ছে। আমাদের প্রতিটি কোর্সে থাকছে ফুল এইচডি ইন্টারঅ্যাক্টিভ রেকর্ডিং, ওএমআর মডেল টেস্ট, লাইভ লিডারবোর্ড এবং প্রিন্ট-রেডি লেকচার বুক।
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
            <div className="text-center sm:text-left">
              <div className="text-2xl font-black text-[#ed347d]">৫০,০০০+</div>
              <div className="text-xs text-slate-500">মোট শিক্ষার্থী</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-2xl font-black text-slate-800">৪.৯ ★</div>
              <div className="text-xs text-slate-500">গড় সন্তুষ্টি রেটিং</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-2xl font-black text-slate-800">৯+ বছর</div>
              <div className="text-xs text-slate-500">শিক্ষকতার অভিজ্ঞতা</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-2xl font-black text-emerald-600">১০০%</div>
              <div className="text-xs text-slate-500">নিরাপদ ও নির্ভরযোগ্য</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
