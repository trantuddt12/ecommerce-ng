export interface LoginRequest {
  username: string;
  password: string;
  googleToken?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
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
