import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-card class="auth-page auth-card">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <p class="auth-eyebrow">Quen mat khau</p>
          <h2 class="auth-title">Gui OTP dat lai mat khau qua email.</h2>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" />
          </mat-form-field>

          <div class="auth-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || submitting()">Gui OTP</button>
          </div>

          <div class="auth-links">
            <a mat-button routerLink="/auth/login">Quay lai dang nhap</a>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`form { display: grid; gap: 1rem; }`],
})
export class ForgotPasswordPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const email = this.form.controls.email.getRawValue();
    this.authService.requestForgotPassword(email).subscribe({
      next: (response) => {
        this.notifications.success('Neu email hop le, OTP da duoc gui.');
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
        if (mappedError.retryAfterSeconds) {
          void this.router.navigate(['/auth/verify-otp'], {
            queryParams: {
              email,
              purpose: 'FORGOT_PASSWORD',
              resendAfterSeconds: mappedError.retryAfterSeconds,
            },
          });
        }
        this.notifications.error(mappedError.message);
      },
      complete: () => this.submitting.set(false),
    });
  }
}
