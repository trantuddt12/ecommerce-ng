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
  originalError?: unknown;
}
