'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import AdommoLogo from '@/components/AdommoLogo';
import { 
  Wrench, 
  UploadCloud, 
  FileJson, 
  FolderTree, 
  Search, 
  Eye, 
  ChevronRight, 
  ChevronDown, 
  PlayCircle, 
  FileText, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  BookOpen, 
  Video, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  User,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface ParsedClass {
  id: string;
  classNo?: string | number;
  title: string;
  description?: string;
  instructor?: string;
  videoUrl?: string;
  videoId?: string;
  hostingType?: string;
  lectureSheetPdf?: string;
  practiceSheetPdf?: string;
  solutionSheetPdf?: string;
  markedBookPdf?: string;
  paperTag?: string;
  [key: string]: any;
}

interface ParsedChapter {
  id: string;
  title: string;
  paperTag?: string;
  classes?: ParsedClass[];
  lectures?: any[];
  [key: string]: any;
}

interface ParsedSubject {
  id: string;
  title: string;
  isArchive?: boolean;
  isMultiPaper?: boolean;
  chapters?: ParsedChapter[];
  modules?: any[];
  [key: string]: any;
}

interface ParsedCourseData {
  courseId?: string;
  courseTitle?: string;
  title?: string;
  name?: string;
  subdomain?: string;
  extractedAt?: string;
  totalSubjects?: number;
  totalClasses?: number;
  subjects?: ParsedSubject[];
  archive?: {
    courseId?: string;
    title?: string;
    totalSubjects?: number;
    totalClasses?: number;
    subjects?: ParsedSubject[];
  };
  sections?: any[];
  modules?: any[];
  [key: string]: any;
}

export default function AutomationToolsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawJsonText, setRawJsonText] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedCourseData | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'hierarchy' | 'search' | 'raw'>('upload');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [selectedLesson, setSelectedLesson] = useState<ParsedClass | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper: Extract standardized hierarchy
  const getNormalizedSubjects = (data: ParsedCourseData | null): ParsedSubject[] => {
    if (!data) return [];
    
    // Case A: Scraper format (subjects array)
    if (Array.isArray(data.subjects) && data.subjects.length > 0) {
      let list = [...data.subjects];
      if (data.archive && Array.isArray(data.archive.subjects)) {
        list = [...list, ...data.archive.subjects.map(s => ({ ...s, isArchive: true }))];
      }
      return list;
    }

    // Case B: Standard Course schema with sections and modules
    if (Array.isArray(data.sections) || Array.isArray(data.modules)) {
      const sections = data.sections || [];
      const modules = data.modules || [];

      const subMap = new Map<string, ParsedSubject>();

      sections.forEach(sec => {
        subMap.set(sec.id, {
          id: sec.id,
          title: sec.title,
          isArchive: !!sec.isArchive,
          chapters: []
        });
      });

      modules.forEach(mod => {
        const secId = mod.parentSectionId || 'default_sec';
        if (!subMap.has(secId)) {
          subMap.set(secId, {
            id: secId,
            title: mod.parentSectionTitle || 'মূল বিষয়সমূহ',
            isArchive: !!mod.isArchive,
            chapters: []
          });
        }
        
        const sub = subMap.get(secId)!;
        const classes: ParsedClass[] = (mod.lectures || []).map((l: any, idx: number) => {
          const notes = l.notes || [];
          const lecSheet = notes.find((n: any) => n.type === 'lecture_sheet')?.pdfUrl;
          const pracSheet = notes.find((n: any) => n.type === 'practice_sheet')?.pdfUrl;
          const handnote = notes.find((n: any) => n.type === 'handnote')?.pdfUrl;

          return {
            id: l.id || `lec_${idx}`,
            classNo: idx + 1,
            title: l.title,
            videoUrl: l.videoUrl,
            lectureSheetPdf: lecSheet,
            practiceSheetPdf: pracSheet,
            solutionSheetPdf: handnote,
          };
        });

        sub.chapters = sub.chapters || [];
        sub.chapters.push({
          id: mod.id,
          title: mod.title,
          classes
        });
      });

      return Array.from(subMap.values());
    }

    return [];
  };

  const normalizedSubjects = getNormalizedSubjects(parsedData);

  // Calculate statistics
  const totalSubjectsCount = normalizedSubjects.length;
  const totalChaptersCount = normalizedSubjects.reduce((acc, s) => acc + (s.chapters?.length || 0), 0);
  const totalClassesCount = normalizedSubjects.reduce((acc, s) => 
    acc + (s.chapters?.reduce((cAcc, ch) => cAcc + (ch.classes?.length || 0), 0) || 0), 0);
  
  const totalSheetsCount = normalizedSubjects.reduce((acc, s) => 
    acc + (s.chapters?.reduce((cAcc, ch) => 
      cAcc + (ch.classes?.reduce((lAcc, cl) => 
        lAcc + (cl.lectureSheetPdf ? 1 : 0) + (cl.practiceSheetPdf ? 1 : 0) + (cl.solutionSheetPdf ? 1 : 0) + (cl.markedBookPdf ? 1 : 0)
      , 0) || 0)
    , 0) || 0), 0);

  // Process JSON File
  const handleFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      setErrorMsg('দয়া করে একটি সঠিক .json ফাইল নির্বাচন করুন');
      return;
    }

    setSelectedFile(file);
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setRawJsonText(text);
        const parsed = JSON.parse(text);
        setParsedData(parsed);
        setActiveTab('hierarchy');

        // Automatically expand first 3 chapters
        const newExpanded: Record<string, boolean> = {};
        const subs = getNormalizedSubjects(parsed);
        subs.forEach(s => {
          (s.chapters || []).slice(0, 3).forEach(ch => {
            newExpanded[ch.id] = true;
          });
        });
        setExpandedChapters(newExpanded);
      } catch (err: any) {
        setErrorMsg('JSON ফাইলটি পড়া সম্ভব হয়নি: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const courseDisplayName = parsedData?.courseTitle || parsedData?.title || parsedData?.name || selectedFile?.name || 'কোর্সের নাম নির্ধারিত হয়নি';

  // Filter lessons based on search
  const filteredHierarchy = normalizedSubjects.filter(sub => {
    if (selectedSubjectId !== 'all' && sub.id !== selectedSubjectId) return false;
    return true;
  }).map(sub => {
    const chapters = (sub.chapters || []).filter(ch => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const matchCh = ch.title.toLowerCase().includes(q);
      const matchCl = (ch.classes || []).some(cl => 
        cl.title.toLowerCase().includes(q) || 
        (cl.instructor && cl.instructor.toLowerCase().includes(q))
      );
      return matchCh || matchCl;
    });
    return { ...sub, chapters };
  }).filter(sub => sub.chapters && sub.chapters.length > 0);

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 font-sans selection:bg-pink-500 selection:text-white">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#161b22]/95 backdrop-blur border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <AdommoLogo variant="light" size="sm" />
          </Link>
          <div className="h-5 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300">
            <span className="p-1 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <Wrench className="w-3.5 h-3.5" />
            </span>
            <span>অদম্য অটোমেশন ও কোর্স জেসন ভিউয়ার টুলস</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/teacher" 
            className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            টিচার প্যানেল
          </Link>
          <Link 
            href="/admin" 
            className="text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white px-3 py-1.5 rounded-xl transition-all shadow-sm shadow-pink-600/30 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>অ্যাডমিন ড্যাশবোর্ড</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#18182b] to-[#121624] border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>JSON Structure Inspector & Hierarchy Visualizer</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
                কোর্স ফাইল ইন্সপেক্টর ও ডেটা স্ট্রাকচার চেক
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                যেকোনো কোর্স জেসন (.json) ফাইল আপলোড করুন। কোর্সটির বিষয় (Subject), অধ্যায় (Chapter), লেকচার/ক্লাস লিংক এবং লেকচার শিট, প্র্যাকটিস শিট ও ড্রাইভ লিংকগুলো সহজে এবং নিখুঁতভাবে পরীক্ষা করুন।
              </p>
            </div>

            {/* Quick Upload Button */}
            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#ff1361] to-[#ed347d] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-pink-500/20 cursor-pointer transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                <span>JSON ফাইল আপলোড করুন</span>
              </button>

              {parsedData && (
                <button
                  type="button"
                  onClick={() => {
                    setParsedData(null);
                    setSelectedFile(null);
                    setRawJsonText('');
                    setSelectedLesson(null);
                  }}
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>রিসেট</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Stats Strip if Data is Loaded */}
        {parsedData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-extrabold text-white">{totalSubjectsCount}</div>
                <div className="text-[11px] text-slate-400 font-medium">সর্বমোট বিষয় (Subjects)</div>
              </div>
            </div>

            <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-extrabold text-white">{totalChaptersCount}</div>
                <div className="text-[11px] text-slate-400 font-medium">অধ্যায় (Chapters)</div>
              </div>
            </div>

            <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-extrabold text-white">{totalClassesCount}</div>
                <div className="text-[11px] text-slate-400 font-medium">ভিডিও ক্লাস / লেকচার</div>
              </div>
            </div>

            <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-extrabold text-white">{totalSheetsCount}</div>
                <div className="text-[11px] text-slate-400 font-medium">লেকচার ও প্র্যাকটিস শিট</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'upload' 
                ? 'bg-pink-600 text-white' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>ফাইল আপলোড জোন</span>
          </button>

          {parsedData && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('hierarchy')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'hierarchy' 
                    ? 'bg-pink-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span>কোর্স হায়ারার্কি ভিউ (Hierarchy)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'search' 
                    ? 'bg-pink-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>ক্লাস ও শিট ফিল্টার</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('raw')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'raw' 
                    ? 'bg-pink-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>র' জেসন (Raw JSON)</span>
              </button>
            </>
          )}
        </div>

        {/* TAB 1: UPLOAD ZONE */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 ${
                isDragging 
                  ? 'border-pink-500 bg-pink-500/10' 
                  : 'border-slate-800 bg-[#161b22] hover:border-slate-700 hover:bg-[#1c2128]'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  আপনার কোর্সের .json ফাইলটি এখানে ড্র্যাগ করে ছাড়ুন অথবা ক্লিক করে নির্বাচন করুন
                </h3>
                <p className="text-xs text-slate-400">
                  সাপোর্ট করে: ACS এক্সপোর্টেড ফুল কোর্স ও আর্কাইভ ডেটা, এবং স্ট্যান্ডার্ড কোর্সের JSON ফাইল
                </p>
              </div>
              {selectedFile && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>লোডকৃত ফাইল: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>

            {/* Quick Demo Preview Box */}
            <div className="p-6 rounded-3xl bg-[#161b22] border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-pink-400" />
                <span>এই টুলটি আপনার জন্য কীভাবে তথ্য সাজিয়ে দেখাবে:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-1.5">
                  <span className="font-extrabold text-pink-400">১. বিষয় ও সেকশন (Subjects)</span>
                  <p className="text-slate-400">মেইন কোর্স ও আর্কাইভ ব্যাচের পদার্থবিজ্ঞান, রসায়ন, গণিত ইত্যাদি বিষয়গুলো স্বয়ংক্রিয়ভাবে আলাদা ক্যাটাগরিতে পাওয়া যাবে।</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-1.5">
                  <span className="font-extrabold text-indigo-400">২. অধ্যায় ও ইউনিট (Chapters)</span>
                  <p className="text-slate-400">প্রতিটি বিষয়ের অধীনে ক্রম অনুযায়ী চ্যাপ্টারগুলো নেস্টেড আকারে সাজানো থাকবে (এক ক্লিকে ড্রপডাউন উন্মুক্ত হবে)।</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0d1117] border border-slate-800 space-y-1.5">
                  <span className="font-extrabold text-emerald-400">৩. ক্লাস, ভিডিও লিংক ও শিট (Resources)</span>
                  <p className="text-slate-400">প্রতিটি ক্লাসের সরাসরি ভিডিও লিংক, লেকচার শিট (PDF), প্র্যাকটিস শিট এবং সল্যুশন ড্রাইভ লিংকের স্ট্যাটাস এক সাথে পরীক্ষা করা যাবে।</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HIERARCHY VIEW */}
        {activeTab === 'hierarchy' && parsedData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left 2 Cols: Structured Tree */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Course Title Card */}
              <div className="p-5 rounded-3xl bg-[#161b22] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-400 text-[10px] font-black border border-pink-500/30">
                      COURSE LOADED
                    </span>
                    {parsedData.subdomain && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Source: {parsedData.subdomain}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-extrabold text-white">
                    {courseDisplayName}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const allExp: Record<string, boolean> = {};
                      normalizedSubjects.forEach(s => {
                        (s.chapters || []).forEach(ch => {
                          allExp[ch.id] = true;
                        });
                      });
                      setExpandedChapters(allExp);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                  >
                    সব খুলুন (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedChapters({})}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                  >
                    সব বন্ধ করুন (-)
                  </button>
                </div>
              </div>

              {/* Subject Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedSubjectId('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSubjectId === 'all'
                      ? 'bg-pink-600 text-white'
                      : 'bg-[#161b22] text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  সকল বিষয় ({totalSubjectsCount})
                </button>
                {normalizedSubjects.map(sub => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                      selectedSubjectId === sub.id
                        ? 'bg-pink-600 text-white'
                        : 'bg-[#161b22] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {sub.isArchive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    )}
                    <span>{sub.title}</span>
                    <span className="text-[10px] opacity-70">({sub.chapters?.length || 0})</span>
                  </button>
                ))}
              </div>

              {/* Hierarchy Tree */}
              <div className="space-y-4">
                {filteredHierarchy.map((sub, sIdx) => (
                  <div key={sub.id} className="rounded-3xl bg-[#161b22] border border-slate-800 overflow-hidden shadow-lg">
                    
                    {/* Subject Header */}
                    <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold text-xs">
                          {sIdx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-sm text-white">{sub.title}</h3>
                            {sub.isArchive && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                                আর্কাইভ ব্যাচ
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {sub.chapters?.length || 0} টি অধ্যায় • {sub.chapters?.reduce((acc, c) => acc + (c.classes?.length || 0), 0) || 0} টি লেকচার ক্লাস
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Chapters List */}
                    <div className="divide-y divide-slate-800/60">
                      {sub.chapters?.map((ch) => {
                        const isExpanded = !!expandedChapters[ch.id];
                        const classes = ch.classes || [];

                        return (
                          <div key={ch.id} className="transition-colors">
                            {/* Chapter Bar */}
                            <button
                              type="button"
                              onClick={() => toggleChapter(ch.id)}
                              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="p-1 rounded-lg bg-slate-800 text-slate-400">
                                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                                </span>
                                <div className="truncate">
                                  <div className="font-bold text-xs sm:text-sm text-slate-200 truncate">
                                    {ch.title}
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                    <span>{classes.length} টি ক্লাস</span>
                                    <span>•</span>
                                    <span>
                                      {classes.filter(c => c.lectureSheetPdf || c.practiceSheetPdf).length} টি শিট
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <span className="text-[11px] font-bold text-slate-500 hover:text-slate-300">
                                {isExpanded ? 'লুকান' : 'বিস্তারিত'}
                              </span>
                            </button>

                            {/* Nested Classes Accordion */}
                            {isExpanded && (
                              <div className="bg-[#0d1117]/60 p-3 sm:p-4 space-y-2 border-t border-slate-800/80">
                                {classes.length === 0 ? (
                                  <div className="text-center py-4 text-xs text-slate-500 italic">
                                    এই অধ্যায়ে কোনো ক্লাস পাওয়া যায়নি।
                                  </div>
                                ) : (
                                  classes.map((cl, lIdx) => {
                                    const isSelected = selectedLesson?.id === cl.id;
                                    const hasVideo = !!cl.videoUrl || !!cl.videoId;
                                    const hasSheet = !!cl.lectureSheetPdf || !!cl.practiceSheetPdf || !!cl.solutionSheetPdf || !!cl.markedBookPdf;

                                    return (
                                      <div
                                        key={cl.id || lIdx}
                                        onClick={() => setSelectedLesson(cl)}
                                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                          isSelected
                                            ? 'bg-pink-500/10 border-pink-500/40 text-white shadow-md'
                                            : 'bg-[#161b22] border-slate-800 hover:border-slate-700 hover:bg-[#1a202c]'
                                        }`}
                                      >
                                        <div className="flex items-start gap-3 min-w-0">
                                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-black ${
                                            hasVideo ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                                          }`}>
                                            {cl.classNo || (lIdx + 1)}
                                          </div>
                                          <div className="min-w-0 space-y-1">
                                            <div className="font-bold text-xs leading-snug line-clamp-2">
                                              {cl.title}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                                              {cl.instructor && (
                                                <span className="flex items-center gap-1">
                                                  <User className="w-3 h-3 text-slate-500" />
                                                  {cl.instructor}
                                                </span>
                                              )}
                                              {cl.hostingType && (
                                                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                                                  {cl.hostingType}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Status Indicators */}
                                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                          {hasVideo && (
                                            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="ভিডিও লিংক উপলব্ধ">
                                              <PlayCircle className="w-3.5 h-3.5" />
                                            </span>
                                          )}
                                          {hasSheet && (
                                            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" title="PDF শিট লিংক উপলব্ধ">
                                              <FileText className="w-3.5 h-3.5" />
                                            </span>
                                          )}
                                          <span className="text-[10px] font-bold text-pink-400 ml-1">
                                            বিস্তারিত &gt;
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ))}
              </div>

            </div>

            {/* Right 1 Col: Selected Lesson Details Inspector */}
            <div className="sticky top-20 space-y-4">
              <div className="p-5 rounded-3xl bg-[#161b22] border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-pink-400" />
                    <span>ক্লাস ও রিসোর্স ইন্সপেক্টর</span>
                  </h3>
                  {selectedLesson && (
                    <button
                      type="button"
                      onClick={() => setSelectedLesson(null)}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      ক্লিয়ার
                    </button>
                  )}
                </div>

                {!selectedLesson ? (
                  <div className="text-center py-12 text-slate-500 space-y-2">
                    <Video className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs">বাম পাশের যেকোনো ক্লাসের ওপর ক্লিক করে তার ভিডিও লিংক ও শিটের তথ্য দেখুন।</p>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">লেকচার শিরোনাম</span>
                      <h4 className="font-extrabold text-sm text-white mt-0.5 leading-snug">
                        {selectedLesson.title}
                      </h4>
                    </div>

                    {/* Instructor & Meta */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#0d1117] border border-slate-800">
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase">শিক্ষক / ইনস্ট্রাক্টর</span>
                        <div className="font-semibold text-slate-200 truncate">
                          {selectedLesson.instructor || 'ACS মেন্টর'}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase">ক্লাস নম্বর</span>
                        <div className="font-semibold text-slate-200">
                          Class #{selectedLesson.classNo || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Video Link */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>ভিডিও স্ট্রিম লিংক</span>
                      </span>
                      {selectedLesson.videoUrl || selectedLesson.videoId ? (
                        <div className="p-3 rounded-2xl bg-[#0d1117] border border-emerald-500/20 space-y-2">
                          <div className="text-[11px] font-mono text-slate-300 break-all">
                            {selectedLesson.videoUrl || `Video ID: ${selectedLesson.videoId}`}
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            {selectedLesson.videoUrl && (
                              <a
                                href={selectedLesson.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 transition-colors"
                              >
                                <span>ভিডিও খুলুন</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => copyToClipboard(selectedLesson.videoUrl || selectedLesson.videoId || '', 'video')}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              {copiedLink === 'video' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                              <span>{copiedLink === 'video' ? 'কপি হয়েছে' : 'লিংক কপি'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-2xl bg-[#0d1117] border border-slate-800 text-slate-500 text-[11px] italic">
                          কোনো ভিডিও লিংক সংযুক্ত নেই
                        </div>
                      )}
                    </div>

                    {/* PDFs & Sheets Links */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase text-indigo-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>লেকচার ও প্র্যাকটিস শিটসমূহ (PDF)</span>
                      </span>

                      <div className="space-y-2">
                        {/* 1. Lecture Sheet */}
                        <div className="p-2.5 rounded-xl bg-[#0d1117] border border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] text-slate-300 font-medium">লেকচার শিট (PDF)</span>
                          {selectedLesson.lectureSheetPdf ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={selectedLesson.lectureSheetPdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 transition-colors"
                                title="খুলুন"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(selectedLesson.lectureSheetPdf!, 'lec')}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors cursor-pointer"
                                title="কপি করুন"
                              >
                                {copiedLink === 'lec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500">নেই</span>
                          )}
                        </div>

                        {/* 2. Practice Sheet */}
                        <div className="p-2.5 rounded-xl bg-[#0d1117] border border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] text-slate-300 font-medium">প্র্যাকটিস শিট (PDF)</span>
                          {selectedLesson.practiceSheetPdf ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={selectedLesson.practiceSheetPdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 transition-colors"
                                title="খুলুন"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(selectedLesson.practiceSheetPdf!, 'prac')}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors cursor-pointer"
                                title="কপি করুন"
                              >
                                {copiedLink === 'prac' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500">নেই</span>
                          )}
                        </div>

                        {/* 3. Solution Sheet */}
                        <div className="p-2.5 rounded-xl bg-[#0d1117] border border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] text-slate-300 font-medium">সল্যুশন বুকলেট (PDF)</span>
                          {selectedLesson.solutionSheetPdf ? (
                            <div className="flex items-center gap-1.5">
                              <a
                                href={selectedLesson.solutionSheetPdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 transition-colors"
                                title="খুলুন"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(selectedLesson.solutionSheetPdf!, 'sol')}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors cursor-pointer"
                                title="কপি করুন"
                              >
                                {copiedLink === 'sol' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500">নেই</span>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: SEARCH & FILTER */}
        {activeTab === 'search' && parsedData && (
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-[#161b22] border border-slate-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="ক্লাসের নাম, বিষয়ের নাম, শিক্ষক বা কীওয়ার্ড দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ক্লিয়ার
                </button>
              )}
            </div>

            <div className="space-y-2">
              {filteredHierarchy.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-[#161b22] border border-slate-800 text-slate-500 text-xs">
                  কোনো ক্লাস বা অধ্যায় খুঁজে পাওয়া যায়নি।
                </div>
              ) : (
                filteredHierarchy.map(sub => (
                  <div key={sub.id} className="p-4 rounded-3xl bg-[#161b22] border border-slate-800 space-y-3">
                    <h4 className="font-extrabold text-sm text-pink-400 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{sub.title}</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {sub.chapters?.flatMap(ch => 
                        (ch.classes || []).map(cl => (
                          <div 
                            key={cl.id}
                            className="p-3 rounded-2xl bg-[#0d1117] border border-slate-800 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-slate-200 truncate">{cl.title}</div>
                              <div className="text-[10px] text-slate-500">{ch.title}</div>
                            </div>
                            {cl.videoUrl && (
                              <a
                                href={cl.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                                title="ভিডিও লিংক"
                              >
                                <PlayCircle className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: RAW JSON VIEW */}
        {activeTab === 'raw' && (
          <div className="p-6 rounded-3xl bg-[#161b22] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <FileJson className="w-4 h-4 text-pink-400" />
                <span>র' জেসন আউটপুট (Raw Data)</span>
              </h3>
              <button
                type="button"
                onClick={() => copyToClipboard(rawJsonText, 'raw_json')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink === 'raw_json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedLink === 'raw_json' ? 'কপি হয়েছে' : 'সম্পূর্ণ JSON কপি'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-[#0d1117] border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[600px] scrollbar-thin">
              {rawJsonText}
            </pre>
          </div>
        )}

      </div>

    </div>
  );
}
