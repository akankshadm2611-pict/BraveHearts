import React, { useState } from 'react';
import { Case, Suspect, SuspectStatus, User } from '../types';
import { UserX, Plus, Edit3, Check, X, ShieldAlert, UserPlus, Save, CheckCircle2 } from 'lucide-react';

interface CaseSuspectModalProps {
  c: Case | null;
  isOpen: boolean;
  onClose: () => void;
  suspects: Suspect[];
  currentUser: User;
  onManageCaseSuspects: (caseId: string, suspectIds: string[]) => void;
  onCreateSuspect: (newSuspect: Suspect) => void;
  onUpdateSuspect: (updatedSuspect: Suspect) => void;
  themeMode?: 'dark' | 'bright';
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
];

export const CaseSuspectModal: React.FC<CaseSuspectModalProps> = ({
  c,
  isOpen,
  onClose,
  suspects,
  currentUser,
  onManageCaseSuspects,
  onCreateSuspect,
  onUpdateSuspect,
  themeMode = 'dark',
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'create' | 'edit'>('link');
  
  // Currently linked suspect IDs state for editing selection
  const linkedSuspects = c ? suspects.filter((s) => s.linkedCaseIds.includes(c.id)) : [];
  const [selectedIds, setSelectedIds] = useState<string[]>(
    c ? suspects.filter((s) => s.linkedCaseIds.includes(c.id)).map((s) => s.id) : []
  );

  // Editing suspect state
  const [editingSuspect, setEditingSuspect] = useState<Suspect | null>(null);

  // New suspect form state
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState<number>(30);
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [newCrime, setNewCrime] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newStatus, setNewStatus] = useState<SuspectStatus>('Under Investigation');
  const [newPhotoUrl, setNewPhotoUrl] = useState(PRESET_AVATARS[0]);

  if (!isOpen || !c) return null;

  const handleToggleSelect = (suspectId: string) => {
    if (selectedIds.includes(suspectId)) {
      setSelectedIds(selectedIds.filter((id) => id !== suspectId));
    } else {
      setSelectedIds([...selectedIds, suspectId]);
    }
  };

  const handleSaveLinkedSuspects = () => {
    onManageCaseSuspects(c.id, selectedIds);
    onClose();
  };

  const handleCreateNewSuspectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newAddress.trim()) return;

    const newSuspectId = `SUS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSuspectObj: Suspect = {
      id: newSuspectId,
      fullName: newName.trim(),
      age: newAge,
      gender: newGender,
      crime: newCrime.trim() || c.crimeType,
      address: newAddress.trim(),
      status: newStatus,
      photoUrl: newPhotoUrl || PRESET_AVATARS[0],
      linkedCaseIds: [c.id],
      connectedSuspects: [],
      notes: `Created directly from Case ${c.id} by ${currentUser.fullName} (${currentUser.role}).`,
    };

    onCreateSuspect(newSuspectObj);
    setSelectedIds((prev) => [...prev, newSuspectId]);

    // Reset create form
    setNewName('');
    setNewAge(30);
    setNewCrime('');
    setNewAddress('');
    setActiveTab('link');
  };

  const handleUpdateSuspectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSuspect) return;

    onUpdateSuspect(editingSuspect);
    setEditingSuspect(null);
  };

  return (
    <div className="fixed inset-0 z-[2100] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className={`relative w-full max-w-2xl my-auto rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all ${
          themeMode === 'bright'
            ? 'bg-slate-50 text-slate-900 border-red-200'
            : 'bg-slate-950 text-slate-100 border-red-500/30'
        }`}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          themeMode === 'bright'
            ? 'bg-gradient-to-r from-red-100 via-rose-50 to-white border-red-200 text-red-950'
            : 'bg-slate-900 border-rose-500/30 text-rose-200'
        }`}>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                themeMode === 'bright' ? 'bg-red-200 text-red-950' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                Case: {c.id}
              </span>
              <span className={`text-xs font-bold ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>• {c.caseName}</span>
              {c.status === 'Solved' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  🔒 Case Solved
                </span>
              )}
            </div>
            <h3 className={`text-base sm:text-lg font-black flex items-center mt-1 ${
              themeMode === 'bright' ? 'text-red-950' : 'text-rose-200'
            }`}>
              <UserX className={`w-5 h-5 mr-2 ${themeMode === 'bright' ? 'text-red-600' : 'text-rose-400'}`} />
              <span>Add, Remove or Edit Case Suspects</span>
            </h3>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-full ${
              themeMode === 'bright' ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {c.status === 'Solved' && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>🔒 Case is Solved — Suspect management is locked for this case. Existing records are read-only.</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className={`flex border-b px-4 pt-3 gap-2 text-xs font-bold ${
          themeMode === 'bright' ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <button
            onClick={() => { setActiveTab('link'); setEditingSuspect(null); }}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'link'
                ? themeMode === 'bright' ? 'border-red-600 text-red-600 font-black' : 'border-rose-400 text-rose-300 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserX className="w-4 h-4" />
            <span>Linked Suspects ({selectedIds.length})</span>
          </button>

          {c.status !== 'Solved' && (
            <button
              onClick={() => { setActiveTab('create'); setEditingSuspect(null); }}
              className={`pb-2.5 px-3 border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'create'
                  ? themeMode === 'bright' ? 'border-red-600 text-red-600 font-black' : 'border-rose-400 text-rose-300 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Create New Suspect</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: Link/Unlink Existing & Edit linked suspects */}
          {activeTab === 'link' && !editingSuspect && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className={`font-semibold ${themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Select suspects involved in this case from the database or edit suspect details:
                </p>
                {c.status !== 'Solved' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('create')}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-[11px] flex items-center space-x-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Suspect</span>
                  </button>
                )}
              </div>

              {suspects.length === 0 ? (
                <div className="p-6 text-center border border-dashed rounded-xl text-slate-400">
                  No suspects in database yet. Click "+ Create New Suspect" above.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {suspects.map((s) => {
                    const isLinked = selectedIds.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-2 ${
                          isLinked
                            ? themeMode === 'bright'
                              ? 'bg-red-50 border-red-300 text-slate-900 shadow-sm'
                              : 'bg-rose-950/30 border-rose-500/60 text-slate-100 ring-1 ring-rose-500/30'
                            : themeMode === 'bright'
                            ? 'bg-white border-slate-200 text-slate-800'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isLinked}
                            onChange={() => c.status !== 'Solved' && handleToggleSelect(s.id)}
                            disabled={c.status === 'Solved'}
                            className="mt-1 rounded text-red-600 focus:ring-red-500 cursor-pointer disabled:cursor-not-allowed"
                          />
                          <img
                            src={s.photoUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-extrabold text-xs truncate">{s.fullName}</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              {s.id} • {s.age} yrs • {s.status}
                            </div>
                            <div className={`text-[10px] font-bold truncate mt-0.5 ${
                              themeMode === 'bright' ? 'text-red-700' : 'text-rose-300'
                            }`}>
                              📍 {s.address}
                            </div>
                          </div>
                        </div>

                        {c.status !== 'Solved' && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSuspect(s);
                              setActiveTab('edit');
                            }}
                            className={`p-1.5 rounded-lg border text-[11px] font-bold flex items-center space-x-1 shrink-0 ${
                              themeMode === 'bright'
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                            }`}
                            title="Edit suspect details"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-yellow-500" />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Create New Suspect Inline */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateNewSuspectSubmit} className="space-y-3.5">
              <div className={`p-3 rounded-xl border ${
                themeMode === 'bright' ? 'bg-red-50 border-red-200' : 'bg-rose-950/20 border-rose-900/40'
              }`}>
                <h4 className={`font-black text-xs uppercase tracking-wider flex items-center ${
                  themeMode === 'bright' ? 'text-red-700' : 'text-rose-300'
                }`}>
                  <UserPlus className="w-4 h-4 mr-1 text-rose-400" /> Create & Link New Suspect
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  This suspect will be added to the master database and linked to Case {c.id} automatically.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Suspect Full Name *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Vikram 'Viper' Malhotra"
                    className={`w-full px-3 py-2 rounded-lg text-xs border ${
                      themeMode === 'bright' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Age *</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(parseInt(e.target.value) || 25)}
                    min={12}
                    max={100}
                    className={`w-full px-3 py-2 rounded-lg text-xs border ${
                      themeMode === 'bright' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-lg text-xs border ${
                      themeMode === 'bright' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                    }`}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Current Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as SuspectStatus)}
                    className={`w-full px-3 py-2 rounded-lg text-xs border ${
                      themeMode === 'bright' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                    }`}
                  >
                    <option value="Wanted">Wanted</option>
                    <option value="Under Arrest">Under Arrest</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="On Bail">On Bail</option>
                    <option value="Missing">Missing</option>
                    <option value="Sentenced">Sentenced</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1">Crime / Allegations</label>
                  <input
                    type="text"
                    value={newCrime}
                    onChange={(e) => setNewCrime(e.target.value)}
                    placeholder={`e.g. Main Accused in ${c.crimeType}`}
                    className={`w-full px-3 py-2 rounded-lg text-xs border ${
                      themeMode === 'bright' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1">Last Known Address / Location *</label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="e.g. Flat 402, Block C, Silver Heights, Sector 14, Metro City"
                    className={`w-full px-3 py-2 rounded-lg text-xs border ${
                      themeMode === 'bright' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                    }`}
                    required
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-bold">Select Photo Avatar</label>
                  <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt=""
                        onClick={() => setNewPhotoUrl(url)}
                        className={`w-12 h-12 rounded-lg object-cover cursor-pointer border-2 transition-all ${
                          newPhotoUrl === url ? 'border-red-500 scale-105 shadow-md' : 'border-slate-700 opacity-60 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('link')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs shadow-md flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create & Link Suspect</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Edit Selected Suspect */}
          {editingSuspect && (
            <form onSubmit={handleUpdateSuspectSubmit} className="space-y-3.5">
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                themeMode === 'bright' ? 'bg-amber-50 border-amber-200' : 'bg-yellow-950/20 border-yellow-500/40'
              }`}>
                <div>
                  <span className="text-[10px] font-mono font-bold text-yellow-500">{editingSuspect.id}</span>
                  <h4 className="font-black text-xs text-yellow-400 uppercase tracking-wider">
                    Editing Suspect: {editingSuspect.fullName}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingSuspect(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={editingSuspect.fullName}
                    onChange={(e) => setEditingSuspect({ ...editingSuspect, fullName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg text-xs border ${
                      themeMode === 'bright' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Age *</label>
                  <input
                    type="number"
                    value={editingSuspect.age}
                    onChange={(e) => setEditingSuspect({ ...editingSuspect, age: parseInt(e.target.value) || 20 })}
                    className={`w-full px-3 py-2 rounded-lg text-xs border ${
                      themeMode === 'bright' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Status</label>
                  <select
                    value={editingSuspect.status}
                    onChange={(e) => setEditingSuspect({ ...editingSuspect, status: e.target.value as SuspectStatus })}
                    className={`w-full px-3 py-2 rounded-lg text-xs border ${
                      themeMode === 'bright' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                    }`}
                  >
                    <option value="Wanted">Wanted</option>
                    <option value="Under Arrest">Under Arrest</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="On Bail">On Bail</option>
                    <option value="Missing">Missing</option>
                    <option value="Sentenced">Sentenced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Gender</label>
                  <select
                    value={editingSuspect.gender}
                    onChange={(e) => setEditingSuspect({ ...editingSuspect, gender: e.target.value as any })}
                    className={`w-full px-3 py-2 rounded-lg text-xs border ${
                      themeMode === 'bright' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                    }`}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1">Crime / Allegation</label>
                  <input
                    type="text"
                    value={editingSuspect.crime}
                    onChange={(e) => setEditingSuspect({ ...editingSuspect, crime: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg text-xs border ${
                      themeMode === 'bright' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1">Address / Last Known Location</label>
                  <input
                    type="text"
                    value={editingSuspect.address}
                    onChange={(e) => setEditingSuspect({ ...editingSuspect, address: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg text-xs border ${
                      themeMode === 'bright' ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSuspect(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-lg text-xs shadow-md flex items-center space-x-1"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Suspect Edits</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'link' && !editingSuspect && (
          <div className={`p-4 border-t flex items-center justify-between ${
            themeMode === 'bright' ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <span className="text-[11px] font-bold text-slate-400">
              Selected Suspects for Case: {selectedIds.length}
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                {c.status === 'Solved' ? 'Close' : 'Cancel'}
              </button>
              {c.status !== 'Solved' && (
                <button
                  type="button"
                  onClick={handleSaveLinkedSuspects}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs shadow-md flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Case Suspects</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
