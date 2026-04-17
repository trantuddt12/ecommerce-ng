import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { BaseApiService } from '../../../core/http/base-api.service';
import { ApiEnvelope, RegisterRequest, UserResponse } from '../../../core/models/auth.models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
      <div>
        <p class="eyebrow">Dang ky</p>
        <h2>Form register toi thieu de tiep tuc tich hop business flow.</h2>
      </div>

      <label>
        Username
        <input type="text" formControlName="username" />
      </label>

      <label>
        Email
        <input type="email" formControlName="email" />
      </label>

      <label>
        Password
        <input type="password" formControlName="password" />
      </label>

      <button type="submit" [disabled]="form.invalid">Tao tai khoan</button>

      <a routerLink="/auth/login">Quay lai dang nhap</a>
    </form>
  `,
  styles: [`.auth-form { width: min(28rem, 100%); display: grid; gap: 1rem; } .eyebrow { text-transform: uppercase; letter-spacing: 0.16em; color: #64748b; font-size: 0.75rem; margin: 0 0 0.5rem; } h2 { margin: 0; font-size: 1.8rem; line-height: 1.15; } label { display: grid; gap: 0.45rem; font-weight: 600; color: #334155; } input { border: 1px solid #cbd5e1; border-radius: 0.9rem; padding: 0.95rem 1rem; font: inherit; } button { border: 0; border-radius: 999px; padding: 1rem 1.2rem; background: #0f766e; color: #fff; cursor: pointer; } a { color: #1d4ed8; text-decoration: none; }`],
})
export class RegisterPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly api = inject(BaseApiService);
  private readonly notifications = inject(NotificationService);

  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: RegisterRequest = this.form.getRawValue();

    this.api.post<ApiEnvelope<UserResponse>>(API_ENDPOINTS.user.register, payload).subscribe({
      next: () => this.notifications.success('Dang ky thanh cong.'),
      error: () => undefined,
    });
  }
}
