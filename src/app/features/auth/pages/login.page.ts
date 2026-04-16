import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PostLoginRouteService } from '../../../core/services/post-login-route.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
      <div>
        <p class="eyebrow">Dang nhap</p>
        <h2>Ket noi voi backend JWT + refresh cookie</h2>
      </div>

      <label>
        Username
        <input type="text" formControlName="username" placeholder="admin" />
      </label>

      <label>
        Password
        <input type="password" formControlName="password" placeholder="********" />
      </label>

      <button type="submit" [disabled]="form.invalid">Dang nhap</button>

      <div class="links">
        <a routerLink="/auth/register">Dang ky</a>
        <a routerLink="/auth/verify-otp">Xac thuc OTP</a>
      </div>
    </form>
  `,
  styles: [`
    .auth-form { width: min(28rem, 100%); display: grid; gap: 1rem; }
    .eyebrow { text-transform: uppercase; letter-spacing: 0.16em; color: #64748b; font-size: 0.75rem; margin: 0 0 0.5rem; }
    h2 { margin: 0; font-size: 1.9rem; line-height: 1.15; }
    label { display: grid; gap: 0.45rem; font-weight: 600; color: #334155; }
    input { border: 1px solid #cbd5e1; border-radius: 0.9rem; padding: 0.95rem 1rem; font: inherit; }
    button { border: 0; border-radius: 999px; padding: 1rem 1.2rem; background: #1d4ed8; color: #fff; cursor: pointer; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .links { display: flex; justify-content: space-between; }
    a { color: #1d4ed8; text-decoration: none; }
  `],
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly postLoginRouteService = inject(PostLoginRouteService);

  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

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
      error: () => undefined,
    });
  }
}
