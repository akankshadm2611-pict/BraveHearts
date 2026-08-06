import React, { useState } from 'react';
import { Suspect, UserRole } from '../types';
import { X, Network, Plus, Trash2, User, ChevronRight, AlertCircle, ShieldAlert, GitBranch, ArrowRight } from 'lucide-react';

interface SuspectBinaryTreeModalProps {
  rootSuspect: Suspect;
  suspects: Suspect[];
  userRole: UserRole;
  themeMode?: 'dark' | 'bright';
  onClose: () => void;
  onUpdateSuspects?: (updatedSuspects: Suspect[]) => void;
  onSelectSuspectProfile?: (suspect: Suspect) => void;
}

export const SuspectBinaryTreeModal: React.FC<SuspectBinaryTreeModalProps> = ({
  rootSuspect: initialRootSuspect,
  suspects,
  userRole,
  themeMode = 'dark',
  onClose,
  onUpdateSuspects,
  onSelectSuspectProfile,
}) => {
  const [currentRootId, setCurrentRootId] = useState<string>(initialRootSuspect.id);
  const [showAddNodeForm, setShowAddNodeForm] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [relationship, setRelationship] = useState<string>('Co-conspirator');
  const [customRelationship, setCustomRelationship] = useState<string>('');
  const [caseId, setCaseId] = useState<string>('CR-2026-8942');

  const canEditNodes = userRole === 'DSP' || userRole === 'Host';

  // Find the active root suspect object from suspects list
  const currentRoot = suspects.find((s) => s.id === currentRootId) || initialRootSuspect;

  // Level 1 Connected Suspects (Direct Children)
  const directConnections = currentRoot.connectedSuspects || [];

  // Filter available suspects to connect (excluding current root and already connected)
  const availableToConnect = suspects.filter((s) => {
    if (s.id === currentRoot.id) return false;
    const isAlreadyConnected = directConnections.some((conn) => conn.targetSuspectId === s.id);
    return !isAlreadyConnected;
  });

  const getStatusBadgeClass = (st: string) => {
    switch (st) {
      case 'Wanted':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'Under Arrest':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'Missing':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'On Bail':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
    }
  };

  // Add new Node Connection
  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetId) return;

    const targetSuspect = suspects.find((s) => s.id === selectedTargetId);
    if (!targetSuspect) return;

    const relToUse = relationship === 'Other' && customRelationship ? customRelationship : relationship;

    // 1. Add connection to current root
    const newRootConn = {
      targetSuspectId: targetSuspect.id,
      targetSuspectName: targetSuspect.fullName,
      relationship: relToUse,
      caseId: caseId || 'CR-2026-8942',
    };

    // 2. Add reciprocal connection to target suspect
    const newTargetConn = {
      targetSuspectId: currentRoot.id,
      targetSuspectName: currentRoot.fullName,
      relationship: `Linked Associate (${relToUse})`,
      caseId: caseId || 'CR-2026-8942',
    };

    const updatedSuspectsList = suspects.map((s) => {
      if (s.id === currentRoot.id) {
        return {
          ...s,
          connectedSuspects: [...s.connectedSuspects, newRootConn],
        };
      }
      if (s.id === targetSuspect.id) {
        return {
          ...s,
          connectedSuspects: [...s.connectedSuspects, newTargetConn],
        };
      }
      return s;
    });

    if (onUpdateSuspects) {
      onUpdateSuspects(updatedSuspectsList);
    }

    // Reset Form
    setSelectedTargetId('');
    setCustomRelationship('');
    setShowAddNodeForm(false);
  };

  // Remove Node Connection
  const handleRemoveNode = (targetId: string) => {
    const updatedSuspectsList = suspects.map((s) => {
      if (s.id === currentRoot.id) {
        return {
          ...s,
          connectedSuspects: s.connectedSuspects.filter((c) => c.targetSuspectId !== targetId),
        };
      }
      if (s.id === targetId) {
        return {
          ...s,
          connectedSuspects: s.connectedSuspects.filter((c) => c.targetSuspectId !== currentRoot.id),
        };
      }
      return s;
    });

    if (onUpdateSuspects) {
      onUpdateSuspects(updatedSuspectsList);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-5 pt-16 sm:pt-20 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div
        className={`relative w-full max-w-5xl my-auto rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          themeMode === 'bright'
            ? 'bg-white text-slate-900 border-slate-300'
            : 'bg-slate-950 text-slate-100 border-yellow-500/40'
        }`}
      >
        {/* Header Bar */}
        <div className={`p-3.5 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          themeMode === 'bright'
            ? 'bg-gradient-to-r from-sky-100 via-blue-50 to-white border-slate-200 text-blue-950 shadow-sm'
            : 'bg-slate-900 border-yellow-500/20 text-yellow-400'
        }`}>
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black shadow-lg shrink-0 ${
              themeMode === 'bright' ? 'bg-blue-600 text-white' : 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950'
            }`}>
              <GitBranch className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className={`text-base sm:text-xl font-black flex items-center gap-1.5 sm:gap-2 leading-tight ${
                themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
              }`}>
                Binary Tree Intelligence Network Node Visualizer
              </h3>
              <p className={`text-[10px] sm:text-xs font-semibold ${
                themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Hierarchical cross-case suspect link graph & accomplice node tree
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 shrink-0">
            {canEditNodes && (
              <button
                type="button"
                onClick={() => setShowAddNodeForm(!showAddNodeForm)}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 font-black rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all ${
                  themeMode === 'bright'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950'
                }`}
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                <span className="text-[11px] sm:text-xs">Add Node Connection</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 sm:p-2 rounded-xl transition-colors ${
                themeMode === 'bright'
                  ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-800'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Form Drawer to Add Node Connection (DSP & Host) */}
        {showAddNodeForm && canEditNodes && (
          <div className={`p-4 border-b animate-fadeIn ${
            themeMode === 'bright'
              ? 'bg-slate-100 border-slate-300 text-slate-900'
              : 'bg-slate-900/90 border-yellow-500/30 text-slate-100'
          }`}>
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <h4 className={`text-xs font-black uppercase flex items-center ${
                  themeMode === 'bright' ? 'text-blue-950' : 'text-amber-400'
                }`}>
                  <Plus className="w-4 h-4 mr-1 text-blue-600" /> Link New Suspect Node to {currentRoot.fullName}
                </h4>
                <button
                  onClick={() => setShowAddNodeForm(false)}
                  className={`text-xs font-bold ${
                    themeMode === 'bright' ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Cancel
                </button>
              </div>

              {availableToConnect.length > 0 ? (
                <form onSubmit={handleAddNode} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${
                      themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'
                    }`}>Select Target Suspect *</label>
                    <select
                      value={selectedTargetId}
                      onChange={(e) => setSelectedTargetId(e.target.value)}
                      required
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold ${
                        themeMode === 'bright'
                          ? 'bg-white border-2 border-slate-300 text-slate-900'
                          : 'bg-slate-950 border border-slate-700 text-slate-100'
                      }`}
                    >
                      <option value="">-- Choose Suspect --</option>
                      {availableToConnect.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.fullName} ({s.id} - {s.crime})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${
                      themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'
                    }`}>Relationship / Role *</label>
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold ${
                        themeMode === 'bright'
                          ? 'bg-white border-2 border-slate-300 text-slate-900'
                          : 'bg-slate-950 border border-slate-700 text-slate-100'
                      }`}
                    >
                      <option value="Co-conspirator">Co-conspirator</option>
                      <option value="Gang Leader / Boss">Gang Leader / Boss</option>
                      <option value="Accomplice / Getaway">Accomplice / Getaway</option>
                      <option value="Arms / Weapon Supplier">Arms / Weapon Supplier</option>
                      <option value="Hawala Financier">Hawala Financier</option>
                      <option value="Technical Handler / Hacker">Technical Handler / Hacker</option>
                      <option value="Informant / Spotter">Informant / Spotter</option>
                      <option value="Other">Custom Relationship...</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${
                      themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'
                    }`}>Case Reference ID</label>
                    <input
                      type="text"
                      value={caseId}
                      onChange={(e) => setCaseId(e.target.value)}
                      placeholder="e.g. CR-2026-8942"
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold ${
                        themeMode === 'bright'
                          ? 'bg-white border-2 border-slate-300 text-slate-900'
                          : 'bg-slate-950 border border-slate-700 text-slate-100 font-mono'
                      }`}
                    />
                  </div>

                  {relationship === 'Other' && (
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={customRelationship}
                        onChange={(e) => setCustomRelationship(e.target.value)}
                        placeholder="Specify custom relationship..."
                        className={`w-full px-3 py-2 rounded-xl text-xs font-bold ${
                          themeMode === 'bright'
                            ? 'bg-white border-2 border-amber-500 text-slate-900'
                            : 'bg-slate-950 border border-amber-500/50 text-slate-100'
                        }`}
                        required
                      />
                    </div>
                  )}

                  <div className="sm:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-transform hover:scale-105"
                    >
                      Connect Node in Binary Tree
                    </button>
                  </div>
                </form>
              ) : (
                <p className={`text-xs italic py-1 ${
                  themeMode === 'bright' ? 'text-amber-950 font-bold' : 'text-amber-300/80'
                }`}>
                  All available suspects are already connected to this root node.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Binary Tree Visualizer Body */}
        <div className={`p-6 space-y-8 max-h-[80vh] overflow-y-auto ${
          themeMode === 'bright' ? 'bg-slate-100 text-slate-900' : 'bg-[#0a0d14] text-slate-100'
        }`}>
          {/* Top Info Banner */}
          <div className={`flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-2xl text-xs gap-3 ${
            themeMode === 'bright'
              ? 'bg-white border-2 border-slate-300 text-slate-800 shadow-sm'
              : 'bg-slate-900/80 border border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="font-medium">
                Click any child node circle to re-center the tree on that suspect, or manage node links directly.
              </span>
            </div>

            {currentRoot.id !== initialRootSuspect.id && (
              <button
                type="button"
                onClick={() => setCurrentRootId(initialRootSuspect.id)}
                className={`px-3 py-1.5 font-bold rounded-lg text-xs flex items-center space-x-1 transition-colors ${
                  themeMode === 'bright'
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-yellow-400'
                }`}
              >
                <span>Reset to {initialRootSuspect.fullName}</span>
              </button>
            )}
          </div>

          {/* TREE CANVAS STRUCTURE */}
          <div className="flex flex-col items-center justify-center space-y-6 relative py-4">
            
            {/* LEVEL 0: ROOT NODE CIRCLE */}
            <div className="relative flex flex-col items-center group z-10">
              <div className="relative">
                {/* Glowing Outer Ring */}
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 opacity-70 blur-md group-hover:opacity-100 transition duration-500" />
                
                {/* Circular Suspect Node Image */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-yellow-400 bg-slate-950 overflow-hidden shadow-2xl flex items-center justify-center">
                  {currentRoot.photoUrl ? (
                    <img
                      src={currentRoot.photoUrl}
                      alt={currentRoot.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                </div>

                {/* Badge Label */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-950 text-yellow-400 font-mono font-black text-[10px] px-2.5 py-0.5 rounded-full border border-yellow-500/60 shadow-md whitespace-nowrap">
                  ROOT NODE • {currentRoot.id}
                </div>
              </div>

              <div className="mt-4 text-center space-y-1">
                <h4 className={`text-base sm:text-lg font-black transition-colors ${
                  themeMode === 'bright' ? 'text-slate-900 hover:text-amber-800' : 'text-slate-100 hover:text-yellow-400'
                }`}>
                  {currentRoot.fullName}
                </h4>
                <p className={`text-xs font-bold ${
                  themeMode === 'bright' ? 'text-amber-900' : 'text-amber-300'
                }`}>{currentRoot.crime}</p>
                <div className="flex items-center justify-center space-x-2 pt-1">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(currentRoot.status)}`}>
                    {currentRoot.status}
                  </span>
                  <span className={`text-[10px] font-bold ${
                    themeMode === 'bright' ? 'text-slate-700' : 'text-slate-400'
                  }`}>
                    Age: {currentRoot.age} ({currentRoot.gender})
                  </span>
                </div>
              </div>
            </div>

            {/* SVG CONNECTING LINES (Root to Children) */}
            {directConnections.length > 0 && (
              <div className="w-full flex justify-center -my-2 relative pointer-events-none">
                <svg className="w-full max-w-2xl h-12 overflow-visible">
                  {directConnections.map((_, idx) => {
                    const count = directConnections.length;
                    const startX = 50; // percent
                    const startY = 0;
                    const endY = 48;
                    // Distribute child targets evenly
                    const step = 80 / Math.max(1, count - 1);
                    const endX = count === 1 ? 50 : 10 + idx * step;
                    return (
                      <g key={idx}>
                        <path
                          d={`M ${startX}% ${startY} C ${startX}% ${endY / 2}, ${endX}% ${endY / 2}, ${endX}% ${endY}`}
                          fill="none"
                          stroke={themeMode === 'bright' ? '#d97706' : '#f59e0b'}
                          strokeWidth="2.5"
                          strokeDasharray="4,4"
                          className="animate-pulse"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}

            {/* LEVEL 1: CONNECTED CHILD NODES (BINARY BRANCHES) */}
            {directConnections.length > 0 ? (
              <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2">
                {directConnections.map((conn, idx) => {
                  const childSuspect = suspects.find((s) => s.id === conn.targetSuspectId);
                  const childPhoto = childSuspect?.photoUrl;
                  const childStatus = childSuspect?.status || 'Under Investigation';

                  return (
                    <div
                      key={idx}
                      className={`relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center space-y-3 group shadow-lg hover:-translate-y-1 ${
                        themeMode === 'bright'
                          ? 'bg-white border-2 border-slate-300 hover:border-amber-500 text-slate-900'
                          : 'bg-slate-900/90 border border-slate-800 hover:border-yellow-500/60 text-slate-100'
                      }`}
                    >
                      {/* Action buttons on top-right of child node */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveNode(conn.targetSuspectId);
                        }}
                        title="Remove Node Connection"
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white transition-colors border border-red-500/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Small Circle Image for Child Node */}
                      <button
                        type="button"
                        onClick={() => {
                          if (childSuspect) {
                            setCurrentRootId(childSuspect.id);
                          }
                        }}
                        className="relative group/circle focus:outline-none"
                      >
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 overflow-hidden shadow-md flex items-center justify-center transition-transform group-hover/circle:scale-110 ${
                          themeMode === 'bright'
                            ? 'border-amber-500 bg-slate-100 group-hover/circle:border-amber-600'
                            : 'border-amber-500/80 group-hover/circle:border-yellow-400 bg-slate-950'
                        }`}>
                          {childPhoto ? (
                            <img
                              src={childPhoto}
                              alt={conn.targetSuspectName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500">
                              <User className="w-8 h-8" />
                            </div>
                          )}
                        </div>

                        <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full border whitespace-nowrap shadow ${
                          themeMode === 'bright'
                            ? 'bg-slate-950 text-yellow-400 border-amber-400'
                            : 'bg-slate-950 text-yellow-400 border-yellow-500/40'
                        }`}>
                          {conn.targetSuspectId}
                        </span>
                      </button>

                      {/* Child Node Details */}
                      <div className="space-y-1 w-full pt-1">
                        <h5
                          onClick={() => {
                            if (childSuspect) setCurrentRootId(childSuspect.id);
                          }}
                          className={`text-xs sm:text-sm font-black cursor-pointer transition-colors line-clamp-1 ${
                            themeMode === 'bright'
                              ? 'text-slate-900 hover:text-amber-800'
                              : 'text-slate-100 hover:text-yellow-400'
                          }`}
                        >
                          {conn.targetSuspectName}
                        </h5>

                        <div className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          themeMode === 'bright'
                            ? 'bg-amber-100 text-amber-950 border-amber-300'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}>
                          {conn.relationship}
                        </div>

                        <div className={`text-[10px] font-mono pt-1 ${
                          themeMode === 'bright' ? 'text-slate-600 font-bold' : 'text-slate-400'
                        }`}>
                          Case: <span className={themeMode === 'bright' ? 'text-amber-950 font-black' : 'text-yellow-400 font-bold'}>{conn.caseId}</span>
                        </div>
                      </div>

                      {/* Controls Footer */}
                      <div className={`w-full pt-2 border-t flex items-center justify-center gap-2 ${
                        themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800'
                      }`}>
                        <button
                          type="button"
                          onClick={() => {
                            if (childSuspect) setCurrentRootId(childSuspect.id);
                          }}
                          className={`text-[10px] font-bold flex items-center ${
                            themeMode === 'bright' ? 'text-amber-800 hover:underline' : 'text-yellow-400 hover:underline'
                          }`}
                        >
                          <span>Center Tree</span>
                          <ChevronRight className="w-3 h-3 ml-0.5" />
                        </button>

                        {childSuspect && onSelectSuspectProfile && (
                          <button
                            type="button"
                            onClick={() => onSelectSuspectProfile(childSuspect)}
                            className="text-[10px] font-bold text-slate-400 hover:text-slate-200 hover:underline"
                          >
                            Profile
                          </button>
                        )}
                      </div>

                      {/* LEVEL 2 SUB-BRANCH SUMMARY */}
                      {childSuspect && childSuspect.connectedSuspects.filter(c => c.targetSuspectId !== currentRoot.id).length > 0 && (
                        <div className="w-full pt-2 border-t border-slate-800/60">
                          <p className="text-[9px] text-amber-400 font-bold flex items-center justify-center">
                            <GitBranch className="w-3 h-3 mr-1" />
                            {childSuspect.connectedSuspects.filter(c => c.targetSuspectId !== currentRoot.id).length} Sub-Nodes Attached
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 text-center max-w-md my-4 space-y-3">
                <Network className="w-10 h-10 text-slate-600 mx-auto" />
                <h5 className="text-sm font-bold text-slate-300">No Node Connections Branching From This Suspect</h5>
                <p className="text-xs text-slate-500">
                  This suspect is currently an isolated node. Host Administrators and DSP officers can attach co-conspirator and accomplice nodes using the button above.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
