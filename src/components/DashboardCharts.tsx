import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { CrimeDistributionData, MonthlyCrimeData } from '../types';

interface DashboardChartsProps {
  distributionData: CrimeDistributionData[];
  monthlyData: MonthlyCrimeData[];
  themeMode?: 'dark' | 'bright';
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  distributionData,
  monthlyData,
  themeMode = 'dark',
}) => {
  const isDark = themeMode === 'dark';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
      {/* 1. Pie Chart: Crime Distribution */}
      <div
        className={`p-5 rounded-2xl border transition-colors ${
          isDark ? 'bg-slate-900/80 border-blue-900/50 shadow-lg' : 'bg-white border-2 border-slate-300 shadow-md'
        }`}
      >
        <div className="mb-4">
          <h3 className={`text-sm sm:text-base font-extrabold uppercase tracking-wider ${isDark ? 'text-yellow-400' : 'text-amber-800'}`}>
            📊 Crime Category Distribution
          </h3>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-800 font-medium'}`}>
            Percentage break-up of active crime types across jurisdiction
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: '#ca8a04',
                  borderRadius: '8px',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs sm:text-sm">
          {distributionData.map((item) => (
            <div key={item.name} className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className={isDark ? 'text-slate-300' : 'text-slate-900 font-semibold'}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Bar Chart: Monthly Crimes */}
      <div
        className={`p-5 rounded-2xl border transition-colors ${
          isDark ? 'bg-slate-900/80 border-blue-900/50 shadow-lg' : 'bg-white border-2 border-slate-300 shadow-md'
        }`}
      >
        <div className="mb-4">
          <h3 className={`text-sm sm:text-base font-extrabold uppercase tracking-wider ${isDark ? 'text-yellow-400' : 'text-amber-800'}`}>
            📈 Monthly Crimes & Resolution Trend
          </h3>
          <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-800 font-medium'}`}>
            Reported cases vs Resolved/Closed cases per month
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="month" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
              <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: '#ca8a04',
                  borderRadius: '8px',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="reported" name="Reported Crimes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved Cases" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
