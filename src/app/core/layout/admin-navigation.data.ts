import { APP_ROUTES } from '../constants/app-routes';

export interface AdminNavigationItem {
  readonly labelKey: string;
  readonly path: string;
  readonly descriptionKey: string;
  readonly keywords: readonly string[];
  readonly permissions?: readonly string[];
}

export interface AdminNavigationSection {
  readonly labelKey: string;
  readonly descriptionKey: string;
  readonly items: readonly AdminNavigationItem[];
}

export const ADMIN_NAVIGATION_SECTIONS: readonly AdminNavigationSection[] = [
  {
    labelKey: 'nav.overview',
    descriptionKey: 'nav.overviewDescription',
    items: [
      {
        labelKey: 'nav.dashboard',
        path: APP_ROUTES.dashboard,
        descriptionKey: 'nav.dashboardDescription',
        keywords: ['dashboard', 'tong quan', 'overview'],
      },
      {
        labelKey: 'nav.search',
        path: APP_ROUTES.search,
        descriptionKey: 'nav.searchDescription',
        keywords: ['search', 'tim kiem', 'quick find'],
        permissions: ['BRAND_VIEW'],
      },
    ],
  },
  {
    labelKey: 'nav.usersSection',
    descriptionKey: 'nav.usersSectionDescription',
    items: [
      {
        labelKey: 'nav.users',
        path: APP_ROUTES.users,
        descriptionKey: 'nav.usersDescription',
        keywords: ['users', 'user', 'nguoi dung', 'tai khoan'],
        permissions: ['USER_VIEW'],
      },
      {
        labelKey: 'nav.roles',
        path: APP_ROUTES.roles,
        descriptionKey: 'nav.rolesDescription',
        keywords: ['roles', 'role', 'phan quyen', 'permission'],
        permissions: ['ROLE_MANAGE', 'ROLE_VIEW'],
      },
    ],
  },
  {
    labelKey: 'nav.catalog',
    descriptionKey: 'nav.catalogDescription',
    items: [
      {
        labelKey: 'nav.brands',
        path: APP_ROUTES.brands,
        descriptionKey: 'nav.brandsDescription',
        keywords: ['brands', 'brand', 'thuong hieu'],
        permissions: ['BRAND_MANAGE', 'BRAND_VIEW'],
      },
      {
        labelKey: 'nav.categories',
        path: APP_ROUTES.categories,
        descriptionKey: 'nav.categoriesDescription',
        keywords: ['categories', 'category', 'danh muc'],
        permissions: ['CATEGORY_MANAGE', 'CATEGORY_VIEW'],
      },
      {
        labelKey: 'nav.products',
        path: APP_ROUTES.products,
        descriptionKey: 'nav.productsDescription',
        keywords: ['products', 'product', 'san pham', 'sku'],
        permissions: ['PRODUCT_VIEW', 'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE', 'PRODUCT_PUBLISH'],
      },
      {
        labelKey: 'nav.inventory',
        path: APP_ROUTES.inventory,
        descriptionKey: 'nav.inventoryDescription',
        keywords: ['inventory', 'stock', 'ton kho'],
        permissions: ['INVENTORY_MANAGE', 'INVENTORY_VIEW'],
      },
      {
        labelKey: 'nav.attributes',
        path: APP_ROUTES.attributes,
        descriptionKey: 'nav.attributesDescription',
        keywords: ['attributes', 'attribute', 'thuoc tinh'],
        permissions: ['ATTRIBUTE_MANAGE', 'ATTRIBUTE_VIEW'],
      },
      {
        labelKey: 'nav.operations',
        path: APP_ROUTES.operations,
        descriptionKey: 'nav.operationsDescription',
        keywords: ['operations', 'dong bo', 'import', 'sync'],
        permissions: ['BRAND_VIEW', 'BRAND_MANAGE', 'CATEGORY_VIEW', 'CATEGORY_MANAGE', 'PRODUCT_VIEW', 'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'ATTRIBUTE_VIEW', 'ATTRIBUTE_MANAGE'],
      },
    ],
  },
  {
    labelKey: 'nav.orderSection',
    descriptionKey: 'nav.orderSectionDescription',
    items: [
      {
        labelKey: 'nav.adminOrders',
        path: APP_ROUTES.adminOrders,
        descriptionKey: 'nav.adminOrdersDescription',
        keywords: ['orders', 'order', 'don hang', 'van hanh'],
        permissions: ['ORDER_VIEW'],
      },
    ],
  },
] as const;
