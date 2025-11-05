import { Users, UserCheck, Shield, UserCog } from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';

interface UsersStatsProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: Array<{ roleId: string; roleName: string; count: number }>;
  };
}

export function UsersStats({ stats }: UsersStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Total de Usuarios"
        value={stats.totalUsers}
        icon={Users}
        color="blue"
        description="usuarios registrados"
      />
      <MetricCard
        title="Usuarios Activos"
        value={stats.activeUsers}
        icon={UserCheck}
        color="green"
        description={`Inactivos: ${stats.inactiveUsers}`}
      />
      <MetricCard
        title="Administradores"
        value={stats.usersByRole.find(r => r.roleName === 'Administrador')?.count || 0}
        icon={Shield}
        color="violet"
        description="con acceso total"
      />
      <MetricCard
        title="Operadores"
        value={stats.usersByRole.find(r => r.roleName === 'Operador')?.count || 0}
        icon={UserCog}
        color="amber"
        description="con permisos limitados"
      />
    </div>
  );
}
