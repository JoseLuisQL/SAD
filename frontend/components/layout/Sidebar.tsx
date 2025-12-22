'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { useConfigurationStore } from '@/store/configurationStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  FileText,
  Search,
  Settings,
  X,
  Building2,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Archive,
  PieChart,
  Pen,
  GitBranch,
  BadgeCheck,
  TrendingUp,
  FileCog,
  ClipboardList,
  UserCog,
  HardDrive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  requiredModule?: string;
  requiredPermission?: string;
}

interface MenuSection {
  label: string;
  icon: React.ElementType;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    label: 'Inicio',
    icon: LayoutDashboard,
    items: [
      {
        icon: LayoutDashboard,
        label: 'Dashboard',
        href: '/dashboard',
      },
    ],
  },
  {
    label: 'Archivo',
    icon: FolderOpen,
    items: [
      {
        icon: Archive,
        label: 'Archivadores',
        href: '/dashboard/archivo/archivadores',
        requiredModule: 'archivadores',
      },
      {
        icon: FileText,
        label: 'Documentos',
        href: '/dashboard/archivo/documentos',
        requiredModule: 'documents',
      },
      {
        icon: FolderOpen,
        label: 'Expedientes',
        href: '/dashboard/archivo/expedientes',
        requiredModule: 'expedientes',
      },
      {
        icon: Search,
        label: 'Búsqueda',
        href: '/dashboard/consultas/busqueda',
        requiredModule: 'search',
      },
    ],
  },
  {
    label: 'Firma Digital',
    icon: Pen,
    items: [
      {
        icon: Pen,
        label: 'Firmar',
        href: '/dashboard/firma/firmar',
        requiredModule: 'signing',
      },
      {
        icon: GitBranch,
        label: 'Flujos',
        href: '/dashboard/firma/flujos',
        requiredModule: 'signatureFlows',
      },
      {
        icon: BadgeCheck,
        label: 'Validar',
        href: '/dashboard/firma/validar',
        requiredModule: 'signing',
      },
      {
        icon: TrendingUp,
        label: 'Analítica',
        href: '/dashboard/firma/analytics',
        requiredModule: 'analytics',
      },
    ],
  },
  {
    label: 'Reportes',
    icon: PieChart,
    items: [
      {
        icon: PieChart,
        label: 'Reportes',
        href: '/dashboard/reportes',
        requiredModule: 'reports',
      },
    ],
  },
  {
    label: 'Sistema',
    icon: Settings,
    items: [
      {
        icon: Users,
        label: 'Usuarios',
        href: '/dashboard/admin/usuarios',
        requiredModule: 'users',
      },
      {
        icon: Building2,
        label: 'Oficinas',
        href: '/dashboard/admin/oficinas',
        requiredModule: 'offices',
      },
      {
        icon: FileCog,
        label: 'Tipos de Documento',
        href: '/dashboard/admin/tipos-documento',
        requiredModule: 'documentTypes',
      },
      {
        icon: Calendar,
        label: 'Periodos',
        href: '/dashboard/admin/periodos',
        requiredModule: 'periods',
      },
      {
        icon: ClipboardList,
        label: 'Auditoría',
        href: '/dashboard/admin/auditoria',
        requiredModule: 'audit',
      },
      {
        icon: UserCog,
        label: 'Roles y Permisos',
        href: '/dashboard/roles',
        requiredModule: 'roles',
      },
      {
        icon: Settings,
        label: 'Configuración',
        href: '/dashboard/configuracion',
        requiredModule: 'configuration',
      },
      {
        icon: HardDrive,
        label: 'Copias de Seguridad',
        href: '/dashboard/seguridad/copias',
        requiredModule: 'security',
      },
    ],
  },
];

export default function Sidebar({ isOpen = true, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { hasModule } = usePermissions();
  const { config } = useConfigurationStore();
  const [expandedSections, setExpandedSections] = useState<string[]>(['Inicio', 'Archivo', 'Firma Digital', 'Sistema']);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSection = (sectionLabel: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionLabel)
        ? prev.filter((label) => label !== sectionLabel)
        : [...prev, sectionLabel]
    );
  };

  const filteredSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // Si no requiere módulo específico, mostrar siempre (ej: Dashboard)
        if (!item.requiredModule) return true;
        // Verificar si el usuario tiene el módulo
        return hasModule(item.requiredModule as any);
      }),
    }))
    .filter((section) => section.items.length > 0);

  // Ancho del sidebar: móvil siempre expandido (280px), desktop colapsable
  const sidebarWidth = isCollapsed ? '56px' : '256px';
  const mobileSidebarWidth = '280px';

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[45] lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        data-tour="sidebar"
        className={cn(
          'fixed top-0 left-0 h-screen transition-[width,transform] duration-300 ease-in-out bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-lg lg:shadow-none',
          'lg:translate-x-0 lg:z-40',
          isOpen ? 'translate-x-0 z-[50]' : '-translate-x-full z-40'
        )}
        style={{ 
          width: isMobile ? mobileSidebarWidth : sidebarWidth,
          paddingTop: isMobile ? '0px' : '64px'
        }}
      >
        <div className="h-full flex flex-col">
          {/* Mobile Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 lg:hidden bg-white dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Menú</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            </Button>
          </div>

          {/* Menu Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className={cn("space-y-1", !isCollapsed && "space-y-2")}>
            {filteredSections.map((section) => {
              const isExpanded = expandedSections.includes(section.label);

              return (
                <div key={section.label} className={cn(!isCollapsed && "mb-3")}>
                  {!isCollapsed && (
                    <button
                      onClick={() => toggleSection(section.label)}
                      className={cn(
                        "flex items-center justify-between w-full px-3 py-2 mb-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-200",
                        isExpanded
                          ? "text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800"
                          : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <section.icon className="h-4 w-4" />
                        <span>{section.label}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          'h-3.5 w-3.5 transition-transform duration-200',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </button>
                  )}
                  {isCollapsed && section.items.length > 0 && (
                    <div className="my-2 mx-auto w-8 border-t border-slate-300" />
                  )}

                  {(isExpanded || isCollapsed) && (
                    <ul className={cn('space-y-1', !isCollapsed && 'mt-2')}>
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        const primaryColor = config?.primaryColor || '#2563eb';

                        const menuItemContent = (
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                              'flex items-center rounded-lg transition-all duration-200 group relative',
                              isCollapsed ? 'p-2.5 justify-center mx-auto w-11' : 'px-3 py-2.5',
                              isActive
                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
                              !isActive && 'hover:shadow-sm'
                            )}
                          >
                            {isActive && (
                              <span 
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                                style={{ backgroundColor: primaryColor }}
                                aria-hidden="true"
                              />
                            )}
                            <Icon className={cn(
                              'transition-all duration-200',
                              isCollapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3',
                              isActive ? 'scale-110' : 'group-hover:scale-105'
                            )} />
                            {!isCollapsed && (
                              <span className="text-sm transition-all overflow-hidden">
                                {item.label}
                              </span>
                            )}
                          </Link>
                        );

                        return (
                          <li key={item.href}>
                            {isCollapsed ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  {menuItemContent}
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p>{item.label}</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              menuItemContent
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        </div>
      </aside>

      {/* Floating Toggle Button - Desktop Only */}
      <div className="hidden lg:block">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggleCollapse}
              className={cn(
                'fixed top-5 z-50 rounded-full shadow-md flex items-center justify-center',
                'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500',
                'transition-all duration-300 hover:scale-110 hover:shadow-lg',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                isCollapsed ? 'left-[44px] w-7 h-7' : 'left-[244px] w-8 h-8'
              )}
              style={{
                color: config?.primaryColor || '#2563eb'
              }}
              aria-pressed={isCollapsed}
              aria-label={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 transition-all duration-300" />
              ) : (
                <ChevronLeft className="h-4 w-4 transition-all duration-300" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            <p>{isCollapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
