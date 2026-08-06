import React, { useState } from 'react';
import { Case, CrimeType, CaseStatus, Suspect, User, CrimeDistributionData, MonthlyCrimeData } from '../types';
import { DashboardCharts } from './DashboardCharts';
import { CrimeMap } from './CrimeMap';
import { Plus, Shield, Search, Filter, FolderKanban, CheckCircle2, Clock, AlertCircle, Eye, UserPlus, ShieldAlert, UserCheck, UserX, Trash2 } from 'lucide-react';

interface DspDashboardProps {
  cases: Case[];
  onCreateCase: (newCase: Case) => void;
  onUpdateCaseHost?: (caseId: string, hostId: string, hostName: string) => void;
  hostsList: User[];
  onSelectCase: (c: Case) => void;
  onOpenSuspectManagement: () => void;
  distributionData: CrimeDistributionData[];
  monthlyData: MonthlyCrimeData[];
  themeMode?: 'dark' | 'bright';
}

export const DspDashboard: React.FC<DspDashboardProps> = ({
  cases,
  onCreateCase,
  onUpdateCaseHost,
  hostsList,
  onSelectCase,
  onOpenSuspectManagement,
  distributionData,
  monthlyData,
  themeMode = 'dark',
}) => {
  const [showCreateCaseModal, setShowCreateCaseModal] = useState(false);
  const [managingHostCase, setManagingHostCase] = useState<Case | null>(null);
  const [selectedHostForReassign, setSelectedHostForReassign] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // New Case Form State
  const [crimeType, setCrimeType] = useState<CrimeType>('Armed Robbery');
  const [customCrimeType, setCustomCrimeType] = useState<string>('');
  const [dateAssigned, setDateAssigned] = useState<string>(new Date().toISOString().split('T')[0]);
  const [caseName, setCaseName] = useState('');
  const [description, setDescription] = useState('');
  const [assignedHostId, setAssignedHostId] = useState<string>(hostsList[0]?.id || 'u-host-1');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');

  // Stats calculation
  const totalCases = cases.length;
  const activeCases = cases.filter((c) => c.status === 'Active').length;
  const solvedCases = cases.filter((c) => c.status === 'Solved').length;
  const unsolvedCases = cases.filter((c) => c.status === 'Pending').length;
  const underInvestigationCases = cases.filter((c) => c.status === 'Under Investigation').length;

  const handleCreateCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseName.trim() || !description.trim()) return;
    if (crimeType === 'Other' && !customCrimeType.trim()) return;

    const selectedHostObj = hostsList.find((h) => h.id === assignedHostId) || hostsList[0];
    const finalCrimeType = crimeType === 'Other' ? (customCrimeType.trim() || 'Other') : crimeType;

    const newCase: Case = {
      id: `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      crimeType: finalCrimeType,
      dateAssigned,
      caseName: caseName.trim(),
      description: description.trim(),
      status: 'Active',
      assignedHostId: selectedHostObj ? selectedHostObj.id : 'u-host-1',
      assignedHostName: selectedHostObj ? selectedHostObj.fullName : 'Host Inspector Amit Verma',
      assignedOfficerIds: [],
      assignedOfficerNames: [],
      assignedAdvocateIds: [],
      assignedAdvocateNames: [],
      evidence: [],
      createdAt: new Date().toLocaleString(),
      priority,
    };

    onCreateCase(newCase);
    setShowCreateCaseModal(false);
    setCaseName('');
    setDescription('');
    setCustomCrimeType('');
    setCrimeType('Armed Robbery');
  };

  const handleOpenManageHostModal = (c: Case) => {
    setManagingHostCase(c);
    setSelectedHostForReassign(c.assignedHostId || (hostsList[0]?.id || ''));
  };

  const handleDeleteHostFromCase = (cId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onUpdateCaseHost?.(cId, '', 'Unassigned');
    if (managingHostCase && managingHostCase.id === cId) {
      setManagingHostCase(null);
    }
  };

  const handleSaveHostReassign = () => {
    if (!managingHostCase) return;
    const foundHost = hostsList.find((h) => h.id === selectedHostForReassign);
    if (foundHost) {
      onUpdateCaseHost?.(managingHostCase.id, foundHost.id, foundHost.fullName);
    } else {
      onUpdateCaseHost?.(managingHostCase.id, '', 'Unassigned');
    }
    setManagingHostCase(null);
  };

  const filteredCases = cases.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSearch =
      c.caseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.crimeType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* DSP Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-yellow-500/20 pb-4 sm:pb-6">
        <div>
          <h1 className={`text-lg sm:text-2xl md:text-3xl font-black flex items-center leading-tight ${themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'}`}>
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-yellow-500 shrink-0" />
            <span>DSP Command Headquarters Dashboard</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-1 sm:mt-1.5 ${themeMode === 'bright' ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
            Master jurisdiction crime overview, case creation, host assignment & suspect intelligence.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setShowCreateCaseModal(true)}
            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-yellow-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[3]" />
            <span>Create New Case</span>
          </button>
        </div>
      </div>

      {/* DSP Macro Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className={`p-4 rounded-2xl border transition-all ${themeMode === 'bright' ? 'bg-white border-2 border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-md'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs sm:text-sm font-bold uppercase ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>Total Cases</span>
            <FolderKanban className="w-5 h-5 text-yellow-500" />
          </div>
          <p className={`text-2xl sm:text-3xl font-black mt-2 ${themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'}`}>{totalCases}</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${themeMode === 'bright' ? 'bg-white border-2 border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-md'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs sm:text-sm font-bold uppercase ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>Active Cases</span>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-red-500 mt-2">{activeCases}</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${themeMode === 'bright' ? 'bg-white border-2 border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-md'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs sm:text-sm font-bold uppercase ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>Solved Cases</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-500 mt-2">{solvedCases}</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${themeMode === 'bright' ? 'bg-white border-2 border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-md'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs sm:text-sm font-bold uppercase ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>Unsolved (Pending)</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-500 mt-2">{unsolvedCases}</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-all col-span-2 sm:col-span-1 ${themeMode === 'bright' ? 'bg-white border-2 border-slate-300 shadow-md' : 'bg-slate-900/80 border-blue-900/50 shadow-md'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs sm:text-sm font-bold uppercase ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'}`}>Under Investigation</span>
            <Search className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-500 mt-2">{underInvestigationCases}</p>
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

      {/* Cases List & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className={`text-lg sm:text-xl font-bold flex items-center ${themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'}`}>
            <FolderKanban className="w-5 h-5 mr-2" /> Master Cases Ledger
          </h2>

          <div className="flex items-center space-x-3">
            {/* Filter Pills */}
            <div className={`flex items-center space-x-1 p-1 rounded-xl text-xs sm:text-sm border overflow-x-auto max-w-full ${
              themeMode === 'bright' ? 'bg-slate-200 border-slate-400' : 'bg-slate-900 border-blue-900/50'
            }`}>
              {['ALL', 'Active', 'Under Investigation', 'Solved', 'Pending'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-yellow-500 text-slate-950 shadow-md font-extrabold'
                      : themeMode === 'bright'
                      ? 'text-slate-800 hover:bg-slate-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Case Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCases.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCase(c)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] ${
                themeMode === 'bright'
                  ? 'bg-white border-2 border-slate-300 shadow-md hover:border-slate-400 hover:shadow-lg text-slate-900'
                  : 'bg-slate-900/80 border-blue-900/50 hover:bg-slate-900 hover:border-blue-700/60 text-slate-100'
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
                  <h3 className={`text-base sm:text-lg font-extrabold ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>
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

              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 mt-4 border-t text-xs sm:text-sm ${
                themeMode === 'bright' ? 'border-slate-300' : 'border-slate-800/80'
              }`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`font-bold ${themeMode === 'bright' ? 'text-amber-800' : 'text-amber-300/90'}`}>
                    Host: <span className="underline decoration-amber-500/40">{c.assignedHostName || 'Unassigned'}</span>
                  </span>

                  {/* DSP Host Management Actions (Reassign & Delete) */}
                  <div className="flex items-center space-x-1.5 ml-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenManageHostModal(c);
                      }}
                      className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all"
                      title="Reassign or change host for this case"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{c.assignedHostName && c.assignedHostName !== 'Unassigned' ? 'Reassign' : 'Assign'}</span>
                    </button>

                    {c.assignedHostName && c.assignedHostName !== 'Unassigned' && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteHostFromCase(c.id, e)}
                        className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all"
                        title="Delete assigned host from this case"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>

                <span className={`font-mono text-xs flex items-center font-bold ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-400'}`}>
                  <Eye className="w-4 h-4 mr-1 text-yellow-500" /> {c.evidence.length} Evidence
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DSP Create Case Modal */}
      {showCreateCaseModal && (
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
              <h3 className={`text-lg font-bold flex items-center ${
                themeMode === 'bright' ? 'text-blue-950 font-black' : 'text-yellow-400'
              }`}>
                <Shield className={`w-5 h-5 mr-2 ${themeMode === 'bright' ? 'text-blue-600' : ''}`} /> DSP Create & Assign New Case
              </h3>
              <button
                onClick={() => setShowCreateCaseModal(false)}
                className={`p-1.5 rounded-full ${
                  themeMode === 'bright'
                    ? 'hover:bg-slate-200/80 text-slate-700'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCaseSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${
                    themeMode === 'bright' ? 'text-slate-800' : ''
                  }`}>Crime Type *</label>
                  <select
                    value={crimeType}
                    onChange={(e) => setCrimeType(e.target.value as CrimeType)}
                    className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none ${
                      themeMode === 'bright'
                        ? 'bg-white border border-slate-300 text-slate-900 focus:border-blue-500 shadow-xs'
                        : 'bg-slate-900 border border-blue-900/60 text-slate-100 focus:border-yellow-500'
                    }`}
                  >
                    <option value="Armed Robbery">Armed Robbery</option>
                    <option value="Cyber Crime">Cyber Crime</option>
                    <option value="Narcotics">Narcotics</option>
                    <option value="Fraud">Fraud</option>
                    <option value="Homicide">Homicide</option>
                    <option value="Kidnapping">Kidnapping</option>
                    <option value="Human Trafficking">Human Trafficking</option>
                    <option value="Burglary">Burglary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {crimeType === 'Other' && (
                  <div className="sm:col-span-2">
                    <label className={`block text-xs font-semibold mb-1 ${
                      themeMode === 'bright' ? 'text-blue-950 font-bold' : 'text-yellow-400'
                    }`}>Specify Other Crime Type *</label>
                    <input
                      type="text"
                      value={customCrimeType}
                      onChange={(e) => setCustomCrimeType(e.target.value)}
                      placeholder="Enter custom crime type (e.g., Arson, Extortion, Smuggling...)"
                      className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none ${
                        themeMode === 'bright'
                          ? 'bg-white border border-blue-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 shadow-xs'
                          : 'bg-slate-900 border border-yellow-500/50 text-slate-100 placeholder-slate-500 focus:border-yellow-400'
                      }`}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${
                    themeMode === 'bright' ? 'text-slate-800' : ''
                  }`}>Date of Assigning *</label>
                  <input
                    type="date"
                    value={dateAssigned}
                    onChange={(e) => setDateAssigned(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-xs ${
                      themeMode === 'bright'
                        ? 'bg-white border border-slate-300 text-slate-900 shadow-xs'
                        : 'bg-slate-900 border border-slate-700 text-slate-100'
                    }`}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-xs font-semibold mb-1 ${
                    themeMode === 'bright' ? 'text-slate-800' : ''
                  }`}>Case Name *</label>
                  <input
                    type="text"
                    value={caseName}
                    onChange={(e) => setCaseName(e.target.value)}
                    placeholder="e.g. Operation GoldVault Syndicate"
                    className={`w-full px-3 py-2 rounded-lg text-xs ${
                      themeMode === 'bright'
                        ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs'
                        : 'bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500'
                    }`}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-xs font-semibold mb-1 ${
                    themeMode === 'bright' ? 'text-slate-800' : ''
                  }`}>Assign to Host Inspector *</label>
                  <select
                    value={assignedHostId}
                    onChange={(e) => setAssignedHostId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-bold ${
                      themeMode === 'bright'
                        ? 'bg-white border border-slate-300 text-blue-950 shadow-xs'
                        : 'bg-slate-900 border border-slate-700 text-slate-100 text-yellow-400'
                    }`}
                  >
                    {hostsList.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.fullName} ({h.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${
                    themeMode === 'bright' ? 'text-slate-800' : ''
                  }`}>Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-lg text-xs ${
                      themeMode === 'bright'
                        ? 'bg-white border border-slate-300 text-slate-900 shadow-xs'
                        : 'bg-slate-900 border border-slate-700 text-slate-100'
                    }`}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${
                  themeMode === 'bright' ? 'text-slate-800' : ''
                }`}>Small Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Key initial incident facts, venue, suspected damages..."
                  className={`w-full px-3 py-2 rounded-lg text-xs ${
                    themeMode === 'bright'
                      ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs'
                      : 'bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500'
                  }`}
                  required
                />
              </div>

              <div className={`flex justify-end space-x-2 pt-3 border-t ${
                themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setShowCreateCaseModal(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                    themeMode === 'bright'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
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
                  Create Case & Route to Host
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* DSP Reassign / Delete Host Modal */}
      {managingHostCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div
            className={`relative w-full max-w-md my-auto rounded-2xl border shadow-2xl overflow-hidden transition-all ${
              themeMode === 'bright'
                ? 'bg-slate-50 text-slate-900 border-slate-300'
                : 'bg-slate-950 text-slate-100 border-blue-900/60'
            }`}
          >
            <div className={`p-4 border-b flex items-center justify-between ${
              themeMode === 'bright'
                ? 'bg-gradient-to-r from-sky-100 via-blue-50 to-white border-slate-200 text-blue-950'
                : 'bg-slate-900 border-yellow-500/20 text-yellow-400'
            }`}>
              <div>
                <span className={`text-[10px] font-mono ${
                  themeMode === 'bright' ? 'text-blue-700 font-bold' : 'text-yellow-400'
                }`}>{managingHostCase.id}</span>
                <h3 className={`text-base font-bold flex items-center ${
                  themeMode === 'bright' ? 'text-blue-950 font-black' : 'text-yellow-400'
                }`}>
                  <UserCheck className={`w-4 h-4 mr-1.5 ${themeMode === 'bright' ? 'text-blue-600' : ''}`} /> Reassign or Delete Host
                </h3>
              </div>
              <button
                onClick={() => setManagingHostCase(null)}
                className={`p-1 rounded-full ${
                  themeMode === 'bright'
                    ? 'hover:bg-slate-200/80 text-slate-700'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Current Host Banner */}
              <div className={`p-3.5 rounded-xl border space-y-2 ${
                themeMode === 'bright'
                  ? 'bg-sky-50/70 border-blue-200 text-slate-900'
                  : 'bg-slate-900 border-slate-800'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                  themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'
                }`}>Current Assigned Host</span>
                <div className="flex items-center justify-between">
                  <p className={`font-extrabold text-sm ${
                    themeMode === 'bright' ? 'text-blue-950' : 'text-yellow-400'
                  }`}>
                    {managingHostCase.assignedHostName || 'Unassigned'}
                  </p>
                  {managingHostCase.assignedHostName && managingHostCase.assignedHostName !== 'Unassigned' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteHostFromCase(managingHostCase.id)}
                      className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/40 rounded-lg font-bold flex items-center space-x-1 transition-all text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Host</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Select Host list */}
              <div>
                <label className={`block text-xs font-bold mb-2 ${
                  themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'
                }`}>
                  Select Host to Assign or Replace:
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {hostsList.map((h) => {
                    const isSelected = selectedHostForReassign === h.id;
                    return (
                      <div
                        key={h.id}
                        onClick={() => setSelectedHostForReassign(h.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? themeMode === 'bright'
                              ? 'bg-blue-100/80 border-blue-500 text-blue-950 font-bold shadow-xs'
                              : 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : themeMode === 'bright'
                            ? 'bg-white border-slate-200 text-slate-900 hover:border-blue-300'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <p className={`text-xs font-bold ${themeMode === 'bright' ? 'text-slate-900' : ''}`}>{h.fullName}</p>
                          <p className={`text-[10px] ${themeMode === 'bright' ? 'text-slate-600' : 'text-slate-400'}`}>{h.department} • {h.email}</p>
                        </div>
                        <input
                          type="radio"
                          name="hostSelect"
                          checked={isSelected}
                          onChange={() => setSelectedHostForReassign(h.id)}
                          className="w-4 h-4 accent-blue-600"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={`flex items-center justify-end space-x-2 pt-3 border-t ${
                themeMode === 'bright' ? 'border-slate-200' : 'border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => setManagingHostCase(null)}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    themeMode === 'bright'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveHostReassign}
                  className={`px-5 py-2 font-bold rounded-lg shadow-md ${
                    themeMode === 'bright'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  Save Host Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
