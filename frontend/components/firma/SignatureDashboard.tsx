'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  FileCheck,
  Clock,
  XCircle,
  Users,
  ArrowRightCircle,
  Download,
  Shield,
  Activity
} from 'lucide-react';

interface SignatureStatistics {
  totalDocuments: number;
  totalDocumentsSigned: number;
  totalDocumentsUnsigned: number;
  totalDocumentsInFlow: number;
  totalDocumentsReverted: number;
  totalSignatures: number;
  totalActiveSignatures: number;
  totalRevertedSignatures: number;
  totalActiveFlows: number;
  signaturesByUser: Array<{
    userId: string;
    userName: string;
    count: number;
  }>;
  signaturesTrend: Array<{
    date: string;
    count: number;
  }>;
  statusDistribution: {
    unsigned: number;
    signed: number;
    partialSigned: number;
    reverted: number;
    inFlow: number;
  };
}

const COLORS = {
  signed: '#22c55e',
  unsigned: '#9ca3af',
  partialSigned: '#eab308',
  reverted: '#ef4444',
  inFlow: '#3b82f6'
};

export function SignatureDashboard() {
  const [statistics, setStatistics] = useState<SignatureStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/firma/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener estadísticas');
      }

      const data = await response.json();
      setStatistics(data.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No se pudieron cargar las estadísticas
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusDistributionData = [
    { name: 'Firmados', value: statistics.statusDistribution.signed, color: COLORS.signed },
    { name: 'Sin Firmar', value: statistics.statusDistribution.unsigned, color: COLORS.unsigned },
    { name: 'Parcialmente', value: statistics.statusDistribution.partialSigned, color: COLORS.partialSigned },
    { name: 'En Proceso', value: statistics.statusDistribution.inFlow, color: COLORS.inFlow },
    { name: 'Revertidos', value: statistics.statusDistribution.reverted, color: COLORS.reverted }
  ].filter(item => item.value > 0);

  const topSigners = statistics.signaturesByUser.slice(0, 5);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PE', { month: 'short', day: 'numeric' });
  };

  const calculateTrend = () => {
    if (statistics.signaturesTrend.length < 2) return 0;
    const recent = statistics.signaturesTrend.slice(-7);
    const older = statistics.signaturesTrend.slice(-14, -7);
    const recentAvg = recent.reduce((sum, d) => sum + d.count, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.count, 0) / older.length;
    return olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
  };

  const trend = calculateTrend();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard de Firmas</h2>
          <p className="text-base text-slate-600">
            Visualiza el estado y métricas de firma digital
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchStatistics}>
            <Activity className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900">Documentos Firmados</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <FileCheck className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{statistics.totalDocumentsSigned}</div>
            <p className="text-xs text-slate-600">
              {((statistics.totalDocumentsSigned / statistics.totalDocuments) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900">Firmas Realizadas</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{statistics.totalActiveSignatures}</div>
            <p className="text-xs text-slate-600">
              {statistics.totalRevertedSignatures} revertidas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900">Flujos Activos</CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg">
              <ArrowRightCircle className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{statistics.totalActiveFlows}</div>
            <p className="text-xs text-slate-600">
              {statistics.totalDocumentsInFlow} documentos en proceso
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-900">Tendencia</CardTitle>
            <div className={`p-2 rounded-lg ${trend >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <TrendingUp className={`h-4 w-4 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-600">
              vs. período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Line Chart - Signatures Trend */}
        <Card className="col-span-2 md:col-span-1 bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Firmas en el Tiempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statistics.signaturesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={formatDate}
                  formatter={(value) => [`${value} firmas`, 'Firmas']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Firmas"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Status Distribution */}
        <Card className="col-span-2 md:col-span-1 bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Distribución por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Signers */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <Users className="h-5 w-5 text-slate-900" />
            Top Firmantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSigners} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="userName" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Firmas Realizadas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">Resumen del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Documentos</span>
                <Badge variant="outline">{statistics.totalDocuments}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Sin Firmar</span>
                <Badge variant="secondary">{statistics.totalDocumentsUnsigned}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Firmas Totales</span>
                <Badge variant="outline">{statistics.totalSignatures}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Firmas Activas</span>
                <Badge className="bg-green-500">{statistics.totalActiveSignatures}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Revertidos</span>
                <Badge variant="destructive">{statistics.totalDocumentsReverted}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Firmas Revertidas</span>
                <Badge variant="destructive">{statistics.totalRevertedSignatures}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
