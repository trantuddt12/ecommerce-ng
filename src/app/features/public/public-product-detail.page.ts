import { CommonModule } from '@angular/common';
import { Component, Inject, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { finalize } from 'rxjs';
import { APP_ROUTES } from '../../core/constants/app-routes';
import { AppConfig } from '../../core/config/app-config.model';
import { AdminProductDetail, AdminProductVariant } from '../../core/models/catalog.models';
import { AuthStore } from '../../core/state/auth.store';
import { APP_CONFIG } from '../../core/tokens/app-config.token';
import { resolveMediaUrl } from '../../core/utils/media-url.util';
import { CartApiService } from '../../core/services/cart-api.service';
import { ErrorMapperService } from '../../core/services/error-mapper.service';
import { NotificationService } from '../../core/services/notification.service';
import { ProductApiService } from '../../core/services/product-api.service';

@Component({
  selector: 'app-public-product-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  template: `
    <section class="product-detail-page">
      <div class="product-detail-header-actions">
        <a mat-button [routerLink]="APP_ROUTES.homeProducts">
          <mat-icon fontSet="material-symbols-outlined">arrow_back</mat-icon>
          Quay lại danh sách
        </a>
      </div>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      }

      @if (errorMessage()) {
        <div class="product-detail-error">{{ errorMessage() }}</div>
      }

      @if (product(); as detail) {
        <section class="product-detail-layout">
          <mat-card class="product-detail-gallery-card">
            <mat-card-content>
              <div class="product-detail-gallery-shell">
                <div class="product-detail-gallery-main">
                  @if (activeImageUrl(); as imageUrl) {
                    <img [src]="imageUrl" [alt]="displayName()" />
                  } @else {
                    <div class="product-detail-gallery-placeholder">{{ productInitial() }}</div>
                  }

                  @if (galleryImages().length > 1) {
                    <button
                      class="product-detail-gallery-nav product-detail-gallery-nav-prev"
                      type="button"
                      (click)="showPreviousImage()"
                      [attr.aria-label]="'Ảnh trước của ' + displayName()"
                    >
                      <mat-icon fontSet="material-symbols-outlined">chevron_left</mat-icon>
                    </button>
                    <button
                      class="product-detail-gallery-nav product-detail-gallery-nav-next"
                      type="button"
                      (click)="showNextImage()"
                      [attr.aria-label]="'Ảnh tiếp theo của ' + displayName()"
                    >
                      <mat-icon fontSet="material-symbols-outlined">chevron_right</mat-icon>
                    </button>
                    <div class="product-detail-gallery-count">{{ activeImageIndex() + 1 }}/{{ galleryImages().length }}</div>
                  }
                </div>

                @if (galleryImages().length > 1) {
                  <div class="product-detail-gallery-thumbnails">
                    @for (imageUrl of galleryImages(); track imageUrl; let index = $index) {
                      <button
                        class="product-detail-gallery-thumbnail"
                        type="button"
                        [class.active]="activeImageIndex() === index"
                        [attr.aria-label]="'Xem ảnh ' + (index + 1) + ' của ' + displayName()"
                        (click)="selectImage(index)"
                      >
                        <img [src]="imageUrl" [alt]="displayName() + ' ảnh ' + (index + 1)" />
                      </button>
                    }
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="product-detail-summary-card">
            <mat-card-content>
              <p class="product-detail-eyebrow">Chi tiết sản phẩm</p>
              <h1>{{ displayName() }}</h1>
              <div class="product-detail-chip-row">
                @if (detail.brandName) {
                  <mat-chip>{{ detail.brandName }}</mat-chip>
                }
                <mat-chip>{{ detail.status || 'N/A' }}</mat-chip>
                <mat-chip>{{ detail.visibility || 'CATALOG' }}</mat-chip>
              </div>

              <div class="product-detail-price-row">
                <strong class="product-detail-price">{{ formatCurrency(activePrice()) }}</strong>
                @if (activeCompareAtPrice() !== null && activeCompareAtPrice()! > (activePrice() ?? 0)) {
                  <span class="product-detail-compare-price">{{ formatCurrency(activeCompareAtPrice()) }}</span>
                }
              </div>

              <div class="product-detail-meta-grid">
                <div><strong>Mã sản phẩm:</strong> {{ detail.code || '-' }}</div>
                <div><strong>Slug:</strong> {{ detail.slug || '-' }}</div>
                <div><strong>Danh mục:</strong> {{ detail.categoryId }}</div>
                <div><strong>Biến thể:</strong> {{ detail.variants.length }}</div>
                <div><strong>Ngày đăng:</strong> {{ detail.publishedAt ? (detail.publishedAt | date: 'dd/MM/yyyy HH:mm') : '-' }}</div>
                <div><strong>Tình trạng:</strong> {{ inventoryLabel() }}</div>
              </div>

              @if (detail.shortDescription) {
                <div class="product-detail-short-description">{{ detail.shortDescription }}</div>
              }

              @if (detail.variants.length) {
                <div class="product-detail-section">
                  <h2>Chọn phiên bản</h2>
                  <div class="product-detail-variant-grid">
                    @for (variant of detail.variants; track variant.id || variant.sku || variant.signature) {
                      <button
                        class="product-detail-variant-card"
                        type="button"
                        [class.active]="selectedVariant()?.id === variant.id"
                        (click)="selectVariant(variant)"
                      >
                        <strong>{{ variant.name || variant.sku || 'Variant' }}</strong>
                        <span>{{ formatCurrency(variant.price) }}</span>
                        <small>{{ variantInventoryLabel(variant) }}</small>
                      </button>
                    }
                  </div>
                </div>
              }

              @if (selectedVariant(); as variant) {
                <div class="product-detail-section">
                  <h2>Thông tin phiên bản</h2>
                  <div class="product-detail-meta-grid">
                    <div><strong>SKU:</strong> {{ variant.sku || '-' }}</div>
                    <div><strong>Barcode:</strong> {{ variant.barcode || '-' }}</div>
                    <div><strong>Trạng thái:</strong> {{ variant.status || '-' }}</div>
                    <div><strong>Khả dụng:</strong> {{ variantInventoryLabel(variant) }}</div>
                  </div>

                  @if (variant.attributes.length) {
                    <div class="product-detail-attribute-row">
                      @for (attribute of variant.attributes; track attribute.attributeId + '-' + attribute.optionId) {
                        <mat-chip>Attr {{ attribute.attributeId }} · Option {{ attribute.optionId }}</mat-chip>
                      }
                    </div>
                  }
                </div>
              }

              <div class="product-detail-actions">
                <button
                  mat-stroked-button
                  type="button"
                  (click)="addToCart()"
                  [disabled]="!canPurchase() || addingToCart() || buyingNow()"
                >
                  {{ addingToCart() ? 'Đang thêm...' : 'Thêm vào giỏ' }}
                </button>
                <button
                  mat-flat-button
                  color="primary"
                  type="button"
                  (click)="buyNow()"
                  [disabled]="!canPurchase() || buyingNow() || addingToCart()"
                >
                  {{ buyingNow() ? 'Đang xử lý...' : 'Mua ngay' }}
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </section>

        <section class="product-detail-info-grid">
          <mat-card class="product-detail-panel">
            <mat-card-content>
              <h2>Mô tả</h2>
              <div class="product-detail-description">{{ detail.description || 'Chưa có mô tả chi tiết.' }}</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="product-detail-panel">
            <mat-card-content>
              <h2>SEO</h2>
              <div class="product-detail-seo-grid">
                <div><strong>SEO title:</strong> {{ detail.seoTitle || '-' }}</div>
                <div><strong>SEO description:</strong> {{ detail.seoDescription || '-' }}</div>
                <div><strong>SEO keywords:</strong> {{ detail.seoKeywords || '-' }}</div>
              </div>
            </mat-card-content>
          </mat-card>
        </section>
      }
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    .product-detail-page {
      display: grid;
      gap: 20px;
      padding: 24px;
    }

    .product-detail-header-actions {
      display: flex;
      align-items: center;
    }

    .product-detail-error {
      padding: 16px;
      border-radius: 16px;
      background: #fff7ed;
      color: #9a3412;
    }

    .product-detail-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
      gap: 20px;
      align-items: start;
    }

    .product-detail-gallery-card,
    .product-detail-summary-card,
    .product-detail-panel {
      border-radius: 20px;
      background: #fff;
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
    }

    .product-detail-gallery-shell,
    .product-detail-summary-card .mat-mdc-card-content,
    .product-detail-panel .mat-mdc-card-content {
      display: grid;
      gap: 16px;
    }

    .product-detail-gallery-main {
      position: relative;
      aspect-ratio: 1;
      border-radius: 20px;
      overflow: hidden;
      background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
      border: 1px solid #e2e8f0;
    }

    .product-detail-gallery-main img,
    .product-detail-gallery-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-detail-gallery-placeholder {
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      font-size: 72px;
      font-weight: 700;
      color: #94a3b8;
    }

    .product-detail-gallery-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      border: 0;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(15, 23, 42, 0.68);
      color: #fff;
      cursor: pointer;
    }

    .product-detail-gallery-nav-prev {
      left: 12px;
    }

    .product-detail-gallery-nav-next {
      right: 12px;
    }

    .product-detail-gallery-count {
      position: absolute;
      right: 12px;
      bottom: 12px;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.72);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
    }

    .product-detail-gallery-thumbnails {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 10px;
    }

    .product-detail-gallery-thumbnail,
    .product-detail-variant-card {
      border: 1px solid #dbe3f3;
      background: #fff;
      cursor: pointer;
      transition: 0.2s ease;
    }

    .product-detail-gallery-thumbnail {
      aspect-ratio: 1;
      padding: 0;
      border-radius: 14px;
      overflow: hidden;
    }

    .product-detail-gallery-thumbnail.active,
    .product-detail-variant-card.active {
      border-color: #2563eb;
      box-shadow: 0 10px 24px rgba(37, 99, 235, 0.18);
    }

    .product-detail-eyebrow {
      margin: 0;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #2563eb;
    }

    .product-detail-summary-card h1,
    .product-detail-panel h2 {
      margin: 0;
    }

    .product-detail-chip-row,
    .product-detail-actions,
    .product-detail-attribute-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .product-detail-price-row {
      display: flex;
      align-items: baseline;
      gap: 12px;
    }

    .product-detail-price {
      color: #dc2626;
      font-size: 28px;
    }

    .product-detail-compare-price {
      color: #64748b;
      text-decoration: line-through;
    }

    .product-detail-meta-grid,
    .product-detail-seo-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      color: #334155;
    }

    .product-detail-short-description,
    .product-detail-description {
      color: #475569;
      line-height: 1.7;
      white-space: pre-wrap;
    }

    .product-detail-section {
      display: grid;
      gap: 12px;
    }

    .product-detail-section h2 {
      margin: 0;
      font-size: 18px;
    }

    .product-detail-variant-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
    }

    .product-detail-variant-card {
      display: grid;
      gap: 6px;
      padding: 14px;
      border-radius: 16px;
      text-align: left;
      color: #0f172a;
    }

    .product-detail-info-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
    }

    @media (max-width: 960px) {
      .product-detail-layout,
      .product-detail-info-grid,
      .product-detail-meta-grid,
      .product-detail-seo-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .product-detail-page {
        padding: 16px;
      }

      .product-detail-gallery-thumbnails {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }
  `],
})
export class PublicProductDetailPage {
  protected readonly APP_ROUTES = APP_ROUTES;
  protected readonly authStore = inject(AuthStore);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly product = signal<AdminProductDetail | null>(null);
  protected readonly selectedVariantId = signal<number | null>(null);
  protected readonly activeImageIndex = signal(0);
  protected readonly addingToCart = signal(false);
  protected readonly buyingNow = signal(false);
  protected readonly displayName = computed(() => this.product()?.name || this.product()?.code || 'Chi tiết sản phẩm');
  protected readonly selectedVariant = computed(() => {
    const detail = this.product();
    if (!detail) {
      return null;
    }

    const selectedId = this.selectedVariantId();
    return detail.variants.find((variant) => variant.id === selectedId) ?? detail.variants[0] ?? null;
  });
  protected readonly galleryImages = computed(() => {
    const detail = this.product();
    if (!detail) {
      return [] as string[];
    }

    const images = detail.images
      .map((image) => resolveMediaUrl(image.url, this.config.apiBaseUrl))
      .filter((imageUrl): imageUrl is string => !!imageUrl);
    const selectedVariantImage = resolveMediaUrl(this.selectedVariant()?.imageUrl || null, this.config.apiBaseUrl);

    if (selectedVariantImage && !images.includes(selectedVariantImage)) {
      images.unshift(selectedVariantImage);
    }

    return images;
  });
  protected readonly activeImageUrl = computed(() => {
    const images = this.galleryImages();
    if (!images.length) {
      return null;
    }

    const index = Math.min(Math.max(this.activeImageIndex(), 0), images.length - 1);
    return images[index] ?? images[0];
  });
  protected readonly activePrice = computed(() => this.selectedVariant()?.price ?? this.product()?.variants[0]?.price ?? null);
  protected readonly activeCompareAtPrice = computed(() => this.selectedVariant()?.compareAtPrice ?? this.product()?.variants[0]?.compareAtPrice ?? null);
  protected readonly canPurchase = computed(() => {
    const detail = this.product();
    const variant = this.selectedVariant();
    return !!detail && detail.status === 'ACTIVE' && !!variant?.id && variant.status === 'ACTIVE' && (variant.inventory?.canCheckout ?? variant.inventory?.canAddToCart ?? true);
  });

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productApi = inject(ProductApiService);
  private readonly cartApi = inject(CartApiService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    this.loadProduct();
  }

  private loadProduct(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || id <= 0) {
      this.errorMessage.set('Mã sản phẩm không hợp lệ.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.productApi.getStorefrontById(id).pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: (detail) => {
        this.product.set(detail);
        this.selectedVariantId.set(detail.variants.find((variant) => variant.status === 'ACTIVE')?.id ?? detail.variants[0]?.id ?? null);
        this.activeImageIndex.set(0);
      },
      error: (error) => {
        this.errorMessage.set(this.errorMapper.map(error).message);
      },
    });
  }

  protected selectVariant(variant: AdminProductVariant): void {
    this.selectedVariantId.set(variant.id ?? null);
    this.activeImageIndex.set(0);
  }

  protected selectImage(index: number): void {
    this.activeImageIndex.set(index);
  }

  protected showPreviousImage(): void {
    const total = this.galleryImages().length;
    if (total <= 1) {
      return;
    }

    this.activeImageIndex.set((this.activeImageIndex() - 1 + total) % total);
  }

  protected showNextImage(): void {
    const total = this.galleryImages().length;
    if (total <= 1) {
      return;
    }

    this.activeImageIndex.set((this.activeImageIndex() + 1) % total);
  }

  protected addToCart(): void {
    this.executeCartAction('add');
  }

  protected buyNow(): void {
    this.executeCartAction('buyNow');
  }

  protected formatCurrency(value: number | null): string {
    if (value === null || value === undefined) {
      return 'Liên hệ';
    }

    return `${value.toLocaleString('vi-VN')} VND`;
  }

  protected inventoryLabel(): string {
    const variant = this.selectedVariant();
    if (!variant) {
      return 'Chưa có biến thể khả dụng';
    }

    return this.variantInventoryLabel(variant);
  }

  protected variantInventoryLabel(variant: AdminProductVariant): string {
    if (variant.inventory?.inventoryStatus === 'OUT_OF_STOCK') {
      return 'Hết hàng';
    }

    if (variant.inventory?.inventoryStatus === 'LOW_STOCK') {
      return variant.inventory.lowStockMessage || 'Sắp hết hàng';
    }

    if (variant.inventory?.availableQty !== null && variant.inventory?.availableQty !== undefined) {
      return `Còn ${variant.inventory.availableQty} sản phẩm`;
    }

    return variant.inventory?.inventoryStatus || 'Còn hàng';
  }

  protected productInitial(): string {
    return this.displayName().trim().charAt(0).toUpperCase() || '#';
  }

  private executeCartAction(action: 'add' | 'buyNow'): void {
    if (!this.authStore.isAuthenticated()) {
      this.notifications.info('Vui lòng đăng nhập để mua và thêm sản phẩm vào giỏ hàng.');
      void this.router.navigate([APP_ROUTES.login]);
      return;
    }

    const variant = this.selectedVariant();
    if (!variant?.id) {
      this.notifications.error('Sản phẩm này chưa có variant để đặt mua.');
      return;
    }

    if (action === 'add') {
      this.addingToCart.set(true);
    } else {
      this.buyingNow.set(true);
    }

    this.cartApi.upsertItem({ variantId: variant.id, quantity: 1 }).pipe(
      finalize(() => {
        if (action === 'add') {
          this.addingToCart.set(false);
          return;
        }

        this.buyingNow.set(false);
      }),
    ).subscribe({
      next: () => {
        if (action === 'add') {
          this.notifications.success(`Đã thêm ${this.displayName()} vào giỏ hàng.`);
          return;
        }

        void this.router.navigate([APP_ROUTES.cartCheckout]);
      },
      error: (error) => {
        this.notifications.error(this.errorMapper.map(error).message);
      },
    });
  }
}
