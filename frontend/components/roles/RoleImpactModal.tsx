'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRoles } from '@/hooks/useRoles';
import { Users, Shield, Activity, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';

interface RoleImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: string | null;
}

interface ImpactData {
  role: {
    id: string;
    name: string;
    description: string | null;
  };
  affectedUsers: Array<{
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  }>;
  totalUsers: number;
  activeUsers: number;
  moduleCount: number;
  totalPermissions: number;
}

export default function RoleImpactModal({ isOpen, onClose, roleId }: RoleImpactModalProps) {
  const { fetchRoleImpact } = useRoles();
  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && roleId) {
      const loadImpact = async () => {
        try {
          setLoading(true);
          const data = await fetchRoleImpact(roleId);
          setImpact(data);
        } catch (error) {
          console.error('Error al cargar impacto:', error);
        } finally {
          setLoading(false);
        }
      };

      loadImpact();
    }
  }, [isOpen, roleId, fetchRoleImpact]);

  const metrics = impact ? [
    { label: 'Usuarios', value: impact.totalUsers, desc: `${impact.activeUsers} activos`, icon: Users },
    { label: 'Modulos', value: impact.moduleCount, desc: 'con permisos', icon: Shield },
    { label: 'Permisos', value: impact.totalPermissions, desc: 'acciones', icon: Activity },
  ] : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] dark:bg-slate-900 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Analisis de Impacto
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-slate-400">
            Visualiza el impacto de cambios en este rol
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-500 dark:text-slate-400">Analizando impacto...</span>
            </div>
          </div>
        ) : impact ? (
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {/* Nombre del rol */}
              <div className="pb-3 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-medium text-gray-900 dark:text-white">{impact.role.name}</h3>
                {impact.role.description && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{impact.role.description}</p>
                )}
              </div>

              {/* Metricas */}
              <div className="grid grid-cols-3 gap-3">
                {metrics.map((metric) => {
                  const IconComponent = metric.icon;
                  return (
                    <div 
                      key={metric.label}
                      className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg text-center"
                    >
                      <div className="flex items-center justify-center gap-1.5 text-gray-500 dark:text-slate-400 mb-1">
                        <IconComponent className="h-3.5 w-3.5" />
                        <span className="text-xs">{metric.label}</span>
                      </div>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {metric.value}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {metric.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Estado del rol */}
              <div className={`p-3 rounded-lg flex items-center gap-3 ${
                impact.totalUsers === 0 
                  ? 'bg-green-50 dark:bg-green-900/20' 
                  : 'bg-amber-50 dark:bg-amber-900/20'
              }`}>
                {impact.totalUsers === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    impact.totalUsers === 0 
                      ? 'text-green-900 dark:text-green-200' 
                      : 'text-amber-900 dark:text-amber-200'
                  }`}>
                    {impact.totalUsers === 0 
                      ? 'Sin usuarios asignados' 
                      : `${impact.totalUsers} usuario(s) afectado(s)`
                    }
                  </p>
                  {impact.totalUsers > 0 && (
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                      Los cambios se aplicaran inmediatamente
                    </p>
                  )}
                </div>
              </div>

              {/* Lista de usuarios */}
              {impact.affectedUsers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                    Usuarios Afectados
                  </h4>
                  <div className="space-y-1">
                    {impact.affectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-slate-800/50 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">{user.email}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          user.isActive 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                        }`}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
