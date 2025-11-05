'use client';

import { useEffect, useState } from 'react';
import { auditApi } from '@/lib/api/audit';
import { Anomaly } from '@/types/audit.types';
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
  Clock, 
  Trash2, 
  MapPin, 
  Eye,
  Filter,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ANOMALY_TYPES = {
  OFF_HOURS_ACCESS: {
    label: 'Acceso Fuera de Horario',
    icon: Clock,
    color: 'text-orange-600 bg-orange-100'
  },
  MULTIPLE_FAILED_LOGINS: {
    label: 'Intentos Fallidos Múltiples',
    icon: Shield,
    color: 'text-red-600 bg-red-100'
  },
  MASSIVE_DELETIONS: {
    label: 'Eliminación Masiva',
    icon: Trash2,
    color: 'text-red-600 bg-red-100'
  },
  UNKNOWN_IP_ACCESS: {
    label: 'Acceso desde IP Desconocida',
    icon: MapPin,
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

interface AnomaliesPanelProps {
  onViewDetails?: (anomaly: Anomaly) => void;
}

export function AnomaliesPanel({ onViewDetails }: AnomaliesPanelProps) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const response = await auditApi.getAnomalies();
      setAnomalies(response.data.data.anomalies);
    } catch (error) {
      console.error('Error fetching anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnomalies = anomalies.filter(anomaly => {
    if (severityFilter !== 'all' && anomaly.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && anomaly.type !== typeFilter) return false;
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

  const anomaliesBySeverity = {
    HIGH: anomalies.filter(a => a.severity === 'HIGH').length,
    MEDIUM: anomalies.filter(a => a.severity === 'MEDIUM').length,
    LOW: anomalies.filter(a => a.severity === 'LOW').length
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-red-500 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-slate-300 font-medium">Severidad Alta</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{anomaliesBySeverity.HIGH}</p>
              </div>
              <div className="h-12 w-12 bg-red-50 dark:bg-red-950 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-slate-300 font-medium">Severidad Media</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{anomaliesBySeverity.MEDIUM}</p>
              </div>
              <div className="h-12 w-12 bg-orange-50 dark:bg-orange-950 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-slate-300 font-medium">Severidad Baja</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{anomaliesBySeverity.LOW}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-50 dark:bg-yellow-950 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Anomalías Detectadas
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-slate-400">
                {filteredAnomalies.length} anomalías encontradas
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
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {Object.entries(ANOMALY_TYPES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={fetchAnomalies}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAnomalies.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No se encontraron anomalías</h3>
              <p className="text-gray-600 dark:text-slate-400">
                {anomalies.length === 0 
                  ? 'No hay anomalías detectadas en el sistema.'
                  : 'No hay anomalías que coincidan con los filtros aplicados.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnomalies.map((anomaly, index) => {
                const typeConfig = ANOMALY_TYPES[anomaly.type as keyof typeof ANOMALY_TYPES] || {
                  label: anomaly.type,
                  icon: AlertTriangle,
                  color: 'text-gray-600 bg-gray-100'
                };
                const severityConfig = SEVERITY_CONFIG[anomaly.severity];
                const Icon = typeConfig.icon;

                return (
                  <Card 
                    key={`${anomaly.type}-${anomaly.id}-${index}`} 
                    className={`border-l-4 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow ${
                      anomaly.severity === 'HIGH' ? 'border-l-red-500' :
                      anomaly.severity === 'MEDIUM' ? 'border-l-orange-500' :
                      'border-l-yellow-500'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-3 rounded-lg ${typeConfig.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">{typeConfig.label}</h4>
                              <Badge variant={severityConfig.badgeColor as "default" | "secondary" | "destructive" | "outline"}>
                                {severityConfig.label}
                              </Badge>
                            </div>

                            <p className="text-sm text-gray-700 dark:text-slate-300">{anomaly.description}</p>

                            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-slate-400">
                              {anomaly.user && (
                                <span className="flex items-center gap-1">
                                  <strong className="text-gray-800">Usuario:</strong> {anomaly.user.username} ({anomaly.user.fullName})
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(anomaly.timestamp), "dd/MM/yyyy HH:mm", { locale: es })}
                              </span>
                              {anomaly.details?.ipAddress && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {anomaly.details.ipAddress}
                                </span>
                              )}
                            </div>

                            {anomaly.details && Object.keys(anomaly.details).length > 0 && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs border border-gray-200">
                                <strong className="text-gray-800">Detalles:</strong>
                                <div className="mt-1 space-y-1">
                                  {Object.entries(anomaly.details).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2">
                                      <span className="text-gray-600">{key}:</span>
                                      <span className="text-gray-900">{JSON.stringify(value)}</span>
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
                            onClick={() => onViewDetails(anomaly)}
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
    </div>
  );
}
