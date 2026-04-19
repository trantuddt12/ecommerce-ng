import { Injectable } from '@angular/core';
import { catchError, finalize, map, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { BaseApiService } from '../http/base-api.service';
import { ApiEnvelope, LoginRequest, LoginResponse, OtpRequest, RegisterRequest, UserResponse, VerifyOtpRequest } from '../models/auth.models';
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
    return this.api.post<ApiEnvelope<LoginResponse>>(API_ENDPOINTS.auth.login, payload).pipe(
      switchMap((response) => {
        const accessToken = response.data.accessToken;
        this.sessionService.setAccessToken(accessToken);
        this.currentUserService.setCurrentUserFromToken(accessToken);
        return this.currentUserService.loadCurrentUser().pipe(map(() => response.data));
      }),
    );
  }

  register(payload: RegisterRequest) {
    return this.api.post<ApiEnvelope<UserResponse>>(API_ENDPOINTS.user.register, payload);
  }

  registerWithOtp(payload: RegisterRequest) {
    return this.api.post<string>(API_ENDPOINTS.auth.sendOtpRegister, payload);
  }

  verifyOtpRegister(payload: VerifyOtpRequest) {
    return this.verifyOtp({
      ...payload,
      otpType: 'otp:register:',
    });
  }

  loginWithGoogle(googleToken: string) {
    return this.login({ googleToken });
  }

  refresh(): Observable<string> {
    if (!this.refreshInFlight$) {
      this.authStore.setRefreshing(true);
      this.refreshInFlight$ = this.api.post<ApiEnvelope<LoginResponse>>(API_ENDPOINTS.auth.refresh, {}).pipe(
        map((response) => response.data.accessToken),
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
    return this.api.post<void>(API_ENDPOINTS.auth.sendOtp, {}, 'api', {
      pOtpType: payload.username ?? '',
      pToEmail: payload.email ?? '',
    });
  }

  sendOtpRegister(payload: RegisterRequest) {
    return this.api.post<string>(API_ENDPOINTS.auth.sendOtpRegister, payload);
  }

  verifyOtp(payload: VerifyOtpRequest) {
    return this.api.post<string>(API_ENDPOINTS.auth.verifyOtp, {}, 'api', {
      pOtpType: payload.otpType ?? '',
      pEmail: payload.email ?? '',
      pOtp: payload.otp,
    });
  }
}
