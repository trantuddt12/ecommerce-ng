import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Brand, Category, Product, ProductCreateRequest } from '../../../core/models/catalog.models';
import { BrandApiService } from '../../../core/services/brand-api.service';
import { CategoryApiService } from '../../../core/services/category-api.service';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProductApiService } from '../../../core/services/product-api.service';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <header class="hero">
        <p class="eyebrow">Catalog</p>
        <h2>Product list va create</h2>
        <p>Frontend gui multipart product JSON string + images file list, va filter list theo contract query hien tai.</p>
      </header>

      <section class="panel filter-panel">
        <div class="section-header">
          <h3>Filters</h3>
          <button type="button" class="secondary" (click)="loadProducts()" [disabled]="loading()">Tai lai</button>
        </div>

        <div class="field-grid filters-grid">
          <label>
            <span>Keyword</span>
            <input [(ngModel)]="filters.keyword" placeholder="iPhone" />
          </label>

          <label>
            <span>Status</span>
            <input [(ngModel)]="filters.status" placeholder="ACTIVE" />
          </label>

          <label>
            <span>Brand</span>
            <select [(ngModel)]="filters.brandId">
              <option [ngValue]="null">Tat ca brands</option>
              @for (brand of brands(); track brand.id) {
                <option [ngValue]="brand.id">{{ brand.name }}</option>
              }
            </select>
          </label>

          <label>
            <span>Category</span>
            <select [(ngModel)]="filters.categoryId">
              <option [ngValue]="null">Tat ca categories</option>
              @for (category of categories(); track category.id) {
                <option [ngValue]="category.id">{{ category.name }}</option>
              }
            </select>
          </label>

          <label>
            <span>Min price</span>
            <input type="number" [(ngModel)]="filters.minPrice" min="0" />
          </label>

          <label>
            <span>Max price</span>
            <input type="number" [(ngModel)]="filters.maxPrice" min="0" />
          </label>
        </div>

        <div class="actions">
          <button type="button" (click)="loadProducts()" [disabled]="loading()">Ap dung filter</button>
        </div>
      </section>

      <section class="panel create-panel">
        <div class="section-header">
          <h3>Tao product nhanh</h3>
        </div>

        <div class="field-grid">
          <label>
            <span>Name</span>
            <input [(ngModel)]="createForm.name" placeholder="iPhone 16 Pro" />
          </label>

          <label>
            <span>Price</span>
            <input type="number" [(ngModel)]="createForm.price" min="0" step="0.01" />
          </label>

          <label>
            <span>Brand</span>
            <select [(ngModel)]="createForm.brandId">
              <option [ngValue]="null">Chon brand</option>
              @for (brand of brands(); track brand.id) {
                <option [ngValue]="brand.id">{{ brand.name }}</option>
              }
            </select>
          </label>

          <label>
            <span>Category</span>
            <select [(ngModel)]="createForm.categoryId">
              <option [ngValue]="null">Chon category</option>
              @for (category of categories(); track category.id) {
                <option [ngValue]="category.id">{{ category.name }}</option>
              }
            </select>
          </label>

          <label>
            <span>Variant SKU</span>
            <input [(ngModel)]="createForm.variantSku" placeholder="IPH16-PRO-BLK" />
          </label>

          <label>
            <span>Variant name</span>
            <input [(ngModel)]="createForm.variantName" placeholder="Black / 256GB" />
          </label>

          <label>
            <span>Variant price</span>
            <input type="number" [(ngModel)]="createForm.variantPrice" min="0" step="0.01" />
          </label>

          <label>
            <span>Stock qty</span>
            <input type="number" [(ngModel)]="createForm.stockQty" min="0" />
          </label>
        </div>

        <label>
          <span>Description</span>
          <textarea [(ngModel)]="createForm.description" rows="3" placeholder="Mo ta product"></textarea>
        </label>

        <label>
          <span>Images</span>
          <input type="file" multiple (change)="onFilesSelected($event)" />
        </label>

        <div class="actions">
          <button type="button" (click)="createProduct()" [disabled]="loading()">Tao product</button>
        </div>
      </section>

      <section class="panel table-panel">
        <div class="section-header">
          <h3>Danh sach products</h3>
        </div>

        @if (errorMessage()) {
          <p class="error-message">{{ errorMessage() }}</p>
        }

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Variants</th>
                <th>Images</th>
              </tr>
            </thead>
            <tbody>
              @for (product of products(); track product.id) {
                <tr>
                  <td>{{ product.id }}</td>
                  <td>{{ product.name }}</td>
                  <td>{{ resolveBrandName(product.brandId) }}</td>
                  <td>{{ resolveCategoryName(product.categoryId) }}</td>
                  <td>{{ product.price ?? '-' }}</td>
                  <td>{{ product.status || '-' }}</td>
                  <td>{{ product.variants.length }}</td>
                  <td>{{ product.images.length }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="empty-state">Chua co product nao.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `,
  styles: [],
})
export class ProductsPage {
  private readonly productApi = inject(ProductApiService);
  private readonly brandApi = inject(BrandApiService);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);

  protected readonly products = signal<Product[]>([]);
  protected readonly brands = signal<Brand[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly filters = {
    keyword: '',
    status: '',
    brandId: null as number | null,
    categoryId: null as number | null,
    minPrice: null as number | null,
    maxPrice: null as number | null,
  };
  protected readonly createForm = {
    name: '',
    description: '',
    price: null as number | null,
    brandId: null as number | null,
    categoryId: null as number | null,
    variantSku: '',
    variantName: '',
    variantPrice: null as number | null,
    stockQty: 0,
  };
  private selectedFiles: File[] = [];

  constructor() {
    this.loadReferenceData();
    this.loadProducts();
  }

  protected loadReferenceData(): void {
    this.brandApi.list().subscribe({ next: (brands) => this.brands.set(brands) });
    this.categoryApi.list().subscribe({ next: (categories) => this.categories.set(categories) });
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
    if (!this.createForm.name.trim() || this.createForm.price === null || !this.createForm.brandId || !this.createForm.categoryId) {
      this.notifications.error('Can nhap name, price, brand va category.');
      return;
    }

    if (!this.createForm.variantSku.trim()) {
      this.notifications.error('Can it nhat mot variant co SKU.');
      return;
    }

    const request: ProductCreateRequest = {
      name: this.createForm.name.trim(),
      description: this.createForm.description.trim(),
      price: this.createForm.price,
      brandId: this.createForm.brandId,
      categoryId: this.createForm.categoryId,
      variants: [{
        sku: this.createForm.variantSku.trim(),
        name: this.createForm.variantName.trim(),
        barcode: '',
        price: this.createForm.variantPrice ?? this.createForm.price,
        compareAtPrice: null,
        stockQty: this.createForm.stockQty,
        weight: null,
        imageUrl: '',
        status: null,
        signature: this.createForm.variantSku.trim(),
        attributes: [],
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

  private resetCreateForm(): void {
    this.createForm.name = '';
    this.createForm.description = '';
    this.createForm.price = null;
    this.createForm.brandId = null;
    this.createForm.categoryId = null;
    this.createForm.variantSku = '';
    this.createForm.variantName = '';
    this.createForm.variantPrice = null;
    this.createForm.stockQty = 0;
    this.selectedFiles = [];
  }
}
