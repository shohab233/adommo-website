import React from 'react';

interface AdommoLogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  showSubtitle?: boolean;
  badge?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AdommoLogo({ 
  className = '', 
  variant = 'dark', 
  showSubtitle = true,
  badge,
  size = 'md'
}: AdommoLogoProps) {
  const isLight = variant === 'light';

  const iconSizes = {
    sm: 'w-8 h-8 rounded-[14px]',
    md: 'w-10 h-10 rounded-[16px]',
    lg: 'w-12 h-12 rounded-[18px]',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-[22px]',
    lg: 'text-2xl sm:text-[26px]',
  };

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      
      {/* 1. Iconic Dynamic Emblem (Squircle with Gradient & Glowing Star 'A') */}
      <div className={`relative ${iconSizes[size]} p-0.5 bg-gradient-to-tr from-[#ff1361] via-[#ed347d] to-[#9333ea] shadow-lg shadow-pink-500/25 shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        <div className="w-full h-full rounded-[13px] sm:rounded-[14px] bg-gradient-to-br from-[#f4256d] via-[#e11d63] to-[#be123c] flex items-center justify-center relative overflow-hidden">
          
          {/* Glass Specular Highlights */}
          <div className="absolute -top-3 -right-3 w-8 h-8 bg-white/30 rounded-full blur-xs pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/20 pointer-events-none" />
          
          {/* High-Precision Geometric Monogram 'A' */}
          <svg 
            className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10 drop-shadow-sm" 
            viewBox="0 0 32 32" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer dynamic A-wings */}
            <path 
              d="M16 4L6 26H11L16 14L21 26H26L16 4Z" 
              fill="white" 
              fillOpacity="0.95"
            />
            {/* Horizontal Energy Bridge */}
            <path 
              d="M10 20H22" 
              stroke="#ed347d" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
            />
            {/* Center Core Nucleus / Science Spark */}
            <circle 
              cx="16" 
              cy="20" 
              r="2" 
              fill="#ffffff" 
              stroke="#ed347d" 
              strokeWidth="1.5"
            />
            {/* Apex Diamond Star */}
            <path 
              d="M16 7.5L17 9.5L19 10L17 10.5L16 12.5L15 10.5L13 10L15 9.5L16 7.5Z" 
              fill="#ffffff" 
            />
          </svg>
        </div>
      </div>

      {/* 2. Brand Wordmark & Tagline */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`${textSizes[size]} font-black tracking-tight font-sans ${
              isLight ? 'text-white' : 'text-slate-900'
            }`}
          >
            AD<span className="bg-gradient-to-r from-[#ed347d] via-[#f43f5e] to-[#fb7185] bg-clip-text text-transparent">OMMO</span>
          </span>

          {/* Micro Pulsing Accent Orb */}
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-[#ed347d] to-[#fb7185] shadow-sm shadow-pink-500/50 animate-pulse" />

          {/* Optional Portal Badge */}
          {badge && (
            <span className={`ml-1 px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider border shadow-2xs ${
              badge.toLowerCase().includes('admin')
                ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-[#ed347d] border-pink-200'
                : 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-200'
            }`}>
              {badge}
            </span>
          )}
        </div>

        {showSubtitle && (
          <span
            className={`text-[9px] sm:text-[9.5px] font-extrabold tracking-[0.18em] uppercase mt-1 ${
              isLight ? 'text-pink-300' : 'text-slate-400'
            }`}
          >
            অদম্য এডটেক
          </span>
        )}
      </div>

    </div>
  );
}

