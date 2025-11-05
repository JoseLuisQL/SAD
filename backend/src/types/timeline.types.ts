export interface TimelineEvent {
  id: string;
  type: string;
  action: string;
  description: string;
  userId: string;
  userName: string;
  timestamp: Date;
  metadata?: any;
}

export interface PaginatedTimeline {
  events: TimelineEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
