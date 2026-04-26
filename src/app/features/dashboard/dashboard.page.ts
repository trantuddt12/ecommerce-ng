import { CommonModule } from '@angular/common';
import { Component, Inject, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { APP_ROUTES } from '../../core/constants/app-routes';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { LanguageService } from '../../core/services/language.service';
import { AppConfig } from '../../core/config/app-config.model';
import { ADMIN_NAVIGATION_SECTIONS } from '../../core/layout/admin-navigation.data';
import { AuthStore } from '../../core/state/auth.store';
import { APP_CONFIG } from '../../core/tokens/app-config.token';
import { hasAnyPermission } from '../../core/utils/permission.util';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, TranslatePipe],
  template: `
    <section class="dashboard-page">
      <mat-card class="dashboard-hero">
        <mat-card-content>
          <p class="dashboard-eyebrow">Dashboard</p>
          <h1>{{ config.appName }}</h1>
          <p>
            Trang tổng quan gọn hơn, tập trung vào lối tắt quản trị và những khu vực cần thao tác nhanh.
          </p>

          <div class="dashboard-actions">
            <a mat-flat-button color="primary" [routerLink]="APP_ROUTES.products">Mở products</a>
            <a mat-stroked-button [routerLink]="APP_ROUTES.adminOrders">Xử lý đơn hàng</a>
            <a mat-stroked-button [routerLink]="APP_ROUTES.users">Quản lý users</a>
          </div>
        </mat-card-content>
      </mat-card>

      <section class="dashboard-stats">
        <mat-card class="dashboard-stat-card">
          <mat-card-content>
            <p class="dashboard-stat-label">Tài khoản hiện tại</p>
            <p class="dashboard-stat-value">{{ authStore.currentUser()?.displayName || 'Guest mode' }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="dashboard-stat-card">
          <mat-card-content>
            <p class="dashboard-stat-label">API Backend</p>
            <p class="dashboard-stat-value dashboard-stat-value-small">{{ config.apiBaseUrl }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="dashboard-stat-card">
          <mat-card-content>
            <p class="dashboard-stat-label">Search Service</p>
            <p class="dashboard-stat-value dashboard-stat-value-small">{{ config.searchApiBaseUrl }}</p>
          </mat-card-content>
        </mat-card>
      </section>

      <section class="dashboard-section">
        <div class="dashboard-section-header">
          <div>
            <h2>Nhóm chức năng admin</h2>
            <p>Chọn nhanh khu vực cần làm việc, đã tự lọc theo permission hiện tại.</p>
          </div>
        </div>

        <div class="dashboard-group-grid">
          @for (section of visibleSections(); track section.labelKey) {
            <mat-card class="dashboard-group-card">
              <mat-card-content>
                <h3>{{ section.labelKey | appTranslate }}</h3>
                <p>{{ section.descriptionKey | appTranslate }}</p>

                <div class="dashboard-link-list">
                  @for (item of section.items; track item.path) {
                    <a class="dashboard-link" [routerLink]="item.path">
                      <strong>{{ item.labelKey | appTranslate }}</strong>
                      <span>{{ item.descriptionKey | appTranslate }}</span>
                    </a>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      </section>
    </section>
  `,
  styles: [`
    .dashboard-page {
      display: grid;
      gap: 1.25rem;
    }

    .dashboard-hero {
      border-radius: 1.25rem;
      color: #fff;
      background: linear-gradient(135deg, #0f172a, #1d4ed8);
    }

    .dashboard-hero .mat-mdc-card-content,
    .dashboard-group-card .mat-mdc-card-content,
    .dashboard-stat-card .mat-mdc-card-content {
      display: grid;
      gap: 0.85rem;
      padding: 1.25rem;
    }

    .dashboard-eyebrow,
    .dashboard-stat-label {
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.75rem;
    }

    .dashboard-eyebrow {
      color: rgba(191, 219, 254, 0.95);
    }

    .dashboard-hero h1,
    .dashboard-section-header h2,
    .dashboard-group-card h3 {
      margin: 0;
    }

    .dashboard-hero p,
    .dashboard-section-header p,
    .dashboard-group-card p {
      margin: 0;
    }

    .dashboard-actions,
    .dashboard-link-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .dashboard-stats,
    .dashboard-group-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }

    .dashboard-stat-card,
    .dashboard-group-card {
      border-radius: 1.1rem;
      border: 1px solid rgba(148, 163, 184, 0.18);
      background: #fff;
    }

    .dashboard-stat-value {
      margin: 0;
      color: #0f172a;
      font-size: 1.1rem;
      font-weight: 700;
    }

    .dashboard-stat-value-small {
      font-size: 0.95rem;
      line-height: 1.5;
      word-break: break-word;
    }

    .dashboard-section {
      display: grid;
      gap: 1rem;
    }

    .dashboard-link {
      display: grid;
      gap: 0.25rem;
      flex: 1 1 220px;
      padding: 0.9rem 1rem;
      border-radius: 1rem;
      border: 1px solid #dbe3f3;
      text-decoration: none;
      color: #0f172a;
      background: #f8fafc;
    }

    .dashboard-link span {
      color: #475569;
      font-size: 0.92rem;
    }
  `],
})
export class DashboardPage {
  protected readonly APP_ROUTES = APP_ROUTES;
  protected readonly authStore = inject(AuthStore);
  private readonly languageService = inject(LanguageService);
  protected readonly visibleSections = computed(() => ADMIN_NAVIGATION_SECTIONS
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.permissions || hasAnyPermission(this.authStore.permissions(), [...item.permissions])),
    }))
    .filter((section) => section.items.length > 0));

  constructor(@Inject(APP_CONFIG) protected readonly config: AppConfig) {}
}
