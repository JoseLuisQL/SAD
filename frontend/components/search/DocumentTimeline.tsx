'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import Cookies from 'js-cookie';
import { 
  Clock, 
  FileText, 
  PenTool, 
  User,
  FileEdit,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { STORAGE_KEYS } from '@/lib/constants';

interface TimelineEvent {
  id: string;
  type: 'version' | 'signature' | 'audit';
  action: string;
  description: string;
  user: {
    username: string;
    fullName: string;
  };
  timestamp: string;
  details?: {
    versionNumber?: number;
    signatureStatus?: string;
    oldValue?: any;
    newValue?: any;
  };
}

interface DocumentTimelineProps {
  documentId: string;
}

export default function DocumentTimeline({ documentId }: DocumentTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        const token = Cookies.get(STORAGE_KEYS.ACCESS_TOKEN);

        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }

        const response = await fetch(`${apiUrl}/documents/${documentId}/timeline`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 404) {
            // Document not found - not an error, just no timeline
            setTimeline([]);
            setLoading(false);
            return;
          }
          
          const errorData = await response.json().catch(() => null);
          console.error('Timeline error response:', errorData);
          throw new Error(errorData?.message || `Error al cargar timeline: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Validate response structure
        if (!result.data || !Array.isArray(result.data.timeline)) {
          console.error('Invalid timeline response:', result);
          setTimeline([]);
          setLoading(false);
          return;
        }
        
        // Filter out repetitive/irrelevant events
        const relevantEvents = result.data.timeline.filter((event: TimelineEvent) => {
          try {
            const action = event.action?.toLowerCase() || '';
            // Exclude download events and other repetitive actions
            return !action.includes('download') && 
                   !action.includes('viewed') &&
                   !action.includes('accessed');
          } catch (e) {
            console.warn('Error filtering event:', event, e);
            return true; // Keep event if filtering fails
          }
        });
        
        // Group similar consecutive events
        const groupedEvents: TimelineEvent[] = [];
        let lastEventType = '';
        let consecutiveCount = 0;
        
        relevantEvents.forEach((event: TimelineEvent) => {
          try {
            if (event.type === lastEventType && consecutiveCount < 2) {
              // Skip if same type appears more than twice consecutively
              consecutiveCount++;
              if (consecutiveCount <= 2) {
                groupedEvents.push(event);
              }
            } else {
              consecutiveCount = 1;
              lastEventType = event.type;
              groupedEvents.push(event);
            }
          } catch (e) {
            console.warn('Error grouping event:', event, e);
            groupedEvents.push(event); // Add event anyway if grouping fails
          }
        });
        
        // Get most recent important events (up to 10)
        const recentEvents = groupedEvents.slice(-10);
        setTimeline(recentEvents);
      } catch (err) {
        console.error('Error loading timeline:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar actividad');
        setTimeline([]); // Set empty timeline on error
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchTimeline();
    }
  }, [documentId]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'version':
        return <FileEdit className="h-4 w-4 text-blue-600" />;
      case 'signature':
        return <PenTool className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-slate-600" />;
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'version':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Versión</Badge>;
      case 'signature':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Firma</Badge>;
      default:
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Auditoría</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          <span className="ml-2 text-sm text-slate-600">Cargando actividad...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Actividad Reciente
        </h3>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            No se pudo cargar la actividad del documento
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Actividad Reciente
        </h3>
        <p className="text-sm text-slate-500 text-center py-4">
          No hay actividad registrada para este documento
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Actividad Reciente
      </h3>

      <Accordion type="single" collapsible className="space-y-2" defaultValue="timeline">
        <AccordionItem value="timeline" className="border-none">
          <AccordionTrigger className="text-sm font-medium text-slate-700 hover:text-slate-900 py-2">
            {timeline.length === 1 ? '1 evento reciente' : `${timeline.length} eventos recientes`}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 mt-2">
              {timeline.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getEventBadge(event.type)}
                        {event.details?.versionNumber && (
                          <Badge variant="secondary" className="text-xs">
                            v{event.details.versionNumber}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-900 font-medium mb-1">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <User className="h-3 w-3" />
                        <span>{event.user.fullName}</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(new Date(event.timestamp), 'dd MMM yyyy HH:mm', { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
