'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Wrench, Phone, Mail, ShieldAlert, Sparkles } from 'lucide-react';
import AdommoLogo from '@/components/AdommoLogo';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [supportHotline, setSupportHotline] = useState('01819-876543');
  const [supportEmail, setSupportEmail] = useState('support@adommo.com');

  useEffect(() => {
    // Check maintenance status
    const checkSettings = () => {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('adommo_system_settings');
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (parsed.maintenanceMode !== undefined) {
              setMaintenanceMode(Boolean(parsed.maintenanceMode));
              if (parsed.supportHotline) setSupportHotline(parsed.supportHotline);
              if (parsed.supportEmail) setSupportEmail(parsed.supportEmail);
            }
          } catch {}
        }
      }

      fetch('/api/admin/settings')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.success && data.settings) {
            setMaintenanceMode(Boolean(data.settings.maintenanceMode));
            if (data.settings.supportHotline) setSupportHotline(data.settings.supportHotline);
            if (data.settings.supportEmail) setSupportEmail(data.settings.supportEmail);
          }
        })
        .catch(() => {});
    };

    checkSettings();
  }, [pathname]);

  const isStandaloneStudio = pathname.startsWith('/teacher') || pathname.startsWith('/admin') || pathname.startsWith('/tools');
  const isAdminOrLogin = pathname.startsWith('/admin') || pathname.startsWith('/login');

  // If maintenance mode is active and user is not accessing admin/login, show friendly maintenance screen
  if (maintenanceMode && !isAdminOrLogin) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-pink-50/30 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-lg w-full bg-white rounded-[32px] p-8 sm:p-10 border border-slate-200/80 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.06)] text-center space-y-6">
          <div className="flex justify-center">
            <AdommoLogo />
          </div>

          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Wrench className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-[#ed347d] text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>সিস্টেম আপগ্রেড চলছে</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              প্ল্যাটফর্ম সাময়িক রক্ষণাবেক্ষণে রয়েছে
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              প্রিয় শিক্ষার্থী ও শিক্ষকবৃন্দ, আমাদের সার্ভার ও ডাটাবেজের পরিকল্পিত উন্নয়ন কার্যক্রম চলছে। কিছুক্ষণের মধ্যেই সিস্টেম পুনরায় সবার জন্য উন্মুক্ত করা হবে।
            </p>
          </div>

          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="font-bold text-slate-700">যেকোনো জরুরি জিজ্ঞাসা বা সহায়তায়:</div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
              <a href={`tel:${supportHotline}`} className="flex items-center gap-1.5 text-slate-700 hover:text-[#ed347d]">
                <Phone className="w-3.5 h-3.5 text-[#ed347d]" />
                <span className="font-mono">{supportHotline}</span>
              </a>
              <a href={`mailto:${supportEmail}`} className="flex items-center gap-1.5 text-slate-700 hover:text-[#ed347d]">
                <Mail className="w-3.5 h-3.5 text-[#ed347d]" />
                <span>{supportEmail}</span>
              </a>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
            <Link 
              href="/admin" 
              className="text-[11px] text-slate-400 hover:text-slate-600 font-medium flex items-center gap-1 transition-colors"
            >
              <ShieldAlert className="w-3 h-3" />
              <span>অ্যাডমিন অ্যাক্সেস</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className={`flex-1 ${isStandaloneStudio ? 'pt-0' : 'pt-[108px]'}`}>
      {children}
    </div>
  );
}
