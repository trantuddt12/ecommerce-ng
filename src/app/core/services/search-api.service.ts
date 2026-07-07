import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { BaseApiService } from '../http/base-api.service';
import { ApiEnvelope, unwrapApiEnvelope } from '../models/auth.models';
import { ProductSearchQuery, ProductSearchResult, SearchSuggestionResult } from '../models/search.models';
import { QueryParamValue } from '../utils/query-params.util';

@Injectable({ providedIn: 'root' })
export class SearchApiService {
  private readonly baseApi = inject(BaseApiService);

  searchProducts(query: ProductSearchQuery): Observable<ProductSearchResult> {
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

    return this.baseApi
      .get<ProductSearchResult | ApiEnvelope<ProductSearchResult>>(API_ENDPOINTS.search.products, params, 'search')
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
}
