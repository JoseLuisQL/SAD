'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartProps {
  data: any[];
  title: string;
  height?: number;
}

interface BarChartProps extends ChartProps {
  dataKey: string;
  nameKey: string;
  color?: string;
}

interface LineChartProps extends ChartProps {
  dataKey: string;
  nameKey: string;
  color?: string;
}

interface PieChartProps extends ChartProps {
  dataKey: string;
  nameKey: string;
  colors?: string[];
}

const COLORS = [
  '#1d4ed8', // blue-700 - Corporate primary
  '#10b981', // emerald-500 - Corporate success
  '#f59e0b', // amber-500 - Corporate accent
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700 shadow-lg">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-gray-600 dark:text-slate-400">
            <span style={{ color: entry.color }}>{entry.name}: </span>
            <span className="font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ReportBarChart({ data, title, dataKey, nameKey, color = '#1d4ed8', height = 300 }: BarChartProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
          <XAxis 
            dataKey={nameKey} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            className="dark:fill-slate-400"
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis 
            tick={{ fill: '#64748b', fontSize: 12 }}
            className="dark:fill-slate-400"
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px', color: '#6b7280' }}
            iconType="circle"
          />
          <Bar dataKey={dataKey} fill={color} name="Cantidad" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReportLineChart({ data, title, dataKey, nameKey, color = '#0f766e', height = 300 }: LineChartProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
          <XAxis 
            dataKey={nameKey} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            className="dark:fill-slate-400"
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis 
            tick={{ fill: '#64748b', fontSize: 12 }}
            className="dark:fill-slate-400"
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px', color: '#6b7280' }}
            iconType="circle"
          />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={3}
            name="Cantidad"
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReportPieChart({ data, title, dataKey, nameKey, colors = COLORS, height = 300 }: PieChartProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry: any) => entry[nameKey] as string}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MultiBarChartProps extends ChartProps {
  bars: Array<{ dataKey: string; name: string; color: string }>;
  nameKey: string;
}

export function ReportMultiBarChart({ data, title, bars, nameKey, height = 300 }: MultiBarChartProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
          <XAxis 
            dataKey={nameKey}
            tick={{ fill: '#64748b', fontSize: 12 }}
            className="dark:fill-slate-400"
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis 
            tick={{ fill: '#64748b', fontSize: 12 }}
            className="dark:fill-slate-400"
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px', color: '#6b7280' }} iconType="circle" />
          {bars.map((bar) => (
            <Bar key={bar.dataKey} dataKey={bar.dataKey} fill={bar.color} name={bar.name} radius={[8, 8, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
