export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
