import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs';
import {
  AttributeDefinition,
  AttributeValue,
  Category,
  CategoryAttribute,
} from '../../../core/models/catalog.models';
import { AttributeApiService } from '../../../core/services/attribute-api.service';
import { CategoryApiService } from '../../../core/services/category-api.service';
import { CategoryAttributeApiService } from '../../../core/services/category-attribute-api.service';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-attributes-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <header class="hero">
        <p class="eyebrow">Catalog Schema</p>
        <h2>Attributes va category attributes</h2>
        <p>Nap song song attributes, attribute-options, categories va mapping theo categoryId truoc khi tao product.</p>
      </header>

      <section class="stats-grid">
        <article class="card">
          <span>Attributes</span>
          <strong>{{ attributeDefinitions().length }}</strong>
        </article>
        <article class="card">
          <span>Options</span>
          <strong>{{ attributeOptions().length }}</strong>
        </article>
        <article class="card">
          <span>Categories</span>
          <strong>{{ categories().length }}</strong>
        </article>
      </section>

      <section class="panel schema-panel">
        <div class="section-header">
          <h3>Danh sach attribute definitions</h3>
          <button type="button" class="secondary" (click)="loadData()" [disabled]="loading()">Tai lai</button>
        </div>

        @if (errorMessage()) {
          <p class="error-message">{{ errorMessage() }}</p>
        }

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Name</th>
                <th>Value type</th>
                <th>Flags</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              @for (attribute of attributeDefinitions(); track attribute.id) {
                <tr>
                  <td>{{ attribute.id }}</td>
                  <td>{{ attribute.code }}</td>
                  <td>{{ attribute.name }}</td>
                  <td>{{ attribute.valueType }}</td>
                  <td>{{ renderFlags(attribute) }}</td>
                  <td>{{ resolveOptionCount(attribute.id) }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="empty-state">Chua co attribute definition nao.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel category-attribute-panel">
        <div class="section-header">
          <h3>Category attribute mapping</h3>
        </div>

        <label>
          <span>Category</span>
          <select [(ngModel)]="selectedCategoryId" (ngModelChange)="loadCategoryAttributes()">
            <option [ngValue]="null">Chon category</option>
            @for (category of categories(); track category.id) {
              <option [ngValue]="category.id">{{ category.name }}</option>
            }
          </select>
        </label>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Attribute</th>
                <th>Required</th>
                <th>Variant axis</th>
                <th>Filterable</th>
                <th>Specification</th>
              </tr>
            </thead>
            <tbody>
              @for (item of categoryAttributes(); track item.id) {
                <tr>
                  <td>{{ item.id }}</td>
                  <td>{{ resolveAttributeName(item.attributeId) }}</td>
                  <td>{{ item.required ? 'Yes' : 'No' }}</td>
                  <td>{{ item.variantAxis ? 'Yes' : 'No' }}</td>
                  <td>{{ item.filterable ? 'Yes' : 'No' }}</td>
                  <td>{{ item.specification ? 'Yes' : 'No' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="empty-state">{{ selectedCategoryId ? 'Category nay chua co attribute mapping.' : 'Chon category de xem mapping.' }}</td>
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
export class AttributesPage {
  private readonly attributeApi = inject(AttributeApiService);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly categoryAttributeApi = inject(CategoryAttributeApiService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly attributeDefinitions = signal<AttributeDefinition[]>([]);
  protected readonly attributeOptions = signal<AttributeValue[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly categoryAttributes = signal<CategoryAttribute[]>([]);
  protected selectedCategoryId: number | null = null;

  constructor() {
    this.loadData();
  }

  protected loadData(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    forkJoin({
      definitions: this.attributeApi.listDefinitions(),
      options: this.attributeApi.listOptions(),
      categories: this.categoryApi.list(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ definitions, options, categories }) => {
          this.attributeDefinitions.set(definitions);
          this.attributeOptions.set(options);
          this.categories.set(categories);
          if (!this.selectedCategoryId && categories.length > 0) {
            this.selectedCategoryId = categories[0].id;
          }
          this.loadCategoryAttributes();
        },
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
          this.notifications.error(mappedError.message);
        },
      });
  }

  protected loadCategoryAttributes(): void {
    if (!this.selectedCategoryId) {
      this.categoryAttributes.set([]);
      return;
    }

    this.loading.set(true);
    this.categoryAttributeApi.list(this.selectedCategoryId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (items) => this.categoryAttributes.set(items),
        error: (error) => {
          const mappedError = this.errorMapper.map(error);
          this.errorMessage.set(mappedError.message);
        },
      });
  }

  protected resolveOptionCount(attributeId: number): number {
    return this.attributeOptions().filter((item) => item.attributeId === attributeId).length;
  }

  protected resolveAttributeName(attributeId: number): string {
    return this.attributeDefinitions().find((item) => item.id === attributeId)?.name ?? `#${attributeId}`;
  }

  protected renderFlags(attribute: AttributeDefinition): string {
    return [
      attribute.variantAxis ? 'variant' : null,
      attribute.required ? 'required' : null,
      attribute.filterable ? 'filterable' : null,
      attribute.specification ? 'specification' : null,
    ].filter(Boolean).join(', ') || '-';
  }
}
