export interface LoginRequest {
  username: string;
  password: string;
  googleToken?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface ApiEnvelope<T> {
  data: T;
  timestamp?: string | null;
  page?: unknown;
}

export function unwrapApiEnvelope<T>(response: T | ApiEnvelope<T>): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data;
  }

  return response;
}

export interface AuthSession {
  accessToken: string | null;
  isAuthenticated: boolean;
}

export interface OtpRequest {
  email?: string;
  username?: string;
}

export interface VerifyOtpRequest {
  email?: string;
  username?: string;
  otp: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  phonenumber?: string | null;
  roleId?: number | null;
}

export interface PermissionResponse {
  id: number;
  name: string;
  description?: string | null;
}

export interface RoleResponse {
  id: number;
  name: string;
  description?: string | null;
  permissions: PermissionResponse[];
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  phonenumber?: string | null;
  status?: string | null;
  roleIds?: number[];
}

export interface UpdateUserRequest {
  id: number;
  username?: string | null;
  password?: string | null;
  email?: string | null;
  phonenumber?: string | null;
  status?: string | null;
  roleIds?: number[];
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  phoneNumber?: string | null;
  status?: string | null;
  roleIds: number[];
  roles?: RoleResponse[];
}
