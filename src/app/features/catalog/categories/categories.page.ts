import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { AppConfig } from '../../../core/config/app-config.model';
import { Category, CategoryTreeNode, PagedResult } from '../../../core/models/catalog.models';
import { CategoryApiService } from '../../../core/services/category-api.service';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthStore } from '../../../core/state/auth.store';
import { APP_CONFIG } from '../../../core/tokens/app-config.token';
import { QueryParamValue } from '../../../core/utils/query-params.util';
import { resolveMediaUrl } from '../../../core/utils/media-url.util';
import { hasPermission } from '../../../core/utils/permission.util';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
  ],
  template: `
    <section class="catalog-page category-page">
      <mat-card class="catalog-hero category-hero">
          <div class="category-hero-glow category-hero-glow-left"></div>
          <div class="category-hero-glow category-hero-glow-right"></div>
          <mat-card-content>
            <p class="catalog-eyebrow">Catalog</p>
            <div class="category-hero-heading">
              <div>
                <h2>Category workspace</h2>
                <p>Quan ly taxonomy category theo spec business: code, slug, parent, status, visibility, assignable va metadata SEO.</p>
              </div>

              <div class="category-hero-badges">
                <div class="category-badge-card">
                  <span class="category-badge-label">Tree-aware</span>
                  <strong>Hierarchy</strong>
                </div>
                <div class="category-badge-card">
                  <span class="category-badge-label">Lifecycle</span>
                  <strong>Active to Archived</strong>
                </div>
                <div class="category-badge-card">
                  <span class="category-badge-label">Admin tools</span>
                  <strong>Move, merge, reorder</strong>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

      <section class="catalog-stats">
        <mat-card class="catalog-stat-card category-stat-card category-stat-primary">
          <mat-card-content>
            <p class="catalog-stat-label">Tong categories</p>
            <p class="catalog-stat-value">{{ categories().length }}</p>
            <p class="category-stat-note">Danh sach active categories dang hien tren workspace.</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="catalog-stat-card category-stat-card category-stat-secondary">
          <mat-card-content>
            <p class="catalog-stat-label">Dang sua</p>
            <p class="catalog-stat-value">{{ editingId() ? 1 : 0 }}</p>
            <p class="category-stat-note">Form mode duoc highlight de giam nham lan khi update taxonomy.</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="catalog-stat-card category-stat-card category-stat-warning">
          <mat-card-content>
            <p class="catalog-stat-label">Root categories</p>
            <p class="catalog-stat-value">{{ rootCategoryCount() }}</p>
            <p class="category-stat-note">Node cap cao nhat trong category tree hien tai.</p>
          </mat-card-content>
        </mat-card>
      </section>

      <section class="catalog-grid">
        <mat-card #categoryEditorPanel class="catalog-panel catalog-span-4 category-panel category-editor-panel">
          <mat-card-content>
            @if (loading()) {
              <mat-progress-bar class="catalog-progress" mode="indeterminate"></mat-progress-bar>
            }

            <div class="catalog-panel-header">
              <div>
                <h3>{{ editingId() ? 'Cap nhat category' : 'Tao category moi' }}</h3>
                <p>Nhap contract category day du theo spec de backend giu duoc hierarchy, lifecycle va storefront metadata on dinh.</p>
              </div>

              @if (editingId()) {
                <button mat-stroked-button type="button" (click)="resetForm()">Huy sua</button>
              }
            </div>

            @if (!canManageCategories()) {
              <div class="catalog-empty">Ban dang o che do xem. Can <code>CATEGORY_MANAGE</code> de tao, sua, move, merge, deactivate hoac soft delete category.</div>
            }

            @if (errorMessage()) {
              <div class="catalog-error">{{ errorMessage() }}</div>
            }

            <div class="catalog-form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Code</mat-label>
                <input matInput [(ngModel)]="form.code" placeholder="smartphones" [disabled]="!canManageCategories()" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Name</mat-label>
                <input #categoryNameInput matInput [(ngModel)]="form.name" placeholder="Laptop" [disabled]="!canManageCategories()" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Slug</mat-label>
                <input matInput [(ngModel)]="form.slug" placeholder="laptop" [disabled]="!canManageCategories()" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Parent</mat-label>
                <mat-select [(ngModel)]="form.parentId" [disabled]="!canManageCategories()">
                  <mat-option [value]="null">Root category</mat-option>
                  @for (category of availableParents(); track category.id) {
                    <mat-option [value]="category.id" [disabled]="isParentOptionDisabled(category)">{{ displayCategoryPath(category) }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select [(ngModel)]="form.status" [disabled]="!canManageCategories()">
                  <mat-option value="ACTIVE">ACTIVE</mat-option>
                  <mat-option value="INACTIVE">INACTIVE</mat-option>
                  <mat-option value="ARCHIVED">ARCHIVED</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Sort order</mat-label>
                <input matInput type="number" [(ngModel)]="form.sortOrder" [disabled]="!canManageCategories()" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Description</mat-label>
              <textarea matInput [(ngModel)]="form.description" rows="4" placeholder="Mo ta cho category" [disabled]="!canManageCategories()"></textarea>
            </mat-form-field>

            <div class="catalog-form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Icon URL</mat-label>
                <input matInput [(ngModel)]="form.iconUrl" placeholder="https://..." [disabled]="!canManageCategories()" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>SEO title</mat-label>
                <input matInput [(ngModel)]="form.seoTitle" placeholder="Danh muc smartphones" [disabled]="!canManageCategories()" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>SEO keywords</mat-label>
                <input matInput [(ngModel)]="form.seoKeywords" placeholder="smartphone,dien-thoai" [disabled]="!canManageCategories()" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>SEO description</mat-label>
              <textarea matInput [(ngModel)]="form.seoDescription" rows="3" placeholder="Mo ta SEO" [disabled]="!canManageCategories()"></textarea>
            </mat-form-field>

            <div class="catalog-toggle-row">
              <mat-checkbox [(ngModel)]="form.visible" [disabled]="!canManageCategories()">Visible tren storefront</mat-checkbox>
              <mat-checkbox [(ngModel)]="form.assignable" [disabled]="!canManageCategories()">Cho gan product</mat-checkbox>
            </div>

            <div class="catalog-actions">
              <button mat-flat-button color="primary" type="button" (click)="save()" [disabled]="loading() || !canManageCategories()">
                {{ editingId() ? 'Luu cap nhat' : 'Tao category' }}
              </button>
              @if (editingId()) {
                <button mat-stroked-button type="button" (click)="moveCategory()" [disabled]="loading() || !canManageCategories()">Move</button>
              }
            </div>

            @if (editingId()) {
              <div class="catalog-subsection">
                <div class="catalog-panel-header">
                  <div>
                    <h3>Category images</h3>
                    <p>Quan ly gallery sau khi category da ton tai, khong dung upload tam hay nhap tay image URL.</p>
                  </div>
                </div>

                @if (selectedCategoryThumbnailUrl()) {
                  <div class="brand-image-preview">
                    <img [src]="selectedCategoryThumbnailUrl()!" [alt]="form.name || 'Category image'" />
                  </div>
                } @else {
                  <div class="catalog-empty">Category nay chua co thumbnail.</div>
                }

                <div class="catalog-actions brand-image-actions">
                  <input #categoryImageInput type="file" multiple accept="image/*" (change)="uploadCategoryImages($event)" [disabled]="loading() || !canManageCategories()" />
                </div>

                @if (selectedCategoryImages().length) {
                  <div class="product-image-grid">
                    @for (image of selectedCategoryImages(); track image.id) {
                      <mat-card class="product-image-card">
                        <mat-card-content>
                          <div class="product-image-preview" [style.background-image]="'url(' + image.url + ')'">
                            @if (image.thumbnail) {
                              <mat-chip class="catalog-chip-soft product-image-chip">thumbnail</mat-chip>
                            }
                          </div>
                          <div class="catalog-actions">
                            <button mat-stroked-button type="button" (click)="setCategoryThumbnail(image.id)" [disabled]="loading() || image.thumbnail || !canManageCategories()">Set thumbnail</button>
                            <button mat-stroked-button color="warn" type="button" (click)="deleteCategoryImage(image.id)" [disabled]="loading() || !canManageCategories()">Xoa</button>
                          </div>
                        </mat-card-content>
                      </mat-card>
                    }
                  </div>
                }
              </div>
            }
          </mat-card-content>
        </mat-card>

        <mat-card class="catalog-panel catalog-span-8 category-panel category-list-panel">
          <mat-card-content>
            @if (loading()) {
              <mat-progress-bar class="catalog-progress" mode="indeterminate"></mat-progress-bar>
            }

            <div class="catalog-panel-header">
              <div>
                <h3>Danh sach categories</h3>
                <p>Theo doi code, path, lifecycle, product count va child count theo contract moi. Co them merge, soft delete va reorder theo parent.</p>
              </div>

              <button mat-stroked-button type="button" (click)="loadCategories()" [disabled]="loading()">Tai lai</button>
            </div>

            <div class="catalog-form-grid category-filter-grid">
              <mat-form-field appearance="outline">
                <mat-label>Search API</mat-label>
                <input matInput [(ngModel)]="filters.keyword" placeholder="name, code, slug" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Status filter</mat-label>
                <mat-select [(ngModel)]="filters.status">
                  <mat-option [value]="null">Tat ca</mat-option>
                  <mat-option value="ACTIVE">ACTIVE</mat-option>
                  <mat-option value="INACTIVE">INACTIVE</mat-option>
                  <mat-option value="ARCHIVED">ARCHIVED</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Visible</mat-label>
                <mat-select [(ngModel)]="filters.visible">
                  <mat-option [value]="null">Tat ca</mat-option>
                  <mat-option [value]="true">Visible</mat-option>
                  <mat-option [value]="false">Hidden</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Assignable</mat-label>
                <mat-select [(ngModel)]="filters.assignable">
                  <mat-option [value]="null">Tat ca</mat-option>
                  <mat-option [value]="true">Assignable</mat-option>
                  <mat-option [value]="false">Blocked</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="catalog-list-toolbar">
              <mat-form-field appearance="outline" class="category-search-field">
                <mat-label>Search in current page</mat-label>
                <input matInput [(ngModel)]="tableQuery" placeholder="Tim nhanh theo path, parent, code" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="category-page-size-field">
                <mat-label>Rows per page</mat-label>
                <mat-select [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange()">
                  <mat-option [value]="5">5</mat-option>
                  <mat-option [value]="10">10</mat-option>
                  <mat-option [value]="20">20</mat-option>
                  <mat-option [value]="50">50</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="catalog-actions category-filter-actions">
              <button mat-stroked-button type="button" (click)="applyFilters()" [disabled]="loading()">Loc danh sach</button>
              <button mat-stroked-button type="button" (click)="resetFilters()" [disabled]="loading()">Bo loc</button>
            </div>

            @if (filteredCategoryCount()) {
              <div class="category-list-summary">
                <span>Hien {{ pageRangeLabel() }} / {{ totalElements() }} category</span>
                @if (tableQuery.trim()) {
                  <span>Search current page: "{{ tableQuery.trim() }}"</span>
                }
              </div>

              <table mat-table [dataSource]="filteredCategories()" class="catalog-table category-table">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>
                    <button class="catalog-sort-button" type="button" (click)="toggleSort('name')">
                      Name {{ sortIndicator('name') }}
                    </button>
                  </th>
                  <td mat-cell *matCellDef="let category">
                    <div>
                      <strong>{{ category.name }}</strong>
                      <div class="catalog-inline-meta">
                        <mat-chip class="catalog-chip-neutral">#{{ category.id }}</mat-chip>
                        <mat-chip class="catalog-chip-neutral">{{ category.code }}</mat-chip>
                        <mat-chip class="catalog-chip-soft">{{ category.slug }}</mat-chip>
                      </div>
                      <div class="catalog-subtext">{{ displayCategoryPath(category) }}</div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="parent">
                  <th mat-header-cell *matHeaderCellDef>
                    <button class="catalog-sort-button" type="button" (click)="toggleSort('parent')">
                      Parent {{ sortIndicator('parent') }}
                    </button>
                  </th>
                  <td mat-cell *matCellDef="let category">{{ category.parentName ?? resolveParentName(category.parentId) }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>
                    <button class="catalog-sort-button" type="button" (click)="toggleSort('status')">
                      Status {{ sortIndicator('status') }}
                    </button>
                  </th>
                  <td mat-cell *matCellDef="let category">{{ category.status }}</td>
                </ng-container>

                <ng-container matColumnDef="children">
                  <th mat-header-cell *matHeaderCellDef>
                    <button class="catalog-sort-button" type="button" (click)="toggleSort('children')">
                      Children {{ sortIndicator('children') }}
                    </button>
                  </th>
                  <td mat-cell *matCellDef="let category">{{ category.childrenCount ?? category.childrenIds.length }}</td>
                </ng-container>

                <ng-container matColumnDef="visibility">
                  <th mat-header-cell *matHeaderCellDef>
                    <button class="catalog-sort-button" type="button" (click)="toggleSort('visibility')">
                      Flags {{ sortIndicator('visibility') }}
                    </button>
                  </th>
                  <td mat-cell *matCellDef="let category">
                    <div class="catalog-inline-meta">
                      <mat-chip class="catalog-chip-soft">visible: {{ category.visible ? 'yes' : 'no' }}</mat-chip>
                      <mat-chip class="catalog-chip-soft">assignable: {{ category.assignable ? 'yes' : 'no' }}</mat-chip>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="products">
                  <th mat-header-cell *matHeaderCellDef>
                    <button class="catalog-sort-button" type="button" (click)="toggleSort('products')">
                      Products {{ sortIndicator('products') }}
                    </button>
                  </th>
                  <td mat-cell *matCellDef="let category">{{ category.productCount ?? 0 }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Action</th>
                  <td mat-cell *matCellDef="let category">
                    <div class="catalog-actions">
                      <button mat-stroked-button type="button" (click)="startEdit(category)" [disabled]="!canManageCategories()">Sua</button>
                      <button mat-stroked-button type="button" (click)="toggleCategoryStatus(category)" [disabled]="loading() || !canManageCategories()">
                        {{ category.status === 'ACTIVE' ? 'Deactivate' : 'Activate' }}
                      </button>
                      <button mat-stroked-button type="button" (click)="archiveCategory(category)" [disabled]="loading() || category.status === 'ARCHIVED' || !canManageCategories()">
                        Archive
                      </button>
                      <button mat-stroked-button type="button" (click)="promoteCategory(category)" [disabled]="loading() || !canManageCategories()">Len dau</button>
                      <button mat-stroked-button type="button" (click)="softDeleteCategory(category)" [disabled]="loading() || !canManageCategories()">Delete</button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>

              <div class="category-pagination">
                <button mat-stroked-button type="button" (click)="goToPreviousPage()" [disabled]="loading() || currentPage() === 1">Trang truoc</button>
                <span>Trang {{ currentPage() }} / {{ totalPages() }}</span>
                <button mat-stroked-button type="button" (click)="goToNextPage()" [disabled]="loading() || currentPage() === totalPages()">Trang sau</button>
              </div>
            } @else {
              <div class="catalog-empty">{{ tableQuery.trim() ? 'Khong tim thay category phu hop trong trang hien tai.' : 'Chua co category nao.' }}</div>
            }
          </mat-card-content>
        </mat-card>
      </section>

      <section class="catalog-grid">
        <mat-card class="catalog-panel catalog-span-6 category-panel category-tree-panel">
          <mat-card-content>
            <div class="catalog-panel-header">
              <div>
                <h3>Category tree</h3>
                <p>Tree view de nhin nhanh hierarchy, level, visible va assignable theo taxonomy moi.</p>
              </div>
            </div>

            @if (treeNodes().length) {
               <div class="catalog-tree category-tree-surface">
                @for (node of treeNodes(); track node.id) {
                  <div class="catalog-tree-node">
                    <div class="catalog-tree-row">
                        <strong>{{ node.path || fallbackPathLabel(node.name, node.slug, node.id) }}</strong>
                      <span>{{ node.status }}</span>
                    </div>
                    <div class="catalog-subtext">visible={{ node.visible ? 'yes' : 'no' }}, assignable={{ node.assignable ? 'yes' : 'no' }}, level={{ node.level }}</div>
                  </div>
                  @for (descendant of flattenTree(node.children); track descendant.id) {
                    <div class="catalog-tree-node catalog-tree-child" [style.padding-left.rem]="descendant.level + 0.5">
                      <div class="catalog-tree-row">
                        <strong>{{ descendant.path || fallbackPathLabel(descendant.name, descendant.slug, descendant.id) }}</strong>
                        <span>{{ descendant.status }}</span>
                      </div>
                      <div class="catalog-subtext">visible={{ descendant.visible ? 'yes' : 'no' }}, assignable={{ descendant.assignable ? 'yes' : 'no' }}, level={{ descendant.level }}</div>
                    </div>
                  }
                }
              </div>
            } @else {
              <div class="catalog-empty">Chua co category tree.</div>
            }
          </mat-card-content>
        </mat-card>

        <mat-card class="catalog-panel catalog-span-6 category-panel category-deleted-panel">
          <mat-card-content>
            <div class="catalog-panel-header">
              <div>
                <h3>Deleted categories</h3>
                <p>Theo doi category da soft delete de team van con audit duoc taxonomy cu.</p>
              </div>
            </div>

            @if (deletedCategories().length) {
               <div class="catalog-tree category-tree-surface deleted-surface">
                @for (category of deletedCategories(); track category.id) {
                  <div class="catalog-tree-node">
                    <div class="catalog-tree-row">
                      <strong>{{ displayCategoryPath(category) }}</strong>
                      <span>{{ category.status }}</span>
                    </div>
                    <div class="catalog-subtext">code={{ category.code }}, deleted item, visible={{ category.visible ? 'yes' : 'no' }}, assignable={{ category.assignable ? 'yes' : 'no' }}</div>
                  </div>
                }
              </div>
            } @else {
              <div class="catalog-empty">Chua co category nao bi soft delete.</div>
            }
          </mat-card-content>
        </mat-card>
      </section>

      <section class="catalog-grid">
        <mat-card class="catalog-panel catalog-span-12 category-panel category-merge-panel">
          <mat-card-content>
            <div class="catalog-panel-header">
              <div>
                <h3>Merge categories</h3>
                <p>Chon category dich va danh sach category nguon de archive taxonomy trung lap.</p>
              </div>
            </div>

            <div class="catalog-form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Target category</mat-label>
                <mat-select [(ngModel)]="mergeForm.targetCategoryId" [disabled]="!canManageCategories()">
                  <mat-option [value]="null">Chon target</mat-option>
                  @for (category of categories(); track category.id) {
                    <mat-option [value]="category.id">{{ displayCategoryPath(category) }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Source category ids</mat-label>
                <input matInput [(ngModel)]="mergeForm.sourceIdsText" placeholder="12, 15" [disabled]="!canManageCategories()" />
              </mat-form-field>
            </div>

            <div class="catalog-toggle-row">
              <mat-checkbox [(ngModel)]="mergeForm.moveChildren" [disabled]="!canManageCategories()">Move children sang target</mat-checkbox>
              <mat-checkbox [(ngModel)]="mergeForm.deactivateSources" [disabled]="!canManageCategories()">Soft delete source sau merge</mat-checkbox>
            </div>

            <div class="catalog-actions">
              <button mat-flat-button color="primary" type="button" (click)="mergeCategories()" [disabled]="loading() || !canManageCategories()">Merge</button>
            </div>
          </mat-card-content>
        </mat-card>
      </section>
    </section>
  `,
  styles: [`
    .category-page {
      gap: 1.5rem;
    }

    .category-filter-grid,
    .catalog-list-toolbar {
      margin-bottom: 0.75rem;
    }

    .catalog-list-toolbar {
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(12rem, 0.75fr);
      gap: 1rem;
      align-items: start;
    }

    .category-search-field,
    .category-page-size-field {
      width: 100%;
    }

    .category-filter-actions {
      margin-bottom: 0.75rem;
    }

    .category-list-summary {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 0.75rem;
      color: rgba(15, 23, 42, 0.72);
      font-size: 0.92rem;
    }

    .category-pagination {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.75rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .category-tree-surface {
      display: grid;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 1rem;
      background: linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(241, 245, 249, 0.88));
      border: 1px solid rgba(148, 163, 184, 0.22);
    }

    .deleted-surface {
      background: linear-gradient(180deg, rgba(255, 247, 237, 0.92), rgba(255, 241, 242, 0.88));
      border-color: rgba(251, 146, 60, 0.22);
    }

    .catalog-tree-node {
      display: grid;
      gap: 0.35rem;
      padding: 0.9rem 1rem;
      border-radius: 0.9rem;
      background: rgba(255, 255, 255, 0.92);
      border: 1px solid rgba(148, 163, 184, 0.18);
      box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
    }

    .deleted-surface .catalog-tree-node {
      background: rgba(255, 255, 255, 0.7);
    }

    .catalog-tree-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .catalog-tree-row strong {
      overflow-wrap: anywhere;
    }

    .catalog-tree-row span {
      flex-shrink: 0;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      background: rgba(37, 99, 235, 0.1);
      color: rgba(30, 64, 175, 0.95);
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .deleted-surface .catalog-tree-row span {
      background: rgba(234, 88, 12, 0.12);
      color: rgba(154, 52, 18, 0.95);
    }

    .catalog-tree-child {
      position: relative;
    }

    .catalog-tree-child::before {
      content: '';
      position: absolute;
      left: 0.85rem;
      top: 0.8rem;
      bottom: 0.8rem;
      width: 2px;
      border-radius: 999px;
      background: linear-gradient(180deg, rgba(96, 165, 250, 0.55), rgba(59, 130, 246, 0.15));
    }

    @media (max-width: 959px) {
      .catalog-list-toolbar {
        grid-template-columns: 1fr;
      }

      .category-pagination {
        justify-content: flex-start;
      }

      .catalog-tree-row {
        flex-direction: column;
      }

      .catalog-tree-row span {
        align-self: flex-start;
      }
    }
  `],
})
export class CategoriesPage {
  @ViewChild('categoryEditorPanel') private categoryEditorPanel?: ElementRef<HTMLElement>;
  @ViewChild('categoryNameInput') private categoryNameInput?: ElementRef<HTMLInputElement>;

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    this.loadCategories();
  }

  private readonly categoryApi = inject(CategoryApiService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);
  private readonly authStore = inject(AuthStore);

  protected readonly categories = signal<Category[]>([]);
  protected readonly treeNodes = signal<CategoryTreeNode[]>([]);
  protected readonly deletedCategories = signal<Category[]>([]);
  protected readonly loading = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly sortState = signal<{ column: 'name' | 'parent' | 'status' | 'children' | 'visibility' | 'products'; direction: 'asc' | 'desc' }>({
    column: 'name',
    direction: 'asc',
  });
  protected readonly currentPage = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly totalElements = signal(0);
  protected readonly displayedColumns = ['name', 'parent', 'status', 'children', 'visibility', 'products', 'actions'];
  protected tableQuery = '';
  protected pageSize = 10;
  protected readonly filters = {
    keyword: '',
    status: null as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | null,
    visible: null as boolean | null,
    assignable: null as boolean | null,
  };
  protected readonly form = {
    code: '',
    name: '',
    slug: '',
    description: '',
    parentId: null as number | null,
    sortOrder: 0,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
    visible: true,
    assignable: true,
    iconUrl: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  };
  protected readonly mergeForm = {
    targetCategoryId: null as number | null,
    sourceIdsText: '',
    moveChildren: true,
    deactivateSources: true,
  };

  protected canManageCategories(): boolean {
    return hasPermission(this.authStore.permissions(), 'CATEGORY_MANAGE');
  }

  protected loadCategories(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.categoryApi.listPage(this.buildListFilters())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (categories) => {
          this.applyCategoryPage(categories);
          this.loadTree();
          this.loadDeletedCategories();
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
        },
      });
  }

  protected loadTree(): void {
    this.categoryApi.tree().subscribe({
      next: (nodes) => this.treeNodes.set(nodes),
      error: () => this.treeNodes.set([]),
    });
  }

  protected loadDeletedCategories(): void {
    this.categoryApi.deleted().subscribe({
      next: (categories) => this.deletedCategories.set(categories),
      error: () => this.deletedCategories.set([]),
    });
  }

  protected sortedCategories(): Category[] {
    const { column, direction } = this.sortState();
    const factor = direction === 'asc' ? 1 : -1;

    return this.filteredCategories()
      .slice()
      .sort((left, right) => factor * this.compareCategories(left, right, column));
  }

  protected filteredCategories(): Category[] {
    const query = this.tableQuery.trim().toLowerCase();
    if (!query) {
      return this.categories();
    }

    return this.categories().filter((category) => {
      const parentName = category.parentName ?? this.resolveParentName(category.parentId);
      return [
        category.name,
        category.code,
        category.slug,
        category.path,
        parentName,
        category.status,
      ].some((value) => (value ?? '').toLowerCase().includes(query));
    });
  }

  protected filteredCategoryCount(): number {
    return this.filteredCategories().length;
  }

  protected pageRangeLabel(): string {
    const total = this.totalElements();
    if (total === 0) {
      return '0-0';
    }

    const start = (this.currentPage() - 1) * this.pageSize + 1;
    const end = start + this.categories().length - 1;
    return `${start}-${end}`;
  }

  protected toggleSort(column: 'name' | 'parent' | 'status' | 'children' | 'visibility' | 'products'): void {
    const current = this.sortState();
    if (current.column === column) {
      this.sortState.set({
        column,
        direction: current.direction === 'asc' ? 'desc' : 'asc',
      });
      this.loadCategories();
      return;
    }

    this.sortState.set({ column, direction: 'asc' });
    this.loadCategories();
  }

  protected sortIndicator(column: 'name' | 'parent' | 'status' | 'children' | 'visibility' | 'products'): string {
    const current = this.sortState();
    if (current.column !== column) {
      return '';
    }

    return current.direction === 'asc' ? '↑' : '↓';
  }

  protected applyFilters(): void {
    this.currentPage.set(1);
    this.sortState.set({ column: 'name', direction: 'asc' });
    this.loadCategories();
  }

  protected resetFilters(): void {
    this.filters.keyword = '';
    this.filters.status = null;
    this.filters.visible = null;
    this.filters.assignable = null;
    this.tableQuery = '';
    this.currentPage.set(1);
    this.sortState.set({ column: 'name', direction: 'asc' });
    this.loadCategories();
  }

  protected goToPreviousPage(): void {
    const nextPage = Math.max(1, this.currentPage() - 1);
    if (nextPage === this.currentPage()) {
      return;
    }

    this.currentPage.set(nextPage);
    this.loadCategories();
  }

  protected goToNextPage(): void {
    const nextPage = Math.min(this.totalPages(), this.currentPage() + 1);
    if (nextPage === this.currentPage()) {
      return;
    }

    this.currentPage.set(nextPage);
    this.loadCategories();
  }

  protected onPageSizeChange(): void {
    this.currentPage.set(1);
    this.loadCategories();
  }

  protected buildListFilters(): Record<string, QueryParamValue> {
    return {
      keyword: this.filters.keyword.trim() || undefined,
      status: this.filters.status,
      visible: this.filters.visible,
      assignable: this.filters.assignable,
      page: this.currentPage() - 1,
      size: this.pageSize,
      sortBy: this.mapSortColumnToApi(this.sortState().column),
      sortDir: this.sortState().direction,
    };
  }

  protected save(): void {
    if (!this.form.name.trim() || !this.form.code.trim() || !this.form.slug.trim()) {
      this.notifications.error('Code, name va slug la bat buoc.');
      return;
    }

    const editingCategory = this.editingId() === null
      ? null
      : this.categories().find((category) => category.id === this.editingId()) ?? null;

    const request = {
      code: this.form.code.trim().toLowerCase(),
      name: this.form.name.trim(),
      slug: this.form.slug.trim().toLowerCase(),
      description: this.form.description.trim(),
      parentId: this.form.parentId,
      sortOrder: Number(this.form.sortOrder ?? 0),
      status: this.form.status,
      visible: this.form.visible,
      assignable: this.form.assignable,
      iconUrl: this.form.iconUrl.trim() || null,
      seoTitle: this.form.seoTitle.trim() || null,
      seoDescription: this.form.seoDescription.trim() || null,
      seoKeywords: this.form.seoKeywords.trim() || null,
      attributes: editingCategory?.attributes ?? [],
    };

    this.loading.set(true);
    this.errorMessage.set('');

    const action$ = this.editingId()
      ? this.categoryApi.update(this.editingId()!, request)
      : this.categoryApi.create(request);

    action$
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success(this.editingId() ? 'Cap nhat category thanh cong.' : 'Tao category thanh cong.');
          this.resetForm();
          this.loadCategories();
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }

  protected startEdit(category: Category): void {
    this.hydrateCategoryEditor(category.id, category);
  }

  protected availableParents(): Category[] {
    return this.categories()
      .slice()
      .sort((left, right) => this.displayCategoryPath(left).localeCompare(this.displayCategoryPath(right)));
  }

  protected compareCategories(
    left: Category,
    right: Category,
    column: 'name' | 'parent' | 'status' | 'children' | 'visibility' | 'products',
  ): number {
    switch (column) {
      case 'name':
        return this.compareText(this.displayCategoryPath(left), this.displayCategoryPath(right))
          || this.compareText(left.name, right.name);
      case 'parent':
        return this.compareText(left.parentName ?? this.resolveParentName(left.parentId), right.parentName ?? this.resolveParentName(right.parentId));
      case 'status':
        return this.compareText(left.status, right.status);
      case 'children':
        return this.compareNumber(left.childrenCount ?? left.childrenIds.length, right.childrenCount ?? right.childrenIds.length);
      case 'visibility':
        return this.compareText(`${left.visible}-${left.assignable}`, `${right.visible}-${right.assignable}`);
      case 'products':
        return this.compareNumber(left.productCount ?? 0, right.productCount ?? 0);
      default:
        return 0;
    }
  }

  protected compareText(left: string | null | undefined, right: string | null | undefined): number {
    return (left ?? '').localeCompare(right ?? '');
  }

  protected compareNumber(left: number | null | undefined, right: number | null | undefined): number {
    return (left ?? 0) - (right ?? 0);
  }

  protected displayCategoryPath(category: Category): string {
    return category.path || this.fallbackPathLabel(category.name, category.slug, category.id);
  }

  protected fallbackPathLabel(name: string | null | undefined, slug: string | null | undefined, id: number | null | undefined): string {
    const label = name?.trim() || slug?.trim();
    if (label) {
      return label;
    }

    return id ? `#${id}` : 'Unknown category';
  }

  protected flattenTree(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
    const flattened: CategoryTreeNode[] = [];
    for (const node of nodes) {
      flattened.push(node);
      flattened.push(...this.flattenTree(node.children));
    }
    return flattened;
  }

  protected isParentOptionDisabled(category: Category): boolean {
    const editingId = this.editingId();
    if (!editingId) {
      return false;
    }

    if (category.id === editingId) {
      return true;
    }

    return category.ancestorIds.includes(editingId);
  }

  protected moveCategory(): void {
    const editingId = this.editingId();
    if (!editingId) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.categoryApi.move(editingId, { newParentId: this.form.parentId, sortOrder: this.form.sortOrder })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success('Da move category.');
          this.loadCategories();
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }

  protected deactivateCategory(category: Category): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.categoryApi.deactivate(category.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success(`Da deactivate category ${category.name}.`);
          if (this.editingId() === category.id) {
            this.resetForm();
          }
          this.loadCategories();
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }

  protected toggleCategoryStatus(category: Category): void {
    const nextStatus = category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.updateCategoryStatus(category, nextStatus);
  }

  protected archiveCategory(category: Category): void {
    this.updateCategoryStatus(category, 'ARCHIVED');
  }

  protected updateCategoryStatus(category: Category, status: Category['status']): void {
    if (category.status === status) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.categoryApi.updateStatus(category.id, status)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (updatedCategory) => {
          this.replaceCategory(updatedCategory);
          if (this.editingId() === updatedCategory.id) {
            this.startEdit(updatedCategory);
          }
          this.notifications.success(`Da chuyen category ${category.name} sang ${status}.`);
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }

  protected softDeleteCategory(category: Category): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.categoryApi.delete(category.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success(`Da soft delete category ${category.name}.`);
          if (this.editingId() === category.id) {
            this.resetForm();
          }
          this.loadCategories();
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }

  protected promoteCategory(category: Category): void {
    const siblings = this.categories()
      .filter((candidate) => (candidate.parentId ?? null) === (category.parentId ?? null))
      .sort((left, right) => left.sortOrder - right.sortOrder);

    const orders = siblings.map((item, index) => ({
      id: item.id,
      sortOrder: item.id === category.id ? 0 : index + 1,
    }));

    this.loading.set(true);
    this.errorMessage.set('');
    this.categoryApi.reorder({ parentId: category.parentId, orders })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success(`Da reorder category ${category.name}.`);
          this.loadCategories();
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }

  protected mergeCategories(): void {
    const targetCategoryId = this.mergeForm.targetCategoryId;
    const sourceCategoryIds = this.mergeForm.sourceIdsText
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isInteger(value) && value > 0);

    if (!targetCategoryId || sourceCategoryIds.length === 0) {
      this.notifications.error('Can chon target category va it nhat mot source category id.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.categoryApi.merge({
      targetCategoryId,
      sourceCategoryIds,
      moveChildren: this.mergeForm.moveChildren,
      deactivateSources: this.mergeForm.deactivateSources,
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success('Da merge categories.');
          this.mergeForm.sourceIdsText = '';
          this.loadCategories();
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }

  protected resolveParentName(parentId: number | null): string {
    if (!parentId) {
      return 'Root';
    }

    return this.categories().find((category) => category.id === parentId)?.name ?? `#${parentId}`;
  }

  protected rootCategoryCount(): number {
    return this.categories().filter((category) => !category.parentId).length;
  }

  protected resetForm(): void {
    this.editingId.set(null);
    this.form.code = '';
    this.form.name = '';
    this.form.slug = '';
    this.form.description = '';
    this.form.parentId = null;
    this.form.sortOrder = 0;
    this.form.status = 'ACTIVE';
    this.form.visible = true;
    this.form.assignable = true;
    this.form.iconUrl = '';
    this.form.seoTitle = '';
    this.form.seoDescription = '';
    this.form.seoKeywords = '';
  }

  protected selectedCategoryImages(): NonNullable<Category['galleryImages']> {
    const editingId = this.editingId();
    if (editingId === null) {
      return [];
    }

    return (this.categories().find((category) => category.id === editingId)?.galleryImages ?? []).map((image) => ({
      ...image,
      url: this.toMediaUrl(image.url) ?? image.url,
    }));
  }

  protected selectedCategoryThumbnailUrl(): string | null {
    const thumbnail = this.selectedCategoryImages().find((image) => image.thumbnail);
    if (thumbnail) {
      return this.toMediaUrl(thumbnail.url);
    }

    const editingId = this.editingId();
    return editingId === null
      ? null
      : this.toMediaUrl(this.categories().find((category) => category.id === editingId)?.imageUrl ?? null);
  }

  private toMediaUrl(url: string | null | undefined): string | null {
    return resolveMediaUrl(url, this.config.apiBaseUrl);
  }

  protected uploadCategoryImages(event: Event): void {
    const editingId = this.editingId();
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    if (editingId === null || files.length === 0) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.categoryApi.addImages(editingId, files)
      .pipe(finalize(() => {
        this.loading.set(false);
        input.value = '';
      }))
      .subscribe({
        next: (category) => {
          this.syncUpdatedCategory(category);
          this.notifications.success('Upload category images thanh cong.');
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }

  protected setCategoryThumbnail(imageId: number): void {
    const editingId = this.editingId();
    if (editingId === null) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.categoryApi.setThumbnail(editingId, imageId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (category) => {
          this.syncUpdatedCategory(category);
          this.notifications.success('Cap nhat category thumbnail thanh cong.');
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }

  protected deleteCategoryImage(imageId: number): void {
    const editingId = this.editingId();
    if (editingId === null) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.categoryApi.deleteImage(editingId, imageId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (category) => {
          this.syncUpdatedCategory(category);
          this.notifications.success('Xoa category image thanh cong.');
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }

  private replaceCategory(updatedCategory: Category): void {
    this.categories.update((categories) => categories.map((category) => category.id === updatedCategory.id ? updatedCategory : category));
  }

  private syncUpdatedCategory(updatedCategory: Category): void {
    this.replaceCategory(updatedCategory);
    if (this.editingId() === updatedCategory.id) {
      this.hydrateCategoryEditor(updatedCategory.id, updatedCategory, false);
    }
    this.loadTree();
    this.loadDeletedCategories();
  }

  private hydrateCategoryEditor(categoryId: number, fallbackCategory?: Category, scroll = true): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.categoryApi.getById(categoryId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (category) => {
          this.editingId.set(category.id);
          this.replaceCategory(category);
          this.patchFormFromCategory(category);
          if (scroll) {
            this.scrollToEditor();
          }
        },
        error: (error) => {
          if (fallbackCategory) {
            this.editingId.set(fallbackCategory.id);
            this.patchFormFromCategory(fallbackCategory);
            if (scroll) {
              this.scrollToEditor();
            }
          }

          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }

  private patchFormFromCategory(category: Category): void {
    this.form.code = category.code;
    this.form.name = category.name;
    this.form.slug = category.slug;
    this.form.description = category.description ?? '';
    this.form.parentId = category.parentId;
    this.form.sortOrder = category.sortOrder ?? 0;
    this.form.status = category.status;
    this.form.visible = category.visible;
    this.form.assignable = category.assignable;
    this.form.iconUrl = category.iconUrl ?? '';
    this.form.seoTitle = category.seoTitle ?? '';
    this.form.seoDescription = category.seoDescription ?? '';
    this.form.seoKeywords = category.seoKeywords ?? '';
  }

  private applyCategoryPage(page: PagedResult<Category>): void {
    this.categories.set(page.items);
    this.totalElements.set(page.totalElements);
    this.totalPages.set(Math.max(1, page.totalPages));
    this.currentPage.set(page.page + 1);
  }

  private mapSortColumnToApi(column: 'name' | 'parent' | 'status' | 'children' | 'visibility' | 'products'): 'name' | 'status' | 'sortOrder' {
    switch (column) {
      case 'name':
        return 'name';
      case 'status':
        return 'status';
      default:
        return 'sortOrder';
    }
  }

  private scrollToEditor(): void {
    setTimeout(() => {
      this.categoryEditorPanel?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.categoryNameInput?.nativeElement?.focus();
    }, 0);
  }
}
