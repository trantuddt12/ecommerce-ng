import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, QueryList, ViewChild, ViewChildren, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { finalize } from 'rxjs';
import { AppConfig } from '../../../core/config/app-config.model';
import { Brand } from '../../../core/models/catalog.models';
import { BrandApiService } from '../../../core/services/brand-api.service';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';
import { APP_CONFIG } from '../../../core/tokens/app-config.token';
import { resolveMediaUrl } from '../../../core/utils/media-url.util';

@Component({
  selector: 'app-brands-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatTableModule,
  ],
  template: `
    <section class="catalog-page">
      <mat-card class="catalog-hero brand-hero reveal-block reveal-block-1">
        <mat-card-content>
          <p class="catalog-eyebrow">Catalog</p>
          <h2>Brand workspace</h2>
          <p>Dong bo voi API brand hien co, gom form CRUD va bang theo doi trong cung mot bo cuc Material.</p>
        </mat-card-content>
      </mat-card>

      <section class="catalog-stats">
        <mat-card class="catalog-stat-card brand-stat-card reveal-block reveal-block-2"><mat-card-content><p class="catalog-stat-label">Tong brands</p><p class="catalog-stat-value">{{ brands().length }}</p></mat-card-content></mat-card>
        <mat-card class="catalog-stat-card brand-stat-card reveal-block reveal-block-3"><mat-card-content><p class="catalog-stat-label">Dang sua</p><p class="catalog-stat-value">{{ editingId() ? 1 : 0 }}</p></mat-card-content></mat-card>
        <mat-card class="catalog-stat-card brand-stat-card reveal-block reveal-block-4"><mat-card-content><p class="catalog-stat-label">Generic brands</p><p class="catalog-stat-value">{{ genericBrandCount() }}</p></mat-card-content></mat-card>
      </section>

      <section class="catalog-grid">
        <mat-card #editorPanel class="catalog-panel catalog-span-4 brand-panel reveal-block reveal-block-5">
          <mat-card-content>
            @if (loading()) { <mat-progress-bar class="catalog-progress" mode="indeterminate"></mat-progress-bar> }
            <div class="catalog-panel-header">
              <div>
                <h3>{{ editingId() ? 'Cap nhat brand' : 'Tao brand moi' }}</h3>
                <p>Quan ly name, slug va generic flag.</p>
              </div>
              @if (editingId()) {
                <button mat-stroked-button type="button" (click)="resetForm()">Huy sua</button>
              }
            </div>

            @if (errorMessage()) {
              <div class="catalog-error">{{ errorMessage() }}</div>
            }

            <div class="catalog-form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Name</mat-label>
                <input #nameInput matInput [(ngModel)]="form.name" placeholder="Apple" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Slug</mat-label>
                <input matInput [(ngModel)]="form.slug" placeholder="apple" [disabled]="editingId() !== null" />
              </mat-form-field>
            </div>

            <mat-checkbox [(ngModel)]="form.generic">Generic brand</mat-checkbox>

            <mat-form-field appearance="outline">
              <mat-label>Description</mat-label>
              <textarea matInput [(ngModel)]="form.description" rows="4" placeholder="Mo ta ngan cho brand"></textarea>
            </mat-form-field>

            <div class="catalog-actions">
              <button mat-flat-button color="primary" type="button" (click)="save()" [disabled]="loading()">{{ editingId() ? 'Luu cap nhat' : 'Tao brand' }}</button>
            </div>

            @if (editingId()) {
              <div class="catalog-subsection">
                <div class="catalog-panel-header">
                  <div>
                    <h3>Brand images</h3>
                    <p>Quan ly gallery sau khi brand da ton tai, giong flow image cua product va category.</p>
                  </div>
                </div>

                @if (selectedBrandImageUrl()) {
                  <div class="brand-image-preview">
                    <img [src]="selectedBrandImageUrl()!" [alt]="form.name || 'Brand image'" />
                  </div>
                } @else {
                  <div class="catalog-empty">Brand nay chua co anh dai dien.</div>
                }

                <div class="catalog-actions brand-image-actions">
                  <input #imageInput type="file" multiple accept="image/*" (change)="uploadImage($event)" [disabled]="loading()" />
                  <button mat-stroked-button color="warn" type="button" (click)="removeImage()" [disabled]="loading() || !selectedBrandImages().length">
                    Xoa tat ca
                  </button>
                </div>

                @if (selectedBrandImages().length) {
                  <div class="product-image-grid">
                    @for (image of selectedBrandImages(); track image.id) {
                      <mat-card #brandImageCard class="product-image-card brand-image-card" [class.brand-image-card-new]="isRecentlyUploadedImage(image.id)" tabindex="-1">
                        <mat-card-content>
                          <div class="product-image-preview" [style.background-image]="'url(' + image.url + ')'">
                            @if (image.thumbnail) {
                              <mat-chip class="catalog-chip-soft product-image-chip">thumbnail</mat-chip>
                            }
                            @if (isRecentlyUploadedImage(image.id)) {
                              <mat-chip class="brand-image-new-chip">new</mat-chip>
                            }
                          </div>
                          <div class="catalog-actions">
                            <button mat-stroked-button type="button" (click)="setBrandThumbnail(image.id)" [disabled]="loading() || image.thumbnail">Set thumbnail</button>
                            <button mat-stroked-button color="warn" type="button" (click)="deleteBrandImage(image.id)" [disabled]="loading()">Xoa</button>
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

        <mat-card class="catalog-panel catalog-span-8 brand-panel reveal-block reveal-block-6">
          <mat-card-content>
            @if (loading()) { <mat-progress-bar class="catalog-progress" mode="indeterminate"></mat-progress-bar> }
            <div class="catalog-panel-header">
              <div>
                <h3>Danh sach brands</h3>
                <p>Theo doi slug, generic flag va cap nhat nhanh.</p>
              </div>
              <button mat-stroked-button type="button" (click)="loadBrands()" [disabled]="loading()">Tai lai</button>
            </div>

            <div class="catalog-form-grid brand-search-grid">
              <mat-form-field appearance="outline">
                <mat-label>Search brands</mat-label>
                <input matInput [(ngModel)]="brandQuery" placeholder="Tim theo name, slug, description" />
              </mat-form-field>
            </div>

            @if (sortedBrands().length) {
              <table mat-table [dataSource]="sortedBrands()" class="catalog-table">
                <ng-container matColumnDef="image">
                  <th mat-header-cell *matHeaderCellDef>Image</th>
                  <td mat-cell *matCellDef="let brand">
                    @if (brandThumbnailUrl(brand)) {
                      <img class="brand-table-image" [src]="brandThumbnailUrl(brand)!" [alt]="brand.name" />
                    } @else {
                      <span class="catalog-muted">-</span>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>
                    <button class="catalog-sort-button" type="button" (click)="toggleSort('name')">
                      Brand {{ sortIndicator('name') }}
                    </button>
                  </th>
                  <td mat-cell *matCellDef="let brand">
                    <div>
                      <strong>{{ brand.name }}</strong>
                      <div class="catalog-inline-meta">
                        <mat-chip class="catalog-chip-neutral">#{{ brand.id }}</mat-chip>
                        <mat-chip class="catalog-chip-soft">{{ brand.slug }}</mat-chip>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="generic">
                  <th mat-header-cell *matHeaderCellDef>
                    <button class="catalog-sort-button" type="button" (click)="toggleSort('generic')">
                      Generic {{ sortIndicator('generic') }}
                    </button>
                  </th>
                  <td mat-cell *matCellDef="let brand">
                    <mat-chip [class.catalog-chip-success]="brand.generic" [class.catalog-chip-neutral]="!brand.generic">{{ brand.generic ? 'Yes' : 'No' }}</mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>
                    <button class="catalog-sort-button" type="button" (click)="toggleSort('description')">
                      Description {{ sortIndicator('description') }}
                    </button>
                  </th>
                  <td mat-cell *matCellDef="let brand">{{ brand.description || '-' }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Action</th>
                  <td mat-cell *matCellDef="let brand">
                    <div class="catalog-actions">
                      <button mat-stroked-button type="button" (click)="startEdit(brand)">Sua</button>
                      <button mat-flat-button color="warn" type="button" (click)="deleteBrand(brand)" [disabled]="loading()">Xoa</button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            } @else {
              <div class="catalog-empty">{{ brandQuery.trim() ? 'Khong tim thay brand phu hop.' : 'Chua co brand nao.' }}</div>
            }
          </mat-card-content>
        </mat-card>
      </section>
    </section>
  `,
  styles: [`
    .brand-hero {
      position: relative;
      overflow: hidden;
      background:
        radial-gradient(circle at top right, rgba(96, 165, 250, 0.22), transparent 34%),
        linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(29, 78, 216, 0.94) 52%, rgba(56, 189, 248, 0.88) 100%);
    }

    .brand-hero::after {
      content: '';
      position: absolute;
      inset: auto -12% -42% auto;
      width: 18rem;
      height: 18rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      filter: blur(8px);
      pointer-events: none;
    }

    .brand-stat-card,
    .brand-panel,
    .brand-image-card {
      transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
    }

    .brand-search-grid {
      margin-bottom: 0.35rem;
    }

    .brand-image-preview {
      display: grid;
      place-items: center;
      min-height: 13rem;
      max-height: 18rem;
      padding: 0.85rem;
      overflow: hidden;
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 1rem;
      background: rgba(248, 250, 252, 0.96);
    }

    .brand-image-preview img {
      width: 100%;
      max-width: 100%;
      max-height: 16rem;
      object-fit: contain;
      object-position: center;
      display: block;
    }

    .brand-table-image {
      width: 4rem;
      height: 4rem;
      max-width: 4rem;
      max-height: 4rem;
      object-fit: contain;
      object-position: center;
      display: block;
      overflow: hidden;
      border-radius: 0.85rem;
      padding: 0.35rem;
      background: rgba(248, 250, 252, 0.96);
      border: 1px solid rgba(148, 163, 184, 0.18);
      box-sizing: border-box;
    }

    .brand-stat-card:hover,
    .brand-panel:hover {
      transform: translateY(-3px);
      box-shadow: 0 18px 38px rgba(15, 23, 42, 0.12);
    }

    .brand-image-card {
      position: relative;
      border: 1px solid rgba(148, 163, 184, 0.18);
      outline: none;
    }

    .brand-image-card:focus {
      transform: translateY(-2px) scale(1.01);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.16), 0 18px 38px rgba(37, 99, 235, 0.16);
    }

    .brand-image-card-new {
      animation: brand-card-flash 2.6s ease-out;
      border-color: rgba(96, 165, 250, 0.55);
      box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.22), 0 18px 40px rgba(56, 189, 248, 0.18);
    }

    .brand-image-new-chip {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      background: linear-gradient(135deg, #38bdf8, #2563eb);
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.67rem;
      font-weight: 700;
      animation: brand-chip-pop 2.2s ease-out;
    }

    .reveal-block {
      opacity: 0;
      transform: translateY(14px);
      animation: brand-page-reveal 520ms ease forwards;
    }

    .reveal-block-1 { animation-delay: 40ms; }
    .reveal-block-2 { animation-delay: 90ms; }
    .reveal-block-3 { animation-delay: 140ms; }
    .reveal-block-4 { animation-delay: 190ms; }
    .reveal-block-5 { animation-delay: 240ms; }
    .reveal-block-6 { animation-delay: 290ms; }

    @keyframes brand-page-reveal {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes brand-card-flash {
      0% {
        transform: translateY(10px) scale(0.985);
        box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.35);
      }
      25% {
        transform: translateY(-2px) scale(1.012);
        box-shadow: 0 0 0 8px rgba(56, 189, 248, 0.16), 0 20px 44px rgba(37, 99, 235, 0.18);
      }
      100% {
        transform: translateY(0) scale(1);
        box-shadow: 0 0 0 0 rgba(56, 189, 248, 0);
      }
    }

    @keyframes brand-chip-pop {
      0% {
        opacity: 0;
        transform: translateY(-6px) scale(0.9);
      }
      18% {
        opacity: 1;
        transform: translateY(0) scale(1.04);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `],
})
export class BrandsPage {
  private readonly brandApi = inject(BrandApiService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);

  @ViewChild('editorPanel') private editorPanel?: ElementRef<HTMLElement>;
  @ViewChild('nameInput') private nameInput?: ElementRef<HTMLInputElement>;
  @ViewChild('imageInput') private imageInput?: ElementRef<HTMLInputElement>;
  @ViewChildren('brandImageCard') private brandImageCards?: QueryList<ElementRef<HTMLElement>>;

  protected readonly brands = signal<Brand[]>([]);
  protected readonly loading = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly recentlyUploadedImageId = signal<number | null>(null);
  protected readonly sortState = signal<{ column: 'name' | 'generic' | 'description'; direction: 'asc' | 'desc' }>({
    column: 'name',
    direction: 'asc',
  });
  protected readonly displayedColumns = ['image', 'name', 'generic', 'description', 'actions'];
  protected brandQuery = '';
  protected readonly form = {
    name: '',
    slug: '',
    description: '',
    generic: false,
  };

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    this.loadBrands();
  }

  protected loadBrands(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.brandApi.list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (brands) => {
          this.brands.set(brands);
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
        },
      });
  }

  protected save(): void {
    if (!this.form.name.trim()) {
      this.notifications.error('Name la bat buoc.');
      return;
    }

    if (!this.editingId() && !this.form.slug.trim()) {
      this.notifications.error('Slug la bat buoc khi tao brand.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const request = {
      name: this.form.name.trim(),
      description: this.form.description.trim(),
      generic: this.form.generic,
    };

    const action$ = this.editingId()
      ? this.brandApi.update(this.editingId()!, request)
      : this.brandApi.create({ ...request, slug: this.form.slug.trim() });

    action$
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (brand) => {
          const wasEditing = this.editingId() !== null;
          this.replaceOrAppendBrand(brand);

          if (wasEditing) {
            this.notifications.success('Cap nhat brand thanh cong.');
            this.startEdit(brand);
            return;
          }

          this.startEdit(brand);
          this.notifications.success('Tao brand thanh cong. Hay chon image cho brand vua tao.');
          this.focusImageUpload();
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }

  protected startEdit(brand: Brand): void {
    this.editingId.set(brand.id);
    this.form.name = brand.name;
    this.form.slug = brand.slug;
    this.form.description = brand.description ?? '';
    this.form.generic = brand.generic;
    this.scrollToEditor();
  }

  protected deleteBrand(brand: Brand): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.brandApi.delete(brand.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success(`Da xoa brand ${brand.name}.`);
          if (this.editingId() === brand.id) {
            this.resetForm();
          }
          this.loadBrands();
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }

  protected resetForm(): void {
    this.editingId.set(null);
    this.form.name = '';
    this.form.slug = '';
    this.form.description = '';
    this.form.generic = false;
  }

  protected genericBrandCount(): number {
    return this.brands().filter((brand) => brand.generic).length;
  }

  protected filteredBrands(): Brand[] {
    const query = this.brandQuery.trim().toLowerCase();
    if (!query) {
      return this.brands();
    }

    return this.brands().filter((brand) =>
      brand.name.toLowerCase().includes(query)
      || brand.slug.toLowerCase().includes(query)
      || (brand.description ?? '').toLowerCase().includes(query),
    );
  }

  protected sortedBrands(): Brand[] {
    const { column, direction } = this.sortState();
    const factor = direction === 'asc' ? 1 : -1;

    return this.filteredBrands()
      .slice()
      .sort((left, right) => factor * this.compareBrands(left, right, column));
  }

  protected toggleSort(column: 'name' | 'generic' | 'description'): void {
    const current = this.sortState();
    if (current.column === column) {
      this.sortState.set({
        column,
        direction: current.direction === 'asc' ? 'desc' : 'asc',
      });
      return;
    }

    this.sortState.set({ column, direction: 'asc' });
  }

  protected sortIndicator(column: 'name' | 'generic' | 'description'): string {
    const current = this.sortState();
    if (current.column !== column) {
      return '';
    }

    return current.direction === 'asc' ? '↑' : '↓';
  }

  private compareBrands(left: Brand, right: Brand, column: 'name' | 'generic' | 'description'): number {
    switch (column) {
      case 'name':
        return this.compareBrandText(left.name, right.name) || this.compareBrandText(left.slug, right.slug);
      case 'generic':
        return Number(left.generic) - Number(right.generic) || this.compareBrandText(left.name, right.name);
      case 'description':
        return this.compareBrandText(left.description, right.description) || this.compareBrandText(left.name, right.name);
      default:
        return 0;
    }
  }

  private compareBrandText(left: string | null | undefined, right: string | null | undefined): number {
    return (left ?? '').localeCompare(right ?? '');
  }

  protected selectedBrandImageUrl(): string | null {
    const editingId = this.editingId();
    if (editingId === null) {
      return null;
    }

    const brand = this.brands().find((currentBrand) => currentBrand.id === editingId);
    return brand ? this.brandThumbnailUrl(brand) : null;
  }

  protected brandThumbnailUrl(brand: Brand): string | null {
    const thumbnail = brand.galleryImages?.find((image) => image.thumbnail) ?? brand.galleryImages?.[0];
    if (thumbnail) {
      return this.toMediaUrl(thumbnail.url);
    }

    return this.toMediaUrl(brand.imageUrl ?? null);
  }

  protected selectedBrandImages(): NonNullable<Brand['galleryImages']> {
    const editingId = this.editingId();
    if (editingId === null) {
      return [];
    }

    return (this.brands().find((brand) => brand.id === editingId)?.galleryImages ?? []).map((image) => ({
      ...image,
      url: this.toMediaUrl(image.url) ?? image.url,
    }));
  }

  protected uploadImage(event: Event): void {
    const editingId = this.editingId();
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const hadImages = this.selectedBrandImages().length > 0;

    if (editingId === null || files.length === 0) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.brandApi.addImages(editingId, files)
      .pipe(finalize(() => {
        this.loading.set(false);
        input.value = '';
      }))
      .subscribe({
        next: (brand) => {
          const previousImageIds = new Set(this.selectedBrandImages().map((image) => image.id));
          this.replaceBrand(brand);
          this.notifications.success('Upload brand images thanh cong.');
          const newImageId = brand.galleryImages?.find((image) => !previousImageIds.has(image.id))?.id ?? null;
          this.markRecentlyUploadedImage(newImageId);
          if (!hadImages && brand.galleryImages?.length) {
            this.focusFirstBrandImageCard();
          }
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }

  protected removeImage(): void {
    const editingId = this.editingId();
    if (editingId === null) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.brandApi.removeImage(editingId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (brand) => {
          this.replaceBrand(brand);
          this.notifications.success('Da xoa anh brand.');
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }

  protected setBrandThumbnail(imageId: number): void {
    const editingId = this.editingId();
    if (editingId === null) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.brandApi.setThumbnail(editingId, imageId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (brand) => {
          this.replaceBrand(brand);
          this.notifications.success('Cap nhat brand thumbnail thanh cong.');
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }

  protected deleteBrandImage(imageId: number): void {
    const editingId = this.editingId();
    if (editingId === null) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.brandApi.deleteImage(editingId, imageId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (brand) => {
          this.replaceBrand(brand);
          this.notifications.success('Xoa brand image thanh cong.');
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }

  private replaceOrAppendBrand(updatedBrand: Brand): void {
    this.brands.update((brands) => {
      if (!brands.some((brand) => brand.id === updatedBrand.id)) {
        return [updatedBrand, ...brands];
      }

      return brands.map((brand) => brand.id === updatedBrand.id ? updatedBrand : brand);
    });
  }

  private focusImageUpload(): void {
    setTimeout(() => {
      const input = this.imageInput?.nativeElement;
      if (!input) {
        return;
      }

      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.click();
    }, 0);
  }

  private scrollToEditor(): void {
    setTimeout(() => {
      this.editorPanel?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.nameInput?.nativeElement.focus();
    }, 0);
  }

  private focusFirstBrandImageCard(): void {
    setTimeout(() => {
      const card = this.brandImageCards?.first?.nativeElement;
      if (!card) {
        return;
      }

      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.focus();
    }, 0);
  }

  protected toMediaUrl(url: string | null | undefined): string | null {
    return resolveMediaUrl(url, this.config.apiBaseUrl);
  }

  protected isRecentlyUploadedImage(imageId: number): boolean {
    return this.recentlyUploadedImageId() === imageId;
  }

  private replaceBrand(updatedBrand: Brand): void {
    this.replaceOrAppendBrand(updatedBrand);
  }

  private markRecentlyUploadedImage(imageId: number | null): void {
    this.recentlyUploadedImageId.set(imageId);
    if (imageId === null) {
      return;
    }

    setTimeout(() => {
      if (this.recentlyUploadedImageId() === imageId) {
        this.recentlyUploadedImageId.set(null);
      }
    }, 2600);
  }
}
