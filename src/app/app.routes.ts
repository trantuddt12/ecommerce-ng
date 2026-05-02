import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';
import { AuthLayoutComponent } from './core/layout/auth-layout.component';
import { ClientLayoutComponent } from './core/layout/client-layout.component';
import { ForgotPasswordPage } from './features/auth/pages/forgot-password.page';
import { LoginPage } from './features/auth/pages/login.page';
import { RegisterPage } from './features/auth/pages/register.page';
import { ResetPasswordPage } from './features/auth/pages/reset-password.page';
import { VerifyOtpPage } from './features/auth/pages/verify-otp.page';
import { PublicProductsPage } from './features/public/public-products.page';
import { ForbiddenPage } from './features/system/forbidden.page';
import { NotFoundPage } from './features/system/not-found.page';

export const routes: Routes = [
  {
    path: '',
    component: ClientLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: PublicProductsPage,
      },
    ],
  },
  {
    path: 'home',
    loadChildren: () => import('./features/public/public.routes').then((m) => m.publicRoutes),
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
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: 'client',
    loadChildren: () => import('./features/client/client.routes').then((m) => m.clientRoutes),
  },
  { path: 'dashboard', pathMatch: 'full', redirectTo: 'admin/dashboard' },
  { path: 'forbidden', component: ForbiddenPage },
  { path: '**', component: NotFoundPage },
];
