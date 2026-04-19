import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-verify-otp-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-card class="auth-page auth-card">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <p class="auth-eyebrow">OTP Verify</p>
          <h2 class="auth-title">Xac thuc OTP cho register hoac auth flow.</h2>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Loai OTP</mat-label>
            <input matInput type="text" formControlName="otpType" placeholder="otp:register:" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>OTP</mat-label>
            <input matInput type="text" formControlName="otp" />
          </mat-form-field>

          <div class="auth-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Xac thuc</button>
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
export class VerifyOtpPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    otpType: ['otp:register:', [Validators.required]],
    otp: ['', [Validators.required]],
  });

  constructor() {
    const email = this.route.snapshot.queryParamMap.get('email');
    const otpType = this.route.snapshot.queryParamMap.get('otpType');
    if (email) {
      this.form.patchValue({ email });
    }
    if (otpType) {
      this.form.patchValue({ otpType });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authService.verifyOtp(this.form.getRawValue()).subscribe({
      next: () => {
        this.notifications.success('OTP hop le. Ban co the dang nhap.');
        void this.router.navigateByUrl('/auth/login');
      },
      error: (error) => this.notifications.error(this.errorMapper.map(error).message),
    });
  }
}
