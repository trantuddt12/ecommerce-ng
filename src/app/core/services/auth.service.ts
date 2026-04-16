import { Injectable } from '@angular/core';
import { catchError, finalize, map, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { BaseApiService } from '../http/base-api.service';
import { LoginRequest, LoginResponse, OtpRequest, VerifyOtpRequest } from '../models/auth.models';
import { AuthStore } from '../state/auth.store';
import { CurrentUserService } from './current-user.service';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private refreshInFlight$?: Observable<string>;

  constructor(
    private readonly api: BaseApiService,
    private readonly sessionService: SessionService,
    private readonly currentUserService: CurrentUserService,
    private readonly authStore: AuthStore,
  ) {}

  login(payload: LoginRequest) {
    return this.api.post<LoginResponse>(API_ENDPOINTS.auth.login, payload).pipe(
      switchMap((response) => {
        this.sessionService.setAccessToken(response.accessToken);
        this.currentUserService.setCurrentUserFromToken(response.accessToken);
        return this.currentUserService.loadCurrentUser().pipe(map(() => response));
      }),
    );
  }

  refresh(): Observable<string> {
    if (!this.refreshInFlight$) {
      this.authStore.setRefreshing(true);
      this.refreshInFlight$ = this.api.post<LoginResponse>(API_ENDPOINTS.auth.refresh, {}).pipe(
        map((response) => response.accessToken),
        tap((token) => {
          this.sessionService.setAccessToken(token);
          this.currentUserService.setCurrentUserFromToken(token);
        }),
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
    }

    return this.refreshInFlight$;
  }

  logout() {
    return this.api.post<void>(API_ENDPOINTS.auth.logout, {}).pipe(
      catchError(() => of(void 0)),
      tap(() => this.sessionService.clearSession()),
    );
  }

  sendOtp(payload: OtpRequest) {
    return this.api.post<void>(API_ENDPOINTS.auth.sendOtp, payload);
  }

  sendOtpRegister(payload: OtpRequest) {
    return this.api.post<void>(API_ENDPOINTS.auth.sendOtpRegister, payload);
  }

  verifyOtp(payload: VerifyOtpRequest) {
    return this.api.post<void>(API_ENDPOINTS.auth.verifyOtp, payload);
  }
}
