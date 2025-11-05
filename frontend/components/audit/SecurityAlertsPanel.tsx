'use client';

import { useEffect, useState } from 'react';
import { auditApi } from '@/lib/api/audit';
import { SecurityAlert } from '@/types/audit.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertTriangle, 
  Shield, 
  X,
  Eye,
  RefreshCw,
  ShieldAlert,
  Ban,
  Network,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ALERT_TYPES = {
  FAILED_ACTION: {
    label: 'Acción Fallida',
    icon: X,
    color: 'text-orange-600 bg-orange-100'
  },
  SUSPICIOUS_ACCESS: {
    label: 'Acceso Sospechoso',
    icon: Network,
    color: 'text-red-600 bg-red-100'
  },
  MASS_DELETION: {
    label: 'Eliminación Masiva',
    icon: Ban,
    color: 'text-red-600 bg-red-100'
  },
  CRITICAL_CHANGE: {
    label: 'Cambio Crítico',
    icon: Settings,
    color: 'text-yellow-600 bg-yellow-100'
  }
};

const SEVERITY_CONFIG = {
  HIGH: {
    label: 'Alta',
    color: 'bg-red-100 text-red-800 border-red-200',
    badgeColor: 'destructive'
  },
  MEDIUM: {
    label: 'Media',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    badgeColor: 'default'
  },
  LOW: {
    label: 'Baja',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    badgeColor: 'secondary'
  }
};

interface SecurityAlertsPanelProps {
  onViewDetails?: (alert: SecurityAlert) => void;
}

export function SecurityAlertsPanel({ onViewDetails }: SecurityAlertsPanelProps) {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await auditApi.getSecurityAlerts();
      setAlerts(response.data.data.alerts);
    } catch (error) {
      console.error('Error fetching security alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && alert.type !== typeFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const alertsBySeverity = {
    HIGH: alerts.filter(a => a.severity === 'HIGH').length,
    MEDIUM: alerts.filter(a => a.severity === 'MEDIUM').length,
    LOW: alerts.filter(a => a.severity === 'LOW').length
  };

  const alertsByType = Object.keys(ALERT_TYPES).reduce((acc, type) => {
    acc[type] = alerts.filter(a => a.type === type).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Total de Alertas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.length}</p>
              </div>
              <ShieldAlert className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Severidad Alta</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{alertsBySeverity.HIGH}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Severidad Media</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{alertsBySeverity.MEDIUM}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Severidad Baja</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{alertsBySeverity.LOW}</p>
              </div>
              <Shield className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <ShieldAlert className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Alertas de Seguridad
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-slate-400">
                {filteredAlerts.length} alertas en los últimos 7 días
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Severidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="MEDIUM">Media</SelectItem>
                  <SelectItem value="LOW">Baja</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {Object.entries(ALERT_TYPES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={fetchAlerts}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay alertas</h3>
              <p className="text-gray-600 dark:text-slate-400">
                {alerts.length === 0 
                  ? 'No se han detectado alertas de seguridad.'
                  : 'No hay alertas que coincidan con los filtros aplicados.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert, index) => {
                const typeConfig = ALERT_TYPES[alert.type as keyof typeof ALERT_TYPES] || {
                  label: alert.type,
                  icon: AlertTriangle,
                  color: 'text-gray-600 bg-gray-100'
                };
                const severityConfig = SEVERITY_CONFIG[alert.severity];
                const Icon = typeConfig.icon;

                return (
                  <Card 
                    key={`${alert.type}-${alert.id}-${index}`}
                    className={`border-l-4 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm ${
                      alert.severity === 'HIGH' ? 'border-l-red-500' :
                      alert.severity === 'MEDIUM' ? 'border-l-orange-500' :
                      'border-l-yellow-500'
                    } hover:shadow-md transition-shadow`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2.5 rounded-lg ${typeConfig.color} flex-shrink-0`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white">{alert.title}</h4>
                              <Badge variant={severityConfig.badgeColor as "default" | "secondary" | "destructive" | "outline"} className="text-xs">
                                {severityConfig.label}
                              </Badge>
                            </div>

                            <p className="text-sm text-gray-700 dark:text-slate-300 mb-2">{alert.description}</p>

                            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-slate-400">
                              {alert.user && (
                                <span className="flex items-center gap-1 font-medium text-gray-800">
                                  {alert.user.username}
                                </span>
                              )}
                              <span>
                                {format(new Date(alert.timestamp), "dd/MM/yyyy HH:mm", { locale: es })}
                              </span>
                              {alert.details?.ipAddress && (
                                <span className="font-mono text-gray-700">
                                  {alert.details.ipAddress}
                                </span>
                              )}
                            </div>

                            {alert.details && Object.keys(alert.details).length > 1 && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs border border-gray-200">
                                <div className="grid grid-cols-2 gap-2">
                                  {Object.entries(alert.details)
                                    .filter(([key]) => key !== 'ipAddress')
                                    .map(([key, value]) => (
                                      <div key={key} className="flex items-center gap-1">
                                        <span className="text-gray-600 font-medium">{key}:</span>
                                        <span className="text-gray-900 truncate">{JSON.stringify(value)}</span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {onViewDetails && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails(alert)}
                            className="flex-shrink-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(ALERT_TYPES).map(([type, config]) => (
          <Card key={type} className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <config.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-300">{config.label}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{alertsByType[type] || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
