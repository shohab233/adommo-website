'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  Bell, 
  Radio, 
  Award, 
  FileText, 
  AlertTriangle, 
  Search, 
  CheckCheck, 
  Pin, 
  ExternalLink, 
  Eye, 
  Calendar, 
  Filter, 
  BookOpen, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function NotificationsPage() {
  const { 
    currentUser, 
    notifications, 
    unreadNotifCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    isNotificationForUser 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  // Filter only notifications visible to this user
  const userNotifs = notifications.filter(isNotificationForUser);

  const filteredNotifs = userNotifs.filter((n) => {
    const isUnread = !n.readBy?.includes(currentUser.id);
    if (showOnlyUnread && !isUnread) return false;

    const matchesCat = selectedCategory === 'all' || n.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.targetCourseTitle && n.targetCourseTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  const pinnedNotifs = filteredNotifs.filter(n => n.isPinned);
  const regularNotifs = filteredNotifs.filter(n => !n.isPinned);

  const categoryBadges: Record<string, { bg: string; text: string; label: string; icon: any }> = {
    live: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'লাইভ ক্লাস', icon: Radio },
    exam: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', label: 'পরীক্ষা ও রেজাল্ট', icon: Award },
    sheet: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'লেকচার শিট PDF', icon: FileText },
    urgent: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', label: 'জরুরি সতর্কতা', icon: AlertTriangle },
    course: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'কোর্স ঘোষণা', icon: BookOpen },
    general: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', label: 'সাধারণ নোটিশ', icon: Bell },
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">

        {/* 1. Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1e1b4b] to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold border border-pink-500/30">
                <Bell className="w-3.5 h-3.5 animate-bounce text-pink-400" />
                <span>অফিসিয়াল শিক্ষার্থী নোটিশ বোর্ড</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                নোটিফিকেশন ও ঘোষণা হাব
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                আপনার ভর্তি হওয়া কোর্সের লাইভ ক্লাসের লিংক, আসন্ন মডেল টেস্টের রুটিন, হ্যান্ডনোট PDF এবং ফ্যাকাল্টি শিক্ষকদের সকল নোটিশ এক নজরে দেখুন।
              </p>
            </div>

            {/* Quick Summary Cards */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[95px]">
                <span className="text-2xl font-black text-white">{notifications.length}</span>
                <p className="text-[11px] text-slate-300 font-medium">মোট নোটিশ</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[95px]">
                <span className="text-2xl font-black text-pink-400">{unreadNotifCount}</span>
                <p className="text-[11px] text-slate-300 font-medium">অপঠিত নোটিশ</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Controls & Filter Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="শিরোনাম, কোর্স বা বার্তা অনুসন্ধান করুন..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-[#ed347d]"
              />
            </div>

            {/* Actions: Mark All as Read & Unread Toggle */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowOnlyUnread(!showOnlyUnread)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  showOnlyUnread
                    ? 'bg-pink-50 text-[#ed347d] border-pink-200 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {showOnlyUnread ? '✓ শুধু অপঠিত' : 'শুধু অপঠিত দেখুন'}
              </button>

              {unreadNotifCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsAsRead}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-pink-400" />
                  <span>সব পঠিত চিহ্নিত করুন</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'সকল নোটিশ', count: userNotifs.length },
              { id: 'live', label: '🔵 লাইভ ক্লাস', count: userNotifs.filter(n => n.category === 'live').length },
              { id: 'exam', label: '🟣 পরীক্ষা ও রেজাল্ট', count: userNotifs.filter(n => n.category === 'exam').length },
              { id: 'sheet', label: '🟢 লেকচার শিট', count: userNotifs.filter(n => n.category === 'sheet').length },
              { id: 'urgent', label: '🔴 জরুরি সতর্কতা', count: userNotifs.filter(n => n.category === 'urgent').length },
              { id: 'course', label: '🟡 কোর্স ঘোষণা', count: userNotifs.filter(n => n.category === 'course').length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-[#ed347d] text-white shadow-xs shadow-pink-500/20'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedCategory === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Notifications Feed */}
        <div className="space-y-4">
          
          {/* Pinned Section */}
          {pinnedNotifs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-700 uppercase tracking-wider px-1">
                <Pin className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
                <span>শীর্ষে পিন করা গুরুত্বপূর্ণ ঘোষণাসমূহ</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {pinnedNotifs.map((n) => renderNotificationCard(n, true))}
              </div>
            </div>
          )}

          {/* Regular Notifications Section */}
          <div className="space-y-3">
            {regularNotifs.length > 0 && pinnedNotifs.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 uppercase tracking-wider px-1 pt-2">
                <Bell className="w-3.5 h-3.5 text-slate-500" />
                <span>ধারাবাহিক নোটিশ টাইমলাইন</span>
              </div>
            )}

            {regularNotifs.map((n) => renderNotificationCard(n, false))}
          </div>

          {filteredNotifs.length === 0 && (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#ed347d] flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-800">কোনো নোটিফিকেশন পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                আপনার নির্বাচিত ফিল্টারে কোনো নোটিশ নেই। অন্য কোনো ক্যাটাগরি বা সার্চ কি-ওয়ার্ড দিয়ে চেষ্টা করুন।
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setShowOnlyUnread(false);
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer transition-colors"
              >
                ফিল্টার রিসেট করুন
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );

  function renderNotificationCard(n: any, isPinnedSection: boolean) {
    const isUnread = !n.readBy?.includes(currentUser.id);
    const catInfo = categoryBadges[n.category] || categoryBadges.general;
    const CategoryIcon = catInfo.icon || Bell;

    return (
      <div
        key={n.id}
        onClick={() => {
          if (isUnread) markNotificationAsRead(n.id);
        }}
        className={`p-5 sm:p-6 rounded-3xl border transition-all cursor-pointer ${
          isPinnedSection
            ? 'bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 border-amber-300 shadow-sm'
            : isUnread
            ? 'bg-white border-pink-200/90 shadow-sm shadow-pink-500/5 hover:border-[#ed347d]'
            : 'bg-white/90 border-slate-200/80 hover:border-slate-300 shadow-xs'
        } space-y-3`}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {isPinnedSection && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-black border border-amber-200">
                <Pin className="w-3 h-3 fill-amber-700" />
                <span>পিন করা নোটিশ</span>
              </span>
            )}

            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[11px] font-bold ${catInfo.bg} ${catInfo.text}`}>
              <CategoryIcon className="w-3 h-3" />
              <span>{catInfo.label}</span>
            </span>

            {n.priority === 'urgent' && (
              <span className="px-2.5 py-0.5 rounded-lg bg-red-100 text-red-700 text-[10px] font-black animate-pulse">
                🔴 জরুরি সতর্কতা
              </span>
            )}

            {n.targetAudience === 'course' ? (
              <span className="text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-lg text-[11px]">
                📚 {n.targetCourseTitle || 'কোর্স স্পেশাল'}
              </span>
            ) : (
              <span className="text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-lg text-[11px]">
                🌐 সকল শিক্ষার্থী
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-400 font-medium">{n.createdAt}</span>
            {isUnread ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-50 text-[#ed347d] text-[10px] font-black border border-pink-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ed347d] animate-ping" />
                <span>নতুন</span>
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">✓ পঠিত</span>
            )}
          </div>
        </div>

        {/* Title & Message */}
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
            {n.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1.5 whitespace-pre-line">
            {n.message}
          </p>
        </div>

        {/* Footer: Sender details & CTA button */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            {n.senderAvatar ? (
              <img
                src={n.senderAvatar}
                alt={n.senderName}
                className="w-6 h-6 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-pink-100 text-[#ed347d] font-bold flex items-center justify-center text-[10px]">
                {n.senderName ? n.senderName[0] : 'অ'}
              </div>
            )}
            <span className="text-[11px]">
              ঘোষণা প্রদানকারী: <strong className="text-slate-700">{n.senderName}</strong>
              {n.senderRole && <span className="text-slate-400"> ({n.senderRole})</span>}
            </span>
          </div>

          {n.actionLabel && n.actionUrl && (
            <Link
              href={n.actionUrl}
              onClick={(e) => {
                e.stopPropagation();
                if (isUnread) markNotificationAsRead(n.id);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ed347d] to-[#f43f5e] hover:opacity-95 text-white font-bold text-xs shadow-xs shadow-pink-500/20 transition-all cursor-pointer shrink-0"
            >
              <span>{n.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    );
  }
}
