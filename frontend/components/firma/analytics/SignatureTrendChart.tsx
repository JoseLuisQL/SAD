'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SignatureTrendChartProps {
  data: Array<{
    period: string;
    count: number;
    date: string;
  }>;
  loading?: boolean;
}

export default function SignatureTrendChart({ data, loading }: SignatureTrendChartProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-4 animate-pulse"></div>
        <div className="h-[300px] bg-gray-100 dark:bg-slate-800 rounded animate-pulse"></div>
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: format(new Date(item.date), 'dd MMM', { locale: es }),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700 shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {format(new Date(payload[0].payload.date), 'dd MMMM yyyy', { locale: es })}
          </p>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            <span className="font-semibold text-blue-600 dark:text-blue-400">{payload[0].value}</span> firmas
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tendencia de Firmas</h3>
        <p className="text-sm text-gray-600 dark:text-slate-400">Evolución de firmas digitales en el período seleccionado</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id="colorSignatures" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
          <XAxis
            dataKey="formattedDate"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            className="dark:fill-slate-400"
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            className="dark:fill-slate-400"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            formatter={() => 'Firmas Realizadas'}
            wrapperStyle={{ color: '#6b7280' }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSignatures)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
