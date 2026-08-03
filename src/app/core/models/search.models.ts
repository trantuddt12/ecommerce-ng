// Contract voi searchservice (Elasticsearch). Response KHONG boc envelope { data }
// vi searchservice khong dung ResponseHandler cua coreservice; van unwrap phong ho.

export type ProductSearchSort = 'relevance' | 'newest' | 'price_asc' | 'price_desc';

/**
 * Che do match keyword, tuong ung cac endpoint bien the cua searchservice:
 * - standard      -> GET /search/products         (best_fields)
 * - smart         -> GET /search/products/smart    (best_fields + fuzziness + as-you-type)
 * - fuzzy         -> GET /search/products/fuzzy    (fuzziness AUTO)
 * - phrase_prefix -> GET /search/products/phrase-prefix
 * - wildcard      -> GET /search/products/wildcard (cham, *q*)
 */
export type ProductSearchMode = 'standard' | 'smart' | 'fuzzy' | 'phrase_prefix' | 'wildcard';

export interface ProductSearchBrandSummary {
  id: number | null;
  name: string | null;
}

export interface ProductSearchPriceSummary {
  min: number | null;
  max: number | null;
  currency: string | null;
}

export interface ProductSearchHighlight {
  name?: string[] | null;
}

export interface ProductSearchItem {
  productId: number;
  name: string | null;
  slug: string | null;
  thumbnailUrl: string | null;
  brand: ProductSearchBrandSummary | null;
  price: ProductSearchPriceSummary | null;
  available: boolean | null;
  hasDiscount: boolean | null;
  highlight?: ProductSearchHighlight | null;
}

export interface SearchFacetBucket {
  value: string;
  label: string | null;
  count: number;
}

export interface SearchFacet {
  code: string;
  label: string | null;
  buckets: SearchFacetBucket[];
}

export interface ProductSearchResult {
  query: string | null;
  /** 1-based theo contract searchservice. */
  page: number;
  size: number;
  total: number;
  totalPages: number;
  sort: string | null;
  items: ProductSearchItem[];
  facets: SearchFacet[];
}

export interface ProductSearchQuery {
  q?: string | null;
  categoryId?: number | null;
  brandIds?: number[] | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  available?: boolean | null;
  sort?: ProductSearchSort | null;
  /** 1-based; backend validate @Min(1). */
  page?: number;
  /** Backend validate @Min(1) @Max(100). */
  size?: number;
  /** attributes[code]=v1,v2 — backend tach theo dau phay. */
  attributes?: Record<string, string[]> | null;
}

export interface SearchSuggestionItem {
  type: string;
  value: string | null;
  slug: string | null;
  productId: number | null;
}

export interface SearchSuggestionResult {
  query: string | null;
  items: SearchSuggestionItem[];
}

/**
 * GET /search/brand tra ve JSON THO cua Elasticsearch `_search` (kieu String o backend),
 * KHONG map sang DTO gon. FE tu doc `hits.hits[]._source`.
 */
export interface BrandSearchQuery {
  keyword: string;
  /** ES offset, 0-based (khong phai so trang). Backend @Min(0). */
  from?: number;
  /** Backend @Min(1) @Max(100). */
  size?: number;
}

export interface BrandSearchHitSource {
  id?: number | string | null;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  [key: string]: unknown;
}

export interface BrandSearchHit {
  _id?: string;
  _score?: number | null;
  _source?: BrandSearchHitSource;
}

export interface BrandSearchResult {
  took?: number;
  timed_out?: boolean;
  hits?: {
    total?: { value?: number; relation?: string } | number;
    max_score?: number | null;
    hits?: BrandSearchHit[];
  };
  [key: string]: unknown;
}

/** GET /search/health — trang thai engine + alias index. */
export interface SearchHealthResult {
  engineReachable: boolean;
  readAliasExists: boolean;
  writeAliasExists: boolean;
}
