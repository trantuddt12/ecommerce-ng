import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { BaseApiService } from '../http/base-api.service';
import { ApiEnvelope, unwrapApiEnvelope } from '../models/auth.models';
import {
  BrandSearchQuery,
  BrandSearchResult,
  ProductSearchMode,
  ProductSearchQuery,
  ProductSearchResult,
  SearchHealthResult,
  SearchSuggestionResult,
} from '../models/search.models';
import { QueryParamValue } from '../utils/query-params.util';

@Injectable({ providedIn: 'root' })
export class SearchApiService {
  private readonly baseApi = inject(BaseApiService);

  /** Map che do match keyword -> endpoint bien the cua searchservice. */
  private readonly productSearchEndpoints: Record<ProductSearchMode, string> = {
    standard: API_ENDPOINTS.search.products,
    smart: API_ENDPOINTS.search.productsSmart,
    fuzzy: API_ENDPOINTS.search.productsFuzzy,
    phrase_prefix: API_ENDPOINTS.search.productsPhrasePrefix,
    wildcard: API_ENDPOINTS.search.productsWildcard,
  };

  /**
   * Search san pham. `mode` chon endpoint (standard mac dinh); moi mode cung params/response,
   * chi khac cach match keyword ben ES.
   */
  searchProducts(query: ProductSearchQuery, mode: ProductSearchMode = 'standard'): Observable<ProductSearchResult> {
    return this.baseApi
      .get<ProductSearchResult | ApiEnvelope<ProductSearchResult>>(
        this.productSearchEndpoints[mode],
        this.buildProductSearchParams(query),
        'search',
      )
      .pipe(map((response) => unwrapApiEnvelope(response)));
  }

  suggest(q: string, size = 8): Observable<SearchSuggestionResult> {
    return this.baseApi
      .get<SearchSuggestionResult | ApiEnvelope<SearchSuggestionResult>>(
        API_ENDPOINTS.search.productSuggest,
        { q, size: Math.min(20, Math.max(1, size)) },
        'search',
      )
      .pipe(map((response) => unwrapApiEnvelope(response)));
  }

  /**
   * Search brand. Backend tra ve JSON tho cua Elasticsearch `_search` (khong boc envelope),
   * caller tu doc `hits.hits[]._source`.
   */
  searchBrands(query: BrandSearchQuery): Observable<BrandSearchResult> {
    return this.baseApi.get<BrandSearchResult>(
      API_ENDPOINTS.search.brand,
      {
        keyword: query.keyword?.trim() || null,
        from: Math.max(0, query.from ?? 0),
        size: Math.min(100, Math.max(1, query.size ?? 10)),
      },
      'search',
    );
  }

  /** Kiem tra tinh trang engine + alias index (dung cho degraded fallback / diagnostics). */
  health(): Observable<SearchHealthResult> {
    return this.baseApi
      .get<SearchHealthResult | ApiEnvelope<SearchHealthResult>>(API_ENDPOINTS.search.health, undefined, 'search')
      .pipe(map((response) => unwrapApiEnvelope(response)));
  }

  private buildProductSearchParams(query: ProductSearchQuery): Record<string, QueryParamValue> {
    const params: Record<string, QueryParamValue> = {
      q: query.q?.trim() || null,
      categoryId: query.categoryId ?? null,
      brandIds: query.brandIds?.length ? query.brandIds.join(',') : null,
      minPrice: query.minPrice ?? null,
      maxPrice: query.maxPrice ?? null,
      available: query.available ?? null,
      sort: query.sort ?? null,
      page: Math.max(1, query.page ?? 1),
      size: Math.min(100, Math.max(1, query.size ?? 24)),
    };

    for (const [code, values] of Object.entries(query.attributes ?? {})) {
      if (values.length) {
        params[`attributes[${code}]`] = values.join(',');
      }
    }

    return params;
  }
}
