import { Injectable } from '@angular/core';
import { catchError, firstValueFrom, map, of, switchMap } from 'rxjs';
import { AuthStore } from '../state/auth.store';
import { AuthService } from './auth.service';
import { CurrentUserService } from './current-user.service';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class AppInitService {
  constructor(
    private readonly authService: AuthService,
    private readonly currentUserService: CurrentUserService,
    private readonly sessionService: SessionService,
    private readonly authStore: AuthStore,
  ) {}

  async initialize(): Promise<void> {
    if (!this.sessionService.hasSession()) {
      await firstValueFrom(this.tryRefreshObservable());
      return;
    }

    await firstValueFrom(
      this.currentUserService.loadCurrentUser().pipe(
        map(() => void 0),
        catchError(() => this.tryRefreshObservable()),
      ),
    );

    this.authStore.setAuthInitialized(true);
  }

  private tryRefreshObservable() {
    return this.authService.refresh().pipe(
      switchMap(() => this.currentUserService.loadCurrentUser()),
      map(() => void 0),
      catchError(() => {
        this.sessionService.clearSession();
        return of(void 0);
      }),
      tapValue(() => this.authStore.setAuthInitialized(true)),
    );
  }
}

function tapValue<T>(callback: (value: T) => void) {
  return map((value: T) => {
    callback(value);
    return value;
  });
}
