'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { searchPresets } from '@/lib/search-presets';
import { useSearchPreferences } from '@/store/searchPreferences.store';
import { SearchFilters } from '@/types/search.types';
import { Sparkles } from 'lucide-react';

interface QuickPresetsBarProps {
  onApplyPreset: (query: string, filters: SearchFilters, presetId: string) => void;
}

export default function QuickPresetsBar({ onApplyPreset }: QuickPresetsBarProps) {
  const { trackPresetUsage, getPresetUsageCount } = useSearchPreferences();

  const handlePresetClick = (presetId: string) => {
    const preset = searchPresets.find((p) => p.id === presetId);
    if (preset) {
      trackPresetUsage(presetId);
      onApplyPreset(preset.query || '', preset.filters, presetId);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
      <div className="flex items-center space-x-2 mb-3">
        <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filtros Rápidos</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {searchPresets.map((preset) => {
          const Icon = preset.icon;
          const usageCount = getPresetUsageCount(preset.id);

          return (
            <Button
              key={preset.id}
              variant="ghost"
              size="sm"
              onClick={() => handlePresetClick(preset.id)}
              className="group relative bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-900/30 border border-gray-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all"
              title={preset.description}
            >
              <Icon className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
              <span className="text-gray-700 dark:text-slate-200">{preset.name}</span>
              {usageCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs border-purple-200 dark:border-purple-800"
                >
                  {usageCount}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      <p className="text-xs text-gray-600 dark:text-slate-400 mt-3">
        Aplica filtros predefinidos con un solo clic. Los números indican cuántas veces has usado cada filtro.
      </p>
    </div>
  );
}
