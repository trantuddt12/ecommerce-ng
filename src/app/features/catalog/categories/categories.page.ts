import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Category } from '../../../core/models/catalog.models';
import { CategoryApiService } from '../../../core/services/category-api.service';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <header class="hero">
        <p class="eyebrow">Catalog</p>
        <h2>Category CRUD</h2>
        <p>Trien khai danh muc theo contract list full, parent-child va nested category attributes tu basecommerce.</p>
      </header>

      <section class="panel form-panel">
        <div class="section-header">
          <h3>{{ editingId() ? 'Cap nhat category' : 'Tao category moi' }}</h3>
          @if (editingId()) {
            <button type="button" class="secondary" (click)="resetForm()">Huy sua</button>
          }
        </div>

        <div class="field-grid">
          <label>
            <span>Name</span>
            <input [(ngModel)]="form.name" placeholder="Laptop" />
          </label>

          <label>
            <span>Parent</span>
            <select [(ngModel)]="form.parentId">
              <option [ngValue]="null">Root category</option>
              @for (category of categories(); track category.id) {
                <option [ngValue]="category.id">{{ category.name }}</option>
              }
            </select>
          </label>
        </div>

        <label>
          <span>Description</span>
          <textarea [(ngModel)]="form.description" rows="3" placeholder="Mo ta cho category"></textarea>
        </label>

        <div class="actions">
          <button type="button" (click)="save()" [disabled]="loading()">{{ editingId() ? 'Luu cap nhat' : 'Tao category' }}</button>
        </div>
      </section>

      <section class="panel table-panel">
        <div class="section-header">
          <h3>Danh sach categories</h3>
          <button type="button" class="secondary" (click)="loadCategories()" [disabled]="loading()">Tai lai</button>
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
                <th>Slug</th>
                <th>Parent</th>
                <th>Children</th>
                <th>Attributes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (category of categories(); track category.id) {
                <tr>
                  <td>{{ category.id }}</td>
                  <td>{{ category.name }}</td>
                  <td>{{ category.slug }}</td>
                  <td>{{ resolveParentName(category.parentId) }}</td>
                  <td>{{ category.childrenIds.length }}</td>
                  <td>{{ category.attributes.length }}</td>
                  <td class="row-actions">
                    <button type="button" class="secondary" (click)="startEdit(category)">Sua</button>
                    <button type="button" class="danger" (click)="deleteCategory(category)" [disabled]="loading()">Xoa</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="empty-state">Chua co category nao.</td>
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
export class CategoriesPage {
  private readonly categoryApi = inject(CategoryApiService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly errorMessage = signal('');
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

  protected resetForm(): void {
    this.editingId.set(null);
    this.form.name = '';
    this.form.description = '';
    this.form.parentId = null;
  }
}
