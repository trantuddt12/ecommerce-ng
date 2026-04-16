export interface AppConfig {
  production: boolean;
  appName: string;
  apiBaseUrl: string;
  searchApiBaseUrl: string;
  requestTimeoutMs: number;
  defaultLanguage: string;
  enableDebugTools: boolean;
}
