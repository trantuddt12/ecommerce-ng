import { Routes } from '@angular/router';
import { ClientLayoutComponent } from '../../core/layout/client-layout.component';
import { DashboardPage } from '../dashboard/dashboard.page';
import { PublicProductsPage } from './public-products.page';

export const publicRoutes: Routes = [
  {
    path: '',
    component: ClientLayoutComponent,
    children: [
      { path: '', component: PublicProductsPage },
      { path: 'products', pathMatch: 'full', redirectTo: '' },
      { path: 'category/:categorySlug', component: PublicProductsPage },
      { path: 'brand/:brandSlug', component: PublicProductsPage },
      { path: 'dashboard', component: DashboardPage },
    ],
  },
];
