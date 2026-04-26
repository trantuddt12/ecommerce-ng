import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { APP_ROUTES } from '../constants/app-routes';
import { LanguageSwitcherComponent } from '../i18n/language-switcher.component';
import { TranslatePipe } from '../i18n/translate.pipe';
import { AuthService } from '../services/auth.service';
import { AuthStore } from '../state/auth.store';
import { CartStore } from '../state/cart.store';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LanguageSwitcherComponent, TranslatePipe],
  template: `
    <section class="client-shell">
      <header class="client-header">
        <div class="client-container client-header-inner">
          <a class="client-branding" [routerLink]="APP_ROUTES.homeProducts">
            <span class="client-brand-mark">TTL</span>
            <span class="client-brand-copy">
              <strong>{{ 'client.brand' | appTranslate }}</strong>
              <small>{{ 'client.tagline' | appTranslate }}</small>
            </span>
          </a>

          <nav class="client-nav" aria-label="Client navigation">
            <a [routerLink]="APP_ROUTES.homeProducts" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: false }">{{ 'common.products' | appTranslate }}</a>
            @if (authStore.isAuthenticated()) {
              <a [routerLink]="APP_ROUTES.cart" routerLinkActive="active">{{ 'common.cart' | appTranslate }} <span class="client-cart-badge">{{ cartCount() }}</span></a>
              <a [routerLink]="APP_ROUTES.myOrders" routerLinkActive="active">{{ 'common.orders' | appTranslate }}</a>
            } @else {
              <a [routerLink]="APP_ROUTES.login" routerLinkActive="active">{{ 'common.login' | appTranslate }}</a>
            }
          </nav>

          <div class="client-user-box">
            <div class="client-user-copy">
              <strong>{{ authStore.currentUser()?.displayName || ('client.guestName' | appTranslate) }}</strong>
              <p>{{ authStore.currentUser()?.email || ('client.guestHint' | appTranslate) }}</p>
            </div>
            <app-language-switcher></app-language-switcher>
            @if (authStore.isAuthenticated()) {
              <button type="button" class="client-action-button secondary" (click)="logout()">{{ 'common.logout' | appTranslate }}</button>
            } @else {
              <a class="client-action-button" [routerLink]="APP_ROUTES.login">{{ 'common.account' | appTranslate }}</a>
            }
          </div>
        </div>
      </header>

      <main class="client-content">
        <div class="client-container client-content-inner">
          <router-outlet></router-outlet>
        </div>
      </main>

      <footer class="client-footer">
        <div class="client-container client-footer-inner">
          <span>TTL Ecommerce</span>
          <span>{{ 'client.footerDescription' | appTranslate }}</span>
        </div>
      </footer>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #f8fafc;
    }

    .client-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .client-header {
      position: sticky;
      top: 0;
      z-index: 20;
      background: rgba(255, 255, 255, 0.96);
      border-bottom: 1px solid #e2e8f0;
      backdrop-filter: blur(10px);
    }

    .client-container {
      width: min(1200px, calc(100% - 2rem));
      margin: 0 auto;
    }

    .client-header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.9rem 0;
      flex-wrap: wrap;
    }

    .client-branding {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      color: #0f172a;
      text-decoration: none;
      min-width: 0;
    }

    .client-brand-mark {
      width: 2.75rem;
      height: 2.75rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.9rem;
      background: #0f172a;
      color: #ffffff;
      font-weight: 700;
      flex-shrink: 0;
    }

    .client-brand-copy {
      display: grid;
      gap: 0.15rem;
    }

    .client-brand-copy strong {
      font-size: 1rem;
    }

    .client-brand-copy small,
    .client-user-copy p {
      color: #64748b;
      font-size: 0.875rem;
    }

    .client-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .client-nav a,
    .client-action-button {
      border-radius: 999px;
      padding: 0.7rem 1rem;
      text-decoration: none;
      transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease;
    }

    .client-cart-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.3rem;
      height: 1.3rem;
      margin-left: 0.4rem;
      padding: 0 0.35rem;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.9);
      color: #fff;
      font-size: 0.72rem;
      font-weight: 700;
    }

    .client-nav a {
      color: #475569;
      border: 1px solid transparent;
    }

    .client-nav a.active,
    .client-nav a:hover {
      color: #0f172a;
      background: #e2e8f0;
    }

    .client-user-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 0;
    }

    .client-user-copy {
      text-align: right;
    }

    .client-user-copy strong {
      display: block;
      color: #0f172a;
      font-size: 0.95rem;
    }

    .client-user-copy p {
      margin: 0.2rem 0 0;
    }

    .client-action-button {
      border: 1px solid #0f172a;
      background: #0f172a;
      color: #ffffff;
      cursor: pointer;
      font: inherit;
      white-space: nowrap;
    }

    .client-action-button.secondary {
      background: #ffffff;
      color: #0f172a;
      border-color: #cbd5e1;
    }

    .client-content {
      flex: 1;
      padding: 1rem 0 1.5rem;
    }

    .client-content-inner {
      min-width: 0;
    }

    .client-footer {
      border-top: 1px solid #e2e8f0;
      background: #ffffff;
    }

    .client-footer-inner {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 0;
      color: #64748b;
      font-size: 0.875rem;
      flex-wrap: wrap;
    }

    @media (max-width: 960px) {
      .client-header-inner {
        align-items: flex-start;
      }

      .client-user-box {
        width: 100%;
        justify-content: space-between;
      }

      .client-user-copy {
        text-align: left;
      }
    }

    @media (max-width: 720px) {
      .client-container {
        width: min(100%, calc(100% - 1rem));
      }

      .client-header-inner,
      .client-footer-inner {
        gap: 0.75rem;
      }

      .client-nav {
        width: 100%;
      }

      .client-nav a {
        flex: 1 1 auto;
        text-align: center;
      }

      .client-user-box {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `],
})
export class ClientLayoutComponent {
  protected readonly APP_ROUTES = APP_ROUTES;
  protected readonly authStore = inject(AuthStore);
  protected readonly cartCount = computed(() => this.cartStore.cart()?.totalItems ?? 0);
  private readonly authService = inject(AuthService);
  private readonly cartStore = inject(CartStore);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (!this.authStore.isAuthenticated()) {
        return;
      }

      if (!this.cartStore.cart()) {
        queueMicrotask(() => {
          this.cartStore.loadCart().subscribe({
            error: () => undefined,
          });
        });
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      void this.router.navigate([APP_ROUTES.homeProducts]);
    });
  }
}
