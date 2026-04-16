import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { AuthStore } from '../state/auth.store';

@Injectable({ providedIn: 'root' })
export class SessionService {
  constructor(private readonly authStore: AuthStore) {
    this.restoreAccessToken();
  }

  setAccessToken(token: string): void {
    this.authStore.setAccessToken(token);
    if (this.hasWindow()) {
      window.sessionStorage.setItem(STORAGE_KEYS.accessToken, token);
    }
  }

  getAccessToken(): string | null {
    return this.authStore.accessToken();
  }

  hasSession(): boolean {
    return Boolean(this.getAccessToken());
  }

  clearSession(): void {
    this.authStore.clear();
    if (this.hasWindow()) {
      window.sessionStorage.removeItem(STORAGE_KEYS.accessToken);
    }
  }

  private restoreAccessToken(): void {
    if (!this.hasWindow()) {
      return;
    }

    const token = window.sessionStorage.getItem(STORAGE_KEYS.accessToken);
    if (token) {
      this.authStore.setAccessToken(token);
    }
  }

  private hasWindow(): boolean {
    return typeof window !== 'undefined';
  }
}
