import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { catchError, finalize, forkJoin, of, tap } from 'rxjs';
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

interface HomePromoItem {
  title: string;
  description: string;
}

@Component({
  selector: 'app-public-products-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  template: `
    <section class="home-page">
      <section class="home-strip" aria-label="Dich vu noi bat">
        @for (feature of features; track feature.title) {
          <article class="home-strip-card">
            <div class="home-strip-icon">{{ feature.icon }}</div>
            <div>
              <strong>{{ feature.title }}</strong>
              <p>{{ feature.description }}</p>
            </div>
          </article>
        }
      </section>

      <section class="home-intro">
        <aside class="home-categories" aria-label="Danh muc san pham">
          <div class="home-categories-title">
            <span class="home-categories-title-icon">▦</span>
            <h3>DANH MỤC SẢN PHẨM</h3>
          </div>

          @if (categoryTree().length) {
            <nav class="home-category-tree" aria-label="Chon danh muc san pham">
              <ul class="home-category-menu">
                @for (category of categoryTree(); track category.id) {
                  <li class="home-category-menu-item" [class.active]="selectedCategoryId() === category.id">
                    <button
                      class="home-category-link"
                      type="button"
                      [class.active]="selectedCategoryId() === category.id"
                      (click)="toggleCategory(category.id)"
                    >
                      <span class="home-category-icon-media">
                        @if (resolveCategoryIconUrl(category); as iconUrl) {
                          <img [src]="iconUrl" [alt]="category.name" />
                        } @else {
                          <span>{{ categoryIcon(category.name) }}</span>
                        }
                      </span>
                      <span class="home-category-name">{{ category.name }}</span>
                      @if (category.children.length) {
                        <button
                          class="home-category-toggle"
                          type="button"
                          [attr.aria-expanded]="isCategoryExpanded(category.id)"
                          (click)="toggleCategoryExpansion(category.id, $event)"
                        >
                          ›
                        </button>
                      }
                    </button>

                    @if (category.children.length) {
                      <ul class="home-category-submenu" [class.expanded]="isCategoryExpanded(category.id)">
                        @for (child of visibleCategoryChildren(category); track child.id) {
                          <li>
                            <button
                              class="home-subcategory-link"
                              type="button"
                              [class.active]="selectedCategoryId() === child.id"
                              (click)="toggleCategory(child.id)"
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
              <p>Chua co category noi bat.</p>
            </div>
          }
        </aside>

        <section class="home-hero">
          <div class="home-hero-grid">
            <div class="home-hero-copy">
              <span class="home-eyebrow">Sieu sale dien may</span>
              <h2>Trang chu moi theo phong cach sieu thi dien may hien dai, noi bat va de mua sam.</h2>
              <p>Tap trung vao block khuyen mai lon, danh muc de nhin, logo thuong hieu va bo loc nhanh theo category/brand de nguoi dung thao tac nhanh ngay tren man hinh dau tien.</p>

              <div class="home-hero-actions">
                <button class="home-primary-action" type="button" (click)="resetFilters()" [disabled]="loading()">Xem tat ca uu dai</button>
                <a class="home-secondary-action" [routerLink]="APP_ROUTES.cart">Mo gio hang</a>
              </div>

              <div class="home-highlights">
                <article class="home-highlight">
                  <span>San pham dang ban</span>
                  <strong>{{ products().length }}</strong>
                </article>
                <article class="home-highlight">
                  <span>Dang hien thi</span>
                  <strong>{{ filteredProducts().length }}</strong>
                </article>
                <article class="home-highlight">
                  <span>Thuong hieu</span>
                  <strong>{{ brands().length }}</strong>
                </article>
              </div>
            </div>

            <div class="home-promo-grid">
              @for (promo of promos; track promo.title) {
                <article class="home-promo-card">
                  <strong>{{ promo.title }}</strong>
                  <p>{{ promo.description }}</p>
                </article>
              }
            </div>
          </div>
        </section>
      </section>

      @if (loading() && !products().length && !categoryTree().length && !brands().length) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      @if (errorMessage()) {
        <div class="home-error">
          <p>{{ errorMessage() }}</p>
        </div>
      }

      <section class="home-section" aria-labelledby="brand-showcase-heading">
        <div class="home-section-heading">
          <div>
            <h3 id="brand-showcase-heading">Thuong hieu noi bat</h3>
            <p>Dai logo de tao niem tin va cho phep loc san pham theo brand ngay tai trang chu.</p>
          </div>
          <span class="home-badge">Logo brands</span>
        </div>

        @if (brands().length) {
          <div class="home-brand-grid">
            @for (brand of brands(); track brand.id) {
              <button
                class="home-brand-card"
                type="button"
                [class.active]="selectedBrandId() === brand.id"
                (click)="toggleBrand(brand.id)"
              >
                <div class="home-brand-media">
                  @if (resolveBrandImageUrl(brand); as brandImageUrl) {
                    <img [src]="brandImageUrl" [alt]="brand.name" />
                  } @else {
                    <span>{{ brandInitials(brand.name) }}</span>
                  }
                </div>
                <strong>{{ brand.name }}</strong>
                <small>{{ brand.description || 'Thuong hieu dang duoc ua chuong' }}</small>
              </button>
            }
          </div>
        } @else if (!loading()) {
          <div class="home-empty">
            <p>Chua co thuong hieu noi bat nao de hien thi.</p>
          </div>
        }
      </section>

      <section class="home-section" aria-labelledby="filter-heading">
        <div class="home-section-heading">
          <div>
            <h3 id="filter-heading">Loc nhanh theo nhu cau</h3>
            <p>Ket hop category va brand de dua nguoi dung vao dung nhom san pham nhanh hon.</p>
          </div>
          @if (selectedCategoryId() || selectedBrandId()) {
            <button class="home-filter-clear" type="button" (click)="resetFilters()">Bo loc</button>
          }
        </div>

        <div class="home-filter-panel">
          <div class="home-filter-group">
            <span class="home-filter-label">Category</span>
            <div class="home-filter-chips">
              <button class="home-filter-chip" type="button" [class.active]="selectedCategoryId() === null" (click)="selectedCategoryId.set(null)">Tat ca</button>
              @for (category of flatVisibleCategories(); track category.id) {
                <button class="home-filter-chip" type="button" [class.active]="selectedCategoryId() === category.id" (click)="toggleCategory(category.id)">
                  {{ category.name }}
                </button>
              }
            </div>
          </div>

          <div class="home-filter-group">
            <span class="home-filter-label">Brand</span>
            <div class="home-filter-chips">
              <button class="home-filter-chip" type="button" [class.active]="selectedBrandId() === null" (click)="selectedBrandId.set(null)">Tat ca</button>
              @for (brand of brands(); track brand.id) {
                <button class="home-filter-chip" type="button" [class.active]="selectedBrandId() === brand.id" (click)="toggleBrand(brand.id)">
                  {{ brand.name }}
                </button>
              }
            </div>
          </div>
        </div>
      </section>

      <section class="home-section" aria-labelledby="flash-sale-heading">
        <div class="home-section-heading">
          <div>
            <h3 id="flash-sale-heading">Flash sale gia soc</h3>
            <p>Cach sap xep va mau sac duoc thiet ke lai theo huong giong trang tham chieu.</p>
          </div>
          <span class="home-badge">Giam den 50%</span>
        </div>

        @if (flashDeals().length) {
          <div class="home-deal-grid">
            @for (product of flashDeals(); track product.id) {
              <article class="home-deal-card">
                <div class="home-deal-media">
                  @if (resolveProductImageUrl(product); as imageUrl) {
                    <img [src]="imageUrl" [alt]="product.name" />
                  } @else {
                    <div class="home-deal-placeholder">{{ product.name.charAt(0) }}</div>
                  }
                  <span class="home-discount-chip">-{{ discountPercent(product) }}%</span>
                </div>

                <div class="home-deal-meta">
                  <p>{{ product.brandName || 'Thuong hieu noi bat' }}</p>
                  <h4 class="home-deal-title">{{ product.name }}</h4>
                  <div class="home-price-row">
                    <strong class="home-deal-price">{{ formatCurrency(product.price) }}</strong>
                    <span class="home-deal-old-price">{{ formatCurrency(comparePrice(product.price)) }}</span>
                  </div>
                </div>
              </article>
            }
          </div>
        } @else if (!loading()) {
          <div class="home-empty">
            <p>Chua co du lieu khuyen mai de hien thi.</p>
          </div>
        }
      </section>

      <section class="home-section" aria-labelledby="featured-products-heading">
        <div class="home-section-heading">
          <div>
            <h3 id="featured-products-heading">San pham noi bat</h3>
            <p>Card san pham hien thi theo category va brand duoc chon o cac khoi ben tren.</p>
          </div>
          <a class="home-badge" [routerLink]="APP_ROUTES.homeProducts">Xem tat ca</a>
        </div>

        @if (filteredProducts().length) {
          <div class="home-product-grid">
            @for (product of featuredProducts(); track product.id) {
              <article class="home-product-card">
                <div class="home-product-media">
                  @if (resolveProductImageUrl(product); as imageUrl) {
                    <img [src]="imageUrl" [alt]="product.name" />
                  } @else {
                    <div class="home-product-placeholder">{{ product.name.charAt(0) }}</div>
                  }
                  <span class="home-status-chip">{{ isPurchasable(product) ? 'Mua ngay' : 'Sap ve hang' }}</span>
                </div>

                <div class="home-product-meta">
                  <p>{{ product.categoryName || 'Danh muc dien may' }}</p>
                  <h4 class="home-product-title">{{ product.name }}</h4>
                  <strong class="home-product-price">{{ formatCurrency(product.price) }}</strong>
                  <div class="home-product-inventory">{{ inventoryLabel(product) }}</div>
                  @if (product.lowStockMessage) {
                    <div class="home-product-low-stock">{{ product.lowStockMessage }}</div>
                  }
                </div>

                <div class="home-product-actions">
                  <a mat-stroked-button [routerLink]="APP_ROUTES.cart">Xem gio hang</a>
                  <button mat-flat-button color="primary" type="button" (click)="buyNow(product)" [disabled]="buyingProductId() === product.id || !isPurchasable(product)">
                    {{ buyingProductId() === product.id ? 'Dang them...' : 'Mua ngay' }}
                  </button>
                </div>
              </article>
            }
          </div>
        } @else if (!loading()) {
          <div class="home-empty">
            <p>Khong co san pham phu hop voi bo loc dang chon.</p>
          </div>
        }
      </section>

      <section class="home-newsletter">
        <div class="home-newsletter-copy">
          <h3>San giao dien moi: dam chat ban le dien may</h3>
          <p>Da bo sung khoi danh muc, dai thuong hieu va bo loc san pham de trang chu hoan chinh hon cho hanh vi mua sam.</p>
        </div>
        <div class="home-newsletter-actions">
          <a class="home-secondary-action" [routerLink]="APP_ROUTES.homeProducts">Xem san pham</a>
          @if (!authStore.isAuthenticated()) {
            <a class="home-primary-action" [routerLink]="APP_ROUTES.login">Dang nhap de mua</a>
          }
        </div>
      </section>
    </section>
  `,
  styles: [''],
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
  protected readonly buyingProductId = signal<number | null>(null);
  protected readonly purchasableCount = signal(0);
  protected readonly selectedCategoryId = signal<number | null>(null);
  protected readonly selectedBrandId = signal<number | null>(null);
  protected readonly expandedCategoryIds = signal<Set<number>>(new Set());
  protected readonly filteredProducts = computed(() => this.products().filter((product) => {
    const selectedCategoryIds = this.selectedCategoryScopeIds();
    const matchesCategory = this.selectedCategoryId() === null || selectedCategoryIds.has(product.categoryId);
    const matchesBrand = this.selectedBrandId() === null || product.brandId === this.selectedBrandId();
    return matchesCategory && matchesBrand;
  }));
  protected readonly flashDeals = computed(() => this.filteredProducts().slice(0, 4));
  protected readonly featuredProducts = computed(() => this.filteredProducts().slice(0, 10));
  protected readonly categoryById = computed(() => new Map(this.categories().map((category) => [category.id, category])));
  protected readonly flatVisibleCategories = computed(() => this.flattenCategoryTree(this.categoryTree()).slice(0, 16));
  protected readonly selectedCategoryScopeIds = computed(() => {
    const selectedId = this.selectedCategoryId();
    if (selectedId === null) {
      return new Set<number>();
    }

    const selectedNode = this.findCategoryNode(this.categoryTree(), selectedId);
    return new Set([selectedId, ...this.flattenCategoryTree(selectedNode?.children ?? []).map((category) => category.id)]);
  });
  protected readonly promos: HomePromoItem[] = [
    { title: 'Tuan le gia dung', description: 'Giam sau cho may xay, noi com va thiet bi nha bep.' },
    { title: 'Laptop hoc tap', description: 'Nhom san pham gia tot cho hoc sinh, sinh vien va van phong.' },
    { title: 'Online only', description: 'Chon loc deal doc quyen va gia chot nhanh tren trang chu.' },
  ];
  protected readonly features = [
    { icon: '24h', title: 'Giao nhanh 24h', description: 'Ho tro giao hang tai thanh pho lon.' },
    { icon: '0%', title: 'Tra gop uu dai', description: 'Nhieu goi thanh toan linh hoat.' },
    { icon: 'BH', title: 'Bao hanh ro rang', description: 'Ho tro doi tra theo chinh sach.' },
    { icon: 'KM', title: 'Deal moi moi ngay', description: 'Cap nhat khuyen mai lien tuc.' },
  ];

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
        catchError(() => of([] as AdminProductListItem[])),
      ),
      categories: this.categoryApi.list({ status: 'ACTIVE', visible: true }).pipe(
        tap(res => {
          console.log('categories raw : ' , res);
        }),
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
        const visibleProducts = products.filter((product) => product.visibility !== 'HIDDEN');
        const visibleCategories = this.normalizeVisibleCategories(categories);
        const normalizedTree = this.normalizeCategoryTree(categoryTree);
        const fallbackTree = normalizedTree.length ? normalizedTree : this.buildCategoryTreeFromList(visibleCategories);
        const visibleBrands = brands.filter((brand) => !brand.generic);

        this.products.set(visibleProducts);
        this.categories.set(visibleCategories);
        this.categoryTree.set(fallbackTree);
        this.expandedCategoryIds.set(new Set(fallbackTree.slice(0, 1).map((category) => category.id)));
        this.brands.set(visibleBrands.slice(0, 10));
        this.purchasableCount.set(visibleProducts.filter((product) => this.isPurchasable(product)).length);
      },
      error: (error) => {
        this.errorMessage.set(this.errorMapper.map(error).message);
      },
    });
  }

  resetFilters(): void {
    this.selectedCategoryId.set(null);
    this.selectedBrandId.set(null);
  }

  toggleCategory(categoryId: number): void {
    this.selectedCategoryId.set(this.selectedCategoryId() === categoryId ? null : categoryId);
  }

  toggleBrand(brandId: number): void {
    this.selectedBrandId.set(this.selectedBrandId() === brandId ? null : brandId);
  }

  buyNow(product: AdminProductListItem): void {
    if (!this.authStore.isAuthenticated()) {
      this.notificationService.info('Vui long dang nhap de them san pham vao gio hang.');
      void this.router.navigate([APP_ROUTES.login]);
      return;
    }

    this.buyingProductId.set(product.id);
    this.productApi.getById(product.id).pipe(
      finalize(() => this.buyingProductId.set(null)),
    ).subscribe({
      next: (detail) => {
        const variant = detail.variants.find((item) => item.status === 'ACTIVE') ?? detail.variants[0];
        if (!variant?.id) {
          this.notificationService.error('San pham nay chua co variant de dat mua.');
          return;
        }

        this.cartApi.upsertItem({ variantId: variant.id, quantity: 1 }).subscribe({
          next: () => {
            this.notificationService.success(`Da them ${product.name} vao gio hang.`);
            void this.router.navigate([APP_ROUTES.cart]);
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

  isPurchasable(product: AdminProductListItem): boolean {
    return product.status === 'ACTIVE' && product.variantCount > 0 && (product.canCheckout ?? product.canAddToCart ?? true);
  }

  inventoryLabel(product: AdminProductListItem): string {
    if (product.inventoryStatus === 'OUT_OF_STOCK') {
      return 'Het hang';
    }

    if (product.inventoryStatus === 'LOW_STOCK') {
      return `Sap het hang${product.availableQty !== null && product.availableQty !== undefined ? ` · con ${product.availableQty}` : ''}`;
    }

    if (product.availableQty !== null && product.availableQty !== undefined) {
      return `Con hang · ${product.availableQty}`;
    }

    return product.inventoryStatus || 'Con hang';
  }

  resolveProductImageUrl(product: AdminProductListItem): string | null {
    return resolveMediaUrl(product.thumbnailUrl || product.images[0]?.url || null, this.config.apiBaseUrl);
  }

  resolveBrandImageUrl(brand: Brand): string | null {
    return resolveMediaUrl(brand.image?.url || brand.imageUrl || brand.galleryImages?.[0]?.url || null, this.config.apiBaseUrl);
  }

  discountPercent(product: AdminProductListItem): number {
    return 10 + (product.id % 5) * 5;
  }

  comparePrice(price: number | null): number | null {
    if (price === null || price === undefined) {
      return null;
    }

    return Math.round(price * 1.18);
  }

  formatCurrency(value: number | null): string {
    if (value === null || value === undefined) {
      return 'Lien he';
    }

    return `${value.toLocaleString('vi-VN')} VND`;
  }

  categoryDescription(category: CategoryTreeNode): string {
    const detail = this.categoryById().get(category.id);
    return detail?.description || detail?.parentName || 'Danh muc dang co uu dai tot';
  }

  visibleCategoryChildren(category: CategoryTreeNode): CategoryTreeNode[] {
    return category.children.filter((child) => child.visible !== false && child.status === 'ACTIVE');
  }

  isCategoryExpanded(categoryId: number): boolean {
    return this.expandedCategoryIds().has(categoryId);
  }

  toggleCategoryExpansion(categoryId: number, event: MouseEvent): void {
    event.stopPropagation();
    const next = new Set(this.expandedCategoryIds());

    if (next.has(categoryId)) {
      next.delete(categoryId);
    } else {
      next.add(categoryId);
    }

    this.expandedCategoryIds.set(next);
  }

  resolveCategoryIconUrl(category: CategoryTreeNode): string | null {
    const detail = this.categoryById().get(category.id);
    return resolveMediaUrl(detail?.iconUrl || detail?.imageUrl || detail?.galleryImages?.[0]?.url || null, this.config.apiBaseUrl);
  }

  normalizeVisibleCategories(categories: Category[]): Category[] {
    return categories.filter((category) => category.status === 'ACTIVE' && category.visible !== false);
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

    if (normalized.includes('dien thoai') || normalized.includes('phone')) {
      return '📱';
    }
    if (normalized.includes('laptop') || normalized.includes('macbook')) {
      return '💻';
    }
    if (normalized.includes('tu lanh')) {
      return '🧊';
    }
    if (normalized.includes('may giat')) {
      return '🧺';
    }
    if (normalized.includes('gia dung') || normalized.includes('noi') || normalized.includes('bep')) {
      return '🍚';
    }
    if (normalized.includes('phu kien') || normalized.includes('tai nghe')) {
      return '🎧';
    }

    return '⚡';
  }

  brandInitials(brandName: string): string {
    return brandName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }
}
