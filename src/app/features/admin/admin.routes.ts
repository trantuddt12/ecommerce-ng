import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { permissionGuard } from '../../core/guards/permission.guard';
import { MainLayoutComponent } from '../../core/layout/main-layout.component';
import { AttributesPage } from '../catalog/attributes/attributes.page';
import { BrandsPage } from '../catalog/brands/brands.page';
import { CategoriesPage } from '../catalog/categories/categories.page';
import { OperationsPage } from '../catalog/operations/operations.page';
import { ProductsPage } from '../catalog/products/products.page';
import { DashboardPage } from '../dashboard/dashboard.page';
import { RolesPage } from '../management/roles/roles.page';
import { UsersPage } from '../management/users/users.page';
import { AdminOrderDetailPage } from '../order/admin-order-detail/admin-order-detail.page';
import { AdminOrdersPage } from '../order/admin-orders/admin-orders.page';
import { InventoryPage } from '../catalog/inventory/inventory.page';
import { SearchPage } from '../search/search.page';

export const adminRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardPage },
      {
        path: 'management/users',
        component: UsersPage,
        canActivate: [permissionGuard],
        data: { permissions: ['USER_VIEW'] },
      },
      {
        path: 'management/roles',
        component: RolesPage,
        canActivate: [permissionGuard],
        data: { permissions: ['ROLE_VIEW', 'ROLE_MANAGE'] },
      },
      {
        path: 'catalog/brands',
        component: BrandsPage,
        canActivate: [permissionGuard],
        data: { permissions: ['BRAND_VIEW', 'BRAND_MANAGE'] },
      },
      {
        path: 'catalog/categories',
        component: CategoriesPage,
        canActivate: [permissionGuard],
        data: { permissions: ['CATEGORY_VIEW', 'CATEGORY_MANAGE'] },
      },
      {
        path: 'catalog/products',
        component: ProductsPage,
        canActivate: [permissionGuard],
        data: { permissions: ['PRODUCT_VIEW', 'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE', 'PRODUCT_PUBLISH'] },
      },
      {
        path: 'catalog/inventory',
        component: InventoryPage,
        canActivate: [permissionGuard],
        data: { permissions: ['INVENTORY_VIEW', 'INVENTORY_MANAGE'] },
      },
      {
        path: 'catalog/attributes',
        component: AttributesPage,
        canActivate: [permissionGuard],
        data: { permissions: ['ATTRIBUTE_VIEW', 'ATTRIBUTE_MANAGE'] },
      },
      {
        path: 'catalog/operations',
        component: OperationsPage,
        canActivate: [permissionGuard],
        data: {
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
      },
      {
        path: 'catalog/search',
        component: SearchPage,
        canActivate: [permissionGuard],
        data: { permissions: ['BRAND_VIEW'] },
      },
      {
        path: 'orders',
        component: AdminOrdersPage,
        canActivate: [permissionGuard],
        data: { permissions: ['ORDER_VIEW'] },
      },
      {
        path: 'orders/:id',
        component: AdminOrderDetailPage,
        canActivate: [permissionGuard],
        data: { permissions: ['ORDER_VIEW'] },
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
];
