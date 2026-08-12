import React, { useState } from 'react';
import { RegistrationRequest } from '../types';
import {
  X,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  User,
  FileText,
  Building,
  Eye,
  Image as ImageIcon,
  Award,
  ExternalLink,
  Download,
} from 'lucide-react';

interface PendingApprovalModalProps {
  request: RegistrationRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (reqId: string) => void;
  onReject: (reqId: string) => void;
  themeMode?: 'dark' | 'bright';
}

export const PendingApprovalModal: React.FC<PendingApprovalModalProps> = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
  themeMode = 'dark',
}) => {
  const [activeImagePreview, setActiveImagePreview] = useState<{
    title: string;
    fileName: string;
    type: 'idProof' | 'serviceId';
  } | null>(null);

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className={`relative w-full max-w-3xl my-auto rounded-2xl border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-all ${
          themeMode === 'bright'
            ? 'bg-white text-slate-900 border-slate-300'
            : 'bg-slate-950 text-slate-100 border-yellow-500/30'
        }`}
      >
        {/* Header */}
        <div className={`p-3.5 sm:p-5 border-b flex items-center justify-between gap-2 ${
          themeMode === 'bright'
            ? 'bg-gradient-to-r from-sky-100 via-blue-50 to-white border-slate-200 text-blue-950 shadow-sm'
            : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-yellow-500/20 text-yellow-400'
        }`}>
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <span className={`p-1.5 sm:p-2 rounded-lg border shrink-0 ${
              themeMode === 'bright'
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            }`}>
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div className="min-w-0">
              <h3 className={`text-xs sm:text-base font-bold truncate ${
                themeMode === 'bright' ? 'text-blue-950 font-black' : 'text-yellow-400'
              }`}>Personnel Credential & Registration Verification</h3>
              <p className={`text-[10px] sm:text-xs truncate font-semibold ${
                themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
              }`}>Application Submitted: {request.submittedAt}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors shrink-0 ${
              themeMode === 'bright' ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-800' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Candidate Information Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Status Badge */}
          <div className={`flex items-center justify-between p-3.5 rounded-xl border ${
            themeMode === 'bright'
              ? 'bg-white border border-slate-300 shadow-sm'
              : 'bg-slate-900/80 border border-slate-800'
          }`}>
            <div>
              <span className={themeMode === 'bright' ? 'text-slate-700 font-bold' : 'text-slate-400'}>Target Role Requested:</span>
              <span className={`ml-2 font-black text-sm sm:text-base ${
                themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
              }`}>{request.role}</span>
            </div>
            <span className={`px-3.5 py-1 rounded-full font-black uppercase text-[10px] tracking-wider border ${
              themeMode === 'bright'
                ? 'bg-blue-50 text-blue-900 border-blue-300'
                : 'bg-amber-500/20 text-amber-800 border-amber-500/40'
            }`}>
              Status: {request.status}
            </span>
          </div>

          {/* 1. Personal Information */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            themeMode === 'bright'
              ? 'bg-white border border-slate-300 shadow-sm text-slate-900'
              : 'bg-slate-900/50 border border-slate-800 text-slate-300'
          }`}>
            <h4 className={`font-black uppercase tracking-wider flex items-center text-xs ${
              themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
            }`}>
              <User className="w-4 h-4 mr-1.5 text-blue-600" /> Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div>
                <span className={`block text-[11px] ${themeMode === 'bright' ? 'text-slate-600 font-bold' : 'text-slate-500'}`}>Full Name:</span>
                <span className={`font-bold text-sm ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>{request.fullName}</span>
              </div>
              <div>
                <span className={`block text-[11px] ${themeMode === 'bright' ? 'text-slate-600 font-bold' : 'text-slate-500'}`}>Username:</span>
                <span className={`font-mono font-bold ${themeMode === 'bright' ? 'text-blue-900' : 'text-amber-300'}`}>@{request.username}</span>
              </div>
              <div>
                <span className={`block text-[11px] ${themeMode === 'bright' ? 'text-slate-600 font-bold' : 'text-slate-500'}`}>Phone Number:</span>
                <span className="font-mono font-bold">{request.phone}</span>
              </div>
              <div>
                <span className={`block text-[11px] ${themeMode === 'bright' ? 'text-slate-600 font-bold' : 'text-slate-500'}`}>Email Address:</span>
                <span className="font-bold">{request.email}</span>
              </div>
              <div>
                <span className={`block text-[11px] ${themeMode === 'bright' ? 'text-slate-600 font-bold' : 'text-slate-500'}`}>Date of Birth & Gender:</span>
                <span className="font-bold">{request.dob || 'N/A'} • {request.gender}</span>
              </div>
              <div>
                <span className={`block text-[11px] ${themeMode === 'bright' ? 'text-slate-600 font-bold' : 'text-slate-500'}`}>Blood Group:</span>
                <span className="px-2 py-0.5 bg-red-500/20 text-red-700 border border-red-500/40 rounded font-black">
                  {request.bloodGroup || 'O+'}
                </span>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <span className={`block text-[11px] ${themeMode === 'bright' ? 'text-slate-600 font-bold' : 'text-slate-500'}`}>Residential Address:</span>
                <span className="font-bold">{request.address}</span>
              </div>
            </div>
          </div>

          {/* 2. Professional & Departmental Credentials */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            themeMode === 'bright'
              ? 'bg-white border border-slate-300 shadow-sm text-slate-900'
              : 'bg-slate-900/50 border border-slate-800 text-slate-300'
          }`}>
            <h4 className={`font-black uppercase tracking-wider flex items-center text-xs ${
              themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
            }`}>
              <Building className="w-4 h-4 mr-1.5 text-blue-600" /> Professional & Departmental Credentials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <span className={`block text-[11px] ${themeMode === 'bright' ? 'text-slate-600 font-bold' : 'text-slate-500'}`}>Department / Firm:</span>
                <span className="font-bold text-sm">{request.department}</span>
              </div>
              <div>
                <span className={`block text-[11px] ${themeMode === 'bright' ? 'text-slate-600 font-bold' : 'text-slate-500'}`}>Badge / Bar License ID:</span>
                <span className={`font-mono font-black text-sm ${themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'}`}>{request.badgeId}</span>
              </div>
              <div>
                <span className={`block text-[11px] ${themeMode === 'bright' ? 'text-slate-600 font-bold' : 'text-slate-500'}`}>Experience Level:</span>
                <span className="font-bold">{request.experience}</span>
              </div>
              <div>
                <span className={`block text-[11px] ${themeMode === 'bright' ? 'text-slate-600 font-bold' : 'text-slate-500'}`}>Official Designation:</span>
                <span className="font-bold">{request.designation}</span>
              </div>
            </div>
          </div>

          {/* 3. Verified Uploaded Documents & Image Preview */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            themeMode === 'bright'
              ? 'bg-white border border-slate-300 shadow-sm'
              : 'bg-slate-900/50 border border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <h4 className={`font-black uppercase tracking-wider flex items-center text-xs ${
                themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
              }`}>
                <FileText className="w-4 h-4 mr-1.5 text-blue-600" /> Uploaded Official Documents & Images
              </h4>
              <span className={`text-[10px] px-2 py-0.5 rounded border font-mono font-bold ${
                themeMode === 'bright'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                2 Files Attached
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Document 1: Identity Proof */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 group ${
                themeMode === 'bright'
                  ? 'bg-slate-50 border border-slate-300 hover:border-blue-500'
                  : 'bg-slate-900 border-slate-800 hover:border-yellow-500/40'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="truncate mr-2">
                    <p className={`font-black flex items-center ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>
                      <ImageIcon className="w-4 h-4 mr-1.5 text-blue-600 shrink-0" /> 1. Identity Proof
                    </p>
                    <p className={`text-[11px] font-mono mt-1 truncate font-bold ${themeMode === 'bright' ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      ✓ {request.idProofName}
                    </p>
                  </div>
                  <span className="text-[10px] bg-blue-500/20 text-blue-700 font-bold px-2 py-0.5 rounded font-mono shrink-0">
                    Govt ID
                  </span>
                </div>

                {/* Inline Thumbnail if uploaded image */}
                {request.idProofUrl && request.idProofUrl.startsWith('data:image/') && (
                  <div className={`w-full h-32 rounded-lg overflow-hidden border flex items-center justify-center p-1 ${
                    themeMode === 'bright' ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-800'
                  }`}>
                    <img
                      src={request.idProofUrl}
                      alt={request.idProofName}
                      className="h-full w-full object-cover rounded"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setActiveImagePreview({
                      title: 'Identity Proof Document Scan',
                      fileName: request.idProofName,
                      type: 'idProof',
                    })
                  }
                  className={`w-full py-2 text-xs font-black rounded-lg border flex items-center justify-center space-x-1.5 transition-colors shadow-sm ${
                    themeMode === 'bright'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700'
                      : 'bg-slate-800 hover:bg-slate-700 text-yellow-400 border-yellow-500/30'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Review Document Image</span>
                </button>
              </div>

              {/* Document 2: Service ID / Bar License */}
              <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 group ${
                themeMode === 'bright'
                  ? 'bg-slate-50 border border-slate-300 hover:border-blue-500'
                  : 'bg-slate-900 border-slate-800 hover:border-yellow-500/40'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="truncate mr-2">
                    <p className={`font-black flex items-center ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>
                      <Award className={`w-4 h-4 mr-1.5 shrink-0 ${themeMode === 'bright' ? 'text-blue-600' : 'text-amber-600'}`} /> 2. Service Credential ID
                    </p>
                    <p className={`text-[11px] font-mono mt-1 truncate font-bold ${themeMode === 'bright' ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      ✓ {request.serviceIdName}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono shrink-0 ${
                    themeMode === 'bright' ? 'bg-blue-100 text-blue-900' : 'bg-amber-500/20 text-amber-800'
                  }`}>
                    Official Badge
                  </span>
                </div>

                {/* Inline Thumbnail if uploaded image */}
                {request.serviceIdUrl && request.serviceIdUrl.startsWith('data:image/') && (
                  <div className={`w-full h-32 rounded-lg overflow-hidden border flex items-center justify-center p-1 ${
                    themeMode === 'bright' ? 'bg-white border-slate-300' : 'bg-slate-950 border-slate-800'
                  }`}>
                    <img
                      src={request.serviceIdUrl}
                      alt={request.serviceIdName}
                      className="h-full w-full object-cover rounded"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setActiveImagePreview({
                      title: 'Service Credential / Bar License Card Scan',
                      fileName: request.serviceIdName,
                      type: 'serviceId',
                    })
                  }
                  className={`w-full py-2 text-xs font-black rounded-lg border flex items-center justify-center space-x-1.5 transition-colors shadow-sm ${
                    themeMode === 'bright'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-amber-500/30'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Review Document Image</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Action Buttons: Approve / Reject / Keep Pending */}
        <div className={`p-3.5 sm:p-5 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
          themeMode === 'bright'
            ? 'bg-slate-100 border-slate-300'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center transition-colors ${
              themeMode === 'bright'
                ? 'bg-slate-200 text-slate-800 hover:bg-slate-300 border border-slate-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" /> Keep Pending
          </button>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onReject(request.id);
                onClose();
              }}
              className="px-3 sm:px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-700 dark:text-red-400 border border-red-500/40 rounded-xl text-xs font-bold flex items-center justify-center transition-colors"
            >
              <XCircle className="w-4 h-4 mr-1.5 shrink-0" /> Reject Request
            </button>

            <button
              type="button"
              onClick={() => {
                onApprove(request.id);
                onClose();
              }}
              className="px-4 sm:px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 mr-1.5 stroke-[3] shrink-0" /> Approve Registration
            </button>
          </div>
        </div>
      </div>

      {/* Document Image Lightbox / Full Card Preview Modal */}
      {activeImagePreview && (() => {
        const isIdProof = activeImagePreview.type === 'idProof';
        const fileUrl = isIdProof ? request.idProofUrl : request.serviceIdUrl;
        const fileName = isIdProof ? request.idProofName : request.serviceIdName;

        const isImage = fileUrl?.startsWith('data:image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileName);
        const isPdf = fileUrl?.startsWith('data:application/pdf') || /\.pdf$/i.test(fileName);

        return (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md">
            <div className="relative w-full max-w-2xl bg-slate-900 border border-yellow-500/40 rounded-2xl shadow-2xl overflow-hidden p-5 text-slate-100 space-y-4 max-h-[90vh] flex flex-col">
              {/* Modal Title Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-yellow-400" />
                  <div>
                    <h4 className="font-bold text-yellow-400 text-sm">{activeImagePreview.title}</h4>
                    <p className="text-[11px] text-slate-400 font-mono truncate max-w-md">{fileName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveImagePreview(null)}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Document Viewer Frame */}
              <div className="flex-1 overflow-y-auto space-y-3 min-h-[280px]">
                {fileUrl ? (
                  isImage ? (
                    <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center min-h-[280px]">
                      <img
                        src={fileUrl}
                        alt={fileName}
                        className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-2xl border border-slate-800"
                      />
                    </div>
                  ) : isPdf && fileUrl.startsWith('data:application/pdf') ? (
                    <div className="p-1 bg-slate-950 border border-slate-800 rounded-xl h-[420px]">
                      <iframe
                        src={fileUrl}
                        className="w-full h-full rounded-lg bg-white"
                        title={fileName}
                      />
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-4">
                      <p className="text-xs text-slate-300">
                        Uploaded Document File: <span className="font-mono text-yellow-400 font-bold">{fileName}</span>
                      </p>
                      <a
                        href={fileUrl}
                        download={fileName}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download / View Attachment File</span>
                      </a>
                    </div>
                  )
                ) : (
                  /* Verified Sample Graphic Card for Presets */
                  <div className="p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-dashed border-yellow-500/40 rounded-xl space-y-4 text-center">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-2">
                      <span>GOVERNMENT CREDENTIAL RECORD</span>
                      <span className="text-emerald-400 font-bold">✓ VERIFIED SCAN</span>
                    </div>

                    <div className="p-4 bg-slate-900/90 border border-slate-700 rounded-xl space-y-3 text-left">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="w-6 h-6 text-yellow-400" />
                          <div>
                            <p className="font-bold text-slate-100 text-xs uppercase">
                              {isIdProof ? 'Identity Credential Proof' : 'Service Credential / Bar License'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">Ref ID: {request.badgeId || 'REG-2026'}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded border border-emerald-500/30">
                          AUTHENTICATED
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Applicant Name:</span>
                          <span className="font-bold text-slate-100">{request.fullName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Designation:</span>
                          <span className="text-slate-200">{request.designation}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Department / Firm:</span>
                          <span className="text-slate-200">{request.department}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">File Attachment:</span>
                          <span className="text-yellow-400 font-mono text-[11px]">{fileName}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px]">
                        <div className="font-mono text-slate-500">||||| ||||||| |||| |||||||| ||||</div>
                        <div className="p-1.5 border-2 border-emerald-500/60 rounded-full text-emerald-400 font-black tracking-widest text-[9px] transform -rotate-6">
                          APPROVED & VERIFIED
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Lightbox Footer */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-3 shrink-0 text-xs">
                <span className="text-slate-400">
                  Applicant: <strong className="text-slate-200">{request.fullName}</strong> ({request.role})
                </span>
                <button
                  onClick={() => setActiveImagePreview(null)}
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-extrabold rounded-lg text-xs transition-colors"
                >
                  Close Document Preview
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
