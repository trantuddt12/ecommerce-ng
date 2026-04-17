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

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  phoneNumber?: string | null;
  status?: string | null;
  roleIds: number[];
}
