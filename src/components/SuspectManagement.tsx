import React, { useState, useRef } from 'react';
import { Suspect, SuspectStatus, UserRole, Case } from '../types';
import { ShieldAlert, Plus, X, Search, UserCheck, AlertOctagon, MapPin, Tag, Upload, Image as ImageIcon, GitBranch, Trash2, User, FolderKanban, Share2 } from 'lucide-react';
import { SuspectBinaryTreeModal } from './SuspectBinaryTreeModal';
import { SuspectBinaryTreeNetworkModal } from './SuspectBinaryTreeNetworkModal';

interface SuspectManagementProps {
  suspects: Suspect[];
  cases?: Case[];
  onCreateSuspect: (newSuspect: Suspect) => void;
  onUpdateSuspects?: (updatedSuspects: Suspect[]) => void;
  userRole: UserRole;
  themeMode?: 'dark' | 'bright';
  onBackToDashboard: () => void;
}

export const SuspectManagement: React.FC<SuspectManagementProps> = ({
  suspects,
  cases = [],
  onCreateSuspect,
  onUpdateSuspects,
  userRole,
  themeMode = 'dark',
  onBackToDashboard,
}) => {
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [activeBinaryTreeSuspect, setActiveBinaryTreeSuspect] = useState<Suspect | null>(null);
  const [activeNetworkSuspect, setActiveNetworkSuspect] = useState<Suspect | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Inline Quick Add Node in Detail Modal
  const [showDetailAddNode, setShowDetailAddNode] = useState(false);
  const [detailTargetId, setDetailTargetId] = useState('');
  const [detailRelationship, setDetailRelationship] = useState('Co-conspirator');
  const [detailCaseId, setDetailCaseId] = useState('CR-2026-8942');

  // New Suspect Form State
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [crime, setCrime] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<SuspectStatus>('Wanted');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [notes, setNotes] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const canCreate = userRole === 'DSP' || userRole === 'Host';

  const filteredSuspects = suspects.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.crime.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Image File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoUrl(result);
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearPhoto = () => {
    setPhotoUrl('');
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !crime) return;

    const newSuspect: Suspect = {
      id: `SUS-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName,
      age,
      gender,
      crime,
      address: address || 'Under Verification',
      status,
      photoUrl: photoUrl.trim(), // Image will NOT upload by default; remains empty if not provided by user
      linkedCaseIds: ['CR-2026-8942'],
      connectedSuspects: [],
      notes,
    };

    onCreateSuspect(newSuspect);
    setShowCreateModal(false);

    // Reset form
    setFullName('');
    setCrime('');
    setAddress('');
    setNotes('');
    setPhotoUrl('');
    setPhotoPreview(null);
  };

  // Add Node Connection in Detail View
  const handleAddDetailNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuspect || !detailTargetId) return;

    const targetSuspect = suspects.find((s) => s.id === detailTargetId);
    if (!targetSuspect) return;

    const newConn = {
      targetSuspectId: targetSuspect.id,
      targetSuspectName: targetSuspect.fullName,
      relationship: detailRelationship,
      caseId: detailCaseId || 'CR-2026-8942',
    };

    const targetConn = {
      targetSuspectId: selectedSuspect.id,
      targetSuspectName: selectedSuspect.fullName,
      relationship: `Linked Associate (${detailRelationship})`,
      caseId: detailCaseId || 'CR-2026-8942',
    };

    const updated = suspects.map((s) => {
      if (s.id === selectedSuspect.id) {
        return {
          ...s,
          connectedSuspects: [...s.connectedSuspects, newConn],
        };
      }
      if (s.id === targetSuspect.id) {
        return {
          ...s,
          connectedSuspects: [...s.connectedSuspects, targetConn],
        };
      }
      return s;
    });

    if (onUpdateSuspects) {
      onUpdateSuspects(updated);
    }

    // Refresh selected suspect in modal state
    const refreshed = updated.find((s) => s.id === selectedSuspect.id);
    if (refreshed) setSelectedSuspect(refreshed);

    setDetailTargetId('');
    setShowDetailAddNode(false);
  };

  // Remove Node Connection in Detail View
  const handleRemoveDetailNode = (targetId: string) => {
    if (!selectedSuspect) return;

    const updated = suspects.map((s) => {
      if (s.id === selectedSuspect.id) {
        return {
          ...s,
          connectedSuspects: s.connectedSuspects.filter((c) => c.targetSuspectId !== targetId),
        };
      }
      if (s.id === targetId) {
        return {
          ...s,
          connectedSuspects: s.connectedSuspects.filter((c) => c.targetSuspectId !== selectedSuspect.id),
        };
      }
      return s;
    });

    if (onUpdateSuspects) {
      onUpdateSuspects(updated);
    }

    const refreshed = updated.find((s) => s.id === selectedSuspect.id);
    if (refreshed) setSelectedSuspect(refreshed);
  };

  const getStatusBadge = (st: SuspectStatus) => {
    switch (st) {
      case 'Wanted':
        return themeMode === 'bright'
          ? 'bg-red-100 text-red-950 border-red-300 font-extrabold'
          : 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'Under Arrest':
        return themeMode === 'bright'
          ? 'bg-amber-100 text-amber-950 border-amber-300 font-extrabold'
          : 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Under Investigation':
        return themeMode === 'bright'
          ? 'bg-yellow-100 text-amber-950 border-yellow-400 font-extrabold shadow-xs'
          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'Missing':
        return themeMode === 'bright'
          ? 'bg-purple-100 text-purple-950 border-purple-300 font-extrabold'
          : 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'On Bail':
        return themeMode === 'bright'
          ? 'bg-blue-100 text-blue-950 border-blue-300 font-extrabold'
          : 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default:
        return themeMode === 'bright'
          ? 'bg-yellow-100 text-amber-950 border-yellow-400 font-extrabold shadow-xs'
          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Page Navigation & Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-yellow-500/20 pb-4 sm:pb-6">
        <div>
          <button
            onClick={onBackToDashboard}
            className={`text-xs sm:text-sm font-bold hover:underline mb-1 inline-flex items-center ${
              themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'
            }`}
          >
            ← Back to Dashboard
          </button>
          <h1 className={`text-lg sm:text-2xl md:text-3xl font-black flex items-center leading-tight ${themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'}`}>
            <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-2.5 text-red-500 shrink-0" />
            <span>Suspect Management Intelligence</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 sm:mt-1.5 ${themeMode === 'bright' ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
            Cross-case suspect tracking, binary tree node link analysis, and mugshot registry.
          </p>
        </div>

        {/* Right Corner Button to Create New Suspect History (DSP & Host Only) */}
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full md:w-auto px-4 sm:px-5 py-2.5 bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4.5 h-4.5 stroke-[3] shrink-0" />
            <span className="hidden sm:inline">Create New Suspect Profile</span>
            <span className="sm:hidden text-xs font-black">New Suspect Profile</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Suspect ID, Name, or Crime..."
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium ${
            themeMode === 'bright'
              ? 'bg-white border-2 border-slate-300 text-slate-900 placeholder:text-slate-500'
              : 'bg-slate-900 border border-blue-900/60 text-slate-100'
          }`}
        />
      </div>

      {/* Grid of Cards by Photo of Suspect and Name Below It */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredSuspects.map((suspect) => (
          <div
            key={suspect.id}
            className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between ${
              themeMode === 'bright'
                ? 'bg-white border-2 border-slate-300 shadow-md hover:border-amber-500/60 text-slate-900'
                : 'bg-slate-900/90 border-blue-900/50 hover:border-blue-700/70 shadow-xl text-slate-100'
            }`}
          >
            {/* Suspect Photo Mugshot / Placeholder Silhouette */}
            <div
              onClick={() => setSelectedSuspect(suspect)}
              className="relative h-56 w-full bg-slate-950 overflow-hidden cursor-pointer"
            >
              {suspect.photoUrl ? (
                <img
                  src={suspect.photoUrl}
                  alt={suspect.fullName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/90 text-slate-500 p-4">
                  <User className="w-20 h-20 text-slate-600 mb-2 stroke-[1.5]" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    No Photograph Uploaded
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-md border ${getStatusBadge(suspect.status)}`}>
                  {suspect.status}
                </span>
              </div>

              {/* Suspect ID */}
              <div className="absolute top-3 right-3">
                <span className="text-xs font-mono font-bold bg-slate-950/80 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/30">
                  {suspect.id}
                </span>
              </div>
            </div>

            {/* Suspect Name & Crime Below Photo */}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div onClick={() => setSelectedSuspect(suspect)} className="cursor-pointer space-y-1">
                <h3 className={`text-base sm:text-lg font-extrabold transition-colors line-clamp-1 ${
                  themeMode === 'bright' ? 'text-slate-900 group-hover:text-amber-800' : 'text-slate-100 group-hover:text-yellow-400'
                }`}>
                  {suspect.fullName}
                </h3>
                <p className={`text-xs sm:text-sm font-bold line-clamp-1 ${
                  themeMode === 'bright' ? 'text-amber-800' : 'text-amber-300'
                }`}>{suspect.crime}</p>
                <p className="text-xs text-slate-400 font-medium">Age: {suspect.age} • {suspect.gender}</p>
                <p className={`text-xs font-semibold flex items-center mt-1 line-clamp-1 ${
                  themeMode === 'bright' ? 'text-red-700' : 'text-red-400'
                }`}>
                  <MapPin className="w-3 h-3 mr-1 shrink-0 text-red-500" />
                  <span>{suspect.address}</span>
                </p>
              </div>

              {/* Card Action Controls: Binary Tree & Tree Network Buttons */}
              <div className={`pt-2 border-t flex items-center gap-1.5 ${
                themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setActiveBinaryTreeSuspect(suspect)}
                  className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-black flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                    themeMode === 'bright'
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300/80'
                      : 'bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-slate-950 border border-yellow-500/30'
                  }`}
                  title="View node list & connections"
                >
                  <GitBranch className={`w-3.5 h-3.5 stroke-[2.5] shrink-0 ${
                    themeMode === 'bright' ? 'text-amber-900' : ''
                  }`} />
                  <span className="truncate">Binary Tree</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNetworkSuspect(suspect)}
                  className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-black flex items-center justify-center space-x-1 transition-all shadow-xs cursor-pointer ${
                    themeMode === 'bright'
                      ? 'bg-orange-100 hover:bg-orange-200 text-amber-950 border border-orange-300/80'
                      : 'bg-gradient-to-r from-red-500/20 to-amber-500/20 hover:from-red-500 hover:to-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40'
                  }`}
                  title="Open Binary Tree Network visualizer"
                >
                  <Share2 className={`w-3.5 h-3.5 stroke-[2.5] shrink-0 ${
                    themeMode === 'bright' ? 'text-amber-900' : 'text-amber-400 group-hover:text-slate-950'
                  }`} />
                  <span className="truncate">Tree Network</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Suspect Details Modal */}
      {selectedSuspect && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div
            className={`relative w-full max-w-3xl my-auto rounded-2xl border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-all ${
              themeMode === 'bright'
                ? 'bg-white text-slate-900 border-sky-300 shadow-sky-500/10'
                : 'bg-slate-950 text-slate-100 border-yellow-500/40'
            }`}
          >
            {/* Modal Upper Bar */}
            <div className={`p-4 sm:p-6 border-b flex items-center justify-between transition-colors ${
              themeMode === 'bright'
                ? 'bg-gradient-to-r from-sky-100 via-blue-50 to-white border-sky-200 text-blue-950 shadow-sm'
                : 'bg-slate-900 border-yellow-500/20 text-yellow-400'
            }`}>
              <div className="flex items-center space-x-3">
                <span className={`font-mono font-bold text-xs px-2.5 py-1 rounded shadow-sm ${
                  themeMode === 'bright' ? 'bg-blue-600 text-white' : 'bg-yellow-500 text-slate-950'
                }`}>
                  {selectedSuspect.id}
                </span>
                <h3 className={`text-lg sm:text-xl font-black ${
                  themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                }`}>Suspect Criminal Profile</h3>
              </div>
              <button
                onClick={() => setSelectedSuspect(null)}
                className={`p-1.5 rounded-full transition-colors ${
                  themeMode === 'bright' ? 'bg-white hover:bg-slate-200 text-blue-950 border border-slate-300 shadow-xs' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Close Profile Modal"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Photo */}
                <div className={`w-full sm:w-48 h-56 rounded-xl overflow-hidden border-2 flex-shrink-0 flex items-center justify-center ${
                  themeMode === 'bright'
                    ? 'bg-slate-100 border-blue-400 shadow-sm'
                    : 'bg-slate-900 border-yellow-500/30'
                }`}>
                  {selectedSuspect.photoUrl ? (
                    <img
                      src={selectedSuspect.photoUrl}
                      alt={selectedSuspect.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                      <User className="w-16 h-16 mb-2" />
                      <span className="text-[10px] font-mono uppercase">No Photograph</span>
                    </div>
                  )}
                </div>

                {/* Information Details */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className={`text-2xl font-black ${
                      themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'
                    }`}>{selectedSuspect.fullName}</h2>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(selectedSuspect.status)}`}>
                      {selectedSuspect.status}
                    </span>
                  </div>

                  <div className={`grid grid-cols-2 gap-3 text-xs p-3.5 rounded-xl border ${
                    themeMode === 'bright'
                      ? 'bg-white border-2 border-slate-300 text-slate-900 shadow-sm'
                      : 'bg-slate-900/60 border border-slate-800 text-slate-200'
                  }`}>
                    <div>
                      <span className={themeMode === 'bright' ? 'text-slate-600 font-bold' : 'text-slate-400'}>Age & Gender:</span>
                      <p className={`font-bold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>{selectedSuspect.age} Years • {selectedSuspect.gender}</p>
                    </div>

                    <div>
                      <span className={themeMode === 'bright' ? 'text-slate-600 font-bold' : 'text-slate-400'}>Primary Crime:</span>
                      <p className={`font-extrabold ${themeMode === 'bright' ? 'text-blue-900' : 'text-amber-300'}`}>{selectedSuspect.crime}</p>
                    </div>

                    <div className="col-span-2">
                      <span className={`flex items-center ${themeMode === 'bright' ? 'text-slate-600 font-bold' : 'text-slate-400'}`}><MapPin className="w-3 h-3 mr-1 text-red-500" /> Address:</span>
                      <p className={`font-semibold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>{selectedSuspect.address}</p>
                    </div>
                  </div>

                  {selectedSuspect.notes && (
                    <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                      themeMode === 'bright'
                        ? 'bg-sky-50/80 border-2 border-sky-200 text-slate-900 shadow-sm'
                        : 'bg-slate-900/40 border border-slate-800 text-slate-300'
                    }`}>
                      <span className={themeMode === 'bright' ? 'text-blue-950 font-black' : 'text-amber-400 font-bold'}>Investigative Notes:</span>
                      <p className={themeMode === 'bright' ? 'text-slate-900 font-medium' : 'text-slate-300'}>{selectedSuspect.notes}</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveBinaryTreeSuspect(selectedSuspect);
                        setSelectedSuspect(null);
                      }}
                      className={`w-full py-2.5 px-4 font-black rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg hover:scale-[1.02] transition-all cursor-pointer ${
                        themeMode === 'bright'
                          ? 'bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:scale-105'
                      }`}
                    >
                      <GitBranch className="w-4 h-4" />
                      <span>Open Binary Tree Node Visualizer</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* LINKED CASES & INCIDENT LOCATIONS */}
              {(() => {
                const linkedCases = cases.filter((c) => selectedSuspect.linkedCaseIds.includes(c.id));
                if (linkedCases.length === 0) return null;
                return (
                  <div className={`p-4 rounded-xl border space-y-3 ${
                    themeMode === 'bright'
                      ? 'bg-slate-50 border-2 border-slate-300 text-slate-900 shadow-sm'
                      : 'bg-slate-900 border border-blue-900/50 text-slate-100'
                  }`}>
                    <h4 className={`text-sm font-black flex items-center ${
                      themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                    }`}>
                      <FolderKanban className="w-4 h-4 mr-2 text-blue-500" /> Linked Cases & Crime Incident Locations ({linkedCases.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {linkedCases.map((c) => (
                        <div
                          key={c.id}
                          className={`p-3 rounded-lg border space-y-1 ${
                            themeMode === 'bright'
                              ? 'bg-white border-slate-200 text-slate-900'
                              : 'bg-slate-950 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-extrabold text-xs truncate">{c.caseName}</span>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 shrink-0">{c.id}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">{c.crimeType} • Status: <span className="font-bold text-amber-400">{c.status}</span></p>
                          <p className="text-xs font-bold text-red-500 dark:text-red-400 flex items-start pt-0.5">
                            <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 mt-0.5 text-red-500" />
                            <span>{c.location}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* CONNECTING LINKS (NODE GRAPH) FOR SUSPECT INVESTIGATION */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                themeMode === 'bright'
                  ? 'bg-slate-50 border-2 border-slate-300 text-slate-900 shadow-sm'
                  : 'bg-slate-900 border border-yellow-500/30 text-slate-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-sm font-black flex items-center ${
                      themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                    }`}>
                      <GitBranch className={`w-4 h-4 mr-2 ${themeMode === 'bright' ? 'text-blue-600' : 'text-amber-500'}`} /> Connected Links & Syndicate Network Nodes
                    </h4>
                    <p className={`text-xs mt-0.5 ${
                      themeMode === 'bright' ? 'text-slate-600 font-medium' : 'text-slate-400'
                    }`}>
                      Inter-case intelligence linking this suspect to co-conspirators and accomplices.
                    </p>
                  </div>

                  {canCreate && (
                    <button
                      type="button"
                      onClick={() => setShowDetailAddNode(!showDetailAddNode)}
                      className={`px-2.5 py-1 font-bold text-xs rounded-lg border flex items-center space-x-1 ${
                        themeMode === 'bright'
                          ? 'bg-blue-100 hover:bg-blue-200 text-blue-950 border-blue-300'
                          : 'bg-yellow-500/20 hover:bg-yellow-500 text-amber-900 hover:text-slate-950 border-yellow-500/40'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{showDetailAddNode ? 'Cancel' : 'Add Node'}</span>
                    </button>
                  )}
                </div>

                {/* Inline Add Node Form */}
                {showDetailAddNode && canCreate && (
                  <form onSubmit={handleAddDetailNode} className={`p-3 rounded-xl border space-y-2 text-xs ${
                    themeMode === 'bright'
                      ? 'bg-sky-50/80 border-2 border-sky-200 text-slate-900'
                      : 'bg-slate-950 border border-slate-800 text-slate-100'
                  }`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className={`block font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>Target Suspect</label>
                        <select
                          value={detailTargetId}
                          onChange={(e) => setDetailTargetId(e.target.value)}
                          required
                          className={`w-full p-2 border rounded-lg ${
                            themeMode === 'bright'
                              ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold'
                              : 'bg-slate-900 border border-slate-700 text-slate-100'
                          }`}
                        >
                          <option value="">-- Choose Suspect --</option>
                          {suspects
                            .filter((s) => s.id !== selectedSuspect.id && !selectedSuspect.connectedSuspects.some((c) => c.targetSuspectId === s.id))
                            .map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.fullName} ({s.id})
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className={`block font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>Relationship</label>
                        <input
                          type="text"
                          value={detailRelationship}
                          onChange={(e) => setDetailRelationship(e.target.value)}
                          placeholder="e.g. Co-conspirator, Hawala Partner"
                          className={`w-full p-2 border rounded-lg ${
                            themeMode === 'bright'
                              ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold'
                              : 'bg-slate-900 border border-slate-700 text-slate-100'
                          }`}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className={`px-4 py-1.5 font-bold rounded-lg shadow-sm ${
                          themeMode === 'bright'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-yellow-500 text-slate-950'
                        }`}
                      >
                        Link Node Connection
                      </button>
                    </div>
                  </form>
                )}

                {selectedSuspect.connectedSuspects.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    {selectedSuspect.connectedSuspects.map((link, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border flex items-center justify-between ${
                          themeMode === 'bright'
                            ? 'bg-sky-50/80 border-2 border-sky-200 text-slate-900 shadow-sm'
                            : 'bg-slate-950 border border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center border ${
                            themeMode === 'bright'
                              ? 'bg-blue-100 text-blue-950 border-blue-300'
                              : 'bg-yellow-500/20 text-amber-950 border-yellow-500/40'
                          }`}>
                            Node
                          </div>
                          <div>
                            <p className={`text-xs font-bold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>{link.targetSuspectName}</p>
                            <p className={`text-[10px] ${themeMode === 'bright' ? 'text-blue-900 font-bold' : 'text-amber-300'}`}>Relationship: {link.relationship}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            themeMode === 'bright'
                              ? 'bg-blue-100 text-blue-950 font-bold border-blue-300'
                              : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}>
                            Case: {link.caseId}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveDetailNode(link.targetSuspectId)}
                            title="Disconnect Node Link"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/20 hover:text-red-700 transition-all cursor-pointer flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-xs py-2 ${themeMode === 'bright' ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>No cross-case node links registered for this suspect yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal to Create New Suspect History Profile (DSP & Host) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-5 pt-16 sm:pt-20 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div
            className={`relative w-full max-w-xl my-auto rounded-2xl border shadow-2xl overflow-hidden transition-all ${
              themeMode === 'bright'
                ? 'bg-white text-slate-900 border-sky-300 shadow-sky-500/10'
                : 'bg-slate-950 text-slate-100 border-yellow-500/30'
            }`}
          >
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
              themeMode === 'bright'
                ? 'bg-gradient-to-r from-sky-100 via-blue-50 to-white border-sky-200 text-blue-950 shadow-sm'
                : 'bg-slate-900 border-yellow-500/20 text-yellow-400'
            }`}>
              <h3 className={`text-lg font-bold flex items-center ${
                themeMode === 'bright' ? 'text-blue-950 font-black' : 'text-yellow-400'
              }`}>
                <AlertOctagon className="w-5 h-5 mr-2 text-red-600" /> Create New Suspect Profile
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`p-1 rounded-full transition-colors ${
                  themeMode === 'bright' ? 'bg-white hover:bg-slate-200 text-blue-950 border border-slate-300' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {/* PHOTO UPLOAD OPTION FOR NEW SUSPECT */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                themeMode === 'bright'
                  ? 'bg-sky-50/80 border-2 border-sky-200 text-slate-900 shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-100'
              }`}>
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-black flex items-center ${
                    themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                  }`}>
                    <ImageIcon className={`w-4 h-4 mr-1.5 ${themeMode === 'bright' ? 'text-blue-600' : 'text-amber-500'}`} /> Upload Suspect Photograph (Optional)
                  </label>
                  <div className="flex text-[10px] bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setUploadMethod('file')}
                      className={`px-2 py-0.5 rounded font-bold ${
                        uploadMethod === 'file' ? (themeMode === 'bright' ? 'bg-blue-600 text-white' : 'bg-yellow-500 text-slate-950') : 'text-slate-400'
                      }`}
                    >
                      File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMethod('url')}
                      className={`px-2 py-0.5 rounded font-bold ${
                        uploadMethod === 'url' ? (themeMode === 'bright' ? 'bg-blue-600 text-white' : 'bg-yellow-500 text-slate-950') : 'text-slate-400'
                      }`}
                    >
                      URL Link
                    </button>
                  </div>
                </div>

                <p className={`text-[11px] ${themeMode === 'bright' ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                  Note: Photograph will <strong>NOT</strong> be uploaded by default. You can choose to upload a photo file below or leave it empty for a placeholder profile.
                </p>

                {uploadMethod === 'file' ? (
                  <div>
                    {photoPreview ? (
                      <div className={`relative w-32 h-36 mx-auto rounded-xl overflow-hidden border-2 shadow-md ${
                        themeMode === 'bright' ? 'border-blue-400' : 'border-yellow-400'
                      }`}>
                        <img src={photoPreview} alt="Suspect preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={handleClearPhoto}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white hover:bg-red-700"
                          title="Remove Photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                          themeMode === 'bright'
                            ? 'border-sky-300 bg-white hover:bg-sky-50 text-slate-900'
                            : 'border-slate-700 hover:border-yellow-500 bg-slate-950/50 hover:bg-slate-950 text-slate-200'
                        }`}
                      >
                        <Upload className={`w-8 h-8 mx-auto mb-1.5 ${themeMode === 'bright' ? 'text-blue-600' : 'text-amber-500'}`} />
                        <p className={`text-xs font-bold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>Click to Browse Suspect Image File</p>
                        <p className={`text-[10px] mt-0.5 ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-500'}`}>Supports PNG, JPG, JPEG, WEBP</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={photoUrl}
                      onChange={(e) => {
                        setPhotoUrl(e.target.value);
                        setPhotoPreview(e.target.value);
                      }}
                      placeholder="Paste suspect image URL (https://...)"
                      className={`w-full px-3 py-2 rounded-lg text-xs ${
                        themeMode === 'bright'
                          ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold'
                          : 'bg-slate-950 border border-slate-700 text-slate-100'
                      }`}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>Suspect Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh 'Shankar' Pawar"
                    className={`w-full px-3 py-2 rounded-lg text-xs ${
                      themeMode === 'bright'
                        ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold placeholder:text-slate-500'
                        : 'bg-slate-900 border border-slate-700 text-slate-100'
                    }`}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className={`w-full px-3 py-2 rounded-lg text-xs ${
                        themeMode === 'bright'
                          ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold'
                          : 'bg-slate-900 border border-slate-700 text-slate-100'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className={`w-full px-2 py-2 rounded-lg text-xs ${
                        themeMode === 'bright'
                          ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold'
                          : 'bg-slate-900 border border-slate-700 text-slate-100'
                      }`}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-xs font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>Crime Committed *</label>
                  <input
                    type="text"
                    value={crime}
                    onChange={(e) => setCrime(e.target.value)}
                    placeholder="e.g. Armed Robbery, Extortion, Fraud"
                    className={`w-full px-3 py-2 rounded-lg text-xs ${
                      themeMode === 'bright'
                        ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold placeholder:text-slate-500'
                        : 'bg-slate-900 border border-slate-700 text-slate-100'
                    }`}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-xs font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>Address (if known)</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Sector 14, Metro Docks area"
                    className={`w-full px-3 py-2 rounded-lg text-xs ${
                      themeMode === 'bright'
                        ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold placeholder:text-slate-500'
                        : 'bg-slate-900 border border-slate-700 text-slate-100'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-xs font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SuspectStatus)}
                    className={`w-full px-3 py-2 rounded-lg text-xs ${
                      themeMode === 'bright'
                        ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold'
                        : 'bg-slate-900 border border-slate-700 text-slate-100'
                    }`}
                  >
                    <option value="Wanted">Wanted</option>
                    <option value="Under Arrest">Under Arrest</option>
                    <option value="Missing">Missing</option>
                    <option value="On Bail">On Bail</option>
                    <option value="Sentenced">Sentenced</option>
                    <option value="Under Investigation">Under Investigation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-200'}`}>Investigative Background / Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Known aliases, associates, key danger level..."
                  className={`w-full px-3 py-2 rounded-lg text-xs ${
                    themeMode === 'bright'
                      ? 'bg-white border-2 border-slate-300 text-slate-900 font-bold placeholder:text-slate-500'
                      : 'bg-slate-900 border border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div className={`flex justify-end space-x-2 pt-3 border-t ${themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800'}`}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold ${
                    themeMode === 'bright'
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 font-bold rounded-lg text-xs shadow-md ${
                    themeMode === 'bright'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
                  }`}
                >
                  Create Suspect History
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Binary Tree Visualizer Modal */}
      {activeBinaryTreeSuspect && (
        <SuspectBinaryTreeModal
          rootSuspect={activeBinaryTreeSuspect}
          suspects={suspects}
          userRole={userRole}
          themeMode={themeMode}
          onClose={() => setActiveBinaryTreeSuspect(null)}
          onUpdateSuspects={onUpdateSuspects}
          onSelectSuspectProfile={(s) => {
            setSelectedSuspect(s);
            setActiveBinaryTreeSuspect(null);
          }}
        />
      )}

      {/* Binary Tree Network Diagram Modal */}
      {activeNetworkSuspect && (
        <SuspectBinaryTreeNetworkModal
          rootSuspect={activeNetworkSuspect}
          suspects={suspects}
          cases={cases}
          themeMode={themeMode}
          onClose={() => setActiveNetworkSuspect(null)}
          onSelectSuspectProfile={(s) => {
            setSelectedSuspect(s);
            setActiveNetworkSuspect(null);
          }}
        />
      )}
    </div>
  );
};
