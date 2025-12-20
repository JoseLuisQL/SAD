import { useEffect, useCallback } from 'react';

interface KeyboardShortcuts {
  create?: () => void;
  close?: () => void;
  save?: () => void;
  search?: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isInputFocused = 
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.isContentEditable;

    // Ctrl/Cmd + N = Nuevo (solo si no hay input enfocado)
    if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !isInputFocused) {
      e.preventDefault();
      shortcuts.create?.();
    }

    // Escape = Cerrar modal
    if (e.key === 'Escape') {
      shortcuts.close?.();
    }

    // Ctrl/Cmd + S = Guardar (prevenir acción por defecto del navegador)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      shortcuts.save?.();
    }

    // Ctrl/Cmd + K = Enfocar búsqueda
    if ((e.ctrlKey || e.metaKey) && e.key === 'k' && !isInputFocused) {
      e.preventDefault();
      shortcuts.search?.();
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
