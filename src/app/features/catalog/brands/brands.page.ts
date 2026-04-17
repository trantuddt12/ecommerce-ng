import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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
import { Brand } from '../../../core/models/catalog.models';
import { BrandApiService } from '../../../core/services/brand-api.service';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';

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
      <mat-card class="catalog-hero">
        <mat-card-content>
          <p class="catalog-eyebrow">Catalog</p>
          <h2>Brand workspace</h2>
          <p>Dong bo voi API brand hien co, gom form CRUD va bang theo doi trong cung mot bo cuc Material.</p>
        </mat-card-content>
      </mat-card>

      <section class="catalog-stats">
        <mat-card class="catalog-stat-card"><mat-card-content><p class="catalog-stat-label">Tong brands</p><p class="catalog-stat-value">{{ brands().length }}</p></mat-card-content></mat-card>
        <mat-card class="catalog-stat-card"><mat-card-content><p class="catalog-stat-label">Dang sua</p><p class="catalog-stat-value">{{ editingId() ? 1 : 0 }}</p></mat-card-content></mat-card>
        <mat-card class="catalog-stat-card"><mat-card-content><p class="catalog-stat-label">Generic brands</p><p class="catalog-stat-value">{{ genericBrandCount() }}</p></mat-card-content></mat-card>
      </section>

      <section class="catalog-grid">
        <mat-card class="catalog-panel catalog-span-4">
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
                <input matInput [(ngModel)]="form.name" placeholder="Apple" />
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
          </mat-card-content>
        </mat-card>

        <mat-card class="catalog-panel catalog-span-8">
          <mat-card-content>
            @if (loading()) { <mat-progress-bar class="catalog-progress" mode="indeterminate"></mat-progress-bar> }
            <div class="catalog-panel-header">
              <div>
                <h3>Danh sach brands</h3>
                <p>Theo doi slug, generic flag va cap nhat nhanh.</p>
              </div>
              <button mat-stroked-button type="button" (click)="loadBrands()" [disabled]="loading()">Tai lai</button>
            </div>

            @if (brands().length) {
              <table mat-table [dataSource]="brands()" class="catalog-table">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Brand</th>
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
                  <th mat-header-cell *matHeaderCellDef>Generic</th>
                  <td mat-cell *matCellDef="let brand">
                    <mat-chip [class.catalog-chip-success]="brand.generic" [class.catalog-chip-neutral]="!brand.generic">{{ brand.generic ? 'Yes' : 'No' }}</mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Description</th>
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
              <div class="catalog-empty">Chua co brand nao.</div>
            }
          </mat-card-content>
        </mat-card>
      </section>
    </section>
  `,
  styles: [],
})
export class BrandsPage {
  private readonly brandApi = inject(BrandApiService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);

  protected readonly brands = signal<Brand[]>([]);
  protected readonly loading = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly displayedColumns = ['name', 'generic', 'description', 'actions'];
  protected readonly form = {
    name: '',
    slug: '',
    description: '',
    generic: false,
  };

  constructor() {
    this.loadBrands();
  }

  protected loadBrands(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.brandApi.list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (brands) => this.brands.set(brands),
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
        next: () => {
          this.notifications.success(this.editingId() ? 'Cap nhat brand thanh cong.' : 'Tao brand thanh cong.');
          this.resetForm();
          this.loadBrands();
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
}
