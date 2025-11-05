export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  priority: NotificationPriority;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string;
  expiresAt?: string;
}

export enum NotificationType {
  SIGNATURE_PENDING = 'SIGNATURE_PENDING',
  SIGNATURE_COMPLETED = 'SIGNATURE_COMPLETED',
  FLOW_STARTED = 'FLOW_STARTED',
  FLOW_COMPLETED = 'FLOW_COMPLETED',
  SIGNATURE_REVERTED = 'SIGNATURE_REVERTED',
  CERTIFICATE_EXPIRING = 'CERTIFICATE_EXPIRING'
}

export enum NotificationPriority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  NORMAL = 'NORMAL',
  LOW = 'LOW'
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}
