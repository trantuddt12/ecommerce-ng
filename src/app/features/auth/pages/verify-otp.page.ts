import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OtpPurpose, RegisterRequest } from '../../../core/models/auth.models';
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
              <input matInput type="text" formControlName="purpose" readonly />
            </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>OTP</mat-label>
            <input matInput type="text" formControlName="otp" />
          </mat-form-field>

          <div class="auth-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || submitting() || blocked()">Xac thuc</button>
            <button mat-stroked-button type="button" [disabled]="!canResend() || submitting() || blocked()" (click)="resendOtp()">Gui lai OTP</button>
          </div>

          @if (countdown() > 0) {
            <p>Con gui lai sau {{ countdown() }}s.</p>
          }

          @if (remainingAttempts() !== null) {
            <p>So lan thu con lai: {{ remainingAttempts() }}</p>
          }

          @if (blocked()) {
            <p>OTP tam thoi bi khoa. Vui long thu lai sau {{ countdown() }}s.</p>
          }

          <div class="auth-links">
            <a mat-button routerLink="/auth/login">Quay lai dang nhap</a>
            <a mat-button routerLink="/auth/forgot-password">Quen mat khau</a>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`form { display: grid; gap: 1rem; }`],
})
export class VerifyOtpPage implements OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private countdownTimer?: ReturnType<typeof setInterval>;

  protected readonly submitting = signal(false);
  protected readonly countdown = signal(0);
  protected readonly remainingAttempts = signal<number | null>(null);
  protected readonly blocked = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    purpose: ['REGISTER' as OtpPurpose, [Validators.required]],
    otp: ['', [Validators.required]],
  });

  constructor() {
    const email = this.route.snapshot.queryParamMap.get('email');
    const purpose = this.route.snapshot.queryParamMap.get('purpose') as OtpPurpose | null;
    const resendAfterSeconds = Number(this.route.snapshot.queryParamMap.get('resendAfterSeconds') ?? '0');
    if (email) {
      this.form.patchValue({ email });
    }
    if (purpose) {
      this.form.patchValue({ purpose });
    }
    this.startCountdown(Number.isFinite(resendAfterSeconds) ? resendAfterSeconds : 0);
  }

  ngOnDestroy(): void {
    this.stopCountdown();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.authService.verifyOtp(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.remainingAttempts.set(null);
        this.blocked.set(false);
        if (response.nextAction === 'RESET_PASSWORD') {
          this.notifications.success('OTP hop le. Vui long dat lai mat khau.');
          void this.router.navigate(['/auth/reset-password'], {
            queryParams: {
              email: this.form.controls.email.getRawValue(),
              expiresInSeconds: response.resetGrantExpiresInSeconds ?? 600,
            },
          });
          return;
        }

        sessionStorage.removeItem('auth.register-otp-draft');
        this.notifications.success('OTP hop le. Ban co the dang nhap.');
        void this.router.navigateByUrl('/auth/login');
      },
      error: (error) => {
        const mappedError = this.errorMapper.map(error);
        this.remainingAttempts.set(mappedError.remainingAttempts ?? null);
        if (mappedError.retryAfterSeconds) {
          this.startCountdown(mappedError.retryAfterSeconds);
        }
        this.blocked.set(mappedError.code === 'OTP_VERIFY_BLOCKED');
        this.notifications.error(mappedError.message);
      },
      complete: () => this.submitting.set(false),
    });
  }

  protected canResend(): boolean {
    return this.countdown() <= 0;
  }

  protected resendOtp(): void {
    const email = this.form.controls.email.getRawValue();
    const purpose = this.form.controls.purpose.getRawValue();

    this.submitting.set(true);
    if (purpose === 'REGISTER') {
      const draft = this.getRegisterDraft();
      if (!draft || draft.email !== email) {
        this.submitting.set(false);
        this.notifications.error('Khong tim thay du lieu dang ky de gui lai OTP. Vui long quay lai form dang ky.');
        return;
      }

      this.authService.registerWithOtp(draft).subscribe({
        next: (response) => {
          this.startCountdown(response.resendAfterSeconds);
          this.notifications.success('Da gui lai OTP dang ky.');
        },
        error: (error) => this.handleResendError(error),
        complete: () => this.submitting.set(false),
      });
      return;
    }

    this.authService.sendOtp({ email, purpose }).subscribe({
      next: (response) => {
        this.startCountdown(response.resendAfterSeconds);
        this.notifications.success('Da gui lai OTP.');
      },
      error: (error) => this.handleResendError(error),
      complete: () => this.submitting.set(false),
    });
  }

  private handleResendError(error: unknown): void {
    const mappedError = this.errorMapper.map(error);
    if (mappedError.retryAfterSeconds) {
      this.startCountdown(mappedError.retryAfterSeconds);
    }
    this.notifications.error(mappedError.message);
  }

  private getRegisterDraft(): RegisterRequest | null {
    const raw = sessionStorage.getItem('auth.register-otp-draft');
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as RegisterRequest;
    } catch {
      return null;
    }
  }

  private startCountdown(seconds: number): void {
    this.stopCountdown();
    const initialSeconds = Math.max(0, Math.floor(seconds));
    this.countdown.set(initialSeconds);
    if (initialSeconds <= 0) {
      return;
    }

    this.countdownTimer = setInterval(() => {
      const nextValue = this.countdown() - 1;
      if (nextValue <= 0) {
        this.stopCountdown();
        this.countdown.set(0);
        return;
      }
      this.countdown.set(nextValue);
    }, 1000);
  }

  private stopCountdown(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = undefined;
    }
  }
}
