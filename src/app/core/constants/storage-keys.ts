export const STORAGE_KEYS = {
  accessToken: 'ecommerce.access-token',
  language: 'ecommerce.language',
  // Which issuer minted the current access token, so refresh and logout pick the right flow.
  authProvider: 'ecommerce.auth-provider',
  keycloakRefreshToken: 'ecommerce.keycloak.refresh-token',
  keycloakIdToken: 'ecommerce.keycloak.id-token',
  // Short-lived, only between the redirect to Keycloak and the callback.
  keycloakCodeVerifier: 'ecommerce.keycloak.code-verifier',
  keycloakState: 'ecommerce.keycloak.state',
  keycloakReturnUrl: 'ecommerce.keycloak.return-url',
} as const;
