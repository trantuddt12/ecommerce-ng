import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
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
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTableModule,
  ],
  template: `
    <section class="catalog-page">
      <mat-card class="catalog-hero">
        <mat-card-content>
          <p class="catalog-eyebrow">Catalog Schema</p>
          <h2>Attribute schema view</h2>
          <p>Theo doi attribute definitions, option counts va category mappings trong mot giao dien Material de doc nhanh hon.</p>
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
            <p class="catalog-stat-label">Categories</p>
            <p class="catalog-stat-value">{{ categories().length }}</p>
          </mat-card-content>
        </mat-card>
      </section>

      <section class="catalog-grid">
        <mat-card class="catalog-panel catalog-span-7">
          <mat-card-content>
            @if (loading()) {
              <mat-progress-bar class="catalog-progress" mode="indeterminate"></mat-progress-bar>
            }

            <div class="catalog-panel-header">
              <div>
                <h3>Danh sach attribute definitions</h3>
                <p>Doc nhanh code, value type va cac flag dung trong catalog schema.</p>
              </div>

              <button mat-stroked-button type="button" (click)="loadData()" [disabled]="loading()">Tai lai</button>
            </div>

            @if (errorMessage()) {
              <div class="catalog-error">{{ errorMessage() }}</div>
            }

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
                  <th mat-header-cell *matHeaderCellDef>Value type</th>
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

                <tr mat-header-row *matHeaderRowDef="definitionColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: definitionColumns"></tr>
              </table>
            } @else if (!loading()) {
              <div class="catalog-empty">Chua co attribute definition nao.</div>
            }
          </mat-card-content>
        </mat-card>

        <mat-card class="catalog-panel catalog-span-5">
          <mat-card-content>
            @if (loading() && selectedCategoryId) {
              <mat-progress-bar class="catalog-progress" mode="indeterminate"></mat-progress-bar>
            }

            <div class="catalog-panel-header">
              <div>
                <h3>Category attribute mapping</h3>
                <p>Chon category de xem mapping va cac flag cho product schema.</p>
              </div>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select [(ngModel)]="selectedCategoryId" (ngModelChange)="loadCategoryAttributes()">
                <mat-option [value]="null">Chon category</mat-option>
                @for (category of categories(); track category.id) {
                  <mat-option [value]="category.id">{{ category.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

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

                <tr mat-header-row *matHeaderRowDef="mappingColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: mappingColumns"></tr>
              </table>
            } @else {
              <div class="catalog-empty">
                {{ selectedCategoryId ? 'Category nay chua co attribute mapping.' : 'Chon category de xem mapping.' }}
              </div>
            }
          </mat-card-content>
        </mat-card>
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
  protected readonly definitionColumns = ['attribute', 'valueType', 'flags', 'options'];
  protected readonly mappingColumns = ['attribute', 'flags'];
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
