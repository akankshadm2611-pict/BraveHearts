import React, { useState, useEffect, useRef } from 'react';
import { Case, TimelineEntry, User } from '../types';
import { Clock, PlusCircle, Calendar, UserCheck, Shield, ChevronLeft, CheckCircle2, ArrowRightCircle, Pencil } from 'lucide-react';

interface CaseTimelineModalProps {
  caseItem: Case;
  themeMode: 'bright' | 'dark';
  currentUser: User | null;
  onClose: () => void;
  onAddEntry: (caseId: string, entry: Omit<TimelineEntry, 'id'>) => void;
  onUpdateEntry?: (caseId: string, entry: TimelineEntry) => void;
}

export const CaseTimelineModal: React.FC<CaseTimelineModalProps> = ({
  caseItem,
  themeMode,
  currentUser,
  onClose,
  onAddEntry,
  onUpdateEntry,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const now = new Date();
  const defaultDateStr = `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}, ${now.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  
  const getDefaultRoleForUser = (role?: string): string => {
    if (role === 'Officer' || role === 'Police Officer') return 'Police Officer';
    if (role === 'Host' || role === 'Host Inspector') return 'Host Inspector';
    if (role === 'DSP') return 'DSP';
    if (role === 'Advocate') return 'Advocate';
    return 'Police Officer';
  };

  const [title, setTitle] = useState('');
  const [timestamp, setTimestamp] = useState(defaultDateStr);
  const [description, setDescription] = useState('');
  const [performerName, setPerformerName] = useState(currentUser?.fullName || caseItem.assignedHostName || 'Assigned Officer');
  const [performerRole, setPerformerRole] = useState(getDefaultRoleForUser(currentUser?.role));
  const [statusTag, setStatusTag] = useState<'Completed' | 'In Progress' | 'Pending'>('Completed');

  useEffect(() => {
    if (currentUser) {
      if (currentUser.fullName) {
        setPerformerName(currentUser.fullName);
      }
      setPerformerRole(getDefaultRoleForUser(currentUser.role));
    }
  }, [currentUser, showAddForm]);

  // Parse timeline date strings to timestamp (ms) for chronological sorting
  const parseTimelineDate = (dateStr: string): number => {
    if (!dateStr) return 0;
    const cleaned = dateStr.replace(/,/g, '').trim();
    const directParsed = Date.parse(cleaned);
    if (!isNaN(directParsed)) return directParsed;

    const match = cleaned.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})(?:\s*([AP]M))?)?/i);
    if (match) {
      const [, day, monthStr, year, hourStr, minStr, ampm] = match;
      let hour = hourStr ? parseInt(hourStr, 10) : 0;
      const min = minStr ? parseInt(minStr, 10) : 0;
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hour < 12) hour += 12;
        if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
      }
      const d = new Date(`${monthStr} ${day}, ${year} ${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00`);
      if (!isNaN(d.getTime())) return d.getTime();
    }
    return 0;
  };

  // Fallback / Initial entries if timeline is empty
  const rawTimelineList: TimelineEntry[] = ((caseItem.timeline && caseItem.timeline.length > 0)
    ? caseItem.timeline
    : [
        {
          id: `initial-${caseItem.id}`,
          timestamp: caseItem.createdAt || `${caseItem.dateAssigned}, 09:30 AM`,
          title: 'Case Registered',
          description: `Complaint received and case officially created. ${caseItem.description}`,
          performerName: caseItem.assignedHostName || 'Inspector Sharma',
          performerRole: 'Host Inspector',
          statusTag: 'Completed',
        },
      ]
  ).map((item, index) => ({
    ...item,
    id: item.id || `tl-${caseItem.id}-${index}`,
  }));

  // Sort timeline entries chronologically ascending
  const timelineList = [...rawTimelineList].sort((a, b) => {
    const timeA = parseTimelineDate(a.timestamp);
    const timeB = parseTimelineDate(b.timestamp);
    return timeA - timeB;
  });

  const handlePresetClick = (presetTitle: string, presetDesc: string) => {
    setTitle(presetTitle);
    if (!description) {
      setDescription(presetDesc);
    }
  };

  const handleStartEdit = (entry: TimelineEntry) => {
    const targetId = entry.id || `tl-${caseItem.id}`;
    setEditingEntryId(targetId);
    setTitle(entry.title);
    setTimestamp(entry.timestamp);
    setDescription(entry.description);
    setPerformerName(entry.performerName || (currentUser?.fullName || 'Assigned Officer'));
    setPerformerRole(entry.performerRole || getDefaultRoleForUser(currentUser?.role));
    setStatusTag(entry.statusTag || 'Completed');
    setShowAddForm(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      titleInputRef.current?.focus();
    }, 80);
  };

  const handleToggleAddForm = () => {
    if (showAddForm) {
      setShowAddForm(false);
      setEditingEntryId(null);
      setTitle('');
      setDescription('');
    } else {
      setEditingEntryId(null);
      setTitle('');
      setDescription('');
      setShowAddForm(true);
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        titleInputRef.current?.focus();
      }, 80);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    if (editingEntryId) {
      if (onUpdateEntry) {
        onUpdateEntry(caseItem.id, {
          id: editingEntryId,
          title: title.trim(),
          timestamp: timestamp.trim() || defaultDateStr,
          description: description.trim(),
          performerName: performerName.trim() || (currentUser?.fullName || 'Assigned Officer'),
          performerRole: performerRole || (currentUser?.role || 'Police Officer'),
          statusTag: statusTag,
        });
      } else {
        onAddEntry(caseItem.id, {
          title: title.trim(),
          timestamp: timestamp.trim() || defaultDateStr,
          description: description.trim(),
          performerName: performerName.trim() || (currentUser?.fullName || 'Assigned Officer'),
          performerRole: performerRole || (currentUser?.role || 'Police Officer'),
          statusTag: statusTag,
        });
      }
    } else {
      onAddEntry(caseItem.id, {
        title: title.trim(),
        timestamp: timestamp.trim() || defaultDateStr,
        description: description.trim(),
        performerName: performerName.trim() || (currentUser?.fullName || 'Assigned Officer'),
        performerRole: performerRole || (currentUser?.role || 'Police Officer'),
        statusTag: statusTag,
      });
    }

    // Reset Form
    setTitle('');
    setDescription('');
    setEditingEntryId(null);
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className={`relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border flex flex-col my-auto max-h-[92vh] ${
          themeMode === 'bright'
            ? 'bg-slate-50 border-slate-200 text-slate-900'
            : 'bg-slate-950 border-yellow-500/40 text-slate-100'
        }`}
      >
        {/* Header Bar */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
            themeMode === 'bright'
              ? 'bg-gradient-to-r from-sky-100 via-blue-50 to-white border-slate-200 text-blue-950'
              : 'bg-slate-900 border-yellow-500/20 text-yellow-400'
          }`}
        >
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-all flex items-center space-x-1 text-xs font-bold ${
                themeMode === 'bright'
                  ? 'bg-white hover:bg-slate-200 text-blue-900 border border-slate-300 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-yellow-500/30'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                    themeMode === 'bright'
                      ? 'bg-blue-600 text-white'
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}
                >
                  CASE #{caseItem.id}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    caseItem.status === 'Solved'
                      ? themeMode === 'bright'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : caseItem.status === 'Active'
                      ? themeMode === 'bright'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : themeMode === 'bright'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  ● {caseItem.status}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
                {caseItem.caseName}
                <span className="text-xs font-normal opacity-80 ml-2">({caseItem.crimeType})</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              themeMode === 'bright'
                ? 'hover:bg-slate-200 text-slate-700'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* Top Info Banner */}
          <div
            className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
              themeMode === 'bright'
                ? 'bg-white border-blue-200 shadow-sm text-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}
          >
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Investigation Details</p>
              <p className="font-medium text-xs leading-relaxed max-w-2xl">{caseItem.description}</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-semibold">
              <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-bold ${
                themeMode === 'bright'
                  ? 'bg-blue-100/90 border-blue-300 text-blue-950 shadow-xs'
                  : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}>
                <Calendar className={`w-3.5 h-3.5 ${themeMode === 'bright' ? 'text-blue-700' : 'text-yellow-400'}`} />
                <span>Assigned: {caseItem.dateAssigned}</span>
              </div>
              <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-bold ${
                themeMode === 'bright'
                  ? 'bg-blue-100/90 border-blue-300 text-blue-950 shadow-xs'
                  : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}>
                <UserCheck className={`w-3.5 h-3.5 ${themeMode === 'bright' ? 'text-blue-700' : 'text-yellow-400'}`} />
                <span>Host: {caseItem.assignedHostName || 'Unassigned'}</span>
              </div>
            </div>
          </div>

          {/* Solved Status Lock Banner */}
          {caseItem.status === 'Solved' && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>🔒 Case is Solved — Timeline entries are locked and cannot be added or edited.</span>
            </div>
          )}

          {/* Action Bar to Add New Entry */}
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className={`text-sm font-black uppercase tracking-wider flex items-center space-x-2 ${
              themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
            }`}>
              <Clock className="w-4 h-4" />
              <span>Case Sequential Timeline</span>
            </h3>

            {caseItem.status !== 'Solved' && (
              <button
                type="button"
                onClick={handleToggleAddForm}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer ${
                  showAddForm
                    ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                    : themeMode === 'bright'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>{showAddForm ? 'Cancel Add Entry' : '+ Add Details to Timeline'}</span>
              </button>
            )}
          </div>

          {/* Expandable Add Entry Form */}
          {caseItem.status !== 'Solved' && showAddForm && (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className={`p-4 sm:p-5 rounded-2xl border space-y-4 animate-fadeIn ${
                themeMode === 'bright'
                  ? 'bg-sky-50/80 border-blue-300 shadow-md text-slate-900'
                  : 'bg-slate-900 border-yellow-500/40 text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <span>{editingEntryId ? '✏️ Edit Timeline Entry Details' : '➕ Add Investigation Progress Details'}</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-medium">Recorded sequentially into case record</span>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-[11px] font-bold mb-1.5 text-slate-600 dark:text-slate-400">
                  Quick Event Presets:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { title: 'Crime Scene Visited', desc: 'Scene secured and initial physical observations recorded.' },
                    { title: 'Evidence Collected', desc: 'New physical/digital evidence items retrieved and logged.' },
                    { title: 'Witness Statements', desc: 'Statements officially recorded from key witnesses.' },
                    { title: 'Forensic Report Requested', desc: 'Samples submitted for forensic laboratory analysis.' },
                    { title: 'Interrogation Conducted', desc: 'Suspect interrogated; statement recorded on record.' },
                    { title: 'Bail Objection Filed', desc: 'Legal objection filed against bail in court.' },
                  ].map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => handlePresetClick(preset.title, preset.desc)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        themeMode === 'bright'
                          ? 'bg-white hover:bg-blue-600 hover:text-white border-blue-200 text-blue-900'
                          : 'bg-slate-800 hover:bg-yellow-500 hover:text-slate-950 border-slate-700 text-slate-300'
                      }`}
                    >
                      + {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Event Title *</label>
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Crime Scene Visited, Witness Statements..."
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                      themeMode === 'bright'
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 shadow-xs'
                        : 'bg-slate-950 border-slate-700 text-slate-100 focus:border-yellow-400'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Date & Time *</label>
                  <input
                    type="text"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    placeholder="e.g. 10 Aug 2026, 11:15 AM"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                      themeMode === 'bright'
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 shadow-xs'
                        : 'bg-slate-950 border-slate-700 text-slate-100 focus:border-yellow-400'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Officer / Investigator Name *</label>
                  <input
                    type="text"
                    value={performerName}
                    readOnly
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none cursor-not-allowed opacity-90 font-bold ${
                      themeMode === 'bright'
                        ? 'bg-slate-100 border-slate-300 text-slate-800 shadow-xs'
                        : 'bg-slate-900 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Role / Designation</label>
                  <input
                    type="text"
                    value={performerRole}
                    readOnly
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none cursor-not-allowed opacity-90 font-bold ${
                      themeMode === 'bright'
                        ? 'bg-slate-100 border-slate-300 text-slate-800 shadow-xs'
                        : 'bg-slate-900 border-slate-700 text-slate-200'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1">Event Description & Observations *</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter detailed facts, findings, evidence notes, or action taken..."
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none ${
                      themeMode === 'bright'
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 shadow-xs'
                        : 'bg-slate-950 border-slate-700 text-slate-100 focus:border-yellow-400'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingEntryId(null);
                    setShowAddForm(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                    themeMode === 'bright'
                      ? 'bg-white hover:bg-slate-200 text-slate-800 border border-slate-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer ${
                    themeMode === 'bright'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
                  }`}
                >
                  {editingEntryId ? 'Save Changes to Entry' : 'Save Entry to Timeline'}
                </button>
              </div>
            </form>
          )}

          {/* Timeline View List */}
          <div className="pl-2 sm:pl-4 pr-1 py-2 relative">
            {/* Sequential Line */}
            <div
              className={`absolute left-[19px] sm:left-[27px] top-6 bottom-8 w-0.5 ${
                themeMode === 'bright'
                  ? 'bg-blue-300'
                  : 'bg-slate-700'
              }`}
            />

            <div className="space-y-6">
              {timelineList.map((entry, idx) => {
                const isCaseRegistered = entry.title.toLowerCase().includes('case registered') || entry.title.toLowerCase().includes('fir registered') || (idx === 0 && entry.title.toLowerCase().includes('registered'));
                const isSolved = caseItem.status === 'Solved';

                return (
                  <div key={entry.id || idx} className="relative flex items-start space-x-4 group">
                    {/* Bullet Symbol ● */}
                    <div className="relative z-10 flex-shrink-0 mt-0.5">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-110 ${
                          themeMode === 'bright'
                            ? 'bg-blue-600 text-white ring-4 ring-sky-100'
                            : 'bg-yellow-500 text-slate-950 ring-4 ring-slate-900'
                        }`}
                      >
                        ●
                      </div>
                    </div>

                    {/* Card Content */}
                    <div
                      className={`flex-1 p-4 rounded-2xl border transition-all ${
                        themeMode === 'bright'
                          ? 'bg-white border-slate-200 shadow-sm hover:border-blue-300'
                          : 'bg-slate-900/90 border-slate-800 hover:border-yellow-500/30'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className={`font-mono text-[11px] font-extrabold flex items-center space-x-1 ${
                            themeMode === 'bright' ? 'text-blue-700' : 'text-yellow-400'
                          }`}>
                            <Calendar className="w-3 h-3 mr-1 inline" />
                            {entry.timestamp}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isCaseRegistered && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                              🔒 Default Record
                            </span>
                          )}

                          {entry.statusTag && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                entry.statusTag === 'Completed'
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              ✓ {entry.statusTag}
                            </span>
                          )}

                          {!isSolved && !isCaseRegistered && (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(entry)}
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white border border-blue-400/40 shadow-xs flex items-center space-x-1 cursor-pointer transition-all"
                              title="Edit timeline entry"
                            >
                              <Pencil className="w-3 h-3 text-white" />
                              <span>Edit</span>
                            </button>
                          )}
                        </div>
                      </div>

                    <h4 className={`text-sm font-black mb-1 ${
                      themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'
                    }`}>
                      {entry.title}
                    </h4>

                    <p className={`text-xs leading-relaxed mb-3 ${
                      themeMode === 'bright' ? 'text-slate-700 font-medium' : 'text-slate-300'
                    }`}>
                      {entry.description}
                    </p>

                    <div className={`pt-2 border-t flex items-center justify-between text-[11px] font-semibold ${
                      themeMode === 'bright'
                        ? 'border-slate-100 text-slate-600'
                        : 'border-slate-800/80 text-slate-400'
                    }`}>
                      <span className="flex items-center space-x-1">
                        <Shield className="w-3.5 h-3.5 text-blue-500 dark:text-yellow-400" />
                        <span>Investigator / Person: <strong className={themeMode === 'bright' ? 'text-slate-900 font-bold' : 'text-slate-200'}>{entry.performerName}</strong> ({entry.performerRole || 'Officer'})</span>
                      </span>

                      <span className="text-[10px] opacity-70 font-mono">Entry #{idx + 1}</span>
                    </div>
                  </div>
                </div>
              );
            })}

              {/* Terminal Node: Either NEXT or Case Solved */}
              {caseItem.status === 'Solved' ? (
                <div className="relative flex items-start space-x-4">
                  <div className="relative z-10 flex-shrink-0 mt-0.5">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                        themeMode === 'bright'
                          ? 'border-emerald-600 text-white bg-emerald-600 shadow-sm'
                          : 'border-emerald-500 text-slate-950 bg-emerald-500 shadow-sm'
                      }`}
                    >
                      ✓
                    </div>
                  </div>

                  <div
                    className={`flex-1 p-3.5 rounded-2xl border-2 flex items-center justify-between ${
                      themeMode === 'bright'
                        ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-xs'
                        : 'bg-emerald-950/40 border-emerald-600/60 text-emerald-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 font-black text-xs sm:text-sm">
                      <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        themeMode === 'bright' ? 'text-emerald-700' : 'text-emerald-400'
                      }`} />
                      <span>Case Solved</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      themeMode === 'bright'
                        ? 'bg-emerald-200/80 text-emerald-950 border border-emerald-300'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      Investigation Closed
                    </span>
                  </div>
                </div>
              ) : (
                /* NEXT Node ○ */
                <div className="relative flex items-start space-x-4">
                  <div className="relative z-10 flex-shrink-0 mt-0.5">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-dashed ${
                        themeMode === 'bright'
                          ? 'border-blue-500 text-blue-600 bg-sky-50'
                          : 'border-yellow-500/60 text-yellow-400 bg-slate-900'
                      }`}
                    >
                      ○
                    </div>
                  </div>

                  <div
                    className={`flex-1 p-3.5 rounded-2xl border-2 border-dashed flex items-center ${
                      themeMode === 'bright'
                        ? 'bg-sky-50/60 border-blue-200 text-blue-900'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center space-x-2 font-bold text-xs">
                      <ArrowRightCircle className="w-4 h-4 text-blue-600 dark:text-yellow-400" />
                      <span>NEXT: Investigation in progress — awaiting next update</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between gap-3 ${
            themeMode === 'bright'
              ? 'bg-slate-100 border-slate-300'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <span className={`text-xs font-semibold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>
            Total Timeline Records: <strong>{timelineList.length}</strong>
          </span>

          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
              themeMode === 'bright'
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
};
