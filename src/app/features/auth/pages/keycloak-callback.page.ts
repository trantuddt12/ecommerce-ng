import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { KeycloakAuthService } from '../../../core/services/keycloak-auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PostLoginRouteService } from '../../../core/services/post-login-route.service';

/**
 * Landing route for the Keycloak redirect (`/auth/keycloak/callback`). Swaps the authorization
 * code for tokens, then forwards to wherever the user was heading.
 */
@Component({
  selector: 'app-keycloak-callback-page',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
  template: `
    <section class="keycloak-callback">
      @if (errorMessage()) {
        <mat-card appearance="outlined" class="keycloak-callback__card">
          <mat-card-content class="keycloak-callback__content">
            <mat-icon color="warn" aria-hidden="true">error_outline</mat-icon>
            <h2>Dang nhap Keycloak that bai</h2>
            <p>{{ errorMessage() }}</p>
            <a mat-flat-button color="primary" routerLink="/auth/login">Quay lai trang dang nhap</a>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="keycloak-callback__pending">
          <mat-spinner diameter="48" />
          <p>Dang hoan tat dang nhap Keycloak...</p>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .keycloak-callback {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 320px;
        padding: 24px;
      }

      .keycloak-callback__card {
        max-width: 420px;
      }

      .keycloak-callback__content,
      .keycloak-callback__pending {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        text-align: center;
      }

      .keycloak-callback__content h2 {
        margin: 0;
        font-size: 1.125rem;
      }

      .keycloak-callback__content p,
      .keycloak-callback__pending p {
        margin: 0;
        color: rgba(0, 0, 0, 0.6);
      }
    `,
  ],
})
export class KeycloakCallbackPage implements OnInit {
  readonly errorMessage = signal<string | null>(null);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly keycloakAuthService = inject(KeycloakAuthService);
  private readonly postLoginRouteService = inject(PostLoginRouteService);
  private readonly notificationService = inject(NotificationService);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    // The code verifier lives in sessionStorage, so the exchange can only happen in the browser.
    // On the server this renders the spinner and the client picks it up after hydration.
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const params = this.route.snapshot.queryParamMap;

    const error = params.get('error');
    if (error) {
      this.errorMessage.set(params.get('error_description') ?? error);
      return;
    }

    const code = params.get('code');
    const state = params.get('state');
    if (!code || !state) {
      this.errorMessage.set('Phan hoi tu Keycloak thieu ma uy quyen.');
      return;
    }

    this.keycloakAuthService.completeLogin(code, state).subscribe({
      next: () => {
        this.notificationService.success('Dang nhap Keycloak thanh cong.');
        const returnUrl = this.keycloakAuthService.consumeReturnUrl();
        void this.router.navigateByUrl(returnUrl ?? this.postLoginRouteService.getDefaultRoute());
      },
      error: (exception: unknown) => {
        this.errorMessage.set(
          exception instanceof Error ? exception.message : 'Khong doi duoc ma uy quyen sang token.',
        );
      },
    });
  }
}
