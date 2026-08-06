import React, { useState, useRef } from 'react';
import { X, ShieldCheck, Upload, UserCheck, AlertCircle, FileText, CheckCircle2, Trash2, Paperclip } from 'lucide-react';
import { UserRole, RegistrationRequest } from '../types';
import { LogoHeader } from './LogoHeader';
import { PasswordStrengthBar, checkPasswordRequirements } from './PasswordStrengthBar';
import { CaptchaBox } from './CaptchaBox';

const DEPARTMENT_OPTIONS = [
  'Select Department',
  'Crime Branch',
  'Cyber Crime Cell',
  'Law & Order',
  'Traffic Police',
  'Women Safety Cell',
  'Anti-Narcotics Cell',
  'Economic Offences Wing (EOW)',
  'Forensic Department',
  'Legal Department',
  'Administration',
  'Others',
];

const DESIGNATION_OPTIONS = [
  'Select Official Designation',
  'Host (Station Head)',
  'DSP (Deputy Superintendent of Police)',
  'Police Inspector (PI)',
  'Assistant Police Inspector (API)',
  'Police Sub-Inspector (PSI)',
  'Assistant Sub-Inspector (ASI)',
  'Head Constable',
  'Police Constable',
  'Advocate',
  'Forensic Expert',
  'Cyber Crime Officer',
  'Legal Advisor',
  'Administrative Officer',
  'Others',
];

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRegistration: (request: RegistrationRequest) => void;
  themeMode?: 'dark' | 'bright';
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onSubmitRegistration,
  themeMode = 'dark',
}) => {
  if (!isOpen) return null;

  // Active step in modal (1 to 6)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Form State
  // 1. Personal Info
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [bloodGroupType, setBloodGroupType] = useState<'A' | 'B' | 'AB' | 'O'>('O');
  const [bloodRhFactor, setBloodRhFactor] = useState<'+' | '-'>('+');

  // 2. Professional Info
  const [role, setRole] = useState<UserRole>('Police Officer');
  const [selectedDepartment, setSelectedDepartment] = useState('Select Department');
  const [customDepartment, setCustomDepartment] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [experience, setExperience] = useState('5 Years');
  const [selectedDesignation, setSelectedDesignation] = useState('Select Official Designation');
  const [customDesignation, setCustomDesignation] = useState('');

  // 3. Account Details
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 4. Document Upload
  const [idProofName, setIdProofName] = useState('');
  const [idProofSize, setIdProofSize] = useState('');
  const [idProofUrl, setIdProofUrl] = useState('');
  const [serviceIdName, setServiceIdName] = useState('');
  const [serviceIdSize, setServiceIdSize] = useState('');
  const [serviceIdUrl, setServiceIdUrl] = useState('');

  const idProofInputRef = useRef<HTMLInputElement>(null);
  const serviceIdInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleIdProofFile = (file?: File) => {
    if (file) {
      setIdProofName(file.name);
      setIdProofSize(formatFileSize(file.size));
      setErrorMessage('');

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setIdProofUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleServiceIdFile = (file?: File) => {
    if (file) {
      setServiceIdName(file.name);
      setServiceIdSize(formatFileSize(file.size));
      setErrorMessage('');

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setServiceIdUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearIdProof = () => {
    setIdProofName('');
    setIdProofSize('');
    setIdProofUrl('');
    if (idProofInputRef.current) {
      idProofInputRef.current.value = '';
    }
  };

  const clearServiceId = () => {
    setServiceIdName('');
    setServiceIdSize('');
    setServiceIdUrl('');
    if (serviceIdInputRef.current) {
      serviceIdInputRef.current.value = '';
    }
  };

  // 5. Captcha
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // 6. Terms
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Error message
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const reqs = checkPasswordRequirements(password);
  const isPasswordValid = reqs.hasMinLength && reqs.hasUppercase && reqs.hasNumber && reqs.hasSpecialChar;
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (let s = 1; s <= 6; s++) {
      if (!validateStep(s)) {
        setActiveStep(s);
        return;
      }
    }

    // Determine target reviewer role
    const assignedToRole: 'DSP' | 'Host' = (role === 'Host' || role === 'DSP') ? 'DSP' : 'Host';

    const cleanPhone = phone.replace(/\D/g, '');
    const finalDepartment = selectedDepartment === 'Others' ? customDepartment.trim() : selectedDepartment;
    const finalDesignation = selectedDesignation === 'Others' ? customDesignation.trim() : selectedDesignation;

    const newReq: RegistrationRequest = {
      id: `req-${Date.now()}`,
      fullName: fullName.trim(),
      phone: cleanPhone,
      email: email.trim(),
      dob,
      gender,
      address: address.trim(),
      bloodGroup: `${bloodGroupType}${bloodRhFactor}`,
      role,
      department: finalDepartment,
      badgeId: badgeId.trim(),
      experience,
      designation: finalDesignation,
      username: username.trim(),
      idProofName,
      idProofUrl,
      serviceIdName,
      serviceIdUrl,
      submittedAt: new Date().toLocaleString(),
      status: 'Pending',
      assignedToRole,
    };

    onSubmitRegistration(newReq);
    setIsSuccess(true);
  };

  const validateStep = (stepNum: number): boolean => {
    setErrorMessage('');

    if (stepNum === 1) {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your Full Name.');
        return false;
      }

      // Check phone number: must be exactly 10 digits
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        setErrorMessage(
          `Phone Number must be exactly 10 digits (e.g. 9876543210). Currently entered: ${cleanPhone.length} digits.`
        );
        return false;
      }

      // Check email: must contain @gmail.com
      const cleanEmail = email.toLowerCase().trim();
      if (!cleanEmail || !cleanEmail.includes('@gmail.com') || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(cleanEmail)) {
        setErrorMessage(
          'Official Email Address must be a valid email containing @gmail.com (e.g., officer.ramesh@gmail.com).'
        );
        return false;
      }

      if (!address.trim()) {
        setErrorMessage('Please enter your Residential Address.');
        return false;
      }
    }

    if (stepNum === 2) {
      if (!selectedDepartment || selectedDepartment === 'Select Department') {
        setErrorMessage('Please select a Department / Firm from the list.');
        return false;
      }
      if (selectedDepartment === 'Others' && !customDepartment.trim()) {
        setErrorMessage('Please enter your custom Department / Firm name.');
        return false;
      }
      if (!badgeId.trim()) {
        setErrorMessage('Please enter your Badge ID / Bar License No.');
        return false;
      }
      if (!selectedDesignation || selectedDesignation === 'Select Official Designation') {
        setErrorMessage('Please select an Official Designation from the list.');
        return false;
      }
      if (selectedDesignation === 'Others' && !customDesignation.trim()) {
        setErrorMessage('Please enter your custom Official Designation.');
        return false;
      }
    }

    if (stepNum === 3) {
      if (!username.trim()) {
        setErrorMessage('Username is required.');
        return false;
      }

      if (!isPasswordValid) {
        setErrorMessage('Password does not meet all 4 security requirements.');
        return false;
      }

      if (!passwordsMatch) {
        setErrorMessage('Passwords do not match.');
        return false;
      }
    }

    if (stepNum === 4) {
      if (!idProofName || !serviceIdName) {
        setErrorMessage('Please attach both Identity Proof and Service ID / Bar Council License documents.');
        return false;
      }
    }

    if (stepNum === 5) {
      if (!captchaVerified) {
        setErrorMessage('Please complete the CAPTCHA verification.');
        return false;
      }
    }

    if (stepNum === 6) {
      if (!agreedTerms) {
        setErrorMessage('You must accept the Official Terms & Security Undertaking.');
        return false;
      }
    }

    return true;
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep < activeStep) {
      setActiveStep(targetStep);
      setErrorMessage('');
    } else {
      if (validateStep(activeStep)) {
        setActiveStep(targetStep);
      }
    }
  };

  const handleNextClick = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(6, prev + 1));
    }
  };

  const steps = [
    { num: 1, title: 'Personal Info' },
    { num: 2, title: 'Professional Info' },
    { num: 3, title: 'Account Details' },
    { num: 4, title: 'Document Upload' },
    { num: 5, title: 'CAPTCHA' },
    { num: 6, title: 'Terms & Submit' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0a0b0d] text-slate-100 overflow-y-auto"
      style={
        themeMode === 'dark'
          ? {
              background: 'radial-gradient(circle at center, rgba(31, 41, 55, 0.5) 0%, rgba(10, 11, 13, 0.98) 100%)',
            }
          : {}
      }
    >
      {/* Background Atmosphere (Police Line & Yellow Caution Stripes FX - Same as Login Page) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        {/* Subtle Grid overlay */}
        <div
          className={`absolute inset-0 bg-[size:3rem_3rem] ${
            themeMode === 'bright'
              ? 'bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)]'
              : 'bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)]'
          }`}
        />

        {/* Red & Blue Pulsing Patrol Lights reflection (Dark Mode) */}
        {themeMode === 'dark' && (
          <>
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '1s' }}
            />
            <div className="absolute top-1/2 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
          </>
        )}

        {/* 1. Slanting Down Police Tape (Top Left -> Right) */}
        <div className="absolute top-[8%] -left-[10%] w-[130%] h-7 bg-[#fbbf24] text-slate-950 font-black text-[11px] tracking-widest uppercase flex items-center justify-around transform -rotate-6 shadow-xl border-y-2 border-black/80 opacity-85 z-0">
          <span className="whitespace-nowrap">★ POLICE LINE DO NOT CROSS ★</span>
          <span className="whitespace-nowrap hidden sm:inline">★ CRIME SCENE EVIDENCE ZONE ★</span>
          <span className="whitespace-nowrap">★ POLICE LINE DO NOT CROSS ★</span>
          <span className="whitespace-nowrap hidden md:inline">★ LAW ENFORCEMENT ONLY ★</span>
        </div>

        {/* 2. Slanting Up Police Tape (Bottom Left -> Top Right) */}
        <div className="absolute top-[28%] -left-[10%] w-[130%] h-7 bg-[#f59e0b] text-slate-950 font-black text-[11px] tracking-widest uppercase flex items-center justify-around transform rotate-[7deg] shadow-2xl border-y-2 border-black/80 opacity-80 z-0">
          <span className="whitespace-nowrap">★ CAUTION: HIGH SECURITY REGISTRATION ★</span>
          <span className="whitespace-nowrap">★ JUDICIAL INVESTIGATION TERMINAL ★</span>
          <span className="whitespace-nowrap hidden sm:inline">★ AUTHORIZED PERSONNEL ONLY ★</span>
        </div>

        {/* 3. Opposite Slanting Down Tape */}
        <div className="absolute bottom-[28%] -left-[10%] w-[130%] h-7 bg-[#fbbf24] text-slate-950 font-black text-[11px] tracking-widest uppercase flex items-center justify-around transform -rotate-[8deg] shadow-xl border-y-2 border-black/80 opacity-85 z-0">
          <span className="whitespace-nowrap">★ RESTRICTED DATA ACCESS ★</span>
          <span className="whitespace-nowrap hidden sm:inline">★ POLICE LINE DO NOT CROSS ★</span>
          <span className="whitespace-nowrap">★ CRIME JUSTICE SYSTEM ★</span>
        </div>

        {/* 4. Slanting Up Police Tape Near Bottom */}
        <div className="absolute bottom-[8%] -left-[10%] w-[130%] h-7 bg-[#eab308] text-slate-950 font-black text-[11px] tracking-widest uppercase flex items-center justify-around transform rotate-6 shadow-xl border-y-2 border-black/80 opacity-80 z-0">
          <span className="whitespace-nowrap">★ FORENSIC LOGS VERIFIED ★</span>
          <span className="whitespace-nowrap">★ POLICE LINE DO NOT CROSS ★</span>
          <span className="whitespace-nowrap hidden sm:inline">★ SECURE DATA ENCRYPTION ★</span>
        </div>
      </div>

      {/* Enlarged Personnel Registration Block */}
      <div
        className={`relative z-10 w-full max-w-4xl sm:max-w-5xl my-auto rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-xl transition-all ${
          themeMode === 'bright'
            ? 'bg-white text-slate-900 border border-slate-300 shadow-xl'
            : 'bg-[#0f172a]/95 text-slate-100 border-yellow-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]'
        }`}
      >
        {/* Header Ribbon */}
        <div
          className={`flex items-center justify-between px-3.5 sm:px-8 py-3.5 border-b gap-2 ${
            themeMode === 'bright'
              ? 'bg-gradient-to-r from-sky-100 via-blue-50 to-white border-slate-200 text-slate-900 shadow-sm'
              : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-yellow-500/30 text-white'
          }`}
        >
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="shrink-0">
              <LogoHeader size="sm" layout="horizontal" showSubtitle={false} themeMode={themeMode} />
            </div>
            <div className="min-w-0">
              <h3
                className={`text-sm sm:text-xl font-black tracking-wide truncate ${
                  themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                }`}
              >
                New Personnel Registration
              </h3>
              <p
                className={`text-[10px] sm:text-xs truncate font-bold ${
                  themeMode === 'bright' ? 'text-slate-600' : 'text-slate-300'
                }`}
              >
                Official Crime Justice Verification & Enrolment Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 sm:p-2 rounded-full transition-colors shrink-0 ${
              themeMode === 'bright'
                ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-800'
                : 'hover:bg-slate-700/70 text-slate-300 hover:text-white'
            }`}
            title="Close Registration"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Success Confirmation State */}
        {isSuccess ? (
          <div className="p-10 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-600 mx-auto">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className={`text-3xl font-black ${themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'}`}>
              Registration Request Submitted!
            </h2>
            <p className={`max-w-lg mx-auto text-base font-medium leading-relaxed ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>
              Your request for role <strong className={themeMode === 'bright' ? 'text-blue-900 font-black' : 'text-yellow-400'}>{role}</strong> has been routed to the{' '}
              <strong className={themeMode === 'bright' ? 'text-blue-950 font-extrabold' : 'text-amber-300'}>
                {role === 'Host' || role === 'DSP' ? 'DSP Headquarters' : 'Host Inspector'}
              </strong>{' '}
              for identity & credentials verification.
            </p>
            <div className={`p-5 rounded-xl border text-sm space-y-1.5 max-w-md mx-auto ${
              themeMode === 'bright'
                ? 'bg-slate-50 border-slate-300 text-slate-900'
                : 'bg-slate-900/80 border-slate-700/80 text-slate-200'
            }`}>
              <p>📍 Request Reference ID: <span className="font-mono text-blue-700 font-black">{`REQ-${Date.now().toString().slice(-6)}`}</span></p>
              <p className={`text-xs ${themeMode === 'bright' ? 'text-slate-600 font-bold' : 'text-slate-400'}`}>
                🔔 The reviewer will inspect your credentials in their Dashboard Notification Bell dropdown.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-black rounded-xl shadow-lg transition-all text-sm tracking-wide"
            >
              Return to Login Portal
            </button>
          </div>
        ) : (
          <div>
            {/* Step Indicators Bar */}
            <div
              className={`px-6 sm:px-8 py-3.5 border-b overflow-x-auto ${
                themeMode === 'bright'
                  ? 'bg-sky-50/60 border-slate-200'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between min-w-[650px] gap-2">
                {steps.map((step) => {
                  const isActive = activeStep === step.num;
                  const isCompleted = activeStep > step.num;

                  return (
                    <button
                      key={step.num}
                      type="button"
                      onClick={() => handleStepClick(step.num)}
                      className="flex items-center space-x-2 focus:outline-none group cursor-pointer"
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                          isCompleted
                            ? 'bg-emerald-600 text-white shadow-md'
                            : isActive
                            ? themeMode === 'bright'
                              ? 'bg-blue-600 text-white ring-2 ring-blue-400/50 shadow-md font-black'
                              : 'bg-yellow-500 text-black ring-2 ring-yellow-400/60 shadow-md shadow-yellow-500/30'
                            : themeMode === 'bright'
                            ? 'bg-slate-200 text-slate-700 font-extrabold group-hover:bg-slate-300'
                            : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                        }`}
                      >
                        {step.num}
                      </span>
                      <span
                        className={`text-xs font-extrabold whitespace-nowrap ${
                          isActive
                            ? themeMode === 'bright' ? 'text-blue-950 font-black' : 'text-yellow-400 font-bold'
                            : isCompleted
                            ? 'text-emerald-700 font-bold'
                            : themeMode === 'bright'
                            ? 'text-slate-600 group-hover:text-slate-900'
                            : 'text-slate-400 group-hover:text-slate-300'
                        }`}
                      >
                        {step.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mx-6 sm:mx-8 mt-5 p-3.5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-600 text-xs sm:text-sm font-bold flex items-center shadow-lg">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Steps */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[72vh] overflow-y-auto">
              {/* STEP 1: Personal Information */}
              {activeStep === 1 && (
                <div className="space-y-5">
                  <h4 className={`text-lg font-black flex items-center border-b pb-2.5 ${
                    themeMode === 'bright' ? 'text-blue-950 border-slate-200' : 'text-yellow-400 border-slate-800'
                  }`}>
                    <UserCheck className={`w-5.5 h-5.5 mr-2 ${themeMode === 'bright' ? 'text-blue-600' : ''}`} /> 1. Personal Information
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>Full Name *</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Inspector Ramesh Kumar"
                        className={`w-full px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                          themeMode === 'bright'
                            ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400'
                            : 'bg-slate-900/90 text-slate-100 border-blue-500 focus:border-blue-400 placeholder:text-slate-500'
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                        Phone Number (Exactly 10 Digits) *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="e.g. 9876543210"
                        maxLength={10}
                        className={`w-full px-4 py-3 rounded-xl text-base font-mono font-bold transition-all border focus:outline-none ${
                          themeMode === 'bright'
                            ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400'
                            : 'bg-slate-900/90 text-slate-100 border-blue-500 focus:border-blue-400 placeholder:text-slate-500'
                        }`}
                        required
                      />
                      <p className={`text-xs font-bold mt-1.5 flex items-center justify-between ${themeMode === 'bright' ? 'text-slate-600' : 'text-amber-300'}`}>
                        <span>• Must contain exactly 10 numerical digits.</span>
                        <span className={`font-mono font-black text-sm ${themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'}`}>{phone.replace(/\D/g, '').length}/10</span>
                      </p>
                    </div>

                    <div>
                      <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
                        Official Email Address (Must contain @gmail.com) *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. officer.ramesh@gmail.com"
                        className={`w-full px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                          themeMode === 'bright'
                            ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400'
                            : 'bg-slate-900/90 text-slate-100 border-blue-500 focus:border-blue-400 placeholder:text-slate-500'
                        }`}
                        required
                      />
                      <p className={`text-xs font-bold mt-1.5 ${themeMode === 'bright' ? 'text-slate-600' : 'text-amber-300'}`}>
                        • Must be a valid email ending with or containing @gmail.com
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>Date of Birth</label>
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className={`w-full px-3.5 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                            themeMode === 'bright'
                              ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'
                              : 'bg-slate-900/90 text-slate-100 border-blue-500'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>Gender</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className={`w-full px-3.5 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                            themeMode === 'bright'
                              ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'
                              : 'bg-slate-900/90 text-slate-100 border-blue-500'
                          }`}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Residential Address & Blood Group side-by-side */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>Residential Address *</label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3.5}
                        placeholder="Enter full official residential address"
                        className={`w-full px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                          themeMode === 'bright'
                            ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400'
                            : 'bg-slate-900/90 text-slate-100 border-blue-500 focus:border-blue-400 placeholder:text-slate-500'
                        }`}
                        required
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>Blood Group *</label>
                      <div className={`p-3 rounded-xl border space-y-2.5 ${
                        themeMode === 'bright'
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'border-blue-500 bg-slate-900/90'
                      }`}>
                        <div>
                          <span className={`block text-xs font-extrabold mb-1 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-300'}`}>Select Type</span>
                          <div className="grid grid-cols-4 gap-1">
                            {(['A', 'B', 'AB', 'O'] as const).map((g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => setBloodGroupType(g)}
                                className={`py-1.5 text-xs font-extrabold rounded-lg border transition-all ${
                                  bloodGroupType === g
                                    ? themeMode === 'bright'
                                      ? 'bg-blue-600 text-white border-blue-600 font-bold'
                                      : 'bg-amber-500 text-slate-950 border-amber-600 font-black'
                                    : themeMode === 'bright'
                                    ? 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
                                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                                }`}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className={`block text-xs font-extrabold mb-1 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-300'}`}>Rh Factor (+ / -)</span>
                          <div className="grid grid-cols-2 gap-2">
                            {(['+', '-'] as const).map((rh) => (
                              <button
                                key={rh}
                                type="button"
                                onClick={() => setBloodRhFactor(rh)}
                                className={`py-1.5 text-sm font-black rounded-lg border transition-all ${
                                  bloodRhFactor === rh
                                    ? 'bg-red-600 text-white border-red-700'
                                    : themeMode === 'bright'
                                    ? 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
                                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                                }`}
                              >
                                {rh}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className={`text-center pt-1 border-t flex items-center justify-between px-1 ${
                          themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800'
                        }`}>
                          <span className={`text-xs font-bold ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-400'}`}>Selected:</span>
                          <span className={`font-mono font-black text-sm ${themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'}`}>{bloodGroupType}{bloodRhFactor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Professional Information */}
              {activeStep === 2 && (
                <div className="space-y-5">
                  <h4 className={`text-lg font-black flex items-center border-b pb-2.5 ${
                    themeMode === 'bright' ? 'text-blue-950 border-slate-200' : 'text-yellow-400 border-slate-800'
                  }`}>
                    <ShieldCheck className={`w-5.5 h-5.5 mr-2 ${themeMode === 'bright' ? 'text-blue-600' : ''}`} /> 2. Professional Information
                  </h4>

                  <div>
                    <label className={`block text-sm font-extrabold mb-2.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>Select Target Role *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                      {(['DSP', 'Host', 'Police Officer', 'Advocate'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`p-4 rounded-xl border text-center transition-all ${
                            role === r
                              ? themeMode === 'bright'
                                ? 'bg-blue-50 border-2 border-blue-600 text-blue-950 font-black ring-2 ring-blue-500/30 shadow-sm'
                                : 'bg-yellow-500/20 border-yellow-400 text-yellow-300 font-black ring-2 ring-yellow-400/60 shadow-md'
                              : themeMode === 'bright'
                              ? 'bg-white border border-slate-300 text-slate-900 font-bold hover:bg-slate-50'
                              : 'bg-slate-900/80 border-blue-500 text-slate-300 hover:border-blue-400'
                          }`}
                        >
                          <p className="text-base font-extrabold">{r}</p>
                          <p className={`text-xs mt-1 font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
                            {r === 'DSP' || r === 'Host' ? 'Approver: DSP' : 'Approver: Host'}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>Department / Firm *</label>
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                          themeMode === 'bright'
                            ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'
                            : 'bg-slate-900/90 text-slate-100 border-blue-500'
                        }`}
                      >
                        {DEPARTMENT_OPTIONS.map((dept) => (
                          <option key={dept} value={dept} disabled={dept === 'Select Department'}>
                            {dept}
                          </option>
                        ))}
                      </select>

                      {selectedDepartment === 'Others' && (
                        <input
                          type="text"
                          value={customDepartment}
                          onChange={(e) => setCustomDepartment(e.target.value)}
                          placeholder="Type your Department / Firm name"
                          className={`w-full mt-2.5 px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                            themeMode === 'bright'
                              ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500 placeholder:text-slate-400'
                              : 'bg-slate-900/90 text-slate-100 border-blue-500 placeholder:text-slate-500'
                          }`}
                          required
                        />
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>Badge ID / Bar License No. *</label>
                      <input
                        type="text"
                        value={badgeId}
                        onChange={(e) => setBadgeId(e.target.value)}
                        placeholder="e.g. INS-8812 or BAR-MH-4421"
                        className={`w-full px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                          themeMode === 'bright'
                            ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500 placeholder:text-slate-400'
                            : 'bg-slate-900/90 text-slate-100 border-blue-500 placeholder:text-slate-500'
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>Years of Experience</label>
                      <select
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                          themeMode === 'bright'
                            ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'
                            : 'bg-slate-900/90 text-slate-100 border-blue-500'
                        }`}
                      >
                        <option value="1-3 Years">1 - 3 Years</option>
                        <option value="5 Years">5 Years</option>
                        <option value="10+ Years">10+ Years</option>
                        <option value="15+ Years">15+ Years (Senior)</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>Official Designation *</label>
                      <select
                        value={selectedDesignation}
                        onChange={(e) => setSelectedDesignation(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                          themeMode === 'bright'
                            ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'
                            : 'bg-slate-900/90 text-slate-100 border-blue-500'
                        }`}
                      >
                        {DESIGNATION_OPTIONS.map((desig) => (
                          <option key={desig} value={desig} disabled={desig === 'Select Official Designation'}>
                            {desig}
                          </option>
                        ))}
                      </select>

                      {selectedDesignation === 'Others' && (
                        <input
                          type="text"
                          value={customDesignation}
                          onChange={(e) => setCustomDesignation(e.target.value)}
                          placeholder="Type your Official Designation"
                          className={`w-full mt-2.5 px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                            themeMode === 'bright'
                              ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500 placeholder:text-slate-400'
                              : 'bg-slate-900/90 text-slate-100 border-blue-500 placeholder:text-slate-500'
                          }`}
                          required
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Account Details & Password Strength */}
              {activeStep === 3 && (
                <div className="space-y-5">
                  <h4 className={`text-lg font-black flex items-center border-b pb-2.5 ${
                    themeMode === 'bright' ? 'text-blue-950 border-slate-200' : 'text-yellow-400 border-slate-800'
                  }`}>
                    <FileText className={`w-5.5 h-5.5 mr-2 ${themeMode === 'bright' ? 'text-blue-600' : ''}`} /> 3. Account Details
                  </h4>

                  <div>
                    <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>Choose Username *</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                      placeholder="e.g. officer_ramesh"
                      className={`w-full px-4 py-3 rounded-xl text-base font-mono font-bold transition-all border focus:outline-none ${
                        themeMode === 'bright'
                          ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500 placeholder:text-slate-400'
                          : 'bg-slate-900/90 text-slate-100 border-blue-500 placeholder:text-slate-500'
                      }`}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>Set Password *</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className={`w-full px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                          themeMode === 'bright'
                            ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'
                            : 'bg-slate-900/90 text-slate-100 border-blue-500'
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-extrabold mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>Confirm Password *</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className={`w-full px-4 py-3 rounded-xl text-base font-bold transition-all border focus:outline-none ${
                          themeMode === 'bright'
                            ? 'bg-white text-slate-900 border border-slate-300 focus:border-blue-500'
                            : 'bg-slate-900/90 text-slate-100 border-blue-500'
                        } ${
                          confirmPassword && !passwordsMatch ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      {confirmPassword && !passwordsMatch && (
                        <p className="text-xs text-red-600 font-bold mt-1.5">Passwords do not match!</p>
                      )}
                    </div>
                  </div>

                  {/* Password Strength Bar & Requirements Checklist */}
                  <div className={`p-4 rounded-xl border ${
                    themeMode === 'bright'
                      ? 'bg-slate-50 border-slate-300'
                      : 'bg-slate-900/90 border border-blue-500'
                  }`}>
                    <PasswordStrengthBar password={password} themeMode={themeMode} />
                  </div>
                </div>
              )}

              {/* STEP 4: Document Upload */}
              {activeStep === 4 && (
                <div className="space-y-5">
                  <h4 className={`text-lg font-black flex items-center border-b pb-2.5 ${
                    themeMode === 'bright' ? 'text-blue-950 border-slate-200' : 'text-yellow-400 border-slate-800'
                  }`}>
                    <Upload className={`w-5.5 h-5.5 mr-2 ${themeMode === 'bright' ? 'text-blue-600' : ''}`} /> 4. Official Document Upload
                  </h4>

                  <p className={`text-xs font-bold ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Please attach or drop your official documents (PDF, JPG, PNG, DOCX up to 10MB) directly from your device.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Identity Proof */}
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        handleIdProofFile(file);
                      }}
                      className={`p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center space-y-3 transition-colors ${
                        themeMode === 'bright'
                          ? 'bg-slate-50 border-slate-300 hover:border-blue-400 text-slate-900'
                          : 'bg-slate-900/80 border-blue-500 hover:border-blue-400 text-slate-100'
                      }`}
                    >
                      <input
                        type="file"
                        ref={idProofInputRef}
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        className="hidden"
                        onChange={(e) => handleIdProofFile(e.target.files?.[0])}
                      />
                      <FileText className={`w-10 h-10 ${themeMode === 'bright' ? 'text-blue-600' : 'text-yellow-400'}`} />
                      <div>
                        <p className={`text-sm font-extrabold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>1. Identity Proof (Aadhaar/Passport/DL)</p>
                        <p className={`text-xs mt-0.5 font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>Drag & drop or select file from device</p>
                      </div>

                      {idProofName ? (
                        <div className="w-full space-y-2">
                          <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-700 flex items-center justify-between text-left font-bold">
                            <div className="truncate mr-2">
                              <p className="font-mono font-bold truncate">✓ {idProofName}</p>
                              {idProofSize && <p className="text-[10px] text-emerald-800">{idProofSize}</p>}
                            </div>
                            <button
                              type="button"
                              onClick={clearIdProof}
                              className="p-1 text-slate-500 hover:text-red-600 transition-colors shrink-0"
                              title="Remove document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => idProofInputRef.current?.click()}
                            className={`text-xs font-bold hover:underline ${themeMode === 'bright' ? 'text-blue-700' : 'text-amber-600'}`}
                          >
                            Change File
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => idProofInputRef.current?.click()}
                          className={`px-4 py-2.5 text-sm font-extrabold rounded-xl transition-all flex items-center space-x-2 ${
                            themeMode === 'bright'
                              ? 'bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-300'
                              : 'bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-blue-500'
                          }`}
                        >
                          <Paperclip className="w-4 h-4" />
                          <span>Choose / Upload ID Proof</span>
                        </button>
                      )}
                    </div>

                    {/* Service ID / License */}
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        handleServiceIdFile(file);
                      }}
                      className={`p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center space-y-3 transition-colors ${
                        themeMode === 'bright'
                          ? 'bg-slate-50 border-slate-300 hover:border-blue-400 text-slate-900'
                          : 'bg-slate-900/80 border-blue-500 hover:border-blue-400 text-slate-100'
                      }`}
                    >
                      <input
                        type="file"
                        ref={serviceIdInputRef}
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        className="hidden"
                        onChange={(e) => handleServiceIdFile(e.target.files?.[0])}
                      />
                      <ShieldCheck className={`w-10 h-10 ${themeMode === 'bright' ? 'text-blue-600' : 'text-amber-400'}`} />
                      <div>
                        <p className={`text-sm font-extrabold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>2. Service ID / Bar Council License</p>
                        <p className={`text-xs mt-0.5 font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>Drag & drop or select file from device</p>
                      </div>

                      {serviceIdName ? (
                        <div className="w-full space-y-2">
                          <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-700 flex items-center justify-between text-left font-bold">
                            <div className="truncate mr-2">
                              <p className="font-mono font-bold truncate">✓ {serviceIdName}</p>
                              {serviceIdSize && <p className="text-[10px] text-emerald-800">{serviceIdSize}</p>}
                            </div>
                            <button
                              type="button"
                              onClick={clearServiceId}
                              className="p-1 text-slate-500 hover:text-red-600 transition-colors shrink-0"
                              title="Remove document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => serviceIdInputRef.current?.click()}
                            className={`text-xs font-bold hover:underline ${themeMode === 'bright' ? 'text-blue-700' : 'text-amber-600'}`}
                          >
                            Change File
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => serviceIdInputRef.current?.click()}
                          className={`px-4 py-2.5 text-sm font-extrabold rounded-xl transition-all flex items-center space-x-2 ${
                            themeMode === 'bright'
                              ? 'bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-300'
                              : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-blue-500'
                          }`}
                        >
                          <Paperclip className="w-4 h-4" />
                          <span>Choose / Upload Service ID</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: CAPTCHA */}
              {activeStep === 5 && (
                <div className="space-y-5">
                  <h4 className={`text-lg font-black flex items-center border-b pb-2.5 ${
                    themeMode === 'bright' ? 'text-blue-950 border-slate-200' : 'text-yellow-400 border-slate-800'
                  }`}>
                    <ShieldCheck className={`w-5.5 h-5.5 mr-2 ${themeMode === 'bright' ? 'text-blue-600' : ''}`} /> 5. Security CAPTCHA Verification
                  </h4>

                  <CaptchaBox onVerify={setCaptchaVerified} themeMode={themeMode} />
                </div>
              )}

              {/* STEP 6: Terms & Submit */}
              {activeStep === 6 && (
                <div className="space-y-5">
                  <h4 className={`text-lg font-black flex items-center border-b pb-2.5 ${
                    themeMode === 'bright' ? 'text-blue-950 border-slate-200' : 'text-yellow-400 border-slate-800'
                  }`}>
                    <FileText className={`w-5.5 h-5.5 mr-2 ${themeMode === 'bright' ? 'text-blue-600' : ''}`} /> 6. Terms, Conditions & Final Submission
                  </h4>

                  <div className={`p-4 rounded-xl border text-sm font-medium space-y-2.5 max-h-40 overflow-y-auto leading-relaxed ${
                    themeMode === 'bright'
                      ? 'bg-slate-50 border border-slate-300 text-slate-900'
                      : 'bg-slate-900/90 border border-blue-500 text-slate-200'
                  }`}>
                    <p className={`font-black ${themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'}`}>Official Portal Oath & Privacy Covenant:</p>
                    <p>1. I solemnly affirm that all credentials, service IDs, and personal records provided are authentic and issued by competent state/judicial authorities.</p>
                    <p>2. Unauthorized disclosure of classified case files or suspect profiles is strictly prohibited under the Official Secrets Act and Cyber Security Regulations.</p>
                    <p>3. I understand that my registration is pending verification by the assigned {role === 'Host' || role === 'DSP' ? 'DSP Supervisor' : 'Host Inspector'}.</p>
                  </div>

                  <label className="flex items-center space-x-3 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="w-5 h-5 accent-blue-600 rounded border border-slate-300"
                    />
                    <span className={`text-sm font-extrabold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>
                      I accept the Official Terms & Security Undertaking.
                    </span>
                  </label>
                </div>
              )}

              {/* Footer Step Controls */}
              <div className={`flex items-center justify-between pt-5 border-t ${
                themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800'
              }`}>
                {activeStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStep((prev) => prev - 1)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-extrabold transition-colors ${
                      themeMode === 'bright'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    Back
                  </button>
                ) : <div />}

                {activeStep < 6 ? (
                  <button
                    type="button"
                    onClick={handleNextClick}
                    className={`px-7 py-3 rounded-xl text-sm sm:text-base font-black transition-all shadow-lg ${
                      themeMode === 'bright'
                        ? 'bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white shadow-blue-500/20'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                    }`}
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    className={`px-7 py-3 font-black rounded-xl text-sm sm:text-base shadow-xl transition-all flex items-center space-x-2 ${
                      themeMode === 'bright'
                        ? 'bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white shadow-blue-500/30'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/30'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>Submit Registration</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
