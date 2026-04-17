import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiEnvelope, CreateUserRequest, UpdateUserRequest, UserResponse, unwrapApiEnvelope } from '../models/auth.models';
import { BaseApiService } from '../http/base-api.service';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly baseApi = inject(BaseApiService);

  list(): Observable<UserResponse[]> {
    return this.baseApi.get<UserResponse[] | ApiEnvelope<UserResponse[]>>(API_ENDPOINTS.user.list).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  create(request: CreateUserRequest): Observable<UserResponse> {
    return this.baseApi.post<UserResponse | ApiEnvelope<UserResponse>>(API_ENDPOINTS.user.create, request).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  update(request: UpdateUserRequest): Observable<UserResponse> {
    return this.baseApi.post<UserResponse | ApiEnvelope<UserResponse>>(API_ENDPOINTS.user.update, request).pipe(
      map((response) => unwrapApiEnvelope(response)),
    );
  }

  delete(id: number): Observable<string> {
    return this.baseApi.delete<string>(API_ENDPOINTS.user.delete(id));
  }
}
