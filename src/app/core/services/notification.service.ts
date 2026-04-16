import { Injectable, signal } from '@angular/core';

export interface NotificationItem {
  id: number;
  level: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notifications = signal<NotificationItem[]>([]);

  success(message: string): void {
    this.push('success', message);
  }

  error(message: string): void {
    this.push('error', message);
  }

  info(message: string): void {
    this.push('info', message);
  }

  dismiss(id: number): void {
    this.notifications.update((items) => items.filter((item) => item.id !== id));
  }

  private push(level: NotificationItem['level'], message: string): void {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    this.notifications.update((items) => [...items, { id, level, message }]);

    if (typeof window !== 'undefined') {
      window.setTimeout(() => this.dismiss(id), 4000);
    }
  }
}
