import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { APP_ROUTES } from '../constants/app-routes';
import { AuthStore } from '../state/auth.store';
import { hasAnyPermission } from '../utils/permission.util';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside id="app-sidebar" class="sidebar" [class.open]="isOpen()">
      <div class="sidebar-header">
        <div>
          <p class="sidebar-eyebrow">Navigation</p>
          <strong>Workspace</strong>
        </div>

        <button type="button" class="close-button" (click)="navigate.emit()" aria-label="Dong menu">
          ×
        </button>
      </div>

      @for (item of menuItems; track item.path) {
        @if (!item.permissions || canAccess(item.permissions)) {
          <a [routerLink]="item.path" routerLinkActive="active" (click)="navigate.emit()">{{ item.label }}</a>
        }
      }
    </aside>
  `,
  styles: [`
    .sidebar {
      display: grid;
      gap: 0.5rem;
      padding: 1rem;
      background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
      border-radius: 1.25rem;
      min-height: 100%;
      align-content: start;
    }

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.35rem 0.25rem 0.85rem;
      color: #fff;
    }

    .sidebar-eyebrow {
      margin: 0 0 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 0.72rem;
      color: #94a3b8;
    }

    strong {
      font-size: 1rem;
      font-weight: 700;
    }

    .close-button {
      display: none;
      width: 2.25rem;
      height: 2.25rem;
      border: 0;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      font-size: 1.2rem;
      cursor: pointer;
    }

    a {
      color: #cbd5e1;
      text-decoration: none;
      padding: 0.85rem 1rem;
      border-radius: 0.85rem;
    }

    a.active,
    a:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }

    @media (max-width: 960px) {
      .sidebar {
        position: fixed;
        top: 1rem;
        left: 1rem;
        bottom: 1rem;
        width: min(20rem, calc(100vw - 2rem));
        min-height: auto;
        z-index: 30;
        box-shadow: 0 24px 48px rgba(15, 23, 42, 0.35);
        transform: translateX(calc(-100% - 1rem));
        transition: transform 180ms ease;
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .close-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    }
  `],
})
export class SidebarComponent {
  readonly isOpen = input(false);
  readonly navigate = output<void>();
  private readonly authStore = inject(AuthStore);

  protected readonly menuItems = [
    { label: 'Dashboard', path: APP_ROUTES.dashboard },
    { label: 'Users', path: APP_ROUTES.users, permissions: ['USER_VIEW'] },
    { label: 'Roles', path: APP_ROUTES.roles, permissions: ['ROLE_MANAGE', 'ROLE_VIEW'] },
    { label: 'Brands', path: APP_ROUTES.brands, permissions: ['BRAND_MANAGE', 'BRAND_VIEW'] },
    { label: 'Categories', path: APP_ROUTES.categories, permissions: ['CATEGORY_MANAGE', 'CATEGORY_VIEW'] },
    { label: 'Products', path: APP_ROUTES.products, permissions: ['PRODUCT_VIEW', 'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE', 'PRODUCT_PUBLISH'] },
    { label: 'Attributes', path: APP_ROUTES.attributes, permissions: ['ATTRIBUTE_MANAGE', 'ATTRIBUTE_VIEW'] },
    {
      label: 'Operations',
      path: APP_ROUTES.operations,
      permissions: [
        'BRAND_VIEW',
        'BRAND_MANAGE',
        'CATEGORY_VIEW',
        'CATEGORY_MANAGE',
        'PRODUCT_VIEW',
        'PRODUCT_CREATE',
        'PRODUCT_UPDATE',
        'ATTRIBUTE_VIEW',
        'ATTRIBUTE_MANAGE',
      ],
    },
    { label: 'Search', path: APP_ROUTES.search, permissions: ['BRAND_VIEW'] },
  ];

  protected canAccess(requiredPermissions: string[]): boolean {
    return hasAnyPermission(this.authStore.permissions(), requiredPermissions);
  }
}
