import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppError } from '../models/app-error.model';

@Injectable({ providedIn: 'root' })
export class ErrorMapperService {
  map(error: unknown): AppError {
    if (!(error instanceof HttpErrorResponse)) {
      return {
        type: 'unknown',
        statusCode: 0,
        message: 'Da xay ra loi khong xac dinh.',
        originalError: error,
      };
    }

    if (error.status === 0) {
      return {
        type: 'network',
        statusCode: 0,
        message: 'Khong the ket noi toi may chu.',
        originalError: error,
      };
    }

    const payload = error.error as { error?: string; message?: string } | string | null;
    const message = typeof payload === 'string'
      ? payload
      : payload?.error ?? payload?.message ?? error.message ?? 'Da xay ra loi tu may chu.';

    return {
      type: this.resolveType(error.status),
      statusCode: error.status,
      message,
      originalError: error,
    };
  }

  private resolveType(status: number): AppError['type'] {
    if (status === 400) return 'validation';
    if (status === 401) return 'authentication';
    if (status === 403) return 'authorization';
    if (status === 404) return 'not-found';
    if (status >= 500) return 'server';
    return 'unknown';
  }
}
