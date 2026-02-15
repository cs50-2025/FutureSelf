import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { ProjectionPoint } from '../../types';

interface TrendChartProps {
  data: ProjectionPoint[];
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const currentYear = new Date().getFullYear();
  // Calculate completion percentage based on current year relative to start/end of data
  const startYear = data[0]?.year || currentYear;
  const endYear = data[data.length - 1]?.year || currentYear + 5;
  const totalYears = endYear - startYear;
  // Just for visual demo, let's pretend we are 1 year into the 5 year plan to show the bar
  // In a real simulation, "Current" is usually index 0, but let's visualize "Time Progress"
  const progressPercent = 20; // 1 year out of 5

  return (
    <div className="w-full mt-4">
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
            <XAxis 
              dataKey="year" 
              tick={{ fill: '#94a3b8', fontSize: 10 }} 
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              domain={[0, 100]} 
              tick={{ fill: '#94a3b8', fontSize: 10 }} 
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: 'none', 
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              labelStyle={{ color: '#94a3b8' }}
            />
            
            {/* Indicator for 'Now' */}
            <ReferenceLine x={startYear} stroke="#6366f1" strokeDasharray="3 3" label={{ position: 'top', value: 'Start', fill: '#6366f1', fontSize: 10 }} />

            <Line 
              type="monotone" 
              dataKey="academic" 
              stroke="#6366f1" 
              strokeWidth={2} 
              dot={false}
              name="Academic"
            />
            <Line 
              type="monotone" 
              dataKey="burnout" 
              stroke="#f43f5e" 
              strokeWidth={2} 
              dot={false}
              name="Burnout"
            />
            <Line 
              type="monotone" 
              dataKey="health" 
              stroke="#10b981" 
              strokeWidth={2} 
              dot={false}
              name="Health"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend & Progress Indicator */}
      <div className="mt-4 px-2">
         {/* Visual Progress Bar */}
         <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Simulation Progress</span>
            <span>Year 1 of 5</span>
         </div>
         <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" 
              style={{ width: `${progressPercent}%` }}
            ></div>
         </div>

        <div className="flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Academic
          </div>
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <div className="w-2 h-2 rounded-full bg-rose-500"></div> Burnout Risk
          </div>
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Health
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendChart;
