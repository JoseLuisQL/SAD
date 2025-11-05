'use client';

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SortableHeaderProps {
  label: string;
  field: string;
  currentSort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  onSort: (field: string, order: 'asc' | 'desc') => void;
}

export default function SortableHeader({
  label,
  field,
  currentSort,
  onSort,
}: SortableHeaderProps) {
  const isActive = currentSort?.field === field;
  const currentOrder = isActive ? currentSort.order : null;

  const handleClick = () => {
    if (!isActive) {
      onSort(field, 'desc');
    } else if (currentOrder === 'desc') {
      onSort(field, 'asc');
    } else {
      onSort(field, 'desc');
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="-ml-3 h-8 hover:bg-slate-100"
      aria-label={`Ordenar por ${label}`}
    >
      <span className="font-semibold">{label}</span>
      {isActive ? (
        currentOrder === 'asc' ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowDown className="ml-2 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  );
}
