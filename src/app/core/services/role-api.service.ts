import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiEnvelope, PermissionResponse, RoleResponse, unwrapApiEnvelope } from '../models/auth.models';
import { BaseApiService } from '../http/base-api.service';

@Injectable({ providedIn: 'root' })
export class RoleApiService {
  private readonly baseApi = inject(BaseApiService);

  list(): Observable<RoleResponse[]> {
    return this.baseApi.get<RoleResponse[] | ApiEnvelope<RoleResponse[]>>(API_ENDPOINTS.role.list).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  create(request: { name: string; description?: string | null; permissions: Array<{ id?: number; name?: string; description?: string | null }> }): Observable<RoleResponse> {
    return this.baseApi.post<RoleResponse | ApiEnvelope<RoleResponse>>(API_ENDPOINTS.role.create, request).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  update(id: number, request: { name: string; description?: string | null; permissions: Array<{ id?: number; name?: string; description?: string | null }> }): Observable<RoleResponse> {
    return this.baseApi.patch<RoleResponse | ApiEnvelope<RoleResponse>>(API_ENDPOINTS.role.update(id), request).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  delete(id: number): Observable<string> {
    return this.baseApi.delete<string>(API_ENDPOINTS.role.delete(id));
  }

  listPermissions(): Observable<PermissionResponse[]> {
    return this.baseApi.get<PermissionResponse[] | ApiEnvelope<PermissionResponse[]>>(API_ENDPOINTS.permission.list).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }
}
