import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { APP_ROUTES } from '../constants/app-routes';
import { AuthService } from '../services/auth.service';
import { AuthStore } from '../state/auth.store';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <section class="client-shell">
      <header class="client-header">
        <div class="client-branding">
          <p class="client-eyebrow">Ecommerce Client</p>
          <h1>My Orders</h1>
        </div>

        <nav class="client-nav" aria-label="Client navigation">
          <a [routerLink]="APP_ROUTES.checkout" routerLinkActive="active">Checkout</a>
          <a [routerLink]="APP_ROUTES.myOrders" routerLinkActive="active">Orders</a>
        </nav>

        <div class="client-user-box">
          <div>
            <strong>{{ authStore.currentUser()?.displayName || 'Guest' }}</strong>
            <p>{{ authStore.currentUser()?.email || 'Chua dang nhap' }}</p>
          </div>
          <button type="button" class="logout-button" (click)="logout()">Dang xuat</button>
        </div>
      </header>

      <main class="client-content">
        <router-outlet></router-outlet>
      </main>
    </section>
  `,
  styles: [`
    .client-shell {
      min-height: 100vh;
      background: linear-gradient(180deg, #ecfeff 0%, #f8fafc 100%);
    }

    .client-header {
      position: sticky;
      top: 0;
      z-index: 20;
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid rgba(148, 163, 184, 0.25);
      background: rgba(255, 255, 255, 0.86);
      backdrop-filter: blur(10px);
    }

    .client-branding h1 {
      margin: 0;
      font-size: 1.2rem;
      color: #0f172a;
    }

    .client-eyebrow {
      margin: 0 0 0.2rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.7rem;
      color: #0891b2;
    }

    .client-nav {
      justify-self: center;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(226, 232, 240, 0.55);
      border-radius: 999px;
      padding: 0.25rem;
    }

    .client-nav a {
      color: #0f172a;
      text-decoration: none;
      border-radius: 999px;
      padding: 0.5rem 0.85rem;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .client-nav a.active {
      color: #fff;
      background: #0891b2;
    }

    .client-user-box {
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }

    .client-user-box p {
      margin: 0.2rem 0 0;
      color: #64748b;
      font-size: 0.8rem;
    }

    .logout-button {
      border: 0;
      border-radius: 999px;
      padding: 0.6rem 0.9rem;
      color: #fff;
      background: #0f172a;
      cursor: pointer;
    }

    .client-content {
      padding: 1.25rem;
      max-width: 1160px;
      margin: 0 auto;
    }

    @media (max-width: 960px) {
      .client-header {
        grid-template-columns: 1fr;
      }

      .client-nav {
        justify-self: start;
      }

      .client-user-box {
        justify-content: space-between;
      }
    }
  `],
})
export class ClientLayoutComponent {
  protected readonly APP_ROUTES = APP_ROUTES;
  protected readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout().subscribe(() => {
      void this.router.navigate(['/auth/login']);
    });
  }
}
