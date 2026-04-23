import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OtpPurpose, RegisterRequest } from '../../../core/models/auth.models';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PostLoginRouteService } from '../../../core/services/post-login-route.service';

@Component({
  selector: 'app-verify-otp-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatChipsModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-card class="auth-page auth-card">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <p class="auth-eyebrow">Xac thuc OTP</p>
          <h2 class="auth-title">Nhap ma OTP da duoc gui toi email cua ban.</h2>

          <mat-chip-set aria-label="otp flow">
            <mat-chip>{{ purposeLabel() }}</mat-chip>
          </mat-chip-set>

          @if (hasFlowContext()) {
            <p class="auth-helper">
              {{ helperText() }}
            </p>
          } @else {
            <div class="auth-inline-note auth-inline-note--warning">
              <p>Trang nay chi dung de nhap ma OTP sau khi ban da gui yeu cau.</p>
              <p>Hay quay lai buoc truoc de gui ma, roi frontend se dua ban tro lai day voi dung email va loai OTP.</p>
            </div>

            <div class="auth-actions auth-actions--stacked">
              <a mat-flat-button color="primary" routerLink="/auth/register">Gui OTP dang ky</a>
              <a mat-stroked-button routerLink="/auth/login">Gui OTP dang nhap</a>
              <a mat-stroked-button routerLink="/auth/forgot-password">Gui OTP quen mat khau</a>
            </div>
          }

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" [readonly]="hasFlowContext()" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Loai OTP</mat-label>
            <input matInput type="text" [value]="purposeLabel()" readonly />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>OTP</mat-label>
            <input matInput type="text" formControlName="otp" placeholder="Nhap ma gom 6 chu so" />
          </mat-form-field>

          <div class="auth-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || submitting() || blocked() || !hasFlowContext()">Xac thuc OTP</button>
            <button mat-stroked-button type="button" [disabled]="!canResend() || submitting() || blocked() || !hasFlowContext()" (click)="resendOtp()">Gui lai OTP</button>
          </div>

          @if (countdown() > 0) {
            <p class="auth-helper">Ban co the gui lai ma sau {{ countdown() }} giay.</p>
          }

          @if (remainingAttempts() !== null) {
            <p class="auth-helper auth-helper--warning">So lan thu con lai: {{ remainingAttempts() }}</p>
          }

          @if (blocked()) {
            <p class="auth-helper auth-helper--warning">OTP tam thoi bi khoa. Vui long thu lai sau {{ countdown() }} giay.</p>
          }

          <div class="auth-links">
            <a mat-button routerLink="/auth/login">Quay lai dang nhap</a>
            <a mat-button routerLink="/auth/forgot-password">Quen mat khau</a>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    form { display: grid; gap: 1rem; }
    .auth-helper { margin: 0; color: rgba(15, 23, 42, 0.78); }
    .auth-helper--warning { color: #b45309; font-weight: 500; }
    .auth-inline-note {
      padding: 0.875rem 1rem;
      border-radius: 1rem;
      border: 1px solid rgba(148, 163, 184, 0.32);
      background: rgba(248, 250, 252, 0.92);
      display: grid;
      gap: 0.35rem;
    }
    .auth-inline-note p { margin: 0; }
    .auth-inline-note--warning {
      border-color: rgba(245, 158, 11, 0.35);
      background: rgba(255, 251, 235, 0.96);
      color: #92400e;
    }
    .auth-actions--stacked {
      grid-template-columns: 1fr;
      align-items: stretch;
    }
  `],
})
export class VerifyOtpPage implements OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly postLoginRouteService = inject(PostLoginRouteService);
  private countdownTimer?: ReturnType<typeof setInterval>;
  private readonly initialPurpose: OtpPurpose;

  protected readonly submitting = signal(false);
  protected readonly countdown = signal(0);
  protected readonly remainingAttempts = signal<number | null>(null);
  protected readonly blocked = signal(false);
  protected readonly hasFlowContext = signal(false);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    purpose: ['REGISTER' as OtpPurpose, [Validators.required]],
    otp: ['', [Validators.required]],
  });

  constructor() {
    const email = this.route.snapshot.queryParamMap.get('email');
    const purpose = this.route.snapshot.queryParamMap.get('purpose') as OtpPurpose | null;
    const resendAfterSeconds = Number(this.route.snapshot.queryParamMap.get('resendAfterSeconds') ?? '0');
    this.initialPurpose = purpose ?? 'REGISTER';
    if (email) {
      this.form.patchValue({ email });
    }
    if (purpose) {
      this.form.patchValue({ purpose });
    }
    this.hasFlowContext.set(Boolean(email && purpose));
    this.startCountdown(Number.isFinite(resendAfterSeconds) ? resendAfterSeconds : 0);
  }

  ngOnDestroy(): void {
    this.stopCountdown();
  }

  submit(): void {
    if (!this.hasFlowContext()) {
      this.notifications.error('Hay gui OTP tu trang dang ky hoac quen mat khau truoc khi xac thuc.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.authService.verifyOtp(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.remainingAttempts.set(null);
        this.blocked.set(false);
        if (response.nextAction === 'LOGIN_SUCCESS') {
          this.authService.completeOtpLogin(response).subscribe({
            next: () => {
              this.notifications.success('Dang nhap bang OTP thanh cong.');
              void this.router.navigateByUrl(this.postLoginRouteService.getDefaultRoute());
            },
            error: (error) => {
              this.notifications.error(this.errorMapper.map(error).message);
            },
          });
          return;
        }

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
    if (!this.hasFlowContext()) {
      this.notifications.error('Hay bat dau tu buoc gui OTP truoc khi dung chuc nang gui lai ma.');
      return;
    }

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

  protected purposeLabel(): string {
    if (this.initialPurpose === 'FORGOT_PASSWORD') {
      return 'Quen mat khau';
    }
    if (this.initialPurpose === 'LOGIN') {
      return 'Dang nhap bang OTP';
    }
    return 'Dang ky tai khoan';
  }

  protected helperText(): string {
    if (this.initialPurpose === 'LOGIN') {
      return 'Nhap ma OTP vua duoc gui toi email de dang nhap vao he thong.';
    }

    return this.initialPurpose === 'FORGOT_PASSWORD'
      ? 'Nhap ma OTP vua duoc gui toi email de tiep tuc dat lai mat khau.'
      : 'Nhap ma OTP vua duoc gui toi email de hoan tat dang ky tai khoan.';
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
