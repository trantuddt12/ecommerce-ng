import { Injectable, computed, signal } from '@angular/core';
import { CurrentUser } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  readonly accessToken = signal<string | null>(null);
  readonly currentUser = signal<CurrentUser | null>(null);
  readonly authInitialized = signal(false);
  readonly isRefreshing = signal(false);

  readonly isAuthenticated = computed(() => Boolean(this.accessToken()));
  readonly permissions = computed(() => new Set(this.currentUser()?.permissions ?? []));
  readonly roles = computed(() => this.currentUser()?.roles ?? []);

  setAccessToken(accessToken: string | null): void {
    this.accessToken.set(accessToken);
  }

  setCurrentUser(currentUser: CurrentUser | null): void {
    this.currentUser.set(currentUser);
  }

  setAuthInitialized(value: boolean): void {
    this.authInitialized.set(value);
  }

  setRefreshing(value: boolean): void {
    this.isRefreshing.set(value);
  }

  clear(): void {
    this.accessToken.set(null);
    this.currentUser.set(null);
    this.isRefreshing.set(false);
  }
}
