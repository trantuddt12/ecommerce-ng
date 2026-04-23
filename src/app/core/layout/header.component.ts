import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStore } from '../state/auth.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="heading-group">
        <button
          type="button"
          class="menu-button"
          (click)="menuToggle.emit()"
          [attr.aria-expanded]="sidebarOpen()"
          aria-controls="app-sidebar"
          aria-label="Mo menu dieu huong"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div>
          <p class="eyebrow">Admin</p>
          <h1>TTL Ecommerce</h1>
        </div>
      </div>

      <div class="user-box">
        <div class="user-copy">
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
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 20;
    }

    .heading-group {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      min-width: 0;
    }

    .menu-button {
      display: none;
      width: 2.5rem;
      height: 2.5rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.8rem;
      background: #ffffff;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 0.28rem;
      cursor: pointer;
      flex-shrink: 0;
    }

    .menu-button span {
      width: 1rem;
      height: 2px;
      border-radius: 999px;
      background: #0f172a;
    }

    .eyebrow {
      margin: 0 0 0.2rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #64748b;
      font-size: 0.72rem;
    }

    h1 {
      margin: 0;
      font-size: 1.25rem;
      color: #0f172a;
    }

    .user-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-copy {
      text-align: right;
    }

    .user-copy strong {
      display: block;
      color: #0f172a;
      font-size: 0.95rem;
    }

    .user-copy p {
      margin: 0.2rem 0 0;
      color: #64748b;
      font-size: 0.875rem;
    }

    .logout-button {
      border: 1px solid #cbd5e1;
      border-radius: 999px;
      background: #ffffff;
      color: #0f172a;
      padding: 0.7rem 1rem;
      cursor: pointer;
      font: inherit;
    }

    @media (max-width: 960px) {
      .header {
        padding: 0.875rem 1rem;
      }

      .menu-button {
        display: inline-flex;
      }
    }

    @media (max-width: 720px) {
      .header {
        align-items: flex-start;
        flex-direction: column;
      }

      .user-box {
        width: 100%;
        justify-content: space-between;
      }

      .user-copy {
        text-align: left;
      }
    }
  `],
})
export class HeaderComponent {
  readonly sidebarOpen = input(false);
  readonly menuToggle = output<void>();
  protected readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout().subscribe(() => {
      void this.router.navigate(['/auth/login']);
    });
  }
}
