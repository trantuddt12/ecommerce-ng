import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ADMIN_NAVIGATION_SECTIONS } from './admin-navigation.data';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';
import { TranslatePipe } from '../i18n/translate.pipe';
import { LanguageService } from '../services/language.service';
import { AuthStore } from '../state/auth.store';
import { hasAnyPermission } from '../utils/permission.util';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatFormFieldModule,
    MatInputModule,
    HeaderComponent,
    SidebarComponent,
    TranslatePipe,
  ],
  template: `
    <section class="shell">
      <app-header [sidebarOpen]="isSidebarOpen()" (menuToggle)="toggleSidebar()"></app-header>

      <div class="shell-body">
        <button
          type="button"
          class="sidebar-backdrop"
          [class.visible]="isSidebarOpen()"
          (click)="closeSidebar()"
          [attr.aria-label]="'common.closeNavigation' | appTranslate"
        ></button>

        <app-sidebar [isOpen]="isSidebarOpen()" (navigate)="closeSidebar()"></app-sidebar>

        <main class="shell-content" (click)="closeSidebar()">
          <div class="shell-content-inner">
            <section class="admin-command-panel">
              <div>
                <p class="admin-command-eyebrow">{{ 'admin.workspace' | appTranslate }}</p>
                <h2>{{ 'admin.quickTitle' | appTranslate }}</h2>
                <p>
                  {{ 'admin.quickDescription' | appTranslate }}
                </p>
              </div>

              <div class="admin-command-actions">
                <mat-form-field appearance="outline" class="admin-command-search">
                  <mat-label>{{ 'admin.searchLabel' | appTranslate }}</mat-label>
                  <input
                    matInput
                    [ngModel]="navigationKeyword()"
                    (ngModelChange)="navigationKeyword.set($event)"
                    [placeholder]="'admin.searchPlaceholder' | appTranslate"
                  />
                </mat-form-field>
                <a class="admin-home-link" [routerLink]="'/home'">{{ 'common.home' | appTranslate }}</a>
              </div>

              @if (filteredQuickLinks().length) {
                <div class="admin-quick-links">
                  @for (item of filteredQuickLinks(); track item.path) {
                    <a class="admin-quick-link" [routerLink]="item.path" routerLinkActive="active">
                      <strong>{{ item.labelKey | appTranslate }}</strong>
                      <span>{{ item.descriptionKey | appTranslate }}</span>
                    </a>
                  }
                </div>
              } @else {
                <div class="admin-empty-state">{{ 'admin.empty' | appTranslate }}</div>
              }
            </section>

            <router-outlet></router-outlet>
          </div>

          <footer class="shell-footer">
            <span>{{ 'admin.footerTitle' | appTranslate }}</span>
            <span>{{ 'admin.footerDescription' | appTranslate }}</span>
          </footer>
        </main>
      </div>
    </section>
  `,
  styles: [`
    .shell {
      min-height: 100vh;
      background:
        radial-gradient(circle at top left, rgba(37, 99, 235, 0.1), transparent 30rem),
        linear-gradient(180deg, #ffffff 0%, #f6f7fb 100%);
    }

    .shell-body {
      display: grid;
      grid-template-columns: 16rem minmax(0, 1fr);
      gap: 1rem;
      width: min(1440px, 100%);
      margin: 0 auto;
      padding: 1rem;
      position: relative;
      align-items: start;
    }

    .shell-content {
      min-height: calc(100vh - 5.5rem);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .shell-content-inner {
      flex: 1;
      min-width: 0;
      background: rgba(255, 255, 255, 0.86);
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 1.5rem;
      padding: clamp(1rem, 2vw, 1.5rem);
      box-shadow: 0 14px 36px rgba(15, 23, 42, 0.06);
      backdrop-filter: blur(14px);
      display: grid;
      gap: 1.25rem;
    }

    .admin-command-panel {
      display: grid;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid rgba(148, 163, 184, 0.16);
      border-radius: 1.25rem;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(37, 99, 235, 0.92));
      color: #fff;
    }

    .admin-command-eyebrow {
      margin: 0 0 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 0.72rem;
      color: rgba(191, 219, 254, 0.95);
    }

    .admin-command-panel h2,
    .admin-command-panel p {
      margin: 0;
    }

    .admin-command-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .admin-command-search {
      flex: 1 1 320px;
    }

    .admin-home-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      padding: 0 1rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #fff;
      text-decoration: none;
      white-space: nowrap;
    }

    .admin-quick-links {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 0.75rem;
    }

    .admin-quick-link {
      display: grid;
      gap: 0.35rem;
      padding: 0.9rem 1rem;
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #fff;
      text-decoration: none;
      transition: 0.18s ease;
    }

    .admin-quick-link.active,
    .admin-quick-link:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }

    .admin-quick-link span,
    .admin-empty-state {
      color: rgba(226, 232, 240, 0.94);
      font-size: 0.92rem;
    }

    .shell-footer {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 0 0.25rem 0.25rem;
      color: #64748b;
      font-size: 0.875rem;
      flex-wrap: wrap;
    }

    .sidebar-backdrop {
      display: none;
    }

    @media (max-width: 960px) {
      .shell-body {
        grid-template-columns: 1fr;
        padding: 0.75rem;
      }

      .shell-content {
        min-height: calc(100vh - 6rem);
      }

      .shell-content-inner {
        border-radius: 1.25rem;
        padding: 1rem;
      }

      .sidebar-backdrop.visible {
        display: block;
        position: fixed;
        inset: 0;
        border: 0;
        background: rgba(15, 23, 42, 0.32);
        z-index: 25;
      }
    }

    @media (max-width: 720px) {
      .shell-body {
        padding: 0.5rem;
      }

      .shell-content-inner {
        border-radius: 1rem;
        padding: 0.875rem;
      }

      .shell-footer {
        font-size: 0.8125rem;
      }
    }
  `],
})
export class MainLayoutComponent {
  protected readonly isSidebarOpen = signal(false);
  protected readonly navigationKeyword = signal('');
  private readonly authStore = inject(AuthStore);
  private readonly languageService = inject(LanguageService);

  protected readonly filteredQuickLinks = computed(() => {
    const keyword = this.navigationKeyword().trim().toLowerCase();
    const visibleItems = ADMIN_NAVIGATION_SECTIONS
      .flatMap((section) => section.items)
      .filter((item) => !item.permissions || hasAnyPermission(this.authStore.permissions(), [...item.permissions]));

    if (!keyword) {
      return visibleItems;
    }

    return visibleItems.filter((item) => {
      const searchable = [
        this.languageService.translate(item.labelKey),
        this.languageService.translate(item.descriptionKey),
        ...item.keywords,
      ].join(' ').toLowerCase();
      return searchable.includes(keyword);
    });
  });

  protected toggleSidebar(): void {
    this.isSidebarOpen.update((value) => !value);
  }

  protected closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }
}
