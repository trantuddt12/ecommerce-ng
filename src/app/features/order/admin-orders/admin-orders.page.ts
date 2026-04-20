import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { APP_ROUTES } from '../../../core/constants/app-routes';
import { OrderListItem } from '../../../core/models/order.models';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { OrderApiService } from '../../../core/services/order-api.service';

@Component({
  selector: 'app-admin-orders-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatTableModule,
  ],
  template: `
    <section class="order-page">
      <mat-card class="order-hero">
        <mat-card-content>
          <p class="order-eyebrow">Admin Orders</p>
          <h2>Order processing board</h2>
          <p>Quan ly danh sach don voi filter orderNumber, orderStatus, paymentStatus, customerPhone theo <code>GET /orders</code>.</p>
        </mat-card-content>
      </mat-card>

      @if (errorMessage()) {
        <div class="order-error">{{ errorMessage() }}</div>
      }

      <mat-card class="order-panel">
        <mat-card-content>
          @if (loading()) {
            <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          }

          <div class="order-panel-header">
            <div>
              <h3>Danh sach don hang</h3>
              <p>Danh cho van hanh cap nhat tien trinh don.</p>
            </div>
            <button mat-stroked-button type="button" (click)="loadOrders()" [disabled]="loading()">Tai lai</button>
          </div>

          <div class="order-filter-grid order-filter-grid-4">
            <mat-form-field appearance="outline">
              <mat-label>Order number</mat-label>
              <input matInput [(ngModel)]="filters.orderNumber" placeholder="ORD-..." />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Order status</mat-label>
              <input matInput [(ngModel)]="filters.orderStatus" placeholder="PENDING_CONFIRMATION" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Payment status</mat-label>
              <input matInput [(ngModel)]="filters.paymentStatus" placeholder="UNPAID" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Customer phone</mat-label>
              <input matInput [(ngModel)]="filters.customerPhone" placeholder="09..." />
            </mat-form-field>
          </div>

          <div class="order-actions">
            <button mat-flat-button color="primary" type="button" (click)="applyFilters()" [disabled]="loading()">Loc</button>
            <button mat-stroked-button type="button" (click)="resetFilters()" [disabled]="loading()">Reset</button>
          </div>

          @if (items().length) {
            <table mat-table [dataSource]="items()" class="order-table">
              <ng-container matColumnDef="order">
                <th mat-header-cell *matHeaderCellDef>Order</th>
                <td mat-cell *matCellDef="let item">
                  <strong>{{ item.orderNumber }}</strong>
                  <div class="order-muted">{{ item.placedAt | date: 'dd/MM/yyyy HH:mm' }}</div>
                </td>
              </ng-container>

              <ng-container matColumnDef="customer">
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let item">
                  <div>{{ item.customerName || '-' }}</div>
                  <div class="order-muted">{{ item.customerPhone || '-' }}</div>
                </td>
              </ng-container>

              <ng-container matColumnDef="recipient">
                <th mat-header-cell *matHeaderCellDef>Recipient</th>
                <td mat-cell *matCellDef="let item">
                  <div>{{ item.recipientName || '-' }}</div>
                  <div class="order-muted">{{ item.recipientPhone || '-' }}</div>
                </td>
              </ng-container>

              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef>Total</th>
                <td mat-cell *matCellDef="let item">
                  <strong>{{ item.grandTotal | number: '1.0-0' }}</strong>
                  <div class="order-muted">{{ item.currencyCode || 'VND' }}</div>
                </td>
              </ng-container>

              <ng-container matColumnDef="statuses">
                <th mat-header-cell *matHeaderCellDef>Statuses</th>
                <td mat-cell *matCellDef="let item">
                  <div class="order-chip-row">
                    <mat-chip class="order-chip">{{ item.orderStatus }}</mat-chip>
                    <mat-chip class="order-chip order-chip-soft">{{ item.paymentStatus }}</mat-chip>
                    <mat-chip class="order-chip order-chip-neutral">{{ item.fulfillmentStatus }}</mat-chip>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Action</th>
                <td mat-cell *matCellDef="let item">
                  <a mat-stroked-button [routerLink]="APP_ROUTES.adminOrderDetail(item.id)">Xu ly don</a>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>

            <div class="order-pagination">
              <button mat-stroked-button type="button" (click)="previousPage()" [disabled]="loading() || page() <= 0">Trang truoc</button>
              <span>Trang {{ page() + 1 }} / {{ totalPages() }}</span>
              <button mat-stroked-button type="button" (click)="nextPage()" [disabled]="loading() || page() + 1 >= totalPages()">Trang sau</button>
            </div>
          } @else {
            <div class="order-empty">Khong co don nao khop bo loc.</div>
          }
        </mat-card-content>
      </mat-card>
    </section>
  `,
  styles: [`
    .order-page { display: grid; gap: 1.25rem; animation: order-fade-in 360ms ease; }

    .order-hero {
      color: #fff;
      background:
        radial-gradient(circle at 78% 16%, rgba(110, 231, 183, 0.22), transparent 36%),
        linear-gradient(135deg, rgba(3, 7, 18, 0.96) 0%, rgba(30, 64, 175, 0.9) 55%, rgba(15, 118, 110, 0.88) 100%);
      border-radius: 1.2rem;
    }

    .order-hero .mat-mdc-card-content { display: grid; gap: 0.7rem; padding: 1.4rem; }
    .order-eyebrow { margin: 0; text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.74rem; color: rgba(167, 243, 208, 0.95); }
    .order-hero h2 { margin: 0; font-size: clamp(1.5rem, 2.7vw, 2.1rem); }
    .order-hero p { margin: 0; color: rgba(209, 250, 229, 0.9); }

    .order-panel {
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 1.1rem;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.92) 100%);
      animation: order-fade-up 430ms ease;
    }

    .order-panel .mat-mdc-card-content { display: grid; gap: 1rem; padding: 1.1rem; }
    .order-panel-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; }
    .order-panel-header h3 { margin: 0; color: #0f172a; }
    .order-panel-header p { margin: 0.3rem 0 0; color: #64748b; }

    .order-filter-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.85rem;
    }

    .order-filter-grid-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .order-actions { display: flex; gap: 0.7rem; }

    .order-table {
      width: 100%;
      border-radius: 1rem;
      overflow: hidden;
      border: 1px solid rgba(148, 163, 184, 0.14);
      background: rgba(255, 255, 255, 0.75);
    }

    .order-table .mat-mdc-header-row { background: rgba(241, 245, 249, 0.92); }
    .order-table .mat-mdc-header-cell { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.76rem; color: #475569; }
    .order-table .mat-mdc-row:hover { background: rgba(236, 253, 245, 0.75); }

    .order-chip-row { display: flex; flex-wrap: wrap; gap: 0.35rem; }
    .order-chip { background: rgba(220, 252, 231, 0.85) !important; color: #166534 !important; }
    .order-chip-soft { background: rgba(219, 234, 254, 0.8) !important; color: #1d4ed8 !important; }
    .order-chip-neutral { background: rgba(226, 232, 240, 0.95) !important; color: #334155 !important; }

    .order-muted { color: #64748b; font-size: 0.84rem; }
    .order-empty { color: #64748b; padding: 0.35rem 0; }

    .order-pagination {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.7rem;
    }

    .order-error {
      padding: 0.82rem 1rem;
      border-radius: 0.9rem;
      color: #b91c1c;
      background: rgba(254, 226, 226, 0.7);
      border: 1px solid rgba(248, 113, 113, 0.28);
    }

    @keyframes order-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes order-fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 1100px) {
      .order-filter-grid-4 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 760px) {
      .order-filter-grid,
      .order-filter-grid-4 {
        grid-template-columns: 1fr;
      }

      .order-pagination {
        justify-content: flex-start;
      }
    }
  `],
})
export class AdminOrdersPage {
  protected readonly APP_ROUTES = APP_ROUTES;
  private readonly orderApi = inject(OrderApiService);
  private readonly errorMapper = inject(ErrorMapperService);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly items = signal<OrderListItem[]>([]);
  protected readonly displayedColumns = ['order', 'customer', 'recipient', 'total', 'statuses', 'actions'];
  protected readonly page = signal(0);
  protected readonly size = signal(20);
  protected readonly totalPages = signal(1);

  protected readonly filters = {
    orderNumber: '',
    orderStatus: '',
    paymentStatus: '',
    customerPhone: '',
  };

  protected readonly hasActiveFilter = computed(() => {
    return !!(
      this.filters.orderNumber.trim()
      || this.filters.orderStatus.trim()
      || this.filters.paymentStatus.trim()
      || this.filters.customerPhone.trim()
    );
  });

  constructor() {
    this.loadOrders();
  }

  protected loadOrders(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.orderApi
      .list({
        orderNumber: this.filters.orderNumber.trim() || null,
        orderStatus: this.filters.orderStatus.trim() || null,
        paymentStatus: this.filters.paymentStatus.trim() || null,
        customerPhone: this.filters.customerPhone.trim() || null,
        page: this.page(),
        size: this.size(),
        sortBy: 'placedAt',
        sortDir: 'desc',
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (result) => {
          this.items.set(result.items);
          this.totalPages.set(result.totalPages || 1);
        },
        error: (error) => this.errorMessage.set(this.errorMapper.map(error).message),
      });
  }

  protected applyFilters(): void {
    this.page.set(0);
    this.loadOrders();
  }

  protected resetFilters(): void {
    this.filters.orderNumber = '';
    this.filters.orderStatus = '';
    this.filters.paymentStatus = '';
    this.filters.customerPhone = '';
    this.page.set(0);
    this.loadOrders();
  }

  protected previousPage(): void {
    if (this.page() <= 0) {
      return;
    }

    this.page.set(this.page() - 1);
    this.loadOrders();
  }

  protected nextPage(): void {
    if (this.page() + 1 >= this.totalPages()) {
      return;
    }

    this.page.set(this.page() + 1);
    this.loadOrders();
  }
}
