'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isStandaloneStudio = pathname.startsWith('/teacher') || pathname.startsWith('/admin') || pathname.startsWith('/tools');

  return (
    <div className={`flex-1 ${isStandaloneStudio ? 'pt-0' : 'pt-[108px]'}`}>
      {children}
    </div>
  );
}
