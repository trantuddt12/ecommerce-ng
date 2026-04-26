import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { APP_ROUTES } from '../../core/constants/app-routes';
import { AppConfig } from '../../core/config/app-config.model';
import { AdminProductListItem, Brand, Category, CategoryTreeNode } from '../../core/models/catalog.models';
import { AuthStore } from '../../core/state/auth.store';
import { APP_CONFIG } from '../../core/tokens/app-config.token';
import { resolveMediaUrl } from '../../core/utils/media-url.util';
import { BrandApiService } from '../../core/services/brand-api.service';
import { CartApiService } from '../../core/services/cart-api.service';
import { CategoryApiService } from '../../core/services/category-api.service';
import { ErrorMapperService } from '../../core/services/error-mapper.service';
import { NotificationService } from '../../core/services/notification.service';
import { ProductApiService } from '../../core/services/product-api.service';

@Component({
  selector: 'app-public-products-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  template: `
    <section class="home-page">
      <section class="home-hero">
        <div>
          <p class="home-eyebrow">Mua sắm điện máy</p>
          <h1>Trang chủ gọn hơn, tập trung vào tìm kiếm và danh mục sản phẩm.</h1>
          <p class="home-description">
            Tìm nhanh sản phẩm theo tên, chọn category để xem đúng danh sách đang quan tâm
            và thêm ngay vào giỏ hàng.
          </p>
        </div>

        <div class="home-hero-actions">
          <a mat-flat-button color="primary" [routerLink]="APP_ROUTES.homeProducts">Xem tất cả sản phẩm</a>
          <a mat-stroked-button [routerLink]="APP_ROUTES.cart">Mở giỏ hàng</a>
          @if (canAccessAdmin()) {
            <a mat-stroked-button [routerLink]="APP_ROUTES.dashboard">Vào trang admin</a>
          }
        </div>

        <div class="home-stats">
          <article class="home-stat-card">
            <span>Tổng sản phẩm</span>
            <strong>{{ products().length }}</strong>
          </article>
          <article class="home-stat-card">
            <span>Đang hiển thị</span>
            <strong>{{ filteredProducts().length }}</strong>
          </article>
          <article class="home-stat-card">
            <span>Category</span>
            <strong>{{ categoryTree().length }}</strong>
          </article>
        </div>
      </section>

      @if (loading() && !products().length && !categoryTree().length) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      @if (errorMessage()) {
        <div class="home-error">
          <p>{{ errorMessage() }}</p>
        </div>
      }

      <section class="home-layout">
        <aside class="home-sidebar" aria-label="Danh mục sản phẩm">
          <div class="home-sidebar-header">
            <h2>Danh mục</h2>
            @if (selectedCategoryId() !== null) {
              <button class="home-clear-button" type="button" (click)="clearCategoryFilter()">Bỏ chọn</button>
            }
          </div>

          @if (categoryTree().length) {
            <nav aria-label="Chọn danh mục sản phẩm">
              <ul class="home-category-list">
                <li>
                  <button
                    class="home-category-button"
                    type="button"
                    [class.active]="selectedCategoryId() === null"
                    (click)="clearCategoryFilter()"
                  >
                    Tất cả sản phẩm
                  </button>
                </li>
                @for (category of categoryTree(); track category.id) {
                  <li class="home-category-item" (mouseenter)="hoveredCategoryId.set(category.id)" (mouseleave)="hoveredCategoryId.set(null)">
                    <button
                      class="home-category-button"
                      type="button"
                      [class.active]="selectedCategoryId() === category.id"
                      (click)="selectCategory(category.id)"
                    >
                      <span class="home-category-icon-media">
                        @if (resolveCategoryIconUrl(category); as iconUrl) {
                          <img [src]="iconUrl" [alt]="category.name" />
                        } @else {
                          <span>{{ categoryIcon(category.name) }}</span>
                        }
                      </span>
                      <span>{{ category.name }}</span>
                    </button>

                    @if (visibleCategoryChildren(category).length && hoveredCategoryId() === category.id) {
                      <ul class="home-subcategory-list">
                        @for (child of visibleCategoryChildren(category); track child.id) {
                          <li>
                            <button
                              class="home-subcategory-button"
                              type="button"
                              [class.active]="selectedCategoryId() === child.id"
                              (click)="selectCategory(child.id)"
                            >
                              {{ child.name }}
                            </button>
                          </li>
                        }
                      </ul>
                    }
                  </li>
                }
              </ul>
            </nav>
          } @else if (!loading()) {
            <div class="home-empty home-empty-compact">
              <p>Chưa có category nổi bật.</p>
            </div>
          }
        </aside>

        <section class="home-content">
          <mat-card class="home-search-card">
            <mat-card-content>
              <div class="home-search-header">
                <div>
                  <h2>{{ selectedCategoryLabel() }}</h2>
                  <p>{{ resultsDescription() }}</p>
                </div>
                @if (selectedBrandId() !== null) {
                  <button class="home-clear-button" type="button" (click)="selectedBrandId.set(null)">Bỏ brand</button>
                }
              </div>

              <div class="home-search-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Tìm kiếm sản phẩm</mat-label>
                  <input
                    matInput
                    [ngModel]="searchKeyword()"
                    (ngModelChange)="searchKeyword.set($event)"
                    placeholder="Nhập tên sản phẩm..."
                  />
                </mat-form-field>
              </div>

              @if (brands().length) {
                <div class="home-brand-row">
                  <button
                    class="home-brand-chip"
                    type="button"
                    [class.active]="selectedBrandId() === null"
                    (click)="selectedBrandId.set(null)"
                  >
                    Tất cả brand
                  </button>
                  @for (brand of brands(); track brand.id) {
                    <button
                      class="home-brand-chip"
                      type="button"
                      [class.active]="selectedBrandId() === brand.id"
                      (click)="toggleBrand(brand.id)"
                    >
                      {{ brand.name }}
                    </button>
                  }
                </div>
              }
            </mat-card-content>
          </mat-card>

          <section class="home-products-section" aria-labelledby="home-products-heading">
            <div class="home-products-header">
              <h2 id="home-products-heading">Danh sách sản phẩm</h2>
            </div>

            @if (filteredProducts().length) {
              <div class="home-product-grid">
                @for (product of featuredProducts(); track product.id) {
                  <article class="home-product-card">
                    <div class="home-product-media">
                      @if (resolveProductImageUrl(product); as imageUrl) {
                        <img [src]="imageUrl" [alt]="productDisplayName(product)" />
                      } @else {
                        <div class="home-product-placeholder">{{ productInitial(product) }}</div>
                      }
                      <span class="home-status-chip">{{ isPurchasable(product) ? 'Mua ngay' : 'Sắp về hàng' }}</span>
                    </div>

                    <div class="home-product-meta">
                      <p>{{ product.categoryName || 'Danh mục điện máy' }}</p>
                      <h3 class="home-product-title">{{ productDisplayName(product) }}</h3>
                      <strong class="home-product-price">{{ formatCurrency(product.price) }}</strong>
                      <div class="home-product-inventory">{{ inventoryLabel(product) }}</div>
                      @if (product.lowStockMessage) {
                        <div class="home-product-low-stock">{{ product.lowStockMessage }}</div>
                      }
                    </div>

                    <div class="home-product-actions">
                      <button
                        mat-stroked-button
                        type="button"
                        (click)="addToCart(product)"
                        [disabled]="addingProductId() === product.id || buyingProductId() === product.id || !isPurchasable(product)"
                      >
                        {{ addingProductId() === product.id ? 'Đang thêm...' : 'Thêm vào giỏ' }}
                      </button>
                      <a mat-button [routerLink]="APP_ROUTES.cart">Xem giỏ hàng</a>
                      <button
                        mat-flat-button
                        color="primary"
                        type="button"
                        (click)="buyNow(product)"
                        [disabled]="buyingProductId() === product.id || addingProductId() === product.id || !isPurchasable(product)"
                      >
                        {{ buyingProductId() === product.id ? 'Đang xử lý...' : 'Mua ngay' }}
                      </button>
                    </div>
                  </article>
                }
              </div>
            } @else if (!loading()) {
              <div class="home-empty">
                <p>Không có sản phẩm phù hợp với tìm kiếm hoặc category đã chọn.</p>
              </div>
            }
          </section>
        </section>
      </section>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    .home-page {
      display: grid;
      gap: 24px;
      padding: 24px;
    }

    .home-hero {
      display: grid;
      gap: 20px;
      padding: 24px;
      border-radius: 24px;
      background: linear-gradient(135deg, #0f172a, #1d4ed8);
      color: #fff;
    }

    .home-eyebrow {
      margin: 0 0 8px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(219, 234, 254, 0.98);
    }

    .home-hero h1 {
      margin: 0;
      font-size: clamp(28px, 4vw, 42px);
      line-height: 1.2;
      color: #ffffff;
      text-shadow: 0 2px 12px rgba(15, 23, 42, 0.24);
    }

    .home-description {
      margin: 12px 0 0;
      max-width: 720px;
      color: rgba(255, 255, 255, 0.98);
      font-size: 16px;
      line-height: 1.7;
      text-shadow: 0 1px 10px rgba(15, 23, 42, 0.28);
    }

    .home-hero-actions,
    .home-stats,
    .home-brand-row,
    .home-product-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .home-stats {
      gap: 16px;
    }

    .home-stat-card {
      min-width: 140px;
      padding: 16px;
      border-radius: 18px;
      background: rgba(15, 23, 42, 0.28);
      border: 1px solid rgba(191, 219, 254, 0.16);
    }

    .home-stat-card span {
      display: block;
      font-size: 13px;
      color: rgba(226, 232, 240, 0.95);
    }

    .home-stat-card strong {
      display: block;
      margin-top: 6px;
      font-size: 24px;
    }

    .home-layout {
      display: grid;
      grid-template-columns: 280px minmax(0, 1fr);
      gap: 24px;
      align-items: start;
    }

    .home-sidebar,
    .home-search-card,
    .home-product-card {
      border-radius: 20px;
      background: #fff;
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
    }

    .home-sidebar {
      padding: 20px;
      position: sticky;
      top: 24px;
    }

    .home-sidebar-header,
    .home-search-header,
    .home-products-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .home-sidebar-header h2,
    .home-search-header h2,
    .home-products-header h2 {
      margin: 0;
    }

    .home-category-list,
    .home-subcategory-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .home-category-list {
      display: grid;
      gap: 10px;
      margin-top: 16px;
    }

    .home-category-item {
      display: grid;
      gap: 8px;
    }

    .home-category-button,
    .home-subcategory-button,
    .home-brand-chip,
    .home-clear-button {
      border: 1px solid #dbe3f3;
      background: #fff;
      color: #0f172a;
      cursor: pointer;
      transition: 0.2s ease;
    }

    .home-category-button,
    .home-subcategory-button {
      width: 100%;
      text-align: left;
      border-radius: 14px;
    }

    .home-category-button {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      font-weight: 600;
    }

    .home-subcategory-list {
      display: grid;
      gap: 8px;
      padding-left: 18px;
      margin-top: 4px;
    }

    .home-subcategory-button {
      padding: 10px 12px;
    }

    .home-category-button.active,
    .home-subcategory-button.active,
    .home-brand-chip.active {
      border-color: #2563eb;
      background: #eff6ff;
      color: #1d4ed8;
    }

    .home-category-icon-media {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #f8fafc;
      overflow: hidden;
      flex-shrink: 0;
    }

    .home-category-icon-media img,
    .home-product-media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .home-content {
      display: grid;
      gap: 20px;
    }

    .home-search-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 16px;
      margin-top: 16px;
    }

    .home-search-grid mat-form-field {
      width: 100%;
    }

    .home-brand-row {
      margin-top: 8px;
    }

    .home-brand-chip,
    .home-clear-button {
      padding: 8px 14px;
      border-radius: 999px;
      font-weight: 600;
    }

    .home-products-section {
      display: grid;
      gap: 16px;
    }

    .home-product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }

    .home-product-card {
      display: grid;
      overflow: hidden;
    }

    .home-product-media {
      position: relative;
      aspect-ratio: 1;
      background: #f8fafc;
    }

    .home-product-placeholder {
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      font-size: 48px;
      font-weight: 700;
      color: #94a3b8;
    }

    .home-status-chip {
      position: absolute;
      top: 12px;
      left: 12px;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.82);
      color: #fff;
      font-size: 12px;
      font-weight: 600;
    }

    .home-product-meta {
      display: grid;
      gap: 8px;
      padding: 16px;
    }

    .home-product-meta p,
    .home-product-title {
      margin: 0;
    }

    .home-product-meta p {
      color: #64748b;
      font-size: 13px;
    }

    .home-product-title {
      font-size: 18px;
      line-height: 1.4;
    }

    .home-product-price {
      color: #dc2626;
      font-size: 20px;
    }

    .home-product-inventory,
    .home-product-low-stock,
    .home-search-header p {
      color: #475569;
    }

    .home-search-header p {
      margin: 6px 0 0;
    }

    .home-product-actions {
      padding: 0 16px 16px;
    }

    .home-error,
    .home-empty {
      padding: 16px;
      border-radius: 16px;
      background: #fff7ed;
      color: #9a3412;
    }

    .home-empty {
      background: #f8fafc;
      color: #475569;
    }

    .home-empty-compact {
      margin-top: 16px;
    }

    @media (max-width: 960px) {
      .home-layout {
        grid-template-columns: 1fr;
      }

      .home-sidebar {
        position: static;
      }
    }
  `],
})
export class PublicProductsPage implements OnInit {
  protected readonly APP_ROUTES = APP_ROUTES;
  protected readonly authStore = inject(AuthStore);
  protected readonly products = signal<AdminProductListItem[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly categoryTree = signal<CategoryTreeNode[]>([]);
  protected readonly brands = signal<Brand[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly addingProductId = signal<number | null>(null);
  protected readonly buyingProductId = signal<number | null>(null);
  protected readonly selectedCategoryId = signal<number | null>(null);
  protected readonly selectedBrandId = signal<number | null>(null);
  protected readonly hoveredCategoryId = signal<number | null>(null);
  protected readonly searchKeyword = signal('');
  protected readonly canAccessAdmin = computed(() => this.authStore.roles().includes('ADMIN')
    || this.authStore.roles().includes('STAFF')
    || this.authStore.permissions().size > 0);
  protected readonly categoryById = computed(() => new Map(this.categories().map((category) => [category.id, category])));
  protected readonly categoryTreeById = computed(() => new Map(this.flattenCategoryTree(this.categoryTree()).map((category) => [category.id, category])));
  protected readonly selectedCategoryScopeIds = computed(() => {
    const selectedId = this.selectedCategoryId();
    if (selectedId === null) {
      return new Set<number>();
    }

    const selectedNode = this.categoryTreeById().get(selectedId);
    if (!selectedNode) {
      return new Set([selectedId]);
    }

    return new Set(this.flattenCategoryTree([selectedNode]).map((category) => category.id));
  });
  protected readonly selectedCategoryLabel = computed(() => {
    const selectedId = this.selectedCategoryId();
    if (selectedId === null) {
      return 'Tất cả sản phẩm';
    }

    return this.categoryById().get(selectedId)?.name || this.categoryTreeById().get(selectedId)?.name || 'Danh sách sản phẩm';
  });
  protected readonly filteredProducts = computed(() => {
    const keyword = this.searchKeyword().trim().toLowerCase();
    const selectedCategoryIds = this.selectedCategoryScopeIds();
    const products = this.products();
    return this.products().filter((product) => {
      const matchesKeyword = !keyword
        || product.name.toLowerCase().includes(keyword)
        || product.code.toLowerCase().includes(keyword)
        || (product.brandName || '').toLowerCase().includes(keyword)
        || (product.categoryName || '').toLowerCase().includes(keyword);
      const matchesCategory = this.selectedCategoryId() === null || selectedCategoryIds.has(product.categoryId);
      const matchesBrand = this.selectedBrandId() === null || product.brandId === this.selectedBrandId();
      return matchesKeyword && matchesCategory && matchesBrand;
    });
  });
  protected readonly featuredProducts = computed(() => this.filteredProducts().slice(0, 24));
  protected readonly resultsDescription = computed(() => {
    const count = this.filteredProducts().length;
    const keyword = this.searchKeyword().trim();
    if (keyword) {
      return `Có ${count} sản phẩm khớp với từ khóa "${keyword}".`;
    }

    return `Hiển thị ${count} sản phẩm theo bộ lọc hiện tại.`;
  });

  private readonly productApi = inject(ProductApiService);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly brandApi = inject(BrandApiService);
  private readonly cartApi = inject(CartApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly router = inject(Router);

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  ngOnInit(): void {
    this.loadHomepageData();
  }

  loadHomepageData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      products: this.productApi.storefront().pipe(
        catchError(() => this.productApi.list({ status: 'ACTIVE' }).pipe(
          catchError(() => of([] as AdminProductListItem[])),
        )),
      ),
      categories: this.categoryApi.list({ status: 'ACTIVE', visible: true }).pipe(
        catchError(() => of([] as Category[])),
      ),
      categoryTree: this.categoryApi.tree({ status: 'ACTIVE', visibleOnly: true }).pipe(
        catchError(() => of([] as CategoryTreeNode[])),
      ),
      brands: this.brandApi.list().pipe(
        catchError(() => of([] as Brand[])),
      ),
    }).pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: ({ products, categories, categoryTree, brands }) => {
        const visibleProducts = products
          .filter((product) => product.visibility !== 'HIDDEN')
          .map((product) => this.normalizeProduct(product));
        const visibleCategories = this.normalizeVisibleCategories(categories);
        const normalizedTree = this.normalizeCategoryTree(categoryTree);
        const fallbackTree = normalizedTree.length ? normalizedTree : this.buildCategoryTreeFromList(visibleCategories);
        const visibleBrands = brands.filter((brand) => !brand.generic);

        this.products.set(visibleProducts);
        this.categories.set(visibleCategories);
        this.categoryTree.set(fallbackTree);
        this.brands.set(visibleBrands.slice(0, 12));
      },
      error: (error) => {
        this.errorMessage.set(this.errorMapper.map(error).message);
      },
    });
  }

  clearCategoryFilter(): void {
    this.selectedCategoryId.set(null);
    this.hoveredCategoryId.set(null);
  }

  selectCategory(categoryId: number): void {
    this.selectedCategoryId.set(categoryId);
  }

  toggleBrand(brandId: number): void {
    this.selectedBrandId.set(this.selectedBrandId() === brandId ? null : brandId);
  }

  addToCart(product: AdminProductListItem): void {
    this.executeCartAction(product, 'add');
  }

  buyNow(product: AdminProductListItem): void {
    this.executeCartAction(product, 'buyNow');
  }

  isPurchasable(product: AdminProductListItem): boolean {
    return product.status === 'ACTIVE' && product.variantCount > 0 && (product.canCheckout ?? product.canAddToCart ?? true);
  }

  inventoryLabel(product: AdminProductListItem): string {
    if (product.inventoryStatus === 'OUT_OF_STOCK') {
      return 'Hết hàng';
    }

    if (product.inventoryStatus === 'LOW_STOCK') {
      return `Sắp hết hàng${product.availableQty !== null && product.availableQty !== undefined ? ` · còn ${product.availableQty}` : ''}`;
    }

    if (product.availableQty !== null && product.availableQty !== undefined) {
      return `Còn hàng · ${product.availableQty}`;
    }

    return product.inventoryStatus || 'Còn hàng';
  }

  formatCurrency(value: number | null): string {
    if (value === null || value === undefined) {
      return 'Liên hệ';
    }

    return `${value.toLocaleString('vi-VN')} VND`;
  }

  productDisplayName(product: AdminProductListItem): string {
    return product.name || product.code || `Sản phẩm #${product.id}`;
  }

  productInitial(product: AdminProductListItem): string {
    return this.productDisplayName(product).trim().charAt(0).toUpperCase() || '#';
  }

  resolveProductImageUrl(product: AdminProductListItem): string | null {
    return resolveMediaUrl(product.thumbnailUrl || product.images[0]?.url || null, this.config.apiBaseUrl);
  }

  resolveCategoryIconUrl(category: CategoryTreeNode): string | null {
    const detail = this.categoryById().get(category.id);
    return resolveMediaUrl(detail?.iconUrl || detail?.imageUrl || detail?.galleryImages?.[0]?.url || null, this.config.apiBaseUrl);
  }

  visibleCategoryChildren(category: CategoryTreeNode): CategoryTreeNode[] {
    return category.children.filter((child) => child.visible !== false && child.status === 'ACTIVE');
  }

  normalizeVisibleCategories(categories: Category[]): Category[] {
    return categories.filter((category) => category.status === 'ACTIVE' && category.visible !== false);
  }

  normalizeProduct(product: AdminProductListItem): AdminProductListItem {
    return {
      ...product,
      code: product.code || '',
      name: product.name || product.code || `Sản phẩm #${product.id}`,
      images: product.images ?? [],
      variantCount: product.variantCount ?? 0,
    };
  }

  normalizeCategoryTree(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
    return nodes
      .filter((node) => node.status === 'ACTIVE' && node.visible !== false)
      .slice()
      .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name))
      .map((node) => ({
        ...node,
        visible: node.visible !== false,
        children: this.normalizeCategoryTree(node.children ?? []),
      }));
  }

  buildCategoryTreeFromList(categories: Category[]): CategoryTreeNode[] {
    const mapped = new Map<number, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    for (const category of categories) {
      mapped.set(category.id, {
        id: category.id,
        code: category.code,
        name: category.name,
        slug: category.slug,
        level: category.level,
        path: category.path,
        status: category.status,
        visible: category.visible,
        assignable: category.assignable,
        sortOrder: category.sortOrder,
        children: [],
      });
    }

    for (const category of categories) {
      const node = mapped.get(category.id);
      if (!node) {
        continue;
      }

      const parentNode = category.parentId === null ? null : mapped.get(category.parentId);
      if (parentNode) {
        parentNode.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return this.normalizeCategoryTree(roots);
  }

  private executeCartAction(product: AdminProductListItem, action: 'add' | 'buyNow'): void {
    if (!this.authStore.isAuthenticated()) {
      this.notificationService.info('Vui lòng đăng nhập để mua và thêm sản phẩm vào giỏ hàng.');
      void this.router.navigate([APP_ROUTES.login]);
      return;
    }

    if (action === 'add') {
      this.addingProductId.set(product.id);
    } else {
      this.buyingProductId.set(product.id);
    }

    this.productApi.getById(product.id).pipe(
      finalize(() => {
        if (action === 'add') {
          this.addingProductId.set(null);
          return;
        }
        this.buyingProductId.set(null);
      }),
    ).subscribe({
      next: (detail) => {
        const variant = detail.variants.find((item) => item.status === 'ACTIVE') ?? detail.variants[0];
        if (!variant?.id) {
          this.notificationService.error('Sản phẩm này chưa có variant để đặt mua.');
          return;
        }

        this.cartApi.upsertItem({ variantId: variant.id, quantity: 1 }).subscribe({
          next: () => {
            if (action === 'add') {
              this.notificationService.success(`Đã thêm ${this.productDisplayName(product)} vào giỏ hàng.`);
              return;
            }
            void this.router.navigate([APP_ROUTES.cartCheckout]);
          },
          error: (error) => {
            this.notificationService.error(this.errorMapper.map(error).message);
          },
        });
      },
      error: (error) => {
        this.notificationService.error(this.errorMapper.map(error).message);
      },
    });
  }

  flattenCategoryTree(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
    return nodes.flatMap((node) => [node, ...this.flattenCategoryTree(node.children)]);
  }

  findCategoryNode(nodes: CategoryTreeNode[], categoryId: number): CategoryTreeNode | null {
    for (const node of nodes) {
      if (node.id === categoryId) {
        return node;
      }

      const child = this.findCategoryNode(node.children, categoryId);
      if (child) {
        return child;
      }
    }

    return null;
  }

  categoryIcon(categoryName: string): string {
    const normalized = categoryName.toLowerCase();

    if (normalized.includes('điện thoại') || normalized.includes('dien thoai') || normalized.includes('phone')) {
      return '📱';
    }
    if (normalized.includes('laptop') || normalized.includes('macbook')) {
      return '💻';
    }
    if (normalized.includes('tủ lạnh') || normalized.includes('tu lanh')) {
      return '🧊';
    }
    if (normalized.includes('máy giặt') || normalized.includes('may giat')) {
      return '🧺';
    }
    if (normalized.includes('gia dụng') || normalized.includes('gia dung') || normalized.includes('nồi') || normalized.includes('noi') || normalized.includes('bếp') || normalized.includes('bep')) {
      return '🍚';
    }
    if (normalized.includes('phụ kiện') || normalized.includes('phu kien') || normalized.includes('tai nghe')) {
      return '🎧';
    }

    return '⚡';
  }
}
