'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { X } from 'lucide-react';
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
  onSignersChange: (signers: Array<{ userId: string; order: number }>) => void;
  initialSigners?: Array<{ userId: string; order: number; userFullName: string; }>;
}

export function SignerSelector({ onSignersChange, initialSigners = [] }: SignerSelectorProps) {
  const [availableUsers, setAvailableUsers] = useState<UserOption[]>([]);
  const [selectedSigners, setSelectedSigners] = useState<SelectedSigner[]>(initialSigners);
  const [nextOrder, setNextOrder] = useState(initialSigners.length > 0 ? Math.max(...initialSigners.map(s => s.order)) + 1 : 0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await usersApi.getAll({ page: 1, limit: 100 });
        const usersData = response.data.data?.users || response.data.data || [];
        setAvailableUsers(usersData.map((u: ApiUser) => ({ 
          id: u.id, 
          fullName: `${u.firstName} ${u.lastName}` 
        })));
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        toast.error('No se pudieron cargar los usuarios disponibles.');
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
      onSignersChange(updatedSigners.map(s => ({ userId: s.userId, order: s.order })));
    }
  };

  const handleRemoveSigner = (userId: string) => {
    const updatedSigners = selectedSigners.filter(s => s.userId !== userId).map((s, index) => ({ ...s, order: index }));
    setSelectedSigners(updatedSigners);
    setNextOrder(updatedSigners.length > 0 ? Math.max(...updatedSigners.map(s => s.order)) + 1 : 0);
    onSignersChange(updatedSigners.map(s => ({ userId: s.userId, order: s.order })));
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-slate-900 dark:text-slate-200">Firmantes en el Flujo (en orden)</Label>
      <div className="border border-slate-200 dark:border-slate-700 rounded-md p-3 space-y-2 bg-slate-50/50 dark:bg-slate-800/50">
        {selectedSigners.length === 0 && <p className="text-sm text-slate-600 dark:text-slate-400">No hay firmantes seleccionados.</p>}
        {selectedSigners.map((signer, index) => (
          <div key={signer.userId} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm">
            <span className="text-sm text-slate-900 dark:text-slate-100">{index + 1}. {signer.userFullName}</span>
            <Button variant="ghost" size="sm" onClick={() => handleRemoveSigner(signer.userId)}>
              <X className="h-4 w-4 text-red-500 dark:text-red-400" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Select onValueChange={handleAddSigner}>
          <SelectTrigger className="flex-grow bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <SelectValue placeholder="Añadir firmante" />
          </SelectTrigger>
          <SelectContent>
            {availableUsers.filter(u => !selectedSigners.some(s => s.userId === u.id)).map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
