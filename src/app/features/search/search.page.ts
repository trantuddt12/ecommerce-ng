import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ADMIN_NAVIGATION_SECTIONS } from '../../core/layout/admin-navigation.data';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { LanguageService } from '../../core/services/language.service';
import { AuthStore } from '../../core/state/auth.store';
import { hasAnyPermission } from '../../core/utils/permission.util';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatButtonModule, MatCardModule, TranslatePipe],
  template: `
    <section class="admin-search-page">
      <mat-card class="admin-search-hero">
        <mat-card-content>
          <p class="admin-search-eyebrow">Search Service</p>
          <h1>Tìm nhanh chức năng admin</h1>
          <p>
            Tập trung vào điều hướng và tìm kiếm module thay vì để trang search trống.
          </p>
        </mat-card-content>
      </mat-card>

      <mat-card class="admin-search-panel">
        <mat-card-content>
          <div class="admin-search-toolbar">
            <div>
              <h2>Danh sách trang khả dụng</h2>
              <p>Nhập từ khóa để lọc theo tên, mô tả hoặc nhóm chức năng.</p>
            </div>
            <input
              class="admin-search-input"
              [ngModel]="keyword()"
              (ngModelChange)="keyword.set($event)"
              placeholder="users, products, orders..."
            />
          </div>

          @if (filteredItems().length) {
            <div class="admin-search-grid">
              @for (item of filteredItems(); track item.path) {
                <a class="admin-search-card" [routerLink]="item.path">
                  <strong>{{ item.labelKey | appTranslate }}</strong>
                  <span>{{ item.descriptionKey | appTranslate }}</span>
                  <small>{{ item.sectionKey | appTranslate }}</small>
                </a>
              }
            </div>
          } @else {
            <div class="admin-search-empty">Không có module nào khớp từ khóa hiện tại.</div>
          }
        </mat-card-content>
      </mat-card>
    </section>
  `,
  styles: [`
    .admin-search-page {
      display: grid;
      gap: 1.25rem;
    }

    .admin-search-hero,
    .admin-search-panel {
      border-radius: 1.2rem;
    }

    .admin-search-hero {
      color: #fff;
      background: linear-gradient(135deg, #0f172a, #1d4ed8);
    }

    .admin-search-hero .mat-mdc-card-content,
    .admin-search-panel .mat-mdc-card-content {
      display: grid;
      gap: 1rem;
      padding: 1.25rem;
    }

    .admin-search-eyebrow {
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 0.75rem;
      color: rgba(191, 219, 254, 0.95);
    }

    .admin-search-hero h1,
    .admin-search-toolbar h2,
    .admin-search-toolbar p {
      margin: 0;
    }

    .admin-search-toolbar {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: end;
      flex-wrap: wrap;
    }

    .admin-search-input {
      min-height: 48px;
      min-width: min(100%, 320px);
      padding: 0 1rem;
      border-radius: 999px;
      border: 1px solid #cbd5e1;
      font: inherit;
    }

    .admin-search-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }

    .admin-search-card {
      display: grid;
      gap: 0.35rem;
      padding: 1rem;
      border-radius: 1rem;
      border: 1px solid #dbe3f3;
      background: #f8fafc;
      text-decoration: none;
      color: #0f172a;
    }

    .admin-search-card span,
    .admin-search-card small,
    .admin-search-empty {
      color: #475569;
    }
  `],
})
export class SearchPage {
  private readonly authStore = inject(AuthStore);
  private readonly languageService = inject(LanguageService);
  protected readonly keyword = signal('');
  protected readonly filteredItems = computed(() => {
    const keyword = this.keyword().trim().toLowerCase();
    const items = ADMIN_NAVIGATION_SECTIONS
      .flatMap((section) => section.items.map((item) => ({ ...item, sectionKey: section.labelKey })))
      .filter((item) => !item.permissions || hasAnyPermission(this.authStore.permissions(), [...item.permissions]));

    if (!keyword) {
      return items;
    }

    return items.filter((item) => [
      this.languageService.translate(item.labelKey),
      this.languageService.translate(item.descriptionKey),
      this.languageService.translate(item.sectionKey),
      ...item.keywords,
    ].join(' ').toLowerCase().includes(keyword));
  });
}
