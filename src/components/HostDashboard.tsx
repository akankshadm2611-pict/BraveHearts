import React, { useState } from 'react';
import { Case, User, CrimeDistributionData, MonthlyCrimeData } from '../types';
import { DashboardCharts } from './DashboardCharts';
import { CrimeMap } from './CrimeMap';
import { Shield, UserPlus, ShieldAlert, FolderKanban, Users, Eye, Plus, CheckCircle2, AlertCircle, Trash2, UserX, PlusCircle, UserMinus } from 'lucide-react';

interface HostDashboardProps {
  currentUser: User;
  cases: Case[];
  officersList: User[];
  advocatesList: User[];
  onAddMemberToCase: (caseId: string, officerIds: string[], advocateIds: string[]) => void;
  onSelectCase: (c: Case) => void;
  onOpenSuspectManagement: () => void;
  distributionData: CrimeDistributionData[];
  monthlyData: MonthlyCrimeData[];
  themeMode?: 'dark' | 'bright';
}

export const HostDashboard: React.FC<HostDashboardProps> = ({
  currentUser,
  cases,
  officersList,
  advocatesList,
  onSelectCase,
  onOpenSuspectManagement,
  onAddMemberToCase,
  distributionData,
  monthlyData,
  themeMode = 'dark',
}) => {
  // Cases assigned to this Host by DSP
  const myAssignedCases = cases.filter(
    (c) =>
      (c.assignedHostId && c.assignedHostId === currentUser.id) ||
      (c.assignedHostName &&
        c.assignedHostName !== 'Unassigned' &&
        c.assignedHostName.toLowerCase().includes(currentUser.fullName.toLowerCase()))
  );

  const [assigningCase, setAssigningCase] = useState<Case | null>(null);
  const [selectedOfficerIds, setSelectedOfficerIds] = useState<string[]>([]);
  const [selectedAdvocateIds, setSelectedAdvocateIds] = useState<string[]>([]);

  const openAssignModal = (c: Case) => {
    setAssigningCase(c);
    setSelectedOfficerIds(c.assignedOfficerIds || []);
    setSelectedAdvocateIds(c.assignedAdvocateIds || []);
  };

  const handleSaveTeam = () => {
    if (!assigningCase) return;
    onAddMemberToCase(assigningCase.id, selectedOfficerIds, selectedAdvocateIds);
    setAssigningCase(null);
  };

  const handleRemoveOfficerDirectly = (c: Case, offId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newOfficerIds = c.assignedOfficerIds.filter((id) => id !== offId);
    onAddMemberToCase(c.id, newOfficerIds, c.assignedAdvocateIds);
  };

  const handleRemoveAdvocateDirectly = (c: Case, advId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newAdvocateIds = c.assignedAdvocateIds.filter((id) => id !== advId);
    onAddMemberToCase(c.id, c.assignedOfficerIds, newAdvocateIds);
  };

  const removeOfficerFromModal = (id: string) => {
    setSelectedOfficerIds((prev) => prev.filter((oId) => oId !== id));
  };

  const addOfficerInModal = (id: string) => {
    setSelectedOfficerIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const removeAdvocateFromModal = (id: string) => {
    setSelectedAdvocateIds((prev) => prev.filter((aId) => aId !== id));
  };

  const addAdvocateInModal = (id: string) => {
    setSelectedAdvocateIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleClearAllTeamModal = () => {
    setSelectedOfficerIds([]);
    setSelectedAdvocateIds([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Host Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-yellow-500/20 pb-4 sm:pb-6">
        <div>
          <h1 className={`text-lg sm:text-2xl md:text-3xl font-black flex items-center leading-tight ${themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'}`}>
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-yellow-500 shrink-0" />
            <span>Host Main Police Administration Dashboard</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 sm:mt-1.5 ${themeMode === 'bright' ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
            Manage DSP assigned cases, dispatch Police Officers & Advocates, verify applicants, and track suspects.
          </p>
        </div>
      </div>

      {/* Interactive Crime Hotspot Map */}
      <CrimeMap themeMode={themeMode} />

      {/* Analytics Charts */}
      <DashboardCharts
        distributionData={distributionData}
        monthlyData={monthlyData}
        themeMode={themeMode}
      />

      {/* Cases Assigned to Host by DSP */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={`text-lg sm:text-xl font-bold flex items-center ${themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'}`}>
            <FolderKanban className="w-5 h-5 mr-2" /> Cases Assigned to Host by DSP ({myAssignedCases.length})
          </h2>
        </div>

        {myAssignedCases.length === 0 ? (
          <div className={`p-8 sm:p-12 rounded-3xl border border-dashed text-center space-y-4 max-w-xl mx-auto my-6 ${
            themeMode === 'bright'
              ? 'bg-slate-50 border-slate-300 text-slate-800'
              : 'bg-slate-900/60 border-slate-800 text-slate-300'
          }`}>
            <FolderKanban className="w-12 h-12 text-amber-500/70 mx-auto" />
            <h3 className="text-lg font-bold text-amber-400">No Cases Allotted</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You currently have no cases allotted to your Host Inspector account. Once a DSP Superintendent assigns active investigation cases to you, they will be listed here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAssignedCases.map((c) => (
            <div
              key={c.id}
              className={`p-5 rounded-2xl border transition-all ${
                themeMode === 'bright'
                  ? 'bg-white border-2 border-slate-300 shadow-md text-slate-900'
                  : 'bg-slate-900/80 border-blue-900/50 text-slate-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                      themeMode === 'bright'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                    }`}>
                      {c.id}
                    </span>
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                      themeMode === 'bright'
                        ? 'bg-slate-200 text-slate-800 border border-slate-300'
                        : 'text-slate-300 bg-slate-800'
                    }`}>
                      {c.crimeType}
                    </span>
                  </div>
                  <h3
                    onClick={() => onSelectCase(c)}
                    className={`text-base sm:text-lg font-extrabold hover:text-yellow-500 cursor-pointer transition-colors ${
                      themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'
                    }`}
                  >
                    {c.caseName}
                  </h3>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    c.status === 'Solved'
                      ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/50'
                      : c.status === 'Active'
                      ? 'bg-red-500/20 text-red-600 border-red-500/50'
                      : 'bg-amber-500/20 text-amber-700 border-amber-500/50'
                  }`}
                >
                  {c.status}
                </span>
              </div>

              <p className={`text-xs sm:text-sm mt-2.5 line-clamp-2 ${themeMode === 'bright' ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
                {c.description}
              </p>

              {/* Assigned Members Summary & Quick Delete Pills */}
              <div className={`my-3 p-3.5 rounded-xl border text-xs sm:text-sm space-y-2.5 ${
                themeMode === 'bright'
                  ? 'bg-slate-100 border-slate-300 text-slate-900'
                  : 'bg-slate-950/60 border-blue-900/50 text-slate-300'
              }`}>
                {/* Police Officers */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[11px] text-blue-400 uppercase tracking-wider">
                      👮 Police Officers Assigned ({c.assignedOfficerIds.length})
                    </span>
                  </div>

                  {c.assignedOfficerIds.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {c.assignedOfficerIds.map((offId) => {
                        const off = officersList.find((o) => o.id === offId);
                        const name = off ? off.fullName : offId;
                        return (
                          <span
                            key={offId}
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold"
                          >
                            <span>{name}</span>
                            <button
                              type="button"
                              onClick={(e) => handleRemoveOfficerDirectly(c, offId, e)}
                              className="p-0.5 hover:bg-red-500/30 text-red-400 rounded-full transition-colors"
                              title="Delete / Remove Police Officer from case"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No police officers assigned</p>
                  )}
                </div>

                {/* Advocates */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[11px] text-purple-400 uppercase tracking-wider">
                      ⚖️ Advocates Assigned ({c.assignedAdvocateIds.length})
                    </span>
                  </div>

                  {c.assignedAdvocateIds.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {c.assignedAdvocateIds.map((advId) => {
                        const adv = advocatesList.find((a) => a.id === advId);
                        const name = adv ? adv.fullName : advId;
                        return (
                          <span
                            key={advId}
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold"
                          >
                            <span>{name}</span>
                            <button
                              type="button"
                              onClick={(e) => handleRemoveAdvocateDirectly(c, advId, e)}
                              className="p-0.5 hover:bg-red-500/30 text-red-400 rounded-full transition-colors"
                              title="Delete / Remove Advocate from case"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No advocates assigned</p>
                  )}
                </div>
              </div>

              <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-3 border-t ${
                themeMode === 'bright' ? 'border-slate-300' : 'border-slate-800/80'
              }`}>
                <button
                  onClick={() => openAssignModal(c)}
                  className={`px-3.5 py-2 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all shrink-0 ${
                    themeMode === 'bright'
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm'
                      : 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/40'
                  }`}
                >
                  <UserPlus className="w-4 h-4 shrink-0" />
                  <span>Manage / Assign Team</span>
                </button>

                <button
                  onClick={() => onSelectCase(c)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center space-x-1 transition-all shrink-0 ${
                    themeMode === 'bright'
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-400'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Modal to Assign/Delete Police Officers and Advocates */}
      {assigningCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div
            className={`relative w-full max-w-xl my-auto rounded-2xl border shadow-2xl overflow-hidden transition-all ${
              themeMode === 'bright'
                ? 'bg-slate-50 text-slate-900 border-slate-300'
                : 'bg-slate-950 text-slate-100 border-yellow-500/30'
            }`}
          >
            <div className={`p-5 border-b flex items-center justify-between ${
              themeMode === 'bright'
                ? 'bg-gradient-to-r from-sky-100 via-blue-50 to-white border-slate-200 text-blue-950'
                : 'bg-slate-900 border-yellow-500/20 text-yellow-400'
            }`}>
              <div>
                <span className={`text-[10px] font-mono ${
                  themeMode === 'bright' ? 'text-blue-700 font-bold' : 'text-yellow-400'
                }`}>{assigningCase.id}</span>
                <h3 className={`text-base font-bold ${
                  themeMode === 'bright' ? 'text-blue-950 font-black' : 'text-yellow-400'
                }`}>Manage Case Investigation Team</h3>
                <p className={`text-[11px] ${
                  themeMode === 'bright' ? 'text-slate-600 font-medium' : 'text-slate-400'
                }`}>Remove existing officers/advocates or assign new ones.</p>
              </div>
              <button
                onClick={() => setAssigningCase(null)}
                className={`p-1.5 rounded-full transition-colors ${
                  themeMode === 'bright'
                    ? 'hover:bg-slate-200/80 text-slate-700'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
              {/* POLICE OFFICERS SECTION */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                themeMode === 'bright'
                  ? 'bg-sky-50/70 border-blue-200 text-slate-900 shadow-sm'
                  : 'bg-slate-900 border-blue-900/40'
              }`}>
                <h4 className={`font-extrabold uppercase tracking-wider text-xs flex items-center justify-between ${
                  themeMode === 'bright' ? 'text-blue-900' : 'text-blue-400'
                }`}>
                  <span>👮 Police Officers</span>
                  <span className={`text-[10px] font-bold ${
                    themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {selectedOfficerIds.length} Assigned
                  </span>
                </h4>

                {/* Currently Assigned Officers */}
                {selectedOfficerIds.length > 0 && (
                  <div className="space-y-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                      themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                    }`}>Currently Assigned:</span>
                    <div className="space-y-1.5">
                      {selectedOfficerIds.map((offId) => {
                        const off = officersList.find((o) => o.id === offId);
                        return (
                          <div
                            key={`assigned-off-${offId}`}
                            className={`p-2.5 rounded-lg border flex items-center justify-between ${
                              themeMode === 'bright'
                                ? 'bg-white border-blue-200 text-slate-900 shadow-xs'
                                : 'bg-blue-950/60 border-blue-800'
                            }`}
                          >
                            <div>
                              <p className={`font-bold ${themeMode === 'bright' ? 'text-blue-950' : 'text-blue-200'}`}>{off?.fullName || offId}</p>
                              <p className={`text-[10px] ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>{off?.department} • Badge: {off?.badgeId}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeOfficerFromModal(offId)}
                              className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/40 rounded-md font-bold text-[11px] flex items-center space-x-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete / Remove</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Police Officers to Add / Replace */}
                <div className="space-y-1.5 pt-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                    themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    Available Officers (Click to Add or Replace):
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {officersList
                      .filter((off) => !selectedOfficerIds.includes(off.id))
                      .map((off) => (
                        <div
                          key={`avail-off-${off.id}`}
                          onClick={() => addOfficerInModal(off.id)}
                          className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                            themeMode === 'bright'
                              ? 'bg-white border-slate-300 hover:border-blue-400 hover:bg-sky-100/40 text-slate-900'
                              : 'bg-slate-950 border-slate-800 hover:border-blue-500/50 text-slate-100'
                          }`}
                        >
                          <div>
                            <p className={`font-bold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>{off.fullName}</p>
                            <p className={`text-[10px] ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>{off.department} • Badge: {off.badgeId}</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addOfficerInModal(off.id);
                            }}
                            className={`px-2.5 py-1 rounded-md font-bold text-[11px] flex items-center space-x-1 ${
                              themeMode === 'bright'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                                : 'bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 border border-blue-500/40'
                            }`}
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>+ Add Officer</span>
                          </button>
                        </div>
                      ))}
                    {officersList.filter((off) => !selectedOfficerIds.includes(off.id)).length === 0 && (
                      <p className={`text-[11px] italic ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-500'}`}>All available police officers are assigned.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ADVOCATES SECTION */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                themeMode === 'bright'
                  ? 'bg-sky-50/70 border-blue-200 text-slate-900 shadow-sm'
                  : 'bg-slate-900 border-purple-900/40'
              }`}>
                <h4 className={`font-extrabold uppercase tracking-wider text-xs flex items-center justify-between ${
                  themeMode === 'bright' ? 'text-purple-900' : 'text-purple-400'
                }`}>
                  <span>⚖️ Advocates</span>
                  <span className={`text-[10px] font-bold ${
                    themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {selectedAdvocateIds.length} Assigned
                  </span>
                </h4>

                {/* Currently Assigned Advocates */}
                {selectedAdvocateIds.length > 0 && (
                  <div className="space-y-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                      themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                    }`}>Currently Assigned:</span>
                    <div className="space-y-1.5">
                      {selectedAdvocateIds.map((advId) => {
                        const adv = advocatesList.find((a) => a.id === advId);
                        return (
                          <div
                            key={`assigned-adv-${advId}`}
                            className={`p-2.5 rounded-lg border flex items-center justify-between ${
                              themeMode === 'bright'
                                ? 'bg-white border-purple-200 text-slate-900 shadow-xs'
                                : 'bg-purple-950/60 border-purple-800'
                            }`}
                          >
                            <div>
                              <p className={`font-bold ${themeMode === 'bright' ? 'text-purple-950' : 'text-purple-200'}`}>{adv?.fullName || advId}</p>
                              <p className={`text-[10px] ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>{adv?.department} • Bar ID: {adv?.badgeId}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAdvocateFromModal(advId)}
                              className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/40 rounded-md font-bold text-[11px] flex items-center space-x-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete / Remove</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Advocates to Add / Replace */}
                <div className="space-y-1.5 pt-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                    themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    Available Advocates (Click to Add or Replace):
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {advocatesList
                      .filter((adv) => !selectedAdvocateIds.includes(adv.id))
                      .map((adv) => (
                        <div
                          key={`avail-adv-${adv.id}`}
                          onClick={() => addAdvocateInModal(adv.id)}
                          className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                            themeMode === 'bright'
                              ? 'bg-white border-slate-300 hover:border-purple-400 hover:bg-purple-50/40 text-slate-900'
                              : 'bg-slate-950 border-slate-800 hover:border-purple-500/50 text-slate-100'
                          }`}
                        >
                          <div>
                            <p className={`font-bold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-200'}`}>{adv.fullName}</p>
                            <p className={`text-[10px] ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>{adv.department} • Bar: {adv.badgeId}</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addAdvocateInModal(adv.id);
                            }}
                            className={`px-2.5 py-1 rounded-md font-bold text-[11px] flex items-center space-x-1 ${
                              themeMode === 'bright'
                                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                                : 'bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/40'
                            }`}
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>+ Add Advocate</span>
                          </button>
                        </div>
                      ))}
                    {advocatesList.filter((adv) => !selectedAdvocateIds.includes(adv.id)).length === 0 && (
                      <p className={`text-[11px] italic ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-500'}`}>All available advocates are assigned.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-4 border-t flex items-center justify-between ${
              themeMode === 'bright'
                ? 'bg-slate-100 border-slate-200'
                : 'bg-slate-900 border-slate-800'
            }`}>
              <button
                type="button"
                onClick={handleClearAllTeamModal}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                  themeMode === 'bright'
                    ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-300'
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All Team Members</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setAssigningCase(null)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                    themeMode === 'bright'
                      ? 'bg-white hover:bg-slate-200 text-slate-800 border border-slate-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTeam}
                  className={`px-5 py-2 font-bold rounded-lg text-xs shadow-md ${
                    themeMode === 'bright'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
                  }`}
                >
                  Save Team & Publish Case Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
