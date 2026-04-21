import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { finalize, forkJoin } from 'rxjs';
import { AppConfig } from '../../../core/config/app-config.model';
import {
  AdminProductDetail,
  AdminProductListItem,
  AdminProductUpsertRequest,
  AdminProductVariant,
  AdminProductVariantUpsert,
  AttributeDefinition,
  AttributeValue,
  Brand,
  Category,
  CategoryAttribute,
  ProductImage,
  ProductVariantAttribute,
} from '../../../core/models/catalog.models';
import { AttributeApiService } from '../../../core/services/attribute-api.service';
import { BrandApiService } from '../../../core/services/brand-api.service';
import { CategoryApiService } from '../../../core/services/category-api.service';
import { CategoryAttributeApiService } from '../../../core/services/category-attribute-api.service';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProductApiService } from '../../../core/services/product-api.service';
import { APP_CONFIG } from '../../../core/tokens/app-config.token';
import { resolveMediaUrl } from '../../../core/utils/media-url.util';

type VisibilityValue = 'HIDDEN' | 'CATALOG' | 'SEARCH' | 'CATALOG_SEARCH';

interface VariantEditorAxisSelection {
  attributeId: number | null;
  optionId: number | null;
}

interface VariantEditorState {
  id: number | null;
  sku: string;
  name: string;
  barcode: string;
  price: number | null;
  compareAtPrice: number | null;
  stockQty: number | null;
  weight: number | null;
  imageUrl: string;
  status: string;
  signature: string;
  axisSelections: VariantEditorAxisSelection[];
}

interface ProductEditorState {
  id: number | null;
  code: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  brandId: number | null;
  categoryId: number | null;
  visibility: VisibilityValue;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  images: ProductImage[];
  variants: VariantEditorState[];
}

interface DuplicateSignatureInfo {
  signature: string;
  variants: number[];
}

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
  ],
  template: `
    <section class="catalog-page product-workbench">
      <mat-card class="catalog-hero product-hero">
        <mat-card-content>
          <div class="product-hero-grid">
            <div>
              <p class="catalog-eyebrow">Catalog Studio</p>
              <h2>Product schema editor</h2>
              <p>Tao, sua, kiem tra combination va quan ly image cua product trong mot workspace Material theo schema category hien co.</p>
            </div>

            <div class="product-hero-actions">
              <button mat-flat-button color="primary" type="button" (click)="startCreateProduct()" [disabled]="loading()">Tao product moi</button>
              <button mat-stroked-button type="button" (click)="loadProducts()" [disabled]="loading()">Tai danh sach</button>
            </div>
          </div>
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
            <p class="catalog-stat-label">Schema axes</p>
            <p class="catalog-stat-value">{{ availableVariantAttributes().length }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="catalog-stat-card">
          <mat-card-content>
            <p class="catalog-stat-label">Duplicate combos</p>
            <p class="catalog-stat-value">{{ duplicateVariantSignatures().length }}</p>
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
                <p>Loc nhanh theo keyword, brand, category, status va khoang gia.</p>
              </div>
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
              <button mat-stroked-button type="button" (click)="resetFilters()" [disabled]="loading()">Reset filter</button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="catalog-panel catalog-span-7 product-list-panel">
          <mat-card-content>
            @if (loading() && products().length) {
              <mat-progress-bar class="catalog-progress" mode="indeterminate"></mat-progress-bar>
            }

            <div class="catalog-panel-header">
              <div>
                <h3>Danh sach products</h3>
                <p>Chon mot row de nap detail vao editor va sua theo schema category.</p>
              </div>
            </div>

            @if (products().length) {
              <div class="product-table-shell">
                <table mat-table [dataSource]="products()" class="catalog-table product-table">
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Product</th>
                    <td mat-cell *matCellDef="let product">
                      <div class="product-row-main">
                        @if (product.images.length) {
                          <div class="product-row-gallery" aria-hidden="true">
                            @for (image of product.images.slice(0, 3); track image.id) {
                              <div class="product-row-thumbnail" [class.product-row-thumbnail-featured]="image.thumbnail" [style.background-image]="'url(' + resolveProductImageUrl(image.url) + ')'">
                              </div>
                            }

                            @if (product.images.length > 3) {
                              <div class="product-row-thumbnail product-row-thumbnail-more">+{{ product.images.length - 3 }}</div>
                            }
                          </div>
                        } @else if (resolveProductImageUrl(product.thumbnailUrl)) {
                          <div class="product-row-gallery" aria-hidden="true">
                            <div class="product-row-thumbnail product-row-thumbnail-featured" [style.background-image]="'url(' + resolveProductImageUrl(product.thumbnailUrl) + ')'">
                            </div>
                          </div>
                        } @else {
                          <div class="product-row-gallery" aria-hidden="true">
                            <div class="product-row-thumbnail product-row-thumbnail-empty">No image</div>
                          </div>
                        }

                        <div>
                          <strong>{{ product.name }}</strong>
                          <div class="catalog-inline-meta">
                            <mat-chip class="catalog-chip-neutral">#{{ product.id }}</mat-chip>
                            <mat-chip class="catalog-chip-soft">{{ product.code }}</mat-chip>
                            <mat-chip class="catalog-chip-soft">{{ resolveBrandName(product.brandId) }}</mat-chip>
                          </div>
                          <div class="catalog-inline-meta">/{{ product.slug }}</div>
                        </div>
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

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let product">
                      <div class="catalog-actions catalog-actions-inline">
                        <button mat-stroked-button type="button" (click)="editProduct(product)">Sua</button>
                      </div>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
                </table>
              </div>
            } @else if (!loading()) {
              <div class="catalog-empty">Chua co product nao.</div>
            }
          </mat-card-content>
        </mat-card>

        <mat-card #productEditorPanel class="catalog-panel catalog-span-5 product-editor-panel">
          <mat-card-content>
            @if (loading()) {
              <mat-progress-bar class="catalog-progress" mode="indeterminate"></mat-progress-bar>
            }

            <div class="catalog-panel-header">
              <div>
                <h3>{{ editingProductId() ? 'Product editor' : 'Create product' }}</h3>
                <p>{{ editingProductId() ? 'Dang sua product, images va variants theo schema hien co.' : 'Tao product moi voi nhieu variants va nhieu variant axes.' }}</p>
              </div>

              @if (editingProductId()) {
                <button mat-stroked-button type="button" (click)="startCreateProduct()" [disabled]="loading()">Chuyen sang tao moi</button>
              }
            </div>

            <div class="product-editor-shell">
              <section class="product-editor-section">
                <div class="product-section-title">
                  <mat-icon class="product-section-icon" fontSet="material-symbols-outlined">inventory_2</mat-icon>
                  <span>Thong tin co ban</span>
                </div>

                <div class="catalog-form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Code</mat-label>
                    <input matInput [(ngModel)]="editor().code" placeholder="IPHONE-16-PRO" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Name</mat-label>
                    <input #productNameInput matInput [(ngModel)]="editor().name" placeholder="iPhone 16 Pro" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Slug</mat-label>
                    <input matInput [(ngModel)]="editor().slug" placeholder="iphone-16-pro" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Brand</mat-label>
                    <mat-select [(ngModel)]="editor().brandId">
                      <mat-option [value]="null">Chon brand</mat-option>
                      @for (brand of brands(); track brand.id) {
                        <mat-option [value]="brand.id">{{ brand.name }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Category</mat-label>
                    <mat-select [(ngModel)]="editor().categoryId" (ngModelChange)="onEditorCategoryChange($event)">
                      <mat-option [value]="null">Chon category</mat-option>
                      @for (category of categories(); track category.id) {
                        <mat-option [value]="category.id">{{ category.name }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Visibility</mat-label>
                    <mat-select [(ngModel)]="editor().visibility">
                      <mat-option value="CATALOG_SEARCH">CATALOG_SEARCH</mat-option>
                      <mat-option value="CATALOG">CATALOG</mat-option>
                      <mat-option value="SEARCH">SEARCH</mat-option>
                      <mat-option value="HIDDEN">HIDDEN</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline">
                  <mat-label>Short description</mat-label>
                  <textarea matInput [(ngModel)]="editor().shortDescription" rows="2" placeholder="Tom tat ngan cho list/card"></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Description</mat-label>
                  <textarea matInput [(ngModel)]="editor().description" rows="4" placeholder="Mo ta product"></textarea>
                </mat-form-field>
              </section>

              <mat-divider></mat-divider>

              <section class="product-editor-section">
                <div class="product-section-title">
                  <mat-icon class="product-section-icon" fontSet="material-symbols-outlined">travel_explore</mat-icon>
                  <span>SEO</span>
                </div>

                <div class="catalog-form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>SEO title</mat-label>
                    <input matInput [(ngModel)]="editor().seoTitle" placeholder="iPhone 16 Pro chinh hang" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>SEO keywords</mat-label>
                    <input matInput [(ngModel)]="editor().seoKeywords" placeholder="iphone,apple,smartphone" />
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline">
                  <mat-label>SEO description</mat-label>
                  <textarea matInput [(ngModel)]="editor().seoDescription" rows="2" placeholder="Mo ta SEO"></textarea>
                </mat-form-field>
              </section>

              <mat-divider></mat-divider>

              <section class="product-editor-section">
                <div class="product-section-title-row">
                  <div class="product-section-title">
                    <mat-icon class="product-section-icon" fontSet="material-symbols-outlined">schema</mat-icon>
                    <span>Category schema</span>
                  </div>

                  <button mat-stroked-button type="button" (click)="addVariant()" [disabled]="!availableVariantAttributes().length">Them variant</button>
                </div>

                @if (editor().categoryId && availableVariantAttributes().length) {
                  <div class="product-schema-summary">
                    @for (attribute of availableVariantAttributes(); track attribute.id) {
                      <mat-chip class="catalog-chip-soft">{{ attribute.name }}</mat-chip>
                    }
                  </div>
                } @else if (editor().categoryId) {
                  <div class="catalog-empty">Category nay chua co variant-axis mapping nao.</div>
                } @else {
                  <div class="catalog-empty">Chon category de nap schema variant.</div>
                }

                @if (duplicateVariantSignatures().length) {
                  <div class="catalog-error product-warning-box">
                    <strong>Dang co duplicate variant combinations</strong>
                    <div class="product-warning-list">
                      @for (duplicate of duplicateVariantSignatures(); track duplicate.signature) {
                        <div>
                          {{ duplicate.signature }} dang bi dung boi variants {{ duplicate.variants.join(', ') }}.
                        </div>
                      }
                    </div>
                  </div>
                }

                @for (variant of editor().variants; track $index) {
                  <mat-card class="product-variant-card" [class.product-variant-duplicate]="isDuplicateVariant(variant)">
                    <mat-card-content>
                      <div class="product-variant-header">
                        <div>
                          <h4>Variant {{ $index + 1 }}</h4>
                          <p>{{ previewVariantSignature(variant) }}</p>
                        </div>

                        <button mat-icon-button color="warn" type="button" (click)="removeVariant($index)" [disabled]="editor().variants.length === 1">
                          <mat-icon fontSet="material-symbols-outlined">delete</mat-icon>
                        </button>
                      </div>

                      <div class="catalog-form-grid">
                        <mat-form-field appearance="outline">
                          <mat-label>SKU</mat-label>
                          <input matInput [(ngModel)]="variant.sku" placeholder="IPH16-PRO-BLK-256" />
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Name</mat-label>
                          <input matInput [(ngModel)]="variant.name" placeholder="Black / 256GB" />
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Signature</mat-label>
                          <input matInput [(ngModel)]="variant.signature" placeholder="color:black|storage:256gb" />
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Status</mat-label>
                          <mat-select [(ngModel)]="variant.status">
                            <mat-option value="ACTIVE">ACTIVE</mat-option>
                            <mat-option value="INACTIVE">INACTIVE</mat-option>
                          </mat-select>
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Price</mat-label>
                          <input matInput type="number" [(ngModel)]="variant.price" min="0" step="0.01" />
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Compare at price</mat-label>
                          <input matInput type="number" [(ngModel)]="variant.compareAtPrice" min="0" step="0.01" />
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Stock qty</mat-label>
                          <input matInput type="number" [(ngModel)]="variant.stockQty" min="0" />
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Weight</mat-label>
                          <input matInput type="number" [(ngModel)]="variant.weight" min="0" step="0.01" />
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Barcode</mat-label>
                          <input matInput [(ngModel)]="variant.barcode" placeholder="Barcode" />
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Image URL</mat-label>
                          <input matInput [(ngModel)]="variant.imageUrl" placeholder="https://..." />
                        </mat-form-field>
                      </div>

                      <div class="product-axis-grid">
                        @for (selection of variant.axisSelections; track $index) {
                          <div class="product-axis-row">
                            <mat-form-field appearance="outline">
                              <mat-label>Axis attribute</mat-label>
                              <mat-select [(ngModel)]="selection.attributeId" (ngModelChange)="onVariantAttributeChange(variant, selection)">
                                <mat-option [value]="null">Chon attribute</mat-option>
                                @for (attribute of availableVariantAttributesForSelection(variant, selection); track attribute.id) {
                                  <mat-option [value]="attribute.id">{{ attribute.name }}</mat-option>
                                }
                              </mat-select>
                            </mat-form-field>

                            <mat-form-field appearance="outline">
                              <mat-label>Axis option</mat-label>
                              <mat-select [(ngModel)]="selection.optionId">
                                <mat-option [value]="null">Chon option</mat-option>
                                @for (option of optionsForSelection(selection); track option.id) {
                                  <mat-option [value]="option.id">{{ option.label }}</mat-option>
                                }
                              </mat-select>
                            </mat-form-field>

                            <button mat-icon-button color="warn" type="button" (click)="removeAxisSelection(variant, $index)" [disabled]="variant.axisSelections.length === 1">
                              <mat-icon fontSet="material-symbols-outlined">remove_circle</mat-icon>
                            </button>
                          </div>
                        }
                      </div>

                      <div class="catalog-actions catalog-actions-inline">
                        <button mat-stroked-button type="button" (click)="addAxisSelection(variant)" [disabled]="variant.axisSelections.length >= availableVariantAttributes().length">
                          Them axis
                        </button>
                        <button mat-stroked-button type="button" (click)="fillVariantSignature(variant)">Tu tao signature</button>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </section>

              <mat-divider></mat-divider>

              <section class="product-editor-section">
                <div class="product-section-title">
                  <mat-icon class="product-section-icon" fontSet="material-symbols-outlined">view_module</mat-icon>
                  <span>Combination preview</span>
                </div>

                @if (variantCombinationPreview().length) {
                  <div class="product-combination-grid">
                    @for (combination of variantCombinationPreview(); track combination.signature) {
                      <mat-card class="product-combination-card" [class.product-combination-duplicate]="combination.duplicate">
                        <mat-card-content>
                          <div class="product-combination-header">
                            <strong>Variant {{ combination.index }}</strong>
                            @if (combination.duplicate) {
                              <mat-chip class="catalog-chip-neutral">duplicate</mat-chip>
                            }
                          </div>
                          <div class="product-combination-signature">{{ combination.signature || 'Chua du du lieu' }}</div>
                        </mat-card-content>
                      </mat-card>
                    }
                  </div>
                } @else {
                  <div class="catalog-empty">Them variant va chon attribute/options de xem preview combinations.</div>
                }
              </section>

              <mat-divider></mat-divider>

              <section class="product-editor-section">
                <div class="product-section-title">
                  <mat-icon class="product-section-icon" fontSet="material-symbols-outlined">image</mat-icon>
                  <span>Media</span>
                </div>

                @if (!editingProductId()) {
                  <div class="product-upload-box">
                    <label for="product-images-input">Images</label>
                    <input id="product-images-input" type="file" multiple accept="image/*" (change)="onFilesSelected($event)" />
                    <p class="catalog-file-note">{{ selectedFilesCount() ? selectedFilesCount() + ' file da duoc chon.' : 'Chua co file nao duoc chon.' }}</p>
                  </div>
                } @else {
                  <div class="product-upload-box">
                    <label for="product-images-update-input">Them images</label>
                    <input id="product-images-update-input" type="file" multiple accept="image/*" (change)="onImageUpdateFilesSelected($event)" />
                    <div class="catalog-actions catalog-actions-inline">
                      <button mat-flat-button color="primary" type="button" (click)="uploadEditorImages()" [disabled]="loading() || !pendingImageFilesCount()">
                        Upload {{ pendingImageFilesCount() ? '(' + pendingImageFilesCount() + ')' : '' }}
                      </button>
                    </div>
                  </div>

                  @if (editor().images.length) {
                    <div class="product-media-gallery-shell">
                      @if (selectedEditorImage(); as activeImage) {
                        <div class="product-media-stage">
                          <div class="product-media-stage-image" [style.background-image]="'url(' + resolveProductImageUrl(activeImage.url) + ')'">
                            @if (activeImage.thumbnail) {
                              <mat-chip class="catalog-chip-soft product-image-chip">thumbnail</mat-chip>
                            }
                          </div>

                          <div class="product-media-stage-meta">
                            <div class="product-media-stage-text">
                              <strong>Product gallery</strong>
                              <span>{{ editor().images.length }} image{{ editor().images.length > 1 ? 's' : '' }}</span>
                            </div>

                            <div class="catalog-actions catalog-actions-inline">
                              <button mat-stroked-button type="button" (click)="setEditorThumbnail(activeImage.id)" [disabled]="loading() || activeImage.thumbnail">Set thumbnail</button>
                              <button mat-stroked-button color="warn" type="button" (click)="deleteEditorImage(activeImage.id)" [disabled]="loading()">Xoa</button>
                            </div>
                          </div>
                        </div>
                      }

                      <div class="product-media-thumbnail-strip">
                        @for (image of editor().images; track image.id) {
                          <button class="product-media-thumb" type="button" [class.product-media-thumb-active]="selectedEditorImageId() === image.id" (click)="selectEditorImage(image.id)">
                            <div class="product-media-thumb-image" [style.background-image]="'url(' + resolveProductImageUrl(image.url) + ')'">
                              @if (image.thumbnail) {
                                <span class="product-media-thumb-badge">Thumbnail</span>
                              }
                            </div>
                          </button>
                        }
                      </div>
                    </div>
                  } @else {
                    <div class="catalog-empty">Product nay chua co gallery image nao.</div>
                  }
                }
              </section>

              <div class="catalog-actions product-submit-actions">
                <button mat-flat-button color="primary" type="button" (click)="saveProduct()" [disabled]="loading()">
                  {{ editingProductId() ? 'Cap nhat product' : 'Tao product' }}
                </button>
                <button mat-stroked-button type="button" (click)="resetEditor()" [disabled]="loading()">Reset form</button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </section>
    </section>
  `,
  styles: [
    `
      .product-workbench {
        gap: 1.5rem;
      }

      .product-hero {
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(37, 99, 235, 0.94) 55%, rgba(14, 165, 233, 0.92) 100%);
      }

      .product-hero-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 1.5rem;
        align-items: center;
      }

      .product-hero-actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .product-editor-shell {
        display: grid;
        gap: 1.25rem;
      }

      .product-row-main {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: 0.85rem;
        align-items: center;
      }

      .product-row-gallery {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.45rem;
        max-width: 10rem;
      }

      .product-row-thumbnail {
        width: 4rem;
        height: 4rem;
        border-radius: 0.9rem;
        background-size: cover;
        background-position: center;
        background-color: rgba(226, 232, 240, 0.9);
        border: 1px solid rgba(148, 163, 184, 0.24);
      }

      .product-row-thumbnail-featured {
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.18);
      }

      .product-row-thumbnail-empty {
        display: grid;
        place-items: center;
        color: #64748b;
        font-size: 0.72rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .product-row-thumbnail-more {
        display: grid;
        place-items: center;
        background: rgba(15, 23, 42, 0.82);
        color: #f8fafc;
        font-size: 0.85rem;
        font-weight: 700;
      }

      .product-list-panel,
      .product-editor-panel {
        min-width: 0;
        align-self: start;
      }

      .product-editor-panel {
        position: sticky;
        top: 1.5rem;
      }

      .product-table-shell {
        width: 100%;
        overflow-x: auto;
      }

      .product-table {
        min-width: 860px;
      }

      .product-editor-section {
        display: grid;
        gap: 1rem;
      }

      .product-section-title,
      .product-section-title-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .product-section-title {
        font-weight: 700;
        color: #0f172a;
      }

      .product-section-icon {
        flex: 0 0 auto;
        font-size: 1.3rem;
        width: 1.3rem;
        height: 1.3rem;
        overflow: hidden;
      }

      .product-section-title-row {
        justify-content: space-between;
        flex-wrap: wrap;
      }

      .product-schema-summary,
      .product-warning-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .product-warning-box {
        display: grid;
        gap: 0.5rem;
      }

      .product-warning-list {
        flex-direction: column;
      }

      .product-variant-card {
        background: linear-gradient(180deg, rgba(248, 250, 252, 0.95) 0%, rgba(255, 255, 255, 0.96) 100%);
        border: 1px solid rgba(148, 163, 184, 0.16);
      }

      .product-variant-duplicate {
        border-color: rgba(239, 68, 68, 0.28);
        box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
      }

      .product-variant-card .mat-mdc-card-content {
        display: grid;
        gap: 1rem;
      }

      .product-variant-header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: flex-start;
      }

      .product-variant-header h4 {
        margin: 0;
      }

      .product-variant-header p {
        margin: 0.25rem 0 0;
        color: #64748b;
        word-break: break-word;
      }

      .product-axis-grid {
        display: grid;
        gap: 0.85rem;
      }

      .product-axis-row {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.75rem;
        align-items: start;
      }

      .product-axis-row > * {
        min-width: 0;
      }

      .product-axis-row > button {
        grid-column: 1 / -1;
        justify-self: end;
      }

      .product-upload-box {
        display: grid;
        gap: 0.5rem;
        padding: 1rem;
        border-radius: 1rem;
        border: 1px dashed rgba(59, 130, 246, 0.28);
        background: rgba(239, 246, 255, 0.65);
      }

      .product-combination-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 0.85rem;
      }

      .product-combination-card,
      .product-image-card {
        border: 1px solid rgba(148, 163, 184, 0.16);
        background: rgba(255, 255, 255, 0.96);
      }

      .product-combination-duplicate {
        border-color: rgba(239, 68, 68, 0.28);
      }

      .product-combination-header {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .product-combination-signature {
        color: #334155;
        word-break: break-word;
      }

      .product-media-gallery-shell {
        display: grid;
        gap: 1rem;
      }

      .product-media-stage {
        display: grid;
        gap: 1rem;
      }

      .product-media-stage-image {
        position: relative;
        min-height: 24rem;
        border-radius: 1rem;
        background-size: cover;
        background-position: center;
        background-color: rgba(226, 232, 240, 0.8);
        overflow: hidden;
      }

      .product-media-stage-meta {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
        flex-wrap: wrap;
      }

      .product-media-stage-text {
        display: grid;
        gap: 0.25rem;
      }

      .product-media-stage-text strong {
        color: #0f172a;
      }

      .product-media-stage-text span {
        color: #64748b;
        font-size: 0.92rem;
      }

      .product-media-thumbnail-strip {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(92px, 1fr));
        gap: 0.75rem;
      }

      .product-media-thumb {
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: #fff;
        border-radius: 1rem;
        padding: 0.45rem;
        cursor: pointer;
      }

      .product-media-thumb:hover {
        border-color: rgba(59, 130, 246, 0.35);
      }

      .product-media-thumb-active {
        border-color: rgba(37, 99, 235, 0.48);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
      }

      .product-media-thumb-image {
        position: relative;
        width: 100%;
        aspect-ratio: 1 / 1;
        border-radius: 0.8rem;
        background-size: cover;
        background-position: center;
        background-color: rgba(226, 232, 240, 0.8);
        overflow: hidden;
      }

      .product-media-thumb-badge {
        position: absolute;
        left: 0.45rem;
        bottom: 0.45rem;
        padding: 0.2rem 0.45rem;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.78);
        color: #f8fafc;
        font-size: 0.65rem;
        font-weight: 700;
      }

      .product-image-chip {
        position: absolute;
        top: 0.75rem;
        left: 0.75rem;
      }

      .product-submit-actions {
        padding-top: 0.5rem;
      }

      @media (max-width: 1024px) {
        .product-hero-grid {
          grid-template-columns: 1fr;
        }

        .product-editor-panel {
          position: static;
          top: auto;
        }
      }

      @media (max-width: 720px) {
        .product-media-stage-image {
          min-height: 18rem;
        }

        .product-media-thumbnail-strip {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
      }

      @media (max-width: 720px) {
        .product-row-main {
          grid-template-columns: 1fr;
        }

        .product-axis-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ProductsPage {
  private readonly productApi = inject(ProductApiService);
  private readonly attributeApi = inject(AttributeApiService);
  private readonly brandApi = inject(BrandApiService);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly categoryAttributeApi = inject(CategoryAttributeApiService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);

  @ViewChild('productEditorPanel') private productEditorPanel?: ElementRef<HTMLElement>;
  @ViewChild('productNameInput') private productNameInput?: ElementRef<HTMLInputElement>;

  protected readonly products = signal<AdminProductListItem[]>([]);
  protected readonly brands = signal<Brand[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly variantAttributes = signal<AttributeDefinition[]>([]);
  protected readonly categoryVariantAttributes = signal<CategoryAttribute[]>([]);
  protected readonly attributeOptions = signal<AttributeValue[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly editingProductId = signal<number | null>(null);
  protected readonly selectedEditorImageId = signal<number | null>(null);
  protected readonly editor = signal<ProductEditorState>(createEmptyEditor());
  protected readonly displayedColumns = ['name', 'category', 'price', 'status', 'variants', 'actions'];
  protected readonly filters = {
    keyword: '',
    status: '',
    brandId: null as number | null,
    categoryId: null as number | null,
    minPrice: null as number | null,
    maxPrice: null as number | null,
  };

  private selectedFiles: File[] = [];
  private pendingImageFiles: File[] = [];

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    this.loadReferenceData();
    this.loadProducts();
  }

  protected resolveProductImageUrl(url: string | null | undefined): string | null {
    return resolveMediaUrl(url, this.config.apiBaseUrl);
  }

  protected loadReferenceData(): void {
    forkJoin({
      brands: this.brandApi.list(),
      categories: this.categoryApi.list(),
      attributes: this.attributeApi.listDefinitions(),
      options: this.attributeApi.listOptions(),
    }).subscribe({
      next: ({ brands, categories, attributes, options }) => {
        this.brands.set(brands);
        this.categories.set(categories);
        this.variantAttributes.set(attributes.filter((attribute) => attribute.variantAxis));
        this.attributeOptions.set(options);
      },
      error: (error) => this.handleError(error),
    });
  }

  protected loadProducts(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.productApi.list(this.filters)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (products) => this.products.set(products),
        error: (error) => this.handleError(error),
      });
  }

  protected resetFilters(): void {
    this.filters.keyword = '';
    this.filters.status = '';
    this.filters.brandId = null;
    this.filters.categoryId = null;
    this.filters.minPrice = null;
    this.filters.maxPrice = null;
  }

  protected startCreateProduct(): void {
    this.editingProductId.set(null);
    this.editor.set(createEmptyEditor());
    this.categoryVariantAttributes.set([]);
    this.selectedFiles = [];
    this.pendingImageFiles = [];
  }

  protected resetEditor(): void {
    const productId = this.editingProductId();
    if (productId) {
      this.editProductById(productId);
      return;
    }
    this.startCreateProduct();
  }

  protected onEditorCategoryChange(categoryId: number | null): void {
    const currentEditor = this.editor();
    currentEditor.categoryId = categoryId;
    currentEditor.variants = currentEditor.variants.map((variant) => ({
      ...variant,
      axisSelections: [createEmptyAxisSelection()],
      signature: '',
    }));
    this.editor.set({ ...currentEditor });
    this.loadCategoryVariantSchema(categoryId);
  }

  protected addVariant(): void {
    const currentEditor = this.editor();
    currentEditor.variants = [...currentEditor.variants, createEmptyVariantEditor()];
    this.editor.set({ ...currentEditor });
  }

  protected removeVariant(index: number): void {
    const currentEditor = this.editor();
    if (currentEditor.variants.length === 1) {
      return;
    }

    currentEditor.variants = currentEditor.variants.filter((_, itemIndex) => itemIndex !== index);
    this.editor.set({ ...currentEditor });
  }

  protected addAxisSelection(variant: VariantEditorState): void {
    if (variant.axisSelections.length >= this.availableVariantAttributes().length) {
      return;
    }

    variant.axisSelections = [...variant.axisSelections, createEmptyAxisSelection()];
    this.editor.set({ ...this.editor() });
  }

  protected removeAxisSelection(variant: VariantEditorState, index: number): void {
    if (variant.axisSelections.length === 1) {
      return;
    }

    variant.axisSelections = variant.axisSelections.filter((_, itemIndex) => itemIndex !== index);
    this.editor.set({ ...this.editor() });
  }

  protected onVariantAttributeChange(variant: VariantEditorState, selection: VariantEditorAxisSelection): void {
    selection.optionId = null;
    if (!selection.attributeId) {
      this.editor.set({ ...this.editor() });
      return;
    }

    const duplicateCount = variant.axisSelections.filter((item) => item.attributeId === selection.attributeId).length;
    if (duplicateCount > 1) {
      this.notifications.error('Moi variant chi duoc dung mot lan cho moi attribute axis.');
      selection.attributeId = null;
    }

    this.editor.set({ ...this.editor() });
  }

  protected optionsForSelection(selection: VariantEditorAxisSelection): AttributeValue[] {
    if (!selection.attributeId) {
      return [];
    }

    return this.attributeOptions().filter((option) => option.attributeId === selection.attributeId && option.active);
  }

  protected availableVariantAttributes(): AttributeDefinition[] {
    const allowedAttributeIds = new Set(this.categoryVariantAttributes().map((item) => item.attributeId));
    return this.variantAttributes().filter((attribute) => allowedAttributeIds.has(attribute.id));
  }

  protected availableVariantAttributesForSelection(
    variant: VariantEditorState,
    selection: VariantEditorAxisSelection,
  ): AttributeDefinition[] {
    const selectedIds = new Set(
      variant.axisSelections
        .filter((item) => item !== selection)
        .map((item) => item.attributeId)
        .filter((value): value is number => value != null),
    );

    return this.availableVariantAttributes().filter((attribute) => !selectedIds.has(attribute.id) || attribute.id === selection.attributeId);
  }

  protected previewVariantSignature(variant: VariantEditorState): string {
    return variant.signature.trim() || this.buildVariantSignature(variant) || 'Chua co signature';
  }

  protected fillVariantSignature(variant: VariantEditorState): void {
    variant.signature = this.buildVariantSignature(variant);
    this.editor.set({ ...this.editor() });
  }

  protected duplicateVariantSignatures(): DuplicateSignatureInfo[] {
    const usage = new Map<string, number[]>();
    this.editor().variants.forEach((variant, index) => {
      const signature = this.previewVariantSignature(variant).trim().toLowerCase();
      if (!signature || signature === 'chua co signature') {
        return;
      }

      const indexes = usage.get(signature) ?? [];
      indexes.push(index + 1);
      usage.set(signature, indexes);
    });

    return Array.from(usage.entries())
      .filter(([, indexes]) => indexes.length > 1)
      .map(([signature, variants]) => ({ signature, variants }));
  }

  protected isDuplicateVariant(variant: VariantEditorState): boolean {
    const signature = this.previewVariantSignature(variant).trim().toLowerCase();
    if (!signature || signature === 'chua co signature') {
      return false;
    }

    return this.duplicateVariantSignatures().some((item) => item.signature === signature);
  }

  protected variantCombinationPreview(): Array<{ index: number; signature: string; duplicate: boolean }> {
    return this.editor().variants.map((variant, index) => ({
      index: index + 1,
      signature: this.previewVariantSignature(variant),
      duplicate: this.isDuplicateVariant(variant),
    }));
  }

  protected selectedFilesCount(): number {
    return this.selectedFiles.length;
  }

  protected pendingImageFilesCount(): number {
    return this.pendingImageFiles.length;
  }

  protected selectedEditorImage(): ProductImage | null {
    const images = this.editor().images;
    if (!images.length) {
      return null;
    }

    const selectedId = this.selectedEditorImageId();
    return images.find((image) => image.id === selectedId) ?? images.find((image) => image.thumbnail) ?? images[0] ?? null;
  }

  protected selectEditorImage(imageId: number): void {
    this.selectedEditorImageId.set(imageId);
  }

  protected onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFiles = Array.from(input.files ?? []);
  }

  protected onImageUpdateFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.pendingImageFiles = Array.from(input.files ?? []);
  }

  protected editProduct(product: AdminProductListItem): void {
    this.editProductById(product.id);
  }

  protected uploadEditorImages(): void {
    const productId = this.editingProductId();
    if (!productId || !this.pendingImageFiles.length) {
      return;
    }

    this.loading.set(true);
    this.productApi.addImages(productId, this.pendingImageFiles)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (product) => {
          this.pendingImageFiles = [];
          this.editor.set(remapEditorForSchema(mapProductDetailToEditor(product), this.availableVariantAttributes()));
          this.syncSelectedEditorImage(product.images);
          this.patchProductListItem(product);
          this.notifications.success('Upload product images thanh cong.');
        },
        error: (error) => this.handleError(error),
      });
  }

  protected setEditorThumbnail(imageId: number): void {
    const productId = this.editingProductId();
    if (!productId) {
      return;
    }

    this.loading.set(true);
    this.productApi.setThumbnail(productId, imageId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (product) => {
          this.editor.set(remapEditorForSchema(mapProductDetailToEditor(product), this.availableVariantAttributes()));
          this.syncSelectedEditorImage(product.images);
          this.patchProductListItem(product);
          this.notifications.success('Cap nhat thumbnail thanh cong.');
        },
        error: (error) => this.handleError(error),
      });
  }

  protected deleteEditorImage(imageId: number): void {
    const productId = this.editingProductId();
    if (!productId) {
      return;
    }

    this.loading.set(true);
    this.productApi.deleteImage(productId, imageId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (product) => {
          this.editor.set(remapEditorForSchema(mapProductDetailToEditor(product), this.availableVariantAttributes()));
          this.syncSelectedEditorImage(product.images);
          this.patchProductListItem(product);
          this.notifications.success('Xoa product image thanh cong.');
        },
        error: (error) => this.handleError(error),
      });
  }

  protected saveProduct(): void {
    const request = this.buildUpsertRequest();
    if (!request) {
      return;
    }

    if (this.duplicateVariantSignatures().length) {
      this.notifications.error('Dang co duplicate variant combinations, can sua truoc khi luu.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const editingId = this.editingProductId();
    const action$ = editingId
      ? this.productApi.update(editingId, request)
      : this.productApi.create(request, this.selectedFiles);

    action$.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => {
        this.notifications.success(editingId ? 'Cap nhat product thanh cong.' : 'Tao product thanh cong.');
        this.startCreateProduct();
        this.loadProducts();
      },
      error: (error) => this.handleError(error),
    });
  }

  protected resolveBrandName(brandId: number): string {
    return this.brands().find((brand) => brand.id === brandId)?.name ?? `#${brandId}`;
  }

  protected resolveCategoryName(categoryId: number): string {
    return this.categories().find((category) => category.id === categoryId)?.name ?? `#${categoryId}`;
  }

  private editProductById(productId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.productApi.getById(productId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (product) => {
          this.editingProductId.set(product.id);
          this.editor.set(mapProductDetailToEditor(product));
          this.syncSelectedEditorImage(product.images);
          this.selectedFiles = [];
          this.pendingImageFiles = [];
          this.loadCategoryVariantSchema(product.categoryId, product);
          this.scrollToEditor();
        },
        error: (error) => this.handleError(error),
      });
  }

  private loadCategoryVariantSchema(categoryId: number | null, productToRemap?: AdminProductDetail): void {
    if (!categoryId) {
      this.categoryVariantAttributes.set([]);
      return;
    }

    this.categoryAttributeApi.list(categoryId).subscribe({
      next: (items) => {
        this.categoryVariantAttributes.set(items.filter((item) => item.variantAxis));

        if (productToRemap) {
          this.editor.set(remapEditorForSchema(mapProductDetailToEditor(productToRemap), this.availableVariantAttributes()));
          return;
        }

        this.editor.set(remapEditorForSchema(this.editor(), this.availableVariantAttributes()));
      },
      error: (error) => this.handleError(error),
    });
  }

  private buildUpsertRequest(): AdminProductUpsertRequest | null {
    const editor = this.editor();
    if (!editor.code.trim() || !editor.name.trim() || !editor.slug.trim() || !editor.brandId || !editor.categoryId) {
      this.notifications.error('Can nhap code, name, slug, brand va category.');
      return null;
    }

    if (!editor.variants.length) {
      this.notifications.error('Can it nhat mot variant.');
      return null;
    }

    const availableAttributeIds = new Set(this.availableVariantAttributes().map((attribute) => attribute.id));
    const variants: AdminProductVariantUpsert[] = [];

    for (const variant of editor.variants) {
      if (!variant.sku.trim()) {
        this.notifications.error('Moi variant phai co SKU.');
        return null;
      }

      if (variant.price == null || variant.price < 0) {
        this.notifications.error(`Variant ${variant.sku || ''} phai co price hop le.`);
        return null;
      }

      if (variant.stockQty == null || variant.stockQty < 0) {
        this.notifications.error(`Variant ${variant.sku || ''} phai co stock qty hop le.`);
        return null;
      }

      const attributes: ProductVariantAttribute[] = [];
      for (const selection of variant.axisSelections) {
        if (!selection.attributeId || !selection.optionId) {
          this.notifications.error(`Variant ${variant.sku || ''} chua chon du attribute axis va option.`);
          return null;
        }

        if (!availableAttributeIds.has(selection.attributeId)) {
          this.notifications.error(`Attribute axis ${selection.attributeId} khong thuoc schema category dang chon.`);
          return null;
        }

        const option = this.optionsForSelection(selection).find((item) => item.id === selection.optionId);
        if (!option) {
          this.notifications.error(`Option cua variant ${variant.sku || ''} khong hop le hoac da inactive.`);
          return null;
        }

        attributes.push({
          attributeId: selection.attributeId,
          optionId: selection.optionId,
        });
      }

      if (!attributes.length) {
        this.notifications.error(`Variant ${variant.sku || ''} phai co it nhat mot variant axis.`);
        return null;
      }

      const signature = variant.signature.trim() || this.buildVariantSignature(variant);
      if (!signature) {
        this.notifications.error(`Variant ${variant.sku || ''} chua co du combination de tao signature.`);
        return null;
      }

      variants.push({
        id: variant.id,
        sku: variant.sku.trim(),
        name: variant.name.trim(),
        barcode: variant.barcode.trim(),
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        stockQty: variant.stockQty,
        weight: variant.weight,
        imageUrl: variant.imageUrl.trim(),
        status: variant.status.trim() || 'ACTIVE',
        signature,
        attributes,
      });
    }

    return {
      code: editor.code.trim(),
      name: editor.name.trim(),
      slug: editor.slug.trim().toLowerCase(),
      shortDescription: editor.shortDescription.trim(),
      description: editor.description.trim(),
      brandId: editor.brandId,
      categoryId: editor.categoryId,
      visibility: editor.visibility,
      seoTitle: editor.seoTitle.trim(),
      seoDescription: editor.seoDescription.trim(),
      seoKeywords: editor.seoKeywords.trim(),
      variants,
    };
  }

  private buildVariantSignature(variant: VariantEditorState): string {
    return variant.axisSelections
      .map((selection) => {
        const attribute = this.availableVariantAttributes().find((item) => item.id === selection.attributeId);
        const option = this.optionsForSelection(selection).find((item) => item.id === selection.optionId);
        if (!attribute || !option) {
          return null;
        }

        return `${attribute.code}:${option.value}`;
      })
      .filter((item): item is string => !!item)
      .join('|');
  }

  private handleError(error: unknown): void {
    const mappedError = this.errorMapper.map(error);
    this.errorMessage.set(mappedError.message);
    this.notifications.error(mappedError.message);
  }

  private scrollToEditor(): void {
    setTimeout(() => {
      this.productEditorPanel?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.productNameInput?.nativeElement.focus();
    }, 0);
  }

  private syncSelectedEditorImage(images: ProductImage[]): void {
    if (!images.length) {
      this.selectedEditorImageId.set(null);
      return;
    }

    const currentId = this.selectedEditorImageId();
    if (currentId != null && images.some((image) => image.id === currentId)) {
      return;
    }

    this.selectedEditorImageId.set(images.find((image) => image.thumbnail)?.id ?? images[0]?.id ?? null);
  }

  private patchProductListItem(product: AdminProductDetail): void {
    const thumbnailUrl = product.images.find((image) => image.thumbnail)?.url ?? product.images[0]?.url ?? null;

    this.products.set(
      this.products().map((item) => {
        if (item.id !== product.id) {
          return item;
        }

        return {
          ...item,
          images: product.images,
          thumbnailUrl,
        };
      }),
    );
  }
}

function createEmptyEditor(): ProductEditorState {
  return {
    id: null,
    code: '',
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    brandId: null,
    categoryId: null,
    visibility: 'CATALOG_SEARCH',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    images: [],
    variants: [createEmptyVariantEditor()],
  };
}

function createEmptyVariantEditor(): VariantEditorState {
  return {
    id: null,
    sku: '',
    name: '',
    barcode: '',
    price: null,
    compareAtPrice: null,
    stockQty: 0,
    weight: null,
    imageUrl: '',
    status: 'ACTIVE',
    signature: '',
    axisSelections: [createEmptyAxisSelection()],
  };
}

function createEmptyAxisSelection(): VariantEditorAxisSelection {
  return {
    attributeId: null,
    optionId: null,
  };
}

function mapProductDetailToEditor(product: AdminProductDetail): ProductEditorState {
  return {
    id: product.id,
    code: product.code,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription ?? '',
    description: product.description ?? '',
    brandId: product.brandId,
    categoryId: product.categoryId,
    visibility: product.visibility ?? 'CATALOG_SEARCH',
    seoTitle: product.seoTitle ?? '',
    seoDescription: product.seoDescription ?? '',
    seoKeywords: product.seoKeywords ?? '',
    images: product.images ?? [],
    variants: product.variants.length ? product.variants.map(mapVariantToEditor) : [createEmptyVariantEditor()],
  };
}

function mapVariantToEditor(variant: AdminProductVariant): VariantEditorState {
  return {
    id: variant.id ?? null,
    sku: variant.sku ?? '',
    name: variant.name ?? '',
    barcode: variant.barcode ?? '',
    price: variant.price ?? null,
    compareAtPrice: variant.compareAtPrice ?? null,
    stockQty: variant.inventory?.onHandQty ?? 0,
    weight: variant.weight ?? null,
    imageUrl: variant.imageUrl ?? '',
    status: variant.status ?? 'ACTIVE',
    signature: variant.signature ?? '',
    axisSelections: variant.attributes.length
      ? variant.attributes.map((attribute) => ({
          attributeId: attribute.attributeId,
          optionId: attribute.optionId,
        }))
      : [createEmptyAxisSelection()],
  };
}

function remapEditorForSchema(editor: ProductEditorState, availableAttributes: AttributeDefinition[]): ProductEditorState {
  const allowedAttributeIds = new Set(availableAttributes.map((attribute) => attribute.id));

  return {
    ...editor,
    variants: editor.variants.map((variant) => {
      const filteredSelections = variant.axisSelections.filter((selection) => selection.attributeId != null && allowedAttributeIds.has(selection.attributeId));
      return {
        ...variant,
        axisSelections: filteredSelections.length ? filteredSelections : [createEmptyAxisSelection()],
      };
    }),
  };
}
