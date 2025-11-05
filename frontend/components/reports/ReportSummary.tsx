'use client';

import { FileText, Users, FileSignature, TrendingUp } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'violet';
}

function SummaryCard({ title, value, icon, description, color = 'blue' }: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/30',
    green: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30',
    amber: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30',
    red: 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 dark:border-red-500/30',
    violet: 'bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 dark:border-violet-500/30',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-3">{title}</p>
          <p className="text-4xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 dark:text-slate-500 mt-2">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]} flex-shrink-0 ml-4`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface DocumentReportSummaryProps {
  summary: {
    totalDocuments: number;
    totalFolios: number;
    signedDocuments: number;
    ocrDocuments: number;
    unsignedDocuments: number;
    pendingOcr: number;
  };
}

export function DocumentReportSummary({ summary }: DocumentReportSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <SummaryCard
        title="Total Documentos"
        value={summary.totalDocuments}
        icon={<FileText className="h-5 w-5" />}
        color="blue"
      />
      <SummaryCard
        title="Total Folios"
        value={summary.totalFolios}
        icon={<FileText className="h-5 w-5" />}
        color="violet"
      />
      <SummaryCard
        title="Documentos Firmados"
        value={summary.signedDocuments}
        icon={<FileSignature className="h-5 w-5" />}
        color="green"
        description={`Sin firmar: ${summary.unsignedDocuments}`}
      />
      <SummaryCard
        title="Procesados con OCR"
        value={summary.ocrDocuments}
        icon={<TrendingUp className="h-5 w-5" />}
        color="amber"
        description={`Pendientes: ${summary.pendingOcr}`}
      />
    </div>
  );
}

interface UserActivityReportSummaryProps {
  summary: {
    totalActions: number;
    uniqueUsers: number;
    uniqueModules: number;
    uniqueActions: number;
  };
}

export function UserActivityReportSummary({ summary }: UserActivityReportSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <SummaryCard
        title="Total Acciones"
        value={summary.totalActions}
        icon={<TrendingUp className="h-5 w-5" />}
        color="blue"
      />
      <SummaryCard
        title="Usuarios Activos"
        value={summary.uniqueUsers}
        icon={<Users className="h-5 w-5" />}
        color="green"
      />
      <SummaryCard
        title="Módulos Accedidos"
        value={summary.uniqueModules}
        icon={<FileText className="h-5 w-5" />}
        color="violet"
      />
      <SummaryCard
        title="Tipos de Acciones"
        value={summary.uniqueActions}
        icon={<FileSignature className="h-5 w-5" />}
        color="amber"
      />
    </div>
  );
}

interface SignatureReportSummaryProps {
  summary: {
    totalSignatures: number;
    validSignatures: number;
    revertedSignatures: number;
    invalidSignatures: number;
    activeFlows: number;
    completedFlows: number;
  };
}

export function SignatureReportSummary({ summary }: SignatureReportSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <SummaryCard
        title="Total Firmas"
        value={summary.totalSignatures}
        icon={<FileSignature className="h-5 w-5" />}
        color="blue"
      />
      <SummaryCard
        title="Firmas Válidas"
        value={summary.validSignatures}
        icon={<FileSignature className="h-5 w-5" />}
        color="green"
        description={`Inválidas: ${summary.invalidSignatures}`}
      />
      <SummaryCard
        title="Firmas Revertidas"
        value={summary.revertedSignatures}
        icon={<TrendingUp className="h-5 w-5" />}
        color="amber"
      />
      <SummaryCard
        title="Flujos Activos"
        value={summary.activeFlows}
        icon={<FileText className="h-5 w-5" />}
        color="violet"
        description={`Completados: ${summary.completedFlows}`}
      />
    </div>
  );
}
