import { useState, useEffect, useCallback } from 'react';

interface WizardDraftOptions<T> {
  key: string;
  initialData: T;
  autoSaveInterval?: number;
}

interface WizardDraftReturn<T> {
  data: T;
  setData: (data: T | ((prev: T) => T)) => void;
  hasDraft: boolean;
  lastSaved: Date | null;
  isSaving: boolean;
  saveDraft: () => void;
  clearDraft: () => void;
  restoreDraft: () => boolean;
}

export function useWizardDraft<T>({
  key,
  initialData,
  autoSaveInterval = 30000,
}: WizardDraftOptions<T>): WizardDraftReturn<T> {
  const storageKey = `wizard-draft-${key}`;
  
  const [data, setDataInternal] = useState<T>(initialData);
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Check for existing draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.data && parsed.timestamp) {
          setHasDraft(true);
        }
      }
    } catch (error) {
      console.error('Error checking draft:', error);
    }
  }, [storageKey]);

  // Auto-save effect
  useEffect(() => {
    if (autoSaveInterval <= 0) return;

    const interval = setInterval(() => {
      saveDraft();
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [data, autoSaveInterval]);

  const saveDraft = useCallback(() => {
    try {
      setIsSaving(true);
      const draftData = {
        data,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(draftData));
      setLastSaved(new Date());
      setHasDraft(true);
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSaving(false);
    }
  }, [data, storageKey]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setHasDraft(false);
      setLastSaved(null);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }, [storageKey]);

  const restoreDraft = useCallback((): boolean => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.data) {
          setDataInternal(parsed.data);
          setLastSaved(new Date(parsed.timestamp));
          return true;
        }
      }
    } catch (error) {
      console.error('Error restoring draft:', error);
    }
    return false;
  }, [storageKey]);

  const setData = useCallback((newData: T | ((prev: T) => T)) => {
    setDataInternal(prev => {
      const nextData = typeof newData === 'function' 
        ? (newData as (prev: T) => T)(prev) 
        : newData;
      return nextData;
    });
  }, []);

  return {
    data,
    setData,
    hasDraft,
    lastSaved,
    isSaving,
    saveDraft,
    clearDraft,
    restoreDraft,
  };
}
