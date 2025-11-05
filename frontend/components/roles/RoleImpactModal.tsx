'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRoles } from '@/hooks/useRoles';
import { Users, Shield, Activity, AlertCircle } from 'lucide-react';

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] dark:bg-slate-900 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Análisis de Impacto del Rol</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-slate-400">
            Visualiza el impacto de este rol en el sistema
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        ) : impact ? (
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{impact.role.name}</h3>
                {impact.role.description && (
                  <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">{impact.role.description}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">Usuarios Totales</CardTitle>
                    <Users className="h-4 w-4 text-gray-600 dark:text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{impact.totalUsers}</div>
                    <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                      {impact.activeUsers} activos
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">Módulos</CardTitle>
                    <Shield className="h-4 w-4 text-gray-600 dark:text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{impact.moduleCount}</div>
                    <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                      con permisos asignados
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">Permisos Totales</CardTitle>
                    <Activity className="h-4 w-4 text-gray-600 dark:text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{impact.totalPermissions}</div>
                    <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                      acciones permitidas
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">Estado</CardTitle>
                    <AlertCircle className="h-4 w-4 text-gray-600 dark:text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {impact.totalUsers === 0 ? '✓' : '⚠'}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                      {impact.totalUsers === 0 ? 'Sin usuarios' : 'Con usuarios asignados'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {impact.affectedUsers.length > 0 && (
                <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Usuarios Afectados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {impact.affectedUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{user.name}</p>
                            <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">{user.email}</p>
                          </div>
                          <Badge variant={user.isActive ? 'default' : 'secondary'} className={!user.isActive ? 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 font-medium' : ''}>
                            {user.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {impact.totalUsers > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">Advertencia</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1 font-medium">
                        Este rol tiene {impact.totalUsers} usuario(s) asignado(s). 
                        Cualquier cambio en los permisos afectará a estos usuarios inmediatamente.
                      </p>
                    </div>
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
