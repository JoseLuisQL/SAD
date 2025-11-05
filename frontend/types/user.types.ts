export interface Permission {
  module: string;
  actions: {
    view?: boolean;
    create?: boolean;
    update?: boolean;
    delete?: boolean;
    export?: boolean;
    approve?: boolean;
    sign?: boolean;
    download?: boolean;
    generate?: boolean;
    restore?: boolean;
    compare?: boolean;
  };
}

export type PermissionsData = Record<string, boolean | Record<string, boolean>>;

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: PermissionsData;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
  };
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions: PermissionsData;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: PermissionsData;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface UsersResponse {
  status: string;
  message: string;
  data: {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserResponse {
  status: string;
  message: string;
  data: User;
}

export interface UsersFilters {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface RolesResponse {
  status: string;
  message: string;
  data: Role[];
}

export interface RoleResponse {
  status: string;
  message: string;
  data: Role;
}

export interface PermissionsResponse {
  status: string;
  message: string;
  data: Permission[];
}
