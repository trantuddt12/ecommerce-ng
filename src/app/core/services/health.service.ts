import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { BaseApiService } from '../http/base-api.service';

@Injectable({ providedIn: 'root' })
export class HealthService {
  constructor(private readonly api: BaseApiService) {}

  check() {
    return this.api.get<unknown>(API_ENDPOINTS.health.check);
  }
}
