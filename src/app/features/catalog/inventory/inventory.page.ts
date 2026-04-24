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
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { finalize, forkJoin } from 'rxjs';
import { APP_ROUTES } from '../../../core/constants/app-routes';
import { AuthStore } from '../../../core/state/auth.store';
import {
  AdminInventoryAdjustmentRequest,
  AdminInventoryDetail,
  AdminInventoryListItem,
  Brand,
  Category,
  InventoryAdjustmentReasonCode,
  InventoryAdjustmentType,
  InventoryMovement,
  InventoryQuery,
  InventorySortBy,
  InventoryStatus,
} from '../../../core/models/catalog.models';
import { BrandApiService } from '../../../core/services/brand-api.service';
import { CategoryApiService } from '../../../core/services/category-api.service';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { InventoryApiService } from '../../../core/services/inventory-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { hasAnyPermission } from '../../../core/utils/permission.util';

@Component({
  selector: 'app-inventory-page',
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
    MatSelectModule,
    MatTableModule,
  ],
  template: `
    <section class="inventory-page">
      <mat-card class="inventory-hero">
        <mat-card-content>
          <p class="inventory-eyebrow">Inventory</p>
          <h2>Quan ly ton kho theo SKU</h2>
          <p>UI nay bam theo contract admin inventory: list, detail, movement audit va adjustment ton kho.</p>
        </mat-card-content>
      </mat-card>

      @if (pageError()) {
        <div class="inventory-error">{{ pageError() }}</div>
      }

      <section class="inventory-grid">
        <mat-card class="inventory-panel inventory-span-7">
          <mat-card-content>
            @if (loadingList()) {
              <mat-progress-bar mode="indeterminate"></mat-progress-bar>
            }

            <div class="inventory-panel-header">
              <div>
                <h3>Danh sach ton kho</h3>
                <p>Loc theo SKU, ten san pham, status, category, brand va sap xep server-side.</p>
              </div>
              <button mat-stroked-button type="button" (click)="loadInventoryPage()" [disabled]="loadingList()">Tai lai</button>
            </div>

            <div class="inventory-filter-grid">
              <mat-form-field appearance="outline">
                <mat-label>Keyword</mat-label>
                <input matInput [(ngModel)]="filters.keyword" placeholder="SKU hoac ten san pham" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select [(ngModel)]="filters.inventoryStatus">
                  <mat-option [value]="null">Tat ca</mat-option>
                  @for (status of inventoryStatuses; track status) {
                    <mat-option [value]="status">{{ status }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Category</mat-label>
                <mat-select [(ngModel)]="filters.categoryId">
                  <mat-option [value]="null">Tat ca</mat-option>
                  @for (category of categories(); track category.id) {
                    <mat-option [value]="category.id">{{ category.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Brand</mat-label>
                <mat-select [(ngModel)]="filters.brandId">
                  <mat-option [value]="null">Tat ca</mat-option>
                  @for (brand of brands(); track brand.id) {
                    <mat-option [value]="brand.id">{{ brand.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Sort by</mat-label>
                <mat-select [(ngModel)]="filters.sortBy">
                  <mat-option value="lastModifiedAt">lastModifiedAt</mat-option>
                  <mat-option value="onHandQty">onHandQty</mat-option>
                  <mat-option value="reservedQty">reservedQty</mat-option>
                  <mat-option value="id">id</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Sort dir</mat-label>
                <mat-select [(ngModel)]="filters.sortDir">
                  <mat-option value="desc">desc</mat-option>
                  <mat-option value="asc">asc</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="inventory-actions">
              <button mat-flat-button color="primary" type="button" (click)="applyFilters()" [disabled]="loadingList()">Loc</button>
              <button mat-stroked-button type="button" (click)="resetFilters()" [disabled]="loadingList()">Reset</button>
            </div>

            @if (items().length) {
              <table mat-table [dataSource]="items()" class="inventory-table">
                <ng-container matColumnDef="sku">
                  <th mat-header-cell *matHeaderCellDef>SKU</th>
                  <td mat-cell *matCellDef="let item">
                    <strong>{{ item.sku }}</strong>
                    <div class="inventory-muted">Variant #{{ item.variantId }}</div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="product">
                  <th mat-header-cell *matHeaderCellDef>San pham</th>
                  <td mat-cell *matCellDef="let item">
                    <div>{{ item.productName }}</div>
                    <div class="inventory-muted">Product #{{ item.productId }}</div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="quantities">
                  <th mat-header-cell *matHeaderCellDef>So luong</th>
                  <td mat-cell *matCellDef="let item">
                    <div>On hand: <strong>{{ item.onHandQty }}</strong></div>
                    <div>Reserved: <strong>{{ item.reservedQty }}</strong></div>
                    <div>Available: <strong>{{ item.availableQty }}</strong></div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let item">
                    <mat-chip [class.inventory-chip-success]="item.inventoryStatus === 'IN_STOCK'" [class.inventory-chip-warning]="item.inventoryStatus === 'LOW_STOCK'" [class.inventory-chip-danger]="item.inventoryStatus === 'OUT_OF_STOCK'">
                      {{ item.inventoryStatus }}
                    </mat-chip>
                    @if (item.lowStockMessage) {
                      <div class="inventory-muted">{{ item.lowStockMessage }}</div>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="updatedAt">
                  <th mat-header-cell *matHeaderCellDef>Updated</th>
                  <td mat-cell *matCellDef="let item">{{ item.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Action</th>
                  <td mat-cell *matCellDef="let item">
                    <button mat-stroked-button type="button" (click)="selectInventory(item)">Chi tiet</button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns" (click)="selectInventory(row)"></tr>
              </table>

              <div class="inventory-pagination">
                <button mat-stroked-button type="button" (click)="previousPage()" [disabled]="loadingList() || page() <= 0">Trang truoc</button>
                <span>Trang {{ page() + 1 }} / {{ totalPages() }}</span>
                <button mat-stroked-button type="button" (click)="nextPage()" [disabled]="loadingList() || page() + 1 >= totalPages()">Trang sau</button>
              </div>
            } @else if (!loadingList()) {
              <div class="inventory-empty">Khong co ton kho khop bo loc.</div>
            }
          </mat-card-content>
        </mat-card>

        <mat-card class="inventory-panel inventory-span-5">
          <mat-card-content>
            @if (loadingDetail()) {
              <mat-progress-bar mode="indeterminate"></mat-progress-bar>
            }

            <div class="inventory-panel-header">
              <div>
                <h3>Chi tiet va audit</h3>
                <p>Summary SKU, recent movements va adjustment form.</p>
              </div>
              @if (selectedInventory()) {
                <a mat-stroked-button [routerLink]="APP_ROUTES.products">Products</a>
              }
            </div>

            @if (selectedInventory(); as detail) {
              <div class="inventory-detail-grid">
                <div><strong>SKU:</strong> {{ detail.sku }}</div>
                <div><strong>Variant:</strong> #{{ detail.variantId }}</div>
                <div><strong>Product:</strong> {{ detail.productName }}</div>
                <div><strong>Status:</strong> {{ detail.inventoryStatus }}</div>
                <div><strong>On hand:</strong> {{ detail.onHandQty }}</div>
                <div><strong>Reserved:</strong> {{ detail.reservedQty }}</div>
                <div><strong>Available:</strong> {{ detail.availableQty }}</div>
                <div><strong>Updated:</strong> {{ detail.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</div>
              </div>

              @if (detail.lowStockMessage) {
                <div class="inventory-inline-alert">{{ detail.lowStockMessage }}</div>
              }

              <div class="inventory-section">
                <h4>Adjustment</h4>
                @if (adjustmentError()) {
                  <div class="inventory-inline-error">{{ adjustmentError() }}</div>
                }

                <div class="inventory-filter-grid inventory-filter-grid-2">
                  <mat-form-field appearance="outline">
                    <mat-label>Adjustment type</mat-label>
                    <mat-select [(ngModel)]="adjustmentForm.adjustmentType">
                      @for (type of adjustmentTypes; track type) {
                        <mat-option [value]="type">{{ type }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Reason</mat-label>
                    <mat-select [(ngModel)]="adjustmentForm.reasonCode">
                      @for (reason of adjustmentReasons; track reason) {
                        <mat-option [value]="reason">{{ reason }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Quantity</mat-label>
                    <input matInput type="number" min="1" [(ngModel)]="adjustmentForm.quantity" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Note</mat-label>
                    <input matInput [(ngModel)]="adjustmentForm.note" placeholder="Mo ta ly do dieu chinh" />
                  </mat-form-field>
                </div>

                <div class="inventory-actions">
                  <button mat-flat-button color="primary" type="button" (click)="submitAdjustment()" [disabled]="submittingAdjustment() || !canManage()">
                    {{ submittingAdjustment() ? 'Dang cap nhat...' : 'Dieu chinh ton' }}
                  </button>
                </div>

                @if (!canManage()) {
                  <div class="inventory-muted">Can permission INVENTORY_MANAGE de dieu chinh ton kho.</div>
                }
              </div>

              <div class="inventory-section">
                <div class="inventory-section-header">
                  <h4>Movement timeline</h4>
                  <button mat-stroked-button type="button" (click)="refreshMovements()" [disabled]="loadingMovements()">Tai movement</button>
                </div>

                @if (loadingMovements()) {
                  <mat-progress-bar mode="indeterminate"></mat-progress-bar>
                }

                @if (movements().length) {
                  <div class="inventory-timeline">
                    @for (movement of movements(); track movement.id) {
                      <article class="inventory-timeline-item">
                        <div class="inventory-timeline-header">
                          <strong>{{ movement.movementType }}</strong>
                          <span>{{ movement.performedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
                        </div>
                        <div class="inventory-muted">Ref: {{ movement.referenceType }} / {{ movement.referenceId }}</div>
                        <div class="inventory-muted">Qty: {{ movement.quantity }} | On hand {{ movement.beforeOnHandQty }} -> {{ movement.afterOnHandQty }}</div>
                        <div class="inventory-muted">Reserved {{ movement.beforeReservedQty }} -> {{ movement.afterReservedQty }}</div>
                        <div class="inventory-muted">By: {{ movement.performedBy || 'SYSTEM' }}</div>
                        @if (movement.note) {
                          <div>{{ movement.note }}</div>
                        }
                      </article>
                    }
                  </div>
                } @else if (!loadingMovements()) {
                  <div class="inventory-empty">Chua co movement nao.</div>
                }
              </div>
            } @else {
              <div class="inventory-empty">Chon mot SKU de xem chi tiet ton kho.</div>
            }
          </mat-card-content>
        </mat-card>
      </section>
    </section>
  `,
  styles: [``],
})
export class InventoryPage {
  protected readonly APP_ROUTES = APP_ROUTES;
  private readonly inventoryApi = inject(InventoryApiService);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly brandApi = inject(BrandApiService);
  private readonly authStore = inject(AuthStore);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly notifications = inject(NotificationService);

  protected readonly loadingList = signal(false);
  protected readonly loadingDetail = signal(false);
  protected readonly loadingMovements = signal(false);
  protected readonly submittingAdjustment = signal(false);
  protected readonly pageError = signal('');
  protected readonly adjustmentError = signal('');
  protected readonly items = signal<AdminInventoryListItem[]>([]);
  protected readonly selectedInventory = signal<AdminInventoryDetail | null>(null);
  protected readonly movements = signal<InventoryMovement[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly brands = signal<Brand[]>([]);
  protected readonly page = signal(0);
  protected readonly size = signal(20);
  protected readonly totalPages = signal(1);
  protected readonly displayedColumns = ['sku', 'product', 'quantities', 'status', 'updatedAt', 'actions'];
  protected readonly inventoryStatuses: InventoryStatus[] = ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'];
  protected readonly adjustmentTypes: InventoryAdjustmentType[] = ['IN', 'OUT'];
  protected readonly adjustmentReasons: InventoryAdjustmentReasonCode[] = ['LOST', 'DAMAGED', 'COUNT_FIX', 'FOUND', 'MANUAL'];
  protected readonly filters: {
    keyword: string;
    inventoryStatus: InventoryStatus | null;
    categoryId: number | null;
    brandId: number | null;
    sortBy: InventorySortBy;
    sortDir: 'asc' | 'desc';
  } = {
    keyword: '',
    inventoryStatus: null,
    categoryId: null,
    brandId: null,
    sortBy: 'lastModifiedAt',
    sortDir: 'desc',
  };
  protected readonly adjustmentForm: AdminInventoryAdjustmentRequest = {
    adjustmentType: 'IN',
    quantity: 1,
    reasonCode: 'MANUAL',
    note: '',
  };

  protected readonly canManage = computed(() => hasAnyPermission(this.authStore.permissions(), ['INVENTORY_MANAGE']));

  constructor() {
    this.loadFilterSources();
    this.loadInventoryPage();
  }

  protected applyFilters(): void {
    this.page.set(0);
    this.loadInventoryPage();
  }

  protected resetFilters(): void {
    this.filters.keyword = '';
    this.filters.inventoryStatus = null;
    this.filters.categoryId = null;
    this.filters.brandId = null;
    this.filters.sortBy = 'lastModifiedAt';
    this.filters.sortDir = 'desc';
    this.page.set(0);
    this.loadInventoryPage();
  }

  protected previousPage(): void {
    if (this.page() <= 0) {
      return;
    }

    this.page.set(this.page() - 1);
    this.loadInventoryPage();
  }

  protected nextPage(): void {
    if (this.page() + 1 >= this.totalPages()) {
      return;
    }

    this.page.set(this.page() + 1);
    this.loadInventoryPage();
  }

  protected selectInventory(item: AdminInventoryListItem): void {
    this.loadingDetail.set(true);
    this.pageError.set('');

    this.inventoryApi
      .getByVariantId(item.variantId)
      .pipe(finalize(() => this.loadingDetail.set(false)))
      .subscribe({
        next: (detail) => {
          this.selectedInventory.set(detail);
          this.movements.set(detail.recentMovements ?? []);
          this.adjustmentError.set('');
        },
        error: (error) => {
          const message = this.errorMapper.map(error).message;
          this.pageError.set(message);
          this.notifications.error(message);
        },
      });
  }

  protected refreshMovements(): void {
    const detail = this.selectedInventory();
    if (!detail) {
      return;
    }

    this.loadingMovements.set(true);
    this.inventoryApi
      .getMovements(detail.variantId)
      .pipe(finalize(() => this.loadingMovements.set(false)))
      .subscribe({
        next: (movements) => this.movements.set(movements),
        error: (error) => this.pageError.set(this.errorMapper.map(error).message),
      });
  }

  protected submitAdjustment(): void {
    const detail = this.selectedInventory();
    if (!detail) {
      return;
    }

    this.adjustmentError.set('');
    if (!this.adjustmentForm.quantity || this.adjustmentForm.quantity <= 0) {
      this.adjustmentError.set('So luong dieu chinh phai lon hon 0.');
      return;
    }

    this.submittingAdjustment.set(true);
    this.inventoryApi
      .adjust(detail.variantId, {
        adjustmentType: this.adjustmentForm.adjustmentType,
        quantity: Number(this.adjustmentForm.quantity),
        reasonCode: this.adjustmentForm.reasonCode,
        note: this.adjustmentForm.note?.trim() || null,
      })
      .pipe(finalize(() => this.submittingAdjustment.set(false)))
      .subscribe({
        next: (updated) => {
          this.selectedInventory.set(updated);
          this.movements.set(updated.recentMovements ?? []);
          this.notifications.success('Da dieu chinh ton kho thanh cong.');
          this.loadInventoryPage(false);
        },
        error: (error) => {
          const message = this.errorMapper.map(error).message;
          this.adjustmentError.set(message);
          this.notifications.error(message);
        },
      });
  }

  protected loadInventoryPage(autoSelectFirst = true): void {
    this.loadingList.set(true);
    this.pageError.set('');

    const query: InventoryQuery = {
      keyword: this.filters.keyword.trim() || null,
      inventoryStatus: this.filters.inventoryStatus,
      categoryId: this.filters.categoryId,
      brandId: this.filters.brandId,
      page: this.page(),
      size: this.size(),
      sortBy: this.filters.sortBy,
      sortDir: this.filters.sortDir,
    };

    this.inventoryApi
      .list(query)
      .pipe(finalize(() => this.loadingList.set(false)))
      .subscribe({
        next: (result) => {
          this.items.set(result.items);
          this.totalPages.set(result.totalPages || 1);
          if (autoSelectFirst && result.items.length) {
            this.selectInventory(result.items[0]);
          }
          if (!result.items.length) {
            this.selectedInventory.set(null);
            this.movements.set([]);
          }
        },
        error: (error) => {
          this.pageError.set(this.errorMapper.map(error).message);
          this.items.set([]);
        },
      });
  }

  private loadFilterSources(): void {
    forkJoin({
      categories: this.categoryApi.list({ status: 'ACTIVE', visible: true }),
      brands: this.brandApi.list(),
    }).subscribe({
      next: ({ categories, brands }) => {
        this.categories.set(categories.filter((category) => category.visible && category.status === 'ACTIVE'));
        this.brands.set(brands.filter((brand) => !brand.generic));
      },
      error: () => undefined,
    });
  }
}
