import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, tap } from 'rxjs';
import { Brand } from '../../../core/models/catalog.models';
import { BrandApiService } from '../../../core/services/brand-api.service';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-brands-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <header class="hero">
        <p class="eyebrow">Catalog</p>
        <h2>Brand CRUD</h2>
        <p>Dong bo voi GET/POST /brands va PATCH /brands/update/:id theo contract basecommerce.</p>
      </header>

      <section class="panel form-panel">
        <div class="section-header">
          <h3>{{ editingId() ? 'Cap nhat brand' : 'Tao brand moi' }}</h3>
          @if (editingId()) {
            <button type="button" class="secondary" (click)="resetForm()">Huy sua</button>
          }
        </div>

        <div class="field-grid">
          <label>
            <span>Name</span>
            <input [(ngModel)]="form.name" placeholder="Apple" />
          </label>

          <label>
            <span>Slug</span>
            <input [(ngModel)]="form.slug" placeholder="apple" [disabled]="editingId() !== null" />
          </label>

          <label class="checkbox-field">
            <span>Generic</span>
            <input type="checkbox" [(ngModel)]="form.generic" />
          </label>
        </div>

        <label>
          <span>Description</span>
          <textarea [(ngModel)]="form.description" rows="3" placeholder="Mo ta ngan cho brand"></textarea>
        </label>

        <div class="actions">
          <button type="button" (click)="save()" [disabled]="loading()">{{ editingId() ? 'Luu cap nhat' : 'Tao brand' }}</button>
        </div>
      </section>

      <section class="panel table-panel">
        <div class="section-header">
          <h3>Danh sach brands</h3>
          <button type="button" class="secondary" (click)="loadBrands()" [disabled]="loading()">Tai lai</button>
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
                <th>Generic</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (brand of brands(); track brand.id) {
                <tr>
                  <td>{{ brand.id }}</td>
                  <td>{{ brand.name }}</td>
                  <td>{{ brand.slug }}</td>
                  <td>{{ brand.generic ? 'Yes' : 'No' }}</td>
                  <td>{{ brand.description || '-' }}</td>
                  <td class="row-actions">
                    <button type="button" class="secondary" (click)="startEdit(brand)">Sua</button>
                    <button type="button" class="danger" (click)="deleteBrand(brand)" [disabled]="loading()">Xoa</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="empty-state">Chua co brand nao.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `,
  styles: [`
    .page-shell {
      display: grid;
      gap: 1rem;
    }

    .hero,
    .panel {
      border-radius: 1.25rem;
      background: #fff;
      border: 1px solid rgba(148, 163, 184, 0.18);
      padding: 1.5rem;
    }

    .hero {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      color: #fff;
    }

    .eyebrow,
    label span,
    th {
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 0.75rem;
    }

    .eyebrow {
      margin: 0;
      color: #bfdbfe;
    }

    .field-grid {
      display: grid;
      grid-template-columns: 2fr 2fr 1fr;
      gap: 1rem;
      align-items: end;
    }

    label {
      display: grid;
      gap: 0.5rem;
      font-weight: 600;
      color: #0f172a;
    }

    .checkbox-field {
      align-self: center;
    }

    input,
    textarea,
    button {
      border-radius: 0.85rem;
      border: 1px solid rgba(148, 163, 184, 0.35);
      padding: 0.75rem 0.9rem;
      font: inherit;
    }

    textarea {
      resize: vertical;
    }

    button {
      cursor: pointer;
      background: #1d4ed8;
      color: #fff;
      font-weight: 700;
    }

    button.secondary {
      background: #fff;
      color: #1d4ed8;
    }

    button.danger {
      background: #b91c1c;
    }

    button:disabled {
      cursor: wait;
      opacity: 0.7;
    }

    .actions,
    .section-header,
    .row-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .section-header {
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th,
    td {
      text-align: left;
      padding: 0.85rem 0.75rem;
      border-bottom: 1px solid rgba(226, 232, 240, 0.9);
    }

    td {
      color: #0f172a;
    }

    .empty-state,
    .error-message {
      color: #b91c1c;
    }

    @media (max-width: 960px) {
      .field-grid {
        grid-template-columns: 1fr;
      }

      .section-header,
      .row-actions,
      .actions {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `],
})
export class BrandsPage {
  private readonly brandApi = inject(BrandApiService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);

  protected readonly brands = signal<Brand[]>([]);
  protected readonly loading = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected readonly errorMessage = signal('');
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
      .pipe(
        tap((res) => { 
          debugger; 
          console.log('Fetched brands:', res);
        }),
        finalize(() => this.loading.set(false))
      )
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
}
