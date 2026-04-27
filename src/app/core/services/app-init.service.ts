import { DestroyRef, Injectable, inject } from '@angular/core';
import { catchError, firstValueFrom, map, of, switchMap, tap } from 'rxjs';
import { AuthStore } from '../state/auth.store';
import { AuthService } from './auth.service';
import { CurrentUserService } from './current-user.service';
import { ReferenceDataService } from './reference-data.service';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class AppInitService {
  private readonly authService = inject(AuthService);
  private readonly currentUserService = inject(CurrentUserService);
  private readonly sessionService = inject(SessionService);
  private readonly authStore = inject(AuthStore);
  private readonly refData = inject(ReferenceDataService);

  async initialize(): Promise<void> {
    if (!this.sessionService.hasSession()) {
      await firstValueFrom(this.tryRefreshAndLoadRefData());
      return;
    }

    await firstValueFrom(
      this.currentUserService.loadCurrentUser().pipe(
        map(() => void 0),
        catchError(() => this.tryRefreshAndLoadRefData()),
        tap(() => {
          this.refData.load();
          this.authStore.setAuthInitialized(true);
        }),
      ),
    );
  }

  private tryRefreshAndLoadRefData() {
    return this.authService.refresh().pipe(
      switchMap(() => this.currentUserService.loadCurrentUser()),
      map(() => void 0),
      catchError(() => {
        this.sessionService.clearSession();
        return of(void 0);
      }),
      tap(() => {
        this.refData.load();
        this.authStore.setAuthInitialized(true);
      }),
    );
  }
}
