import React, { useState, useMemo } from 'react';
import { Case } from '../types';
import { Calendar, Activity, Info } from 'lucide-react';

interface CaseHeatmapProps {
  cases: Case[];
  themeMode?: 'dark' | 'bright';
}

interface HeatmapCaseItem {
  id: string;
  name: string;
  crimeType: string;
  location: string;
}

interface HeatmapDay {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayName: string; // Sun, Mon, etc.
  dayOfWeek: number; // 0 = Sun, 6 = Sat
  weekIndex: number; // 0 to 11
  count: number;
  caseItems: HeatmapCaseItem[];
}

export const CaseHeatmap: React.FC<CaseHeatmapProps> = ({
  cases,
  themeMode = 'dark',
}) => {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Generate 12 weeks of data ending on current date / today
  const { gridDays, total12WeekCases } = useMemo(() => {
    const today = new Date();
    const totalDays = 12 * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (totalDays - 1));

    // Map cases by YYYY-MM-DD
    const casesByDateMap: Record<string, HeatmapCaseItem[]> = {};

    // Process actual cases
    cases.forEach((c) => {
      let rawDate = c.dateAssigned;
      if (!rawDate && c.createdAt) {
        rawDate = c.createdAt.split(' ')[0];
      }
      if (rawDate) {
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
          const key = parsed.toISOString().split('T')[0];
          if (!casesByDateMap[key]) {
            casesByDateMap[key] = [];
          }
          casesByDateMap[key].push({
            id: c.id,
            name: c.caseName,
            crimeType: c.crimeType,
            location: c.location || 'Unknown Location',
          });
        }
      }
    });

    const days: HeatmapDay[] = [];
    let caseSum = 0;

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const actualCaseItems = casesByDateMap[dateStr] || [];
      const count = actualCaseItems.length;

      caseSum += count;

      const dayOfWeek = d.getDay(); // 0 = Sun ... 6 = Sat
      const weekIndex = Math.floor(i / 7);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      days.push({
        date: d,
        dateStr,
        dayName,
        dayOfWeek,
        weekIndex,
        count,
        caseItems: actualCaseItems,
      });
    }

    return { gridDays: days, total12WeekCases: caseSum };
  }, [cases]);

  // Group days into 7 rows (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const rows = useMemo(() => {
    const r: HeatmapDay[][] = Array.from({ length: 7 }, () => []);
    gridDays.forEach((dayObj) => {
      r[dayObj.dayOfWeek].push(dayObj);
    });
    return r;
  }, [gridDays]);

  // Get color scale based on case count
  const getCellColor = (count: number) => {
    if (count === 0) {
      return themeMode === 'bright'
        ? 'bg-slate-100 hover:bg-slate-200 border border-slate-200'
        : 'bg-slate-800/50 hover:bg-slate-700/60 border border-slate-800/80';
    }
    if (count === 1) {
      return themeMode === 'bright'
        ? 'bg-amber-200 border border-amber-300 text-amber-900 shadow-xs'
        : 'bg-amber-500/30 border border-amber-500/50 text-amber-300';
    }
    if (count === 2) {
      return themeMode === 'bright'
        ? 'bg-amber-400 border border-amber-500 text-amber-950 shadow-xs'
        : 'bg-amber-500 border border-amber-400 text-slate-950';
    }
    if (count === 3) {
      return themeMode === 'bright'
        ? 'bg-orange-500 border border-orange-600 text-white shadow-xs'
        : 'bg-orange-500 border border-orange-400 text-white';
    }
    // 4+ cases
    return themeMode === 'bright'
      ? 'bg-red-600 border border-red-700 text-white shadow-xs'
      : 'bg-red-600 border border-red-500 text-white';
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleMouseEnter = (dayObj: HeatmapDay, e: React.MouseEvent) => {
    setHoveredDay(dayObj);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
    setTooltipPos(null);
  };

  return (
    <div
      className={`relative z-0 isolate w-full rounded-2xl border p-4 sm:p-5 shadow-xl transition-all flex flex-col justify-between h-full ${
        themeMode === 'bright'
          ? 'bg-white border-slate-300 text-slate-900'
          : 'bg-slate-900 border-blue-900/50 text-slate-100'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2.5 rounded-xl border shrink-0 ${
              themeMode === 'bright'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3
              className={`text-base sm:text-lg font-black leading-snug ${
                themeMode === 'bright' ? 'text-amber-800' : 'text-yellow-400'
              }`}
            >
              Case Registration Heatmap
            </h3>
            <p
              className={`text-xs mt-0.5 ${
                themeMode === 'bright' ? 'text-slate-600 font-medium' : 'text-slate-400'
              }`}
            >
              Daily registered case volume
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span
            className={`text-base sm:text-lg font-black block leading-none ${
              themeMode === 'bright' ? 'text-slate-900' : 'text-white'
            }`}
          >
            {total12WeekCases} Cases
          </span>
          <span className="text-[10px] text-slate-400 font-medium block mt-1">
            Across 12 Weeks
          </span>
        </div>
      </div>

      {/* Main Heatmap Matrix Container */}
      <div className="my-auto py-2 overflow-x-auto scrollbar-none">
        <div className="min-w-[320px] flex items-center justify-center">
          {/* Day Axis Labels */}
          <div className="flex flex-col justify-between mr-2 sm:mr-3 text-[10px] font-bold text-slate-400 h-[154px] sm:h-[168px] py-0.5 select-none">
            {['Sun', '', 'Tue', '', 'Thu', '', 'Sat'].map((label, idx) => (
              <span key={idx} className="h-4 sm:h-4.5 flex items-center leading-none">
                {label}
              </span>
            ))}
          </div>

          {/* 12 Columns of Weeks */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {Array.from({ length: 12 }).map((_, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-1.5 sm:gap-2">
                {Array.from({ length: 7 }).map((_, rowIdx) => {
                  const dayObj = rows[rowIdx]?.[colIdx];
                  if (!dayObj) return <div key={rowIdx} className="w-4 h-4 sm:w-4.5 sm:h-4.5" />;

                  return (
                    <div
                      key={rowIdx}
                      onMouseEnter={(e) => handleMouseEnter(dayObj, e)}
                      onMouseLeave={handleMouseLeave}
                      className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-md transition-all duration-150 cursor-pointer hover:scale-125 hover:z-20 ${getCellColor(
                        dayObj.count
                      )}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer & Legend */}
      <div
        className={`mt-4 pt-3 border-t flex flex-wrap items-center justify-between text-xs gap-2 ${
          themeMode === 'bright' ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
        }`}
      >
        <span className="text-[11px] font-semibold">Last 12 weeks</span>

        <div className="flex items-center space-x-1.5 text-[11px] font-medium">
          <span className="mr-1">Less</span>
          <span className={`w-3 h-3 rounded-xs ${getCellColor(0)}`} title="0 cases" />
          <span className={`w-3 h-3 rounded-xs ${getCellColor(1)}`} title="1 case" />
          <span className={`w-3 h-3 rounded-xs ${getCellColor(2)}`} title="2 cases" />
          <span className={`w-3 h-3 rounded-xs ${getCellColor(3)}`} title="3 cases" />
          <span className={`w-3 h-3 rounded-xs ${getCellColor(4)}`} title="4+ cases" />
          <span className="ml-1">More</span>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredDay && tooltipPos && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className={`pointer-events-none z-50 px-3.5 py-2.5 rounded-xl shadow-2xl border text-xs min-w-[160px] max-w-[220px] animate-in fade-in zoom-in-95 duration-150 ${
            themeMode === 'bright'
              ? 'bg-slate-900 text-white border-slate-700 shadow-slate-900/50'
              : 'bg-slate-950 text-white border-yellow-500/40 shadow-black/90'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 mb-1.5">
            <span className="font-extrabold text-amber-400 text-[11px]">
              {hoveredDay.dayName}, {hoveredDay.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <p className="font-extrabold text-xs text-white">
            {hoveredDay.count === 0
              ? '0 Cases Registered'
              : `${hoveredDay.count} ${hoveredDay.count === 1 ? 'Case' : 'Cases'} Registered`}
          </p>

          {hoveredDay.caseItems && hoveredDay.caseItems.length > 0 && (
            <div className="mt-1.5 pt-1.5 border-t border-slate-800 space-y-1">
              {hoveredDay.caseItems.map((item) => (
                <div key={item.id} className="text-[10px] text-slate-300">
                  <div className="font-extrabold text-amber-300">{item.name} ({item.id})</div>
                  <div className="text-[9.5px] text-slate-400">📍 {item.location}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
