import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiEnvelope, unwrapApiEnvelope } from '../models/auth.models';
import { Brand, BrandCreateRequest, BrandUpdateRequest, ImageAsset } from '../models/catalog.models';
import { BaseApiService } from '../http/base-api.service';

@Injectable({ providedIn: 'root' })
export class BrandApiService {
  private readonly baseApi = inject(BaseApiService);

  list(): Observable<Brand[]> {
    return this.baseApi.get<Brand[] | ApiEnvelope<Brand[]>>(API_ENDPOINTS.brand.list).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  storefront(): Observable<Brand[]> {
    return this.baseApi.get<Brand[] | ApiEnvelope<Brand[]>>(API_ENDPOINTS.brand.storefront).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  getStorefrontBySlug(slug: string): Observable<Brand> {
    return this.baseApi.get<Brand | ApiEnvelope<Brand>>(API_ENDPOINTS.brand.storefrontBySlug(slug)).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  create(request: BrandCreateRequest): Observable<Brand> {
    return this.baseApi.post<Brand | ApiEnvelope<Brand>>(API_ENDPOINTS.brand.create, request).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  update(id: number, request: BrandUpdateRequest): Observable<Brand> {
    return this.baseApi.patch<Brand | ApiEnvelope<Brand>>(API_ENDPOINTS.brand.update(id), request).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  uploadImage(id: number, image: File): Observable<Brand> {
    const formData = new FormData();
    formData.append('image', image);

    return this.baseApi.postFormData<Brand | ApiEnvelope<Brand>>(API_ENDPOINTS.brand.image(id), formData).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  removeImage(id: number): Observable<Brand> {
    return this.baseApi.delete<Brand | ApiEnvelope<Brand>>(API_ENDPOINTS.brand.image(id)).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  addImages(id: number, files: File[]): Observable<Brand> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }

    return this.baseApi.postFormData<Brand | ApiEnvelope<Brand>>(API_ENDPOINTS.brand.images(id), formData).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  listImages(id: number): Observable<ImageAsset[]> {
    return this.baseApi.get<ImageAsset[] | ApiEnvelope<ImageAsset[]>>(API_ENDPOINTS.brand.images(id)).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  setThumbnail(id: number, imageId: number): Observable<Brand> {
    return this.baseApi.patch<Brand | ApiEnvelope<Brand>>(API_ENDPOINTS.brand.thumbnail(id, imageId), {}).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  deleteImage(id: number, imageId: number): Observable<Brand> {
    return this.baseApi.delete<Brand | ApiEnvelope<Brand>>(API_ENDPOINTS.brand.deleteImage(id, imageId)).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  delete(id: number): Observable<void> {
    return this.baseApi.delete<void>(API_ENDPOINTS.brand.delete(id));
  }
}
