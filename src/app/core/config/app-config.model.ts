export interface KeycloakConfig {
  /** Realm issuer, e.g. http://localhost:8180/realms/ecommerce. Empty disables Keycloak login. */
  issuer: string;
  /** Public client id registered in the realm. No secret is ever shipped to the browser. */
  clientId: string;
  /** Must be registered as a redirect URI on the client, character for character. */
  redirectUri: string;
  postLogoutRedirectUri: string;
  scope: string;
}

export interface AppConfig {
  production: boolean;
  appName: string;
  apiBaseUrl: string;
  searchApiBaseUrl: string;
  googleClientId?: string;
  keycloak?: KeycloakConfig;
  requestTimeoutMs: number;
  defaultLanguage: string;
  enableDebugTools: boolean;
}
