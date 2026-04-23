import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Inject, NgZone, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { APP_CONFIG } from '../../../core/tokens/app-config.token';
import { AppConfig } from '../../../core/config/app-config.model';
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
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatChipsModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-card class="auth-page auth-card">
      <mat-card-content>
        <div class="login-shell">
          <div class="login-switcher" role="tablist" aria-label="chon cach dang nhap">
            <button
              type="button"
              class="login-switcher__item"
              [class.login-switcher__item--active]="loginMode() === 'password'"
              (click)="setLoginMode('password')"
            >
              Dang nhap thuong
            </button>
            <button
              type="button"
              class="login-switcher__item"
              [class.login-switcher__item--active]="loginMode() === 'otp'"
              (click)="setLoginMode('otp')"
            >
              Dang nhap bang OTP
            </button>
          </div>

          @if (loginMode() === 'password') {
            <form [formGroup]="form" (ngSubmit)="submit()" class="login-panel">
              <p class="auth-eyebrow">Dang nhap</p>
              <h2 class="auth-title">Dang nhap bang username va mat khau.</h2>
              <p class="auth-helper">Phu hop khi ban dang co thong tin dang nhap thong thuong.</p>

              <mat-form-field appearance="outline">
                <mat-label>Username</mat-label>
                <input matInput type="text" formControlName="username" placeholder="admin" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Password</mat-label>
                <input matInput type="password" formControlName="password" placeholder="********" />
              </mat-form-field>

              <div class="auth-actions auth-actions--primary-only">
                <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Dang nhap</button>
              </div>
            </form>
          } @else {
            <form [formGroup]="otpLoginForm" (ngSubmit)="requestOtpLogin()" class="login-panel otp-login-block">
              <p class="auth-eyebrow">Dang nhap bang OTP</p>
              <h2 class="auth-title">Nhan ma OTP qua email va dang nhap khong can nhap mat khau.</h2>
              <p class="auth-helper">Nhap email tai khoan, he thong se gui ma OTP de ban tiep tuc xac thuc.</p>

              <mat-chip-set aria-label="otp login note">
                <mat-chip>Email cua ban phai ton tai trong he thong</mat-chip>
              </mat-chip-set>

              <mat-form-field appearance="outline">
                <mat-label>Email dang nhap bang OTP</mat-label>
                <input matInput type="email" formControlName="email" placeholder="user@example.com" />
              </mat-form-field>

              <div class="auth-actions auth-actions--primary-only">
                <button mat-flat-button color="primary" type="submit" [disabled]="otpLoginForm.invalid">Gui OTP dang nhap</button>
              </div>
            </form>
          }

          @if (showGoogleLogin()) {
            <div class="social-login-block">
              <p class="auth-helper auth-helper--centered">Hoac tiep tuc bang Google</p>
              <div class="auth-actions social-login">
                <div #googleButtonContainer class="google-button-container"></div>
              </div>
            </div>
          }

          <div class="auth-links">
            <a mat-button routerLink="/auth/register">Dang ky</a>
            <a mat-button routerLink="/auth/forgot-password">Quen mat khau</a>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .login-shell { display: grid; gap: 1.25rem; }
    .login-panel { display: grid; gap: 1rem; }
    .social-login { justify-items: center; }
    .google-button-container { width: 100%; display: flex; justify-content: center; }
    .otp-login-block { display: grid; gap: 1rem; }
    .auth-helper { margin: 0; color: rgba(15, 23, 42, 0.75); }
    .auth-helper--centered { text-align: center; }
    .social-login-block {
      display: grid;
      gap: 0.75rem;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(148, 163, 184, 0.2);
    }
    .login-switcher {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.5rem;
      padding: 0.35rem;
      border-radius: 999px;
      background: rgba(226, 232, 240, 0.7);
    }
    .login-switcher__item {
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: rgba(15, 23, 42, 0.72);
      padding: 0.8rem 1rem;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 180ms ease, color 180ms ease, box-shadow 180ms ease;
    }
    .login-switcher__item--active {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: white;
      box-shadow: 0 10px 24px rgba(37, 99, 235, 0.24);
    }
    .auth-actions--primary-only {
      grid-template-columns: 1fr;
    }
    @media (max-width: 640px) {
      .login-switcher {
        grid-template-columns: 1fr;
        border-radius: 1.25rem;
      }
      .login-switcher__item {
        border-radius: 1rem;
      }
    }
  `],
})
export class LoginPage implements AfterViewInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly postLoginRouteService = inject(PostLoginRouteService);
  private googleScript?: HTMLScriptElement;

  protected readonly loginMode = signal<'password' | 'otp'>('password');

  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  protected readonly otpLoginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  protected setLoginMode(mode: 'password' | 'otp'): void {
    this.loginMode.set(mode);
  }

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

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.notifications.success('Dang nhap thanh cong.');
        void this.router.navigateByUrl(this.postLoginRouteService.getDefaultRoute());
      },
      error: (error) => this.notifications.error(this.errorMapper.map(error).message),
    });
  }

  protected requestOtpLogin(): void {
    if (this.otpLoginForm.invalid) {
      this.otpLoginForm.markAllAsTouched();
      return;
    }

    const email = this.otpLoginForm.controls.email.getRawValue();
    this.authService.sendOtp({ email, purpose: 'LOGIN' }).subscribe({
      next: (response) => {
        this.notifications.success('Da gui OTP dang nhap. Vui long kiem tra email.');
        this.loginMode.set('otp');
        void this.router.navigate(['/auth/verify-otp'], {
          queryParams: {
            email: response.email,
            purpose: response.purpose,
            resendAfterSeconds: response.resendAfterSeconds,
          },
        });
      },
      error: (error) => {
        const mappedError = this.errorMapper.map(error);
        this.notifications.error(mappedError.message);
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
    const container = document.querySelector('.google-button-container');
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
              this.notifications.success('Dang nhap Google thanh cong.');
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
      text: 'signin_with',
    });
  }
}
