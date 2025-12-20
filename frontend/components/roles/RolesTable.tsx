'use client';

import { useState } from 'react';
import { Role } from '@/types/user.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Edit, Trash2, Shield, Copy, MoreVertical, AlertCircle, Search, Eye, Plus } from 'lucide-react';

interface RolesTableProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onViewPermissions: (role: Role) => void;
  onDuplicate?: (role: Role) => void;
  onViewImpact?: (role: Role) => void;
  onCreateRole?: () => void;
}

export default function RolesTable({ 
  roles, 
  onEdit, 
  onDelete, 
  onViewPermissions,
  onDuplicate,
  onViewImpact,
  onCreateRole
}: RolesTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const getPermissionsCount = (role: Role): number => {
    if (!role.permissions || typeof role.permissions !== 'object') return 0;
    
    let count = 0;
    Object.values(role.permissions).forEach((modulePerms: unknown) => {
      if (typeof modulePerms === 'object' && modulePerms !== null) {
        count += Object.values(modulePerms as Record<string, boolean>).filter(v => v === true).length;
      }
    });
    return count;
  };

  const getModulesCount = (role: Role): number => {
    if (!role.permissions || typeof role.permissions !== 'object') return 0;
    return Object.keys(role.permissions).length;
  };

  const filteredRoles = roles.filter(role => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      role.name.toLowerCase().includes(query) ||
      (role.description && role.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
        <Input
          placeholder="Buscar roles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
          aria-label="Buscar roles"
        />
      </div>

      <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
        <Table className="bg-white dark:bg-slate-900" aria-label="Lista de roles del sistema">
          <TableHeader>
            <TableRow className="bg-gray-50/80 dark:bg-slate-800/80 hover:bg-gray-50/80 dark:hover:bg-slate-800/80 border-b border-gray-100 dark:border-slate-700">
              <TableHead className="font-medium text-xs text-gray-500 dark:text-slate-400 py-3">Rol</TableHead>
              <TableHead className="font-medium text-xs text-gray-500 dark:text-slate-400 py-3">Alcance</TableHead>
              <TableHead className="font-medium text-xs text-gray-500 dark:text-slate-400 py-3 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-16 bg-white dark:bg-slate-900">
                  <div className="max-w-sm mx-auto">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-gray-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                      {searchQuery ? 'Sin resultados' : 'No hay roles'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                      {searchQuery 
                        ? 'No se encontraron roles que coincidan con tu busqueda.' 
                        : 'Los roles definen que acciones pueden realizar los usuarios en cada modulo del sistema.'}
                    </p>
                    {!searchQuery && onCreateRole && (
                      <Button onClick={onCreateRole} size="sm" className="mt-2">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear primer rol
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((role) => (
                <TableRow 
                  key={role.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors border-b border-gray-100 dark:border-slate-800 last:border-b-0"
                  tabIndex={0}
                  role="row"
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                        <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{role.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-xs">
                          {role.description || 'Sin descripcion'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {getPermissionsCount(role)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        permisos en {getModulesCount(role)} modulos
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider delayDuration={300}>
                      <div className="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onViewPermissions(role)}
                              className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              aria-label="Ver permisos asignados"
                            >
                              <Eye className="h-4 w-4 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>Ver permisos</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(role)}
                              className="h-8 w-8 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                              aria-label="Editar rol"
                            >
                              <Edit className="h-4 w-4 text-gray-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>Editar</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <DropdownMenu>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-700"
                                  aria-label="Mas acciones"
                                >
                                  <MoreVertical className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                                </Button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Mas opciones</p>
                            </TooltipContent>
                          </Tooltip>
                          <DropdownMenuContent align="end" className="dark:bg-slate-800 dark:border-slate-700 min-w-[140px]">
                            {onDuplicate && (
                              <DropdownMenuItem onClick={() => onDuplicate(role)} className="cursor-pointer dark:hover:bg-slate-700 dark:text-slate-200">
                                <Copy className="mr-2 h-4 w-4 text-gray-500 dark:text-slate-400" />
                                Duplicar
                              </DropdownMenuItem>
                            )}
                            {onViewImpact && (
                              <DropdownMenuItem onClick={() => onViewImpact(role)} className="cursor-pointer dark:hover:bg-slate-700 dark:text-slate-200">
                                <AlertCircle className="mr-2 h-4 w-4 text-gray-500 dark:text-slate-400" />
                                Ver impacto
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => onDelete(role)}
                              className="text-red-600 dark:text-red-400 cursor-pointer dark:hover:bg-slate-700 focus:text-red-600 dark:focus:text-red-400"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
