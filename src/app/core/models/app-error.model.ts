export type AppErrorType =
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not-found'
  | 'server'
  | 'network'
  | 'unknown';

export interface AppError {
  type: AppErrorType;
  statusCode: number;
  message: string;
  code?: string;
  retryAfterSeconds?: number;
  remainingAttempts?: number;
  originalError?: unknown;
}
