import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { permissionGuard } from '../../core/guards/permission.guard';
import { ClientLayoutComponent } from '../../core/layout/client-layout.component';
import { CheckoutPage } from '../order/checkout/checkout.page';
import { MyOrderDetailPage } from '../order/my-order-detail/my-order-detail.page';
import { MyOrdersPage } from '../order/my-orders/my-orders.page';

export const clientRoutes: Routes = [
  {
    path: '',
    component: ClientLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [permissionGuard],
    children: [
      {
        path: 'checkout',
        component: CheckoutPage,
        data: { roles: ['CUSTOMER'] },
      },
      {
        path: 'orders/me',
        component: MyOrdersPage,
        data: { roles: ['CUSTOMER'] },
      },
      {
        path: 'orders/me/:id',
        component: MyOrderDetailPage,
        data: { roles: ['CUSTOMER'] },
      },
      { path: '', pathMatch: 'full', redirectTo: 'orders/me' },
    ],
  },
];
