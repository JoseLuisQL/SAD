import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface UsersRoleChartProps {
  data: Array<{ roleName: string; count: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export function UsersRoleChart({ data }: UsersRoleChartProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Distribución de Usuarios por Rol
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="roleName"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgb(15 23 42)', 
              border: '1px solid rgb(51 65 85)',
              borderRadius: '0.5rem',
              color: 'rgb(226 232 240)'
            }}
            itemStyle={{ color: 'rgb(226 232 240)' }}
            labelStyle={{ color: 'rgb(226 232 240)' }}
          />
          <Legend 
            wrapperStyle={{ color: 'rgb(148 163 184)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
