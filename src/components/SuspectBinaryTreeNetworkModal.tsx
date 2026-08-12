import React, { useState, useEffect } from 'react';
import { Suspect, SuspectStatus, Case } from '../types';
import {
  X,
  Search,
  Info,
  Maximize2,
  Plus,
  Minus,
  RotateCcw,
  ChevronRight,
  User,
  GitBranch,
  Filter,
  Menu,
} from 'lucide-react';

interface SuspectBinaryTreeNetworkModalProps {
  rootSuspect: Suspect;
  suspects: Suspect[];
  cases?: Case[];
  themeMode?: 'dark' | 'bright';
  onClose: () => void;
  onSelectSuspectProfile?: (suspect: Suspect) => void;
}

export const SuspectBinaryTreeNetworkModal: React.FC<SuspectBinaryTreeNetworkModalProps> = ({
  rootSuspect: initialRootSuspect,
  suspects,
  themeMode = 'dark',
  onClose,
  onSelectSuspectProfile,
}) => {
  // Active Root / Selected Node State
  const [activeRootId, setActiveRootId] = useState<string>(initialRootSuspect.id);
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>(initialRootSuspect.id);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilters, setStatusFilters] = useState<{ [key in SuspectStatus]?: boolean }>({
    Wanted: true,
    'Under Arrest': true,
    Missing: true,
    'On Bail': true,
    'Under Investigation': true,
    Sentenced: true,
  });

  // Tree Depth State (1, 2, or 3)
  const [treeDepth, setTreeDepth] = useState<number>(3);

  // Canvas View Controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sidebars Sliding Toggle States (Left Search & Filters, Right Profile Details)
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(true);

  // Responsive sidebar handling for mobile & small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsLeftSidebarOpen(false);
        setIsRightSidebarOpen(false);
      } else {
        setIsLeftSidebarOpen(true);
        setIsRightSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isBright = themeMode === 'bright';

  // Helper to retrieve suspect object by ID
  const getSuspectById = (id: string): Suspect | undefined => {
    return suspects.find((s) => s.id === id);
  };

  // Active root object
  const activeRoot = getSuspectById(activeRootId) || initialRootSuspect;
  const selectedSuspect = getSuspectById(selectedSuspectId) || activeRoot;

  // Status color styles helper
  const getStatusRingColor = (status?: string) => {
    switch (status) {
      case 'Wanted':
        return {
          ring: 'border-red-500 shadow-red-500/40',
          badge: 'bg-red-600 text-white',
          text: isBright ? 'text-red-700 font-bold' : 'text-red-400',
          bg: 'bg-red-500/20',
        };
      case 'Under Arrest':
        return {
          ring: 'border-amber-500 shadow-amber-500/40',
          badge: 'bg-amber-600 text-white',
          text: isBright ? 'text-amber-800 font-bold' : 'text-amber-400',
          bg: 'bg-amber-500/20',
        };
      case 'Missing':
        return {
          ring: 'border-purple-500 shadow-purple-500/40',
          badge: 'bg-purple-600 text-white',
          text: isBright ? 'text-purple-800 font-bold' : 'text-purple-400',
          bg: 'bg-purple-500/20',
        };
      case 'On Bail':
        return {
          ring: 'border-blue-500 shadow-blue-500/40',
          badge: 'bg-blue-600 text-white',
          text: isBright ? 'text-blue-800 font-bold' : 'text-blue-400',
          bg: 'bg-blue-500/20',
        };
      case 'Under Investigation':
        return {
          ring: 'border-yellow-500 shadow-yellow-500/40',
          badge: 'bg-yellow-500 text-slate-950 font-black',
          text: isBright ? 'text-amber-950 font-black' : 'text-yellow-400 font-bold',
          bg: 'bg-yellow-500/20',
        };
      default:
        return {
          ring: 'border-yellow-500 shadow-yellow-500/40',
          badge: 'bg-yellow-500 text-slate-950 font-black',
          text: isBright ? 'text-amber-950 font-black' : 'text-yellow-400 font-bold',
          bg: 'bg-yellow-500/20',
        };
    }
  };

  // Toggle filter checkbox
  const toggleFilter = (st: SuspectStatus) => {
    setStatusFilters((prev) => ({ ...prev, [st]: !prev[st] }));
  };

  const clearFilters = () => {
    setStatusFilters({
      Wanted: true,
      'Under Arrest': true,
      Missing: true,
      'On Bail': true,
      'Under Investigation': true,
      Sentenced: true,
    });
    setSearchQuery('');
  };

  // Level 1 Children (Direct Connections of Active Root)
  const getChildrenOfSuspect = (suspectId: string): Suspect[] => {
    const parent = getSuspectById(suspectId);
    if (!parent) return [];

    const connectedIds = (parent.connectedSuspects || []).map((c) => c.targetSuspectId);

    // Filter by search query if any
    let childrenList = suspects.filter((s) => connectedIds.includes(s.id));

    // Fallback logic for mock suspect data if connection links are empty
    if (childrenList.length === 0 && suspectId === 'SUS-9012') {
      const sus9013 = getSuspectById('SUS-9013');
      const sus9014 = getSuspectById('SUS-9014');
      if (sus9013) childrenList.push(sus9013);
      if (sus9014) childrenList.push(sus9014);
    }

    // Filter by status checkbox & search term
    return childrenList.filter((s) => {
      const matchesStatus = statusFilters[s.status] !== false;
      const matchesQuery = !searchQuery.trim() ||
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  };

  // Level 2 Grandchildren
  const getGrandchildren = (level1Children: Suspect[]): { [parentSuspectId: string]: Suspect[] } => {
    const map: { [key: string]: Suspect[] } = {};

    level1Children.forEach((child) => {
      let gChildren = getChildrenOfSuspect(child.id).filter((g) => g.id !== activeRootId);

      // Default fallback for rich visual hierarchy if database has partial links
      if (gChildren.length === 0) {
        if (child.id === 'SUS-9013') {
          const deepak = getSuspectById('SUS-9015');
          map[child.id] = deepak ? [deepak] : [];
        } else {
          map[child.id] = [];
        }
      } else {
        map[child.id] = gChildren;
      }
    });

    return map;
  };

  const level1Children = getChildrenOfSuspect(activeRoot.id);
  const grandchildrenMap = getGrandchildren(level1Children);

  // Direct Connections of Selected Suspect for Right Sidebar
  const selectedDirectConnections = (selectedSuspect.connectedSuspects || [])
    .map((conn) => getSuspectById(conn.targetSuspectId))
    .filter((s): s is Suspect => s !== undefined);

  // Helper for computing child node horizontal X coordinate percentages
  const getChildXPercent = (idx: number, total: number): number => {
    if (total <= 1) return 50;
    if (total === 2) return idx === 0 ? 25 : 75;
    const minX = 20;
    const maxX = 80;
    return minX + idx * ((maxX - minX) / (total - 1));
  };

  const lineStrokeColor = isBright ? '#0284c7' : '#64748b'; // sky-600 vs slate-500

  return (
    <div
      className={`fixed inset-0 z-[2000] flex items-center justify-center p-1 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden ${
        isFullscreen ? 'p-0' : ''
      }`}
    >
      <div
        className={`relative w-full ${
          isFullscreen ? 'h-full rounded-none' : 'max-w-7xl h-[92vh] rounded-2xl'
        } border shadow-2xl flex flex-col overflow-hidden transition-all ${
          isBright
            ? 'bg-slate-50 border-sky-300 text-slate-900 shadow-sky-500/10'
            : 'bg-[#06080d] border-slate-800 text-slate-100'
        }`}
      >
        {/* TOP BAR / NAVIGATION */}
        <div
          className={`px-4 py-3 border-b flex items-center justify-between shrink-0 ${
            isBright
              ? 'bg-sky-100/90 border-sky-200 text-slate-900'
              : 'bg-[#090d16] border-slate-800/80 text-slate-100'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                isBright
                  ? 'bg-sky-200 text-sky-900 border border-sky-300'
                  : 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-400'
              }`}
            >
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-black uppercase tracking-wider ${
                    isBright ? 'text-sky-800' : 'text-yellow-400'
                  }`}
                >
                  DSP PORTAL
                </span>
                <span className={`text-xs ${isBright ? 'text-sky-400' : 'text-slate-500'}`}>•</span>
                <span className={`text-xs font-mono ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                  Suspect Management
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black leading-tight">
                Binary Tree Network
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isBright
                  ? 'bg-sky-200/80 hover:bg-sky-300 text-slate-800'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Close"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* MAIN BODY: 3-COLUMN SPLIT LAYOUT */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Mobile Backdrop when Left Sidebar is open on small screens */}
          {isLeftSidebarOpen && (
            <div
              className="lg:hidden absolute inset-0 bg-black/60 backdrop-blur-xs z-25 transition-opacity"
              onClick={() => setIsLeftSidebarOpen(false)}
            />
          )}

          {/* 1. LEFT SIDEBAR: FILTERS & CONTROLS */}
          <div
            className={`transition-all duration-300 ease-in-out flex flex-col shrink-0 overflow-y-auto ${
              isLeftSidebarOpen
                ? 'absolute lg:relative top-0 bottom-0 left-0 z-30 w-[85vw] max-w-[280px] lg:w-64 border-r p-4 space-y-4 opacity-100 shadow-2xl lg:shadow-none'
                : 'w-0 p-0 border-r-0 opacity-0 overflow-hidden pointer-events-none'
            } ${
              isBright
                ? 'bg-sky-50/95 border-sky-200 text-slate-900'
                : 'bg-[#080b12] border-slate-800/80 text-slate-100'
            }`}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: isBright ? '#38bdf8 #e0f2fe' : '#eab308 #1e293b',
            }}
          >
            {/* Left Partition Header with 3-Dash Toggle */}
            <div className="flex items-center justify-start pb-1">
              <button
                type="button"
                onClick={() => setIsLeftSidebarOpen(false)}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isBright
                    ? 'bg-white border-sky-200 text-slate-800 hover:bg-sky-100 shadow-xs'
                    : 'bg-slate-900 border-slate-800 text-yellow-400 hover:bg-slate-800'
                }`}
                title="Collapse Panel"
              >
                <Menu className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Search Bar */}
              <div>
                <div className="relative">
                  <Search
                    className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${
                      isBright ? 'text-sky-500' : 'text-slate-500'
                    }`}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Suspect..."
                    className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs focus:outline-none border ${
                      isBright
                        ? 'bg-white border-sky-200 text-slate-900 placeholder:text-slate-400 focus:border-sky-500'
                        : 'bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-yellow-500/50'
                    }`}
                  />
                </div>
              </div>

              {/* Filters Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-extrabold uppercase tracking-wider flex items-center ${
                      isBright ? 'text-slate-800' : 'text-slate-300'
                    }`}
                  >
                    <Filter className="w-3 h-3 mr-1 text-slate-400" /> Filters
                  </span>
                  <button
                    onClick={clearFilters}
                    className={`text-[11px] font-bold hover:underline ${
                      isBright ? 'text-sky-700' : 'text-yellow-400'
                    }`}
                  >
                    Clear
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Wanted */}
                  <label
                    className={`flex items-center space-x-2.5 cursor-pointer font-semibold ${
                      isBright ? 'text-slate-800' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={statusFilters['Wanted'] !== false}
                      onChange={() => toggleFilter('Wanted')}
                      className="rounded border-slate-400 bg-white text-red-600 focus:ring-red-500"
                    />
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span>Wanted</span>
                  </label>

                  {/* Under Arrest */}
                  <label
                    className={`flex items-center space-x-2.5 cursor-pointer font-semibold ${
                      isBright ? 'text-slate-800' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={statusFilters['Under Arrest'] !== false}
                      onChange={() => toggleFilter('Under Arrest')}
                      className="rounded border-slate-400 bg-white text-amber-600 focus:ring-amber-500"
                    />
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span>Under Arrest</span>
                  </label>

                  {/* Missing */}
                  <label
                    className={`flex items-center space-x-2.5 cursor-pointer font-semibold ${
                      isBright ? 'text-slate-800' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={statusFilters['Missing'] !== false}
                      onChange={() => toggleFilter('Missing')}
                      className="rounded border-slate-400 bg-white text-purple-600 focus:ring-purple-500"
                    />
                    <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                    <span>Missing</span>
                  </label>

                  {/* On Bail */}
                  <label
                    className={`flex items-center space-x-2.5 cursor-pointer font-semibold ${
                      isBright ? 'text-slate-800' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={statusFilters['On Bail'] !== false}
                      onChange={() => toggleFilter('On Bail')}
                      className="rounded border-slate-400 bg-white text-blue-600 focus:ring-blue-500"
                    />
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <span>On Bail</span>
                  </label>
                </div>
              </div>

              {/* Tree Depth Control */}
              <div
                className={`space-y-2 pt-2 border-t ${
                  isBright ? 'border-sky-200' : 'border-slate-800/80'
                }`}
              >
                <span
                  className={`text-xs font-extrabold block ${
                    isBright ? 'text-slate-800' : 'text-slate-300'
                  }`}
                >
                  Tree Depth
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((depth) => (
                    <button
                      key={depth}
                      type="button"
                      onClick={() => setTreeDepth(depth)}
                      className={`py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                        treeDepth === depth
                          ? isBright
                            ? 'bg-sky-600 text-white font-black border border-sky-500 shadow-md'
                            : 'bg-yellow-500 text-slate-950 font-black border border-yellow-400 shadow-md'
                          : isBright
                          ? 'bg-white text-slate-700 border border-sky-200 hover:bg-sky-100'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {depth}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* How it works info box */}
            <div
              className={`p-3 rounded-xl border text-[11px] space-y-1 ${
                isBright
                  ? 'bg-sky-100/70 border-sky-200 text-sky-900'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400'
              }`}
            >
              <div
                className={`font-bold flex items-center ${
                  isBright ? 'text-sky-950' : 'text-slate-200'
                }`}
              >
                <Info className="w-3.5 h-3.5 mr-1 text-sky-600" /> How it works?
              </div>
              <p>Click on any node to view its direct connections in the network panel.</p>
            </div>
          </div>

          {/* 2. CENTER CANVAS: BINARY TREE NETWORK DIAGRAM */}
          <div
            className={`flex-1 relative flex flex-col justify-between overflow-hidden ${
              isBright ? 'bg-sky-50/40' : 'bg-[#030508]'
            }`}
          >
            {/* Floating 3-Dash Toggle Buttons on Canvas when Partitions are Collapsed */}
            {!isLeftSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsLeftSidebarOpen(true)}
                className={`absolute top-3 left-3 z-20 p-2 rounded-lg border shadow-md transition-all cursor-pointer ${
                  isBright
                    ? 'bg-white border-sky-200 text-slate-800 hover:bg-sky-100'
                    : 'bg-slate-900 border-slate-800 text-yellow-400 hover:bg-slate-800'
                }`}
                title="Open Search & Filters Panel"
              >
                <Menu className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}

            {!isRightSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsRightSidebarOpen(true)}
                className={`absolute top-3 right-3 z-20 p-2 rounded-lg border shadow-md transition-all cursor-pointer ${
                  isBright
                    ? 'bg-white border-sky-200 text-slate-800 hover:bg-sky-100'
                    : 'bg-slate-900 border-slate-800 text-yellow-400 hover:bg-slate-800'
                }`}
                title="Open Profile Details Panel"
              >
                <Menu className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}

            {/* TREE CANVAS RENDERING AREA */}
            <div
              className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center relative transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <div className="flex flex-col items-center space-y-8 max-w-4xl w-full">
                {/* LEVEL 1: ROOT NODE */}
                <div className="flex flex-col items-center relative group">
                  <div
                    onClick={() => setSelectedSuspectId(activeRoot.id)}
                    className="cursor-pointer relative flex flex-col items-center"
                  >
                    {/* Glowing outer circle with status color */}
                    <div
                      className={`relative w-20 h-20 rounded-full border-2 ${
                        getStatusRingColor(activeRoot.status).ring
                      } p-1 overflow-visible transition-transform duration-300 hover:scale-105 shadow-2xl flex items-center justify-center ${
                        isBright ? 'bg-white' : 'bg-slate-950'
                      }`}
                    >
                      {activeRoot.photoUrl ? (
                        <img
                          src={activeRoot.photoUrl}
                          alt={activeRoot.fullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full rounded-full flex items-center justify-center ${
                            isBright ? 'bg-sky-100 text-sky-700' : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          <User className="w-9 h-9" />
                        </div>
                      )}

                      {/* Status Badge Tag */}
                      <div
                        className={`absolute -bottom-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          getStatusRingColor(activeRoot.status).badge
                        } shadow-md whitespace-nowrap`}
                      >
                        {activeRoot.status}
                      </div>
                    </div>

                    {/* Suspect Name & ID Below Circle */}
                    <div className="mt-3 text-center">
                      <div
                        className={`text-xs font-black transition-colors ${
                          isBright
                            ? 'text-slate-900 group-hover:text-sky-700'
                            : 'text-slate-100 group-hover:text-yellow-400'
                        }`}
                      >
                        {activeRoot.fullName}
                      </div>
                      <div
                        className={`text-[10px] font-mono font-bold ${
                          isBright ? 'text-sky-700' : 'text-yellow-400/80'
                        }`}
                      >
                        {activeRoot.id}
                      </div>
                    </div>
                  </div>
                </div>

                {/* LEVEL 2: DIRECT CHILDREN */}
                {treeDepth >= 2 && level1Children.length > 0 && (
                  <div className="w-full flex flex-col items-center relative space-y-8">
                    {/* SVG ORTHOGONAL BRANCH CONNECTING LINES (Parent to Level 2 Children) */}
                    <div className="w-full flex justify-center -my-4 relative pointer-events-none">
                      <svg className="w-full max-w-xl h-12 overflow-visible">
                        {(() => {
                          const count = level1Children.length;
                          if (count === 0) return null;

                          if (count === 1) {
                            return (
                              <line
                                x1="50%"
                                y1="0"
                                x2="50%"
                                y2="100%"
                                stroke={lineStrokeColor}
                                strokeWidth="2.5"
                              />
                            );
                          }

                          const midY = 20; // middle horizontal line height
                          const minX = getChildXPercent(0, count);
                          const maxX = getChildXPercent(count - 1, count);

                          return (
                            <g>
                              {/* Vertical drop line down from Parent center (50%) to midY */}
                              <line
                                x1="50%"
                                y1="0"
                                x2="50%"
                                y2={midY}
                                stroke={lineStrokeColor}
                                strokeWidth="2.5"
                              />

                              {/* Horizontal connector bar across all children */}
                              <line
                                x1={`${minX}%`}
                                y1={midY}
                                x2={`${maxX}%`}
                                y2={midY}
                                stroke={lineStrokeColor}
                                strokeWidth="2.5"
                              />

                              {/* Vertical drop lines from midY down to each child node top */}
                              {level1Children.map((_, idx) => {
                                const childX = getChildXPercent(idx, count);
                                return (
                                  <line
                                    key={idx}
                                    x1={`${childX}%`}
                                    y1={midY}
                                    x2={`${childX}%`}
                                    y2="100%"
                                    stroke={lineStrokeColor}
                                    strokeWidth="2.5"
                                  />
                                );
                              })}
                            </g>
                          );
                        })()}
                      </svg>
                    </div>

                    {/* Level 2 Nodes Row */}
                    <div className="w-full flex justify-center gap-8 sm:gap-16 items-start">
                      {level1Children.map((child) => {
                        const style = getStatusRingColor(child.status);
                        const isSelected = selectedSuspectId === child.id;

                        return (
                          <div
                            key={child.id}
                            className="flex flex-col items-center relative group"
                          >
                            <div
                              onClick={() => {
                                setSelectedSuspectId(child.id);
                              }}
                              onDoubleClick={() => setActiveRootId(child.id)}
                              className="cursor-pointer relative flex flex-col items-center"
                              title="Click to view details, Double click to center tree"
                            >
                              <div
                                className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 ${
                                  style.ring
                                } p-1 transition-transform duration-300 hover:scale-105 shadow-xl flex items-center justify-center ${
                                  isBright ? 'bg-white' : 'bg-slate-950'
                                } ${
                                  isSelected
                                    ? isBright
                                      ? 'ring-2 ring-sky-500 ring-offset-2 ring-offset-slate-100'
                                      : 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-950'
                                    : ''
                                }`}
                              >
                                {child.photoUrl ? (
                                  <img
                                    src={child.photoUrl}
                                    alt={child.fullName}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <div
                                    className={`w-full h-full rounded-full flex items-center justify-center ${
                                      isBright ? 'bg-sky-100 text-sky-700' : 'bg-slate-900 text-slate-500'
                                    }`}
                                  >
                                    <User className="w-7 h-7" />
                                  </div>
                                )}

                                <div
                                  className={`absolute -bottom-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${style.badge} shadow-md whitespace-nowrap`}
                                >
                                  {child.status}
                                </div>
                              </div>

                              <div className="mt-3 text-center">
                                <div
                                  className={`text-xs font-black transition-colors ${
                                    isBright
                                      ? 'text-slate-900 group-hover:text-sky-700'
                                      : 'text-slate-100 group-hover:text-yellow-400'
                                  }`}
                                >
                                  {child.fullName}
                                </div>
                                <div
                                  className={`text-[10px] font-mono font-bold ${
                                    isBright ? 'text-sky-700' : 'text-yellow-400/80'
                                  }`}
                                >
                                  {child.id}
                                </div>
                              </div>
                            </div>

                            {/* LEVEL 3: GRANDCHILDREN NODES */}
                            {treeDepth >= 3 && grandchildrenMap[child.id] && grandchildrenMap[child.id].length > 0 && (
                              <div className="w-full flex flex-col items-center mt-6">
                                {/* SVG ORTHOGONAL BRANCH LINES (Level 2 Child to Level 3 Grandchildren) */}
                                <div className="w-full flex justify-center -mt-2 mb-2 pointer-events-none">
                                  <svg className="w-full max-w-[220px] h-10 overflow-visible">
                                    {(() => {
                                      const gList = grandchildrenMap[child.id];
                                      const gCount = gList.length;
                                      if (gCount === 0) return null;

                                      if (gCount === 1) {
                                        return (
                                          <line
                                            x1="50%"
                                            y1="0"
                                            x2="50%"
                                            y2="100%"
                                            stroke={lineStrokeColor}
                                            strokeWidth="2"
                                          />
                                        );
                                      }

                                      const midY = 16;
                                      const minGX = getChildXPercent(0, gCount);
                                      const maxGX = getChildXPercent(gCount - 1, gCount);

                                      return (
                                        <g>
                                          {/* Drop from Child center (50%) to midY */}
                                          <line
                                            x1="50%"
                                            y1="0"
                                            x2="50%"
                                            y2={midY}
                                            stroke={lineStrokeColor}
                                            strokeWidth="2"
                                          />

                                          {/* Horizontal connector bar across grandchildren */}
                                          <line
                                            x1={`${minGX}%`}
                                            y1={midY}
                                            x2={`${maxGX}%`}
                                            y2={midY}
                                            stroke={lineStrokeColor}
                                            strokeWidth="2"
                                          />

                                          {/* Vertical drop lines to each Grandchild */}
                                          {gList.map((_, gIdx) => {
                                            const gX = getChildXPercent(gIdx, gCount);
                                            return (
                                              <line
                                                key={gIdx}
                                                x1={`${gX}%`}
                                                y1={midY}
                                                x2={`${gX}%`}
                                                y2="100%"
                                                stroke={lineStrokeColor}
                                                strokeWidth="2"
                                              />
                                            );
                                          })}
                                        </g>
                                      );
                                    })()}
                                  </svg>
                                </div>

                                {/* Grandchildren Nodes Row */}
                                <div className="flex items-center justify-center gap-4 sm:gap-6">
                                  {grandchildrenMap[child.id].map((gChild) => {
                                    const gStyle = getStatusRingColor(gChild.status);

                                    return (
                                      <div
                                        key={gChild.id}
                                        onClick={() => setSelectedSuspectId(gChild.id)}
                                        className="cursor-pointer flex flex-col items-center group/g"
                                      >
                                        <div
                                          className={`relative w-12 h-12 rounded-full border-2 ${gStyle.ring} p-0.5 flex items-center justify-center shadow-lg transition-transform group-hover/g:scale-105 ${
                                            isBright ? 'bg-white' : 'bg-slate-950'
                                          }`}
                                        >
                                          {gChild.photoUrl ? (
                                            <img
                                              src={gChild.photoUrl}
                                              alt={gChild.fullName}
                                              className="w-full h-full rounded-full object-cover"
                                            />
                                          ) : (
                                            <div
                                              className={`w-full h-full rounded-full flex items-center justify-center ${
                                                isBright ? 'bg-sky-100 text-sky-700' : 'bg-slate-900 text-slate-500'
                                              }`}
                                            >
                                              <User className="w-5 h-5" />
                                            </div>
                                          )}

                                          <div
                                            className={`absolute -bottom-1.5 px-1.5 py-0.2 rounded-full text-[7px] font-black uppercase tracking-wider ${gStyle.badge} shadow-xs whitespace-nowrap`}
                                          >
                                            {gChild.status}
                                          </div>
                                        </div>

                                        <div className="mt-2 text-center">
                                          <div
                                            className={`text-[11px] font-bold ${
                                              isBright ? 'text-slate-900 group-hover/g:text-sky-700' : 'text-slate-200 group-hover/g:text-yellow-400'
                                            }`}
                                          >
                                            {gChild.fullName}
                                          </div>
                                          <div
                                            className={`text-[9px] font-mono ${
                                              isBright ? 'text-sky-700 font-bold' : 'text-slate-400'
                                            }`}
                                          >
                                            {gChild.id}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* BOTTOM FLOATING CANVAS CONTROLS */}
            <div className="p-3 flex justify-center items-center z-10">
              <div
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl shadow-xl border ${
                  isBright
                    ? 'bg-white/95 border-sky-200 text-slate-800'
                    : 'bg-slate-900/90 border-slate-800 text-slate-400'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isBright
                      ? 'hover:bg-sky-100 text-slate-700'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <div className={`w-[1px] h-4 ${isBright ? 'bg-sky-200' : 'bg-slate-800'}`} />
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isBright
                      ? 'hover:bg-sky-100 text-slate-700'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Zoom In"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isBright
                      ? 'hover:bg-sky-100 text-slate-700'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Zoom Out"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className={`w-[1px] h-4 ${isBright ? 'bg-sky-200' : 'bg-slate-800'}`} />
                <button
                  type="button"
                  onClick={() => {
                    setZoomLevel(1);
                    setActiveRootId(initialRootSuspect.id);
                    setSelectedSuspectId(initialRootSuspect.id);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isBright
                      ? 'hover:bg-sky-100 text-slate-700'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Reset View"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Backdrop when Right Sidebar is open on small screens */}
          {isRightSidebarOpen && (
            <div
              className="lg:hidden absolute inset-0 bg-black/60 backdrop-blur-xs z-25 transition-opacity"
              onClick={() => setIsRightSidebarOpen(false)}
            />
          )}

          {/* 3. RIGHT SIDEBAR: SELECTED SUSPECT DETAILS PANEL */}
          <div
            className={`transition-all duration-300 ease-in-out flex flex-col shrink-0 overflow-y-auto ${
              isRightSidebarOpen
                ? 'absolute lg:relative top-0 bottom-0 right-0 z-30 w-[85vw] max-w-[320px] lg:w-80 border-l p-4 space-y-4 opacity-100 shadow-2xl lg:shadow-none'
                : 'w-0 p-0 border-l-0 opacity-0 overflow-hidden pointer-events-none'
            } ${
              isBright
                ? 'bg-sky-50/95 border-sky-200 text-slate-900'
                : 'bg-[#080b12] border-slate-800/80 text-slate-100'
            }`}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: isBright ? '#38bdf8 #e0f2fe' : '#eab308 #1e293b',
            }}
          >
            {/* Right Partition Header with 3-Dash Toggle */}
            <div className="flex items-center justify-end pb-1">
              <button
                type="button"
                onClick={() => setIsRightSidebarOpen(false)}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isBright
                    ? 'bg-white border-sky-200 text-slate-800 hover:bg-sky-100 shadow-xs'
                    : 'bg-slate-900 border-slate-800 text-yellow-400 hover:bg-slate-800'
                }`}
                title="Collapse Panel"
              >
                <Menu className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
            <div className="space-y-5">
              {/* Top Selected Suspect Mugshot & Status Header */}
              <div className="flex flex-col items-center text-center space-y-2 pt-2">
                <div
                  className={`relative w-24 h-24 rounded-full border-2 ${
                    getStatusRingColor(selectedSuspect.status).ring
                  } p-1 overflow-hidden shadow-2xl flex items-center justify-center ${
                    isBright ? 'bg-white' : 'bg-slate-950'
                  }`}
                >
                  {selectedSuspect.photoUrl ? (
                    <img
                      src={selectedSuspect.photoUrl}
                      alt={selectedSuspect.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full rounded-full flex items-center justify-center ${
                        isBright ? 'bg-sky-100 text-sky-700' : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      <User className="w-12 h-12" />
                    </div>
                  )}
                </div>

                <div>
                  <h3
                    className={`text-base font-black ${
                      isBright ? 'text-slate-900' : 'text-slate-100'
                    }`}
                  >
                    {selectedSuspect.fullName}
                  </h3>
                  <div className="flex items-center justify-center space-x-2 mt-1">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        getStatusRingColor(selectedSuspect.status).badge
                      }`}
                    >
                      {selectedSuspect.status}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        isBright ? 'text-sky-800' : 'text-yellow-400'
                      }`}
                    >
                      {selectedSuspect.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Suspect Information Details Grid */}
              <div
                className={`space-y-2 text-xs divide-y p-3 rounded-xl border max-h-56 overflow-y-auto ${
                  isBright
                    ? 'bg-white border-sky-200 divide-sky-100 text-slate-800 shadow-xs'
                    : 'bg-slate-900/60 border-slate-800 divide-slate-800/60 text-slate-200'
                }`}
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: isBright ? '#38bdf8 #e0f2fe' : '#eab308 #1e293b',
                }}
              >
                <div className="flex justify-between py-1">
                  <span className={isBright ? 'text-slate-500 font-semibold' : 'text-slate-400 font-semibold'}>
                    Age
                  </span>
                  <span className="font-bold">{selectedSuspect.age}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className={isBright ? 'text-slate-500 font-semibold' : 'text-slate-400 font-semibold'}>
                    Gender
                  </span>
                  <span className="font-bold">{selectedSuspect.gender}</span>
                </div>
                <div className="flex justify-between py-1 gap-2">
                  <span className={isBright ? 'text-slate-500 font-semibold shrink-0' : 'text-slate-400 font-semibold shrink-0'}>
                    Crime
                  </span>
                  <span className="font-bold text-right truncate">
                    {selectedSuspect.crime}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className={isBright ? 'text-slate-500 font-semibold' : 'text-slate-400 font-semibold'}>
                    Status
                  </span>
                  <span className={`font-black uppercase ${getStatusRingColor(selectedSuspect.status).text}`}>
                    {selectedSuspect.status}
                  </span>
                </div>
              </div>

              {/* Direct Connections List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-black uppercase tracking-wider ${
                      isBright ? 'text-slate-800' : 'text-slate-300'
                    }`}
                  >
                    Direct Connections ({selectedDirectConnections.length})
                  </span>
                </div>

                {selectedDirectConnections.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDirectConnections.map((connSuspect) => {
                      const cStyle = getStatusRingColor(connSuspect.status);

                      return (
                        <div
                          key={connSuspect.id}
                          onClick={() => {
                            setSelectedSuspectId(connSuspect.id);
                          }}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all group ${
                            isBright
                              ? 'bg-white border-sky-200 hover:border-sky-400 text-slate-900 shadow-xs'
                              : 'bg-slate-900/80 border-slate-800 hover:border-yellow-500/50 text-slate-100'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <img
                              src={
                                connSuspect.photoUrl ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                              }
                              alt=""
                              className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-300 dark:border-slate-700"
                            />
                            <div className="min-w-0 flex-1">
                              <div
                                className={`text-xs font-extrabold truncate ${
                                  isBright
                                    ? 'text-slate-900 group-hover:text-sky-700'
                                    : 'text-slate-200 group-hover:text-yellow-400'
                                }`}
                              >
                                {connSuspect.fullName}
                              </div>
                              <div className="flex items-center space-x-1.5 mt-0.5">
                                <span
                                  className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase ${cStyle.badge}`}
                                >
                                  {connSuspect.status}
                                </span>
                                <span
                                  className={`text-[9px] font-mono ${
                                    isBright ? 'text-sky-800 font-bold' : 'text-slate-400'
                                  }`}
                                >
                                  {connSuspect.id}
                                </span>
                              </div>
                            </div>
                          </div>

                          <ChevronRight
                            className={`w-4 h-4 shrink-0 ml-1 ${
                              isBright
                                ? 'text-slate-400 group-hover:text-sky-700'
                                : 'text-slate-500 group-hover:text-yellow-400'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className={`p-3 rounded-xl border border-dashed text-center text-xs italic ${
                      isBright
                        ? 'bg-white border-sky-200 text-slate-500'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    No direct connections listed for this suspect node.
                  </div>
                )}
              </div>
            </div>

            {/* Profile Action Button */}
            {onSelectSuspectProfile && (
              <button
                type="button"
                onClick={() => onSelectSuspectProfile(selectedSuspect)}
                className={`w-full py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer mt-4 ${
                  isBright
                    ? 'bg-sky-600 hover:bg-sky-500 text-white'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
                }`}
              >
                <span>View Full Profile</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

