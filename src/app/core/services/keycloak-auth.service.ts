import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, finalize, map, Observable, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { KeycloakConfig } from '../config/app-config.model';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { AuthStore } from '../state/auth.store';
import { APP_CONFIG } from '../tokens/app-config.token';
import { CurrentUserService } from './current-user.service';
import { SessionService } from './session.service';

interface KeycloakTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
}

/**
 * OpenID Connect Authorization Code + PKCE against Keycloak, driven entirely from the browser.
 *
 * Hand-rolled rather than delegating to `angular-oauth2-oidc`/`keycloak-js` so the resulting token
 * lands in the existing `SessionService`/`AuthStore`/interceptor stack instead of a parallel one,
 * and so nothing touches `window` during SSR.
 *
 * The backend accepts the resulting RS256 token side by side with its own HS256 tokens, so every
 * API call, guard and permission check downstream stays exactly the same.
 */
@Injectable({ providedIn: 'root' })
export class KeycloakAuthService {
  private refreshInFlight$?: Observable<string>;

  /** Null whenever the environment leaves `issuer`/`clientId` blank, which disables the feature. */
  private readonly config: KeycloakConfig | null;

  constructor(
    private readonly http: HttpClient,
    private readonly sessionService: SessionService,
    private readonly currentUserService: CurrentUserService,
    private readonly authStore: AuthStore,
  ) {
    const keycloak = inject(APP_CONFIG).keycloak;
    this.config = keycloak?.issuer && keycloak.clientId ? keycloak : null;
  }

  isEnabled(): boolean {
    return Boolean(this.config?.issuer && this.config.clientId);
  }

  /**
   * Redirects the browser to the Keycloak login page. Async because the S256 code challenge is
   * derived with Web Crypto, which is promise-based.
   */
  async beginLogin(returnUrl?: string): Promise<void> {
    const config = this.config;
    if (!config || !this.hasWindow()) {
      throw new Error('Keycloak is not configured for this environment.');
    }
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      throw new Error('Keycloak login requires a browser with Web Crypto support.');
    }

    const codeVerifier = this.randomUrlSafeString(32);
    const state = this.randomUrlSafeString(16);
    const codeChallenge = await this.deriveCodeChallenge(codeVerifier);

    window.sessionStorage.setItem(STORAGE_KEYS.keycloakCodeVerifier, codeVerifier);
    window.sessionStorage.setItem(STORAGE_KEYS.keycloakState, state);
    if (returnUrl) {
      window.sessionStorage.setItem(STORAGE_KEYS.keycloakReturnUrl, returnUrl);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scope,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    window.location.assign(`${this.endpoint('auth')}?${params.toString()}`);
  }

  /** Exchanges the authorization code for tokens and loads the local user profile. */
  completeLogin(code: string, state: string): Observable<string> {
    const config = this.config;
    if (!config) {
      return throwError(() => new Error('Keycloak is not configured for this environment.'));
    }

    const expectedState = this.read(STORAGE_KEYS.keycloakState);
    const codeVerifier = this.read(STORAGE_KEYS.keycloakCodeVerifier);
    this.clearTransientState();

    // Guards against an attacker feeding a code from their own session into this browser.
    if (!expectedState || expectedState !== state) {
      return throwError(() => new Error('Keycloak login state does not match. Please start the login again.'));
    }
    if (!codeVerifier) {
      return throwError(() => new Error('Keycloak login session expired before the callback. Please try again.'));
    }

    return this.exchange(
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
        code_verifier: codeVerifier,
      }),
    );
  }

  /**
   * Mirrors `AuthService.refresh()`: one in-flight request shared by every 401 that arrives while
   * it is running, so a burst of parallel calls does not spend the (rotating) refresh token twice.
   */
  refresh(): Observable<string> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const config = this.config;
    const refreshToken = this.sessionService.getKeycloakRefreshToken();
    if (!config || !refreshToken) {
      this.sessionService.clearSession();
      return throwError(() => new Error('Keycloak session expired. Please sign in again.'));
    }

    this.authStore.setRefreshing(true);
    this.refreshInFlight$ = this.exchange(
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.clientId,
      }),
    ).pipe(
      catchError((error) => {
        this.sessionService.clearSession();
        return throwError(() => error);
      }),
      finalize(() => {
        this.refreshInFlight$ = undefined;
        this.authStore.setRefreshing(false);
      }),
      shareReplay(1),
    );

    return this.refreshInFlight$;
  }

  /**
   * Ends the Keycloak SSO session as well as the local one. Without this the realm cookie survives
   * and the next login silently re-authenticates, which reads as "logout did nothing".
   */
  endSession(idToken: string | null): void {
    const config = this.config;
    if (!config || !this.hasWindow()) {
      return;
    }

    const params = new URLSearchParams({ client_id: config.clientId });
    if (config.postLogoutRedirectUri) {
      params.set('post_logout_redirect_uri', config.postLogoutRedirectUri);
    }
    if (idToken) {
      params.set('id_token_hint', idToken);
    }

    window.location.assign(`${this.endpoint('logout')}?${params.toString()}`);
  }

  /** Returns the route captured before the redirect, and forgets it. */
  consumeReturnUrl(): string | null {
    const value = this.read(STORAGE_KEYS.keycloakReturnUrl);
    if (this.hasWindow()) {
      window.sessionStorage.removeItem(STORAGE_KEYS.keycloakReturnUrl);
    }
    return value;
  }

  private exchange(body: URLSearchParams): Observable<string> {
    return this.http
      .post<KeycloakTokenResponse>(this.endpoint('token'), body.toString(), {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      })
      .pipe(
        tap((response) => {
          this.sessionService.setAccessToken(response.access_token, 'keycloak');
          this.sessionService.setKeycloakTokens(response.refresh_token ?? null, response.id_token ?? null);
          this.currentUserService.setCurrentUserFromToken(response.access_token);
        }),
        switchMap((response) =>
          // Roles and permissions come from the backend database, not from the realm, so the
          // profile call is what actually populates authorisation state.
          this.currentUserService.loadCurrentUser().pipe(
            map(() => response.access_token),
            catchError((error) => {
              this.sessionService.clearSession();
              return throwError(() => error);
            }),
          ),
        ),
      );
  }

  private endpoint(name: 'auth' | 'token' | 'logout'): string {
    const issuer = (this.config?.issuer ?? '').replace(/\/+$/, '');
    return `${issuer}/protocol/openid-connect/${name}`;
  }

  private async deriveCodeChallenge(codeVerifier: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
    return this.base64UrlEncode(new Uint8Array(digest));
  }

  private randomUrlSafeString(byteLength: number): string {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    return this.base64UrlEncode(bytes);
  }

  private base64UrlEncode(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private clearTransientState(): void {
    if (!this.hasWindow()) {
      return;
    }
    window.sessionStorage.removeItem(STORAGE_KEYS.keycloakCodeVerifier);
    window.sessionStorage.removeItem(STORAGE_KEYS.keycloakState);
  }

  private read(key: string): string | null {
    return this.hasWindow() ? window.sessionStorage.getItem(key) : null;
  }

  private hasWindow(): boolean {
    return typeof window !== 'undefined';
  }
}
