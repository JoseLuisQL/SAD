export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roleId: string;
  role: {
    id: string;
    name: string;
    permissions: Record<string, boolean | string | number>;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenResponse {
  status: string;
  message: string;
  data: {
    accessToken: string;
  };
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
}
