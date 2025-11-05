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
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Trash2, Shield, Copy, MoreVertical, AlertCircle, Search } from 'lucide-react';

interface RolesTableProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onViewPermissions: (role: Role) => void;
  onDuplicate?: (role: Role) => void;
  onViewImpact?: (role: Role) => void;
}

export default function RolesTable({ 
  roles, 
  onEdit, 
  onDelete, 
  onViewPermissions,
  onDuplicate,
  onViewImpact
}: RolesTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const getPermissionsCount = (role: Role): number => {
    if (!role.permissions || typeof role.permissions !== 'object') return 0;
    
    let count = 0;
    Object.values(role.permissions).forEach((modulePerms: any) => {
      if (typeof modulePerms === 'object') {
        count += Object.values(modulePerms).filter(v => v === true).length;
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
          className="pl-10 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400"
        />
      </div>

      <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
        <Table className="bg-white dark:bg-slate-900">
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800">
              <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">Nombre</TableHead>
              <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">Descripción</TableHead>
              <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">Permisos</TableHead>
              <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">Módulos</TableHead>
              <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 bg-gray-50 dark:bg-slate-800">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-slate-500" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {searchQuery ? 'No se encontraron roles' : 'No hay roles registrados'}
                  </h3>
                  <p className="text-gray-500 dark:text-slate-400">
                    {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Crea un nuevo rol para comenzar'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((role, index) => (
                <TableRow 
                  key={role.id}
                  className={`${
                    index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50/50 dark:bg-slate-800/50'
                  } hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors`}
                >
                  <TableCell className="font-semibold text-gray-900 dark:text-slate-100">{role.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-gray-800 dark:text-slate-200 font-medium">
                    {role.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium">
                      {getPermissionsCount(role)} permisos
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-medium">
                      {getModulesCount(role)} módulos
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewPermissions(role)}
                        title="Ver permisos"
                        className="hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <Shield className="h-4 w-4 text-gray-700 dark:text-slate-300" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(role)}
                        title="Editar"
                        className="hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <Edit className="h-4 w-4 text-gray-700 dark:text-slate-300" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" title="Más acciones" className="hover:bg-gray-100 dark:hover:bg-slate-700">
                            <MoreVertical className="h-4 w-4 text-gray-700 dark:text-slate-300" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="dark:bg-slate-800 dark:border-slate-700">
                          {onDuplicate && (
                            <DropdownMenuItem onClick={() => onDuplicate(role)} className="cursor-pointer dark:hover:bg-slate-700 dark:text-slate-200">
                              <Copy className="mr-2 h-4 w-4 text-gray-700 dark:text-slate-300" />
                              Duplicar
                            </DropdownMenuItem>
                          )}
                          {onViewImpact && (
                            <DropdownMenuItem onClick={() => onViewImpact(role)} className="cursor-pointer dark:hover:bg-slate-700 dark:text-slate-200">
                              <AlertCircle className="mr-2 h-4 w-4 text-gray-700 dark:text-slate-300" />
                              Ver Impacto
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => onDelete(role)}
                            className="text-red-600 dark:text-red-400 cursor-pointer dark:hover:bg-slate-700"
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
