import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiEnvelope, unwrapApiEnvelope } from '../models/auth.models';
import {
  AttributeDefinition,
  AttributeDefinitionRequest,
  AttributeValue,
  AttributeValueRequest,
} from '../models/catalog.models';
import { BaseApiService } from '../http/base-api.service';

@Injectable({ providedIn: 'root' })
export class AttributeApiService {
  private readonly baseApi = inject(BaseApiService);

  listDefinitions(): Observable<AttributeDefinition[]> {
    return this.baseApi.get<AttributeDefinition[] | ApiEnvelope<AttributeDefinition[]>>(API_ENDPOINTS.attribute.list).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  createDefinition(request: AttributeDefinitionRequest): Observable<AttributeDefinition> {
    return this.baseApi.post<AttributeDefinition>(API_ENDPOINTS.attribute.create, request);
  }

  updateDefinition(id: number, request: AttributeDefinitionRequest): Observable<AttributeDefinition> {
    return this.baseApi.patch<AttributeDefinition>(API_ENDPOINTS.attribute.update(id), request);
  }

  deleteDefinition(id: number): Observable<void> {
    return this.baseApi.delete<void>(API_ENDPOINTS.attribute.delete(id));
  }

  listOptions(): Observable<AttributeValue[]> {
    return this.baseApi.get<AttributeValue[] | ApiEnvelope<AttributeValue[]>>(API_ENDPOINTS.attribute.options).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  createOption(request: AttributeValueRequest): Observable<AttributeValue> {
    return this.baseApi.post<AttributeValue>(API_ENDPOINTS.attribute.options, request);
  }

  updateOption(id: number, request: AttributeValueRequest): Observable<AttributeValue> {
    return this.baseApi.patch<AttributeValue>(API_ENDPOINTS.attribute.optionById(id), request);
  }

  deleteOption(id: number): Observable<void> {
    return this.baseApi.delete<void>(API_ENDPOINTS.attribute.optionById(id));
  }
}
