import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject, signal } from '@angular/core';
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
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-card class="auth-page auth-card">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <p class="auth-eyebrow">Dat lai mat khau</p>
          <h2 class="auth-title">Nhap mat khau moi de tiep tuc dang nhap.</h2>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" readonly />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Mat khau moi</mat-label>
            <input matInput type="password" formControlName="newPassword" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Xac nhan mat khau moi</mat-label>
            <input matInput type="password" formControlName="confirmPassword" />
          </mat-form-field>

          @if (countdown() > 0) {
            <p>Reset grant con hieu luc trong {{ countdown() }}s.</p>
          }

          <div class="auth-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || submitting() || countdown() === 0">Cap nhat mat khau</button>
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
export class ResetPasswordPage implements OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private countdownTimer?: ReturnType<typeof setInterval>;

  protected readonly submitting = signal(false);
  protected readonly countdown = signal(0);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    const email = this.route.snapshot.queryParamMap.get('email') ?? '';
    const expiresInSeconds = Number(this.route.snapshot.queryParamMap.get('expiresInSeconds') ?? '600');
    this.form.patchValue({ email });
    this.startCountdown(Number.isFinite(expiresInSeconds) ? expiresInSeconds : 600);
  }

  ngOnDestroy(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.authService.confirmForgotPassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.notifications.success('Dat lai mat khau thanh cong. Vui long dang nhap lai.');
        void this.router.navigateByUrl('/auth/login');
      },
      error: (error) => this.notifications.error(this.errorMapper.map(error).message),
      complete: () => this.submitting.set(false),
    });
  }

  private startCountdown(seconds: number): void {
    this.countdown.set(Math.max(0, Math.floor(seconds)));
    if (this.countdown() <= 0) {
      return;
    }

    this.countdownTimer = setInterval(() => {
      const nextValue = this.countdown() - 1;
      if (nextValue <= 0) {
        if (this.countdownTimer) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = undefined;
        }
        this.countdown.set(0);
        return;
      }

      this.countdown.set(nextValue);
    }, 1000);
  }
}
