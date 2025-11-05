'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Document } from '@/types/document.types';
import { useDocuments } from '@/hooks/useDocuments';
import {
  Search,
  ArrowRight,
  ArrowLeft,
  Loader2,
  FileText,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface DualListManagerProps {
  open: boolean;
  onClose: () => void;
  expedienteId: string;
  expedienteName: string;
  currentDocuments: Document[];
  onSave: (addedIds: string[], removedIds: string[]) => Promise<void>;
}

export function DualListManager({
  open,
  onClose,
  expedienteId,
  expedienteName,
  currentDocuments,
  onSave,
}: DualListManagerProps) {
  const { documents, fetchDocuments, loading } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(new Set());
  const [selectedCurrent, setSelectedCurrent] = useState<Set<string>>(new Set());
  const [workingDocuments, setWorkingDocuments] = useState<Document[]>([]);
  const [saving, setSaving] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (open) {
      fetchDocuments({ limit: 200 });
      setWorkingDocuments(currentDocuments);
      setSelectedAvailable(new Set());
      setSelectedCurrent(new Set());
      setSearchQuery('');
      setShowSummary(false);
    }
  }, [open, fetchDocuments, currentDocuments]);

  const availableDocuments = useMemo(() => {
    return documents.filter(
      (doc) =>
        !workingDocuments.some((wd) => wd.id === doc.id) &&
        (debouncedSearch === '' ||
          doc.documentNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          doc.sender.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          doc.documentType.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
    );
  }, [documents, workingDocuments, debouncedSearch]);

  const currentFilteredDocuments = useMemo(() => {
    return workingDocuments.filter(
      (doc) =>
        debouncedSearch === '' ||
        doc.documentNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        doc.sender.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        doc.documentType.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [workingDocuments, debouncedSearch]);

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

  const handleSelectAllAvailable = () => {
    if (selectedAvailable.size === availableDocuments.length) {
      setSelectedAvailable(new Set());
    } else {
      setSelectedAvailable(new Set(availableDocuments.map((doc) => doc.id)));
    }
  };

  const handleSelectAllCurrent = () => {
    if (selectedCurrent.size === currentFilteredDocuments.length) {
      setSelectedCurrent(new Set());
    } else {
      setSelectedCurrent(new Set(currentFilteredDocuments.map((doc) => doc.id)));
    }
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

  const calculateChanges = () => {
    const currentIds = new Set(currentDocuments.map((doc) => doc.id));
    const workingIds = new Set(workingDocuments.map((doc) => doc.id));

    const addedIds = workingDocuments
      .filter((doc) => !currentIds.has(doc.id))
      .map((doc) => doc.id);

    const removedIds = currentDocuments
      .filter((doc) => !workingIds.has(doc.id))
      .map((doc) => doc.id);

    return { addedIds, removedIds };
  };

  const handleSave = async () => {
    const { addedIds, removedIds } = calculateChanges();

    if (addedIds.length === 0 && removedIds.length === 0) {
      onClose();
      return;
    }

    try {
      setSaving(true);
      await onSave(addedIds, removedIds);
      onClose();
    } catch (error) {
      console.error('Error al guardar cambios:', error);
    } finally {
      setSaving(false);
    }
  };

  const { addedIds, removedIds } = calculateChanges();
  const hasChanges = addedIds.length > 0 || removedIds.length > 0;

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
      className={cn(
        'p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm',
        selected 
          ? 'bg-blue-50 border-blue-400 hover:bg-blue-50 shadow-sm' 
          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      )}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <Checkbox checked={selected} className="mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-gray-600 flex-shrink-0" />
            <span className="font-semibold text-sm text-gray-900 truncate">
              {doc.documentNumber}
            </span>
          </div>
          <p className="text-xs text-gray-700 truncate mb-2">{doc.sender}</p>
          <div className="flex gap-2 flex-wrap items-center">
            <Badge variant="secondary" className="text-xs font-medium">
              {doc.documentType.name}
            </Badge>
            <span className="text-xs text-gray-600 font-medium">
              {format(new Date(doc.documentDate), 'dd MMM yyyy', { locale: es })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="!w-[95vw] !h-[90vh] !max-w-[95vw] sm:!max-w-[95vw] md:!max-w-[95vw] lg:!max-w-[95vw] p-0 gap-0 flex flex-col overflow-hidden"
        showCloseButton={false}
        style={{ width: '95vw', height: '90vh', maxWidth: '95vw' }}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Gestionar Documentos
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">{expedienteName}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors flex-shrink-0"
              disabled={saving}
              type="button"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-b">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por número, remitente o tipo de documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                type="button"
              >
                <X className="h-3.5 w-3.5 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex min-h-0">
          {/* Left Column - Available Documents */}
          <div className="w-1/2 border-r flex flex-col bg-white">
            <div className="px-6 py-4 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-gray-900">
                    Documentos Disponibles
                  </h3>
                  <Badge variant="secondary" className="font-medium">
                    {availableDocuments.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {availableDocuments.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSelectAllAvailable}
                      className="text-xs"
                    >
                      {selectedAvailable.size === availableDocuments.length
                        ? 'Deseleccionar todo'
                        : 'Seleccionar todo'}
                    </Button>
                  )}
                  {selectedAvailable.size > 0 && (
                    <Button
                      size="sm"
                      onClick={handleAddDocuments}
                      className="gap-1 text-xs"
                    >
                      Agregar {selectedAvailable.size}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 px-6 py-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
                  <p className="text-sm text-gray-600">Cargando documentos...</p>
                </div>
              ) : availableDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <FileText className="h-10 w-10 text-gray-400" />
                  </div>
                  <h4 className="text-base font-medium text-gray-900 mb-1">
                    No hay documentos disponibles
                  </h4>
                  <p className="text-sm text-gray-600">
                    {searchQuery
                      ? 'No se encontraron documentos con ese criterio de búsqueda'
                      : 'Todos los documentos ya están en este expediente'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
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

          {/* Right Column - Current Documents */}
          <div className="w-1/2 flex flex-col bg-blue-50/30">
            <div className="px-6 py-4 border-b bg-blue-100/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-gray-900">
                    En este Expediente
                  </h3>
                  <Badge variant="secondary" className="font-medium bg-blue-600 text-white hover:bg-blue-700">
                    {workingDocuments.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {currentFilteredDocuments.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSelectAllCurrent}
                      className="text-xs"
                    >
                      {selectedCurrent.size === currentFilteredDocuments.length
                        ? 'Deseleccionar todo'
                        : 'Seleccionar todo'}
                    </Button>
                  )}
                  {selectedCurrent.size > 0 && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleRemoveDocuments}
                      className="gap-1 text-xs"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Remover {selectedCurrent.size}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 px-6 py-4">
              {currentFilteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-blue-100 rounded-full mb-4">
                    <FileText className="h-10 w-10 text-blue-600" />
                  </div>
                  <h4 className="text-base font-medium text-gray-900 mb-1">
                    No hay documentos en este expediente
                  </h4>
                  <p className="text-sm text-gray-600">
                    {searchQuery
                      ? 'No se encontraron documentos con ese criterio de búsqueda'
                      : 'Selecciona documentos de la izquierda para agregarlos'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
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

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t bg-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {hasChanges && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1.5 text-amber-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Cambios pendientes:</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {addedIds.length > 0 && (
                      <span className="text-green-700 font-medium">
                        +{addedIds.length} agregado{addedIds.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {removedIds.length > 0 && (
                      <span className="text-red-700 font-medium">
                        -{removedIds.length} removido{removedIds.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving}
                className="min-w-[100px]"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="min-w-[140px]"
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
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
