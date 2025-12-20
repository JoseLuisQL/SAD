'use client';

import { FileText, Users, FileSignature, TrendingUp, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  tooltip?: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'violet';
}

function SummaryCard({ title, value, icon, description, tooltip, color = 'blue' }: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    green: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
    violet: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5 hover:shadow-md hover:border-gray-300 dark:hover:border-slate-600 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
              {title}
            </p>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      type="button" 
                      className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                      aria-label={`Informacion sobre ${title}`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-sm">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-sm text-gray-500 dark:text-slate-500 mt-1.5">
              {description}
            </p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-lg flex-shrink-0 ml-4", colorClasses[color])}>
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
        tooltip="Numero total de documentos digitalizados en el periodo seleccionado"
      />
      <SummaryCard
        title="Total Folios"
        value={summary.totalFolios}
        icon={<FileText className="h-5 w-5" />}
        color="violet"
        tooltip="Suma de todas las paginas de los documentos digitalizados"
      />
      <SummaryCard
        title="Documentos Firmados"
        value={summary.signedDocuments}
        icon={<FileSignature className="h-5 w-5" />}
        color="green"
        description={`Sin firmar: ${summary.unsignedDocuments.toLocaleString()}`}
        tooltip="Documentos que cuentan con al menos una firma digital valida"
      />
      <SummaryCard
        title="Procesados con OCR"
        value={summary.ocrDocuments}
        icon={<TrendingUp className="h-5 w-5" />}
        color="amber"
        description={`Pendientes: ${summary.pendingOcr.toLocaleString()}`}
        tooltip="Documentos a los que se les ha extraido texto mediante reconocimiento optico de caracteres"
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
        tooltip="Numero total de acciones registradas en el sistema durante el periodo"
      />
      <SummaryCard
        title="Usuarios Activos"
        value={summary.uniqueUsers}
        icon={<Users className="h-5 w-5" />}
        color="green"
        tooltip="Cantidad de usuarios unicos que han realizado al menos una accion"
      />
      <SummaryCard
        title="Modulos Accedidos"
        value={summary.uniqueModules}
        icon={<FileText className="h-5 w-5" />}
        color="violet"
        tooltip="Numero de modulos del sistema que han sido utilizados"
      />
      <SummaryCard
        title="Tipos de Acciones"
        value={summary.uniqueActions}
        icon={<FileSignature className="h-5 w-5" />}
        color="amber"
        tooltip="Variedad de tipos de acciones diferentes realizadas (crear, editar, eliminar, etc.)"
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
        tooltip="Numero total de firmas digitales realizadas en el periodo"
      />
      <SummaryCard
        title="Firmas Validas"
        value={summary.validSignatures}
        icon={<FileSignature className="h-5 w-5" />}
        color="green"
        description={`Invalidas: ${summary.invalidSignatures.toLocaleString()}`}
        tooltip="Firmas digitales que han sido verificadas correctamente por el sistema"
      />
      <SummaryCard
        title="Firmas Revertidas"
        value={summary.revertedSignatures}
        icon={<TrendingUp className="h-5 w-5" />}
        color="amber"
        tooltip="Firmas que han sido anuladas o revertidas por el usuario"
      />
      <SummaryCard
        title="Flujos Activos"
        value={summary.activeFlows}
        icon={<FileText className="h-5 w-5" />}
        color="violet"
        description={`Completados: ${summary.completedFlows.toLocaleString()}`}
        tooltip="Flujos de firma que estan en proceso y pendientes de completar"
      />
    </div>
  );
}
