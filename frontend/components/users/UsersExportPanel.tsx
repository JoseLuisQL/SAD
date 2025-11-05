import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';

interface UsersExportPanelProps {
  onExport: (format: 'csv' | 'excel') => void;
  exporting: boolean;
}

export function UsersExportPanel({ onExport, exporting }: UsersExportPanelProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-700 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-gray-500 dark:text-slate-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
            Exportar datos de usuarios
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onExport('csv')}
            variant="outline"
            size="sm"
            disabled={exporting}
            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button
            onClick={() => onExport('excel')}
            variant="outline"
            size="sm"
            disabled={exporting}
            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>
    </div>
  );
}
