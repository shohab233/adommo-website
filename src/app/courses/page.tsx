'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import CourseCard from '@/components/CourseCard';
import { 
  BookOpen, 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  ArrowLeft,
  Flame,
  CheckCircle2
} from 'lucide-react';

export default function AllCoursesPage() {
  const { courses } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'enrolled'>('default');
  const [visibleCount, setVisibleCount] = useState(12);

  const categories = [
    { label: 'সকল কোর্স', value: 'all' },
    { label: 'ভার্সিটি এডমিশন (A Unit)', value: 'Engineering' },
    { label: 'মেডিকেল ও ডেন্টাল', value: 'Medical' },
    { label: 'কৃষি বিশ্ববিদ্যালয় গুচ্ছ', value: 'Agri Admission' },
    { label: 'HSC একাডেমিক কোর্স', value: 'HSC' },
    { label: 'ফ্রি মডেল টেস্ট ও স্কলারশিপ', value: 'Free Tests' },
  ];

  const uniqueCourses = Array.from(new Map(courses.map((c) => [c.id, c])).values());
  const publishedCourses = uniqueCourses.filter((c) => !c.isDraft && !c.isArchived && c.isPublished !== false);

  const filteredCourses = publishedCourses
    .filter((c) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        c.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.batch && c.batch.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.offerPrice - b.offerPrice;
      if (sortBy === 'price-high') return b.offerPrice - a.offerPrice;
      if (sortBy === 'enrolled') return b.enrolledCount - a.enrolledCount;
      return 0;
    });

  const displayedCourses = filteredCourses.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCourses.length;

  return (
    <div className="bg-white min-h-screen pb-20 pt-6 font-sans">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-b from-[#fff5f8] to-white border-b border-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1480px] mx-auto space-y-4">
          
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#ed347d] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোমপেজে ফিরে যান</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-pink-100 text-[#ed347d]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>অদম্য এডটেক কোর্স ডিরেক্টরি</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                সকল কোর্স ও স্পেশাল ব্যাচসমূহ
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                পদার্থবিজ্ঞান, গণিত, রসায়ন ও জীববিজ্ঞানের শীর্ষ মেন্টরদের পরিচালিত লাইভ ও ফুল এইচডি রেকর্ডেড কোর্স
              </p>
            </div>

            <div className="text-xs text-slate-500 font-semibold bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
              মোট সক্রিয় কোর্স: <strong className="text-[#ed347d]">{publishedCourses.length}টি</strong>
            </div>
          </div>

        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
          
          {/* Search Box */}
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="কোর্স বা বিষয়ের নাম দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#ed347d] focus:border-transparent"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="w-full sm:w-auto flex items-center justify-end gap-2 text-xs">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-600 shrink-0">সর্ট করুন:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#ed347d]"
            >
              <option value="default">ডিফল্ট ক্রম</option>
              <option value="enrolled">জনপ্রিয়তা (এনরোলমেন্ট সংখ্যা)</option>
              <option value="price-low">মূল্য: কম থেকে বেশি</option>
              <option value="price-high">মূল্য: বেশি থেকে কম</option>
            </select>
          </div>

        </div>

        {/* Category Pill Tabs with Counts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const count = publishedCourses.filter(
              (c) => cat.value === 'all' || c.category?.toLowerCase() === cat.value.toLowerCase()
            ).length;

            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.value
                    ? 'bg-gradient-to-r from-[#f53278] to-[#e9287a] text-white shadow-md shadow-pink-500/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-[#ffd2e2] hover:bg-[#fff9fb]'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
                    selectedCategory === cat.value ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Course Cards Grid */}
        {filteredCourses.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {displayedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {hasMore && (
              <div className="pt-6 pb-2 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#ed347d] to-[#d9226b] text-white font-black text-xs hover:shadow-lg hover:shadow-pink-500/25 transition-all active:scale-95"
                >
                  আরও কোর্স দেখুন ({filteredCourses.length - visibleCount}টি বাকি)
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200 p-8 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">কোনো কোর্স খুঁজে পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500">অন্য কোনো কি-ওয়ার্ড দিয়ে সার্চ করে দেখুন</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#ed347d] bg-pink-50 hover:bg-pink-100"
            >
              ফিল্টার ক্লিয়ার করুন
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
