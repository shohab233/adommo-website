'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { TeacherKycData } from '@/types';
import AdommoLogo from '@/components/AdommoLogo';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  User,
  School,
  Sparkles,
  ExternalLink,
  Copy,
  LogOut,
  CreditCard,
  Phone,
  Calendar,
  Lock,
  Eye,
  Check,
  X,
  BadgeCheck,
  MapPin,
  FileCheck2,
  UploadCloud,
  FileText,
  Mail,
  GraduationCap
} from 'lucide-react';

interface TeacherKycScreenProps {
  kycStatus: 'unsubmitted' | 'pending' | 'approved' | 'rejected';
  currentKyc?: TeacherKycData;
  onLogout: () => void;
}

export default function TeacherKycScreen({
  kycStatus,
  currentKyc,
  onLogout,
}: TeacherKycScreenProps) {
  const { currentUser, submitTeacherKyc, showToast } = useApp();

  // Wizard state: 1 = Personal/Legal, 2 = Address & Contact, 3 = Academic & Payout, 4 = Documents & Review
  const [kycStep, setKycStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Personal & Legal Identity
  const [fullName, setFullName] = useState(currentKyc?.fullName || currentUser?.name || '');
  const [fatherName, setFatherName] = useState(currentKyc?.fatherName || '');
  const [motherName, setMotherName] = useState(currentKyc?.motherName || '');
  const [dateOfBirth, setDateOfBirth] = useState(currentKyc?.dateOfBirth || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(currentKyc?.gender || 'male');
  const [idType, setIdType] = useState<'nid' | 'passport' | 'birth_cert'>(currentKyc?.idType || 'nid');
  const [idNumber, setIdNumber] = useState(currentKyc?.idNumber || '');

  // Step 2: Address & Emergency Contact
  const [presentAddress, setPresentAddress] = useState(currentKyc?.presentAddress || '');
  const [permanentAddress, setPermanentAddress] = useState(currentKyc?.permanentAddress || '');
  const [sameAddress, setSameAddress] = useState(false);
  const [emergencyName, setEmergencyName] = useState(currentKyc?.emergencyContactName || '');
  const [emergencyPhone, setEmergencyPhone] = useState(currentKyc?.emergencyContactPhone || '');
  const [emergencyRelation, setEmergencyRelation] = useState(currentKyc?.emergencyContactRelation || 'পিতা');

  // Step 3: Academic & Payout Details
  const [institutionName, setInstitutionName] = useState(currentKyc?.institutionName || currentUser?.college || '');
  const [degreeName, setDegreeName] = useState(currentKyc?.degreeName || '');
  const [departmentName, setDepartmentName] = useState(currentKyc?.departmentName || '');
  const [passingYear, setPassingYear] = useState(currentKyc?.passingYear || '');
  const [demoVideoLink, setDemoVideoLink] = useState(currentKyc?.demoVideoLink || '');
  const [payoutMethod, setPayoutMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Bank'>(currentKyc?.payoutMethod || 'bKash');
  const [payoutAccountNumber, setPayoutAccountNumber] = useState(currentKyc?.payoutAccountNumber || currentUser?.phone || '');
  const [payoutBankName, setPayoutBankName] = useState(currentKyc?.payoutBankName || '');
  const [payoutBranchName, setPayoutBranchName] = useState(currentKyc?.payoutBranchName || '');
  
  // Step 4: Documents & Review (Real uploaded documents, no auto mock images)
  const [idFrontImage, setIdFrontImage] = useState(currentKyc?.idFrontImage || '');
  const [idBackImage, setIdBackImage] = useState(currentKyc?.idBackImage || '');
  const [academicCertificateImage, setAcademicCertificateImage] = useState(currentKyc?.academicCertificateImage || '');
  const [selfieWithIdImage, setSelfieWithIdImage] = useState(currentKyc?.selfieWithIdImage || '');
  
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [selectedZoomDoc, setSelectedZoomDoc] = useState<{ title: string; url: string } | null>(null);

  // Address copy handler
  const handleSameAddressToggle = (checked: boolean) => {
    setSameAddress(checked);
    if (checked) {
      setPermanentAddress(presentAddress);
    }
  };

  // Real File Upload Handler (converts chosen file to base64 data URL)
  const handleFileUpload = (
    file: File | undefined,
    setter: (val: string) => void,
    docTitle: string
  ) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('⚠️ শুধুমাত্র ইমেজ ফাইল (JPG, PNG, WebP) আপলোড করুন।');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('⚠️ ফাইল সাইজ খুব বড় (সর্বোচ্চ ৫ MB অনুমোদিত)।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setter(result);
      showToast(`✅ ${docTitle} সফলভাবে আপলোড করা হয়েছে!`);
    };
    reader.onerror = () => {
      showToast(`❌ ${docTitle} আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।`);
    };
    reader.readAsDataURL(file);
  };

  // Validations
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('দয়া করে আপনার পূর্ণ নাম লিখুন');
      return;
    }
    if (!idNumber.trim()) {
      showToast('দয়া করে আপনার পরিচয়পত্র নম্বর লিখুন');
      return;
    }
    setKycStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presentAddress.trim()) {
      showToast('দয়া করে বর্তমান ঠিকানা লিখুন');
      return;
    }
    if (!emergencyPhone.trim() || emergencyPhone.trim().length < 11) {
      showToast('জরুরি যোগাযোগের জন্য সচল ১১ ডিজিটের মোবাইল নম্বর দিন');
      return;
    }
    setKycStep(3);
  };

  const handleStep3Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionName.trim() || !degreeName.trim()) {
      showToast('দয়া করে আপনার শিক্ষাপ্রতিষ্ঠান ও ডিগ্রির নাম লিখুন');
      return;
    }
    if (!payoutAccountNumber.trim()) {
      showToast('সম্মানী ও টিউশন ফি পাওয়ার জন্য অ্যাকাউন্ট নম্বর দিন');
      return;
    }
    setKycStep(4);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFrontImage) {
      showToast('⚠️ ১. অনুগ্রহ করে আপনার NID / পরিচয়পত্রের সম্মুখ ভাগ আপলোড করুন।');
      return;
    }
    if (!idBackImage) {
      showToast('⚠️ ২. অনুগ্রহ করে আপনার NID / পরিচয়পত্রের পেছনের ভাগ আপলোড করুন।');
      return;
    }
    if (!academicCertificateImage) {
      showToast('⚠️ ৩. অনুগ্রহ করে আপনার শিক্ষাগত ডিগ্রি সনদপত্র আপলোড করুন।');
      return;
    }
    if (!selfieWithIdImage) {
      showToast('⚠️ ৪. অনুগ্রহ করে পরিচয়পত্রসহ লাইভ সেলফি ছবি আপলোড করুন।');
      return;
    }
    if (!agreeTerms) {
      showToast('দয়া করে সত্যতা ও নীতিমালা নিশ্চয়তা বক্সে টিক দিন');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      submitTeacherKyc({
        teacherId: currentUser.id || `usr_teacher_${Date.now()}`,
        teacherName: fullName.trim(),
        teacherEmail: currentUser.email || '',
        teacherPhone: currentUser.phone || '',
        fullName: fullName.trim(),
        fatherName: fatherName.trim(),
        motherName: motherName.trim(),
        dateOfBirth,
        gender,
        idType,
        idNumber: idNumber.trim(),
        presentAddress: presentAddress.trim(),
        permanentAddress: permanentAddress.trim() || presentAddress.trim(),
        emergencyContactName: emergencyName.trim() || fatherName.trim(),
        emergencyContactPhone: emergencyPhone.trim(),
        emergencyContactRelation: emergencyRelation,
        payoutMethod,
        payoutAccountNumber: payoutAccountNumber.trim(),
        payoutBankName: payoutMethod === 'Bank' ? payoutBankName.trim() : undefined,
        payoutBranchName: payoutMethod === 'Bank' ? payoutBranchName.trim() : undefined,
        idFrontImage,
        idBackImage,
        academicCertificateImage,
        selfieWithIdImage,
        demoVideoLink: demoVideoLink.trim() || undefined,
        institutionName: institutionName.trim(),
        degreeName: degreeName.trim(),
        departmentName: departmentName.trim(),
        passingYear: passingYear.trim(),
      });
      setSubmitting(false);
    }, 500);
  };

  const stepsMeta = [
    { num: 1, title: 'পরিচয়', icon: User },
    { num: 2, title: 'ঠিকানা', icon: MapPin },
    { num: 3, title: 'একাডেমিক', icon: School },
    { num: 4, title: 'ডকুমেন্টস', icon: FileCheck2 },
  ];

  // =========================================================================
  // VIEW 1: UNDER REVIEW STATE
  // =========================================================================
  if (kycStatus === 'pending') {
    return (
      <div className="min-h-[calc(100vh-108px)] bg-gradient-to-br from-[#fff4f8] via-[#fafbfc] to-[#f4f3ff] flex items-center justify-center py-10 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-pink-300/30 via-indigo-300/20 to-purple-300/25 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[560px] relative z-10 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#ed347d]" />
              <span>শিক্ষক ভেরিফিকেশন হাব</span>
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-[36px] border border-pink-100 shadow-2xl shadow-pink-500/10 p-7 sm:p-9 space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-xs animate-pulse">
              <Clock className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>KYC আবেদন পর্যালোচনায় রয়েছে</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 pt-1">
                আবেদনটি সুপার অ্যাডমিন নিরীক্ষা করছেন
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                আপনার দাখিলকৃত জাতীয় পরিচয়পত্র ও শিক্ষাগত সনদ যাচাই করা হচ্ছে। সাধারণত <strong>২ থেকে ১২ ঘণ্টার মধ্যে</strong> চূড়ান্ত অনুমোদন দেওয়া হয়।
              </p>
            </div>

            {/* Application ID pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
              <span className="text-slate-400">ট্র্যাকিং আইডি:</span>
              <strong className="text-[#ed347d] font-bold">
                #{currentKyc?.applicationId || 'KYC-2026'}
              </strong>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(currentKyc?.applicationId || 'KYC-2026');
                  showToast('📋 ট্র্যাকিং আইডি কপি করা হয়েছে!');
                }}
                className="p-0.5 hover:text-[#ed347d] transition-colors"
                title="কপি"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Simple 3-step progress */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs">
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">✓</div>
                <span className="font-bold text-slate-800">১. আবেদন ও ডকুমেন্টস দাখিল সম্পন্ন</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 animate-pulse">⏳</div>
                <span className="font-bold text-blue-700">২. সুপার অ্যাডমিন ব্যাকগ্রাউন্ড ভেরিফিকেশন (চলমান)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0">৩</div>
                <span>৩. চূড়ান্ত অনুমোদন ও শিক্ষক প্যানেল ১০০% আনলক</span>
              </div>
            </div>

            {/* Submitted Documents Quick Views */}
            <div className="space-y-1.5 text-left">
              <span className="text-[11px] font-bold text-slate-500 block">দাখিলকৃত ডকুমেন্টস (ক্লিক করে জুম করুন):</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'NID Front', url: currentKyc?.idFrontImage || idFrontImage },
                  { label: 'NID Back', url: currentKyc?.idBackImage || idBackImage },
                  { label: 'সনদপত্র', url: currentKyc?.academicCertificateImage || academicCertificateImage },
                  { label: 'সেলফি', url: currentKyc?.selfieWithIdImage || selfieWithIdImage },
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedZoomDoc({ title: doc.label, url: doc.url })}
                    className="relative h-16 rounded-xl overflow-hidden border border-slate-200 bg-white cursor-pointer hover:border-[#ed347d] transition-all group"
                  >
                    <img src={doc.url} alt={doc.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Zoom Lightbox Modal */}
        {selectedZoomDoc && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedZoomDoc(null)}
          >
            <div className="bg-white rounded-2xl max-w-lg w-full p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">{selectedZoomDoc.title}</h4>
                <button type="button" onClick={() => setSelectedZoomDoc(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <img src={selectedZoomDoc.url} alt="" className="w-full max-h-[60vh] object-contain rounded-xl border border-slate-100" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: REJECTED STATE
  // =========================================================================
  if (kycStatus === 'rejected') {
    return (
      <div className="min-h-[calc(100vh-108px)] bg-gradient-to-br from-[#fff4f8] via-[#fafbfc] to-[#f4f3ff] flex items-center justify-center py-10 px-4 sm:px-6 relative overflow-hidden">
        <div className="w-full max-w-[540px] relative z-10 space-y-4 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-xl rounded-[36px] border border-rose-100 shadow-2xl p-7 sm:p-9 space-y-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200">
                আবেদন সংশোধন আবশ্যক
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                আপনার KYC আবেদনটি গৃহীত হয়নি
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-left space-y-1">
              <span className="text-[10px] font-black uppercase text-rose-700 tracking-wider block">
                অ্যাডমিনের পর্যবেক্ষণ ও মন্তব্য:
              </span>
              <p className="text-xs text-rose-900 font-medium leading-relaxed">
                "{currentKyc?.rejectionReason || 'প্রদত্ত তথ্য অথবা নথিপত্র অস্পষ্ট ছিল। অনুগ্রহ করে সংশোধন করে পুনরায় আবেদন করুন।'}"
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onLogout}
                className="w-1/3 py-3 rounded-2xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                লগআউট
              </button>
              <button
                type="button"
                onClick={() => {
                  setKycStep(1);
                  window.location.reload();
                }}
                className="w-2/3 py-3 rounded-2xl text-xs font-black text-white ph-btn-pink shadow-md hover:scale-[1.01] transition-all"
              >
                তথ্য সংশোধন করে পুনরায় জমা দিন
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: COMPACT & ELEGANT 4-STEP WIZARD (MATCHING REGISTRATION SIZING)
  // =========================================================================
  return (
    <div className="min-h-[calc(100vh-108px)] bg-gradient-to-br from-[#fff4f8] via-[#fafbfc] to-[#f4f3ff] flex items-center justify-center py-10 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-pink-300/30 via-indigo-300/20 to-purple-300/25 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[540px] relative z-10 space-y-4 animate-fade-in">
        
        {/* Top bar */}
        <div className="flex items-center justify-between px-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#ed347d] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>মূল ওয়েবসাইটে ফিরুন</span>
          </Link>

          <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            ধাপ {kycStep} / ৪
          </span>
        </div>

        {/* Centered Modern Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[36px] border border-pink-100 shadow-2xl shadow-pink-500/10 p-7 sm:p-9 space-y-5">
          
          {/* Header & Logo */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <AdommoLogo />
            </div>
            <div className="space-y-1 pt-0.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-[#fff0f5] text-[#ed347d] border border-pink-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>শিক্ষক KYC ও ভেরিফিকেশন</span>
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {kycStep === 1 && 'ব্যক্তিগত পরিচয় ও NID'}
                {kycStep === 2 && 'ঠিকানা ও জরুরি যোগাযোগ'}
                {kycStep === 3 && 'একাডেমিক ও রয়্যালটি পেআউট'}
                {kycStep === 4 && 'প্রমাণক ও সার্টিফিকেট আপলোড'}
              </h1>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {kycStep === 1 && 'জাতীয় পরিচয়পত্র বা পাসপোর্ট অনুযায়ী সঠিক তথ্য দিন।'}
                {kycStep === 2 && 'বর্তমান বাসস্থান ও জরুরি অভিভাবকের তথ্য পূরণ করুন।'}
                {kycStep === 3 && 'ডিগ্রি ও কোর্স ফির অর্থ গ্রহণের মাধ্যম নির্বাচন করুন।'}
                {kycStep === 4 && 'পরিচয়পত্র ও সনদের স্ক্যান কপি নিশ্চিত করুন।'}
              </p>
            </div>
          </div>

          {/* 4-Step Visual Capsule Stepper (Exactly matching teacher registration) */}
          <div className="bg-slate-50/80 p-2 rounded-2xl border border-slate-200/80 shadow-inner">
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {stepsMeta.map((s) => {
                const isCompleted = kycStep > s.num;
                const isActive = kycStep === s.num;

                return (
                  <div
                    key={s.num}
                    onClick={() => {
                      if (kycStep > s.num) setKycStep(s.num);
                    }}
                    className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-white shadow-md shadow-pink-500/10 border border-pink-200 text-[#ed347d] scale-[1.02]'
                        : isCompleted
                        ? 'text-emerald-600 bg-emerald-50/50'
                        : 'text-slate-400 opacity-70'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black mb-1 transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#fa507e] to-[#ec376d] text-white shadow-sm shadow-pink-500/30'
                          : isCompleted
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                    </div>
                    <span className="text-[11px] font-bold tracking-tight truncate max-w-full text-center">
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Smooth Progress line */}
            <div className="mt-2 h-1.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#fa507e] to-[#ec376d] transition-all duration-500 ease-out rounded-full shadow-sm"
                style={{ width: `${(kycStep / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* =========================================================================
              STEP 1: PERSONAL & LEGAL IDENTITY
             ========================================================================= */}
          {kycStep === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-4 pt-1 animate-in fade-in slide-in-from-right-3 duration-300">
              
              {/* ID Type Segment Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">পরিচয়পত্রের ধরণ *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'nid', label: 'NID কার্ড' },
                    { id: 'passport', label: 'পাসপোর্ট' },
                    { id: 'birth_cert', label: 'জন্ম নিবন্ধন' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIdType(item.id as any)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        idType === item.id
                          ? 'bg-[#fff0f5] border-[#ed347d] text-[#ed347d] shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">পূর্ণ নাম (পরিচয়পত্র অনুযায়ী) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="উদা: ডা. সানতো দেওয়ান"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 transition-all text-slate-800 bg-slate-50/40 focus:bg-white shadow-xs"
                  />
                </div>
              </div>

              {/* ID Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {idType === 'nid' ? 'জাতীয় পরিচয়পত্র (NID) নম্বর *' : idType === 'passport' ? 'পাসপোর্ট নম্বর *' : 'জন্ম নিবন্ধন নম্বর *'}
                </label>
                <input
                  type="text"
                  required
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="১০, ১৩ বা ১৭ ডিজিট নম্বর"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-mono font-bold focus:outline-none focus:border-[#ed347d] focus:ring-4 focus:ring-pink-100 transition-all text-slate-800 bg-slate-50/40 focus:bg-white shadow-xs"
                />
              </div>

              {/* Parents Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">পিতার নাম *</label>
                  <input
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="পিতার নাম"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d] bg-slate-50/40 focus:bg-white shadow-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">মাতার নাম *</label>
                  <input
                    type="text"
                    required
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    placeholder="মাতার নাম"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d] bg-slate-50/40 focus:bg-white shadow-xs"
                  />
                </div>
              </div>

              {/* DOB & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">জন্ম তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d] bg-slate-50/40 focus:bg-white shadow-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">লিঙ্গ *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d] bg-slate-50/40 focus:bg-white shadow-xs font-medium"
                  >
                    <option value="male">পুরুষ (Male)</option>
                    <option value="female">মহিলা (Female)</option>
                    <option value="other">অন্যান্য (Other)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white ph-btn-pink shadow-lg shadow-pink-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <span>পরবর্তী ধাপ (ঠিকানা ও যোগাযোগ)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* =========================================================================
              STEP 2: ADDRESS & EMERGENCY CONTACT
             ========================================================================= */}
          {kycStep === 2 && (
            <form onSubmit={handleStep2Next} className="space-y-4 pt-1 animate-in fade-in slide-in-from-right-3 duration-300">
              
              {/* Present Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">বর্তমান ঠিকানা (Present Address) *</label>
                <textarea
                  required
                  rows={2}
                  value={presentAddress}
                  onChange={(e) => {
                    setPresentAddress(e.target.value);
                    if (sameAddress) setPermanentAddress(e.target.value);
                  }}
                  placeholder="বাড়ি/রোড নম্বর, এলাকা, থানা ও জেলা"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] bg-slate-50/40 focus:bg-white shadow-xs resize-none"
                />
              </div>

              {/* Same address checkbox */}
              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sameAddress}
                  onChange={(e) => handleSameAddressToggle(e.target.checked)}
                  className="w-4 h-4 rounded text-[#ed347d] focus:ring-[#ed347d] border-slate-300"
                />
                <span>বর্তমান ঠিকানা ও স্থায়ী ঠিকানা একই</span>
              </label>

              {/* Permanent Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">স্থায়ী ঠিকানা (Permanent Address) *</label>
                <textarea
                  required
                  rows={2}
                  disabled={sameAddress}
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                  placeholder="গ্রাম/মহল্লা, ডাকঘর, উপজেলা ও জেলা"
                  className={`w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#ed347d] bg-slate-50/40 focus:bg-white shadow-xs resize-none ${
                    sameAddress ? 'opacity-60 bg-slate-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              {/* Emergency Contact */}
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#ed347d]" />
                  <span>জরুরি যোগাযোগ (অভিভাবক)</span>
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="অভিভাবকের নাম"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                  <input
                    type="tel"
                    required
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="মোবাইল নম্বর *"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-mono"
                  />
                  <select
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                  >
                    <option value="পিতা">পিতা</option>
                    <option value="মাতা">মাতা</option>
                    <option value="ভাই/বোন">ভাই/বোন</option>
                    <option value="স্ত্রী/স্বামী">স্ত্রী/স্বামী</option>
                    <option value="অভিভাবক">অভিভাবক</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setKycStep(1)}
                  className="w-1/3 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>পূর্ববর্তী</span>
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white ph-btn-pink shadow-lg shadow-pink-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>পরবর্তী (একাডেমিক ও পেআউট)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              STEP 3: ACADEMIC & PAYOUT DETAILS
             ========================================================================= */}
          {kycStep === 3 && (
            <form onSubmit={handleStep3Next} className="space-y-4 pt-1 animate-in fade-in slide-in-from-right-3 duration-300">
              
              {/* Institution & Degree */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">শিক্ষাপ্রতিষ্ঠান / বিশ্ববিদ্যালয় *</label>
                  <input
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="উদা: বুয়েট / ঢাকা বিশ্ববিদ্যালয়"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d] bg-slate-50/40 focus:bg-white shadow-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">অর্জিত ডিগ্রি *</label>
                  <input
                    type="text"
                    required
                    value={degreeName}
                    onChange={(e) => setDegreeName(e.target.value)}
                    placeholder="উদা: বি.এস.সি / এম.এস.সি"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d] bg-slate-50/40 focus:bg-white shadow-xs"
                  />
                </div>
              </div>

              {/* Department & Passing Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">বিভাগ / সাবজেক্ট *</label>
                  <input
                    type="text"
                    required
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    placeholder="উদা: পদার্থবিজ্ঞান"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:border-[#ed347d] bg-slate-50/40 focus:bg-white shadow-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">পাসের সন / ব্যাচ *</label>
                  <input
                    type="text"
                    required
                    value={passingYear}
                    onChange={(e) => setPassingYear(e.target.value)}
                    placeholder="উদা: ২০১৯ অথবা অধ্যয়নরত"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#ed347d] bg-slate-50/40 focus:bg-white shadow-xs"
                  />
                </div>
              </div>

              {/* Payout Method Segment Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">সম্মানী ও রয়্যালটি উত্তোলনের মাধ্যম *</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'bKash', label: 'বিকাশ' },
                    { id: 'Nagad', label: 'নগদ' },
                    { id: 'Rocket', label: 'রকেট' },
                    { id: 'Bank', label: 'ব্যাংক' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayoutMethod(m.id as any)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        payoutMethod === m.id
                          ? 'bg-[#fff0f5] border-[#ed347d] text-[#ed347d] shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payout Account Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {payoutMethod === 'Bank' ? 'ব্যাংক হিসাব নম্বর *' : `${payoutMethod} পার্সোনাল নম্বর *`}
                </label>
                <input
                  type="text"
                  required
                  value={payoutAccountNumber}
                  onChange={(e) => setPayoutAccountNumber(e.target.value)}
                  placeholder="01XXXXXXXXX অথবা ব্যাংক A/C নম্বর"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-mono font-bold focus:outline-none focus:border-[#ed347d] bg-slate-50/40 focus:bg-white shadow-xs"
                />
              </div>

              {payoutMethod === 'Bank' && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={payoutBankName}
                    onChange={(e) => setPayoutBankName(e.target.value)}
                    placeholder="ব্যাংকের নাম (উদা: ব্র্যাক ব্যাংক)"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                  <input
                    type="text"
                    required
                    value={payoutBranchName}
                    onChange={(e) => setPayoutBranchName(e.target.value)}
                    placeholder="শাখা (উদা: ধানমন্ডি শাখা)"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
              )}

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setKycStep(2)}
                  className="w-1/3 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>পূর্ববর্তী</span>
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white ph-btn-pink shadow-lg shadow-pink-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>পরবর্তী (ডকুমেন্টস আপলোড)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              STEP 4: DOCUMENTS UPLOAD & FINAL SUBMISSION
             ========================================================================= */}
          {kycStep === 4 && (
            <form onSubmit={handleSubmit} className="space-y-4 pt-1 animate-in fade-in slide-in-from-right-3 duration-300">
              
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 block">বাধ্যতামূলক ডকুমেন্টস প্রিভিউ (৪টি স্ক্যান কপি) *</span>
                <p className="text-[11px] text-slate-400">প্রতিটি ছবির উপর ক্লিক করে জুম করে বড় আকারে দেখতে পারেন।</p>
              </div>

              {/* 4 Real Document Upload Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'nid-front',
                    title: '১. NID সম্মুখ ভাগ *',
                    sub: 'জাতীয় পরিচয়পত্রের সামনের অংশ',
                    state: idFrontImage,
                    setter: setIdFrontImage,
                  },
                  {
                    id: 'nid-back',
                    title: '২. NID পেছনের ভাগ *',
                    sub: 'জাতীয় পরিচয়পত্রের পেছনের অংশ',
                    state: idBackImage,
                    setter: setIdBackImage,
                  },
                  {
                    id: 'academic-cert',
                    title: '৩. ডিগ্রি সনদপত্র *',
                    sub: 'সর্বশেষ শিক্ষাগত সনদ বা মার্কশিট',
                    state: academicCertificateImage,
                    setter: setAcademicCertificateImage,
                  },
                  {
                    id: 'selfie-id',
                    title: '৪. আইডিসহ লাইভ সেলফি *',
                    sub: 'হাতে NID কার্ড ধরে সুস্পষ্ট সেলফি ছবি',
                    state: selfieWithIdImage,
                    setter: setSelfieWithIdImage,
                  },
                ].map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      doc.state
                        ? 'border-emerald-200 bg-emerald-50/25'
                        : 'border-slate-200 bg-slate-50/60 hover:border-[#ed347d]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <div className="text-xs font-bold text-slate-800 truncate">{doc.title}</div>
                      {doc.state ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3 stroke-[3]" /> আপলোড সম্পন্ন
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                          আবশ্যক
                        </span>
                      )}
                    </div>

                    {doc.state ? (
                      <div className="space-y-2">
                        <div
                          onClick={() => setSelectedZoomDoc({ title: doc.title, url: doc.state })}
                          className="relative h-24 rounded-xl overflow-hidden border border-slate-200 bg-white group cursor-pointer shadow-xs"
                        >
                          <img src={doc.state} alt={doc.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold gap-1.5">
                            <Eye className="w-3.5 h-3.5" /> প্রিভিউ বড় করুন
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`upload-input-${doc.id}`}
                            className="flex-1 py-1.5 px-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all hover:bg-slate-50"
                          >
                            <UploadCloud className="w-3.5 h-3.5 text-[#ed347d]" />
                            <span>ছবি পরিবর্তন</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => doc.setter('')}
                            className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold cursor-pointer transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor={`upload-input-${doc.id}`}
                        className="h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#ed347d] bg-white hover:bg-pink-50/20 transition-all flex flex-col items-center justify-center cursor-pointer text-center px-3 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-pink-50 text-[#ed347d] flex items-center justify-center group-hover:scale-110 transition-transform mb-1">
                          <UploadCloud className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 group-hover:text-[#ed347d] transition-colors">
                          ডকুমেন্ট নির্বাচন করুন
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          JPG, PNG বা WebP (সর্বোচ্চ ৫ MB)
                        </span>
                      </label>
                    )}

                    <input
                      id={`upload-input-${doc.id}`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, doc.setter, doc.title);
                        }
                        // Reset input so re-selecting same file triggers onChange
                        e.target.value = '';
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Demo Video Link */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">ডেমো ক্লাস ভিডিও লিংক (ঐচ্ছিক)</label>
                <input
                  type="url"
                  value={demoVideoLink}
                  onChange={(e) => setDemoVideoLink(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/40 focus:bg-white"
                />
              </div>

              {/* Agreement checkbox */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-amber-950 leading-relaxed select-none">
                  <input
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-amber-300 text-[#ed347d] focus:ring-[#ed347d]"
                  />
                  <span>
                    আমি অঙ্গীকার করছি যে, অদম্য এডটেকে শিক্ষক হিসেবে প্রদত্ত সকল তথ্য ও দাখিলকৃত সনদপত্র সম্পূর্ণ সত্য, নির্ভুল ও বৈধ।
                  </span>
                </label>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setKycStep(3)}
                  className="w-1/3 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>পূর্ববর্তী</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white ph-btn-pink shadow-lg shadow-pink-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{submitting ? 'জমা হচ্ছে...' : 'সুপার অ্যাডমিনে জমা দিন'}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

      {/* Lightbox Zoom Modal */}
      {selectedZoomDoc && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedZoomDoc(null)}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-800">{selectedZoomDoc.title}</h4>
              <button 
                type="button" 
                onClick={() => setSelectedZoomDoc(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <img src={selectedZoomDoc.url} alt="" className="w-full max-h-[65vh] object-contain rounded-2xl border border-slate-100" />
          </div>
        </div>
      )}
    </div>
  );
}
