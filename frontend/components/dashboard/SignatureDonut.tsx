'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SignatureDonutProps {
  completed: number;
  partial: number;
  pending: number;
}

const COLORS = {
  completed: '#10b981',
  partial: '#f59e0b',
  pending: '#94a3b8',
};

const LABELS = {
  completed: 'Firmados',
  partial: 'Parciales',
  pending: 'Pendientes',
};

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg shadow-sm">
        <p className="text-xs font-semibold text-slate-900 dark:text-white mb-1">{payload[0].name}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          <span className="font-medium">{payload[0].value}</span> documento{payload[0].value !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
};

export function SignatureDonut({ completed, partial, pending }: SignatureDonutProps) {
  const data = [
    { name: LABELS.completed, value: completed, color: COLORS.completed },
    { name: LABELS.partial, value: partial, color: COLORS.partial },
    { name: LABELS.pending, value: pending, color: COLORS.pending },
  ];

  const total = completed + partial + pending;

  return (
    <Card className="border border-gray-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="bg-white dark:bg-slate-900">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
          Estados de Firma
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-white dark:bg-slate-900">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{ color: '#94a3b8' }}
              formatter={(value: string, entry: { payload: { value: number } }) => (
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {value} ({entry.payload.value})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        {total > 0 && (
          <div className="mt-4 text-center bg-white dark:bg-slate-900">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{total}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Total de documentos</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
