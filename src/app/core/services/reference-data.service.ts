import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { AttributeApiService } from './attribute-api.service';
import { BrandApiService } from './brand-api.service';
import { CategoryApiService } from './category-api.service';
import {
  AttributeDefinition,
  AttributeValue,
  Brand,
  Category,
} from '../models/catalog.models';

@Injectable({ providedIn: 'root' })
export class ReferenceDataService {
  private readonly brandApi = inject(BrandApiService);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly attributeApi = inject(AttributeApiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _brands = signal<Brand[]>([]);
  private readonly _categories = signal<Category[]>([]);
  private readonly _variantAttributes = signal<AttributeDefinition[]>([]);
  private readonly _attributeOptions = signal<AttributeValue[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private _loaded = false;

  readonly brands = this._brands.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly variantAttributes = this._variantAttributes.asReadonly();
  readonly attributeOptions = this._attributeOptions.asReadonly();
  readonly isLoading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly brandsSorted = computed(() =>
    [...this._brands()].sort((a, b) => a.name.localeCompare(b.name, 'vi')),
  );

  readonly categoriesSorted = computed(() =>
    [...this._categories()].sort((a, b) => {
      const labelA = a.path || a.name;
      const labelB = b.path || b.name;
      return labelA.localeCompare(labelB, 'vi');
    }),
  );

  filterCategories(term: string): Category[] {
    const normalized = normalizeText(term);
    if (!normalized) {
      return this.categoriesSorted();
    }

    return this.categoriesSorted().filter((cat) => {
      const haystack = normalizeText(
        [cat.name, cat.code, cat.path, cat.parentName].filter(Boolean).join(' '),
      );
      return haystack.includes(normalized);
    });
  }

  resolveBrandName(brandId: number | null | undefined): string {
    if (brandId == null) return '';
    return this._brands().find((b) => b.id === brandId)?.name ?? `#${brandId}`;
  }

  resolveCategoryName(categoryId: number | null | undefined): string {
    if (categoryId == null) return '';
    return this._categories().find((c) => c.id === categoryId)?.name ?? `#${categoryId}`;
  }

  findCategory(categoryId: number | null): Category | undefined {
    if (categoryId == null) return undefined;
    return this._categories().find((c) => c.id === categoryId);
  }

  load(): void {
    if (this._loaded || this._loading()) {
      return;
    }

    this._loading.set(true);
    this._error.set(null);

    forkJoin({
      brands: this.brandApi.list(),
      categories: this.categoryApi.list({ size: 1000, sortBy: 'name' }),
      definitions: this.attributeApi.listDefinitions(),
      options: this.attributeApi.listOptions(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ brands, categories, definitions, options }) => {
          this._brands.set(brands);
          this._categories.set(categories);
          this._variantAttributes.set(definitions.filter((d) => d.variantAxis));
          this._attributeOptions.set(options);
          this._loaded = true;
          this._loading.set(false);
        },
        error: (err: unknown) => {
          this._loading.set(false);
          const message = err instanceof Error ? err.message : 'Failed to load reference data.';
          this._error.set(message);
        },
      });
  }

  refresh(): void {
    this._loaded = false;
    this.load();
  }

  get loaded(): boolean {
    return this._loaded;
  }
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}
