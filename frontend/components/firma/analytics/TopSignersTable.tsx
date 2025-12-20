'use client';

import { Users } from 'lucide-react';

interface TopSignersTableProps {
  data: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    totalSignatures: number;
    documentsCount: number;
    lastSignatureDate: Date | null;
  }>;
  loading?: boolean;
}

export default function TopSignersTable({ data, loading }: TopSignersTableProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
              <div className="flex-1 h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Top Firmantes
        </h3>
        <div className="h-[260px] flex flex-col items-center justify-center text-center">
          <Users className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Sin actividad de firmantes
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            Los usuarios apareceran aqui cuando firmen documentos
          </p>
        </div>
      </div>
    );
  }

  const getPositionStyles = (index: number): string => {
    if (index === 0) return 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400';
    if (index === 1) return 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-slate-300';
    if (index === 2) return 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400';
    return 'bg-transparent text-gray-400 dark:text-slate-500';
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Top Firmantes
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Usuarios mas activos
          </p>
        </div>
        <span className="text-xs text-gray-400 dark:text-slate-500 tabular-nums">
          Total: {data.length}
        </span>
      </div>

      <div className="space-y-1">
        {data.slice(0, 7).map((signer, index) => (
          <div
            key={signer.userId}
            className="flex items-center gap-3 p-2.5 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            {/* Posicion - numero simple */}
            <span className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
              ${getPositionStyles(index)}
            `}>
              {index + 1}
            </span>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
              {getInitials(signer.userName)}
            </div>

            {/* Nombre y conteo de docs */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {signer.userName}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {signer.documentsCount.toLocaleString()} docs
              </p>
            </div>

            {/* Conteo de firmas - Destacado */}
            <div className="text-right flex-shrink-0">
              <p className="text-base font-semibold text-gray-900 dark:text-white tabular-nums">
                {signer.totalSignatures.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500">firmas</p>
            </div>
          </div>
        ))}
      </div>

      {data.length > 7 && (
        <button 
          className="w-full mt-4 py-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
          aria-label={`Ver todos los ${data.length} firmantes`}
        >
          Ver todos ({data.length})
        </button>
      )}
    </div>
  );
}
