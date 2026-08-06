import React from 'react';
import { Case, User, CrimeDistributionData, MonthlyCrimeData } from '../types';
import { DashboardCharts } from './DashboardCharts';
import { Shield, FolderKanban, Eye, FileText, Upload } from 'lucide-react';

interface OfficerDashboardProps {
  currentUser: User;
  cases: Case[];
  onSelectCase: (c: Case) => void;
  distributionData: CrimeDistributionData[];
  monthlyData: MonthlyCrimeData[];
  themeMode?: 'dark' | 'bright';
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  currentUser,
  cases,
  onSelectCase,
  distributionData,
  monthlyData,
  themeMode = 'dark',
}) => {
  // Police Officers see ONLY cases assigned to them by Host or DSP
  const myCases = cases.filter(
    (c) =>
      c.assignedOfficerIds.includes(currentUser.id) ||
      c.assignedOfficerNames.some((name) => name && name.toLowerCase().includes(currentUser.fullName.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Officer Header */}
      <div className="border-b border-yellow-500/20 pb-4 sm:pb-6">
        <h1 className={`text-lg sm:text-2xl md:text-3xl font-black flex items-center leading-tight ${themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'}`}>
          <Shield className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-yellow-500 shrink-0" />
          <span>Police Officer Field Investigation Portal</span>
        </h1>
        <p className={`text-xs sm:text-sm mt-1 sm:mt-1.5 ${themeMode === 'bright' ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
          Assigned case repository, field FIR logs, evidence uploads, and crime analytics.
        </p>
      </div>

      {/* Analytics Charts */}
      <DashboardCharts
        distributionData={distributionData}
        monthlyData={monthlyData}
        themeMode={themeMode}
      />

      {/* Assigned Cases Grid */}
      <div className="space-y-4">
        <h2 className={`text-lg sm:text-xl font-bold flex items-center ${themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'}`}>
          <FolderKanban className="w-5 h-5 mr-2" /> Cases Assigned to You ({myCases.length})
        </h2>

        {myCases.length === 0 ? (
          <div className={`p-8 sm:p-12 rounded-3xl border border-dashed text-center space-y-4 max-w-xl mx-auto my-6 ${
            themeMode === 'bright'
              ? 'bg-slate-50 border-slate-300 text-slate-800'
              : 'bg-slate-900/60 border-slate-800 text-slate-300'
          }`}>
            <Shield className="w-12 h-12 text-yellow-500/70 mx-auto" />
            <h3 className="text-lg font-bold text-yellow-400">No Cases Allotted</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You currently have no cases allotted to your Police Officer profile. Once a Host Inspector or DSP assigns a case to you, it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myCases.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectCase(c)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] ${
                  themeMode === 'bright'
                    ? 'bg-white border-2 border-slate-300 shadow-md hover:border-slate-400 text-slate-900'
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

                <div className={`flex items-center justify-between pt-4 mt-4 border-t text-xs sm:text-sm ${
                  themeMode === 'bright' ? 'border-slate-300' : 'border-slate-800/80'
                }`}>
                  <span className={`font-bold ${themeMode === 'bright' ? 'text-amber-800' : 'text-amber-300/90'}`}>
                    Assigned Host: {c.assignedHostName}
                  </span>
                  <span className={`font-bold flex items-center ${themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'}`}>
                    <Upload className="w-4 h-4 mr-1 text-yellow-500" /> {c.evidence.length} Evidence Uploads
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
