import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { AuthStore } from '../state/auth.store';

/** Which issuer minted the access token currently in the store. */
export type AuthProvider = 'local' | 'keycloak';

@Injectable({ providedIn: 'root' })
export class SessionService {
  constructor(private readonly authStore: AuthStore) {
    this.restoreAccessToken();
  }

  setAccessToken(token: string, provider: AuthProvider = 'local'): void {
    this.authStore.setAccessToken(token);
    if (this.hasWindow()) {
      window.sessionStorage.setItem(STORAGE_KEYS.accessToken, token);
      window.sessionStorage.setItem(STORAGE_KEYS.authProvider, provider);
    }
  }

  getAccessToken(): string | null {
    return this.authStore.accessToken();
  }

  /**
   * Read straight from storage rather than a signal: the refresh interceptor needs it during the
   * very first request of an SSR-hydrated page, before anything has repopulated in-memory state.
   */
  getAuthProvider(): AuthProvider {
    if (!this.hasWindow()) {
      return 'local';
    }
    return window.sessionStorage.getItem(STORAGE_KEYS.authProvider) === 'keycloak' ? 'keycloak' : 'local';
  }

  hasSession(): boolean {
    return Boolean(this.getAccessToken());
  }

  setKeycloakTokens(refreshToken: string | null, idToken: string | null): void {
    if (!this.hasWindow()) {
      return;
    }
    this.writeOrRemove(STORAGE_KEYS.keycloakRefreshToken, refreshToken);
    this.writeOrRemove(STORAGE_KEYS.keycloakIdToken, idToken);
  }

  getKeycloakRefreshToken(): string | null {
    return this.read(STORAGE_KEYS.keycloakRefreshToken);
  }

  getKeycloakIdToken(): string | null {
    return this.read(STORAGE_KEYS.keycloakIdToken);
  }

  clearSession(): void {
    this.authStore.clear();
    if (!this.hasWindow()) {
      return;
    }

    window.sessionStorage.removeItem(STORAGE_KEYS.accessToken);
    window.sessionStorage.removeItem(STORAGE_KEYS.authProvider);
    window.sessionStorage.removeItem(STORAGE_KEYS.keycloakRefreshToken);
    window.sessionStorage.removeItem(STORAGE_KEYS.keycloakIdToken);
  }

  private restoreAccessToken(): void {
    if (!this.hasWindow()) {
      return;
    }

    const token = window.sessionStorage.getItem(STORAGE_KEYS.accessToken);
    if (token) {
      this.authStore.setAccessToken(token);
    }
  }

  private read(key: string): string | null {
    return this.hasWindow() ? window.sessionStorage.getItem(key) : null;
  }

  private writeOrRemove(key: string, value: string | null): void {
    if (value) {
      window.sessionStorage.setItem(key, value);
    } else {
      window.sessionStorage.removeItem(key);
    }
  }

  private hasWindow(): boolean {
    return typeof window !== 'undefined';
  }
}
