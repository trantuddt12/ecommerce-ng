import { Inject, Injectable } from '@angular/core';
import { AppConfig } from '../config/app-config.model';
import { APP_CONFIG } from '../tokens/app-config.token';

@Injectable({ providedIn: 'root' })
export class ApiUrlBuilder {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  build(path: string, source: 'api' | 'search' = 'api'): string {
    const baseUrl = source === 'search' ? this.config.searchApiBaseUrl : this.config.apiBaseUrl;
    return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }
}
