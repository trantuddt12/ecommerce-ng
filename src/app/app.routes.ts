import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { AuthLayoutComponent } from './core/layout/auth-layout.component';
import { MainLayoutComponent } from './core/layout/main-layout.component';
import { LoginPage } from './features/auth/pages/login.page';
import { RegisterPage } from './features/auth/pages/register.page';
import { VerifyOtpPage } from './features/auth/pages/verify-otp.page';
import { AttributesPage } from './features/catalog/attributes/attributes.page';
import { BrandsPage } from './features/catalog/brands/brands.page';
import { CategoriesPage } from './features/catalog/categories/categories.page';
import { ProductsPage } from './features/catalog/products/products.page';
import { DashboardPage } from './features/dashboard/dashboard.page';
import { RolesPage } from './features/management/roles/roles.page';
import { UsersPage } from './features/management/users/users.page';
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
        path: 'catalog/search',
        component: SearchPage,
        canActivate: [permissionGuard],
        data: { permissions: ['BRAND_VIEW'] },
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: 'dashboard', pathMatch: 'full', redirectTo: 'admin/dashboard' },
  { path: 'forbidden', component: ForbiddenPage },
  { path: '**', component: NotFoundPage },
];
