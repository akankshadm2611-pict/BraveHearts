import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthBarProps {
  password: string;
  className?: string;
  themeMode?: 'dark' | 'bright';
}

export interface PasswordRequirements {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export const checkPasswordRequirements = (password: string): PasswordRequirements => {
  return {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };
};

export const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({
  password,
  className = '',
  themeMode = 'dark',
}) => {
  const reqs = checkPasswordRequirements(password);

  const metCount = [reqs.hasMinLength, reqs.hasUppercase, reqs.hasNumber, reqs.hasSpecialChar].filter(
    Boolean
  ).length;

  const percentage = (metCount / 4) * 100;

  const getStrengthLabel = () => {
    if (metCount === 0) return { label: 'Empty', color: themeMode === 'bright' ? 'text-slate-600 font-bold' : 'text-gray-400', barColor: themeMode === 'bright' ? 'bg-slate-400' : 'bg-gray-600' };
    if (metCount === 1) return { label: 'Weak', color: themeMode === 'bright' ? 'text-red-700 font-extrabold' : 'text-red-400', barColor: 'bg-red-500' };
    if (metCount === 2) return { label: 'Fair', color: themeMode === 'bright' ? 'text-amber-800 font-extrabold' : 'text-amber-400', barColor: 'bg-amber-500' };
    if (metCount === 3) return { label: 'Good', color: themeMode === 'bright' ? 'text-amber-900 font-extrabold' : 'text-yellow-400', barColor: 'bg-yellow-400' };
    return { label: 'Strong (100%)', color: themeMode === 'bright' ? 'text-emerald-800 font-extrabold' : 'text-emerald-400', barColor: 'bg-emerald-500' };
  };

  const strength = getStrengthLabel();

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 4 Conditions Checklist */}
      <div className="text-xs font-medium space-y-1">
        <p className={`mb-1.5 font-bold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-300'}`}>
          Password must contain:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
          {/* Condition 1: Min 8 chars */}
          <div className="flex items-center space-x-1.5">
            {reqs.hasMinLength ? (
              <span className={`flex items-center justify-center w-4 h-4 rounded-full ${
                themeMode === 'bright'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-400'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            ) : (
              <span className={`flex items-center justify-center w-4 h-4 rounded-full ${
                themeMode === 'bright'
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}>
                <X className="w-3 h-3 stroke-[3]" />
              </span>
            )}
            <span
              className={
                reqs.hasMinLength
                  ? themeMode === 'bright' ? 'text-emerald-800 font-bold' : 'text-emerald-400 font-medium'
                  : themeMode === 'bright'
                  ? 'text-slate-900 font-semibold'
                  : 'text-slate-400'
              }
            >
              At least 8 characters
            </span>
          </div>

          {/* Condition 2: Uppercase */}
          <div className="flex items-center space-x-1.5">
            {reqs.hasUppercase ? (
              <span className={`flex items-center justify-center w-4 h-4 rounded-full ${
                themeMode === 'bright'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-400'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            ) : (
              <span className={`flex items-center justify-center w-4 h-4 rounded-full ${
                themeMode === 'bright'
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}>
                <X className="w-3 h-3 stroke-[3]" />
              </span>
            )}
            <span
              className={
                reqs.hasUppercase
                  ? themeMode === 'bright' ? 'text-emerald-800 font-bold' : 'text-emerald-400 font-medium'
                  : themeMode === 'bright'
                  ? 'text-slate-900 font-semibold'
                  : 'text-slate-400'
              }
            >
              At least 1 uppercase letter (A-Z)
            </span>
          </div>

          {/* Condition 3: Number */}
          <div className="flex items-center space-x-1.5">
            {reqs.hasNumber ? (
              <span className={`flex items-center justify-center w-4 h-4 rounded-full ${
                themeMode === 'bright'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-400'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            ) : (
              <span className={`flex items-center justify-center w-4 h-4 rounded-full ${
                themeMode === 'bright'
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}>
                <X className="w-3 h-3 stroke-[3]" />
              </span>
            )}
            <span
              className={
                reqs.hasNumber
                  ? themeMode === 'bright' ? 'text-emerald-800 font-bold' : 'text-emerald-400 font-medium'
                  : themeMode === 'bright'
                  ? 'text-slate-900 font-semibold'
                  : 'text-slate-400'
              }
            >
              At least 1 number (0-9)
            </span>
          </div>

          {/* Condition 4: Special Char */}
          <div className="flex items-center space-x-1.5">
            {reqs.hasSpecialChar ? (
              <span className={`flex items-center justify-center w-4 h-4 rounded-full ${
                themeMode === 'bright'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-400'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            ) : (
              <span className={`flex items-center justify-center w-4 h-4 rounded-full ${
                themeMode === 'bright'
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}>
                <X className="w-3 h-3 stroke-[3]" />
              </span>
            )}
            <span
              className={
                reqs.hasSpecialChar
                  ? themeMode === 'bright' ? 'text-emerald-800 font-bold' : 'text-emerald-400 font-medium'
                  : themeMode === 'bright'
                  ? 'text-slate-900 font-semibold'
                  : 'text-slate-400'
              }
            >
              At least 1 special char (!@#$%)
            </span>
          </div>
        </div>
      </div>

      {/* Strength Bar Indicator */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className={themeMode === 'bright' ? 'text-slate-900 font-bold' : 'text-slate-300'}>
            Password Strength:
          </span>
          <span className={`font-extrabold ${strength.color}`}>{strength.label}</span>
        </div>

        <div className={`w-full h-2 rounded-full overflow-hidden p-0.5 border ${
          themeMode === 'bright'
            ? 'bg-slate-200 border-slate-300'
            : 'bg-slate-700/60 border-slate-600/30'
        }`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${strength.barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};
