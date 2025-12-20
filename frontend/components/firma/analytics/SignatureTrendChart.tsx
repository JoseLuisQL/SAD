'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, TrendingUp } from 'lucide-react';

interface SignatureTrendChartProps {
  data: Array<{
    period: string;
    count: number;
    date: string;
  }>;
  loading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      date: string;
      count: number;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  
  const data = payload[0].payload;
  
  return (
    <div className="bg-gray-900 dark:bg-slate-800 px-3 py-2 rounded-lg shadow-lg border border-gray-700 dark:border-slate-600">
      <p className="text-xs text-gray-400 dark:text-slate-400 mb-1">
        {format(new Date(data.date), 'EEEE, dd MMMM', { locale: es })}
      </p>
      <p className="text-base font-semibold text-white">
        {data.count} <span className="text-sm font-normal text-gray-300">firmas</span>
      </p>
    </div>
  );
};

export default function SignatureTrendChart({ data, loading }: SignatureTrendChartProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="h-[320px] flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-400 dark:text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Cargando tendencia...</span>
          </div>
        </div>
      </div>
    );
  }

  // Calcular resumen
  const totalInPeriod = data.reduce((sum, item) => sum + item.count, 0);
  const avgPerDay = data.length > 0 ? Math.round(totalInPeriod / data.length) : 0;
  const maxDay = data.length > 0 
    ? data.reduce((max, item) => item.count > max.count ? item : max, { count: 0, date: '' })
    : { count: 0, date: '' };

  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: format(new Date(item.date), 'dd MMM', { locale: es }),
  }));

  // Estado vacio
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Tendencia de Firmas
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Evolucion en el periodo seleccionado
          </p>
        </div>
        <div className="h-[260px] flex flex-col items-center justify-center text-center">
          <TrendingUp className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-slate-400">
            No hay datos de tendencia
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            Selecciona un periodo con actividad de firmas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
      {/* Header con resumen integrado */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Tendencia de Firmas
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Evolucion en el periodo seleccionado
          </p>
        </div>
        
        {/* Mini-resumen alineado a la derecha */}
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-400">Promedio/dia</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white tabular-nums">{avgPerDay}</p>
          </div>
          <div className="w-px h-8 bg-gray-200 dark:bg-slate-700" />
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-400">Dia pico</p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 tabular-nums">{maxDay.count}</p>
          </div>
        </div>
      </div>

      {/* Grafico sin leyenda (redundante) */}
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id="colorSignatures" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            className="dark:stroke-slate-700" 
            vertical={false} 
          />
          <XAxis
            dataKey="formattedDate"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={35}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSignatures)"
            dot={false}
            activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
