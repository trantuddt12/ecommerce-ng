export const environment = {
  production: true,
  appName: 'Ecommerce Admin',
  // Both go through the edge gateway; replace localhost:8080 with the real gateway host/origin in production.
  apiBaseUrl: 'http://localhost:8080',
  searchApiBaseUrl: 'http://localhost:8080',
  googleClientId: '',
  requestTimeoutMs: 1500000,
  defaultLanguage: 'vi',
  enableDebugTools: false,
};
