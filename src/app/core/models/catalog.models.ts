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
  name: string;
  slug: string;
  description: string;
  parentId: number | null;
  childrenIds: number[];
  attributes: CategoryAttribute[];
}

export interface CategoryMutationRequest {
  name: string;
  description: string;
  parentId: number | null;
  attributes: CategoryAttribute[];
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
