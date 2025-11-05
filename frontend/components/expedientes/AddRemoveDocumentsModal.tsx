'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Document } from '@/types/document.types';
import { useDocuments } from '@/hooks/useDocuments';
import {
  Search,
  ArrowRight,
  ArrowLeft,
  Loader2,
  FileText,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { cn } from '@/lib/utils';

interface AddRemoveDocumentsModalProps {
  open: boolean;
  onClose: () => void;
  expedienteId: string;
  expedienteName: string;
  currentDocuments: Document[];
  onSave: (addedIds: string[], removedIds: string[]) => Promise<void>;
}

export function AddRemoveDocumentsModal({
  open,
  onClose,
  expedienteId,
  expedienteName,
  currentDocuments,
  onSave,
}: AddRemoveDocumentsModalProps) {
  const { documents, fetchDocuments, loading } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(
    new Set()
  );
  const [selectedCurrent, setSelectedCurrent] = useState<Set<string>>(new Set());
  const [workingDocuments, setWorkingDocuments] = useState<Document[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      console.log('Modal abierto, cargando documentos...', {
        currentDocuments: currentDocuments.length,
        expedienteId,
        expedienteName,
      });
      fetchDocuments({ limit: 100 });
      setWorkingDocuments(currentDocuments);
      setSelectedAvailable(new Set());
      setSelectedCurrent(new Set());
    }
  }, [open, fetchDocuments, currentDocuments, expedienteId, expedienteName]);

  const availableDocuments = documents.filter(
    (doc) =>
      !workingDocuments.some((wd) => wd.id === doc.id) &&
      (searchQuery === '' ||
        doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.documentType.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentFilteredDocuments = workingDocuments.filter(
    (doc) =>
      searchQuery === '' ||
      doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentType.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleAvailable = (docId: string) => {
    const newSet = new Set(selectedAvailable);
    if (newSet.has(docId)) {
      newSet.delete(docId);
    } else {
      newSet.add(docId);
    }
    setSelectedAvailable(newSet);
  };

  const handleToggleCurrent = (docId: string) => {
    const newSet = new Set(selectedCurrent);
    if (newSet.has(docId)) {
      newSet.delete(docId);
    } else {
      newSet.add(docId);
    }
    setSelectedCurrent(newSet);
  };

  const handleAddDocuments = () => {
    const docsToAdd = documents.filter((doc) => selectedAvailable.has(doc.id));
    setWorkingDocuments([...workingDocuments, ...docsToAdd]);
    setSelectedAvailable(new Set());
  };

  const handleRemoveDocuments = () => {
    setWorkingDocuments(
      workingDocuments.filter((doc) => !selectedCurrent.has(doc.id))
    );
    setSelectedCurrent(new Set());
  };

  const handleSave = async () => {
    console.log('handleSave llamado');
    try {
      setSaving(true);

      const currentIds = new Set(currentDocuments.map((doc) => doc.id));
      const workingIds = new Set(workingDocuments.map((doc) => doc.id));

      const addedIds = workingDocuments
        .filter((doc) => !currentIds.has(doc.id))
        .map((doc) => doc.id);

      const removedIds = currentDocuments
        .filter((doc) => !workingIds.has(doc.id))
        .map((doc) => doc.id);

      console.log('Guardando cambios:', {
        currentDocuments: currentDocuments.length,
        workingDocuments: workingDocuments.length,
        addedIds,
        removedIds,
      });

      if (addedIds.length === 0 && removedIds.length === 0) {
        console.log('No hay cambios para guardar');
        onClose();
        return;
      }

      await onSave(addedIds, removedIds);
      onClose();
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      // No cerramos el modal si hay error para que el usuario vea el toast
    } finally {
      setSaving(false);
    }
  };

  const DocumentItem = ({
    doc,
    selected,
    onToggle,
  }: {
    doc: Document;
    selected: boolean;
    onToggle: () => void;
  }) => (
    <div
      onClick={onToggle}
      className={cn(
        'p-3 rounded-lg cursor-pointer transition-colors',
        selected 
          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700'
          : 'bg-card border border-border hover:bg-muted'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-gray-500 dark:text-slate-400 flex-shrink-0" />
            <span className="font-medium text-sm truncate text-gray-900 dark:text-slate-100">
              {doc.documentNumber}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-slate-400 truncate">{doc.sender}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {doc.documentType.name}
            </Badge>
            <span className="text-xs text-gray-500 dark:text-slate-400">
              {format(new Date(doc.documentDate), 'dd MMM yyyy', { locale: es })}
            </span>
          </div>
        </div>
        {selected && (
          <div className="ml-2 flex-shrink-0">
            <div className="w-5 h-5 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col dark:bg-slate-900 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Gestionar Documentos - {expedienteName}</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <Label htmlFor="search" className="dark:text-slate-200">Buscar documentos</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
            <Input
              id="search"
              placeholder="Buscar por número, remitente o tipo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 flex flex-col bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                Documentos Disponibles
                <span className="ml-2 text-gray-500 dark:text-slate-400">
                  ({availableDocuments.length})
                </span>
              </h3>
              {selectedAvailable.size > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddDocuments}
                  className="gap-1"
                >
                  Agregar ({selectedAvailable.size})
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1 pr-4 bg-transparent">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400 dark:text-slate-500" />
                </div>
              ) : availableDocuments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-slate-400 text-sm">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                  <p>No hay documentos disponibles</p>
                </div>
              ) : (
                <div className="space-y-2 bg-transparent">
                  {availableDocuments.map((doc) => (
                    <DocumentItem
                      key={doc.id}
                      doc={doc}
                      selected={selectedAvailable.has(doc.id)}
                      onToggle={() => handleToggleAvailable(doc.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 flex flex-col bg-blue-50/30 dark:bg-blue-900/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                En este Expediente
                <span className="ml-2 text-gray-500 dark:text-slate-400">
                  ({workingDocuments.length})
                </span>
              </h3>
              {selectedCurrent.size > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRemoveDocuments}
                  className="gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Remover ({selectedCurrent.size})
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1 pr-4 bg-transparent">
              {currentFilteredDocuments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-slate-400 text-sm">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                  <p>No hay documentos en este expediente</p>
                </div>
              ) : (
                <div className="space-y-2 bg-transparent">
                  {currentFilteredDocuments.map((doc) => (
                    <DocumentItem
                      key={doc.id}
                      doc={doc}
                      selected={selectedCurrent.has(doc.id)}
                      onToggle={() => handleToggleCurrent(doc.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button 
            type="button"
            variant="outline" 
            onClick={onClose} 
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              console.log('Botón clickeado');
              handleSave();
            }} 
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
