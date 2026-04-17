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
import { Category } from '../../../core/models/catalog.models';
import { CategoryApiService } from '../../../core/services/category-api.service';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-categories-page',
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
          <h2>Category workspace</h2>
          <p>Quan ly cay danh muc theo quan he parent-child, giu luong tao, sua va xem nhanh trong cung mot man hinh.</p>
        </mat-card-content>
      </mat-card>

      <section class="catalog-stats">
        <mat-card class="catalog-stat-card">
          <mat-card-content>
            <p class="catalog-stat-label">Tong categories</p>
            <p class="catalog-stat-value">{{ categories().length }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="catalog-stat-card">
          <mat-card-content>
            <p class="catalog-stat-label">Dang sua</p>
            <p class="catalog-stat-value">{{ editingId() ? 1 : 0 }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="catalog-stat-card">
          <mat-card-content>
            <p class="catalog-stat-label">Root categories</p>
            <p class="catalog-stat-value">{{ rootCategoryCount() }}</p>
          </mat-card-content>
        </mat-card>
      </section>

      <section class="catalog-grid">
        <mat-card class="catalog-panel catalog-span-4">
          <mat-card-content>
            @if (loading()) {
              <mat-progress-bar class="catalog-progress" mode="indeterminate"></mat-progress-bar>
            }

            <div class="catalog-panel-header">
              <div>
                <h3>{{ editingId() ? 'Cap nhat category' : 'Tao category moi' }}</h3>
                <p>Nhap thong tin co ban va chon category cha neu can.</p>
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
                <input matInput [(ngModel)]="form.name" placeholder="Laptop" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Parent</mat-label>
                <mat-select [(ngModel)]="form.parentId">
                  <mat-option [value]="null">Root category</mat-option>
                  @for (category of categories(); track category.id) {
                    <mat-option [value]="category.id">{{ category.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Description</mat-label>
              <textarea matInput [(ngModel)]="form.description" rows="4" placeholder="Mo ta cho category"></textarea>
            </mat-form-field>

            <div class="catalog-actions">
              <button mat-flat-button color="primary" type="button" (click)="save()" [disabled]="loading()">
                {{ editingId() ? 'Luu cap nhat' : 'Tao category' }}
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="catalog-panel catalog-span-8">
          <mat-card-content>
            @if (loading()) {
              <mat-progress-bar class="catalog-progress" mode="indeterminate"></mat-progress-bar>
            }

            <div class="catalog-panel-header">
              <div>
                <h3>Danh sach categories</h3>
                <p>Theo doi slug, cap cha va so luong children ngay tren bang.</p>
              </div>

              <button mat-stroked-button type="button" (click)="loadCategories()" [disabled]="loading()">Tai lai</button>
            </div>

            @if (categories().length) {
              <table mat-table [dataSource]="categories()" class="catalog-table">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let category">
                    <div>
                      <strong>{{ category.name }}</strong>
                      <div class="catalog-inline-meta">
                        <mat-chip class="catalog-chip-neutral">#{{ category.id }}</mat-chip>
                        <mat-chip class="catalog-chip-soft">{{ category.slug }}</mat-chip>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="parent">
                  <th mat-header-cell *matHeaderCellDef>Parent</th>
                  <td mat-cell *matCellDef="let category">{{ resolveParentName(category.parentId) }}</td>
                </ng-container>

                <ng-container matColumnDef="children">
                  <th mat-header-cell *matHeaderCellDef>Children</th>
                  <td mat-cell *matCellDef="let category">{{ category.childrenIds.length }}</td>
                </ng-container>

                <ng-container matColumnDef="attributes">
                  <th mat-header-cell *matHeaderCellDef>Attributes</th>
                  <td mat-cell *matCellDef="let category">{{ category.attributes.length }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Action</th>
                  <td mat-cell *matCellDef="let category">
                    <div class="catalog-actions">
                      <button mat-stroked-button type="button" (click)="startEdit(category)">Sua</button>
                      <button mat-flat-button color="warn" type="button" (click)="deleteCategory(category)" [disabled]="loading()">Xoa</button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            } @else {
              <div class="catalog-empty">Chua co category nao.</div>
            }
          </mat-card-content>
        </mat-card>
      </section>
    </section>
  `,
  styles: [],
})
export class CategoriesPage {
  private readonly categoryApi = inject(CategoryApiService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly errorMessage = signal('');
  protected readonly displayedColumns = ['name', 'parent', 'children', 'attributes', 'actions'];
  protected readonly form = {
    name: '',
    description: '',
    parentId: null as number | null,
  };

  constructor() {
    this.loadCategories();
  }

  protected loadCategories(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.categoryApi.list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (categories) => this.categories.set(categories),
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

    const request = {
      name: this.form.name.trim(),
      description: this.form.description.trim(),
      parentId: this.form.parentId,
      attributes: [],
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
    this.editingId.set(category.id);
    this.form.name = category.name;
    this.form.description = category.description ?? '';
    this.form.parentId = category.parentId;
  }

  protected deleteCategory(category: Category): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.categoryApi.delete(category.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success(`Da xoa category ${category.name}.`);
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
    this.form.name = '';
    this.form.description = '';
    this.form.parentId = null;
  }
}
