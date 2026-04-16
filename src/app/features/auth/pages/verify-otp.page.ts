import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-verify-otp-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
      <div>
        <p class="eyebrow">OTP Verify</p>
        <h2>Xac thuc ma OTP toi thieu cho auth flow.</h2>
      </div>

      <label>
        Email
        <input type="email" formControlName="email" />
      </label>

      <label>
        OTP
        <input type="text" formControlName="otp" />
      </label>

      <button type="submit" [disabled]="form.invalid">Xac thuc</button>
    </form>
  `,
  styles: [`.auth-form { width: min(28rem, 100%); display: grid; gap: 1rem; } .eyebrow { text-transform: uppercase; letter-spacing: 0.16em; color: #64748b; font-size: 0.75rem; margin: 0 0 0.5rem; } h2 { margin: 0; font-size: 1.8rem; line-height: 1.15; } label { display: grid; gap: 0.45rem; font-weight: 600; color: #334155; } input { border: 1px solid #cbd5e1; border-radius: 0.9rem; padding: 0.95rem 1rem; font: inherit; } button { border: 0; border-radius: 999px; padding: 1rem 1.2rem; background: #7c3aed; color: #fff; cursor: pointer; }`],
})
export class VerifyOtpPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    otp: ['', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authService.verifyOtp(this.form.getRawValue()).subscribe({
      next: () => this.notifications.success('OTP hop le.'),
      error: () => undefined,
    });
  }
}
