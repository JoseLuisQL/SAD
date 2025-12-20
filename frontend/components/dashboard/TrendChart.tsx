'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeeklyData } from '@/lib/api/dashboard';

interface TrendChartProps {
  title: string;
  data: WeeklyData[];
  dataKey?: string;
  color?: string;
  height?: number;
}

interface TooltipPayload {
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm">
        <p className="text-xs font-semibold text-slate-900 dark:text-white mb-1">{label}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          <span className="font-medium">{payload[0].value}</span> documento{payload[0].value !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
};

export function TrendChart({
  title,
  data,
  dataKey = 'count',
  color = '#3b82f6',
  height = 280,
}: TrendChartProps) {
  const hasData = data && data.length > 0;
  const chartDescription = hasData 
    ? data.map(d => `${d.week}: ${d.count}`).join(', ')
    : 'Sin datos';

  return (
    <Card className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center" style={{ height }}>
            <div className="text-center">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-full inline-block mb-3">
                <svg className="h-7 w-7 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                No hay datos disponibles
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Los datos apareceran cuando haya actividad registrada
              </p>
            </div>
          </div>
        ) : (
          <div role="img" aria-label={`Grafico de tendencia: ${chartDescription}`}>
            <ResponsiveContainer width="100%" height={height}>
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} className="dark:stroke-slate-700" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={35}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#gradient-${dataKey})`}
                  isAnimationActive={true}
                  animationDuration={600}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
