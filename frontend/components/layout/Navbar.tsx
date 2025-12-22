'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { usePermissions, type ModuleName } from '@/hooks/usePermissions';
import { useConfigurationStore } from '@/store/configurationStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  HelpCircle, 
  Search, 
  Bell, 
  CheckCheck,
  PenLine,
  CheckCircle2,
  RefreshCw,
  PartyPopper,
  AlertTriangle,
  Clock,
  Sun,
  Moon,
  Monitor,
  Check,
  ChevronDown,
  Palette,
} from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { toast } from 'sonner';
import GlobalSearchCommand from '@/components/search/GlobalSearchCommand';
import { useNotifications } from '@/hooks/useNotifications';
import { HelpCenterDrawer } from '@/components/shared/HelpCenterDrawer';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NavbarProps {
  onMenuClick?: () => void;
}

const NOTIFICATION_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  SIGNATURE_PENDING: PenLine,
  SIGNATURE_COMPLETED: CheckCircle2,
  FLOW_STARTED: RefreshCw,
  FLOW_COMPLETED: PartyPopper,
  SIGNATURE_REVERTED: AlertTriangle,
  CERTIFICATE_EXPIRING: Clock,
};

const PRIORITY_COLORS = {
  URGENT: 'bg-red-500',
  HIGH: 'bg-orange-500',
  NORMAL: 'bg-blue-500',
  LOW: 'bg-gray-400'
};

export default function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { hasModule } = usePermissions();
  const { config, fetchConfig } = useConfigurationStore();
  const [helpCenterOpen, setHelpCenterOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === 'f' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada exitosamente');
    } catch {
      toast.error('Error al cerrar sesión');
    }
  };

  const primaryColor = config?.primaryColor || '#3b82f6';

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 fixed w-full z-30 top-0 h-16 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 h-full">
        <div className="flex items-center justify-between gap-4 h-full">
          {/* ZONA 1: BRANDING (Logo + Nombre del sistema) */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Abrir menú lateral"
              aria-expanded="false"
              aria-haspopup="menu"
            >
              <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            </Button>
            
            <div className="flex items-center gap-3 min-w-0">
              {config?.logoUrl ? (
                <div 
                  className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800 shrink-0 ring-1 transition-all duration-200 hover:ring-2"
                  style={{ 
                    borderColor: primaryColor,
                    '--tw-ring-color': primaryColor 
                  } as React.CSSProperties}
                >
                  <Image
                    src={config.logoUrl}
                    alt="Logo corporativo"
                    fill
                    className="object-contain p-1"
                    priority
                  />
                </div>
              ) : (
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="text-white text-lg font-bold">
                    {config?.companyName?.charAt(0) || 'D'}
                  </span>
                </div>
              )}
              
              <div className="hidden sm:block min-w-0">
                <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {config?.companyName || 'Sistema de Archivos Digitales'}
                </h1>
                {config?.companyTagline && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{config.companyTagline}</p>
                )}
              </div>
            </div>
          </div>

          {/* ZONA 2: NAVEGACIÓN SECUNDARIA (Búsqueda) */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:flex items-center" data-tour="global-search">
            <Button
              variant="outline"
              className="w-full justify-between text-sm text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
              onClick={() => setCommandOpen(true)}
              aria-label="Buscar documentos con Ctrl+K"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Buscar documentos...</span>
              </div>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-600 dark:text-slate-400 opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          {/* ZONA 3: ÁREA DE USUARIO (Acciones + Perfil) */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCommandOpen(true)}
              className="md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Buscar documentos"
            >
              <Search className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            </Button>

            <div data-tour="notifications">
              <NotificationsDropdown isAuthenticated={isAuthenticated} />
            </div>

            <UserDropdown 
              user={user}
              onLogout={handleLogout}
              primaryColor={primaryColor}
              router={router}
              hasModule={hasModule}
              onOpenHelpCenter={() => setHelpCenterOpen(true)}
            />
          </div>
        </div>
      </div>

      <HelpCenterDrawer 
        isOpen={helpCenterOpen} 
        onClose={() => setHelpCenterOpen(false)} 
      />

      <GlobalSearchCommand 
        open={commandOpen}
        onOpenChange={setCommandOpen}
      />
    </nav>
  );
}

interface NotificationsDropdownProps {
  isAuthenticated: boolean;
}

function NotificationsDropdown({ isAuthenticated }: NotificationsDropdownProps) {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications({ limit: 10 });
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    const previousCount = parseInt(localStorage.getItem('notificationCount') || '0');
    
    if (unreadCount > previousCount) {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 1000);
    }

    localStorage.setItem('notificationCount', String(unreadCount));
  }, [unreadCount]);

  const handleNotificationClick = async (notificationId: string, actionUrl?: string) => {
    await markAsRead(notificationId);
    setIsOpen(false);
    
    if (actionUrl) {
      window.location.href = actionUrl;
    }
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await markAllAsRead();
    await fetchUnreadCount();
  };

  const getNotificationIcon = (type: string) => {
    return NOTIFICATION_TYPE_ICONS[type as keyof typeof NOTIFICATION_TYPE_ICONS] || Bell;
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.NORMAL;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 ${shouldShake ? 'animate-bounce' : ''}`}
          aria-label={`Notificaciones ${unreadCount > 0 ? `(${unreadCount} sin leer)` : ''}`}
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <Bell className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-in fade-in zoom-in"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-3 border-b dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Marcar todas como leídas"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>

        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500 dark:text-slate-400">
              <Bell className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">No tienes notificaciones</p>
            </div>
          ) : (
            <div className="divide-y dark:divide-slate-700">
              {notifications.map((notification) => {
                const NotificationIcon = getNotificationIcon(notification.type);
                return (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all duration-200 ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-950 border-l-2 border-l-blue-500 dark:border-l-blue-400' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification.id, notification.actionUrl)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNotificationClick(notification.id, notification.actionUrl);
                    }
                  }}
                  aria-label={`${notification.title}. ${notification.message}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center" aria-hidden="true">
                      <NotificationIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={`text-sm ${!notification.isRead ? 'font-semibold text-slate-900 dark:text-slate-100' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)} flex-shrink-0`} aria-label="No leída" />
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-1">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: es
                          })}
                        </span>
                        
                        {notification.actionLabel && (
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            {notification.actionLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button 
                variant="ghost" 
                className="w-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200" 
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = '/dashboard/notificaciones';
                }}
              >
                Ver todas las notificaciones
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface UserDropdownProps {
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: {
      name?: string;
    };
  } | null;
  onLogout: () => void;
  primaryColor: string;
  router: {
    push: (path: string) => void;
  };
  hasModule: (module: ModuleName) => boolean;
  onOpenHelpCenter: () => void;
}

function UserDropdown({ user, onLogout, primaryColor, router, hasModule, onOpenHelpCenter }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { theme, setTheme } = useThemeStore();
  
  const handleLogoutClick = () => {
    setIsOpen(false);
    setLogoutDialogOpen(true);
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return Moon;
    if (theme === 'light') return Sun;
    return Monitor;
  };

  const ThemeIcon = getThemeIcon();
  
  return (
    <>
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 gap-2 px-2 pr-3"
          aria-label={`Menú de usuario - ${user?.firstName} ${user?.lastName}`}
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-200"
            style={{ 
              backgroundColor: `${primaryColor}10`,
              borderColor: `${primaryColor}40`,
              color: primaryColor 
            }}
          >
            {user?.firstName?.charAt(0)?.toUpperCase()}{user?.lastName?.charAt(0)?.toUpperCase()}
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate max-w-[100px] leading-tight">
              {user?.firstName}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              {user?.role?.name}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 hidden sm:block" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-72 p-0" sideOffset={8}>
        {/* Header del usuario */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold border-2"
              style={{ 
                backgroundColor: `${primaryColor}10`,
                borderColor: `${primaryColor}40`,
                color: primaryColor 
              }}
            >
              {user?.firstName?.charAt(0)?.toUpperCase()}{user?.lastName?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" aria-label="Sesión activa" />
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Sesión activa</span>
            </div>
            <Badge 
              variant="secondary" 
              className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              {user?.role?.name}
            </Badge>
          </div>
        </div>

        {/* Opciones principales */}
        <div className="p-1.5">
          <DropdownMenuItem 
            className="cursor-pointer rounded-md px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => {
              setIsOpen(false);
              router.push('/dashboard/perfil');
            }}
          >
            <User className="mr-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Mi Perfil</span>
          </DropdownMenuItem>

          {hasModule('configuration') && (
            <DropdownMenuItem 
              className="cursor-pointer rounded-md px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => {
                setIsOpen(false);
                router.push('/dashboard/configuracion');
              }}
            >
              <Settings className="mr-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Configuración</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem 
            className="cursor-pointer rounded-md px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => {
              setIsOpen(false);
              onOpenHelpCenter();
            }}
            data-tour="help-center"
          >
            <HelpCircle className="mr-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="text-sm text-slate-700 dark:text-slate-300">Centro de Ayuda</span>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-0" />

        {/* Selector de tema */}
        <div className="p-1.5">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer rounded-md px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Palette className="mr-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">Apariencia</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <ThemeIcon className="h-3.5 w-3.5" />
                <span className="capitalize">{theme === 'system' ? 'Auto' : theme === 'light' ? 'Claro' : 'Oscuro'}</span>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-44 p-1.5" sideOffset={8}>
              <DropdownMenuItem 
                onClick={() => setTheme('light')}
                className="cursor-pointer rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Sun className="mr-2.5 h-4 w-4 text-amber-500" />
                  <span className="text-sm">Claro</span>
                </div>
                {theme === 'light' && <Check className="h-4 w-4 text-green-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme('dark')}
                className="cursor-pointer rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Moon className="mr-2.5 h-4 w-4 text-indigo-500" />
                  <span className="text-sm">Oscuro</span>
                </div>
                {theme === 'dark' && <Check className="h-4 w-4 text-green-600" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme('system')}
                className="cursor-pointer rounded-md px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Monitor className="mr-2.5 h-4 w-4 text-slate-500" />
                  <span className="text-sm">Automático</span>
                </div>
                {theme === 'system' && <Check className="h-4 w-4 text-green-600" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </div>

        <DropdownMenuSeparator className="my-0" />

        {/* Cerrar sesión */}
        <div className="p-1.5">
          <DropdownMenuItem 
            onClick={handleLogoutClick} 
            className="cursor-pointer rounded-md px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors focus:bg-red-50 dark:focus:bg-red-950/50"
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>

    <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-lg">¿Cerrar sesión?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
            Se cerrará tu sesión actual. Deberás iniciar sesión nuevamente para acceder al sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel className="flex-1 sm:flex-none">Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onLogout} 
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
          >
            Cerrar Sesión
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
