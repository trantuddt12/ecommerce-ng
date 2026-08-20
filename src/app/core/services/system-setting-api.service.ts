import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { BaseApiService } from '../http/base-api.service';
import { ApiEnvelope, unwrapApiEnvelope } from '../models/auth.models';
import { SystemSettingResponse } from '../models/system-setting.models';

/**
 * Admin API for the runtime flags in `system_settings`. Both endpoints require the
 * SYSTEM_CONFIG permission, so a 403 here means the route guard let through a user the
 * backend does not trust — worth surfacing rather than swallowing.
 */
@Injectable({ providedIn: 'root' })
export class SystemSettingApiService {
  private readonly baseApi = inject(BaseApiService);

  list(): Observable<SystemSettingResponse[]> {
    return this.baseApi
      .get<SystemSettingResponse[] | ApiEnvelope<SystemSettingResponse[]>>(API_ENDPOINTS.systemSetting.list)
      .pipe(map((response) => unwrapApiEnvelope(response)));
  }

  update(key: string, value: boolean): Observable<SystemSettingResponse> {
    return this.baseApi
      .put<SystemSettingResponse | ApiEnvelope<SystemSettingResponse>>(API_ENDPOINTS.systemSetting.update(key), { value })
      .pipe(map((response) => unwrapApiEnvelope(response)));
  }
}
