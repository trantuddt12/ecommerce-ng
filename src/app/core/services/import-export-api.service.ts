import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { BaseApiService } from '../http/base-api.service';
import { ImportExportDomain } from '../models/catalog.models';
import { QueryParamValue } from '../utils/query-params.util';

interface ImportExportRequest {
  interfaceFileId: string;
  fileName: string;
}

@Injectable({ providedIn: 'root' })
export class ImportExportApiService {
  private readonly baseApi = inject(BaseApiService);

  import(domain: ImportExportDomain, request: ImportExportRequest): Observable<string> {
    return this.baseApi.postText(this.resolveImportPath(domain), null, this.toQueryParams(request));
  }

  export(domain: ImportExportDomain, request: ImportExportRequest): Observable<string> {
    return this.baseApi.postText(this.resolveExportPath(domain), null, this.toQueryParams(request));
  }

  private resolveImportPath(domain: ImportExportDomain): string {
    switch (domain) {
      case 'brand':
        return API_ENDPOINTS.import.brand;
      case 'category':
        return API_ENDPOINTS.import.category;
      case 'product':
        return API_ENDPOINTS.import.product;
      case 'attributes':
        return API_ENDPOINTS.import.attributes;
      case 'category-attributes':
        return API_ENDPOINTS.import.categoryAttributes;
    }
  }

  private resolveExportPath(domain: ImportExportDomain): string {
    switch (domain) {
      case 'brand':
        return API_ENDPOINTS.export.brand;
      case 'category':
        return API_ENDPOINTS.export.category;
      case 'product':
        return API_ENDPOINTS.export.product;
      case 'attributes':
        return API_ENDPOINTS.export.attributes;
      case 'category-attributes':
        return API_ENDPOINTS.export.categoryAttributes;
    }
  }

  private toQueryParams(request: ImportExportRequest): Record<string, QueryParamValue> {
    return {
      interfaceFileId: request.interfaceFileId,
      fileName: request.fileName,
    };
  }
}
