import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-verify-email-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule],
  template: `
    <section class="state-shell">
      <mat-card class="state-card verify-email-card">
        <mat-card-content>
          @if (loading()) {
            <p class="state-code state-code-primary">...</p>
            <h1>{{ loadingTitle() }}</h1>
            <p>{{ loadingDescription() }}</p>
          } @else if (verified()) {
            <p class="state-code state-code-success">OK</p>
            <h1>Email da duoc xac thuc</h1>
            <p>{{ message() }}</p>
            @if (verifiedEmail()) {
              <p class="verify-email-note">Tai khoan: {{ verifiedEmail() }}</p>
            }
            <div class="verify-email-actions">
              <a mat-flat-button color="primary" routerLink="/auth/login">Dang nhap ngay</a>
              <a mat-stroked-button routerLink="/auth/register">Dang ky tai khoan khac</a>
            </div>
          } @else if (pending()) {
            <p class="state-code state-code-primary">&#64;</p>
            <h1>Email xac thuc da duoc gui</h1>
            <p>{{ message() }}</p>
            <div class="verify-email-actions">
              <a mat-flat-button color="primary" routerLink="/auth/login">Ve dang nhap</a>
              <a mat-stroked-button routerLink="/auth/register">Sua thong tin dang ky</a>
            </div>
          } @else {
            <p class="state-code state-code-warning">!</p>
            <h1>Khong the xac thuc email</h1>
            <p>{{ message() }}</p>
            <div class="verify-email-actions">
              <a mat-flat-button color="primary" routerLink="/auth/register">Quay lai dang ky</a>
              <a mat-stroked-button routerLink="/auth/login">Ve dang nhap</a>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </section>
  `,
  styles: [`
    .verify-email-card { max-width: 34rem; margin: 0 auto; }
    .state-code-success { color: #15803d; }
    .state-code-warning { color: #b45309; }
    .verify-email-note {
      margin-top: 0.75rem;
      color: rgba(15, 23, 42, 0.72);
      font-weight: 500;
    }
    .verify-email-actions {
      margin-top: 1.25rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: center;
    }
  `],
})
export class VerifyEmailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly notifications = inject(NotificationService);

  protected readonly loading = signal(true);
  protected readonly verified = signal(false);
  protected readonly message = signal('Dang xu ly lien ket xac thuc email.');
  protected readonly verifiedEmail = signal<string | null>(null);
  protected readonly pendingEmail = signal<string | null>(null);
  protected readonly pending = signal(false);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';
    const pending = this.route.snapshot.queryParamMap.get('pending') === 'true';
    const email = this.route.snapshot.queryParamMap.get('email')?.trim() ?? '';

    if (!token) {
      if (pending) {
        this.pending.set(true);
        this.pendingEmail.set(email || null);
        this.message.set(email
          ? `Da gui lien ket xac thuc toi ${email}. Vui long mo email va bam vao lien ket xac nhan.`
          : 'Da gui lien ket xac thuc toi email cua ban. Vui long mo hop thu va bam vao lien ket xac nhan.');
        this.loading.set(false);
        return;
      }

      this.loading.set(false);
      this.message.set('Lien ket xac thuc khong hop le hoac thieu token.');
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: (response) => {
        this.verified.set(response.verified);
        this.verifiedEmail.set(response.email);
        this.message.set(response.message);
        this.notifications.success(response.message);
        this.loading.set(false);
      },
      error: (error) => {
        this.message.set(this.errorMapper.map(error).message);
        this.loading.set(false);
      },
    });
  }

  protected loadingTitle(): string {
    return this.pending() ? 'Kiem tra email cua ban' : 'Dang xac thuc email';
  }

  protected loadingDescription(): string {
    return this.pending()
      ? 'He thong dang cho ban mo email va bam vao lien ket xac thuc vua duoc gui.'
      : 'Vui long cho trong giay lat trong khi he thong kiem tra lien ket xac nhan.';
  }
}
