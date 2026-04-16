import { Injectable } from '@angular/core';
import { APP_ROUTES } from '../constants/app-routes';
import { AuthStore } from '../state/auth.store';
import { hasAnyPermission } from '../utils/permission.util';

@Injectable({ providedIn: 'root' })
export class PostLoginRouteService {
  constructor(private readonly authStore: AuthStore) {}

  getDefaultRoute(): string {
    const permissions = this.authStore.permissions();
    debugger;
    if (hasAnyPermission(permissions, ['USER_MANAGE', 'USER_VIEW'])) {
      return APP_ROUTES.users;
    }

    if (hasAnyPermission(permissions, ['ROLE_MANAGE', 'ROLE_VIEW'])) {
      return APP_ROUTES.roles;
    }

    if (hasAnyPermission(permissions, ['PRODUCT_MANAGE', 'PRODUCT_VIEW'])) {
      return APP_ROUTES.products;
    }

    if (hasAnyPermission(permissions, ['CATEGORY_MANAGE', 'CATEGORY_VIEW'])) {
      return APP_ROUTES.categories;
    }

    if (hasAnyPermission(permissions, ['BRAND_MANAGE', 'BRAND_VIEW'])) {
      return APP_ROUTES.brands;
    }

    if (hasAnyPermission(permissions, ['ATTRIBUTE_MANAGE', 'ATTRIBUTE_VIEW'])) {
      return APP_ROUTES.attributes;
    }

    if (hasAnyPermission(permissions, ['SEARCH_VIEW'])) {
      return APP_ROUTES.search;
    }

    return APP_ROUTES.dashboard;
  }
}
