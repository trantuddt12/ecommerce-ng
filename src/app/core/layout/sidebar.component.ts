import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { APP_ROUTES } from '../constants/app-routes';
import { AuthStore } from '../state/auth.store';
import { hasAnyPermission } from '../utils/permission.util';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      @for (item of menuItems; track item.path) {
        @if (!item.permissions || canAccess(item.permissions)) {
          <a [routerLink]="item.path" routerLinkActive="active">{{ item.label }}</a>
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
  `],
})
export class SidebarComponent {
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
