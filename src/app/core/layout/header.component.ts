import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStore } from '../state/auth.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div>
        <div class="eyebrow">Ecommerce Admin</div>
        <h1>Control Center</h1>
      </div>

      <div class="user-box">
        <div>
          <strong>{{ authStore.currentUser()?.displayName || 'Guest' }}</strong>
          <p>{{ authStore.currentUser()?.email || 'Chua dang nhap' }}</p>
        </div>

        @if (authStore.isAuthenticated()) {
          <button type="button" class="logout-button" (click)="logout()">Dang xuat</button>
        }
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid rgba(148, 163, 184, 0.2);
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(12px);
    }

    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: #64748b;
      font-size: 0.75rem;
      margin-bottom: 0.4rem;
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
    }

    .user-box {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    p {
      margin: 0.25rem 0 0;
      color: #64748b;
      font-size: 0.875rem;
    }

    .logout-button {
      border: 0;
      border-radius: 999px;
      background: #0f172a;
      color: #fff;
      padding: 0.8rem 1rem;
      cursor: pointer;
    }
  `],
})
export class HeaderComponent {
  protected readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout().subscribe(() => {
      void this.router.navigate(['/auth/login']);
    });
  }
}
