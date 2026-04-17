import { Injectable } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { BaseApiService } from '../http/base-api.service';
import { BackendPermission, BackendUser, CurrentUser } from '../models/user.models';
import { AuthStore } from '../state/auth.store';
import { SessionService } from './session.service';

interface JwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  username?: string;
  preferred_username?: string;
  authorities?: string[] | string;
  permissions?: string[] | string;
  roles?: string[] | string;
  scope?: string;
}

interface ApiEnvelope<T> {
  data: T;
}

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  constructor(
    private readonly api: BaseApiService,
    private readonly authStore: AuthStore,
    private readonly sessionService: SessionService,
  ) {}

  loadCurrentUser() {
  return this.api.get<BackendUser | ApiEnvelope<BackendUser>>(API_ENDPOINTS.auth.me).pipe(

    tap(res => {
      console.log('API raw:', res);
    }),

    map((response) => {
      return this.unwrapUserResponse(response);
    }),

    map((response) => {
      return this.mapCurrentUser(response);
    }),

    catchError((err) => {
      return of(this.mapCurrentUserFromToken(this.sessionService.getAccessToken()));
    }),

    tap((user) => {
      this.authStore.setCurrentUser(user);
    }),
  );
}

  setCurrentUserFromToken(token: string | null): void {
    this.authStore.setCurrentUser(this.mapCurrentUserFromToken(token));
  }

  private mapCurrentUser(user: BackendUser): CurrentUser {
    const derivedDisplayName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    const fallbackDisplayName = derivedDisplayName || user.username || user.email || 'User';
    const roles = (user.roles ?? [])
      .map((role) => (typeof role === 'string' ? role : role.roleName ?? role.name ?? ''))
      .filter(Boolean);

    const permissions = new Set<string>([
      ...this.mapPermissionValues(user.permissions),
      ...this.mapPermissionValues(user.authorities),
      ...(user.roles ?? []).flatMap((role) =>
        typeof role === 'string'
          ? []
          : [...this.mapPermissionValues(role.permissions), ...this.mapPermissionValues(role.authorities)],
      ),
    ]);

    return {
      id: String(user.id ?? ''),
      username: user.username ?? '',
      email: user.email ?? '',
      displayName: user.fullName ?? fallbackDisplayName,
      roles,
      permissions: [...permissions],
    };
  }

  private unwrapUserResponse(response: BackendUser | ApiEnvelope<BackendUser>): BackendUser {
    if (this.isApiEnvelope(response)) {
      return response.data;
    }

    return response;
  }

  private mapCurrentUserFromToken(token: string | null): CurrentUser | null {
    const payload = this.parseJwtPayload(token);

    if (!payload) {
      return null;
    }

    const username = payload.preferred_username ?? payload.username ?? payload.sub ?? '';
    const email = payload.email ?? '';
    const roleClaims = this.toStringArray(payload.roles);
    const fallbackDisplayName = username || email || 'User';
    const permissionClaims = [
      ...this.toStringArray(payload.permissions),
      ...this.toStringArray(payload.authorities),
      ...this.toStringArray(payload.scope),
    ];

    return {
      id: username || email || 'current-user',
      username,
      email,
      displayName: payload.name ?? fallbackDisplayName,
      roles: roleClaims,
      permissions: permissionClaims,
    };
  }

  private parseJwtPayload(token: string | null): JwtPayload | null {
    if (!token) {
      return null;
    }

    try {
      const [, payload] = token.split('.');
      if (!payload) {
        return null;
      }

      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = typeof atob === 'function' ? atob(normalized) : Buffer.from(normalized, 'base64').toString('binary');
      return JSON.parse(decoded) as JwtPayload;
    } catch {
      return null;
    }
  }

  private toStringArray(value: string[] | string | undefined): string[] {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.filter(Boolean);
    }

    return value.split(' ').map((item) => item.trim()).filter(Boolean);
  }

  private mapPermissionValues(values?: Array<string | BackendPermission>): string[] {
    if (!values?.length) {
      return [];
    }

    return values
      .map((value) => (typeof value === 'string' ? value : value.name ?? ''))
      .filter(Boolean);
  }

  private isApiEnvelope(response: BackendUser | ApiEnvelope<BackendUser>): response is ApiEnvelope<BackendUser> {
    return Boolean(response && typeof response === 'object' && 'data' in response);
  }
}
