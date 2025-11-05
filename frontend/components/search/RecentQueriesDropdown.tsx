'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchPreferences } from '@/store/searchPreferences.store';
import { Button } from '@/components/ui/button';
import { Clock, Trash2, X } from 'lucide-react';

interface RecentQueriesDropdownProps {
  isVisible: boolean;
  onSelectQuery: (query: string) => void;
  onClose: () => void;
}

export default function RecentQueriesDropdown({
  isVisible,
  onSelectQuery,
  onClose,
}: RecentQueriesDropdownProps) {
  const { recentQueries, clearRecentQueries } = useSearchPreferences();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible || recentQueries.length === 0) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50"
    >
      <div className="p-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">Búsquedas recientes</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearRecentQueries}
            className="text-slate-500 hover:text-red-600 h-7 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Limpiar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-500 hover:bg-slate-100 h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {recentQueries.map((query, index) => (
          <button
            key={index}
            onClick={() => {
              onSelectQuery(query);
              onClose();
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center space-x-3 border-b border-slate-100 last:border-b-0"
          >
            <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-sm text-slate-700 truncate flex-1">{query}</span>
          </button>
        ))}
      </div>

      <div className="p-2 bg-slate-50 text-xs text-slate-500 text-center rounded-b-lg">
        Presiona Enter o haz clic en Buscar para guardar en el historial
      </div>
    </div>
  );
}
