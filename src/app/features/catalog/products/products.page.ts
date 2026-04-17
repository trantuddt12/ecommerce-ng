import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { AttributeDefinition, Brand, Category, AdminProductListItem, AdminProductUpsertRequest } from '../../../core/models/catalog.models';
import { AttributeApiService } from '../../../core/services/attribute-api.service';
import { BrandApiService } from '../../../core/services/brand-api.service';
import { CategoryApiService } from '../../../core/services/category-api.service';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProductApiService } from '../../../core/services/product-api.service';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    <section class="catalog-page">
      <mat-card class="catalog-hero">
        <mat-card-content>
          <p class="catalog-eyebrow">Catalog</p>
          <h2>Product hub</h2>
          <p>Gom filter, tao nhanh va bang theo doi san pham trong cung mot giao dien Material de thao tac nhanh hon.</p>
        </mat-card-content>
      </mat-card>

      <section class="catalog-stats">
        <mat-card class="catalog-stat-card">
          <mat-card-content>
            <p class="catalog-stat-label">Tong products</p>
            <p class="catalog-stat-value">{{ products().length }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="catalog-stat-card">
          <mat-card-content>
            <p class="catalog-stat-label">Brands loaded</p>
            <p class="catalog-stat-value">{{ brands().length }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="catalog-stat-card">
          <mat-card-content>
            <p class="catalog-stat-label">Images queued</p>
            <p class="catalog-stat-value">{{ selectedFilesCount() }}</p>
          </mat-card-content>
        </mat-card>
      </section>

      <section class="catalog-grid">
        <mat-card class="catalog-panel catalog-span-12">
          <mat-card-content>
            @if (loading() && !products().length) {
              <mat-progress-bar class="catalog-progress" mode="indeterminate"></mat-progress-bar>
            }

            <div class="catalog-panel-header">
              <div>
                <h3>Filters</h3>
                <p>Loc theo keyword, brand, category va khoang gia.</p>
              </div>

              <button mat-stroked-button type="button" (click)="loadProducts()" [disabled]="loading()">Tai lai</button>
            </div>

            @if (errorMessage()) {
              <div class="catalog-error">{{ errorMessage() }}</div>
            }

            <div class="catalog-form-grid-3">
              <mat-form-field appearance="outline">
                <mat-label>Keyword</mat-label>
                <input matInput [(ngModel)]="filters.keyword" placeholder="iPhone" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <input matInput [(ngModel)]="filters.status" placeholder="ACTIVE" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Brand</mat-label>
                <mat-select [(ngModel)]="filters.brandId">
                  <mat-option [value]="null">Tat ca brands</mat-option>
                  @for (brand of brands(); track brand.id) {
                    <mat-option [value]="brand.id">{{ brand.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Category</mat-label>
                <mat-select [(ngModel)]="filters.categoryId">
                  <mat-option [value]="null">Tat ca categories</mat-option>
                  @for (category of categories(); track category.id) {
                    <mat-option [value]="category.id">{{ category.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Min price</mat-label>
                <input matInput type="number" [(ngModel)]="filters.minPrice" min="0" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Max price</mat-label>
                <input matInput type="number" [(ngModel)]="filters.maxPrice" min="0" />
              </mat-form-field>
            </div>

            <div class="catalog-actions">
              <button mat-flat-button color="primary" type="button" (click)="loadProducts()" [disabled]="loading()">Ap dung filter</button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="catalog-panel catalog-span-5">
          <mat-card-content>
            @if (loading()) {
              <mat-progress-bar class="catalog-progress" mode="indeterminate"></mat-progress-bar>
            }

            <div class="catalog-panel-header">
              <div>
                <h3>Tao product nhanh</h3>
                <p>Tao nhanh 1 product voi variant dau tien va file upload.</p>
              </div>
            </div>

            <div class="catalog-form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Code</mat-label>
                <input matInput [(ngModel)]="createForm.code" placeholder="IPHONE-16-PRO" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Name</mat-label>
                <input matInput [(ngModel)]="createForm.name" placeholder="iPhone 16 Pro" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Slug</mat-label>
                <input matInput [(ngModel)]="createForm.slug" placeholder="iphone-16-pro" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Brand</mat-label>
                <mat-select [(ngModel)]="createForm.brandId">
                  <mat-option [value]="null">Chon brand</mat-option>
                  @for (brand of brands(); track brand.id) {
                    <mat-option [value]="brand.id">{{ brand.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Category</mat-label>
                <mat-select [(ngModel)]="createForm.categoryId">
                  <mat-option [value]="null">Chon category</mat-option>
                  @for (category of categories(); track category.id) {
                    <mat-option [value]="category.id">{{ category.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Variant SKU</mat-label>
                <input matInput [(ngModel)]="createForm.variantSku" placeholder="IPH16-PRO-BLK" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Variant name</mat-label>
                <input matInput [(ngModel)]="createForm.variantName" placeholder="Black / 256GB" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Visibility</mat-label>
                <mat-select [(ngModel)]="createForm.visibility">
                  <mat-option value="CATALOG_SEARCH">CATALOG_SEARCH</mat-option>
                  <mat-option value="CATALOG">CATALOG</mat-option>
                  <mat-option value="SEARCH">SEARCH</mat-option>
                  <mat-option value="HIDDEN">HIDDEN</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Variant price</mat-label>
                <input matInput type="number" [(ngModel)]="createForm.variantPrice" min="0" step="0.01" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Stock qty</mat-label>
                <input matInput type="number" [(ngModel)]="createForm.stockQty" min="0" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Short description</mat-label>
              <textarea matInput [(ngModel)]="createForm.shortDescription" rows="2" placeholder="Tom tat ngan cho list/card"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Description</mat-label>
              <textarea matInput [(ngModel)]="createForm.description" rows="4" placeholder="Mo ta product"></textarea>
            </mat-form-field>

            <div class="catalog-form-grid">
              <mat-form-field appearance="outline">
                <mat-label>SEO title</mat-label>
                <input matInput [(ngModel)]="createForm.seoTitle" placeholder="iPhone 16 Pro chinh hang" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>SEO keywords</mat-label>
                <input matInput [(ngModel)]="createForm.seoKeywords" placeholder="iphone,apple,smartphone" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>SEO description</mat-label>
              <textarea matInput [(ngModel)]="createForm.seoDescription" rows="2" placeholder="Mo ta SEO"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Variant axis attribute</mat-label>
              <mat-select [(ngModel)]="createForm.attributeId">
                <mat-option [value]="null">Chon attribute</mat-option>
                @for (attribute of variantAttributes(); track attribute.id) {
                  <mat-option [value]="attribute.id">{{ attribute.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Variant option</mat-label>
              <mat-select [(ngModel)]="createForm.optionId">
                <mat-option [value]="null">Chon option</mat-option>
                @for (option of selectedAttributeOptions(); track option.id) {
                  <mat-option [value]="option.id">{{ option.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <div>
              <label for="product-images-input">Images</label>
              <input id="product-images-input" type="file" multiple (change)="onFilesSelected($event)" />
              <p class="catalog-file-note">{{ selectedFilesCount() ? selectedFilesCount() + ' file da duoc chon.' : 'Chua co file nao duoc chon.' }}</p>
            </div>

            <div class="catalog-actions">
              <button mat-flat-button color="primary" type="button" (click)="createProduct()" [disabled]="loading()">Tao product</button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="catalog-panel catalog-span-7">
          <mat-card-content>
            @if (loading() && products().length) {
              <mat-progress-bar class="catalog-progress" mode="indeterminate"></mat-progress-bar>
            }

            <div class="catalog-panel-header">
              <div>
                <h3>Danh sach products</h3>
                <p>Bang hien thi nhanh tinh trang, thuoc category va so luong media.</p>
              </div>
            </div>

            @if (products().length) {
              <table mat-table [dataSource]="products()" class="catalog-table">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Product</th>
                  <td mat-cell *matCellDef="let product">
                    <div>
                      <strong>{{ product.name }}</strong>
                      <div class="catalog-inline-meta">
                        <mat-chip class="catalog-chip-neutral">#{{ product.id }}</mat-chip>
                        <mat-chip class="catalog-chip-soft">{{ product.code }}</mat-chip>
                        <mat-chip class="catalog-chip-soft">{{ resolveBrandName(product.brandId) }}</mat-chip>
                      </div>
                      <div class="catalog-inline-meta">/{{ product.slug }}</div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="category">
                  <th mat-header-cell *matHeaderCellDef>Category</th>
                  <td mat-cell *matCellDef="let product">{{ resolveCategoryName(product.categoryId) }}</td>
                </ng-container>

                <ng-container matColumnDef="price">
                  <th mat-header-cell *matHeaderCellDef>Price</th>
                  <td mat-cell *matCellDef="let product">{{ product.price ?? '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let product">
                    <mat-chip [class.catalog-chip-success]="product.status === 'ACTIVE'" [class.catalog-chip-neutral]="product.status !== 'ACTIVE'">
                      {{ product.status || 'DRAFT' }}
                    </mat-chip>
                    <div class="catalog-inline-meta">{{ product.visibility || 'CATALOG_SEARCH' }}</div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="variants">
                  <th mat-header-cell *matHeaderCellDef>Variants</th>
                  <td mat-cell *matCellDef="let product">{{ product.variantCount }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            } @else if (!loading()) {
              <div class="catalog-empty">Chua co product nao.</div>
            }
          </mat-card-content>
        </mat-card>
      </section>
    </section>
  `,
  styles: [],
})
export class ProductsPage {
  private readonly productApi = inject(ProductApiService);
  private readonly attributeApi = inject(AttributeApiService);
  private readonly brandApi = inject(BrandApiService);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);

  protected readonly products = signal<AdminProductListItem[]>([]);
  protected readonly brands = signal<Brand[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly variantAttributes = signal<AttributeDefinition[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly displayedColumns = ['name', 'category', 'price', 'status', 'variants'];
  protected readonly filters = {
    keyword: '',
    status: '',
    brandId: null as number | null,
    categoryId: null as number | null,
    minPrice: null as number | null,
    maxPrice: null as number | null,
  };
  protected readonly createForm = {
    code: '',
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    brandId: null as number | null,
    categoryId: null as number | null,
    visibility: 'CATALOG_SEARCH' as 'HIDDEN' | 'CATALOG' | 'SEARCH' | 'CATALOG_SEARCH',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    variantSku: '',
    variantName: '',
    variantPrice: null as number | null,
    stockQty: 0,
    attributeId: null as number | null,
    optionId: null as number | null,
  };
  private selectedFiles: File[] = [];

  constructor() {
    this.loadReferenceData();
    this.loadProducts();
  }

  protected loadReferenceData(): void {
    this.brandApi.list().subscribe({ next: (brands) => this.brands.set(brands) });
    this.categoryApi.list().subscribe({ next: (categories) => this.categories.set(categories) });
    this.attributeApi.listDefinitions().subscribe({
      next: (attributes: AttributeDefinition[]) => this.variantAttributes.set(attributes.filter((attribute: AttributeDefinition) => attribute.variantAxis)),
    });
  }

  protected loadProducts(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.productApi.list(this.filters)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (products) => this.products.set(products),
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
        },
      });
  }

  protected onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFiles = Array.from(input.files ?? []);
  }

  protected createProduct(): void {
    if (!this.createForm.code.trim() || !this.createForm.name.trim() || !this.createForm.slug.trim() || !this.createForm.brandId || !this.createForm.categoryId) {
      this.notifications.error('Can nhap code, name, slug, brand va category.');
      return;
    }

    if (!this.createForm.variantSku.trim()) {
      this.notifications.error('Can it nhat mot variant co SKU.');
      return;
    }

    if (!this.createForm.attributeId || !this.createForm.optionId) {
      this.notifications.error('Can chon it nhat mot variant axis va option de tao SKU hop le.');
      return;
    }

    const request: AdminProductUpsertRequest = {
      code: this.createForm.code.trim(),
      name: this.createForm.name.trim(),
      slug: this.createForm.slug.trim().toLowerCase(),
      shortDescription: this.createForm.shortDescription.trim(),
      description: this.createForm.description.trim(),
      brandId: this.createForm.brandId,
      categoryId: this.createForm.categoryId,
      visibility: this.createForm.visibility,
      seoTitle: this.createForm.seoTitle.trim(),
      seoDescription: this.createForm.seoDescription.trim(),
      seoKeywords: this.createForm.seoKeywords.trim(),
      variants: [{
        sku: this.createForm.variantSku.trim(),
        name: this.createForm.variantName.trim(),
        barcode: '',
        price: this.createForm.variantPrice,
        compareAtPrice: null,
        stockQty: this.createForm.stockQty,
        weight: null,
        imageUrl: '',
        status: 'ACTIVE',
        signature: this.createForm.variantSku.trim(),
        attributes: [{
          attributeId: this.createForm.attributeId,
          optionId: this.createForm.optionId,
        }],
      }],
    };

    this.loading.set(true);
    this.errorMessage.set('');
    this.productApi.create(request, this.selectedFiles)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success('Tao product thanh cong.');
          this.resetCreateForm();
          this.loadProducts();
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }

  protected resolveBrandName(brandId: number): string {
    return this.brands().find((brand) => brand.id === brandId)?.name ?? `#${brandId}`;
  }

  protected resolveCategoryName(categoryId: number): string {
    return this.categories().find((category) => category.id === categoryId)?.name ?? `#${categoryId}`;
  }

  protected selectedFilesCount(): number {
    return this.selectedFiles.length;
  }

  protected selectedAttributeOptions() {
    return this.variantAttributes().find((attribute) => attribute.id === this.createForm.attributeId)?.attributeValues ?? [];
  }

  private resetCreateForm(): void {
    this.createForm.code = '';
    this.createForm.name = '';
    this.createForm.slug = '';
    this.createForm.shortDescription = '';
    this.createForm.description = '';
    this.createForm.brandId = null;
    this.createForm.categoryId = null;
    this.createForm.visibility = 'CATALOG_SEARCH';
    this.createForm.seoTitle = '';
    this.createForm.seoDescription = '';
    this.createForm.seoKeywords = '';
    this.createForm.variantSku = '';
    this.createForm.variantName = '';
    this.createForm.variantPrice = null;
    this.createForm.stockQty = 0;
    this.createForm.attributeId = null;
    this.createForm.optionId = null;
    this.selectedFiles = [];
  }
}
