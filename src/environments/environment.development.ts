export const environment = {
  production: false,
  appName: 'Ecommerce Admin',
  // Both go through the edge gateway (nginx :8080): it routes /search/** to searchservice and the rest to basecommerce.
  apiBaseUrl: 'http://localhost:8080',
  searchApiBaseUrl: 'http://localhost:8080',
  googleClientId: '',
  // Keycloak runs beside the other infra containers on :8180. Blank out `issuer` to hide the
  // "Đăng nhập với Keycloak" button; the in-house username/password login is unaffected.
  keycloak: {
    issuer: 'http://localhost:8180/realms/ecommerce',
    clientId: 'ecommerce-ng',
    redirectUri: 'http://localhost:4200/auth/keycloak/callback',
    postLogoutRedirectUri: 'http://localhost:4200/auth/login',
    scope: 'openid profile email',
  },
  requestTimeoutMs: 1500000,
  defaultLanguage: 'vi',
  enableDebugTools: true,
};
