'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import AdommoLogo from '@/components/AdommoLogo';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Heart
} from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // If on Teacher website, Super Admin, or Private Tools page, hide public footer
  if (pathname.startsWith('/teacher') || pathname.startsWith('/admin') || pathname.startsWith('/tools')) {
    return null;
  }

  return (
    <footer className="bg-[#111625] text-slate-300 pt-14 pb-10 border-t border-slate-800 font-sans">
      <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 space-y-10">
        
        {/* Top: Logo & Tagline */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <AdommoLogo variant="light" />
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 max-w-md">
            <span className="text-[#ed347d] font-bold block mb-0.5">লক্ষ্য ও উদ্দেশ্য:</span>
            বিজ্ঞান ও গণিতের কাঠিন্যতাকে দূর করে স্বপ্নের বিশ্ববিদ্যালয়ে পৌঁছানোর অদম্য প্রয়াস।
          </div>
        </div>

        {/* Middle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          
          {/* Col 1: Popular Programs */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">জনপ্রিয় প্রোগ্রাম</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/courses" className="hover:text-[#ed347d] transition-colors">
                  ভার্সিটি ও ইঞ্জিনিয়ারিং এডমিশন
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-[#ed347d] transition-colors">
                  মেডিকেল ও ডেন্টাল প্রস্তুতি
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-[#ed347d] transition-colors">
                  কৃষি গুচ্ছ ও জিএসটি প্রোগ্রাম
                </Link>
              </li>
              <li>
                <Link href="/exam/exam_vec_01" className="text-amber-400 hover:underline">
                  অল বাংলাদেশ ফ্রি মেগা মডেল টেস্ট
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Navigation & Auth */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">ন্যাভিগেশন</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-[#ed347d] transition-colors">
                  হোমপেজ
                </Link>
              </li>
              <li>
                <Link href="/#courses" className="hover:text-[#ed347d] transition-colors">
                  সব কোর্সসমূহ
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-[#ed347d] transition-colors text-pink-400 font-bold">
                  স্টুডেন্ট লগইন
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-[#ed347d] transition-colors text-pink-400 font-bold">
                  নতুন অ্যাকাউন্ট রেজিস্ট্রেশন
                </Link>
              </li>
              <li>
                <Link href="/teacher" className="hover:text-purple-400 transition-colors">
                  শিক্ষক স্টুডিও
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-rose-400 transition-colors">
                  সুপার অ্যাডমিন প্যানেল
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Details */}
          <div className="space-y-3 md:col-span-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">যোগাযোগ ও হেল্পলাইন</h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#ed347d] shrink-0" />
                <span>হটলাইন: +8809638123409 (সকাল ১০টা – রাত ৮টা)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>support@adommo.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span>মিরপুর ১০, ঢাকা ১২১৬, বাংলাদেশ</span>
              </div>
            </div>

            {/* Socials & Help buttons */}
            <div className="flex items-center gap-2.5 pt-2 flex-wrap">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800/90 hover:bg-[#1877f2] hover:text-white flex items-center justify-center transition-colors shadow-xs"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800/90 hover:bg-[#ff0000] hover:text-white flex items-center justify-center transition-colors shadow-xs"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="tel:09638123409"
                className="px-3.5 py-2 rounded-xl bg-[#ed347d]/20 border border-[#ed347d]/40 text-[#ff71a5] hover:bg-[#ed347d] hover:text-white transition-all font-bold flex items-center gap-1.5 text-xs shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>কল করুন</span>
              </a>
            </div>

            {/* Payment Partners Badges */}
            <div className="pt-2 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                অনুমোদিত পেমেন্ট গেটওয়ে
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-pink-950/60 border border-pink-700/40 text-pink-300 font-extrabold text-[11px]">
                  bKash
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-orange-950/60 border border-orange-700/40 text-orange-300 font-extrabold text-[11px]">
                  Nagad
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-700/40 text-purple-300 font-extrabold text-[11px]">
                  Rocket
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700/40 text-emerald-300 font-extrabold text-[11px]">
                  Upay
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} ADOMMO (অদম্য এডটেক). সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>১০০% নিরাপদ bKash / Nagad ভেরিফায়েড পেমেন্ট ও এনরোলমেন্ট সিস্টেম</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
