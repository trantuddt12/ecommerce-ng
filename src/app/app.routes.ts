import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { AuthLayoutComponent } from './core/layout/auth-layout.component';
import { MainLayoutComponent } from './core/layout/main-layout.component';
import { ForgotPasswordPage } from './features/auth/pages/forgot-password.page';
import { LoginPage } from './features/auth/pages/login.page';
import { RegisterPage } from './features/auth/pages/register.page';
import { ResetPasswordPage } from './features/auth/pages/reset-password.page';
import { VerifyOtpPage } from './features/auth/pages/verify-otp.page';
import { AttributesPage } from './features/catalog/attributes/attributes.page';
import { BrandsPage } from './features/catalog/brands/brands.page';
import { CategoriesPage } from './features/catalog/categories/categories.page';
import { OperationsPage } from './features/catalog/operations/operations.page';
import { ProductsPage } from './features/catalog/products/products.page';
import { DashboardPage } from './features/dashboard/dashboard.page';
import { RolesPage } from './features/management/roles/roles.page';
import { UsersPage } from './features/management/users/users.page';
import { AdminOrderDetailPage } from './features/order/admin-order-detail/admin-order-detail.page';
import { AdminOrdersPage } from './features/order/admin-orders/admin-orders.page';
import { CheckoutPage } from './features/order/checkout/checkout.page';
import { MyOrderDetailPage } from './features/order/my-order-detail/my-order-detail.page';
import { MyOrdersPage } from './features/order/my-orders/my-orders.page';
import { SearchPage } from './features/search/search.page';
import { ForbiddenPage } from './features/system/forbidden.page';
import { NotFoundPage } from './features/system/not-found.page';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    component: DashboardPage,
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      { path: 'login', component: LoginPage },
      { path: 'register', component: RegisterPage },
      { path: 'verify-otp', component: VerifyOtpPage },
      { path: 'forgot-password', component: ForgotPasswordPage },
      { path: 'reset-password', component: ResetPasswordPage },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },
  {
    path: 'admin',
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
        path: 'checkout',
        component: CheckoutPage,
      },
      {
        path: 'orders/me',
        component: MyOrdersPage,
      },
      {
        path: 'orders/me/:id',
        component: MyOrderDetailPage,
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
  { path: 'dashboard', pathMatch: 'full', redirectTo: 'admin/dashboard' },
  { path: 'forbidden', component: ForbiddenPage },
  { path: '**', component: NotFoundPage },
];
