export interface AuditLog {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  action: string;
  module: string;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, unknown> | string | null;
  newValue?: Record<string, unknown> | string | null;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface AuditLogDetail extends AuditLog {
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface AuditLogsFilters {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  module?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditLogsResponse {
  status: string;
  message: string;
  data: {
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditLogResponse {
  status: string;
  message: string;
  data: AuditLogDetail;
}

export interface AuditStats {
  actionsByModule: {
    module: string;
    count: number;
  }[];
  actionsByUser: {
    userId: string;
    username: string;
    fullName: string;
    count: number;
  }[];
  actionsByDay: {
    date: string;
    count: number;
  }[];
}

export interface AuditStatsResponse {
  status: string;
  message: string;
  data: AuditStats;
}

export interface AdvancedAnalytics {
  summary: {
    totalActions: number;
    uniqueUsers: number;
    uniqueModules: number;
    avgActionsPerUser: number;
  };
  actionsByType: {
    type: string;
    count: number;
  }[];
  actionsByHour: {
    hour: number;
    count: number;
  }[];
  actionsByDayOfWeek: {
    day: number;
    count: number;
  }[];
  topActiveUsers: {
    userId: string;
    username: string;
    fullName: string;
    count: number;
  }[];
  topLessActiveUsers: {
    userId: string;
    username: string;
    fullName: string;
    count: number;
  }[];
  topModules: {
    module: string;
    count: number;
  }[];
  leastUsedModules: {
    module: string;
    count: number;
  }[];
  peakActivityHours: {
    hour: number;
    count: number;
  }[];
  actionDistribution: {
    action: string;
    count: number;
  }[];
}

export interface AdvancedAnalyticsResponse {
  status: string;
  message: string;
  data: AdvancedAnalytics;
}

export interface Anomaly {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  userId: string;
  timestamp: string;
  description: string;
  details: Record<string, unknown>;
  user?: {
    username: string;
    fullName: string;
  };
}

export interface AnomaliesResponse {
  status: string;
  message: string;
  data: {
    total: number;
    anomalies: Anomaly[];
  };
}

export interface UserActivityPattern {
  totalActions: number;
  avgActionsPerUser: number;
  actionsByModule: {
    module: string;
    count: number;
    percentage: number;
  }[];
  actionsByHour: {
    hour: number;
    count: number;
  }[];
  actionsByDayOfWeek: {
    day: number;
    count: number;
  }[];
  mostCommonActions: {
    action: string;
    count: number;
  }[];
  recentActivity: {
    id: string;
    action: string;
    module: string;
    createdAt: string;
  }[];
  insights: {
    favoriteModule?: string;
    preferredHour?: number;
    preferredDay?: number;
    mostCommonAction?: string;
  };
}

export interface UserActivityPatternResponse {
  status: string;
  message: string;
  data: UserActivityPattern;
}

export interface SecurityAlert {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  title: string;
  description: string;
  timestamp: string;
  userId: string;
  user?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  details: Record<string, unknown>;
}

export interface SecurityAlertsResponse {
  status: string;
  message: string;
  data: {
    total: number;
    alerts: SecurityAlert[];
  };
}

export interface CustomReportFilters {
  dateFrom?: string;
  dateTo?: string;
  userIds?: string[];
  modules?: string[];
  actions?: string[];
  groupBy?: 'user' | 'module' | 'action' | 'date';
  metrics?: string[];
}

export interface CustomReportResponse {
  status: string;
  message: string;
  data: {
    groupBy: string;
    data: Record<string, unknown>[];
    filters: CustomReportFilters;
  };
}
