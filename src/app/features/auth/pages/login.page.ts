import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Inject, NgZone, OnDestroy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
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
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-card class="auth-page auth-card">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <p class="auth-eyebrow">Dang nhap</p>
          <h2 class="auth-title">Ket noi voi backend JWT + refresh cookie</h2>

          <mat-form-field appearance="outline">
            <mat-label>Username</mat-label>
            <input matInput type="text" formControlName="username" placeholder="admin" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password" placeholder="********" />
          </mat-form-field>

          <div class="auth-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Dang nhap</button>
          </div>

          @if (showGoogleLogin()) {
            <div class="auth-actions social-login">
              <div #googleButtonContainer class="google-button-container"></div>
            </div>
          }

          <div class="auth-links">
            <a mat-button routerLink="/auth/register">Dang ky</a>
            <a mat-button routerLink="/auth/verify-otp">Xac thuc OTP</a>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`form { display: grid; gap: 1rem; } .social-login { justify-items: center; } .google-button-container { width: 100%; display: flex; justify-content: center; }`],
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

  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
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

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.notifications.success('Dang nhap thanh cong.');
        void this.router.navigateByUrl(this.postLoginRouteService.getDefaultRoute());
      },
      error: (error) => this.notifications.error(this.errorMapper.map(error).message),
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
