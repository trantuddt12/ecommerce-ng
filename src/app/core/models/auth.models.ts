export interface LoginRequest {
  username?: string | null;
  password?: string | null;
  googleToken?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
}

export type OtpPurpose = 'REGISTER' | 'FORGOT_PASSWORD' | 'EMAIL_VERIFY';

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

export interface SendOtpRequest {
  email: string;
  purpose: OtpPurpose;
}

export interface VerifyOtpRequest {
  purpose: OtpPurpose;
  email: string;
  otp: string;
}

export interface SendOtpResponse {
  email: string;
  purpose: OtpPurpose;
  ttlSeconds: number;
  resendAfterSeconds: number;
  maskedDestination?: string | null;
}

export interface VerifyOtpResponse {
  verified: boolean;
  purpose: OtpPurpose;
  nextAction: 'LOGIN_ALLOWED' | 'RESET_PASSWORD';
  resetGrantExpiresInSeconds?: number;
}

export interface ForgotPasswordConfirmRequest {
  email: string;
  newPassword: string;
  confirmPassword: string;
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
