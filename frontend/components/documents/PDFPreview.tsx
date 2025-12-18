'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Minimize2,
  RotateCw,
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.js';
}

interface PDFPreviewProps {
  file: File | string;
  className?: string;
  initialPage?: number;
  initialZoom?: number;
  onPageChange?: (page: number, total: number) => void;
}

export default function PDFPreview({ 
  file, 
  className,
  initialPage = 1,
  initialZoom = 1.0,
  onPageChange,
}: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(initialZoom);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageInputValue, setPageInputValue] = useState<string>(String(initialPage));
  
  const containerRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);

  // Handle document load
  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(initialPage);
    setPageInputValue(String(initialPage));
    setIsLoading(false);
    onPageChange?.(initialPage, numPages);
  }

  function onDocumentLoadError(): void {
    setIsLoading(false);
  }

  // Page navigation
  const changePage = useCallback((offset: number) => {
    setPageNumber((prev) => {
      const newPage = Math.min(Math.max(1, prev + offset), numPages);
      setPageInputValue(String(newPage));
      onPageChange?.(newPage, numPages);
      return newPage;
    });
  }, [numPages, onPageChange]);

  const goToPage = useCallback((page: number) => {
    const validPage = Math.min(Math.max(1, page), numPages);
    setPageNumber(validPage);
    setPageInputValue(String(validPage));
    onPageChange?.(validPage, numPages);
  }, [numPages, onPageChange]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  // Rotation
  const rotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if this component or its children are focused
      if (!containerRef.current?.contains(document.activeElement) && 
          document.activeElement?.tagName !== 'BODY') {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          changePage(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          changePage(1);
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            resetZoom();
          }
          break;
        case 'r':
        case 'R':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            rotate();
          }
          break;
        case 'f':
        case 'F':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        case 'Home':
          e.preventDefault();
          goToPage(1);
          break;
        case 'End':
          e.preventDefault();
          goToPage(numPages);
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changePage, zoomIn, zoomOut, resetZoom, rotate, toggleFullscreen, goToPage, numPages, isFullscreen]);

  // Handle page input
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value);
  };

  const handlePageInputBlur = () => {
    const page = parseInt(pageInputValue, 10);
    if (!isNaN(page)) {
      goToPage(page);
    } else {
      setPageInputValue(String(pageNumber));
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageInputBlur();
      (e.target as HTMLInputElement).blur();
    }
  };

  // Mouse wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    }
  }, [zoomIn, zoomOut]);

  useEffect(() => {
    const container = documentRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        'flex flex-col bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden',
        isFullscreen && 'fixed inset-0 z-50 rounded-none border-none',
        className
      )}
      role="document"
      aria-label="Visor de documento PDF"
      tabIndex={0}
    >
      {/* Toolbar */}
      <div 
        className="bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700 p-2 sm:p-3 flex items-center justify-between flex-wrap gap-2"
        role="toolbar"
        aria-label="Controles del visor PDF"
      >
        {/* Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => changePage(-1)}
                  disabled={pageNumber <= 1 || isLoading}
                  className="h-8 w-8"
                  aria-label="Pagina anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Anterior (←)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex items-center gap-1">
            <Input
              type="text"
              inputMode="numeric"
              value={pageInputValue}
              onChange={handlePageInputChange}
              onBlur={handlePageInputBlur}
              onKeyDown={handlePageInputKeyDown}
              className="w-12 h-8 text-center text-sm p-1"
              aria-label="Numero de pagina"
              disabled={isLoading}
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              / {numPages || '?'}
            </span>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => changePage(1)}
                  disabled={pageNumber >= numPages || isLoading}
                  className="h-8 w-8"
                  aria-label="Pagina siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Siguiente (→)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={zoomOut}
                  disabled={scale <= 0.5 || isLoading}
                  className="h-8 w-8"
                  aria-label="Reducir zoom"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reducir (-)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <button
            onClick={resetZoom}
            className="text-sm font-medium min-w-[50px] text-center text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1 rounded"
            aria-label={`Zoom actual ${Math.round(scale * 100)}%, clic para restablecer`}
            disabled={isLoading}
          >
            {Math.round(scale * 100)}%
          </button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={zoomIn}
                  disabled={scale >= 3.0 || isLoading}
                  className="h-8 w-8"
                  aria-label="Aumentar zoom"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Aumentar (+)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Extra controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={rotate}
                  disabled={isLoading}
                  className="h-8 w-8"
                  aria-label="Rotar pagina"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rotar (R)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFullscreen}
                  disabled={isLoading}
                  className="h-8 w-8"
                  aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFullscreen ? 'Salir (Esc)' : 'Pantalla completa (F)'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* PDF Content */}
      <div 
        ref={documentRef}
        className={cn(
          'overflow-auto bg-slate-50 dark:bg-slate-900 flex-1',
          isFullscreen ? 'h-[calc(100vh-60px)]' : 'max-h-[70vh]'
        )}
      >
        <div className="flex justify-center p-4 min-h-[400px]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
                <p className="text-sm text-slate-600 dark:text-slate-400">Cargando documento...</p>
              </div>
            </div>
          )}
          
          <Document 
            file={file} 
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            error={
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">No se pudo cargar el PDF</p>
                <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">Intente descargar el documento</p>
              </div>
            }
            className="shadow-lg"
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale}
              rotate={rotation}
              renderTextLayer={true} 
              renderAnnotationLayer={true}
              loading={
                <div className="flex items-center justify-center h-[600px] w-[400px] bg-white">
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                </div>
              }
            />
          </Document>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="hidden sm:flex items-center justify-center gap-4 py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
        <span><kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">←</kbd><kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] ml-0.5">→</kbd> Navegar</span>
        <span><kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">+</kbd><kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] ml-0.5">-</kbd> Zoom</span>
        <span><kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">R</kbd> Rotar</span>
        <span><kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px]">F</kbd> Pantalla completa</span>
      </div>
    </div>
  );
}
