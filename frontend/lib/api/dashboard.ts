import api from '../api';
import { ApiResponse } from '@/types/api.types';

export interface DashboardCard {
  totalDocuments: number;
  totalArchivadores: number;
  totalExpedientes: number;
  signaturesCompleted: number;
  signaturesPartial: number;
  signaturesPending: number;
}

export interface WeeklyData {
  week: string;
  count: number;
}

export interface OfficeDistribution {
  officeId: string;
  officeName: string;
  count: number;
  percentage: number;
}

export interface TypeDistribution {
  typeId: string;
  typeName: string;
  count: number;
  percentage: number;
}

export interface DashboardAlert {
  id: string;
  type: 'OCR_PENDING' | 'SIGNATURE_EXPIRED' | 'ARCHIVADOR_FULL';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  count?: number;
  entityId?: string;
}

export interface RecentActivity {
  id: string;
  action: string;
  module: string;
  user: {
    username: string;
    fullName: string;
  };
  timestamp: string;
}

export interface DashboardSnapshot {
  cards: DashboardCard;
  trends: {
    documentsCreated: WeeklyData[];
    signaturesCompleted: WeeklyData[];
  };
  distributions: {
    byOffice: OfficeDistribution[];
    byDocumentType: TypeDistribution[];
  };
  alerts: DashboardAlert[];
  recentActivity: RecentActivity[];
}

export const dashboardApi = {
  getSnapshot: (params?: { range?: '7d' | '30d' | '90d'; officeId?: string }) => {
    return api.get<ApiResponse<DashboardSnapshot>>('/analytics/dashboard', {
      params
    });
  }
};
