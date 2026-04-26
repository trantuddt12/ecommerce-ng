import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, map, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { BaseApiService } from '../http/base-api.service';
import {
  ApiEnvelope,
  ForgotPasswordConfirmRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  SendOtpRequest,
  SendOtpResponse,
  UserResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '../models/auth.models';
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
        return this.currentUserService.loadCurrentUser().pipe(
          map(() => response.data),
          catchError((error) => {
            this.sessionService.clearSession();
            return throwError(() => error);
          }),
        );
      }),
    );
  }

  register(payload: RegisterRequest) {
    return this.api.post<ApiEnvelope<UserResponse>>(API_ENDPOINTS.user.register, payload);
  }

  registerWithOtp(payload: RegisterRequest) {
    return this.api.post<ApiEnvelope<SendOtpResponse>>(API_ENDPOINTS.auth.sendOtpRegister, payload).pipe(map((response) => response.data));
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
        switchMap((token) =>
          this.currentUserService.loadCurrentUser().pipe(
            map(() => token),
            catchError((error) => {
              this.sessionService.clearSession();
              return throwError(() => error);
            }),
          ),
        ),
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
    return this.api.postText(API_ENDPOINTS.auth.logout, {}).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
          return of(void 0);
        }
        return of(void 0);
      }),
      map(() => void 0),
      tap(() => this.sessionService.clearSession()),
    );
  }

  sendOtp(payload: SendOtpRequest) {
    return this.api.post<ApiEnvelope<SendOtpResponse>>(API_ENDPOINTS.auth.sendOtp, payload).pipe(map((response) => response.data));
  }

  requestForgotPassword(email: string) {
    return this.api.post<ApiEnvelope<SendOtpResponse>>(API_ENDPOINTS.auth.forgotPasswordRequest, { email }).pipe(map((response) => response.data));
  }

  verifyOtp(payload: VerifyOtpRequest) {
    return this.api.post<ApiEnvelope<VerifyOtpResponse>>(API_ENDPOINTS.auth.verifyOtp, payload).pipe(map((response) => response.data));
  }

  completeOtpLogin(response: VerifyOtpResponse) {
    const accessToken = response.accessToken;
    if (!accessToken) {
      return throwError(() => new Error('OTP login response is missing access token.'));
    }

    this.sessionService.setAccessToken(accessToken);
    this.currentUserService.setCurrentUserFromToken(accessToken);
    return this.currentUserService.loadCurrentUser().pipe(
      map(() => accessToken),
      catchError((error) => {
        this.sessionService.clearSession();
        return throwError(() => error);
      }),
    );
  }

  confirmForgotPassword(payload: ForgotPasswordConfirmRequest) {
    return this.api.post<string>(API_ENDPOINTS.auth.forgotPasswordConfirm, payload);
  }
}
