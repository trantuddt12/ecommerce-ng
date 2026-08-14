export const environment = {
  production: true,
  appName: 'Ecommerce Admin',
  // Both go through the edge gateway; replace localhost:8080 with the real gateway host/origin in production.
  apiBaseUrl: 'http://localhost:8080',
  searchApiBaseUrl: 'http://localhost:8080',
  googleClientId: '',
  // Left empty on purpose: there is no production Keycloak yet, and an empty issuer hides the
  // button rather than shipping a broken redirect. Fill in the real realm URL (over HTTPS) and
  // register the redirect URIs on the `ecommerce-ng` client before enabling it here.
  keycloak: {
    issuer: '',
    clientId: 'ecommerce-ng',
    redirectUri: '',
    postLogoutRedirectUri: '',
    scope: 'openid profile email',
  },
  requestTimeoutMs: 1500000,
  defaultLanguage: 'vi',
  enableDebugTools: false,
};
