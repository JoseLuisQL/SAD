'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X, GripVertical, UserPlus } from 'lucide-react';
import { usersApi } from '@/lib/api/users';
import { toast } from 'sonner';

interface UserOption {
  id: string;
  fullName: string;
}

interface SelectedSigner {
  userId: string;
  order: number;
  userFullName: string;
}

interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
}

interface SignerSelectorProps {
  onSignersChange: (signers: Array<{ userId: string; order: number; userFullName: string }>) => void;
  initialSigners?: Array<{ userId: string; order: number; userFullName: string; }>;
  onBlur?: () => void;
}

export function SignerSelector({ onSignersChange, initialSigners = [], onBlur }: SignerSelectorProps) {
  const [availableUsers, setAvailableUsers] = useState<UserOption[]>([]);
  const [selectedSigners, setSelectedSigners] = useState<SelectedSigner[]>(initialSigners);
  const [nextOrder, setNextOrder] = useState(initialSigners.length > 0 ? Math.max(...initialSigners.map(s => s.order)) + 1 : 0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await usersApi.getAll({ page: 1, limit: 100 });
        const usersData = response.data.data?.users || response.data.data || [];
        setAvailableUsers(usersData.map((u: ApiUser) => ({ 
          id: u.id, 
          fullName: `${u.firstName} ${u.lastName}` 
        })));
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        toast.error('No se pudieron cargar los usuarios disponibles.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleAddSigner = (userId: string) => {
    const user = availableUsers.find(u => u.id === userId);
    if (user && !selectedSigners.some(s => s.userId === userId)) {
      const newSigner = { userId: user.id, order: nextOrder, userFullName: user.fullName };
      const updatedSigners = [...selectedSigners, newSigner].sort((a, b) => a.order - b.order);
      setSelectedSigners(updatedSigners);
      setNextOrder(nextOrder + 1);
      onSignersChange(updatedSigners);
    }
  };

  const handleRemoveSigner = (userId: string) => {
    const updatedSigners = selectedSigners
      .filter(s => s.userId !== userId)
      .map((s, index) => ({ ...s, order: index }));
    setSelectedSigners(updatedSigners);
    setNextOrder(updatedSigners.length > 0 ? Math.max(...updatedSigners.map(s => s.order)) + 1 : 0);
    onSignersChange(updatedSigners);
    if (onBlur) onBlur();
  };

  const filteredUsers = availableUsers.filter(u => !selectedSigners.some(s => s.userId === u.id));

  return (
    <div className="space-y-3">
      {/* Lista de firmantes seleccionados */}
      <div 
        className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden
                   bg-slate-50/50 dark:bg-slate-800/30"
        onBlur={onBlur}
      >
        {selectedSigners.length === 0 ? (
          <div className="p-4 text-center">
            <UserPlus className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No hay firmantes seleccionados
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Selecciona usuarios del menu inferior para agregarlos
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {selectedSigners.map((signer, index) => (
              <div 
                key={signer.userId} 
                className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 
                           hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* Indicador de orden */}
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 
                                  flex items-center justify-center text-xs font-semibold
                                  text-blue-700 dark:text-blue-300">
                    {index + 1}
                  </div>
                </div>
                
                {/* Nombre del firmante */}
                <span className="flex-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {signer.userFullName}
                </span>
                
                {/* Etiqueta de posicion */}
                {index === 0 && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium px-2 py-0.5 
                                   bg-blue-50 dark:bg-blue-900/30 rounded">
                    Primero
                  </span>
                )}
                {index === selectedSigners.length - 1 && selectedSigners.length > 1 && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium px-2 py-0.5 
                                   bg-emerald-50 dark:bg-emerald-900/30 rounded">
                    Ultimo
                  </span>
                )}
                
                {/* Boton eliminar */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 
                             dark:hover:bg-red-900/20 transition-colors"
                  onClick={() => handleRemoveSigner(signer.userId)}
                  aria-label={`Eliminar a ${signer.userFullName}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selector para agregar firmantes */}
      <div className="flex gap-2">
        <Select onValueChange={handleAddSigner} value="">
          <SelectTrigger 
            className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            disabled={isLoading || filteredUsers.length === 0}
          >
            <SelectValue 
              placeholder={
                isLoading 
                  ? 'Cargando usuarios...' 
                  : filteredUsers.length === 0 
                    ? 'Todos los usuarios ya estan seleccionados'
                    : 'Seleccionar firmante para agregar...'
              } 
            />
          </SelectTrigger>
          <SelectContent>
            {filteredUsers.map(user => (
              <SelectItem key={user.id} value={user.id}>
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-slate-400" />
                  {user.fullName}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Texto de ayuda */}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Los firmantes recibiran el documento en el orden listado. El siguiente firmante 
        solo podra firmar cuando el anterior haya completado su firma.
      </p>
    </div>
  );
}
