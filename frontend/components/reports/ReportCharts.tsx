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
  ResponsiveContainer,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

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

// Paleta de colores accesible para daltonismo - ISO 25010 Accesibilidad
const ACCESSIBLE_COLORS = [
  '#2563eb', // Azul primario
  '#059669', // Verde esmeralda
  '#dc2626', // Rojo
  '#7c3aed', // Violeta
  '#ea580c', // Naranja
  '#0891b2', // Cyan
  '#be185d', // Rosa
  '#4b5563', // Gris
];

// Tooltip con alto contraste - ISO 25010 Estetica de interfaz
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
        {label}
      </p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span 
            className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
            style={{ backgroundColor: entry.color }}
            aria-hidden="true"
          />
          <span className="text-gray-600 dark:text-slate-400">{entry.name}:</span>
          <span className="font-medium text-gray-900 dark:text-white tabular-nums">
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// Estado vacio reutilizable
const EmptyState = ({ title }: { title: string }) => (
  <div className="h-[300px] flex flex-col items-center justify-center">
    <BarChart3 className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
    <p className="text-sm text-gray-500 dark:text-slate-400">Sin datos para mostrar</p>
    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{title}</p>
  </div>
);

export function ReportBarChart({ 
  data, 
  title, 
  dataKey, 
  nameKey, 
  color = '#2563eb', 
  height = 300 
}: BarChartProps) {
  const hasData = data && data.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      
      {!hasData ? (
        <EmptyState title="Ajusta los filtros para ver datos" />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e5e7eb" 
                className="dark:stroke-slate-700"
                vertical={false}
              />
              <XAxis 
                dataKey={nameKey} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={dataKey} 
                fill={color} 
                name="Cantidad" 
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Leyenda accesible fuera del grafico */}
          <div className="flex items-center justify-center gap-2 mt-4 text-sm">
            <span 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="text-gray-600 dark:text-slate-400">Cantidad</span>
          </div>
        </>
      )}
    </div>
  );
}

export function ReportLineChart({ 
  data, 
  title, 
  dataKey, 
  nameKey, 
  color = '#059669', 
  height = 300 
}: LineChartProps) {
  const hasData = data && data.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      
      {!hasData ? (
        <EmptyState title="No hay datos de tendencia disponibles" />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e5e7eb" 
                className="dark:stroke-slate-700"
                vertical={false}
              />
              <XAxis 
                dataKey={nameKey} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={2.5}
                name="Cantidad"
                dot={false}
                activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
          
          {/* Leyenda accesible */}
          <div className="flex items-center justify-center gap-2 mt-4 text-sm">
            <span 
              className="w-3 h-0.5 rounded" 
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="text-gray-600 dark:text-slate-400">Tendencia</span>
          </div>
        </>
      )}
    </div>
  );
}

export function ReportPieChart({ 
  data, 
  title, 
  dataKey, 
  nameKey, 
  colors = ACCESSIBLE_COLORS, 
  height = 300 
}: PieChartProps) {
  const hasData = data && data.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      
      {!hasData ? (
        <EmptyState title="No hay datos de distribucion" />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey={dataKey}
                paddingAngle={2}
              >
                {data.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index % colors.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Leyenda accesible fuera del grafico - mejor para screen readers */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
            {data.slice(0, 6).map((item, index) => (
              <div key={index} className="flex items-center gap-1.5 text-sm">
                <span 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                  aria-hidden="true"
                />
                <span className="text-gray-600 dark:text-slate-400 truncate max-w-[100px]">
                  {item[nameKey]}
                </span>
              </div>
            ))}
            {data.length > 6 && (
              <span className="text-xs text-gray-400 dark:text-slate-500">
                +{data.length - 6} mas
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface MultiBarChartProps extends ChartProps {
  bars: Array<{ dataKey: string; name: string; color: string }>;
  nameKey: string;
}

export function ReportMultiBarChart({ 
  data, 
  title, 
  bars, 
  nameKey, 
  height = 300 
}: MultiBarChartProps) {
  const hasData = data && data.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      
      {!hasData ? (
        <EmptyState title="No hay datos comparativos" />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e5e7eb" 
                className="dark:stroke-slate-700"
                vertical={false}
              />
              <XAxis 
                dataKey={nameKey}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              {bars.map((bar) => (
                <Bar 
                  key={bar.dataKey} 
                  dataKey={bar.dataKey} 
                  fill={bar.color} 
                  name={bar.name} 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          
          {/* Leyenda accesible */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {bars.map((bar, index) => (
              <div key={index} className="flex items-center gap-1.5 text-sm">
                <span 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: bar.color }}
                  aria-hidden="true"
                />
                <span className="text-gray-600 dark:text-slate-400">{bar.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
