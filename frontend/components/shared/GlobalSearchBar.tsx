'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, User, FileType, Loader2 } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function GlobalSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { suggestions, loadingSuggestions, fetchSuggestions, clearSuggestions } = useSearch();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleInputChange = (value: string) => {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(value);
        setIsOpen(true);
      }, 300);
    } else {
      clearSuggestions();
      setIsOpen(false);
    }
  };

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      router.push(`/dashboard/consultas/busqueda?query=${encodeURIComponent(finalQuery.trim())}`);
      setIsOpen(false);
      setQuery('');
      clearSuggestions();
    }
  };

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    handleSearch(suggestion.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'document':
        return FileText;
      case 'sender':
        return User;
      case 'documentType':
        return FileType;
      default:
        return Search;
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Buscar documentos..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          className="pl-10 pr-10"
        />
        {loadingSuggestions && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="py-1">
            {suggestions.map((suggestion, index) => {
              const Icon = getIconForType(suggestion.type);
              return (
                <button
                  key={`${suggestion.type}-${suggestion.value}-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                >
                  <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{suggestion.label}</p>
                    {suggestion.metadata && (
                      <p className="text-xs text-gray-500 truncate">
                        {suggestion.metadata.documentType || suggestion.metadata.typeName}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full flex-shrink-0',
                      suggestion.type === 'document' && 'bg-blue-100 text-blue-700',
                      suggestion.type === 'sender' && 'bg-green-100 text-green-700',
                      suggestion.type === 'documentType' && 'bg-purple-100 text-purple-700',
                      suggestion.type === 'term' && 'bg-gray-100 text-gray-700'
                    )}
                  >
                    {suggestion.type === 'document' && 'Doc'}
                    {suggestion.type === 'sender' && 'Remitente'}
                    {suggestion.type === 'documentType' && 'Tipo'}
                    {suggestion.type === 'term' && 'Término'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
