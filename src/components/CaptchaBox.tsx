import React, { useState, useEffect } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';

interface CaptchaBoxProps {
  onVerify: (isValid: boolean) => void;
  themeMode?: 'dark' | 'bright';
}

export const generateCaptchaText = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const CaptchaBox: React.FC<CaptchaBoxProps> = ({ onVerify, themeMode = 'dark' }) => {
  const [captchaCode, setCaptchaCode] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);

  const refreshCaptcha = () => {
    const code = generateCaptchaText();
    setCaptchaCode(code);
    setUserInput('');
    setIsVerified(false);
    onVerify(false);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setUserInput(value);
    const valid = value === captchaCode;
    setIsVerified(valid);
    onVerify(valid);
  };

  return (
    <div className="space-y-3">
      <label className={`block text-xs font-extrabold tracking-wider uppercase ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>
        Two-Step Verification (CAPTCHA)
      </label>

      <div className="flex items-center space-x-3">
        {/* Stylized Security Captcha Box */}
        <div className={`relative flex-1 h-12 rounded-xl border flex items-center justify-center px-4 overflow-hidden select-none ${
          themeMode === 'bright'
            ? 'bg-amber-100/90 border-2 border-amber-400'
            : 'bg-slate-950/90 border border-blue-500'
        }`}>
          {/* Background noise grid lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:8px_8px] opacity-25" />
          
          {/* Captcha Text with slight random rotations */}
          <div className={`relative z-10 flex space-x-3 font-mono text-2xl tracking-widest font-black ${
            themeMode === 'bright'
              ? 'text-amber-950 drop-shadow-sm'
              : 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
          }`}>
            {captchaCode.split('').map((char, index) => (
              <span
                key={index}
                style={{
                  transform: `rotate(${(index % 2 === 0 ? 1 : -1) * (index * 4 + 3)}deg) translateY(${index % 2 === 0 ? -2 : 2}px)`,
                  fontStyle: index % 3 === 0 ? 'italic' : 'normal',
                }}
                className="inline-block"
              >
                {char}
              </span>
            ))}
          </div>

          {/* Noise Strike-through line */}
          <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-red-500/40 via-yellow-400/60 to-blue-500/40 transform -rotate-3 pointer-events-none" />
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={refreshCaptcha}
          className={`flex items-center justify-center h-12 px-4 rounded-xl border transition-all focus:outline-none ${
            themeMode === 'bright'
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black border-2 border-amber-600 shadow-sm'
              : 'bg-slate-800/90 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-blue-500'
          }`}
          title="Generate New CAPTCHA"
        >
          <RefreshCw className="w-4.5 h-4.5 mr-2" />
          <span className="text-sm font-extrabold">Refresh</span>
        </button>
      </div>

      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="ENTER CAPTCHA CODE HERE"
          maxLength={6}
          className={`w-full px-4 py-3 rounded-xl text-base font-mono tracking-wider focus:outline-none uppercase transition-all border ${
            themeMode === 'bright'
              ? 'bg-white text-slate-900 border-2 border-slate-300 font-bold placeholder:text-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
              : 'bg-slate-900/90 text-slate-100 border-blue-500 focus:border-blue-400 placeholder-slate-500'
          } ${
            isVerified ? (themeMode === 'bright' ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-emerald-500') : ''
          }`}
        />
        {isVerified && (
          <div className={`absolute right-3 top-3.5 flex items-center text-xs font-bold ${
            themeMode === 'bright' ? 'text-emerald-700' : 'text-emerald-400'
          }`}>
            <ShieldCheck className="w-4 h-4 mr-1" /> Verified
          </div>
        )}
      </div>
    </div>
  );
};
