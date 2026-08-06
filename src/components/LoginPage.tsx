import React, { useState } from 'react';
import { UserRole, User, RegistrationRequest } from '../types';
import { LogoHeader } from './LogoHeader';
import { PasswordStrengthBar, checkPasswordRequirements } from './PasswordStrengthBar';
import { CaptchaBox } from './CaptchaBox';
import { Shield, KeyRound, LogIn, UserPlus, Sun, Moon, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onOpenRegistration: () => void;
  themeMode: 'dark' | 'bright';
  onToggleTheme: () => void;
  existingUsers: User[];
  pendingRequests?: RegistrationRequest[];
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onOpenRegistration,
  themeMode,
  onToggleTheme,
  existingUsers,
  pendingRequests = [],
}) => {
  // Active selected role block ('DSP' | 'Host' | 'Police Officer' | 'Advocate')
  const [selectedRole, setSelectedRole] = useState<UserRole>('Police Officer');

  // Login Form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Auto-fill demo credentials when clicking a role block for convenient testing
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setLoginError('');
    const demoUser = existingUsers.find((u) => u.role === role);
    if (demoUser) {
      setUsername(demoUser.username);
      setPassword('Justice#2026'); // Matches all 4 requirements
    } else {
      setUsername('');
      setPassword('');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!username.trim()) {
      setLoginError('Please enter your username.');
      return;
    }

    if (!password) {
      setLoginError('Please enter your password.');
      return;
    }

    const reqs = checkPasswordRequirements(password);
    const isPassValid = reqs.hasMinLength && reqs.hasUppercase && reqs.hasNumber && reqs.hasSpecialChar;

    if (!isPassValid) {
      setLoginError('Password does not meet all security criteria (8+ chars, Uppercase, Number, Special char).');
      return;
    }

    if (!captchaVerified) {
      setLoginError('Security CAPTCHA verification required. Please enter the correct text.');
      return;
    }

    // 1. Search in existing registered/approved users list by username
    const trimmedUsername = username.toLowerCase().trim();
    const matchedUser = existingUsers.find(
      (u) => u.username.toLowerCase() === trimmedUsername
    );

    if (matchedUser) {
      if (matchedUser.role !== selectedRole) {
        setLoginError(`Role Mismatch: Account '${username}' is registered as '${matchedUser.role}'. Please select '${matchedUser.role}' above.`);
        return;
      }

      if (matchedUser.status === 'Pending') {
        setLoginError('Access Denied: Your registration is currently Pending approval by Host or DSP.');
        return;
      }

      if (matchedUser.status === 'Rejected') {
        setLoginError('Access Denied: Your registration application was Rejected by Host/DSP.');
        return;
      }

      // Approved user -> proceed to dashboard!
      onLoginSuccess(matchedUser);
      return;
    }

    // 2. If not in active users list, check if there is an unapproved request in pendingRequests
    const matchedRequest = pendingRequests.find(
      (req) => req.username.toLowerCase() === trimmedUsername
    );

    if (matchedRequest) {
      if (matchedRequest.status === 'Pending') {
        setLoginError(
          `Approval Pending: Account '${username}' was submitted for registration but is currently awaiting approval from ${matchedRequest.assignedToRole}. You cannot log in until approved.`
        );
        return;
      }

      if (matchedRequest.status === 'Rejected') {
        setLoginError(
          `Registration Rejected: Account '${username}' application was rejected by ${matchedRequest.assignedToRole}.`
        );
        return;
      }
    }

    // 3. User is not registered or approved in the system
    setLoginError(
      `Account Not Registered: Username '${username}' is not registered or approved. Only personnel approved by DSP or Host can log in. Please click 'New Personnel Registration' to apply.`
    );
  };

  const roles: { role: UserRole; label: string; sub: string; icon: string }[] = [
    { role: 'DSP', label: 'DSP', sub: 'Dept Head', icon: '⭐' },
    { role: 'Host', label: 'Host', sub: 'Main Police Admin', icon: '🛡️' },
    { role: 'Police Officer', label: 'Police Officer', sub: 'Field Inspector', icon: '👮' },
    { role: 'Advocate', label: 'Advocate', sub: 'Legal Defense', icon: '⚖️' },
  ];

  return (
    <div
      className={`relative min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-300 overflow-x-hidden font-sans ${
        themeMode === 'bright'
          ? 'bg-gradient-to-br from-slate-100 via-amber-50/50 to-slate-200 text-slate-900'
          : 'bg-[#0a0b0d] text-slate-100'
      }`}
      style={
        themeMode === 'dark'
          ? {
              background: 'radial-gradient(circle at center, rgba(31, 41, 55, 0.4) 0%, rgba(10, 11, 13, 1) 100%)',
            }
          : {}
      }
    >
      {/* Background Atmosphere (Police Line & Yellow Caution Stripes FX) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        {/* Grid overlay ONLY in Dark Mode (Removed in Light Mode per user directive) */}
        {themeMode === 'dark' && (
          <div className="absolute inset-0 bg-[size:3rem_3rem] bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)]" />
        )}

        {/* Red & Blue Pulsing Patrol Lights reflection (Dark Mode) */}
        {themeMode === 'dark' && (
          <>
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/15 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
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

        {/* 2. Slanting Up Police Tape (Bottom Left -> Top Right Crossing Behind Card) */}
        <div className="absolute top-[28%] -left-[10%] w-[130%] h-7 bg-[#f59e0b] text-slate-950 font-black text-[11px] tracking-widest uppercase flex items-center justify-around transform rotate-[7deg] shadow-2xl border-y-2 border-black/80 opacity-80 z-0">
          <span className="whitespace-nowrap">★ CAUTION: HIGH SECURITY AREA ★</span>
          <span className="whitespace-nowrap">★ JUDICIAL INVESTIGATION TERMINAL ★</span>
          <span className="whitespace-nowrap hidden sm:inline">★ AUTHORIZED PERSONNEL ONLY ★</span>
        </div>

        {/* 3. Opposite Slanting Down Tape (Mid-Right -> Bottom Left) */}
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

      {/* Top Header Controls: Theme Toggle Switch */}
      <div className="absolute top-4 right-4 sm:right-8 z-40">
        <button
          onClick={onToggleTheme}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md transition-all ${
            themeMode === 'bright'
              ? 'bg-white/90 border-2 border-slate-300 text-slate-900 font-bold hover:bg-slate-100 shadow-sm'
              : 'bg-[#111827] border-[#374151] text-[#9ca3af] hover:text-white hover:border-[#4b5563]'
          }`}
          title="Toggle Dark / Bright Mode"
        >
          {themeMode === 'bright' ? (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span>DARK MODE</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-[#fbbf24]" />
              <span>BRIGHT MODE</span>
            </>
          )}
        </button>
      </div>

      {/* Main Login Card Container */}
      <div className="relative z-10 w-full max-w-[480px] sm:max-w-lg md:max-w-xl my-4 sm:my-6 px-2">
        {/* Logo & Header */}
        <div className="mb-4 sm:mb-6">
          <LogoHeader size="lg" themeMode={themeMode} />
        </div>

        {/* Login Card */}
        <div
          className={`p-5 sm:p-7 md:p-8 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all ${
            themeMode === 'bright'
              ? 'bg-white/95 border-2 border-slate-300 shadow-xl text-slate-900'
              : 'bg-[#111827]/90 border-blue-900/50 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] text-slate-100'
          }`}
        >
          {/* Card Title */}
          <div className="text-center mb-5 sm:mb-6">
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight flex items-center justify-center space-x-2 ${
              themeMode === 'bright' ? 'text-slate-900' : 'text-white'
            }`}>
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
              <span>Login</span>
            </h2>
            <p className={`text-xs sm:text-sm mt-1 font-semibold ${themeMode === 'bright' ? 'text-slate-700' : 'text-[#9ca3af]'}`}>
              Secure Judicial Information System
            </p>
          </div>

          {/* 4 Role Boxes: 'DSP', 'Host', 'Police Officer', 'Advocate' */}
          <div className="mb-5 sm:mb-6">
            <label className={`block text-xs font-extrabold uppercase tracking-wider mb-2 ${themeMode === 'bright' ? 'text-slate-900' : 'text-[#9ca3af]'}`}>
              Select Officer Role:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              {roles.map((r) => {
                const isSelected = selectedRole === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleRoleSelect(r.role)}
                    className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all duration-200 flex flex-col items-center justify-center space-y-1 focus:outline-none min-w-0 ${
                      isSelected
                        ? themeMode === 'bright'
                          ? 'bg-amber-100 border-2 border-amber-500 text-amber-950 font-extrabold ring-2 ring-amber-500/40 shadow-sm scale-[1.02]'
                          : 'bg-[#fbbf24]/10 border-[#fbbf24] text-[#fbbf24] font-bold ring-1 ring-[#fbbf24]/50 shadow-md scale-[1.02]'
                        : themeMode === 'bright'
                        ? 'bg-slate-100 border border-slate-300 text-slate-800 font-bold hover:bg-slate-200'
                        : 'bg-[#1f2937] border-blue-900/60 text-slate-300 hover:border-blue-700 hover:bg-[#253248]'
                    }`}
                  >
                    <span className="text-lg sm:text-xl">{r.icon}</span>
                    <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-tight leading-tight truncate max-w-full px-0.5">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Error Message */}
            {loginError && (
              <div className="p-3 rounded-md bg-red-500/15 border border-red-500/40 text-red-600 text-xs font-bold flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Username Input */}
            <div>
              <label className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-[#9ca3af]'}`}>
                Agency Identifier / Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your ID"
                className={`w-full px-3.5 py-2.5 rounded-md text-sm font-bold focus:outline-none transition-all ${
                  themeMode === 'bright'
                    ? 'bg-white border-2 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                    : 'bg-[#0f172a] border border-[#374151] text-white placeholder-slate-500'
                }`}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className={`block text-xs font-extrabold uppercase tracking-wider mb-1.5 ${themeMode === 'bright' ? 'text-slate-900' : 'text-[#9ca3af]'}`}>
                Security Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter security password"
                className={`w-full px-3.5 py-2.5 rounded-md text-sm font-bold focus:outline-none transition-all ${
                  themeMode === 'bright'
                    ? 'bg-white border-2 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                    : 'bg-[#0f172a] border border-[#374151] text-white placeholder-slate-500'
                }`}
                required
              />
            </div>

            {/* Password Strength Bar & 4 Requirements Checklist */}
            <div className={`p-3.5 rounded-lg border transition-all ${
              themeMode === 'bright'
                ? 'bg-slate-100 border-2 border-slate-300'
                : 'bg-[#0f172a]/70 border border-[#374151]'
            }`}>
              <PasswordStrengthBar password={password} themeMode={themeMode} />
            </div>

            {/* CAPTCHA for 2-step verification */}
            <div className="pt-1">
              <CaptchaBox onVerify={setCaptchaVerified} themeMode={themeMode} />
            </div>

            {/* Buttons Row: 'Authorize Login' and 'New Personnel Registration' */}
            <div className="pt-2 space-y-2.5">
              {/* Authorize Login Button */}
              <button
                type="submit"
                className={`w-full py-3 px-4 font-black rounded-md text-xs sm:text-sm uppercase tracking-wider shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer transform active:scale-[0.99] ${
                  themeMode === 'bright'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                    : 'bg-[#fbbf24] hover:bg-[#f59e0b] text-black'
                }`}
              >
                <LogIn className="w-4 h-4 stroke-[3]" />
                <span>AUTHORIZE LOGIN</span>
              </button>

              {/* New Personnel Registration Button */}
              <button
                type="button"
                onClick={onOpenRegistration}
                className={`w-full py-2.5 px-4 rounded-md text-xs font-bold border-2 transition-all flex items-center justify-center space-x-2 ${
                  themeMode === 'bright'
                    ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900 shadow-sm'
                    : 'bg-transparent hover:bg-[#1f2937] text-[#d1d5db] border-[#4b5563]'
                }`}
              >
                <UserPlus className="w-4 h-4 text-amber-500" />
                <span>NEW PERSONNEL REGISTRATION</span>
              </button>
            </div>
          </form>

          {/* System Footer Bar */}
          <div className={`mt-6 pt-4 border-t flex items-center justify-between text-[10px] font-mono ${
            themeMode === 'bright' ? 'border-slate-300 text-slate-700 font-bold' : 'border-[#1f2937] text-[#4b5563]'
          }`}>
            <span>ENCRYPTION: AES-256</span>
            <span>SYSTEM VERSION: v4.2.0-STABLE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
