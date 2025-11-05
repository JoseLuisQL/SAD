import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export function Breadcrumb({ items, showHome = true }: BreadcrumbProps) {
  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: 'Inicio', href: '/dashboard' }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm">
      <ol className="flex items-center space-x-2">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isCurrent = item.current || isLast;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-slate-400 mx-2" aria-hidden="true" />
              )}
              
              {index === 0 && showHome && (
                <Home className="h-4 w-4 text-slate-500 mr-1" aria-hidden="true" />
              )}

              {isCurrent ? (
                <span
                  className="font-medium text-slate-900"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-600">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
