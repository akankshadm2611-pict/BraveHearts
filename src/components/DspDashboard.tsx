import React, { useState } from 'react';
import { Case, CrimeType, CaseStatus, Suspect, User, CrimeDistributionData, MonthlyCrimeData, SuspectStatus } from '../types';
import { initialCrimeHotspots } from '../data/crimeHotspots';
import { DashboardCharts } from './DashboardCharts';
import { CrimeMap } from './CrimeMap';
import { CaseHeatmap } from './CaseHeatmap';
import { CaseSuspectModal } from './CaseSuspectModal';
import { Plus, Shield, Search, Filter, FolderKanban, CheckCircle2, Clock, AlertCircle, Eye, UserPlus, ShieldAlert, UserCheck, UserX, Trash2, MapPin } from 'lucide-react';

interface DspDashboardProps {
  cases: Case[];
  suspects?: Suspect[];
  onCreateCase: (newCase: Case) => void;
  onUpdateCaseHost?: (caseId: string, hostId: string, hostName: string) => void;
  hostsList: User[];
  onSelectCase: (c: Case) => void;
  onOpenSuspectManagement: () => void;
  onManageCaseSuspects?: (caseId: string, suspectIds: string[]) => void;
  onCreateSuspect?: (newSuspect: Suspect) => void;
  onUpdateSuspect?: (updatedSuspect: Suspect) => void;
  currentUser?: User;
  distributionData: CrimeDistributionData[];
  monthlyData: MonthlyCrimeData[];
  themeMode?: 'dark' | 'bright';
}

export const DspDashboard: React.FC<DspDashboardProps> = ({
  cases,
  suspects = [],
  onCreateCase,
  onUpdateCaseHost,
  hostsList,
  onSelectCase,
  onOpenSuspectManagement,
  onManageCaseSuspects,
  onCreateSuspect,
  onUpdateSuspect,
  currentUser,
  distributionData,
  monthlyData,
  themeMode = 'dark',
}) => {
  const [showCreateCaseModal, setShowCreateCaseModal] = useState(false);
  const [managingHostCase, setManagingHostCase] = useState<Case | null>(null);
  const [suspectModalCase, setSuspectModalCase] = useState<Case | null>(null);
  const [selectedHostForReassign, setSelectedHostForReassign] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // New Case Form State
  const [crimeType, setCrimeType] = useState<CrimeType>('Armed Robbery');
  const [customCrimeType, setCustomCrimeType] = useState<string>('');
  const [dateAssigned, setDateAssigned] = useState<string>(new Date().toISOString().split('T')[0]);
  const [caseName, setCaseName] = useState('');
  const [victimName, setVictimName] = useState('');
  const [witnessName, setWitnessName] = useState('');
  const [location, setLocation] = useState('Downtown Central Financial Sector, Sector 12, Metro City');
  const [description, setDescription] = useState('');
  const [assignedHostId, setAssignedHostId] = useState<string>(hostsList[0]?.id || 'u-host-1');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [selectedSuspectIds, setSelectedSuspectIds] = useState<string[]>([]);
  const [suspectValidationError, setSuspectValidationError] = useState('');

  // Inline Suspect Creation Form State inside Create Case Modal
  const [showInlineNewSuspect, setShowInlineNewSuspect] = useState(false);
  const [inlineSuspectName, setInlineSuspectName] = useState('');
  const [inlineSuspectAge, setInlineSuspectAge] = useState<number>(30);
  const [inlineSuspectGender, setInlineSuspectGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [inlineSuspectStatus, setInlineSuspectStatus] = useState<SuspectStatus>('Under Investigation');
  const [inlineSuspectAddress, setInlineSuspectAddress] = useState('');

  const handleAddInlineSuspect = () => {
    if (!inlineSuspectName.trim() || !inlineSuspectAddress.trim()) {
      alert('Please enter Suspect Name and Address');
      return;
    }

    const newSuspectId = `SUS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSuspectObj: Suspect = {
      id: newSuspectId,
      fullName: inlineSuspectName.trim(),
      age: inlineSuspectAge,
      gender: inlineSuspectGender,
      crime: crimeType === 'Other' ? customCrimeType || 'Other Crime' : crimeType,
      address: inlineSuspectAddress.trim(),
      status: inlineSuspectStatus,
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      linkedCaseIds: [],
      connectedSuspects: [],
      notes: 'Created directly during Case creation by DSP.',
    };

    if (onCreateSuspect) {
      onCreateSuspect(newSuspectObj);
    }
    setSelectedSuspectIds((prev) => [...prev, newSuspectId]);
    setSuspectValidationError('');

    // Reset inline form
    setInlineSuspectName('');
    setInlineSuspectAddress('');
    setShowInlineNewSuspect(false);
  };

  // Stats calculation
  const totalCases = cases.length;
  const activeCases = cases.filter((c) => c.status === 'Active').length;
  const solvedCases = cases.filter((c) => c.status === 'Solved').length;
  const unsolvedCases = cases.filter((c) => c.status === 'Pending').length;
  const underInvestigationCases = cases.filter((c) => c.status === 'Under Investigation').length;

  const handleCreateCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseName.trim() || !victimName.trim() || !description.trim()) return;
    if (crimeType === 'Other' && !customCrimeType.trim()) return;

    const selectedHostObj = hostsList.find((h) => h.id === assignedHostId) || hostsList[0];
    const finalCrimeType = crimeType === 'Other' ? (customCrimeType.trim() || 'Other') : crimeType;
    const finalLocation = location.trim() || 'Downtown Central Financial Sector, Sector 12, Metro City';

    // Match location with hotspot center for map pin rendering
    const matchedHs = initialCrimeHotspots.find((hs) =>
      finalLocation.toLowerCase().includes(hs.areaName.toLowerCase()) ||
      (hs.areaName.toLowerCase().split(' ')[0].length > 3 && finalLocation.toLowerCase().includes(hs.areaName.toLowerCase().split(' ')[0]))
    );
    const caseCoords: [number, number] = matchedHs
      ? [matchedHs.center[0] + (Math.random() - 0.5) * 0.004, matchedHs.center[1] + (Math.random() - 0.5) * 0.004]
      : [18.940 + (Math.random() - 0.5) * 0.01, 72.835 + (Math.random() - 0.5) * 0.01];

    const newCaseId = `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCase: Case = {
      id: newCaseId,
      crimeType: finalCrimeType,
      dateAssigned,
      caseName: caseName.trim(),
      victimName: victimName.trim(),
      witnessName: witnessName.trim() || undefined,
      location: finalLocation,
      coordinates: caseCoords,
      description: description.trim(),
      status: 'Pending', // Default status when created
      assignedHostId: selectedHostObj ? selectedHostObj.id : 'u-host-1',
      assignedHostName: selectedHostObj ? selectedHostObj.fullName : 'Host Inspector Amit Verma',
      assignedOfficerIds: [],
      assignedOfficerNames: [],
      assignedAdvocateIds: [],
      assignedAdvocateNames: [],
      evidence: [],
      createdAt: new Date().toLocaleString(),
      priority,
      timeline: [
        {
          id: `tl-${newCaseId}-1`,
          timestamp: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          title: 'Case Registered',
          description: `Complaint / FIR officially registered in the portal. Victim: ${victimName.trim()}. Investigation initialized in Pending state.`,
          performerName: 'DSP Admin',
          performerRole: 'DSP',
          statusTag: 'Pending',
        },
      ],
    };

    onCreateCase(newCase);

    if (selectedSuspectIds.length > 0 && onManageCaseSuspects) {
      onManageCaseSuspects(newCaseId, selectedSuspectIds);
    }

    // Reset state
    setCaseName('');
    setVictimName('');
    setWitnessName('');
    setCustomCrimeType('');
    setDescription('');
    setSelectedSuspectIds([]);
    setSuspectValidationError('');
    setShowCreateCaseModal(false);

    // Pre-populate investigation progress in localStorage
    const initialStepsForNewCase = [
      { id: `step-1-${Date.now()}`, label: 'Complaint / FIR Registered', completed: true },
      { id: `step-2-${Date.now()}`, label: 'Crime Scene Examination', completed: false },
      { id: `step-3-${Date.now()}`, label: 'Evidence Collected & Documented', completed: false },
      { id: `step-4-${Date.now()}`, label: 'Witness Statements Recorded', completed: false },
      { id: `step-5-${Date.now()}`, label: 'Suspect(s) Identified', completed: false },
      { id: `step-6-${Date.now()}`, label: 'Suspect Investigation Completed', completed: false },
      { id: `step-7-${Date.now()}`, label: 'Forensic / Lab Reports Received', completed: false },
      { id: `step-8-${Date.now()}`, label: 'Evidence Correlation Completed', completed: false },
      { id: `step-9-${Date.now()}`, label: 'Investigation Report Prepared', completed: false },
      { id: `step-10-${Date.now()}`, label: 'Final Review Completed', completed: false, isFixedEnd: true },
    ];
    try {
      localStorage.setItem(`investigation_progress_${newCase.id}`, JSON.stringify(initialStepsForNewCase));
    } catch (e) {
      console.error('Failed to set initial investigation progress', e);
    }
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

      {/* Interactive Crime Hotspot Map & Case Registration Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch my-6">
        <div className="flex flex-col min-w-0 h-full">
          <CrimeMap cases={cases} suspects={suspects} onSelectCase={onSelectCase} themeMode={themeMode} />
        </div>
        <div className="flex flex-col min-w-0 h-full">
          <CaseHeatmap cases={cases} themeMode={themeMode} />
        </div>
      </div>

      {/* Analytics Charts */}
      <DashboardCharts
        distributionData={distributionData}
        monthlyData={monthlyData}
        themeMode={themeMode}
      />

      {/* Cases List & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <h2 className={`text-lg sm:text-xl font-bold flex items-center ${themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'}`}>
            <FolderKanban className="w-5 h-5 mr-2 shrink-0" /> Master Cases Ledger ({filteredCases.length})
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Pills */}
            <div className={`flex items-center space-x-1 p-1 rounded-xl text-xs sm:text-sm border overflow-x-auto max-w-full ${
              themeMode === 'bright' ? 'bg-slate-200 border-slate-400' : 'bg-slate-900 border-blue-900/50'
            }`}>
              {['ALL', 'Active', 'Under Investigation', 'Solved', 'Pending'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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

            {/* Search Bar beside the Filter */}
            <div className="relative min-w-[200px] sm:min-w-[240px] flex-1 sm:flex-initial">
              <Search className={`w-4 h-4 absolute left-3 top-2.5 ${themeMode === 'bright' ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search case name, ID, or crime..."
                className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium transition-all focus:outline-none ${
                  themeMode === 'bright'
                    ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:ring-1 focus:ring-amber-600'
                    : 'bg-slate-900 border-blue-900/50 text-white placeholder:text-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Case Cards Grid */}
        {filteredCases.length === 0 ? (
          <div className={`p-8 rounded-2xl border border-dashed text-center space-y-2 my-4 ${
            themeMode === 'bright' ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-900/40 border-slate-800 text-slate-400'
          }`}>
            <Search className="w-8 h-8 text-yellow-500 mx-auto" />
            <h4 className="text-sm font-bold">No Matching Cases Found</h4>
            <p className="text-xs text-slate-500">Try adjusting your completion status filter or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCases.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCase(c)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] ${
                themeMode === 'bright'
                  ? 'bg-gradient-to-r from-sky-100/80 via-blue-50/50 to-white border-2 border-sky-200 shadow-md hover:border-blue-300 hover:shadow-lg text-slate-900'
                  : 'bg-slate-900/80 border-blue-900/50 hover:bg-slate-900 hover:border-blue-700/60 text-slate-100'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border shrink-0 ${
                      themeMode === 'bright'
                        ? 'bg-blue-100 text-blue-950 border-blue-300'
                        : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                    }`}>
                      {c.id}
                    </span>
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded shrink-0 ${
                      themeMode === 'bright'
                        ? 'bg-slate-200 text-slate-800 border border-slate-300'
                        : 'text-slate-300 bg-slate-800'
                    }`}>
                      {c.crimeType}
                    </span>
                  </div>
                  <h3 className={`text-base sm:text-lg font-extrabold leading-snug ${themeMode === 'bright' ? 'text-slate-900' : 'text-slate-100'}`}>
                    {c.caseName}
                  </h3>
                  <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold mt-1 ${
                    themeMode === 'bright' ? 'text-slate-700' : 'text-slate-300'
                  }`}>
                    <span className="flex items-center text-red-600 dark:text-red-400 font-bold">
                      <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 text-red-500" />
                      {c.location}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1.5 text-[11px]">
                    <span className={`px-2 py-0.5 rounded font-bold border ${
                      themeMode === 'bright'
                        ? 'bg-amber-100 text-amber-950 border-amber-300 font-extrabold'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}>
                      👤 Victim: {c.victimName}
                    </span>
                    {c.witnessName && (
                      <span className={`px-2 py-0.5 rounded font-medium border ${
                        themeMode === 'bright'
                          ? 'bg-blue-100 text-blue-950 border-blue-300 font-extrabold'
                          : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                      }`}>
                        👁️ Witness: {c.witnessName}
                      </span>
                    )}
                    {(() => {
                      const caseSuspects = suspects.filter(s => s.linkedCaseIds.includes(c.id));
                      if (caseSuspects.length === 0) return null;
                      return (
                        <span className={`px-2 py-0.5 rounded font-bold border flex items-center ${
                          themeMode === 'bright'
                            ? 'bg-red-100 text-red-950 border-red-300 font-extrabold'
                            : 'bg-red-500/15 text-red-300 border-red-500/30'
                        }`}>
                          <UserX className="w-3 h-3 mr-1" /> Suspects: {caseSuspects.length}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border shrink-0 ${
                    c.status === 'Solved'
                      ? themeMode === 'bright'
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-400 font-extrabold'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                      : c.status === 'Under Investigation'
                      ? themeMode === 'bright'
                        ? 'bg-amber-100 text-amber-950 border-amber-400 font-extrabold'
                        : 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                      : c.status === 'Active'
                      ? themeMode === 'bright'
                        ? 'bg-red-100 text-red-950 border-red-400 font-extrabold'
                        : 'bg-red-500/20 text-red-400 border-red-500/50'
                      : themeMode === 'bright'
                      ? 'bg-yellow-100 text-amber-950 border-yellow-400 font-extrabold'
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                  }`}
                >
                  {c.status}
                </span>
              </div>

              <p className={`text-xs sm:text-sm mt-2.5 line-clamp-2 ${themeMode === 'bright' ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
                {c.description}
              </p>

              <div className={`flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t text-xs sm:text-sm ${
                themeMode === 'bright' ? 'border-slate-300' : 'border-slate-800/80'
              }`}>
                <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                  <span className={`font-bold ${themeMode === 'bright' ? 'text-amber-800' : 'text-amber-300/90'}`}>
                    Host: <span className="underline decoration-amber-500/40">{c.assignedHostName || 'Unassigned'}</span>
                  </span>

                  {/* DSP Host & Suspect Management Actions */}
                  <div className="flex flex-wrap items-center gap-1 shrink-0">
                    {c.status !== 'Solved' ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenManageHostModal(c);
                          }}
                          className={`px-2.5 py-1 border rounded-lg text-[11px] font-extrabold flex items-center space-x-1 transition-all cursor-pointer ${
                            themeMode === 'bright'
                              ? 'bg-amber-200 hover:bg-amber-300 text-amber-950 border-amber-400 shadow-xs'
                              : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border-amber-500/40'
                          }`}
                          title="Reassign or change host for this case"
                        >
                          <UserCheck className="w-3.5 h-3.5 shrink-0" />
                          <span className="hidden xs:inline">{c.assignedHostName && c.assignedHostName !== 'Unassigned' ? 'Reassign' : 'Assign'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSuspectModalCase(c);
                          }}
                          className={`px-2.5 py-1 border rounded-lg text-[11px] font-extrabold flex items-center space-x-1 transition-all cursor-pointer ${
                            themeMode === 'bright'
                              ? 'bg-rose-200 hover:bg-rose-300 text-rose-950 border-rose-400 shadow-xs'
                              : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
                          }`}
                          title="Manage case suspects"
                        >
                          <UserX className="w-3.5 h-3.5 shrink-0" />
                          <span className="hidden xs:inline">Suspects</span>
                        </button>

                        {c.assignedHostName && c.assignedHostName !== 'Unassigned' && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteHostFromCase(c.id, e)}
                            className={`px-2.5 py-1 border rounded-lg text-[11px] font-extrabold flex items-center space-x-1 transition-all cursor-pointer ${
                              themeMode === 'bright'
                                ? 'bg-rose-200 hover:bg-rose-300 text-rose-950 border-rose-400 shadow-xs'
                                : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
                            }`}
                            title="Delete assigned host from this case"
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="hidden sm:inline">Delete Host</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded border ${
                        themeMode === 'bright'
                          ? 'bg-emerald-200 text-emerald-950 border-emerald-400'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}>
                        🔒 Case Solved (Read-Only)
                      </span>
                    )}
                  </div>
                </div>

                <span className={`font-mono text-xs flex items-center font-bold shrink-0 ${themeMode === 'bright' ? 'text-slate-800' : 'text-slate-400'}`}>
                  <Eye className="w-4 h-4 mr-1 text-yellow-500 shrink-0" /> {c.evidence.length} Evidence
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
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

                <div className="sm:col-span-1">
                  <label className={`block text-xs font-semibold mb-1 ${
                    themeMode === 'bright' ? 'text-red-950 font-bold' : 'text-red-400 font-bold'
                  }`}>Victim / Complainant Name * (Compulsory)</label>
                  <input
                    type="text"
                    value={victimName}
                    onChange={(e) => setVictimName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma (Manager)"
                    className={`w-full px-3 py-2 rounded-lg text-xs ${
                      themeMode === 'bright'
                        ? 'bg-white border border-red-300 text-slate-900 placeholder-slate-400 shadow-xs focus:border-red-500'
                        : 'bg-slate-900 border border-red-500/50 text-slate-100 placeholder-slate-500 focus:border-red-400'
                    }`}
                    required
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className={`block text-xs font-semibold mb-1 ${
                    themeMode === 'bright' ? 'text-slate-800' : 'text-slate-300'
                  }`}>Witness Name (Optional)</label>
                  <input
                    type="text"
                    value={witnessName}
                    onChange={(e) => setWitnessName(e.target.value)}
                    placeholder="e.g. Inspector Suresh Kadam"
                    className={`w-full px-3 py-2 rounded-lg text-xs ${
                      themeMode === 'bright'
                        ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs'
                        : 'bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-xs font-semibold mb-1 ${
                    themeMode === 'bright' ? 'text-slate-800' : ''
                  }`}>Case Location / Venue *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Downtown Central Financial Sector, Sector 12, Metro City"
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
      {/* DSP Case Suspect Modal */}
      {suspectModalCase && (
        <CaseSuspectModal
          c={suspectModalCase}
          isOpen={!!suspectModalCase}
          onClose={() => setSuspectModalCase(null)}
          suspects={suspects}
          currentUser={currentUser || ({ id: 'dsp-1', username: 'dsp_admin', fullName: 'DSP Officer', email: 'dsp@police.gov.in', phone: '9999999999', department: 'HQ', badgeId: 'DSP-001', status: 'Approved', role: 'DSP' })}
          onManageCaseSuspects={onManageCaseSuspects || (() => {})}
          onCreateSuspect={onCreateSuspect || (() => {})}
          onUpdateSuspect={onUpdateSuspect || (() => {})}
          themeMode={themeMode}
        />
      )}
    </div>
  );
};
