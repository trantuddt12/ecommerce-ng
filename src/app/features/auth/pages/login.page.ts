import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Inject, NgZone, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { APP_CONFIG } from '../../../core/tokens/app-config.token';
import { AppConfig } from '../../../core/config/app-config.model';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PostLoginRouteService } from '../../../core/services/post-login-route.service';
import { APP_ROUTES } from '../../../core/constants/app-routes';

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
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatChipsModule, MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    <mat-card class="auth-page auth-card login-card">
      <mat-card-content>
        <div class="login-shell">
          <div class="login-brand">
            <div class="login-brand__icon" aria-hidden="true">
              <mat-icon>lock_person</mat-icon>
            </div>
            <div>
              <p class="auth-eyebrow">TTL Account</p>
              <h2 class="auth-title">Dang nhap an toan</h2>
              <p class="auth-helper">Chon username/password hoac OTP email de tiep tuc vao he thong.</p>
            </div>
          </div>

          <div class="login-switcher" role="tablist" aria-label="chon cach dang nhap">
            <button
              type="button"
              class="login-switcher__item"
              [class.login-switcher__item--active]="loginMode() === 'password'"
              [attr.aria-selected]="loginMode() === 'password'"
              (click)="setLoginMode('password')"
            >
              <mat-icon aria-hidden="true">password</mat-icon>
              <span>Mat khau</span>
            </button>
            <button
              type="button"
              class="login-switcher__item"
              [class.login-switcher__item--active]="loginMode() === 'otp'"
              [attr.aria-selected]="loginMode() === 'otp'"
              (click)="setLoginMode('otp')"
            >
              <mat-icon aria-hidden="true">mark_email_unread</mat-icon>
              <span>OTP Email</span>
            </button>
          </div>

          @if (loginMode() === 'password') {
            <form [formGroup]="form" (ngSubmit)="submit()" class="login-panel">
              <div class="login-panel__heading">
                <h3>Dang nhap bang username</h3>
                <p>Su dung tai khoan noi bo da duoc cap quyen.</p>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Username</mat-label>
                <mat-icon matPrefix>person</mat-icon>
                <input matInput type="text" formControlName="username" placeholder="admin" autocomplete="username" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Password</mat-label>
                <mat-icon matPrefix>key</mat-icon>
                <input matInput type="password" formControlName="password" placeholder="********" autocomplete="current-password" />
              </mat-form-field>

              <div class="auth-actions auth-actions--primary-only">
                <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Dang nhap</button>
              </div>
            </form>
          } @else {
            <form [formGroup]="otpLoginForm" (ngSubmit)="requestOtpLogin()" class="login-panel otp-login-block">
              <div class="login-panel__heading">
                <h3>Dang nhap bang OTP</h3>
                <p>Nhan ma xac thuc qua email va dang nhap khong can mat khau.</p>
              </div>

              <mat-chip-set aria-label="otp login note">
                <mat-chip>Email cua ban phai ton tai trong he thong</mat-chip>
              </mat-chip-set>

              <mat-form-field appearance="outline">
                <mat-label>Email dang nhap bang OTP</mat-label>
                <mat-icon matPrefix>alternate_email</mat-icon>
                <input matInput type="email" formControlName="email" placeholder="user@example.com" autocomplete="email" />
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

          <mat-card appearance="outlined" class="guest-return">
            <mat-card-content class="guest-return__content">
              <div class="guest-return__message">
                <span class="guest-return__badge">
                  <mat-icon aria-hidden="true">storefront</mat-icon>
                </span>
                <div>
                  <strong>Mua sam voi tu cach khach</strong>
                  <span>Ban co the xem san pham va them vao gio hang truoc khi dang nhap.</span>
                </div>
              </div>
              <a mat-flat-button color="primary" [routerLink]="APP_ROUTES.home">
                Ve trang chu
              </a>
            </mat-card-content>
          </mat-card>

          <div class="auth-links">
            <a mat-button routerLink="/auth/register">Dang ky</a>
            <a mat-button routerLink="/auth/forgot-password">Quen mat khau</a>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .login-card {
      overflow: hidden;
      border: 1px solid rgba(148, 163, 184, 0.18);
      background:
        radial-gradient(circle at top left, rgba(219, 234, 254, 0.95), transparent 42%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
      box-shadow: 0 26px 70px rgba(15, 23, 42, 0.16);
    }
    .login-shell { display: grid; gap: 1.25rem; }
    .login-brand {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 1rem;
      align-items: center;
      padding-bottom: 0.25rem;
    }
    .login-brand__icon {
      display: grid;
      place-items: center;
      width: 3.4rem;
      height: 3.4rem;
      border-radius: 1.1rem;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: white;
      box-shadow: 0 14px 30px rgba(37, 99, 235, 0.25);
    }
    .login-brand__icon mat-icon { width: 1.8rem; height: 1.8rem; font-size: 1.8rem; }
    .login-panel {
      display: grid;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid rgba(148, 163, 184, 0.14);
      border-radius: 1.2rem;
      background: rgba(255, 255, 255, 0.72);
    }
    .login-panel__heading { display: grid; gap: 0.25rem; }
    .login-panel__heading h3 { margin: 0; color: #0f172a; font-size: 1.1rem; }
    .login-panel__heading p { margin: 0; color: rgba(15, 23, 42, 0.68); }
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
    .guest-return {
      border-color: rgba(37, 99, 235, 0.2);
      border-radius: 1rem;
      background: linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(255, 255, 255, 0.95));
    }
    .guest-return__content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem !important;
    }
    .guest-return__message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: rgba(15, 23, 42, 0.82);
    }
    .guest-return__badge {
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      width: 2.3rem;
      height: 2.3rem;
      border-radius: 999px;
      background: #2563eb;
      color: white;
      box-shadow: 0 10px 22px rgba(37, 99, 235, 0.22);
    }
    .guest-return__badge mat-icon { width: 1.2rem; height: 1.2rem; font-size: 1.2rem; }
    .guest-return__message div {
      display: grid;
      gap: 0.2rem;
    }
    .guest-return__message span {
      color: rgba(15, 23, 42, 0.68);
      font-size: 0.9rem;
      line-height: 1.35;
    }
    .login-switcher {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.5rem;
      padding: 0.35rem;
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 999px;
      background: rgba(226, 232, 240, 0.7);
    }
    .login-switcher__item {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: rgba(15, 23, 42, 0.72);
      padding: 0.8rem 1rem;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      transition: background-color 180ms ease, color 180ms ease, box-shadow 180ms ease;
    }
    .login-switcher__item mat-icon { width: 1.1rem; height: 1.1rem; font-size: 1.1rem; }
    .login-switcher__item--active {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: white;
      box-shadow: 0 10px 24px rgba(37, 99, 235, 0.24);
    }
    .auth-actions--primary-only {
      grid-template-columns: 1fr;
    }
    .auth-actions--primary-only button { width: 100%; }
    @media (max-width: 640px) {
      .login-brand { grid-template-columns: 1fr; justify-items: center; text-align: center; }
      .login-switcher {
        grid-template-columns: 1fr;
        border-radius: 1.25rem;
      }
      .login-switcher__item {
        border-radius: 1rem;
      }
      .guest-return__content {
        align-items: stretch;
        flex-direction: column;
      }
      .guest-return__content a {
        width: 100%;
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
  protected readonly APP_ROUTES = APP_ROUTES;

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
