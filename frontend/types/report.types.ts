export interface DocumentReportSummary {
  totalDocuments: number;
  totalFolios: number;
  signedDocuments: number;
  ocrDocuments: number;
  unsignedDocuments: number;
  pendingOcr: number;
}

export interface DocumentByType {
  documentTypeId: string;
  documentTypeName: string;
  count: number;
  totalFolios: number;
}

export interface DocumentByOffice {
  officeId: string;
  officeName: string;
  count: number;
  totalFolios: number;
}

export interface DocumentByMonth {
  month: string;
  count: number;
  totalFolios: number;
}

export interface DocumentReportData {
  summary: DocumentReportSummary;
  documentsByType: DocumentByType[];
  documentsByOffice: DocumentByOffice[];
  documentsByMonth: DocumentByMonth[];
}

export interface UserActivitySummary {
  totalActions: number;
  uniqueUsers: number;
  uniqueModules: number;
  uniqueActions: number;
}

export interface ActivityByUser {
  userId: string;
  username: string;
  fullName: string;
  totalActions: number;
  actions: Record<string, number>;
}

export interface ActivityByModule {
  module: string;
  count: number;
}

export interface ActivityByAction {
  action: string;
  count: number;
}

export interface ActivityByDay {
  day: string;
  count: number;
}

export interface UserActivityReportData {
  summary: UserActivitySummary;
  activityByUser: ActivityByUser[];
  activityByModule: ActivityByModule[];
  activityByAction: ActivityByAction[];
  activityByDay: ActivityByDay[];
}

export interface SignatureReportSummary {
  totalSignatures: number;
  validSignatures: number;
  revertedSignatures: number;
  invalidSignatures: number;
  activeFlows: number;
  completedFlows: number;
}

export interface SignatureBySigner {
  signerId: string;
  signerName: string;
  username: string;
  count: number;
}

export interface SignatureByStatus {
  status: string;
  count: number;
}

export interface SignatureByDay {
  date: string;
  count: number;
}

export interface SignatureReportData {
  summary: SignatureReportSummary;
  signaturesBySigner: SignatureBySigner[];
  signaturesByStatus: SignatureByStatus[];
  signaturesByDay: SignatureByDay[];
}

export interface ReportFilters {
  periodId?: string;
  officeId?: string;
  documentTypeId?: string;
  userId?: string;
  action?: string;
  signerId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export type ReportType = 'documents' | 'activity' | 'signatures';
export type ExportFormat = 'pdf' | 'xlsx' | 'csv';

export interface ReportResponse<T> {
  status: string;
  message: string;
  data: T;
}
