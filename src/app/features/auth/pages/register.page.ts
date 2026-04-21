import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Inject, NgZone, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AppConfig } from '../../../core/config/app-config.model';
import { RegisterRequest, SendOtpResponse } from '../../../core/models/auth.models';
import { APP_CONFIG } from '../../../core/tokens/app-config.token';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PostLoginRouteService } from '../../../core/services/post-login-route.service';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-card class="auth-page auth-card">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <p class="auth-eyebrow">Dang ky</p>
          <h2 class="auth-title">Form register toi thieu de tiep tuc tich hop business flow.</h2>

          <mat-form-field appearance="outline">
            <mat-label>Username</mat-label>
            <input matInput type="text" formControlName="username" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>So dien thoai</mat-label>
            <input matInput type="text" formControlName="phonenumber" />
          </mat-form-field>

          <div class="auth-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || submitting()">Tao tai khoan</button>
            <button mat-stroked-button type="button" [disabled]="form.invalid || submitting()" (click)="submitWithOtp()">Dang ky bang OTP</button>
          </div>

          @if (showGoogleLogin()) {
            <div class="auth-actions social-login">
              <div class="register-google-button-container"></div>
            </div>
          }

          <div class="auth-links">
            <a mat-button routerLink="/auth/login">Quay lai dang nhap</a>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`form { display: grid; gap: 1rem; } .social-login { justify-items: center; } .register-google-button-container { width: 100%; display: flex; justify-content: center; }`],
})
export class RegisterPage implements AfterViewInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly postLoginRouteService = inject(PostLoginRouteService);
  private googleScript?: HTMLScriptElement;

  protected readonly submitting = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phonenumber: [''],
  });

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  protected showGoogleLogin(): boolean {
    return Boolean(this.config.googleClientId);
  }

  ngAfterViewInit(): void {
    if (!this.showGoogleLogin() || typeof document === 'undefined') {
      return;
    }

    this.loadGoogleScript();
  }

  ngOnDestroy(): void {
    this.googleScript?.remove();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: RegisterRequest = this.form.getRawValue();

    this.submitting.set(true);
    this.authService.register(payload).subscribe({
      next: () => {
        this.notifications.success('Dang ky thanh cong. Vui long dang nhap.');
        void this.router.navigateByUrl('/auth/login');
      },
      error: (error) => this.notifications.error(this.errorMapper.map(error).message),
      complete: () => this.submitting.set(false),
    });
  }

  submitWithOtp(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const payload: RegisterRequest = this.form.getRawValue();
    this.authService.registerWithOtp(payload).subscribe({
      next: (response) => {
        sessionStorage.setItem('auth.register-otp-draft', JSON.stringify(payload));
        this.notifications.success('Da gui OTP dang ky. Vui long kiem tra email.');
        this.navigateToVerifyOtp(response);
      },
      error: (error) => {
        const mappedError = this.errorMapper.map(error);
        if (mappedError.retryAfterSeconds) {
          void this.router.navigate(['/auth/verify-otp'], {
            queryParams: {
              email: payload.email,
              purpose: 'REGISTER',
              resendAfterSeconds: mappedError.retryAfterSeconds,
            },
          });
        }
        this.notifications.error(mappedError.message);
      },
      complete: () => this.submitting.set(false),
    });
  }

  private navigateToVerifyOtp(response: SendOtpResponse): void {
    void this.router.navigate(['/auth/verify-otp'], {
      queryParams: {
        email: response.email,
        purpose: response.purpose,
        resendAfterSeconds: response.resendAfterSeconds,
      },
    });
  }

  private loadGoogleScript(): void {
    if (window.google?.accounts?.id) {
      this.renderGoogleButton();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => this.renderGoogleButton();
    document.head.appendChild(script);
    this.googleScript = script;
  }

  private renderGoogleButton(): void {
    const container = document.querySelector('.register-google-button-container');
    if (!(container instanceof HTMLElement) || !window.google?.accounts?.id || !this.config.googleClientId) {
      return;
    }

    container.innerHTML = '';
    window.google.accounts.id.initialize({
      client_id: this.config.googleClientId,
      callback: ({ credential }: { credential?: string }) => {
        if (!credential) {
          this.notifications.error('Khong lay duoc Google credential.');
          return;
        }

        this.ngZone.run(() => {
          this.authService.loginWithGoogle(credential).subscribe({
            next: () => {
              this.notifications.success('Dang ky/Dang nhap Google thanh cong.');
              void this.router.navigateByUrl(this.postLoginRouteService.getDefaultRoute());
            },
            error: (error) => this.notifications.error(this.errorMapper.map(error).message),
          });
        });
      },
    });
    window.google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      width: 280,
      text: 'signup_with',
    });
  }
}
