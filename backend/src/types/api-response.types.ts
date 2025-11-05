export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export interface PaginatedResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ErrorResponse {
  status: 'error';
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
