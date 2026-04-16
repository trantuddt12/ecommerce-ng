import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { QueryParamValue, buildQueryParams } from '../utils/query-params.util';

@Injectable({ providedIn: 'root' })
export class HttpOptionsFactory {
  create(params?: Record<string, QueryParamValue>) {
    return {
      params: new HttpParams({ fromObject: buildQueryParams(params ?? {}) }),
    };
  }
}
