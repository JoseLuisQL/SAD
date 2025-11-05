'use client';

import { Award, Mail, FileCheck, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-slate-800 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Firmantes</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Firmantes</h3>
        <p className="text-sm text-gray-600 dark:text-slate-400">Usuarios con mayor actividad de firma</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-700">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Total Firmas
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Documentos
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Última Firma
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {data.map((signer, index) => (
              <tr
                key={signer.userId}
                className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {index === 0 && (
                      <Award className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mr-2" />
                    )}
                    {index === 1 && (
                      <Award className="w-5 h-5 text-gray-400 dark:text-slate-500 mr-2" />
                    )}
                    {index === 2 && (
                      <Award className="w-5 h-5 text-amber-700 dark:text-amber-600 mr-2" />
                    )}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {index + 1}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {signer.userName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {signer.userName}
                        {index < 3 && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400">
                            Top Contributor
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {signer.userEmail}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center">
                    <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {signer.totalSignatures.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {signer.documentsCount.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {signer.lastSignatureDate ? (
                    <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(new Date(signer.lastSignatureDate), "dd MMM yyyy, HH:mm", { locale: es })}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-slate-500">Sin datos</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
