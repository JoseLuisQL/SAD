'use client';

import { useState } from 'react';
import { useSearchPreferences } from '@/store/searchPreferences.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BookmarkPlus,
  Star,
  Trash2,
  Edit2,
  Calendar,
  Search,
  MoreHorizontal,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { SearchFilters } from '@/types/search.types';

const saveSearchSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(40, 'El nombre no puede exceder 40 caracteres'),
});

type SaveSearchFormData = z.infer<typeof saveSearchSchema>;

interface SavedSearchBarProps {
  currentQuery: string;
  currentFilters: SearchFilters;
  onApplySearch: (query: string, filters: SearchFilters, source: 'saved') => void;
}

export default function SavedSearchBar({
  currentQuery,
  currentFilters,
  onApplySearch,
}: SavedSearchBarProps) {
  const { savedSearches, addSavedSearch, removeSavedSearch, updateSavedSearch, applySavedSearch } =
    useSearchPreferences();

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [viewAllDialogOpen, setViewAllDialogOpen] = useState(false);
  const [editingSearchId, setEditingSearchId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SaveSearchFormData>({
    resolver: zodResolver(saveSearchSchema),
  });

  const visibleSearches = savedSearches.slice(0, 6);
  const hasMoreSearches = savedSearches.length > 6;

  const handleSaveSearch = (data: SaveSearchFormData) => {
    // Validar que hay algo que guardar
    const hasQuery = currentQuery && currentQuery.trim() !== '';
    const hasFilters = Object.values(currentFilters).some(v => v && v !== '');
    
    if (!hasQuery && !hasFilters) {
      toast.error('Debes tener al menos un término de búsqueda o filtro activo para guardar');
      return;
    }

    const existingSearch = savedSearches.find(
      (s) => s.name.toLowerCase() === data.name.toLowerCase()
    );

    if (existingSearch && existingSearch.id !== editingSearchId) {
      toast.error('Ya existe una búsqueda con ese nombre');
      return;
    }

    if (editingSearchId) {
      updateSavedSearch(editingSearchId, data.name, currentQuery, currentFilters);
      toast.success('Búsqueda actualizada correctamente');
      setEditingSearchId(null);
    } else {
      addSavedSearch(data.name, currentQuery, currentFilters);
      toast.success('Búsqueda guardada correctamente');
    }

    reset();
    setSaveDialogOpen(false);
  };

  const handleApply = (id: string) => {
    const search = applySavedSearch(id);
    if (search) {
      // Verificar que la búsqueda tenga al menos query o filtros
      const hasQuery = search.query && search.query.trim() !== '';
      const hasFilters = Object.keys(search.filters).length > 0;
      
      if (!hasQuery && !hasFilters) {
        toast.error('Esta búsqueda no tiene parámetros. Por favor, elimínala y crea una nueva.');
        return;
      }
      
      onApplySearch(search.query, search.filters, 'saved');
      toast.success(`Búsqueda "${search.name}" aplicada`);
    }
  };

  const handleEdit = (id: string) => {
    const search = savedSearches.find((s) => s.id === id);
    if (search) {
      setEditingSearchId(id);
      setValue('name', search.name);
      setSaveDialogOpen(true);
    }
  };

  const handleDelete = (id: string, name: string) => {
    removeSavedSearch(id);
    toast.success(`Búsqueda "${name}" eliminada`);
  };

  const handleNewSearch = () => {
    setEditingSearchId(null);
    reset({ name: '' });
    setSaveDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const hasActiveSearch = (currentQuery && currentQuery.trim() !== '') || Object.values(currentFilters).some(v => v && v !== '');

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm" data-tour="search-saved">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Star className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-900">Búsquedas Guardadas</h3>
        </div>

        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNewSearch}
              disabled={!hasActiveSearch}
              className="text-blue-600 hover:bg-blue-50"
            >
              <BookmarkPlus className="h-4 w-4 mr-1" />
              Guardar actual
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSearchId ? 'Editar Búsqueda' : 'Guardar Búsqueda'}
              </DialogTitle>
              <DialogDescription>
                Dale un nombre descriptivo a esta búsqueda para encontrarla fácilmente después
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleSaveSearch)}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la búsqueda</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Oficios firmados enero 2025"
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                  <p className="text-xs font-medium text-slate-700">Vista previa:</p>
                  {currentQuery && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Consulta:</span> {currentQuery}
                    </p>
                  )}
                  {Object.keys(currentFilters).length > 0 && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Filtros:</span> {Object.keys(currentFilters).length}{' '}
                      aplicados
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSaveDialogOpen(false);
                    setEditingSearchId(null);
                    reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingSearchId ? 'Actualizar' : 'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {savedSearches.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">
          No tienes búsquedas guardadas aún. Realiza una búsqueda y guárdala para acceso rápido.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {visibleSearches.map((search) => {
              const hasQuery = search.query && search.query.trim() !== '';
              const hasFilters = Object.keys(search.filters).length > 0;
              const isEmpty = !hasQuery && !hasFilters;
              
              return (
                <Badge
                  key={search.id}
                  variant="secondary"
                  className={`group relative px-3 py-2 ${
                    isEmpty 
                      ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  } cursor-pointer transition-all`}
                >
                  <div className="flex items-center space-x-2">
                    <Search className="h-3 w-3" />
                    <span onClick={() => handleApply(search.id)}>
                      {search.name}
                      {isEmpty && ' ⚠️'}
                    </span>
                    {search.usageCount > 0 && (
                      <span className="text-xs opacity-60">({search.usageCount})</span>
                    )}
                  </div>
                <div className="absolute -top-1 -right-1 hidden group-hover:flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(search.id);
                    }}
                    className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                    aria-label="Editar búsqueda"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(search.id, search.name);
                    }}
                    className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    aria-label="Eliminar búsqueda"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  </div>
                </Badge>
              );
            })}

            {hasMoreSearches && (
              <Dialog open={viewAllDialogOpen} onOpenChange={setViewAllDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-dashed">
                    <MoreHorizontal className="h-4 w-4 mr-1" />
                    Ver todas ({savedSearches.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Todas las Búsquedas Guardadas</DialogTitle>
                    <DialogDescription>
                      Gestiona tus búsquedas guardadas y accede rápidamente a ellas
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[500px] pr-4">
                    <div className="space-y-3">
                      {savedSearches.map((search) => {
                        const hasQuery = search.query && search.query.trim() !== '';
                        const hasFilters = Object.keys(search.filters).length > 0;
                        const isEmpty = !hasQuery && !hasFilters;
                        
                        return (
                          <div
                            key={search.id}
                            className={`p-4 border rounded-lg transition-colors ${
                              isEmpty 
                                ? 'border-red-200 bg-red-50' 
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Search className="h-4 w-4 text-slate-500" />
                                  <h4 className="font-semibold text-slate-900">
                                    {search.name}
                                    {isEmpty && ' ⚠️'}
                                  </h4>
                                  {search.usageCount > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {search.usageCount} usos
                                    </Badge>
                                  )}
                                </div>
                                {isEmpty && (
                                  <p className="text-sm text-red-600 mb-2">
                                    ⚠️ Esta búsqueda no tiene parámetros. Elimínala y crea una nueva.
                                  </p>
                                )}
                                {search.query && (
                                  <p className="text-sm text-slate-600 mb-2">
                                    <span className="font-medium">Consulta:</span> {search.query}
                                  </p>
                                )}
                                {Object.keys(search.filters).length > 0 && (
                                  <p className="text-sm text-slate-600 mb-2">
                                    <span className="font-medium">Filtros:</span>{' '}
                                    {Object.keys(search.filters).length} aplicados
                                  </p>
                                )}
                              <div className="flex items-center space-x-4 text-xs text-slate-500">
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Creada: {formatDate(search.createdAt)}
                                </span>
                                {search.lastUsed && (
                                  <span>Última vez: {formatDate(search.lastUsed)}</span>
                                )}
                                </div>
                              </div>
                              <div className="flex space-x-2 ml-4">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    handleApply(search.id);
                                    setViewAllDialogOpen(false);
                                  }}
                                  disabled={isEmpty}
                                >
                                  Aplicar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    handleEdit(search.id);
                                    setViewAllDialogOpen(false);
                                  }}
                                  disabled={isEmpty}
                                  title={isEmpty ? 'No se puede editar una búsqueda vacía' : 'Editar'}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleDelete(search.id, search.name)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </>
      )}
    </div>
  );
}
