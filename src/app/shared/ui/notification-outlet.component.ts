import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification-outlet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-stack">
      @for (item of notificationService.notifications(); track item.id) {
        <button type="button" class="notification" [class]="'notification ' + item.level" (click)="notificationService.dismiss(item.id)">
          <span>{{ item.message }}</span>
        </button>
      }
    </div>
  `,
  styles: [`
    .notification-stack {
      position: fixed;
      top: 1rem;
      right: 1rem;
      display: grid;
      gap: 0.75rem;
      z-index: 1100;
    }

    .notification {
      min-width: 18rem;
      max-width: 24rem;
      border: 0;
      border-radius: 0.9rem;
      padding: 0.9rem 1rem;
      color: #fff;
      font: inherit;
      text-align: left;
      cursor: pointer;
      box-shadow: 0 14px 30px rgba(15, 23, 42, 0.2);
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
  `],
})
export class NotificationOutletComponent {
  protected readonly notificationService = inject(NotificationService);
}
