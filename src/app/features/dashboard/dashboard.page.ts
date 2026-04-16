import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { AppConfig } from '../../core/config/app-config.model';
import { AuthStore } from '../../core/state/auth.store';
import { APP_CONFIG } from '../../core/tokens/app-config.token';
import { FeatureShellComponent } from '../../shared/ui/feature-shell.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FeatureShellComponent],
  template: `
    <app-feature-shell
      eyebrow="Dashboard"
      [title]="config.appName"
      description="Trang tong quan he thong. Neu tai khoan khong co permission business ro rang, day se la landing page mac dinh sau login."
      [highlights]="highlights"
    />
  `,
})
export class DashboardPage {
  protected readonly highlights = [
    { label: 'API Backend', value: this.config.apiBaseUrl },
    { label: 'Search Service', value: this.config.searchApiBaseUrl },
    { label: 'Current User', value: this.authStore.currentUser()?.displayName || 'Guest mode' },
  ];

  constructor(
    @Inject(APP_CONFIG) protected readonly config: AppConfig,
    protected readonly authStore: AuthStore,
  ) {}
}
