import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppError } from '../models/app-error.model';

interface BackendErrorPayload {
  error?: string;
  message?: string;
  errorCode?: string;
}

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

    const payload = error.error as BackendErrorPayload | string | null;
    const message = typeof payload === 'string'
      ? payload
      : this.resolveMessage(error.status, payload) ?? payload?.error ?? payload?.message ?? error.message ?? 'Da xay ra loi tu may chu.';

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

  private resolveMessage(status: number, payload: BackendErrorPayload | null): string | null {
    const errorCode = payload?.errorCode;

    if (status !== 401 || !errorCode) {
      return null;
    }

    if (errorCode === 'E103') {
      return payload?.error ?? 'Tai khoan da bi khoa.';
    }

    if (errorCode === 'E104') {
      return payload?.error ?? 'Tai khoan khong con hoat dong.';
    }

    if (errorCode === 'E106') {
      return 'Phien dang nhap da het hieu luc. Vui long dang nhap lai.';
    }

    return null;
  }
}
