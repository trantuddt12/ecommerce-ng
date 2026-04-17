export interface Brand {
  id: number;
  name: string;
  description: string;
  generic: boolean;
  slug: string;
}

export interface BrandCreateRequest {
  name: string;
  description: string;
  generic: boolean;
  slug: string;
}

export interface BrandUpdateRequest {
  name: string;
  description: string;
  generic: boolean;
}

export interface CategoryAttribute {
  id: number;
  categoryId: number;
  attributeId: number;
  required: boolean;
  variantAxis: boolean;
  filterable: boolean;
  specification: boolean;
  sortOrder: number | null;
}

export interface Category {
  id: number;
  code: string;
  name: string;
  slug: string;
  description: string;
  parentName?: string | null;
  parentId: number | null;
  level: number;
  path: string;
  ancestorIds: number[];
  sortOrder: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  visible: boolean;
  assignable: boolean;
  imageUrl?: string | null;
  iconUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  productCount?: number | null;
  childrenCount?: number | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  childrenIds: number[];
  attributes: CategoryAttribute[];
}

export interface CategoryTreeNode {
  id: number;
  code: string;
  name: string;
  slug: string;
  level: number;
  path: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  visible: boolean;
  assignable: boolean;
  sortOrder: number;
  children: CategoryTreeNode[];
}

export interface CategoryMutationRequest {
  code: string;
  name: string;
  slug: string;
  description: string;
  parentId: number | null;
  sortOrder: number | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  visible: boolean;
  assignable: boolean;
  imageUrl?: string | null;
  iconUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  attributes: CategoryAttribute[];
}

export interface CategoryMoveRequest {
  newParentId: number | null;
  sortOrder: number | null;
}

export interface CategoryReorderItemRequest {
  id: number;
  sortOrder: number;
}

export interface CategoryReorderRequest {
  parentId: number | null;
  orders: CategoryReorderItemRequest[];
}

export interface CategoryMergeRequest {
  sourceCategoryIds: number[];
  targetCategoryId: number;
  moveChildren: boolean;
  deactivateSources: boolean;
}

export interface AttributeValue {
  id: number;
  attributeId: number;
  value: string;
  label: string;
  sortOrder: number | null;
  active: boolean;
}

export interface AttributeDefinition {
  id: number;
  code: string;
  name: string;
  valueType: string;
  variantAxis: boolean;
  specification: boolean;
  filterable: boolean;
  required: boolean;
  sortOrder: number | null;
  status: string | null;
  unit: string | null;
  attributeValues: AttributeValue[];
}

export interface AttributeDefinitionRequest {
  code: string;
  name: string;
  valueType: string;
  variantAxis: boolean;
  specification: boolean;
  filterable: boolean;
  required: boolean;
  sortOrder: number | null;
  status: string | null;
  unit: string | null;
}

export interface AttributeValueRequest {
  attributeId: number | null;
  value: string;
  label: string;
  sortOrder: number | null;
  active: boolean;
}

export interface CategoryAttributeRequest {
  categoryId: number | null;
  attributeId: number | null;
  required: boolean;
  variantAxis: boolean;
  filterable: boolean;
  specification: boolean;
  sortOrder: number | null;
}

export interface ProductVariantAttribute {
  id?: number | null;
  variantId?: number | null;
  attributeId: number;
  optionId: number;
}

export interface ProductVariant {
  sku: string;
  name: string;
  barcode: string;
  price: number | null;
  compareAtPrice: number | null;
  stockQty: number | null;
  weight: number | null;
  imageUrl: string;
  status: string | null;
  signature: string;
  attributes: ProductVariantAttribute[];
}

export interface ProductImage {
  id: number;
  url: string;
  thumbnail: boolean;
  productId: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number | null;
  status: string | null;
  sellerId: number | null;
  categoryId: number;
  brandId: number;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number | null;
  status: string | null;
  sellerId: number | null;
  categoryId: number;
  brandId: number;
  images: ProductImage[];
}

export interface ProductFilter {
  categoryId?: number | null;
  brandId?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  status?: string | null;
  keyword?: string | null;
}

export interface ProductCreateRequest {
  name: string;
  description: string;
  price: number | null;
  categoryId: number | null;
  brandId: number | null;
  variants: ProductVariant[];
}

export type ImportExportDomain = 'brand' | 'category' | 'product' | 'attributes' | 'category-attributes';
