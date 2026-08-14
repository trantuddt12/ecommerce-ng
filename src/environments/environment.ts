export const environment = {
  production: false,
  appName: 'Ecommerce Admin',
  // Both go through the edge gateway (nginx :8080): it routes /search/** to searchservice and the rest to basecommerce.
  apiBaseUrl: 'http://localhost:8080',
  searchApiBaseUrl: 'http://localhost:8080',
  googleClientId: '',
  requestTimeoutMs: 1500000,
  defaultLanguage: 'vi',
  enableDebugTools: true,
};
