import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { BaseApiService } from '../../../core/http/base-api.service';
import { ApiEnvelope, RegisterRequest, UserResponse } from '../../../core/models/auth.models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-card class="auth-page auth-card">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <p class="auth-eyebrow">Dang ky</p>
          <h2 class="auth-title">Form register toi thieu de tiep tuc tich hop business flow.</h2>

          <mat-form-field appearance="outline">
            <mat-label>Username</mat-label>
            <input matInput type="text" formControlName="username" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput type="password" formControlName="password" />
          </mat-form-field>

          <div class="auth-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Tao tai khoan</button>
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
