import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, timeout } from 'rxjs';
import { AppConfig } from '../config/app-config.model';
import { APP_CONFIG } from '../tokens/app-config.token';
import { QueryParamValue } from '../utils/query-params.util';
import { ApiUrlBuilder } from './api-url-builder.service';
import { HttpOptionsFactory } from './http-options.factory';

@Injectable({ providedIn: 'root' })
export class BaseApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly apiUrlBuilder: ApiUrlBuilder,
    private readonly httpOptionsFactory: HttpOptionsFactory,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  get<T>(path: string, params?: Record<string, QueryParamValue>, source: 'api' | 'search' = 'api'): Observable<T> {
    return this.http
      .get<T>(this.apiUrlBuilder.build(path, source), this.httpOptionsFactory.create(params))
      .pipe(timeout(this.config.requestTimeoutMs));
  }

  post<T>(
    path: string,
    body: unknown,
    source: 'api' | 'search' = 'api',
    params?: Record<string, QueryParamValue>,
  ): Observable<T> {
    return this.http
      .post<T>(this.apiUrlBuilder.build(path, source), body, this.httpOptionsFactory.create(params))
      .pipe(timeout(this.config.requestTimeoutMs));
  }

  put<T>(path: string, body: unknown, source: 'api' | 'search' = 'api'): Observable<T> {
    return this.http.put<T>(this.apiUrlBuilder.build(path, source), body).pipe(timeout(this.config.requestTimeoutMs));
  }

  patch<T>(path: string, body: unknown, source: 'api' | 'search' = 'api'): Observable<T> {
    return this.http.patch<T>(this.apiUrlBuilder.build(path, source), body).pipe(timeout(this.config.requestTimeoutMs));
  }

  delete<T>(path: string, source: 'api' | 'search' = 'api'): Observable<T> {
    return this.http.delete<T>(this.apiUrlBuilder.build(path, source)).pipe(timeout(this.config.requestTimeoutMs));
  }

  postFormData<T>(path: string, body: FormData, source: 'api' | 'search' = 'api'): Observable<T> {
    return this.http.post<T>(this.apiUrlBuilder.build(path, source), body).pipe(timeout(this.config.requestTimeoutMs));
  }

  postText(
    path: string,
    body: unknown,
    params?: Record<string, QueryParamValue>,
    source: 'api' | 'search' = 'api',
  ): Observable<string> {
    return this.http
      .post(this.apiUrlBuilder.build(path, source), body, {
        ...this.httpOptionsFactory.create(params),
        responseType: 'text',
      })
      .pipe(timeout(this.config.requestTimeoutMs));
  }
}
