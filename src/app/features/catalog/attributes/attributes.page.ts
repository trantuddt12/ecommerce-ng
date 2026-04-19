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
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { finalize, forkJoin } from 'rxjs';
import {
  AttributeDefinition,
  AttributeDefinitionRequest,
  AttributeValue,
  AttributeValueRequest,
  Category,
  CategoryAttribute,
  CategoryAttributeRequest,
} from '../../../core/models/catalog.models';
import { AttributeApiService } from '../../../core/services/attribute-api.service';
import { CategoryApiService } from '../../../core/services/category-api.service';
import { CategoryAttributeApiService } from '../../../core/services/category-attribute-api.service';
import { ErrorMapperService } from '../../../core/services/error-mapper.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-attributes-page',
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
    MatSelectModule,
    MatTableModule,
  ],
  template: `
    <section class="catalog-page">
      <mat-card class="catalog-hero">
        <mat-card-content>
          <p class="catalog-eyebrow">Catalog Schema</p>
          <h2>Attribute CRUD hub</h2>
          <p>Quan ly attribute definition, predefined option va category mapping trong cung mot flow de product dung dung schema.</p>
        </mat-card-content>
      </mat-card>

      <section class="catalog-stats">
        <mat-card class="catalog-stat-card">
          <mat-card-content>
            <p class="catalog-stat-label">Attributes</p>
            <p class="catalog-stat-value">{{ attributeDefinitions().length }}</p>
          </mat-card-content>
        </mat-card>
        <mat-card class="catalog-stat-card">
          <mat-card-content>
            <p class="catalog-stat-label">Options</p>
            <p class="catalog-stat-value">{{ attributeOptions().length }}</p>
          </mat-card-content>
        </mat-card>
        <mat-card class="catalog-stat-card">
          <mat-card-content>
            <p class="catalog-stat-label">Mappings</p>
            <p class="catalog-stat-value">{{ categoryAttributes().length }}</p>
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
                <h3>Attribute definition</h3>
                <p>{{ attributeForm.id ? 'Cap nhat definition hien tai.' : 'Tao definition moi cho category va product.' }}</p>
              </div>
            </div>

            @if (errorMessage()) {
              <div class="catalog-error">{{ errorMessage() }}</div>
            }

            <div class="catalog-form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Code</mat-label>
                <input matInput [(ngModel)]="attributeForm.code" placeholder="color" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Name</mat-label>
                <input matInput [(ngModel)]="attributeForm.name" placeholder="Color" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Value type</mat-label>
                <mat-select [(ngModel)]="attributeForm.valueType">
                  @for (valueType of valueTypes; track valueType) {
                    <mat-option [value]="valueType">{{ valueType }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select [(ngModel)]="attributeForm.status">
                  <mat-option value="active">active</mat-option>
                  <mat-option value="inactive">inactive</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Unit</mat-label>
                <input matInput [(ngModel)]="attributeForm.unit" placeholder="GB" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Sort order</mat-label>
                <input matInput type="number" min="0" [(ngModel)]="attributeForm.sortOrder" />
              </mat-form-field>
            </div>

            <div class="catalog-boolean-grid">
              <mat-checkbox [(ngModel)]="attributeForm.variantAxis">Variant axis</mat-checkbox>
              <mat-checkbox [(ngModel)]="attributeForm.specification">Specification</mat-checkbox>
              <mat-checkbox [(ngModel)]="attributeForm.filterable">Filterable</mat-checkbox>
              <mat-checkbox [(ngModel)]="attributeForm.required">Required</mat-checkbox>
            </div>

            <div class="catalog-actions">
              <button mat-flat-button color="primary" type="button" (click)="saveAttributeDefinition()" [disabled]="loading()">
                {{ attributeForm.id ? 'Cap nhat attribute' : 'Tao attribute' }}
              </button>
              <button mat-stroked-button type="button" (click)="resetAttributeForm()" [disabled]="loading()">Reset</button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="catalog-panel catalog-span-8">
          <mat-card-content>
            <div class="catalog-panel-header">
              <div>
                <h3>Attribute definitions</h3>
                <p>Definition la nguon schema cho category mapping va variant option cua product.</p>
              </div>

              <button mat-stroked-button type="button" (click)="loadData()" [disabled]="loading()">Tai lai</button>
            </div>

            @if (attributeDefinitions().length) {
              <table mat-table [dataSource]="attributeDefinitions()" class="catalog-table">
                <ng-container matColumnDef="attribute">
                  <th mat-header-cell *matHeaderCellDef>Attribute</th>
                  <td mat-cell *matCellDef="let attribute">
                    <div>
                      <strong>{{ attribute.name }}</strong>
                      <div class="catalog-inline-meta">
                        <mat-chip class="catalog-chip-neutral">#{{ attribute.id }}</mat-chip>
                        <mat-chip class="catalog-chip-soft">{{ attribute.code }}</mat-chip>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="valueType">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let attribute">{{ attribute.valueType }}</td>
                </ng-container>

                <ng-container matColumnDef="flags">
                  <th mat-header-cell *matHeaderCellDef>Flags</th>
                  <td mat-cell *matCellDef="let attribute">{{ renderFlags(attribute) }}</td>
                </ng-container>

                <ng-container matColumnDef="options">
                  <th mat-header-cell *matHeaderCellDef>Options</th>
                  <td mat-cell *matCellDef="let attribute">{{ resolveOptionCount(attribute.id) }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let attribute">
                    <div class="catalog-actions catalog-actions-inline">
                      <button mat-stroked-button type="button" (click)="editAttributeDefinition(attribute)">Sua</button>
                      <button mat-stroked-button type="button" color="warn" (click)="deleteAttributeDefinition(attribute)">Xoa</button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="definitionColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: definitionColumns"></tr>
              </table>
            } @else if (!loading()) {
              <div class="catalog-empty">Chua co attribute definition nao.</div>
            }
          </mat-card-content>
        </mat-card>

        <mat-card class="catalog-panel catalog-span-6">
          <mat-card-content>
            <div class="catalog-panel-header">
              <div>
                <h3>Attribute options</h3>
                <p>Chi dung cho attribute co value type select hoac multi_select.</p>
              </div>
            </div>

            <div class="catalog-form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Attribute</mat-label>
                <mat-select [(ngModel)]="optionForm.attributeId">
                  <mat-option [value]="null">Chon attribute</mat-option>
                  @for (attribute of optionBasedAttributes(); track attribute.id) {
                    <mat-option [value]="attribute.id">{{ attribute.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Value</mat-label>
                <input matInput [(ngModel)]="optionForm.value" placeholder="black" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Label</mat-label>
                <input matInput [(ngModel)]="optionForm.label" placeholder="Black" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Sort order</mat-label>
                <input matInput type="number" min="0" [(ngModel)]="optionForm.sortOrder" />
              </mat-form-field>
            </div>

            <div class="catalog-boolean-grid">
              <mat-checkbox [(ngModel)]="optionForm.active">Active</mat-checkbox>
            </div>

            <div class="catalog-actions">
              <button mat-flat-button color="primary" type="button" (click)="saveOption()" [disabled]="loading()">
                {{ optionForm.id ? 'Cap nhat option' : 'Tao option' }}
              </button>
              <button mat-stroked-button type="button" (click)="resetOptionForm()" [disabled]="loading()">Reset</button>
            </div>

            @if (selectedOptionAttributeId()) {
              <div class="catalog-inline-meta">Dang hien thi option cua {{ resolveAttributeName(selectedOptionAttributeId()!) }}.</div>
            }

            @if (filteredOptions().length) {
              <table mat-table [dataSource]="filteredOptions()" class="catalog-table">
                <ng-container matColumnDef="value">
                  <th mat-header-cell *matHeaderCellDef>Option</th>
                  <td mat-cell *matCellDef="let option">
                    <div>
                      <strong>{{ option.label }}</strong>
                      <div class="catalog-inline-meta">{{ option.value }}</div>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let option">{{ option.active ? 'active' : 'inactive' }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let option">
                    <div class="catalog-actions catalog-actions-inline">
                      <button mat-stroked-button type="button" (click)="editOption(option)">Sua</button>
                      <button mat-stroked-button type="button" color="warn" (click)="deleteOption(option)">Xoa</button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="optionColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: optionColumns"></tr>
              </table>
            } @else {
              <div class="catalog-empty">{{ selectedOptionAttributeId() ? 'Attribute nay chua co option.' : 'Chon attribute option-based de xem option.' }}</div>
            }
          </mat-card-content>
        </mat-card>

        <mat-card class="catalog-panel catalog-span-6">
          <mat-card-content>
            <div class="catalog-panel-header">
              <div>
                <h3>Category attribute mapping</h3>
                <p>Mapping nay quyet dinh category nao duoc dung attribute nao, va product co duoc tao variant theo attribute do hay khong.</p>
              </div>
            </div>

            <div class="catalog-form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Category</mat-label>
                <mat-select [(ngModel)]="selectedCategoryId" (ngModelChange)="onCategoryChange()">
                  <mat-option [value]="null">Chon category</mat-option>
                  @for (category of categories(); track category.id) {
                    <mat-option [value]="category.id">{{ category.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Attribute</mat-label>
                <mat-select [(ngModel)]="mappingForm.attributeId">
                  <mat-option [value]="null">Chon attribute</mat-option>
                  @for (attribute of attributeDefinitions(); track attribute.id) {
                    <mat-option [value]="attribute.id">{{ attribute.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Sort order</mat-label>
                <input matInput type="number" min="0" [(ngModel)]="mappingForm.sortOrder" />
              </mat-form-field>
            </div>

            <div class="catalog-boolean-grid">
              <mat-checkbox [(ngModel)]="mappingForm.required">Required</mat-checkbox>
              <mat-checkbox [(ngModel)]="mappingForm.variantAxis">Variant axis</mat-checkbox>
              <mat-checkbox [(ngModel)]="mappingForm.filterable">Filterable</mat-checkbox>
              <mat-checkbox [(ngModel)]="mappingForm.specification">Specification</mat-checkbox>
            </div>

            <div class="catalog-actions">
              <button mat-flat-button color="primary" type="button" (click)="saveCategoryMapping()" [disabled]="loading() || !selectedCategoryId">
                {{ mappingForm.id ? 'Cap nhat mapping' : 'Gan attribute vao category' }}
              </button>
              <button mat-stroked-button type="button" (click)="resetMappingForm()" [disabled]="loading()">Reset</button>
            </div>

            @if (categoryAttributes().length) {
              <table mat-table [dataSource]="categoryAttributes()" class="catalog-table">
                <ng-container matColumnDef="attribute">
                  <th mat-header-cell *matHeaderCellDef>Attribute</th>
                  <td mat-cell *matCellDef="let item">{{ resolveAttributeName(item.attributeId) }}</td>
                </ng-container>

                <ng-container matColumnDef="flags">
                  <th mat-header-cell *matHeaderCellDef>Flags</th>
                  <td mat-cell *matCellDef="let item">
                    <div class="catalog-inline-meta">
                      @if (item.required) {
                        <mat-chip class="catalog-chip-success">required</mat-chip>
                      }
                      @if (item.variantAxis) {
                        <mat-chip class="catalog-chip-soft">variant</mat-chip>
                      }
                      @if (item.filterable) {
                        <mat-chip class="catalog-chip-neutral">filterable</mat-chip>
                      }
                      @if (item.specification) {
                        <mat-chip class="catalog-chip-neutral">specification</mat-chip>
                      }
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let item">
                    <div class="catalog-actions catalog-actions-inline">
                      <button mat-stroked-button type="button" (click)="editCategoryMapping(item)">Sua</button>
                      <button mat-stroked-button type="button" color="warn" (click)="deleteCategoryMapping(item)">Xoa</button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="mappingColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: mappingColumns"></tr>
              </table>
            } @else {
              <div class="catalog-empty">
                {{ selectedCategoryId ? 'Category nay chua co attribute mapping.' : 'Chon category de tao mapping.' }}
              </div>
            }
          </mat-card-content>
        </mat-card>
      </section>
    </section>
  `,
  styles: [
    `
      .catalog-span-6 {
        grid-column: span 6;
      }

      .catalog-boolean-grid {
        display: grid;
        gap: 0.5rem 1rem;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        margin-bottom: 1rem;
      }

      .catalog-actions-inline {
        justify-content: flex-start;
        flex-wrap: wrap;
      }

      @media (max-width: 1024px) {
        .catalog-span-4,
        .catalog-span-6,
        .catalog-span-8 {
          grid-column: span 12;
        }
      }

      @media (max-width: 720px) {
        .catalog-form-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AttributesPage {
  private readonly attributeApi = inject(AttributeApiService);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly categoryAttributeApi = inject(CategoryAttributeApiService);
  private readonly notifications = inject(NotificationService);
  private readonly errorMapper = inject(ErrorMapperService);

  protected readonly valueTypes = ['text', 'number', 'boolean', 'select', 'multi_select'];
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly attributeDefinitions = signal<AttributeDefinition[]>([]);
  protected readonly attributeOptions = signal<AttributeValue[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly categoryAttributes = signal<CategoryAttribute[]>([]);
  protected readonly selectedOptionAttributeId = signal<number | null>(null);
  protected readonly definitionColumns = ['attribute', 'valueType', 'flags', 'options', 'actions'];
  protected readonly optionColumns = ['value', 'status', 'actions'];
  protected readonly mappingColumns = ['attribute', 'flags', 'actions'];
  protected selectedCategoryId: number | null = null;

  protected readonly attributeForm = createDefaultAttributeForm();
  protected readonly optionForm = createDefaultOptionForm();
  protected readonly mappingForm = createDefaultMappingForm();

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

          if (!this.selectedOptionAttributeId() && definitions.length > 0) {
            this.selectedOptionAttributeId.set(this.optionBasedAttributes()[0]?.id ?? null);
          }

          if (this.optionForm.attributeId == null && this.selectedOptionAttributeId()) {
            this.optionForm.attributeId = this.selectedOptionAttributeId();
          }

          this.loadCategoryAttributes();
        },
        error: (error) => this.handleError(error),
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
        error: (error) => this.handleError(error),
      });
  }

  protected onCategoryChange(): void {
    this.resetMappingForm();
    this.loadCategoryAttributes();
  }

  protected saveAttributeDefinition(): void {
    const request = this.buildAttributeRequest();
    if (!request) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    const action$ = this.attributeForm.id
      ? this.attributeApi.updateDefinition(this.attributeForm.id, request)
      : this.attributeApi.createDefinition(request);

    action$.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => {
        this.notifications.success(this.attributeForm.id ? 'Cap nhat attribute thanh cong.' : 'Tao attribute thanh cong.');
        this.resetAttributeForm();
        this.loadData();
      },
      error: (error) => this.handleError(error),
    });
  }

  protected editAttributeDefinition(attribute: AttributeDefinition): void {
    this.attributeForm.id = attribute.id;
    this.attributeForm.code = attribute.code;
    this.attributeForm.name = attribute.name;
    this.attributeForm.valueType = attribute.valueType;
    this.attributeForm.variantAxis = attribute.variantAxis;
    this.attributeForm.specification = attribute.specification;
    this.attributeForm.filterable = attribute.filterable;
    this.attributeForm.required = attribute.required;
    this.attributeForm.sortOrder = attribute.sortOrder ?? 0;
    this.attributeForm.status = attribute.status ?? 'active';
    this.attributeForm.unit = attribute.unit ?? '';
  }

  protected deleteAttributeDefinition(attribute: AttributeDefinition): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.attributeApi.deleteDefinition(attribute.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success(`Da xoa attribute ${attribute.name}.`);
          if (this.attributeForm.id === attribute.id) {
            this.resetAttributeForm();
          }
          if (this.optionForm.attributeId === attribute.id) {
            this.resetOptionForm();
          }
          this.loadData();
        },
        error: (error) => this.handleError(error),
      });
  }

  protected saveOption(): void {
    const request = this.buildOptionRequest();
    if (!request) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    const action$ = this.optionForm.id
      ? this.attributeApi.updateOption(this.optionForm.id, request)
      : this.attributeApi.createOption(request);

    action$.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => {
        this.notifications.success(this.optionForm.id ? 'Cap nhat option thanh cong.' : 'Tao option thanh cong.');
        const selectedAttributeId = request.attributeId;
        this.resetOptionForm();
        this.selectedOptionAttributeId.set(selectedAttributeId);
        this.optionForm.attributeId = selectedAttributeId;
        this.loadData();
      },
      error: (error) => this.handleError(error),
    });
  }

  protected editOption(option: AttributeValue): void {
    this.optionForm.id = option.id;
    this.optionForm.attributeId = option.attributeId;
    this.optionForm.value = option.value;
    this.optionForm.label = option.label;
    this.optionForm.sortOrder = option.sortOrder ?? 0;
    this.optionForm.active = option.active;
    this.selectedOptionAttributeId.set(option.attributeId);
  }

  protected deleteOption(option: AttributeValue): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.attributeApi.deleteOption(option.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success(`Da xoa option ${option.label}.`);
          if (this.optionForm.id === option.id) {
            this.resetOptionForm();
            this.optionForm.attributeId = option.attributeId;
          }
          this.selectedOptionAttributeId.set(option.attributeId);
          this.loadData();
        },
        error: (error) => this.handleError(error),
      });
  }

  protected saveCategoryMapping(): void {
    const request = this.buildMappingRequest();
    if (!request || !this.selectedCategoryId) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    const action$ = this.mappingForm.id
      ? this.categoryAttributeApi.update(this.selectedCategoryId, this.mappingForm.id, request)
      : this.categoryAttributeApi.create(this.selectedCategoryId, request);

    action$.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => {
        this.notifications.success(this.mappingForm.id ? 'Cap nhat category mapping thanh cong.' : 'Gan attribute vao category thanh cong.');
        this.resetMappingForm();
        this.loadCategoryAttributes();
      },
      error: (error) => this.handleError(error),
    });
  }

  protected editCategoryMapping(mapping: CategoryAttribute): void {
    this.mappingForm.id = mapping.id;
    this.mappingForm.attributeId = mapping.attributeId;
    this.mappingForm.required = mapping.required;
    this.mappingForm.variantAxis = mapping.variantAxis;
    this.mappingForm.filterable = mapping.filterable;
    this.mappingForm.specification = mapping.specification;
    this.mappingForm.sortOrder = mapping.sortOrder ?? 0;
  }

  protected deleteCategoryMapping(mapping: CategoryAttribute): void {
    if (!this.selectedCategoryId) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.categoryAttributeApi.delete(this.selectedCategoryId, mapping.id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notifications.success(`Da go attribute ${this.resolveAttributeName(mapping.attributeId)} khoi category.`);
          if (this.mappingForm.id === mapping.id) {
            this.resetMappingForm();
          }
          this.loadCategoryAttributes();
        },
        error: (error) => this.handleError(error),
      });
  }

  protected optionBasedAttributes(): AttributeDefinition[] {
    return this.attributeDefinitions().filter((attribute) => isOptionBasedAttribute(attribute));
  }

  protected filteredOptions(): AttributeValue[] {
    const attributeId = this.optionForm.attributeId ?? this.selectedOptionAttributeId();
    if (!attributeId) {
      return [];
    }

    return this.attributeOptions().filter((item) => item.attributeId === attributeId);
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

  protected resetAttributeForm(): void {
    Object.assign(this.attributeForm, createDefaultAttributeForm());
  }

  protected resetOptionForm(): void {
    Object.assign(this.optionForm, createDefaultOptionForm());
    this.optionForm.attributeId = this.selectedOptionAttributeId();
  }

  protected resetMappingForm(): void {
    Object.assign(this.mappingForm, createDefaultMappingForm());
  }

  private buildAttributeRequest(): AttributeDefinitionRequest | null {
    if (!this.attributeForm.code.trim() || !this.attributeForm.name.trim()) {
      this.notifications.error('Can nhap code va name cho attribute.');
      return null;
    }

    const request: AttributeDefinitionRequest = {
      code: this.attributeForm.code.trim(),
      name: this.attributeForm.name.trim(),
      valueType: this.attributeForm.valueType,
      variantAxis: this.attributeForm.variantAxis,
      specification: this.attributeForm.specification,
      filterable: this.attributeForm.filterable,
      required: this.attributeForm.required,
      sortOrder: this.attributeForm.sortOrder,
      status: this.attributeForm.status.trim() || 'active',
      unit: this.attributeForm.unit.trim() || null,
    };

    if (request.variantAxis && !isOptionBasedValueType(request.valueType)) {
      this.notifications.error('Attribute dung cho variant phai co value type la select hoac multi_select.');
      return null;
    }

    return request;
  }

  private buildOptionRequest(): AttributeValueRequest | null {
    const attributeId = this.optionForm.attributeId;
    if (!attributeId) {
      this.notifications.error('Can chon attribute cho option.');
      return null;
    }

    if (!this.optionForm.value.trim() || !this.optionForm.label.trim()) {
      this.notifications.error('Can nhap value va label cho option.');
      return null;
    }

    this.selectedOptionAttributeId.set(attributeId);
    return {
      attributeId,
      value: this.optionForm.value.trim(),
      label: this.optionForm.label.trim(),
      sortOrder: this.optionForm.sortOrder,
      active: this.optionForm.active,
    };
  }

  private buildMappingRequest(): CategoryAttributeRequest | null {
    if (!this.selectedCategoryId) {
      this.notifications.error('Can chon category truoc khi tao mapping.');
      return null;
    }

    if (!this.mappingForm.attributeId) {
      this.notifications.error('Can chon attribute de gan vao category.');
      return null;
    }

    const attribute = this.attributeDefinitions().find((item) => item.id === this.mappingForm.attributeId);
    if (!attribute) {
      this.notifications.error('Khong tim thay attribute da chon.');
      return null;
    }

    if (this.mappingForm.variantAxis && !attribute.variantAxis) {
      this.notifications.error('Attribute nay khong duoc backend cho phep dung lam variant axis.');
      return null;
    }

    if (this.mappingForm.specification && !attribute.specification) {
      this.notifications.error('Attribute nay khong duoc backend cho phep dung lam specification.');
      return null;
    }

    return {
      categoryId: this.selectedCategoryId,
      attributeId: this.mappingForm.attributeId,
      required: this.mappingForm.required,
      variantAxis: this.mappingForm.variantAxis,
      filterable: this.mappingForm.filterable,
      specification: this.mappingForm.specification,
      sortOrder: this.mappingForm.sortOrder,
    };
  }

  private handleError(error: unknown): void {
    const mappedError = this.errorMapper.map(error);
    this.errorMessage.set(mappedError.message);
    this.notifications.error(mappedError.message);
  }
}

function createDefaultAttributeForm() {
  return {
    id: null as number | null,
    code: '',
    name: '',
    valueType: 'text',
    variantAxis: false,
    specification: false,
    filterable: false,
    required: false,
    sortOrder: 0,
    status: 'active',
    unit: '',
  };
}

function createDefaultOptionForm() {
  return {
    id: null as number | null,
    attributeId: null as number | null,
    value: '',
    label: '',
    sortOrder: 0,
    active: true,
  };
}

function createDefaultMappingForm() {
  return {
    id: null as number | null,
    attributeId: null as number | null,
    required: false,
    variantAxis: false,
    filterable: false,
    specification: false,
    sortOrder: 0,
  };
}

function isOptionBasedAttribute(attribute: AttributeDefinition): boolean {
  return isOptionBasedValueType(attribute.valueType);
}

function isOptionBasedValueType(valueType: string | null | undefined): boolean {
  return valueType === 'select' || valueType === 'multi_select';
}
