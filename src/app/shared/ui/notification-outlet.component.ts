import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification-outlet',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  template: `
    <div class="notification-stack">
      @for (item of notificationService.notifications(); track item.id) {
        <button type="button" mat-raised-button class="notification" [class]="'notification ' + item.level" (click)="notificationService.dismiss(item.id)">
          <span>{{ item.message }}</span>
        </button>
      }
    </div>
  `,
  styles: [`
    .notification-stack {
      position: fixed;
      right: 1.25rem;
      bottom: 1.25rem;
      align-items: end;
      justify-items: end;
      display: grid;
      gap: 0.75rem;
      z-index: 1100;
      pointer-events: none;
    }

    .notification {
      min-width: 18rem;
      max-width: 24rem;
      padding: 0.9rem 1rem;
      color: #fff;
      font: inherit;
      text-align: left;
      cursor: pointer;
      pointer-events: auto;
    }

    .success {
      background: #15803d;
    }

    .error {
      background: #b91c1c;
    }

    .info {
      background: #1d4ed8;
    }

    @media (max-width: 720px) {
      .notification-stack {
        left: 0.75rem;
        right: 0.75rem;
        bottom: 0.75rem;
        justify-items: stretch;
      }

      .notification {
        min-width: 0;
        max-width: none;
        width: 100%;
      }
    }
  `],
})
export class NotificationOutletComponent {
  protected readonly notificationService = inject(NotificationService);
}
