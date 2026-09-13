'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import AdommoLogo from '@/components/AdommoLogo';
import { 
  Home, 
  BookOpen, 
  Award, 
  Info, 
  Phone, 
  User as UserIcon, 
  Menu, 
  X, 
  Sparkles, 
  Flame, 
  GraduationCap, 
  ShieldCheck,
  ChevronDown,
  LogIn,
  LogOut,
  UserPlus,
  Radio,
  Bell,
  MessageSquare,
  CheckCheck,
  ExternalLink,
  Pin,
  ArrowRight
} from 'lucide-react';

export default function Navbar() {
  const { 
    currentRole, 
    setRole, 
    currentUser, 
    logoutUser, 
    enrollments, 
    liveClasses,
    notifications,
    unreadNotifCount,
    unreadStudentMsgCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    isNotificationForUser
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<'all' | 'unread' | 'urgent'>('all');
  const pathname = usePathname();

  // If on Teacher website, Super Admin, or Private Tools page, completely hide public notice & navbar
  if (pathname.startsWith('/teacher') || pathname.startsWith('/admin') || pathname.startsWith('/tools')) {
    return null;
  }

  const isGuest = !currentUser || !currentUser.id || currentUser.id === 'usr_guest';
  const hasActiveLive = liveClasses?.some(c => c.status === 'live');
  const userEnrollmentsCount = enrollments?.length || 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      
      {/* 1. Top Live Notice Bar (100% visible, sits at very top, never covered) */}
      <div className="pointer-events-auto bg-gradient-to-r from-[#fff0f5] via-[#fff5f8] to-[#fff0f5] border-b border-[#ffd2e2] py-2 px-4 text-xs shadow-xs">
        <div className="max-w-[1480px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium overflow-hidden whitespace-nowrap">
            {hasActiveLive ? (
              <Link 
                href="/my-courses"
                className="flex items-center gap-1.5 bg-rose-600 text-white px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-xs animate-pulse"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                🔴 লাইভ ক্লাস চলছে
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 bg-[#ed347d] text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                লাইভ নোটিশ
              </span>
            )}
            <span className="text-[#334155] font-semibold text-xs truncate">
              🎉 অদম্য এডটেক — পদার্থবিজ্ঞান ও উচ্চশিক্ষা ভর্তি প্রস্তুতিতে নতুন ব্যাচ Campus 6.0 এ ভর্তি চলছে!
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 shrink-0 text-[11px] text-slate-600 font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              অফিশিয়াল হেল্পলাইন: <strong className="text-[#ed347d] hover:underline cursor-pointer">+8809638123409</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Floating PhyHunt-Style Pill Navbar */}
      <div className="pt-2 px-2 sm:px-6 pointer-events-none">
        <div className="ph-modern-header-wrap pointer-events-auto">
          <nav className="ph-modern-navbar shadow-lg shadow-pink-500/5 backdrop-blur-xl bg-white/95 border border-slate-200/90 !px-2.5 sm:!px-4 lg:!px-4.5 !gap-1.5 sm:!gap-4">
            
            {/* ADOMMO Brand Logo */}
            <Link href="/" className="flex items-center shrink min-w-0 pr-1 sm:pr-2 transition-transform hover:scale-[1.02]">
              <AdommoLogo />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 ml-auto">
              <Link
                href="/"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  pathname === '/'
                    ? 'text-[#ed347d] bg-[#fff2f7] border-b-2 border-[#ed347d] shadow-xs'
                    : 'text-slate-600 hover:text-[#ed347d] hover:bg-[#fff3f7]'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>হোম</span>
              </Link>

              <Link
                href="/courses"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  pathname === '/courses'
                    ? 'text-[#ed347d] bg-[#fff2f7] border-b-2 border-[#ed347d] shadow-xs'
                    : 'text-slate-600 hover:text-[#ed347d] hover:bg-[#fff3f7]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>সব কোর্সসমূহ</span>
              </Link>

              {/* My Courses Shortcut if logged in */}
              {!isGuest && (
                <Link
                  href="/my-courses"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/my-courses'
                      ? 'text-[#ed347d] bg-[#fff2f7] border-b-2 border-[#ed347d] shadow-xs'
                      : 'text-slate-700 hover:text-[#ed347d] hover:bg-[#fff3f7]'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#ed347d]" />
                  <span>আমার কোর্স</span>
                  {userEnrollmentsCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-pink-100 text-[#ed347d] text-[10px] font-black">
                      {userEnrollmentsCount}
                    </span>
                  )}
                </Link>
              )}

              <Link
                href="/exam"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  pathname.startsWith('/exam')
                    ? 'text-amber-600 bg-amber-50 border-b-2 border-amber-500 shadow-xs'
                    : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>অনলাইন পরীক্ষা</span>
              </Link>

              <Link
                href="/#about"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-[#ed347d] hover:bg-[#fff3f7] transition-all"
              >
                <Info className="w-3.5 h-3.5" />
                <span>আমাদের সম্পর্কে</span>
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 ml-auto lg:ml-4 shrink-0">
              
              {/* Hotline Box */}
              <a
                href="tel:09638123409"
                className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-[#fff5f8] hover:border-[#ffd1e1] shadow-sm transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#f53278] to-[#e9287a] text-white flex items-center justify-center shrink-0 shadow-sm shadow-pink-500/20">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[9px] font-semibold text-slate-400">হটলাইন (১০টা-৮টা)</span>
                  <strong className="text-xs font-extrabold text-slate-800 tracking-tight mt-0.5">
                    +8809638123409
                  </strong>
                </div>
              </a>

              {/* Messages / Academic Doubt Link with Badge (Hidden on mobile to save space, accessible in drawer) */}
              <Link
                href="/messages"
                className="hidden md:flex relative w-9 h-9 rounded-xl items-center justify-center bg-white text-slate-600 border border-slate-200 hover:text-[#ed347d] hover:bg-pink-50 hover:border-pink-200 shadow-xs transition-all cursor-pointer"
                title="মেসেজ ও ডাউট সমাধান"
              >
                <MessageSquare className="w-4 h-4" />
                {unreadStudentMsgCount > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-gradient-to-r from-[#ed347d] to-pink-600 text-[10px] font-black text-white shadow-xs">
                      {unreadStudentMsgCount > 9 ? '9+' : unreadStudentMsgCount}
                    </span>
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-pink-400 animate-ping opacity-75 pointer-events-none" />
                  </>
                )}
              </Link>

              {/* Notification Bell with Badge & Dropdown Center */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setUserDropdownOpen(false);
                  }}
                  className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    notifDropdownOpen
                      ? 'bg-pink-50 text-[#ed347d] border border-pink-300 shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:text-[#ed347d] hover:bg-pink-50 hover:border-pink-200 shadow-xs'
                  }`}
                  title="নোটিফিকেশন সেন্টার"
                >
                  <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {unreadNotifCount > 0 && (
                    <>
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-gradient-to-r from-[#ff1361] to-[#ed347d] text-[10px] font-black text-white shadow-xs">
                        {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                      </span>
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-pink-400 animate-ping opacity-75 pointer-events-none" />
                    </>
                  )}
                </button>

                {/* Dropdown Popover */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-[310px] sm:w-[380px] rounded-3xl bg-white border border-slate-200/90 shadow-2xl z-50 animate-fade-in overflow-hidden text-xs">
                    {/* Header */}
                    <div className="p-3.5 bg-gradient-to-r from-slate-900 via-[#1e1b4b] to-slate-900 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="font-black text-xs text-white">নোটিফিকেশন হাব</h4>
                          <span className="text-[10px] text-slate-300">
                            {unreadNotifCount > 0 ? `${unreadNotifCount} টি অপঠিত নোটিশ` : 'সকল নোটিশ পড়া হয়েছে'}
                          </span>
                        </div>
                      </div>
                      {unreadNotifCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsAsRead}
                          className="text-[10px] font-bold text-pink-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg"
                        >
                          <CheckCheck className="w-3 h-3" />
                          <span>সব পঠিত</span>
                        </button>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    {(() => {
                      const userNotifications = notifications.filter(isNotificationForUser);
                      return (
                        <>
                          <div className="flex items-center border-b border-slate-100 bg-slate-50/80 px-3 py-1.5 gap-1.5 text-[11px] font-bold">
                            {[
                              { id: 'all', label: `সকল (${userNotifications.length})` },
                              { id: 'unread', label: `অপঠিত (${unreadNotifCount})` },
                              { id: 'urgent', label: '🔴 জরুরি' },
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => setNotifTab(tab.id as any)}
                                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                  notifTab === tab.id
                                    ? 'bg-white text-[#ed347d] shadow-xs border border-pink-100 font-extrabold'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>

                          {/* Notification List */}
                          <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100">
                            {(() => {
                              const filtered = userNotifications.filter((n) => {
                                if (notifTab === 'unread') return !n.readBy?.includes(currentUser.id);
                                if (notifTab === 'urgent') return n.priority === 'urgent';
                                return true;
                              });

                              if (filtered.length === 0) {
                                return (
                                  <div className="p-8 text-center space-y-1.5 text-slate-400">
                                    <Bell className="w-7 h-7 mx-auto text-slate-300" />
                                    <p className="text-xs font-bold text-slate-600">কোনো নোটিফিকেশন নেই</p>
                                    <p className="text-[10px]">নতুন কোনো ঘোষণা আসলে এখানে দেখতে পাবেন</p>
                                  </div>
                                );
                              }

                        const categoryBadges: Record<string, { bg: string; text: string; label: string }> = {
                          live: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'লাইভ ক্লাস' },
                          exam: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', label: 'পরীক্ষা' },
                          sheet: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'লেকচার শিট' },
                          urgent: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', label: 'জরুরি নোটিশ' },
                          course: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'কোর্স ঘোষণা' },
                          general: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', label: 'সাধারণ' },
                        };

                        return filtered.map((n) => {
                          const isUnread = !n.readBy?.includes(currentUser.id);
                          const catInfo = categoryBadges[n.category] || categoryBadges.general;

                          return (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (isUnread) markNotificationAsRead(n.id);
                              }}
                              className={`p-3 sm:p-3.5 transition-colors cursor-pointer ${
                                isUnread ? 'bg-pink-50/30 hover:bg-pink-50/60' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="shrink-0 mt-0.5">
                                  {isUnread ? (
                                    <span className="block w-2 h-2 rounded-full bg-[#ed347d] mt-1.5" />
                                  ) : (
                                    <span className="block w-2 h-2 rounded-full bg-slate-200 mt-1.5" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${catInfo.bg} ${catInfo.text}`}>
                                      {catInfo.label}
                                    </span>
                                    <span className="text-[10px] text-slate-400">{n.createdAt}</span>
                                  </div>

                                  <h5 className={`text-xs leading-snug line-clamp-2 ${isUnread ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                                    {n.title}
                                  </h5>

                                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                    {n.message}
                                  </p>

                                  {n.actionLabel && n.actionUrl && (
                                    <div className="pt-1">
                                      <Link
                                        href={n.actionUrl}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (isUnread) markNotificationAsRead(n.id);
                                          setNotifDropdownOpen(false);
                                        }}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ed347d] hover:underline"
                                      >
                                        <span>{n.actionLabel}</span>
                                        <ArrowRight className="w-2.5 h-2.5" />
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </>
                );
              })()}

                    {/* Footer */}
                    <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                      <Link
                        href="/notifications"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-xs font-bold text-[#ed347d] hover:text-[#be123c] flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>সকল নোটিশ ও টাইমলাইন দেখুন</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Login or Profile Dropdown */}
              {isGuest ? (
                <Link
                  href="/auth/login"
                  className="ph-modern-login !h-8 sm:!h-[38px] !px-3 sm:!px-5 !text-xs shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 mr-1" />
                  <span>লগইন</span>
                </Link>
              ) : (
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="ph-modern-login !h-8 sm:!h-[38px] !px-2.5 sm:!px-5 !text-xs shrink-0 max-w-[105px] sm:max-w-none"
                  >
                    <UserIcon className="w-3.5 h-3.5 mr-1 shrink-0" />
                    <span className="truncate">{currentUser.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3 ml-1 shrink-0" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-100 shadow-2xl p-2 space-y-1 z-50 animate-fade-in text-xs">
                      <div className="p-2 border-b border-slate-100">
                        <div className="font-bold text-slate-800">{currentUser.name}</div>
                        <span className="block text-[10px] text-slate-400 font-normal">{currentUser.phone}</span>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-pink-50 text-[#ed347d] text-[10px] font-bold">
                          {currentRole === 'admin' ? 'সুপার অ্যাডমিন' : currentRole === 'teacher' ? 'শিক্ষক' : 'শিক্ষার্থী'}
                        </span>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-[#fff2f7] hover:text-[#ed347d] font-semibold transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-[#ed347d]" />
                        আমার ড্যাশবোর্ড
                      </Link>
                      <Link
                        href="/my-courses"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-[#fff2f7] hover:text-[#ed347d] font-semibold transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-[#ed347d]" />
                        আমার কোর্সসমূহ
                      </Link>
                      <Link
                        href="/exam"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-xl text-amber-600 hover:bg-amber-50 font-semibold transition-colors"
                      >
                        <Award className="w-4 h-4 text-amber-500" />
                        অনলাইন পরীক্ষা
                      </Link>
                      <div className="border-t border-slate-100 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logoutUser();
                          }}
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          লগআউট করুন
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button (Hamburger) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-pink-50 text-slate-700 hover:text-[#ed347d] shrink-0 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                aria-label="মেনু খুলুন"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-[#ed347d]" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </nav>

          {/* Mobile Menu Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-2 p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl space-y-3 animate-fade-in pointer-events-auto text-xs">
              <div className="flex flex-col space-y-1 font-semibold text-slate-700">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-pink-50 hover:text-[#ed347d]">
                  হোমপেজ
                </Link>
                <Link href="/courses" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-pink-50 hover:text-[#ed347d]">
                  সব কোর্সসমূহ
                </Link>
                {!isGuest && (
                  <Link href="/my-courses" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-pink-50 text-[#ed347d] font-bold flex items-center justify-between">
                    <span>আমার কোর্সসমূহ</span>
                    {userEnrollmentsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-pink-100 text-[#ed347d] text-[10px]">
                        {userEnrollmentsCount}টি কোর্স
                      </span>
                    )}
                  </Link>
                )}
                <Link href="/notifications" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-pink-50 text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#ed347d]" />
                    <span>নোটিশ বোর্ড ও বার্তা</span>
                  </span>
                  {unreadNotifCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#ff1361] to-[#ed347d] text-white text-[10px] font-black">
                      {unreadNotifCount} নতুন
                    </span>
                  )}
                </Link>

                <Link href="/messages" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-pink-50 text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#ed347d]" />
                    <span>মেসেজ ও ডাউট সমাধান</span>
                  </span>
                  {unreadStudentMsgCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#ff1361] to-[#ed347d] text-white text-[10px] font-black">
                      {unreadStudentMsgCount} নতুন
                    </span>
                  )}
                </Link>
                <Link href="/#about" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-pink-50 hover:text-[#ed347d]">
                  আমাদের সম্পর্কে
                </Link>
                
                <div className="border-t border-slate-200 pt-2 flex flex-col gap-1.5">
                  {isGuest ? (
                    <>
                      <Link
                        href="/auth/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 text-center rounded-xl bg-gradient-to-r from-[#f53278] to-[#e9287a] text-white font-bold"
                      >
                        লগইন করুন
                      </Link>
                      <Link
                        href="/auth/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 text-center rounded-xl bg-slate-100 text-slate-700 font-bold"
                      >
                        নতুন অ্যাকাউন্ট তৈরি (রেজিস্ট্রেশন)
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/my-courses"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 text-center rounded-xl bg-pink-50 text-[#ed347d] font-bold"
                      >
                        আমার কোর্সসমূহ
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 text-center rounded-xl bg-slate-100 text-slate-700 font-bold"
                      >
                        আমার ড্যাশবোর্ড
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logoutUser();
                        }}
                        className="p-2 text-center rounded-xl bg-rose-50 text-rose-600 font-bold"
                      >
                        লগআউট ({currentUser.name})
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
