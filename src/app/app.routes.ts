import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';
import { AuthLayoutComponent } from './core/layout/auth-layout.component';
import { ForgotPasswordPage } from './features/auth/pages/forgot-password.page';
import { KeycloakCallbackPage } from './features/auth/pages/keycloak-callback.page';
import { LoginPage } from './features/auth/pages/login.page';
import { RegisterPage } from './features/auth/pages/register.page';
import { ResetPasswordPage } from './features/auth/pages/reset-password.page';
import { VerifyEmailPage } from './features/auth/pages/verify-email.page';
import { VerifyOtpPage } from './features/auth/pages/verify-otp.page';
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
    loadChildren: () => import('./features/public/public.routes').then((m) => m.publicRoutes),
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      { path: 'login', component: LoginPage },
      // Redirect target registered on the Keycloak `ecommerce-ng` client. Sits under the
      // guest-guarded branch on purpose: the session is still empty when Keycloak sends the
      // browser back here.
      { path: 'keycloak/callback', component: KeycloakCallbackPage },
      { path: 'register', component: RegisterPage },
      { path: 'verify-email', component: VerifyEmailPage },
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
